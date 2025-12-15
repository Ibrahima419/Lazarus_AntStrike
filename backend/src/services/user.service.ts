/**
 * 👤 User Service
 * Manages user lifecycle including synchronization with Taranis CTI
 */

import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { TaranisService } from './taranis.service';
import { logger } from '../utils/logger';
import { UserRole } from '../types/permissions';
import { NotFoundError, BadRequestError } from '../utils/errors';

interface CreateUserData {
    tenantId: string;
    email: string;
    name: string;
    role: UserRole;
    password?: string;
}

export class UserService {
    /**
     * Create a new user (Analyst or Admin)
     * This creates the user in local DB AND in Taranis CTI
     */
    static async createUser(data: CreateUserData) {
        const { tenantId, email, name, role } = data;
        const password = data.password || Math.random().toString(36).slice(-8); // Generate random password if not provided

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new BadRequestError('User with this email already exists');
        }

        // 2. Get Tenant to match/find Taranis Organization
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }

        try {
            // 3. Create User in Taranis
            // We need to find the Taranis Organization ID corresponding to this Tenant
            // Assuming Tenant Name = Taranis Org Name as per registration flow
            let taranisOrgId: number | undefined;

            try {
                const orgs = await TaranisService.getOrganizations({ search: tenant.name });
                // Assuming response has items array or is the array
                const orgList = orgs.items || orgs;
                const matchingOrg = orgList.find((o: any) => o.name === tenant.name);

                if (matchingOrg) {
                    taranisOrgId = matchingOrg.id;
                } else {
                    // Fallback: Create Org if missing? Or just log warning.
                    // For now, let's try to create it if missing, or default to a safe ID if dev
                    logger.warn(`Taranis Organization not found for tenant ${tenant.name}`);
                }
            } catch (err) {
                logger.error('Failed to search Taranis organizations', err);
            }

            // If we found an org ID, create the user in Taranis
            if (taranisOrgId) {
                try {
                    // Map local roles to Taranis roles (IDs)
                    // This is tricky without knowing Taranis Role IDs.
                    // For now, we will assign a default role or specific ID if known.
                    // Let's assume Role 2 is "Analyst" and Role 1 is "Admin" based on common patterns, 
                    // or we could fetch roles.
                    // TaranisService.getRoles() could help.
                    // For safety, let's fetch roles first.
                    const taranisRoles = await TaranisService.getRoles();
                    const rolesList = taranisRoles.items || taranisRoles; // Handle paginated response

                    // Simple mapping logic
                    const targetRoleName = role === UserRole.ADMIN ? 'Admin' : 'Analyst';
                    const taranisRole = rolesList.find((r: any) => r.name.toLowerCase() === targetRoleName.toLowerCase());
                    const taranisRoleIds = taranisRole ? [taranisRole.id] : [];

                    await TaranisService.createUser({
                        name,
                        username: email,
                        password,
                        organization_id: taranisOrgId,
                        roles: taranisRoleIds
                    });
                    logger.info(`User ${email} created in Taranis`);
                } catch (taranisErr) {
                    // Don't block local creation if Taranis fails, but log it
                    logger.error(`Failed to create user in Taranis: ${taranisErr}`);
                }
            }

            // 4. Create User in Local DB (Prisma)
            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = await prisma.user.create({
                data: {
                    tenantId,
                    email,
                    name,
                    role,
                    password: hashedPassword,
                    isActive: true
                }
            });

            return {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                },
                temporaryPassword: password // Return this so Admin can share it
            };

        } catch (error: any) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Get all users for a tenant
     */
    static async getUsers(tenantId: string) {
        return prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true // Use updatedAt as proxy for last login if needed, or just omit
            }
        });
    }

    /**
     * Delete a user
     */
    static async deleteUser(userId: string, tenantId: string) {
        // Prevent deleting self? Controller should handle or here.

        // 1. Delete from Taranis (Best effort)
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.email) {
                // We need Taranis User ID. We can search by username (email)
                const taranisUsers = await TaranisService.getUsers({ search: user.email });
                const taranisUserList = taranisUsers.items || taranisUsers;
                const taranisUser = taranisUserList.find((u: any) => u.username === user.email);

                if (taranisUser) {
                    await TaranisService.deleteUser(taranisUser.id);
                    logger.info(`User ${user.email} deleted from Taranis`);
                }
            }
        } catch (err) {
            logger.warn('Failed to delete user from Taranis', err);
        }

        // 2. Delete from Local DB
        return prisma.user.deleteMany({
            where: {
                id: userId,
                tenantId // Security: Ensure deleting user matches tenant
            }
        });
    }
}
