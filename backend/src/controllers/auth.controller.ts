/**
 * 🔐 Auth Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { BadRequestError } from '../utils/errors';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantName, email, name, password } = req.body;

      if (!tenantName || !email || !name || !password) {
        throw new BadRequestError('Missing required fields');
      }

      const result = await AuthService.register({
        tenantName,
        email,
        name,
        password
      });

      res.status(201).json({
        message: 'Registration successful',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BadRequestError('Email and password required');
      }

      const result = await AuthService.login(email, password);

      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Refresh token required');
      }

      const result = await AuthService.refresh(refreshToken);

      res.json({
        message: 'Token refreshed',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Blacklist token si Redis disponible
      
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const user = await AuthService.getMe(userId);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}



