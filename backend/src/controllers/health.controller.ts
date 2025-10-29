/**
 * 💚 Health Controller
 * Contrôleur pour le monitoring de santé de la plateforme
 */

import { Request, Response, NextFunction } from 'express';
import { HealthMonitoringService } from '../services/health-monitoring.service';

export class HealthController {
  /**
   * GET /api/health
   * Status global de santé
   */
  static async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await HealthMonitoringService.checkHealth();

      // Status code basé sur la santé
      const statusCode = health.overall === 'healthy' ? 200 
                       : health.overall === 'degraded' ? 200 
                       : 503;

      res.status(statusCode).json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/system
   * Métriques système
   */
  static async getSystemMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = HealthMonitoringService.getSystemMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/api
   * Métriques API
   */
  static async getAPIMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const metrics = await HealthMonitoringService.getAPIMetrics(tenantId);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/database
   * Métriques Database
   */
  static async getDatabaseMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await HealthMonitoringService.getDatabaseMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/uptime
   * Uptime stats
   */
  static async getUptime(req: Request, res: Response, next: NextFunction) {
    try {
      const uptime = HealthMonitoringService.getUptimeStats();

      res.json({
        success: true,
        data: uptime
      });
    } catch (error) {
      next(error);
    }
  }
}



