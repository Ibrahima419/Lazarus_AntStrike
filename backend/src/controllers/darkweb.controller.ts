/**
 * 🕵️ Dark Web Controller
 */

import { Request, Response, NextFunction } from 'express';
import { DarkWebMonitoringService } from '../services/darkweb-monitoring.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class DarkWebController {
  /**
   * POST /api/darkweb/scan
   * Scanner Dark Web pour mentions
   */
  static async scan(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      logger.info(`Dark Web scan initiated for tenant ${tenantId}`);

      const result = await DarkWebMonitoringService.importAll(tenantId);

      res.json({
        success: true,
        message: `${result.total} mentions found`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/darkweb/monitor/pastebin
   * Monitorer Pastebin
   */
  static async monitorPastebin(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { keywords } = req.body;

      if (!keywords || !Array.isArray(keywords)) {
        throw new BadRequestError('Keywords array required');
      }

      const mentions = await DarkWebMonitoringService.monitorPastebin(tenantId, keywords);

      res.json({
        success: true,
        data: mentions,
        count: mentions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/darkweb/monitor/github
   * Monitorer GitHub Gists
   */
  static async monitorGitHub(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { keywords } = req.body;

      if (!keywords || !Array.isArray(keywords)) {
        throw new BadRequestError('Keywords array required');
      }

      const mentions = await DarkWebMonitoringService.monitorGitHubGists(tenantId, keywords);

      res.json({
        success: true,
        data: mentions,
        count: mentions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/darkweb/monitor/telegram
   * Monitorer Telegram channels
   */
  static async monitorTelegram(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { channels } = req.body;

      if (!channels || !Array.isArray(channels)) {
        throw new BadRequestError('Channels array required');
      }

      const mentions = await DarkWebMonitoringService.monitorTelegramChannels(tenantId, channels);

      res.json({
        success: true,
        data: mentions,
        count: mentions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/darkweb/mentions
   * Liste des mentions Dark Web
   */
  static async getMentions(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { severity, limit } = req.query;

      const { prisma } = await import('../config/database');

      const where: any = {
        tenantId,
        action: 'DARKWEB_MENTION_DETECTED'
      };

      // TODO: Implémenter auditLog model ou utiliser un modèle existant
      const mentions: any[] = []; // Placeholder - à implémenter avec le bon modèle

      res.json({
        success: true,
        data: mentions.map((m: any) => m.details),
        count: mentions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/darkweb/configure
   * Configurer Dark Web monitoring
   */
  static async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { enabled, keywords, telegramChannels, monitorPastebin, monitorGitHub, monitorTor, autoImport } = req.body;

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        throw new BadRequestError('At least one keyword required');
      }

      await DarkWebMonitoringService.configure(tenantId, {
        enabled: enabled !== false,
        keywords,
        telegramChannels,
        monitorPastebin,
        monitorGitHub,
        monitorTor,
        autoImport
      });

      res.json({
        success: true,
        message: 'Dark Web monitoring configured'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/darkweb/stats
   * Statistiques Dark Web
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await DarkWebMonitoringService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




