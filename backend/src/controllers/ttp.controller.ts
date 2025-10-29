/**
 * 🎯 TTP Controller
 * Gestion extraction TTPs (Tactics, Techniques & Procedures)
 */

import { Request, Response, NextFunction } from 'express';
import { TTPExtractionService } from '../services/ttp-extraction.service';
import { BadRequestError } from '../utils/errors';

export class TTPController {
  /**
   * POST /api/analysis/extract-ttp
   * Extraire TTPs depuis texte
   */
  static async extractTTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { text, sourceId, sourceType } = req.body;

      if (!text) {
        throw new BadRequestError('text is required');
      }

      let result;

      if (sourceId && sourceType) {
        // Extraire et sauvegarder
        result = await TTPExtractionService.extractAndSaveTTPs(
          tenantId,
          text,
          sourceId,
          sourceType
        );
      } else {
        // Extraction seulement (pas de save)
        result = await TTPExtractionService.extractTTPs(text);
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/ttp/:sourceId
   * Obtenir TTPs d'une entité (alert/threat/case)
   */
  static async getTTPs(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { sourceId } = req.params;
      const { sourceType } = req.query;

      const ttps = await TTPExtractionService.getTTPs(
        tenantId,
        sourceId,
        sourceType as any
      );

      res.json({
        success: true,
        data: ttps,
        count: ttps.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/ttp-timeline/:sourceId
   * Timeline TTPs (Kill Chain order)
   */
  static async getTTPTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { sourceId } = req.params;

      const timeline = await TTPExtractionService.getTTPTimeline(tenantId, sourceId);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/ttp-stats
   * Statistiques TTPs du tenant
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await TTPExtractionService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




