/**
 * 🔬 Analysis Controller
 * Controller unifié pour analyse et corrélation (MITRE, Kill Chain, Diamond Model)
 */

import { Request, Response, NextFunction } from 'express';
import { MITREAttackService } from '../services/mitre-attack.service';
import { KillChainService } from '../services/kill-chain.service';
import { DiamondModelService } from '../services/diamond-model.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AnalysisController {
  /**
   * POST /api/analysis/complete
   * Analyse complète d'une menace (MITRE + Kill Chain + Diamond)
   */
  static async completeAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { id, type, iocs, behaviors, description, source, affectedAssets } = req.body;

      if (!id || !type) {
        throw new BadRequestError('Threat ID and type are required');
      }

      logger.info(`Starting complete analysis for threat ${id}`);

      const threat = {
        id,
        type,
        iocs: iocs || [],
        behaviors: behaviors || [],
        description,
        source,
        affectedAssets
      };

      // Analyse parallèle
      const [mitrePatterns, killChainPhases, diamondModel] = await Promise.all([
        MITREAttackService.mapThreatToAttack(tenantId, {
          ...threat,
          indicators: threat.iocs
        }),
        KillChainService.analyzeKillChain(tenantId, {
          ...threat,
          mitreTechniques: []
        }),
        DiamondModelService.buildDiamondModel(tenantId, threat)
      ]);

      // Mettre à jour Kill Chain avec techniques MITRE
      const mitreTechniques = mitrePatterns.map(p => p.technique.attackId);
      const killChainWithMitre = await KillChainService.analyzeKillChain(tenantId, {
        ...threat,
        mitreTechniques
      });

      res.json({
        success: true,
        data: {
          threatId: id,
          mitre: {
            techniques: mitrePatterns,
            count: mitrePatterns.length
          },
          killChain: {
            phases: killChainWithMitre,
            count: killChainWithMitre.length,
            report: KillChainService.generateReport(killChainWithMitre)
          },
          diamond: {
            model: diamondModel,
            report: DiamondModelService.generateReport(diamondModel)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/kill-chain
   * Analyse Kill Chain uniquement
   */
  static async analyzeKillChain(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { id, iocs, behaviors, mitreTechniques, description } = req.body;

      if (!id) {
        throw new BadRequestError('Threat ID is required');
      }

      const phases = await KillChainService.analyzeKillChain(tenantId, {
        id,
        iocs: iocs || [],
        behaviors,
        mitreTechniques,
        description
      });

      res.json({
        success: true,
        data: {
          phases,
          count: phases.length,
          report: KillChainService.generateReport(phases)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/diamond
   * Analyse Diamond Model uniquement
   */
  static async analyzeDiamond(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { id, iocs, behaviors, mitreTechniques, description, source } = req.body;

      if (!id) {
        throw new BadRequestError('Threat ID is required');
      }

      const model = await DiamondModelService.buildDiamondModel(tenantId, {
        id,
        iocs: iocs || [],
        behaviors,
        mitreTechniques,
        description,
        source
      });

      res.json({
        success: true,
        data: {
          model,
          report: DiamondModelService.generateReport(model)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/stats
   * Statistiques d'analyse pour le tenant
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const [mitreStats, killChainStats, diamondStats] = await Promise.all([
        MITREAttackService.getStats(tenantId),
        KillChainService.getStats(tenantId),
        DiamondModelService.getStats(tenantId)
      ]);

      res.json({
        success: true,
        data: {
          mitre: mitreStats,
          killChain: killChainStats,
          diamond: diamondStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}




