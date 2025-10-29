/**
 * 🍯 Honeypot Controller
 */

import { Request, Response, NextFunction } from 'express';
import { HoneypotCollectorService } from '../services/honeypot-collector.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class HoneypotController {
  /**
   * GET /api/honeypots/supported
   * Liste des honeypots supportés
   */
  static async getSupportedTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const supported = HoneypotCollectorService.getSupportedHoneypots();

      res.json({
        success: true,
        data: supported,
        count: supported.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/honeypots/configure
   * Configurer honeypots
   */
  static async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { honeypots } = req.body;

      if (!Array.isArray(honeypots)) {
        throw new BadRequestError('Honeypots array required');
      }

      await HoneypotCollectorService.configure(tenantId, honeypots);

      res.json({
        success: true,
        message: `${honeypots.length} honeypots configured`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/honeypots/import
   * Importer logs depuis tous les honeypots
   */
  static async importAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      logger.info(`Importing honeypot logs for tenant ${tenantId}`);

      const result = await HoneypotCollectorService.importAllHoneypots(tenantId);

      res.json({
        success: true,
        message: `${result.totalLogs} logs processed, ${result.iocsCreated} IOCs created`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/honeypots/stats
   * Statistiques honeypots
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await HoneypotCollectorService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




