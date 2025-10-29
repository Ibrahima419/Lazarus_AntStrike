/**
 * ⚡ Real-Time Correlation Controller
 * Contrôleur pour le moteur de corrélation temps réel
 */

import { Request, Response, NextFunction } from 'express';
import { RealTimeCorrelationService } from '../services/realtime-correlation.service';
import { BadRequestError } from '../utils/errors';

export class CorrelationController {
  /**
   * POST /api/correlation/initialize
   * Initialiser le moteur de corrélation
   */
  static async initialize(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      await RealTimeCorrelationService.initialize(tenantId);

      res.json({
        success: true,
        message: 'Correlation engine initialized'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/correlation/process-event
   * Traiter un événement en temps réel
   */
  static async processEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { type, source, data } = req.body;

      if (!type || !source) {
        throw new BadRequestError('type and source are required');
      }

      const event = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        source,
        data: data || {},
        tenantId
      };

      const matches = await RealTimeCorrelationService.processEvent(event);

      res.json({
        success: true,
        data: {
          event,
          matches,
          matchCount: matches.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/correlation/rules
   * Obtenir règles de corrélation
   */
  static async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = RealTimeCorrelationService.getCorrelationRules();

      res.json({
        success: true,
        data: rules,
        count: rules.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/correlation/rules/:ruleId/toggle
   * Activer/désactiver une règle
   */
  static async toggleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        throw new BadRequestError('enabled must be a boolean');
      }

      const success = RealTimeCorrelationService.toggleRule(ruleId, enabled);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Rule not found'
        });
      }

      res.json({
        success: true,
        message: `Rule ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/correlation/events
   * Obtenir événements récents
   */
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { limit } = req.query;

      const events = RealTimeCorrelationService.getRecentEvents(
        tenantId,
        limit ? parseInt(limit as string) : 100
      );

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
   * GET /api/correlation/stats
   * Obtenir statistiques
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await RealTimeCorrelationService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/correlation/simulate
   * Simuler un événement (testing)
   */
  static async simulate(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { type, data } = req.body;

      if (!type) {
        throw new BadRequestError('type is required');
      }

      const event = await RealTimeCorrelationService.simulateEvent(
        tenantId,
        type,
        data || {}
      );

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/correlation/force-analysis
   * Forcer une analyse de corrélation
   */
  static async forceAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const matches = await RealTimeCorrelationService.forceCorrelation(tenantId);

      res.json({
        success: true,
        data: matches,
        count: matches.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/correlation/campaigns
   * Analyser les corrélations de campagnes
   */
  static async analyzeCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      // TODO: Implémenter l'analyse de campagnes corrélées
      const campaigns: any[] = [];

      res.json({
        success: true,
        data: campaigns,
        count: campaigns.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/correlation/stats
   * Statistiques de corrélation globales
   */
  static async getCorrelationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await RealTimeCorrelationService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/correlation/threat
   * Corréler une menace
   */
  static async correlateThreat(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { threatId } = req.body;

      // TODO: Implémenter corrélation de menace
      const correlations: any[] = [];

      res.json({
        success: true,
        data: correlations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/correlation/threat/:threatId
   * Obtenir les corrélations d'une menace
   */
  static async getThreatCorrelations(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { threatId } = req.params;

      // TODO: Implémenter récupération des corrélations
      const correlations: any[] = [];

      res.json({
        success: true,
        data: correlations
      });
    } catch (error) {
      next(error);
    }
  }
}
