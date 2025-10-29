/**
 * 🔐 Auth Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

/**
 * Vérifier JWT token
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);

    // Attacher user info à la requête
    (req as any).user = payload;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Vérifier role admin
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
}



