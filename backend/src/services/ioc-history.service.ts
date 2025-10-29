/**
 * 📈 IOC History Service
 * Tracking historique et tendances des IOCs
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export class IOCHistoryService {
  /**
   * Enregistrer snapshot historique
   */
  static async recordSnapshot(ioc: any): Promise<void> {
    try {
      const enrichData = ioc.enrichmentData || {};
      const threatScore = this.extractThreatScore(enrichData);
      const reputation = this.extractReputation(enrichData);

      await prisma.iOCHistory.create({
        data: {
          tenantId: ioc.tenantId,
          iocValue: ioc.iocValue,
          iocType: ioc.iocType,
          enrichmentData: enrichData,
          threatScore,
          reputation,
          source: ioc.source || 'auto-snapshot'
        }
      });

      logger.info(`Snapshot recorded for IOC ${ioc.iocValue}`);
    } catch (error: any) {
      logger.warn('Failed to record IOC snapshot:', error.message);
    }
  }

  /**
   * Obtenir historique d'un IOC
   */
  static async getHistory(
    tenantId: string,
    iocValue: string,
    iocType: string,
    days: number = 90
  ): Promise<any[]> {
    const history = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        iocValue,
        iocType,
        observedAt: {
          gte: new Date(Date.now() - days * 86400000)
        }
      },
      orderBy: { observedAt: 'desc' }
    });

    return history;
  }

  /**
   * Analyser tendance
   */
  static analyzeTrend(history: any[]): any {
    if (history.length === 0) {
      return {
        current: 0,
        previous: 0,
        trend: 'no_data',
        min: 0,
        max: 0,
        avg: 0,
        volatility: 0,
        dataPoints: 0
      };
    }

    const scores = history.map(h => h.threatScore);
    
    const trend = {
      current: scores[0] || 0,
      previous: scores[1] || 0,
      trend: 'stable' as string,
      min: Math.min(...scores),
      max: Math.max(...scores),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      volatility: this.calculateVolatility(scores),
      dataPoints: scores.length
    };

    // Déterminer tendance
    if (trend.current > trend.previous + 10) {
      trend.trend = 'increasing';
    } else if (trend.current < trend.previous - 10) {
      trend.trend = 'decreasing';
    } else {
      trend.trend = 'stable';
    }

    return trend;
  }

  /**
   * Calculer volatilité
   */
  private static calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => 
      sum + Math.pow(score - avg, 2), 0
    ) / scores.length;
    
    return Math.round(Math.sqrt(variance));
  }

  /**
   * Détecter changements significatifs
   */
  static async detectChanges(
    tenantId: string,
    iocValue: string,
    iocType: string,
    days: number = 30
  ): Promise<any[]> {
    const history = await this.getHistory(tenantId, iocValue, iocType, days);
    
    if (history.length < 2) return [];

    const changes: any[] = [];

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const previous = history[i + 1];

      // Changement de réputation
      if (current.reputation !== previous.reputation) {
        changes.push({
          type: 'reputation_change',
          from: previous.reputation,
          to: current.reputation,
          timestamp: current.observedAt,
          severity: this.getChangeSeverity(previous.reputation, current.reputation)
        });
      }

      // Augmentation threat score significative (>20 points)
      if (current.threatScore - previous.threatScore > 20) {
        changes.push({
          type: 'threat_score_spike',
          from: previous.threatScore,
          to: current.threatScore,
          delta: current.threatScore - previous.threatScore,
          timestamp: current.observedAt,
          severity: current.threatScore > 80 ? 'critical' : 'high'
        });
      }

      // Diminution significative (IOC cleaning up)
      if (previous.threatScore - current.threatScore > 20) {
        changes.push({
          type: 'threat_score_drop',
          from: previous.threatScore,
          to: current.threatScore,
          delta: previous.threatScore - current.threatScore,
          timestamp: current.observedAt,
          severity: 'info'
        });
      }
    }

    return changes;
  }

  /**
   * Obtenir changements récents pour un tenant
   */
  static async getRecentChanges(
    tenantId: string,
    days: number = 7,
    limit: number = 50
  ): Promise<any[]> {
    // Récupérer IOCs uniques
    const recentHistory = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        observedAt: {
          gte: new Date(Date.now() - days * 86400000)
        }
      },
      orderBy: { observedAt: 'desc' },
      take: limit * 2 // Plus pour détecter changements
    });

    // Grouper par IOC
    const byIOC = new Map<string, any[]>();
    
    recentHistory.forEach(h => {
      const key = `${h.iocValue}:${h.iocType}`;
      if (!byIOC.has(key)) {
        byIOC.set(key, []);
      }
      byIOC.get(key)!.push(h);
    });

    // Détecter changements pour chaque IOC
    const allChanges: any[] = [];

    for (const [key, history] of byIOC.entries()) {
      if (history.length < 2) continue;

      const [iocValue, iocType] = key.split(':');
      const changes = await this.detectChanges(tenantId, iocValue, iocType, days);
      
      changes.forEach(change => {
        allChanges.push({
          ...change,
          iocValue,
          iocType
        });
      });
    }

    // Trier par sévérité et date
    const severityOrder: Record<string, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4,
      'info': 5
    };

    allChanges.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return allChanges.slice(0, limit);
  }

  /**
   * Obtenir statistiques historiques
   */
  static async getStats(tenantId: string): Promise<any> {
    const totalSnapshots = await prisma.iOCHistory.count({
      where: { tenantId }
    });

    const recentSnapshots = await prisma.iOCHistory.count({
      where: {
        tenantId,
        observedAt: {
          gte: new Date(Date.now() - 7 * 86400000)
        }
      }
    });

    // IOCs trackés
    const trackedIOCs = await prisma.iOCHistory.groupBy({
      by: ['iocValue', 'iocType'],
      where: { tenantId },
      _count: true
    });

    return {
      totalSnapshots,
      recentSnapshots,
      trackedIOCs: trackedIOCs.length,
      avgSnapshotsPerIOC: trackedIOCs.length > 0 
        ? totalSnapshots / trackedIOCs.length 
        : 0
    };
  }

  // ========== Helpers ==========

  /**
   * Extraire threat score
   */
  private static extractThreatScore(enrichData: any): number {
    // IP
    if (enrichData.ipData?.abuseScore) {
      return enrichData.ipData.abuseScore;
    }

    // File
    if (enrichData.fileData?.detections && enrichData.fileData?.totalEngines) {
      return Math.round((enrichData.fileData.detections / enrichData.fileData.totalEngines) * 100);
    }

    // Domain
    if (enrichData.domainData?.malicious) {
      return 90;
    }

    // URL
    if (enrichData.urlData?.malicious) {
      return 85;
    }

    // Email
    if (enrichData.emailData?.threatScore) {
      return enrichData.emailData.threatScore;
    }

    return 0;
  }

  /**
   * Extraire réputation
   */
  private static extractReputation(enrichData: any): string {
    // Email
    if (enrichData.emailData?.reputation) {
      return enrichData.emailData.reputation;
    }

    // IP
    if (enrichData.ipData?.reputation) {
      return enrichData.ipData.reputation;
    }

    // File
    if (enrichData.fileData?.malicious) {
      return 'malicious';
    }

    // Domain
    if (enrichData.domainData?.malicious) {
      return 'malicious';
    }

    return 'unknown';
  }

  /**
   * Sévérité du changement
   */
  private static getChangeSeverity(fromRep: string, toRep: string): string {
    const repLevels: Record<string, number> = {
      'clean': 1,
      'low-risk': 2,
      'questionable': 3,
      'suspicious': 4,
      'malicious': 5
    };

    const fromLevel = repLevels[fromRep] || 0;
    const toLevel = repLevels[toRep] || 0;
    const delta = toLevel - fromLevel;

    if (delta >= 3) return 'critical';
    if (delta >= 2) return 'high';
    if (delta >= 1) return 'medium';
    if (delta <= -2) return 'info';
    return 'low';
  }
}




