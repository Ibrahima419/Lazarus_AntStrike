/**
 * 🎯 Advanced Threat Scoring Service
 * Calcul de score de menace multi-sources avec pondération
 */

import { logger } from '../utils/logger';

export class ThreatScoringService {
  /**
   * Calculer score de menace global (0-100)
   * Pondération multi-sources
   */
  static calculateThreatScore(ioc: any, enrichmentData: any): number {
    let score = 0;
    
    // Poids par source (total = 1.0)
    const weights = {
      virusTotal: 0.25,      // 25%
      abuseIPDB: 0.25,       // 25%
      ipInfo: 0.05,          // 5%
      email: 0.15,           // 15%
      misp: 0.10,            // 10%
      osintFeeds: 0.08,      // 8%
      honeypot: 0.07,        // 7%
      darkweb: 0.05          // 5%
    };

    // VirusTotal (Hash, Domain, URL)
    if (enrichmentData.fileData?.detections && enrichmentData.fileData?.totalEngines) {
      const detectionRate = enrichmentData.fileData.detections / enrichmentData.fileData.totalEngines;
      score += detectionRate * 100 * weights.virusTotal;
    }

    if (enrichmentData.domainData?.malicious) {
      score += 100 * weights.virusTotal;
    } else if (enrichmentData.domainData?.suspicious) {
      score += 60 * weights.virusTotal;
    }

    if (enrichmentData.urlData?.malicious) {
      score += 100 * weights.virusTotal;
    } else if (enrichmentData.urlData?.suspicious) {
      score += 60 * weights.virusTotal;
    }

    // AbuseIPDB
    if (enrichmentData.ipData?.abuseScore !== undefined) {
      score += enrichmentData.ipData.abuseScore * weights.abuseIPDB;
    }

    // IPInfo (géo-risque)
    if (enrichmentData.ipData?.country) {
      const riskyCountries = ['CN', 'RU', 'KP', 'IR', 'BY'];
      const highRiskCountries = ['KP', 'IR']; // Corée du Nord, Iran
      
      if (highRiskCountries.includes(enrichmentData.ipData.country)) {
        score += 80 * weights.ipInfo;
      } else if (riskyCountries.includes(enrichmentData.ipData.country)) {
        score += 40 * weights.ipInfo;
      }
    }

    // Email
    if (enrichmentData.emailData?.threatScore !== undefined) {
      score += enrichmentData.emailData.threatScore * weights.email;
    }

    // MISP
    if (enrichmentData.misp?.eventId) {
      score += 70 * weights.misp; // Présence MISP = haute confidence
    }

    // OSINT Feeds
    if (ioc.source?.startsWith('OSINT Feed:')) {
      score += 50 * weights.osintFeeds;
    }
    if (enrichmentData.feed) {
      score += 45 * weights.osintFeeds;
    }

    // Honeypot
    if (enrichmentData.honeypot?.attackCount) {
      const attacks = Math.min(enrichmentData.honeypot.attackCount, 100);
      score += attacks * weights.honeypot;
    }

    // Dark Web
    if (enrichmentData.darkweb?.mentioned) {
      score += 60 * weights.darkweb;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculer niveau de confiance (0-100)
   */
  static calculateConfidence(enrichmentData: any): number {
    let confidence = 30; // Base

    const sources = enrichmentData.sources || [];
    
    // +12 par source fiable
    confidence += Math.min(sources.length * 12, 60);

    // Sources premium (plus fiables)
    const premiumSources = ['VirusTotal', 'AbuseIPDB', 'HaveIBeenPwned', 'MISP'];
    const premiumCount = sources.filter((s: string) => 
      premiumSources.some(ps => s.includes(ps))
    ).length;
    confidence += premiumCount * 5;

    // Données récentes
    if (enrichmentData.timestamp) {
      const hoursSince = (Date.now() - new Date(enrichmentData.timestamp).getTime()) / 3600000;
      if (hoursSince < 24) confidence += 15;
      else if (hoursSince < 168) confidence += 10; // 7 jours
      else if (hoursSince < 720) confidence += 5; // 30 jours
    }

    // MISP boost
    if (enrichmentData.misp) confidence += 15;

    // Honeypot boost (données propriétaires = haute confidence)
    if (enrichmentData.honeypot) confidence += 20;

    // Multiples détections
    if (enrichmentData.fileData?.detections > 5) confidence += 10;
    if (enrichmentData.ipData?.totalReports > 10) confidence += 10;

    return Math.min(confidence, 100);
  }

  /**
   * Déterminer réputation finale
   */
  static determineReputation(score: number, confidence: number): string {
    // Confidence trop basse
    if (confidence < 40) return 'unknown';
    
    // Score-based reputation
    if (score >= 80 && confidence >= 70) return 'malicious';
    if (score >= 60 && confidence >= 60) return 'suspicious';
    if (score >= 40 && confidence >= 50) return 'questionable';
    if (score >= 20) return 'low-risk';
    if (score < 20 && confidence >= 70) return 'clean';
    
    return 'unknown';
  }

  /**
   * Calculer priorité d'action
   */
  static calculatePriority(score: number, confidence: number): string {
    if (score >= 80 && confidence >= 70) return 'P0'; // Critical
    if (score >= 60 && confidence >= 60) return 'P1'; // High
    if (score >= 40 && confidence >= 50) return 'P2'; // Medium
    return 'P3'; // Low
  }

  /**
   * Générer recommandations
   */
  static generateRecommendations(
    iocType: string,
    score: number,
    enrichmentData: any
  ): string[] {
    const recommendations: string[] = [];

    // Recommandations par score
    if (score >= 80) {
      recommendations.push('🔴 URGENT: Block immediately at firewall/proxy');
      recommendations.push('Investigate all related IOCs and connections');
      recommendations.push('Create incident response case');
      recommendations.push('Notify SOC team immediately');
    } else if (score >= 60) {
      recommendations.push('⚠️ HIGH: Add to watchlist and monitor');
      recommendations.push('Review logs for any interaction');
      recommendations.push('Consider temporary blocking');
    } else if (score >= 40) {
      recommendations.push('⚡ MEDIUM: Monitor for suspicious activity');
      recommendations.push('Log all interactions');
    } else {
      recommendations.push('ℹ️ LOW: Track for future reference');
    }

    // Recommandations spécifiques par type
    switch (iocType) {
      case 'IP':
        if (score >= 60) {
          recommendations.push('Block IP at network perimeter');
          recommendations.push('Check firewall logs for this IP');
        }
        if (enrichmentData.ipData?.country) {
          recommendations.push(`Geographic origin: ${enrichmentData.ipData.country}`);
        }
        break;

      case 'FILE_HASH':
        if (score >= 60) {
          recommendations.push('Quarantine file if found');
          recommendations.push('Scan all systems for this hash');
          recommendations.push('Update antivirus signatures');
        }
        break;

      case 'DOMAIN':
      case 'URL':
        if (score >= 60) {
          recommendations.push('Block domain in DNS/Web filter');
          recommendations.push('Check web proxy logs');
        }
        break;

      case 'EMAIL':
        if (enrichmentData.emailData?.breached) {
          recommendations.push(`⚠️ Found in ${enrichmentData.emailData.breachCount} data breaches`);
          recommendations.push('Force password reset');
          recommendations.push('Enable MFA if not already');
        }
        if (enrichmentData.emailData?.disposable) {
          recommendations.push('Block disposable email domains');
        }
        break;
    }

    // Recommandations sources
    if (enrichmentData.honeypot) {
      recommendations.push('📌 Detected in honeypot - confirmed malicious behavior');
    }

    if (enrichmentData.darkweb) {
      recommendations.push('🕵️ Mentioned in Dark Web - investigate data leaks');
    }

    if (enrichmentData.misp) {
      recommendations.push('🔗 Shared in MISP community - coordinate response');
    }

    return recommendations;
  }

  /**
   * Recalculer tous les scores d'un tenant
   */
  static async recalculateAllScores(tenantId: string): Promise<{ updated: number }> {
    try {
      logger.info(`Recalculating threat scores for tenant ${tenantId}`);

      const { prisma } = await import('../config/database');

      const iocs = await prisma.iOCHistory.findMany({
        where: { tenantId }
      });

      let updated = 0;

      for (const ioc of iocs) {
        const enrichData = ioc.enrichmentData as any;
        
        const newScore = this.calculateThreatScore(ioc, enrichData);
        const newConfidence = this.calculateConfidence(enrichData);
        const newReputation = this.determineReputation(newScore, newConfidence);

        // Mettre à jour si changement
        if (
          enrichData.threatScore !== newScore ||
          enrichData.confidence !== newConfidence ||
          enrichData.reputation !== newReputation
        ) {
          enrichData.threatScore = newScore;
          enrichData.confidence = newConfidence;
          enrichData.reputation = newReputation;

          await prisma.iOCHistory.update({
            where: { id: ioc.id },
            data: { enrichmentData: enrichData }
          });

          updated++;
        }
      }

      logger.info(`Threat scores recalculated: ${updated} IOCs updated`);

      return { updated };
    } catch (error: any) {
      logger.error('Error recalculating scores:', error.message);
      throw error;
    }
  }

  /**
   * Statistiques par réputation
   */
  static async getReputationStats(tenantId: string): Promise<any> {
    const { prisma } = await import('../config/database');

    const iocs = await prisma.iOCHistory.findMany({
      where: { tenantId }
    });

    const stats: Record<string, number> = {
      malicious: 0,
      suspicious: 0,
      questionable: 0,
      'low-risk': 0,
      clean: 0,
      unknown: 0
    };

    iocs.forEach((ioc: any) => {
      const enrichData = ioc.enrichmentData as any;
      const reputation = enrichData.reputation || 'unknown';
      stats[reputation] = (stats[reputation] || 0) + 1;
    });

    return {
      total: iocs.length,
      byReputation: stats,
      percentages: Object.keys(stats).reduce((acc: any, key) => {
        acc[key] = iocs.length > 0 ? Math.round((stats[key] / iocs.length) * 100) : 0;
        return acc;
      }, {})
    };
  }
}




