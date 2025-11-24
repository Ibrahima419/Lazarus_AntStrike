/**
 * 🛡️ RBAC Middleware
 * Role-Based Access Control middleware for AntStrike CTI
 */

import { Request, Response, NextFunction } from 'express';
import { Permission, UserRole, ROLE_PERMISSIONS, PermissionCheck } from '../types/permissions';
import { ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        tenantId: string;
        email: string;
        role: string;
        permissions?: Permission[];
      };
    }
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(requiredPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Check if user has the required permission
      const userPermissions = (user as any).permissions || [];
      if (!userPermissions.includes(requiredPermission)) {
        logger.warn('Permission denied', {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
          requiredPermission,
          userPermissions
        });

        throw new ForbiddenError(`Permission denied: ${requiredPermission}`);
      }

      logger.debug('Permission granted', {
        userId: user.userId,
        permission: requiredPermission
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Check if user has at least one of the required permissions
      const userPermissions = (user as any).permissions || [];
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn('Permission denied (any)', {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
          requiredPermissions,
          userPermissions
        });

        throw new ForbiddenError(`Permission denied: one of [${requiredPermissions.join(', ')}]`);
      }

      logger.debug('Permission granted (any)', {
        userId: user.userId,
        permissions: requiredPermissions
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user has all of the required permissions
 */
export function hasAllPermissions(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Check if user has all required permissions
      const userPermissions = (user as any).permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn('Permission denied (all)', {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
          requiredPermissions,
          userPermissions
        });

        throw new ForbiddenError(`Permission denied: all of [${requiredPermissions.join(', ')}]`);
      }

      logger.debug('Permission granted (all)', {
        userId: user.userId,
        permissions: requiredPermissions
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    if (user.role !== UserRole.ADMIN) {
      logger.warn('Admin access denied', {
        userId: user.userId,
        tenantId: user.tenantId,
        role: user.role
      });

      throw new ForbiddenError('Admin access required');
    }

    logger.debug('Admin access granted', {
      userId: user.userId
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Check if user is analyst or admin
 */
export function requireAnalystOrAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.ANALYST) {
      logger.warn('Analyst/Admin access denied', {
        userId: user.userId,
        tenantId: user.tenantId,
        role: user.role
      });

      throw new ForbiddenError('Analyst or Admin access required');
    }

    logger.debug('Analyst/Admin access granted', {
      userId: user.userId,
      role: user.role
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Check tenant isolation (ensure user can only access their tenant's data)
 */
export function checkTenantIsolation(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    // If tenantId is specified in request, ensure it matches user's tenant
    if (tenantId && tenantId !== user.tenantId) {
      logger.warn('Tenant isolation violation', {
        userId: user.userId,
        userTenantId: user.tenantId,
        requestedTenantId: tenantId
      });

      throw new ForbiddenError('Access denied: tenant isolation violation');
    }

    // Set tenantId in request for downstream processing
    req.user!.tenantId = user.tenantId;

    logger.debug('Tenant isolation check passed', {
      userId: user.userId,
      tenantId: user.tenantId
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Enhanced authentication middleware that includes permissions
 */
export function authenticateWithPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    // This assumes the JWT auth middleware has already run
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    // Get permissions for user's role
    const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];

    // Attach permissions to user object
    (req.user as any) = {
      ...user,
      permissions
    };

    logger.debug('Authentication with permissions successful', {
      userId: user.userId,
      role: user.role,
      permissionsCount: permissions.length
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Utility function to check permissions programmatically
 */
export function checkUserPermission(user: Express.Request['user'], permission: Permission): boolean {
  if (!user) {
    return false;
  }

  const userPermissions = (user as any).permissions || [];
  return userPermissions.includes(permission);
}

/**
 * Utility function to check if user has role
 */
export function checkUserRole(user: Express.Request['user'], role: UserRole): boolean {
  if (!user) {
    return false;
  }

  return user.role === role;
}

/**
 * Utility function to get user permissions
 */
export function getUserPermissions(user: Express.Request['user']): Permission[] {
  if (!user) {
    return [];
  }

  return (user as any).permissions || [];
}

/**
 * Type guard to check if user has permissions attached
 */
export function hasPermissions(user: Express.Request['user']): user is Express.Request['user'] & { permissions: Permission[] } {
  return !!(user && 'permissions' in user && user.permissions);
}