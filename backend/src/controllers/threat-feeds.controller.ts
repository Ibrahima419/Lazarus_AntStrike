/**
 * 🎯 Threat Feeds Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ThreatFeedsService } from '../services/threat-feeds.service';
import { logger } from '../utils/logger';

export class ThreatFeedsController {
  /**
   * GET /api/threat-feeds
   * Liste des feeds disponibles
   */
  static async listFeeds(req: Request, res: Response, next: NextFunction) {
    try {
      const feeds = ThreatFeedsService.getAvailableFeeds();

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
   * POST /api/threat-feeds/sync
   * Synchroniser tous les feeds
   */
  static async syncAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      logger.info(`Syncing all threat feeds for tenant ${tenantId}`);

      const results = await ThreatFeedsService.syncAllFeeds(tenantId);

      res.json({
        success: true,
        message: `${results.total.imported} IOCs imported from threat feeds`,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/threat-feeds/sync/otx
   * Synchroniser AlienVault OTX
   */
  static async syncOTX(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const result = await ThreatFeedsService.syncAlienVaultOTX(tenantId);

      res.json({
        success: true,
        message: `${result.imported} IOCs imported from AlienVault OTX`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/threat-feeds/sync/malwarebazaar
   * Synchroniser MalwareBazaar
   */
  static async syncMalwareBazaar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const result = await ThreatFeedsService.syncMalwareBazaar(tenantId);

      res.json({
        success: true,
        message: `${result.imported} hashes imported from MalwareBazaar`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/threat-feeds/configure
   * Configurer threat feeds
   */
  static async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { enabled, autoSync, syncInterval, feeds } = req.body;

      await ThreatFeedsService.configure(tenantId, {
        enabled: enabled !== false,
        autoSync: autoSync || false,
        syncInterval,
        feeds: feeds || ['alienvault-otx', 'malwarebazaar', 'threatfox', 'urlhaus']
      });

      res.json({
        success: true,
        message: 'Threat feeds configured'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/threat-feeds/stats
   * Statistiques threat feeds
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await ThreatFeedsService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




