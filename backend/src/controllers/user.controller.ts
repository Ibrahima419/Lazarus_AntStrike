/**
 * 👤 User Controller
 * Handles user management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserRole } from '../types/permissions';
import { logger } from '../utils/logger';

export class UserController {
    /**
     * Create a new user (Analyst/Admin)
     */
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, name, role } = req.body;
            const tenantId = (req as any).user?.tenantId;

            if (!tenantId) {
                return res.status(400).json({ message: 'Tenant ID missing from context' });
            }

            // Validate role
            if (!Object.values(UserRole).includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            const result = await UserService.createUser({
                tenantId,
                email,
                name,
                role,
                password: req.body.password // Optional, auto-generated if missing
            });

            // Log the action?
            logger.info(`User created: ${email} by ${(req as any).user?.email}`);

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users
     */
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = (req as any).user?.tenantId;
            const users = await UserService.getUsers(tenantId);
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tenantId = (req as any).user?.tenantId;

            await UserService.deleteUser(id, tenantId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
