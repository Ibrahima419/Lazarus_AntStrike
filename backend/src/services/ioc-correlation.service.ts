/**
 * 🔗 IOC Correlation Service
 * Corrélation multi-sources et détection IOCs reliés
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface CorrelationResult {
  ioc: { value: string; type: string };
  sources: SourceMatch[];
  relatedIOCs: RelatedIOC[];
  confidence: number;
  verdict: string;
  correlationScore: number;
}

interface SourceMatch {
  type: string;
  count?: number;
  confidence: number;
  data?: any;
}

interface RelatedIOC {
  value: string;
  type: string;
  relationship: string;
  confidence: number;
}

export class IOCCorrelationService {
  /**
   * Corréler IOC à travers toutes les sources
   */
  static async correlateIOC(
    tenantId: string,
    iocValue: string,
    iocType: string
  ): Promise<CorrelationResult> {
    try {
      logger.info(`Correlating IOC: ${iocValue} (${iocType})`);

      const correlation: CorrelationResult = {
        ioc: { value: iocValue, type: iocType },
        sources: [],
        relatedIOCs: [],
        confidence: 0,
        verdict: 'unknown',
        correlationScore: 0
      };

      // 1. Enrichissement primaire
      const primary = await prisma.iOCHistory.findFirst({
        where: { tenantId, iocValue, iocType }
      });

      if (primary) {
        correlation.sources.push({
          type: 'primary_enrichment',
          confidence: 90,
          data: primary.enrichmentData
        });
      }

      // 2. MISP events
      const mispCount = await this.findInMISP(tenantId, iocValue);
      if (mispCount > 0) {
        correlation.sources.push({
          type: 'misp',
          count: mispCount,
          confidence: 85
        });
      }

      // 3. OSINT Feeds
      const osintCount = await this.findInOSINT(tenantId, iocValue);
      if (osintCount > 0) {
        correlation.sources.push({
          type: 'osint_feeds',
          count: osintCount,
          confidence: 70
        });
      }

      // 4. Dark Web mentions
      const darkwebCount = await this.findInDarkWeb(tenantId, iocValue);
      if (darkwebCount > 0) {
        correlation.sources.push({
          type: 'darkweb',
          count: darkwebCount,
          confidence: 60
        });
      }

      // 5. Honeypot logs
      const honeypotCount = await this.findInHoneypots(tenantId, iocValue);
      if (honeypotCount > 0) {
        correlation.sources.push({
          type: 'honeypot',
          count: honeypotCount,
          confidence: 95
        });
      }

      // 6. Historical data
      const historyCount = await this.findInHistory(tenantId, iocValue, iocType);
      if (historyCount > 0) {
        correlation.sources.push({
          type: 'historical',
          count: historyCount,
          confidence: 80
        });
      }

      // 7. IOCs reliés
      correlation.relatedIOCs = await this.findRelatedIOCs(tenantId, iocValue);

      // Calculer confidence et verdict
      correlation.confidence = this.calculateCorrelationConfidence(correlation.sources);
      correlation.correlationScore = this.calculateCorrelationScore(correlation);
      correlation.verdict = this.determineVerdict(correlation);

      logger.info(`Correlation completed: ${correlation.sources.length} sources, ${correlation.relatedIOCs.length} related IOCs`);

      return correlation;
    } catch (error: any) {
      logger.error('Correlation error:', error.message);
      throw error;
    }
  }

  /**
   * Trouver IOCs reliés (même alerte, même case)
   */
  static async findRelatedIOCs(
    tenantId: string,
    iocValue: string
  ): Promise<RelatedIOC[]> {
    const related: RelatedIOC[] = [];

    try {
      // Chercher dans les alertes
      const alerts = await prisma.alert.findMany({
        where: {
          tenantId,
          // Recherche dans raw JSON
          OR: [
            { title: { contains: iocValue, mode: 'insensitive' } },
            { description: { contains: iocValue, mode: 'insensitive' } }
          ]
        },
        select: { raw: true }
      });

      const relatedIOCsSet = new Set<string>();
      alerts.forEach(alert => {
        const alertIOCs = (alert.raw as any)?.iocs || [];
        alertIOCs.forEach((ioc: any) => {
          if (ioc !== iocValue) relatedIOCsSet.add(ioc);
        });
      });

      // Convertir en RelatedIOC
      for (const relatedValue of Array.from(relatedIOCsSet).slice(0, 20)) {
        // Détecter type
        const type = this.detectIOCType(relatedValue);
        
        related.push({
          value: relatedValue,
          type,
          relationship: 'same_alert',
          confidence: 75
        });
      }

      // Chercher dans les cases
      const cases = await prisma.case.findMany({
        where: {
          tenantId,
          description: {
            contains: iocValue
          }
        },
        select: { id: true }
      });

      if (cases.length > 0) {
        // IOCs dans les mêmes cases = haute confidence
        related.forEach(r => {
          if (r.relationship === 'same_alert') {
            r.confidence = 85;
            r.relationship = 'same_case';
          }
        });
      }

    } catch (error) {
      logger.warn('Error finding related IOCs:', error);
    }

    return related;
  }

  /**
   * Calculer bulk correlation
   */
  static async bulkCorrelate(
    tenantId: string,
    iocs: Array<{ value: string; type: string }>
  ): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const ioc of iocs.slice(0, 50)) { // Max 50
      try {
        const correlation = await this.correlateIOC(tenantId, ioc.value, ioc.type);
        results.push(correlation);
        
        // Rate limiting
        await this.sleep(100);
      } catch (error) {
        logger.warn(`Failed to correlate ${ioc.value}:`, error);
      }
    }

    return results;
  }

  // ========== Helpers ==========

  /**
   * Trouver dans MISP
   */
  private static async findInMISP(tenantId: string, iocValue: string): Promise<number> {
    try {
      return await prisma.iOCHistory.count({
        where: {
          tenantId,
          iocValue,
          source: { contains: 'MISP' }
        }
      });
    } catch (error) {
      return 0;
    }
  }

  /**
   * Trouver dans OSINT
   */
  private static async findInOSINT(tenantId: string, iocValue: string): Promise<number> {
    try {
      return await prisma.iOCHistory.count({
        where: {
          tenantId,
          iocValue,
          source: { startsWith: 'OSINT Feed:' }
        }
      });
    } catch (error) {
      return 0;
    }
  }

  /**
   * Trouver dans Dark Web
   */
  private static async findInDarkWeb(tenantId: string, iocValue: string): Promise<number> {
    try {
      // TODO: Table auditLog n'existe pas
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Trouver dans Honeypots
   */
  private static async findInHoneypots(tenantId: string, iocValue: string): Promise<number> {
    try {
      return await prisma.iOCHistory.count({
        where: {
          tenantId,
          iocValue,
          source: 'Honeypot'
        }
      });
    } catch (error) {
      return 0;
    }
  }

  /**
   * Trouver dans historique
   */
  private static async findInHistory(
    tenantId: string,
    iocValue: string,
    iocType: string
  ): Promise<number> {
    try {
      return await prisma.iOCHistory.count({
        where: {
          tenantId,
          iocValue,
          iocType
        }
      });
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculer confidence de corrélation
   */
  private static calculateCorrelationConfidence(sources: SourceMatch[]): number {
    if (sources.length === 0) return 0;
    
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length;
    const sourceBonus = Math.min(sources.length * 5, 25);
    
    return Math.min(Math.round(avgConfidence + sourceBonus), 100);
  }

  /**
   * Calculer correlation score
   */
  private static calculateCorrelationScore(correlation: CorrelationResult): number {
    let score = 0;

    // Nombre de sources
    score += Math.min(correlation.sources.length * 15, 60);

    // Sources premium
    const premiumSources = ['honeypot', 'misp', 'primary_enrichment'];
    const premiumCount = correlation.sources.filter(s => 
      premiumSources.includes(s.type)
    ).length;
    score += premiumCount * 10;

    // IOCs reliés
    score += Math.min(correlation.relatedIOCs.length * 2, 20);

    return Math.min(score, 100);
  }

  /**
   * Déterminer verdict
   */
  private static determineVerdict(correlation: CorrelationResult): string {
    const sourceCount = correlation.sources.length;
    const confidence = correlation.confidence;
    const score = correlation.correlationScore;

    if (sourceCount >= 4 && confidence >= 85 && score >= 80) {
      return 'confirmed_malicious';
    }
    if (sourceCount >= 3 && confidence >= 75 && score >= 60) {
      return 'likely_malicious';
    }
    if (sourceCount >= 2 && confidence >= 60 && score >= 40) {
      return 'suspicious';
    }
    if (sourceCount >= 1 && score >= 30) {
      return 'potentially_malicious';
    }
    if (sourceCount === 0) {
      return 'insufficient_data';
    }
    
    return 'unknown';
  }

  /**
   * Détecter type IOC
   */
  private static detectIOCType(value: string): string {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return 'IP';
    if (value.startsWith('http')) return 'URL';
    if (/^[a-f0-9]{32,64}$/i.test(value)) return 'FILE_HASH';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'EMAIL';
    if (/^CVE-\d{4}-\d{4,}$/i.test(value)) return 'CVE';
    if (/^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i.test(value)) return 'DOMAIN';
    return 'UNKNOWN';
  }

  /**
   * Sleep helper
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




