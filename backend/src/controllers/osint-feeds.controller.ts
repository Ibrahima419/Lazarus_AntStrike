/**
 * 📡 OSINT Feeds Controller
 */

import { Request, Response, NextFunction } from 'express';
import { OSINTFeedsService } from '../services/osint-feeds.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class OSINTFeedsController {
  /**
   * GET /api/osint-feeds
   * Liste des feeds disponibles
   */
  static async listFeeds(req: Request, res: Response, next: NextFunction) {
    try {
      const feeds = OSINTFeedsService.getAvailableFeeds();

      res.json({
        success: true,
        data: feeds,
        count: feeds.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/osint-feeds/import
   * Import manuel de tous les feeds actifs
   */
  static async importAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      logger.info(`Manual OSINT feeds import triggered for tenant ${tenantId}`);

      const results = await OSINTFeedsService.importAllFeeds(tenantId);

      const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
      const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

      res.json({
        success: true,
        message: `${totalImported} IOCs imported from ${results.length} feeds`,
        data: {
          results,
          summary: {
            feedsProcessed: results.length,
            totalImported,
            totalSkipped,
            totalErrors
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/osint-feeds/import/:feedId
   * Import manuel d'un feed spécifique
   */
  static async importFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { feedId } = req.params;

      logger.info(`Importing feed ${feedId} for tenant ${tenantId}`);

      const result = await OSINTFeedsService.importFeed(tenantId, feedId);

      res.json({
        success: true,
        message: `${result.imported} IOCs imported from ${result.feedName}`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/osint-feeds/configure
   * Configurer les feeds pour le tenant
   */
  static async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { enabled, autoImport, importInterval, selectedFeeds } = req.body;

      await OSINTFeedsService.configureFeedsForTenant(tenantId, {
        enabled: enabled !== false,
        autoImport: autoImport || false,
        importInterval,
        selectedFeeds
      });

      res.json({
        success: true,
        message: 'OSINT feeds configured successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/osint-feeds/stats
   * Statistiques des feeds
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await OSINTFeedsService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




