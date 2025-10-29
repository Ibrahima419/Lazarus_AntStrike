/**
 * 🎯 MITRE ATT&CK Controller
 */

import { Request, Response, NextFunction } from 'express';
import { MITREAttackService } from '../services/mitre-attack.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class MITREController {
  /**
   * POST /api/mitre/load
   * Charger/Rafraîchir données MITRE ATT&CK
   */
  static async loadData(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Loading MITRE ATT&CK data...');
      
      await MITREAttackService.loadAttackData();

      res.json({
        success: true,
        message: 'MITRE ATT&CK data loaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/mitre/map-threat
   * Mapper une menace vers techniques MITRE
   */
  static async mapThreat(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { id, type, indicators, description, behaviors } = req.body;

      if (!id || !type) {
        throw new BadRequestError('Threat ID and type are required');
      }

      const patterns = await MITREAttackService.mapThreatToAttack(tenantId, {
        id,
        type,
        indicators: indicators || [],
        description,
        behaviors
      });

      res.json({
        success: true,
        data: {
          threatId: id,
          techniques: patterns,
          count: patterns.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mitre/technique/:id
   * Obtenir détails d'une technique
   */
  static async getTechnique(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const technique = await MITREAttackService.getTechnique(id);

      if (!technique) {
        throw new BadRequestError(`Technique ${id} not found`);
      }

      res.json({
        success: true,
        data: technique
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mitre/search
   * Rechercher techniques
   */
  static async searchTechniques(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        throw new BadRequestError('Query parameter "q" is required');
      }

      const techniques = await MITREAttackService.searchTechniques(q);

      res.json({
        success: true,
        data: techniques,
        count: techniques.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mitre/tactics/:tacticName/techniques
   * Obtenir techniques par tactic
   */
  static async getTechniquesByTactic(req: Request, res: Response, next: NextFunction) {
    try {
      const { tacticName } = req.params;

      const techniques = await MITREAttackService.getTechniquesByTactic(tacticName);

      res.json({
        success: true,
        data: techniques,
        count: techniques.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mitre/stats
   * Statistiques MITRE pour le tenant
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await MITREAttackService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




