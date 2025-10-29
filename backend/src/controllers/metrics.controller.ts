import { Request, Response } from 'express';
import { AnalystMetricsService } from '../services/analyst-metrics.service';
import { logger } from '../utils/logger';

export class MetricsController {
  /**
   * GET /api/metrics/analyst/:userId - Métriques d'un analyste
   */
  static async getAnalystMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const period = startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

      const metrics = await AnalystMetricsService.getAnalystMetrics(userId, period);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Erreur récupération métriques analyste:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des métriques',
      });
    }
  }

  /**
   * GET /api/metrics/analyst/:userId/aggregated - Métriques agrégées
   */
  static async getAggregatedMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const period = startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

      const metrics = await AnalystMetricsService.calculateAggregatedMetrics(
        userId,
        period
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Erreur calcul métriques agrégées:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du calcul des métriques agrégées',
      });
    }
  }

  /**
   * GET /api/metrics/team - Métriques d'équipe
   */
  static async getTeamMetrics(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { startDate, endDate } = req.query;

      const period = startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

      const metrics = await AnalystMetricsService.getTeamMetrics(tenantId, period);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Erreur récupération métriques équipe:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des métriques d\'équipe',
      });
    }
  }

  /**
   * GET /api/metrics/compare - Comparer les analystes
   */
  static async compareAnalysts(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { startDate, endDate } = req.query;

      const period = startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

      const comparison = await AnalystMetricsService.compareAnalysts(tenantId, period);

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      logger.error('Erreur comparaison analystes:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la comparaison des analystes',
      });
    }
  }

  /**
   * POST /api/metrics/analyst/:userId/update - Mettre à jour les métriques
   */
  static async updateDailyMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.body;

      const metrics = await AnalystMetricsService.updateDailyMetrics(
        userId,
        date ? new Date(date) : undefined
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Erreur mise à jour métriques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour des métriques',
      });
    }
  }
}

