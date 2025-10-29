/**
 * ⏰ Reputation Decay Service
 * Décroissance automatique de la réputation dans le temps
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export class ReputationDecayService {
  /**
   * Appliquer decay au threat score
   */
  static applyDecay(
    originalScore: number,
    daysSinceObservation: number
  ): number {
    // Décroissance exponentielle
    // Score réduit de 50% après 30 jours
    // Formule: score * e^(-0.023 * days)
    const decayRate = 0.023; // -2.3% par jour
    const decayedScore = originalScore * Math.exp(-decayRate * daysSinceObservation);
    
    return Math.max(Math.round(decayedScore), 0);
  }

  /**
   * Calculer half-life (jours pour perdre 50% du score)
   */
  static calculateHalfLife(decayRate: number = 0.023): number {
    return Math.round(Math.log(2) / decayRate);
  }

  /**
   * Mettre à jour scores avec decay pour tous les IOCs
   */
  static async applyDecayToAll(tenantId: string): Promise<{ updated: number; total: number }> {
    try {
      logger.info(`Applying reputation decay for tenant ${tenantId}`);

      const iocs = await prisma.iOCHistory.findMany({
        where: { tenantId }
      });

      let updated = 0;

      for (const ioc of iocs) {
        const daysSince = (Date.now() - ioc.observedAt.getTime()) / 86400000;
        
        // Appliquer decay seulement si >7 jours
        if (daysSince > 7) {
          const enrichData = ioc.enrichmentData as any;
          const originalScore = enrichData.threatScore || 50;
          const newScore = this.applyDecay(originalScore, daysSince);

          // Mettre à jour si changement significatif (>5 points)
          if (Math.abs(newScore - originalScore) > 5) {
            enrichData.threatScore = newScore;
            enrichData.decayApplied = true;
            enrichData.decayDays = daysSince;
            enrichData.originalScore = originalScore;
            
            // Recalculer réputation
            const { ThreatScoringService } = await import('./threat-scoring.service');
            enrichData.reputation = ThreatScoringService.determineReputation(
              newScore,
              enrichData.confidence || 70
            );

            await prisma.iOCHistory.update({
              where: { id: ioc.id },
              data: { enrichmentData: enrichData }
            });

            updated++;
          }
        }
      }

      logger.info(`Reputation decay applied: ${updated}/${iocs.length} IOCs updated`);

      return { updated, total: iocs.length };
    } catch (error: any) {
      logger.error('Error applying reputation decay:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir IOCs nécessitant refresh (decay trop important)
   */
  static async getIOCsNeedingRefresh(
    tenantId: string,
    maxDecayDays: number = 30
  ): Promise<any[]> {
    const iocs = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        observedAt: {
          lte: new Date(Date.now() - maxDecayDays * 86400000)
        }
      },
      orderBy: { observedAt: 'asc' },
      take: 100
    });

    return iocs.map(ioc => {
      const daysSince = (Date.now() - ioc.observedAt.getTime()) / 86400000;
      const enrichData = ioc.enrichmentData as any;
      const currentScore = enrichData.threatScore || 0;
      const decayedScore = this.applyDecay(currentScore, daysSince);

      return {
        iocValue: ioc.iocValue,
        iocType: ioc.iocType,
        observedAt: ioc.observedAt,
        daysSince: Math.round(daysSince),
        currentScore,
        decayedScore,
        scoreDecay: currentScore - decayedScore,
        needsRefresh: daysSince > maxDecayDays
      };
    });
  }

  /**
   * Statistiques decay
   */
  static async getDecayStats(tenantId: string): Promise<any> {
    const iocs = await prisma.iOCHistory.findMany({
      where: { tenantId },
      select: {
        iocValue: true,
        iocType: true,
        observedAt: true,
        enrichmentData: true
      }
    });

    const stats = {
      total: iocs.length,
      fresh: 0,        // <7 jours
      aging: 0,        // 7-30 jours
      stale: 0,        // 30-90 jours
      expired: 0,      // >90 jours
      avgAge: 0,
      needsRefresh: 0
    };

    let totalAge = 0;

    iocs.forEach(ioc => {
      const daysSince = (Date.now() - ioc.observedAt.getTime()) / 86400000;
      totalAge += daysSince;

      if (daysSince < 7) stats.fresh++;
      else if (daysSince < 30) stats.aging++;
      else if (daysSince < 90) stats.stale++;
      else stats.expired++;

      if (daysSince > 30) stats.needsRefresh++;
    });

    stats.avgAge = iocs.length > 0 ? Math.round(totalAge / iocs.length) : 0;

    return stats;
  }

  /**
   * Auto-refresh IOCs expirés
   */
  static async autoRefreshExpired(
    tenantId: string,
    maxCount: number = 50
  ): Promise<{ refreshed: number; errors: number }> {
    try {
      const needingRefresh = await this.getIOCsNeedingRefresh(tenantId, 30);
      
      let refreshed = 0;
      let errors = 0;

      const { IOCEnrichmentService } = await import('./ioc-enrichment.service');

      for (const ioc of needingRefresh.slice(0, maxCount)) {
        try {
          await IOCEnrichmentService.enrichIOC(tenantId, {
            iocValue: ioc.iocValue,
            iocType: ioc.iocType,
            source: 'Auto-refresh (decay)'
          });

          refreshed++;
          
          // Rate limiting
          await this.sleep(1000);
        } catch (error) {
          errors++;
        }
      }

      logger.info(`Auto-refresh completed: ${refreshed} refreshed, ${errors} errors`);

      return { refreshed, errors };
    } catch (error: any) {
      logger.error('Auto-refresh error:', error.message);
      throw error;
    }
  }

  /**
   * Sleep helper
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




