import { Request, Response, NextFunction } from 'express';
import { IOCEnrichmentService } from '../services/ioc-enrichment.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class IOCController {
  /**
   * POST /api/ioc/enrich - Enrichir un IOC
   */
  static async enrichIOC(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue, iocType, source } = req.body;

      if (!iocValue || !iocType) {
        return res.status(400).json({
          success: false,
          error: 'iocValue et iocType sont requis',
        });
      }

      const enriched = await IOCEnrichmentService.enrichIOC(tenantId, {
        iocValue,
        iocType,
        source,
      });

      res.json({
        success: true,
        data: enriched,
      });
    } catch (error) {
      logger.error('Erreur enrichissement IOC:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enrichissement de l\'IOC',
      });
    }
  }

  /**
   * GET /api/ioc - Récupérer tous les IOCs enrichis
   */
  static async getEnrichedIOCs(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { iocType, limit } = req.query;

      const iocs = await IOCEnrichmentService.getEnrichedIOCs(tenantId, {
        iocType: iocType as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: iocs,
      });
    } catch (error) {
      logger.error('Erreur récupération IOCs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des IOCs',
      });
    }
  }

  /**
   * POST /api/ioc/extract - Extraire les IOCs depuis un texte
   */
  static async extractIOCs(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Le texte est requis',
        });
      }

      const iocs = await IOCEnrichmentService.extractIOCsFromText(text);

      res.json({
        success: true,
        data: iocs,
      });
    } catch (error) {
      logger.error('Erreur extraction IOCs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'extraction des IOCs',
      });
    }
  }

  /**
   * POST /api/ioc/bulk-enrich - Enrichir plusieurs IOCs en masse
   */
  static async bulkEnrichIOCs(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { iocs } = req.body;

      if (!Array.isArray(iocs) || iocs.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Un tableau d\'IOCs est requis',
        });
      }

      const results = await Promise.all(
        iocs.map(async (ioc) => {
          try {
            return await IOCEnrichmentService.enrichIOC(tenantId, ioc);
          } catch (error) {
            return { ...ioc, error: 'Enrichment failed' };
          }
        })
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error('Erreur enrichissement masse IOCs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enrichissement en masse',
      });
    }
  }

  /**
   * POST /api/ioc/check-breach - Vérifier si email breached
   */
  static async checkBreach(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { email } = req.body;

      if (!email) {
        throw new BadRequestError('Email required');
      }

      logger.info(`Checking breach for email: ${email}`);

      const enriched = await IOCEnrichmentService.enrichIOC(tenantId, {
        iocValue: email,
        iocType: 'EMAIL',
        source: 'Manual Check'
      });

      const emailData = (enriched.enrichmentData as any)?.emailData || {};

      res.json({
        success: true,
        data: {
          email,
          breached: emailData.breached || false,
          breachCount: emailData.breachCount || 0,
          breaches: emailData.breaches || [],
          reputation: emailData.reputation || 'unknown',
          threatScore: emailData.threatScore || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/email/:email - Détails email enrichi
   */
  static async getEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { email } = req.params;

      const { prisma } = await import('../config/database');

      const enriched = await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue: email,
          iocType: 'EMAIL'
        }
      });

      if (!enriched) {
        // Enrichir à la volée
        const newEnriched = await IOCEnrichmentService.enrichIOC(tenantId, {
          iocValue: email,
          iocType: 'EMAIL',
          source: 'API Request'
        });

        return res.json({
          success: true,
          data: newEnriched
        });
      }

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/history/:iocValue - Historique IOC
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;
      const { iocType, days } = req.query;

      if (!iocType) {
        throw new BadRequestError('iocType query parameter required');
      }

      const { IOCHistoryService } = await import('../services/ioc-history.service');

      const history = await IOCHistoryService.getHistory(
        tenantId,
        iocValue,
        iocType as string,
        days ? parseInt(days as string) : 90
      );

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/trend/:iocValue - Analyse tendance IOC
   */
  static async getTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;
      const { iocType, days } = req.query;

      if (!iocType) {
        throw new BadRequestError('iocType query parameter required');
      }

      const { IOCHistoryService } = await import('../services/ioc-history.service');

      const history = await IOCHistoryService.getHistory(
        tenantId,
        iocValue,
        iocType as string,
        days ? parseInt(days as string) : 30
      );

      const trend = IOCHistoryService.analyzeTrend(history);

      res.json({
        success: true,
        data: {
          iocValue,
          iocType,
          trend,
          history: history.slice(0, 10) // 10 derniers points
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/changes - Changements récents
   */
  static async getChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { days, limit } = req.query;

      const { IOCHistoryService } = await import('../services/ioc-history.service');

      const changes = await IOCHistoryService.getRecentChanges(
        tenantId,
        days ? parseInt(days as string) : 7,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        data: changes,
        count: changes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/snapshot - Forcer snapshot manuel
   */
  static async forceSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue, iocType } = req.body;

      if (!iocValue || !iocType) {
        throw new BadRequestError('iocValue and iocType required');
      }

      const { prisma } = await import('../config/database');

      const ioc = await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue,
          iocType
        }
      });

      if (!ioc) {
        throw new BadRequestError('IOC not found');
      }

      const { IOCHistoryService } = await import('../services/ioc-history.service');
      await IOCHistoryService.recordSnapshot(ioc);

      res.json({
        success: true,
        message: 'Snapshot recorded'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/score/:iocValue - Threat score détaillé
   */
  static async getScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;
      const { iocType } = req.query;

      if (!iocType) {
        throw new BadRequestError('iocType query parameter required');
      }

      const { prisma } = await import('../config/database');

      const ioc = await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue,
          iocType: iocType as string
        }
      });

      if (!ioc) {
        throw new BadRequestError('IOC not found');
      }

      const enrichData = ioc.enrichmentData as any;

      res.json({
        success: true,
        data: {
          iocValue,
          iocType,
          threatScore: enrichData.threatScore || 0,
          confidence: enrichData.confidence || 0,
          reputation: enrichData.reputation || 'unknown',
          priority: enrichData.priority || 'P3',
          recommendations: enrichData.recommendations || [],
          sources: enrichData.sources || []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/recalculate-scores - Recalculer tous les scores
   */
  static async recalculateScores(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      logger.info(`Recalculating all threat scores for tenant ${tenantId}`);

      const { ThreatScoringService } = await import('../services/threat-scoring.service');

      const result = await ThreatScoringService.recalculateAllScores(tenantId);

      res.json({
        success: true,
        message: `${result.updated} IOCs recalculated`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/reputation-stats - Stats par réputation
   */
  static async getReputationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const { ThreatScoringService } = await import('../services/threat-scoring.service');

      const stats = await ThreatScoringService.getReputationStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/pipeline - Enrichment avec pipeline détaillé
   */
  static async executePipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue, iocType, source } = req.body;

      if (!iocValue || !iocType) {
        throw new BadRequestError('iocValue and iocType required');
      }

      const { EnrichmentPipelineService } = await import('../services/enrichment-pipeline.service');

      const result = await EnrichmentPipelineService.executePipeline(tenantId, {
        iocValue,
        iocType,
        source
      });

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/correlate/:iocValue - Corrélation multi-sources
   */
  static async correlate(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;
      const { iocType } = req.query;

      if (!iocType) {
        throw new BadRequestError('iocType query parameter required');
      }

      const { IOCCorrelationService } = await import('../services/ioc-correlation.service');

      const correlation = await IOCCorrelationService.correlateIOC(
        tenantId,
        iocValue,
        iocType as string
      );

      res.json({
        success: true,
        data: correlation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/related/:iocValue - IOCs reliés
   */
  static async getRelated(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;

      const { IOCCorrelationService } = await import('../services/ioc-correlation.service');

      const related = await IOCCorrelationService.findRelatedIOCs(tenantId, iocValue);

      res.json({
        success: true,
        data: related,
        count: related.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/bulk-correlate - Corrélation bulk
   */
  static async bulkCorrelate(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocs } = req.body;

      if (!Array.isArray(iocs)) {
        throw new BadRequestError('iocs array required');
      }

      const { IOCCorrelationService } = await import('../services/ioc-correlation.service');

      const results = await IOCCorrelationService.bulkCorrelate(tenantId, iocs);

      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/apply-decay - Appliquer decay manuel
   */
  static async applyDecay(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const { ReputationDecayService } = await import('../services/reputation-decay.service');

      const result = await ReputationDecayService.applyDecayToAll(tenantId);

      res.json({
        success: true,
        message: `${result.updated} IOCs updated with decay`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/decay-stats - Statistiques decay
   */
  static async getDecayStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const { ReputationDecayService } = await import('../services/reputation-decay.service');

      const stats = await ReputationDecayService.getDecayStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/needs-refresh - IOCs nécessitant refresh
   */
  static async getNeedsRefresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { maxDays } = req.query;

      const { ReputationDecayService } = await import('../services/reputation-decay.service');

      const iocs = await ReputationDecayService.getIOCsNeedingRefresh(
        tenantId,
        maxDays ? parseInt(maxDays as string) : 30
      );

      res.json({
        success: true,
        data: iocs,
        count: iocs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/auto-refresh - Auto-refresh IOCs expirés
   */
  static async autoRefresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { maxCount } = req.body;

      const { ReputationDecayService } = await import('../services/reputation-decay.service');

      const result = await ReputationDecayService.autoRefreshExpired(
        tenantId,
        maxCount || 50
      );

      res.json({
        success: true,
        message: `${result.refreshed} IOCs refreshed`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/relationship - Créer relation entre IOCs
   */
  static async createRelationship(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { ioc1, ioc2, relationshipType, confidence, context } = req.body;

      if (!ioc1 || !ioc2) {
        throw new BadRequestError('ioc1 and ioc2 required');
      }

      if (!relationshipType) {
        throw new BadRequestError('relationshipType required');
      }

      const { IOCRelationshipService } = await import('../services/ioc-relationship.service');

      const relationship = await IOCRelationshipService.createRelationship(
        tenantId,
        ioc1,
        ioc2,
        relationshipType as any,
        confidence || 70,
        context
      );

      res.json({
        success: true,
        data: relationship
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/graph/:iocValue - Graphe de relations
   */
  static async getGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocValue } = req.params;
      const { depth } = req.query;

      const { IOCRelationshipService } = await import('../services/ioc-relationship.service');

      const graph = await IOCRelationshipService.getRelationshipGraph(
        tenantId,
        iocValue,
        depth ? parseInt(depth as string) : 2
      );

      res.json({
        success: true,
        data: graph
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ioc/auto-detect-relationships - Auto-détection
   */
  static async autoDetectRelationships(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { maxIOCs } = req.body;

      const { IOCRelationshipService } = await import('../services/ioc-relationship.service');

      const result = await IOCRelationshipService.autoDetectRelationships(
        tenantId,
        maxIOCs || 100
      );

      res.json({
        success: true,
        message: `${result.created} relationships detected`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ioc/relationship-stats - Stats relationships
   */
  static async getRelationshipStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const { IOCRelationshipService } = await import('../services/ioc-relationship.service');

      const stats = await IOCRelationshipService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

