/**
 * 🤖 Predictive Analytics Controller
 * Contrôleur pour l'analyse prédictive ML
 */

import { Request, Response, NextFunction } from 'express';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { BadRequestError } from '../utils/errors';

export class PredictiveController {
  /**
   * POST /api/analysis/predict/threat-severity
   * Prédire la sévérité d'une menace
   */
  static async predictThreatSeverity(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { threatId } = req.body;

      if (!threatId) {
        throw new BadRequestError('threatId is required');
      }

      const prediction = await PredictiveAnalyticsService.predictThreatSeverity(
        tenantId,
        threatId
      );

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/predict/campaign-evolution
   * Prédire l'évolution d'une campagne
   */
  static async predictCampaignEvolution(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { campaignId } = req.body;

      if (!campaignId) {
        throw new BadRequestError('campaignId is required');
      }

      const prediction = await PredictiveAnalyticsService.predictCampaignEvolution(
        tenantId,
        campaignId
      );

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/predict/next-ttp
   * Prédire les prochains TTPs
   */
  static async predictNextTTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { campaignId } = req.body;

      if (!campaignId) {
        throw new BadRequestError('campaignId is required');
      }

      const predictions = await PredictiveAnalyticsService.predictNextTTP(
        tenantId,
        campaignId
      );

      res.json({
        success: true,
        data: predictions,
        count: predictions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/detect-anomalies
   * Détecter anomalies
   */
  static async detectAnomalies(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { entityType, entityId } = req.body;

      if (!entityType || !entityId) {
        throw new BadRequestError('entityType and entityId are required');
      }

      const validTypes = ['campaign', 'actor', 'threat'];
      if (!validTypes.includes(entityType)) {
        throw new BadRequestError(`entityType must be one of: ${validTypes.join(', ')}`);
      }

      const anomalies = await PredictiveAnalyticsService.detectAnomalies(
        tenantId,
        entityType,
        entityId
      );

      res.json({
        success: true,
        data: anomalies,
        count: anomalies.length
      });
    } catch (error) {
      next(error);
    }
  }
}



