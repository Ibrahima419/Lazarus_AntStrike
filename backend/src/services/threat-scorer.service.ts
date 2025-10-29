/**
 * 🎯 THREAT SCORER
 * Calcule le threat score et relevance score pour prioriser les menaces
 * Score 0-100: Plus élevé = Plus critique/pertinent
 */

import { logger } from '../utils/logger';

export class ThreatScorer {
  /**
   * Calculer score complet d'un threat
   */
  static async score(threat: any): Promise<any> {
    logger.debug('Scoring threat', {
      title: threat.title,
      source: threat.source
    });
    
    // 1. Threat Score (0-100) - Criticité objective
    threat.threatScore = this.calculateThreatScore(threat);
    
    // 2. Relevance Score (0-100) - Pertinence pour client
    threat.relevanceScore = this.calculateRelevanceScore(threat);
    
    // 3. Combined Score (moyenne pondérée)
    threat.combinedScore = Math.round(
      (threat.threatScore * 0.6) + (threat.relevanceScore * 0.4)
    );
    
    logger.debug('Threat scored', {
      threatScore: threat.threatScore,
      relevanceScore: threat.relevanceScore,
      combined: threat.combinedScore
    });
    
    return threat;
  }
  
  /**
   * Calculer Threat Score (criticité objective)
   */
  private static calculateThreatScore(threat: any): number {
    let score = 0;
    
    // 1. SÉVÉRITÉ (0-30 points)
    const severityPoints = {
      'critical': 30,
      'high': 25,
      'medium': 15,
      'low': 5
    };
    score += severityPoints[threat.severity as keyof typeof severityPoints] || 10;
    
    // 2. TYPE DE MENACE (0-20 points)
    const typePoints = {
      'ransomware': 20,
      'zero-day': 20,
      'apt': 18,
      'data-breach': 15,
      'malware': 12,
      'phishing': 10,
      'vulnerability': 8
    };
    score += typePoints[threat.type as keyof typeof typePoints] || 5;
    
    // 3. CONFIDENCE (0-15 points)
    score += (threat.confidence / 100) * 15;
    
    // 4. NOMBRE D'IOCs (0-15 points)
    const iocCount = threat.iocs?.length || 0;
    if (iocCount > 10) score += 15;
      else if (iocCount > 5) score += 12;
    else if (iocCount > 0) score += 8;
    
    // 5. SOURCE FIABILITÉ (0-10 points)
    const sourceReliability = {
      'MISP': 10,
      'Taranis': 9,
      'STIX': 9,
      'CVE': 10,
      'OSINT Feed': 6
    };
    score += sourceReliability[threat.source as keyof typeof sourceReliability] || 5;
    
    // 6. KEYWORDS CRITIQUES (+10 points)
    const criticalKeywords = [
      'zero-day', '0-day', 'active exploit', 
      'ransomware', 'breach', 'compromised'
    ];
    const text = `${threat.title} ${threat.description || ''}`.toLowerCase();
    if (criticalKeywords.some(k => text.includes(k))) {
      score += 10;
    }
    
    // 7. FRAÎCHEUR (0-10 points)
    if (threat.publishedAt) {
      const ageInHours = (Date.now() - new Date(threat.publishedAt).getTime()) / (1000 * 3600);
      if (ageInHours < 6) score += 10;       // < 6h = très frais
      else if (ageInHours < 24) score += 7;  // < 24h = frais
      else if (ageInHours < 72) score += 4;  // < 3j = récent
    }
    
    return Math.min(Math.round(score), 100);
  }
  
  /**
   * Calculer Relevance Score (pertinence pour client)
   */
  private static calculateRelevanceScore(threat: any): number {
    let score = 50; // Base
    
    // 1. SECTEUR D'ACTIVITÉ
    // TODO: À implémenter avec profil client
    // Si le threat cible le secteur du client → +20 points
    
    // 2. TECHNOLOGIES UTILISÉES
    // TODO: À implémenter avec stack tech client
    // Si IOCs correspondent aux techs du client → +20 points
    
    // 3. GÉOGRAPHIE
    // TODO: À implémenter avec localisation client
    // Si threat cible la région du client → +15 points
    
    // 4. TAGS CORRESPONDANTS
    // Pour l'instant, simple: si >3 tags → +10
    if (threat.tags && threat.tags.length > 3) {
      score += 10;
    }
    
    // 5. ACTIFS AFFECTÉS
    // TODO: À implémenter avec asset management
    // Si threat affecte assets du client → +20 points
    
    return Math.min(Math.round(score), 100);
  }
  
  /**
   * Calculer priorité d'action (P1-P4)
   */
  static calculatePriority(threat: any): string {
    const combined = threat.combinedScore || threat.threatScore || 0;
    
    if (combined >= 80) return 'P1'; // Critique
    if (combined >= 60) return 'P2'; // Haute
    if (combined >= 40) return 'P3'; // Moyenne
    return 'P4'; // Basse
  }
  
  /**
   * Déterminer si alerte automatique nécessaire
   */
  static shouldAlert(threat: any): boolean {
    // Alerter si score > 70 ou keywords critiques
    if (threat.threatScore >= 70) return true;
    
    const text = `${threat.title} ${threat.description || ''}`.toLowerCase();
    const alertKeywords = ['zero-day', '0-day', 'ransomware', 'active exploit'];
    
    return alertKeywords.some(k => text.includes(k));
  }
  
  /**
   * Calculer SLA basé sur priorité
   */
  static calculateSLA(priority: string): { responseTime: number; resolutionTime: number } {
    const slaMap: Record<string, { responseTime: number; resolutionTime: number }> = {
      'P1': { responseTime: 15, resolutionTime: 240 },     // 15min / 4h
      'P2': { responseTime: 60, resolutionTime: 1440 },    // 1h / 24h
      'P3': { responseTime: 240, resolutionTime: 4320 },   // 4h / 72h
      'P4': { responseTime: 1440, resolutionTime: 10080 }  // 24h / 7j
    };
    
    return slaMap[priority] || slaMap['P3'];
  }
}



