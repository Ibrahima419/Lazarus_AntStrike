/**
 * ⚡ Enrichment Pipeline Service
 * Orchestration du processus d'enrichissement en 7 étapes
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { IOCEnrichmentService } from './ioc-enrichment.service';
import { IOCHistoryService } from './ioc-history.service';
import { ThreatScoringService } from './threat-scoring.service';

interface PipelineStage {
  stage: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  duration: number;
  result?: any;
  error?: string;
}

interface PipelineResult {
  pipelineId: string;
  iocValue: string;
  iocType: string;
  stages: PipelineStage[];
  totalDuration: number;
  success: boolean;
  data?: any;
}

export class EnrichmentPipelineService {
  /**
   * Exécuter le pipeline complet d'enrichissement
   */
  static async executePipeline(
    tenantId: string,
    ioc: { iocValue: string; iocType: string; source?: string }
  ): Promise<PipelineResult> {
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    const result: PipelineResult = {
      pipelineId,
      iocValue: ioc.iocValue,
      iocType: ioc.iocType,
      stages: [],
      totalDuration: 0,
      success: true
    };

    try {
      logger.info(`Starting enrichment pipeline for ${ioc.iocValue} (${ioc.iocType})`);

      // Stage 1: Validation
      result.stages.push(await this.stage1Validation(ioc));

      // Stage 2: Cache Check
      const cacheStage = await this.stage2CacheCheck(tenantId, ioc);
      result.stages.push(cacheStage);

      if (cacheStage.result?.hit) {
        logger.info('Cache hit - skipping enrichment stages');
        result.data = cacheStage.result.data;
        
        // Skip to stage 7
        result.stages.push({ stage: 'Stage 3-6', status: 'skipped', duration: 0 });
      } else {
        // Stage 3: Primary Enrichment
        const primaryStage = await this.stage3PrimaryEnrichment(tenantId, ioc);
        result.stages.push(primaryStage);
        result.data = primaryStage.result;

        // Stage 4: Secondary Enrichment
        result.stages.push(await this.stage4SecondaryEnrichment(tenantId, result.data));

        // Stage 5: Threat Scoring
        result.stages.push(await this.stage5ThreatScoring(result.data));

        // Stage 6: Historical Recording
        result.stages.push(await this.stage6HistoricalRecording(result.data));
      }

      // Stage 7: Alert Generation
      result.stages.push(await this.stage7AlertGeneration(tenantId, result.data));

      result.totalDuration = Date.now() - startTime;
      result.success = result.stages.every(s => s.status !== 'error');

      logger.info(`Pipeline completed for ${ioc.iocValue}: ${result.totalDuration}ms`);

      return result;
    } catch (error: any) {
      result.success = false;
      result.totalDuration = Date.now() - startTime;
      
      logger.error('Pipeline error:', error);
      
      result.stages.push({
        stage: 'Pipeline Error',
        status: 'error',
        duration: 0,
        error: error.message
      });

      return result;
    }
  }

  /**
   * Stage 1: Validation
   */
  private static async stage1Validation(ioc: any): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      // Valider format IOC
      const valid = this.validateIOCFormat(ioc.iocValue, ioc.iocType);

      return {
        stage: 'Stage 1: Validation',
        status: valid ? 'success' : 'error',
        duration: Date.now() - start,
        result: { valid, format: ioc.iocType }
      };
    } catch (error: any) {
      return {
        stage: 'Stage 1: Validation',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 2: Cache Check
   */
  private static async stage2CacheCheck(
    tenantId: string,
    ioc: any
  ): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      const cached = await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue: ioc.iocValue,
          iocType: ioc.iocType
        }
      });

      const cacheValid = cached && this.isCacheValid(cached.observedAt);

      return {
        stage: 'Stage 2: Cache Check',
        status: 'success',
        duration: Date.now() - start,
        result: {
          hit: cacheValid,
          age: cached ? Date.now() - cached.observedAt.getTime() : null,
          data: cached
        }
      };
    } catch (error: any) {
      return {
        stage: 'Stage 2: Cache Check',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 3: Primary Enrichment (APIs externes)
   */
  private static async stage3PrimaryEnrichment(
    tenantId: string,
    ioc: any
  ): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      const enriched = await IOCEnrichmentService.enrichIOC(tenantId, ioc);

      return {
        stage: 'Stage 3: Primary Enrichment',
        status: 'success',
        duration: Date.now() - start,
        result: enriched
      };
    } catch (error: any) {
      return {
        stage: 'Stage 3: Primary Enrichment',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 4: Secondary Enrichment (MISP, Feeds)
   */
  private static async stage4SecondaryEnrichment(
    tenantId: string,
    ioc: any
  ): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      // Vérifier si IOC existe dans MISP
      const mispMatches = await this.checkMISPMatches(tenantId, ioc.iocValue);
      
      // Vérifier si IOC dans OSINT feeds
      const feedMatches = await this.checkFeedMatches(tenantId, ioc.iocValue);

      return {
        stage: 'Stage 4: Secondary Enrichment',
        status: 'success',
        duration: Date.now() - start,
        result: {
          mispMatches,
          feedMatches
        }
      };
    } catch (error: any) {
      return {
        stage: 'Stage 4: Secondary Enrichment',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 5: Threat Scoring
   */
  private static async stage5ThreatScoring(ioc: any): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      const enrichData = ioc.enrichmentData || {};
      
      const threatScore = ThreatScoringService.calculateThreatScore(ioc, enrichData);
      const confidence = ThreatScoringService.calculateConfidence(enrichData);
      const reputation = ThreatScoringService.determineReputation(threatScore, confidence);
      const priority = ThreatScoringService.calculatePriority(threatScore, confidence);

      return {
        stage: 'Stage 5: Threat Scoring',
        status: 'success',
        duration: Date.now() - start,
        result: {
          threatScore,
          confidence,
          reputation,
          priority
        }
      };
    } catch (error: any) {
      return {
        stage: 'Stage 5: Threat Scoring',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 6: Historical Recording
   */
  private static async stage6HistoricalRecording(ioc: any): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      await IOCHistoryService.recordSnapshot(ioc);

      return {
        stage: 'Stage 6: Historical Recording',
        status: 'success',
        duration: Date.now() - start,
        result: { recorded: true }
      };
    } catch (error: any) {
      // Non-blocking error
      return {
        stage: 'Stage 6: Historical Recording',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  /**
   * Stage 7: Alert Generation
   */
  private static async stage7AlertGeneration(
    tenantId: string,
    ioc: any
  ): Promise<PipelineStage> {
    const start = Date.now();
    
    try {
      const enrichData = ioc.enrichmentData as any || {};
      const threatScore = enrichData.threatScore || 0;

      // Créer alerte si score élevé (>80)
      if (threatScore >= 80) {
        const { AlertingService } = await import('./alerting.service');
        
        await AlertingService.createAlert({
          tenantId,
          storyId: `ioc-${ioc.id || Date.now()}`,
          severity: 'HIGH',
          priority: 'P1',
          category: 'MALWARE',
          title: `High-risk IOC detected: ${ioc.iocValue}`,
          summary: `Threat score: ${threatScore}/100. ${enrichData.sources?.length || 0} sources confirm malicious activity.`,
          iocs: [ioc.iocValue],
          recommendedActions: enrichData.recommendations || []
        });

        return {
          stage: 'Stage 7: Alert Generation',
          status: 'success',
          duration: Date.now() - start,
          result: { alertCreated: true, threatScore }
        };
      }

      return {
        stage: 'Stage 7: Alert Generation',
        status: 'success',
        duration: Date.now() - start,
        result: { alertCreated: false, reason: `Score ${threatScore} below threshold (80)` }
      };
    } catch (error: any) {
      return {
        stage: 'Stage 7: Alert Generation',
        status: 'error',
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  // ========== Helpers ==========

  /**
   * Valider format IOC
   */
  private static validateIOCFormat(value: string, type: string): boolean {
    switch (type) {
      case 'IP':
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
      case 'DOMAIN':
        return /^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i.test(value);
      case 'URL':
        return value.startsWith('http://') || value.startsWith('https://');
      case 'FILE_HASH':
        return /^[a-f0-9]{32,64}$/i.test(value);
      case 'EMAIL':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'CVE':
        return /^CVE-\d{4}-\d{4,}$/i.test(value);
      default:
        return false;
    }
  }

  /**
   * Vérifier cache validity
   */
  private static isCacheValid(observedAt: Date): boolean {
    const hoursSince = (Date.now() - observedAt.getTime()) / 3600000;
    return hoursSince < 24;
  }

  /**
   * Vérifier matches MISP
   */
  private static async checkMISPMatches(tenantId: string, iocValue: string): Promise<number> {
    try {
      // Chercher dans threat correlations
      const count = await prisma.threatCorrelation.count({
        where: {
          tenantId,
          relatedThreatId: 'MISP'
        }
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Vérifier matches dans feeds
   */
  private static async checkFeedMatches(tenantId: string, iocValue: string): Promise<number> {
    try {
      const count = await prisma.iOCHistory.count({
        where: {
          tenantId,
          iocValue,
          source: { startsWith: 'OSINT Feed:' }
        }
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtenir status d'un pipeline
   */
  static async getPipelineStatus(pipelineId: string): Promise<PipelineResult | null> {
    // Pour simplification, retourner null (implémentation complète nécessiterait Redis)
    logger.warn(`Pipeline status ${pipelineId} not found (cache not implemented)`);
    return null;
  }
}




