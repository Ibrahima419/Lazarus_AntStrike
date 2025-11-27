/**
 * 🔐 Authentication Service
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import { prisma } from '../config/database';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/permissions';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface RegisterData {
  tenantName: string;
  email: string;
  name: string;
  password: string;
}

export class AuthService {
  /**
   * Get permissions for a role
   */
  static getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Générer tokens JWT
   */
  static generateTokens(userId: string, tenantId: string, role: string, email: string): AuthTokens {
    const payload = {
      userId,
      tenantId,
      email,
      role,
      permissions: this.getPermissionsForRole(role as any)
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    } as jwt.SignOptions);

    return { accessToken, refreshToken, user: payload };
  }

  /**
   * Vérifier access token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Token invalide ou expiré');
    }
  }

  /**
   * Vérifier refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Refresh token invalide');
    }
  }

  /**
   * Register nouveau tenant + admin user
   */
  static async register(data: RegisterData): Promise<AuthTokens> {
    const { tenantName, email, name, password } = data;

    try {
      // 1. Créer organisation dans Taranis
      const taranisOrg = await this.createTaranisOrganization(tenantName);
      logger.info(`Organisation Taranis créée: ${taranisOrg.id}`);

      // 2. Créer user dans Taranis
      const taranisUser = await this.createTaranisUser({
        name,
        username: email,
        password,
        organizationId: taranisOrg.id
      });
      logger.info(`User Taranis créé: ${taranisUser.id}`);

      // 3. Créer tenant dans notre DB
      // Générer domaine unique
      const domain = `${tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.antstrike.local`;
      const apiKey = `antstrike-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          domain,
          apiKey,
          plan: 'enterprise',
          isActive: true
        }
      });

      // 4. Hasher password et créer user admin
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          role: 'admin',
          password: hashedPassword
        }
      });

      // 5. Générer tokens
      const tokens = this.generateTokens(user.id, tenant.id, user.role, user.email);

      return {
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: this.getPermissionsForRole(user.role as any),
          tenant: {
            id: tenant.id,
            name: tenant.name,
            plan: tenant.plan,
            isActive: tenant.isActive
          }
        }
      };
    } catch (error: any) {
      logger.error('Erreur registration:', error.message);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Créer organisation dans Taranis
   */
  private static async createTaranisOrganization(name: string): Promise<{ id: number; name: string }> {
    try {
      const taranisApiUrl = process.env.TARANIS_API_URL || 'http://localhost:8080';
      
      // Récupérer token admin Taranis (à configurer dans .env)
      const adminToken = await this.getTaranisAdminToken();

      const response = await axios.post(
        `${taranisApiUrl}/api/v1/organizations`,
        {
          name,
          description: `Organisation CTI pour ${name}`
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        id: response.data.id,
        name: response.data.name
      };
    } catch (error: any) {
      logger.error('Erreur création organisation Taranis:', error.message);
      
      // En dev, retourner mock si Taranis pas disponible
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Taranis non disponible, utilisation mock org ID');
        return {
          id: Math.floor(Math.random() * 10000),
          name
        };
      }
      
      throw new Error('Impossible de créer organisation Taranis');
    }
  }

  /**
   * Créer user dans Taranis
   */
  private static async createTaranisUser(data: {
    name: string;
    username: string;
    password: string;
    organizationId: number;
  }): Promise<{ id: number; username: string }> {
    try {
      const taranisApiUrl = process.env.TARANIS_API_URL || 'http://localhost:8080';
      const adminToken = await this.getTaranisAdminToken();

      const response = await axios.post(
        `${taranisApiUrl}/api/v1/users`,
        {
          name: data.name,
          username: data.username,
          password: data.password,
          organization_id: data.organizationId,
          permissions: ['view', 'create', 'update']
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        id: response.data.id,
        username: response.data.username
      };
    } catch (error: any) {
      logger.error('Erreur création user Taranis:', error.message);
      
      // En dev, retourner mock si Taranis pas disponible
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Taranis non disponible, utilisation mock user ID');
        return {
          id: Math.floor(Math.random() * 10000),
          username: data.username
        };
      }
      
      throw new Error('Impossible de créer user Taranis');
    }
  }

  /**
   * Récupérer token admin Taranis
   */
  private static async getTaranisAdminToken(): Promise<string> {
    // Si token fourni dans .env, l'utiliser
    const envToken = process.env.TARANIS_ADMIN_TOKEN;
    if (envToken) {
      return envToken;
    }

    // Sinon, login avec credentials admin
    const taranisApiUrl = process.env.TARANIS_API_URL || 'http://localhost:8080';
    const adminUser = process.env.TARANIS_ADMIN_USER || 'admin';
    const adminPass = process.env.TARANIS_ADMIN_PASS || 'admin';

    try {
      const response = await axios.post(
        `${taranisApiUrl}/api/v1/auth/login`,
        {
          username: adminUser,
          password: adminPass
        },
        { timeout: 5000 }
      );

      return response.data.access_token || response.data.token;
    } catch (error: any) {
      logger.error('Erreur récupération token admin Taranis:', error.message);
      throw new Error('Impossible de récupérer token admin Taranis');
    }
  }

  /**
   * Login
   */
  static async login(email: string, password: string): Promise<AuthTokens> {
    // Trouver user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Vérifier password directement avec bcrypt (Taranis optionnel)
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Update last login (utiliser updatedAt comme lastLoginAt)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Générer tokens
    const tokens = this.generateTokens(user.id, user.tenantId, user.role, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: this.getPermissionsForRole(user.role as any),
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          plan: user.tenant.plan,
          isActive: user.tenant.isActive
        }
      }
    };
  }

  /**
   * Vérifier authentification via Taranis AI
   */
  private static async verifyTaranisAuth(email: string, password: string): Promise<boolean> {
    try {
      const taranisApiUrl = process.env.TARANIS_API_URL || 'http://localhost:8080';

      // Appeler endpoint login Taranis
      const response = await axios.post(`${taranisApiUrl}/api/v1/auth/login`, {
        username: email,
        password: password
      }, {
        timeout: 5000,
        validateStatus: (status: number) => status < 500
      });

      // Si 200, credentials valides
      return response.status === 200;
    } catch (error: any) {
      logger.error('Erreur vérification Taranis auth:', error.message);
      
      // En dev, accepter si Taranis pas disponible
      if (process.env.NODE_ENV === 'development' && error.code === 'ECONNREFUSED') {
        logger.warn('⚠️ Taranis non disponible en dev, auth bypass activé');
        return true; // Bypass en dev seulement
      }
      
      return false;
    }
  }

  /**
   * Refresh tokens
   */
  static async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);

    // Vérifier user existe toujours
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Générer nouveaux tokens
    const tokens = this.generateTokens(user.id, user.tenantId, user.role, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: this.getPermissionsForRole(user.role as any),
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          plan: user.tenant.plan,
          isActive: user.tenant.isActive
        }
      }
    };
  }

  /**
   * Get user info
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: this.getPermissionsForRole(user.role as any),
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        domain: user.tenant.domain,
        plan: user.tenant.plan,
        isActive: user.tenant.isActive
      }
    };
  }
}



