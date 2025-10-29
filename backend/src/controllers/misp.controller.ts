/**
 * 🔗 MISP Controller
 */

import { Request, Response, NextFunction } from 'express';
import { MISPClientService } from '../services/misp-client.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class MISPController {
  /**
   * POST /api/misp/configure
   * Configurer MISP pour le tenant
   */
  static async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { url, apiKey, enabled, autoSync, syncInterval, verifySsl } = req.body;

      if (!url || !apiKey) {
        throw new BadRequestError('MISP URL and API key required');
      }

      await MISPClientService.configureMISP(tenantId, {
        url,
        apiKey,
        enabled,
        autoSync,
        syncInterval,
        verifySsl
      });

      res.json({
        success: true,
        message: 'MISP configured successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/misp/test
   * Tester connexion MISP
   */
  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, apiKey, verifySsl } = req.body;

      if (!url || !apiKey) {
        throw new BadRequestError('MISP URL and API key required');
      }

      const isConnected = await MISPClientService.testConnection({
        url,
        apiKey,
        verifySsl
      });

      res.json({
        success: true,
        connected: isConnected,
        message: isConnected ? 'Connection successful' : 'Connection failed'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/misp/events
   * Récupérer events MISP
   */
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const lastDays = req.query.lastDays ? parseInt(req.query.lastDays as string) : 7;

      const config = await MISPClientService.getTenantMISPConfig(tenantId);
      if (!config) {
        throw new BadRequestError('MISP not configured for this tenant');
      }

      const events = await MISPClientService.getRecentEvents(config, lastDays);

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/misp/attributes
   * Récupérer attributes (IOCs) MISP
   */
  static async getAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { type, category, limit } = req.query;

      const config = await MISPClientService.getTenantMISPConfig(tenantId);
      if (!config) {
        throw new BadRequestError('MISP not configured for this tenant');
      }

      const attributes = await MISPClientService.getAttributes(config, {
        type: type as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : 1000
      });

      res.json({
        success: true,
        data: attributes,
        count: attributes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/misp/sync
   * Synchroniser IOCs MISP → AntStrike
   */
  static async syncIOCs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { lastDays, types, autoEnrich } = req.body;

      const config = await MISPClientService.getTenantMISPConfig(tenantId);
      if (!config) {
        throw new BadRequestError('MISP not configured for this tenant');
      }

      logger.info(`Starting manual MISP sync for tenant ${tenantId}`);

      const stats = await MISPClientService.syncIOCs(tenantId, config, {
        lastDays: lastDays || 7,
        types: types || undefined,
        autoEnrich: autoEnrich !== false
      });

      res.json({
        success: true,
        message: 'MISP synchronization completed',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/misp/publish
   * Publier IOCs AntStrike → MISP
   */
  static async publishIOCs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { iocIds, eventInfo } = req.body;

      if (!Array.isArray(iocIds) || iocIds.length === 0) {
        throw new BadRequestError('IOC IDs array required');
      }

      const config = await MISPClientService.getTenantMISPConfig(tenantId);
      if (!config) {
        throw new BadRequestError('MISP not configured for this tenant');
      }

      const result = await MISPClientService.publishIOCs(
        tenantId,
        config,
        iocIds,
        eventInfo
      );

      res.json({
        success: true,
        message: `${result.published} IOCs published to MISP`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/misp/stats
   * Statistiques MISP
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await MISPClientService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




