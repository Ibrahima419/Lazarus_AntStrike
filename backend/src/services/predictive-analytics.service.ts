/**
 * 🤖 Predictive Analytics Service
 * Machine Learning pour prédiction des menaces CTI
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface ThreatPrediction {
  threatId: string;
  threatType: string;
  predictedSeverity: string;
  confidence: number;
  factors: string[];
  recommendation: string;
}

interface CampaignEvolutionPrediction {
  campaignId: string;
  currentStatus: string;
  predictedNextPhase: string;
  probability: number;
  timeframe: string;
  indicators: string[];
}

interface TTPPrediction {
  nextTTP: string;
  probability: number;
  basedOn: string[];
  relatedCampaigns: string[];
}

interface AnomalyDetection {
  entityId: string;
  entityType: string;
  anomalyType: string;
  anomalyScore: number;
  baseline: any;
  current: any;
  deviation: number;
}

export class PredictiveAnalyticsService {
  /**
   * Prédire la sévérité d'une menace
   */
  static async predictThreatSeverity(
    tenantId: string,
    threatId: string
  ): Promise<ThreatPrediction> {
    try {
      logger.info(`Predicting threat severity for: ${threatId}`);

      const threat = await prisma.threat.findFirst({
        where: { id: threatId, tenantId }
      });

      if (!threat) {
        throw new Error('Threat not found');
      }

      // Features extraction
      const features = await this.extractThreatFeatures(tenantId, threat);

      // Simple ML model (règles + scoring)
      const prediction = this.mlPredictSeverity(features);

      return {
        threatId,
        threatType: threat.type,
        predictedSeverity: prediction.severity,
        confidence: prediction.confidence,
        factors: prediction.factors,
        recommendation: this.generateRecommendation(prediction.severity, prediction.factors)
      };
    } catch (error: any) {
      logger.error('Error predicting threat severity:', error.message);
      throw error;
    }
  }

  /**
   * Extraire features d'une menace
   */
  private static async extractThreatFeatures(
    tenantId: string,
    threat: any
  ): Promise<any> {
    const iocs = (threat.iocs as any[]) || [];
    const tactics = (threat.mitreTactics as any[]) || [];

    // Chercher campagnes similaires
    const similarCampaigns = await prisma.campaign.findMany({
      where: {
        tenantId,
        iocs: { not: { equals: [] } }
      },
      take: 10
    });

    // Compter overlaps IOCs
    let totalOverlap = 0;
    let highSeverityOverlap = 0;

    similarCampaigns.forEach(campaign => {
      const campIOCs = (campaign.iocs as string[]) || [];
      const overlap = iocs.filter(ioc => campIOCs.includes(ioc)).length;
      totalOverlap += overlap;
      
      if (campaign.confidence >= 70) {
        highSeverityOverlap += overlap;
      }
    });

    return {
      iocCount: iocs.length,
      tacticCount: tactics.length,
      currentSeverity: threat.severity,
      currentConfidence: threat.confidence,
      type: threat.type,
      similarCampaignCount: similarCampaigns.length,
      totalIOCOverlap: totalOverlap,
      highSeverityOverlap,
      hasKnownTactics: tactics.length > 0,
      status: threat.status
    };
  }

  /**
   * Modèle ML simple (règles + scoring)
   */
  private static mlPredictSeverity(features: any): {
    severity: string;
    confidence: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Feature 1: IOC count
    if (features.iocCount > 10) {
      score += 30;
      factors.push(`Nombreux IOCs (${features.iocCount})`);
    } else if (features.iocCount > 5) {
      score += 20;
      factors.push(`IOCs significatifs (${features.iocCount})`);
    } else if (features.iocCount > 0) {
      score += 10;
    }

    // Feature 2: Tactics
    if (features.tacticCount > 5) {
      score += 25;
      factors.push(`TTPs avancés (${features.tacticCount} tactics)`);
    } else if (features.tacticCount > 2) {
      score += 15;
      factors.push(`TTPs multiples (${features.tacticCount} tactics)`);
    }

    // Feature 3: Similarité campagnes
    if (features.highSeverityOverlap > 0) {
      score += 20;
      factors.push('Similarité avec campagnes critiques');
    } else if (features.totalIOCOverlap > 0) {
      score += 10;
      factors.push('Similarité avec campagnes connues');
    }

    // Feature 4: Type de menace
    const highRiskTypes = ['ransomware', 'apt', 'trojan', 'backdoor'];
    if (highRiskTypes.includes(features.type.toLowerCase())) {
      score += 15;
      factors.push(`Type à haut risque (${features.type})`);
    }

    // Feature 5: Confidence actuelle
    if (features.currentConfidence >= 80) {
      score += 10;
      factors.push('Haute confidence des sources');
    }

    // Déterminer sévérité
    let severity: string;
    let confidence: number;

    if (score >= 70) {
      severity = 'critical';
      confidence = Math.min(85 + (score - 70) / 2, 95);
    } else if (score >= 50) {
      severity = 'high';
      confidence = 70 + (score - 50);
    } else if (score >= 30) {
      severity = 'medium';
      confidence = 60 + (score - 30);
    } else {
      severity = 'low';
      confidence = 50 + score;
    }

    return {
      severity,
      confidence: Math.round(confidence),
      factors
    };
  }

  /**
   * Prédire évolution d'une campagne
   */
  static async predictCampaignEvolution(
    tenantId: string,
    campaignId: string
  ): Promise<CampaignEvolutionPrediction> {
    try {
      logger.info(`Predicting campaign evolution for: ${campaignId}`);

      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: { ttps: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Analyser phases Kill Chain actuelles
      const currentPhases = this.identifyKillChainPhases(campaign.ttps);
      const nextPhase = this.predictNextKillChainPhase(currentPhases);

      // Calculer probabilité
      const probability = this.calculateEvolutionProbability(campaign, currentPhases);

      // Estimer timeframe
      const timeframe = this.estimateTimeframe(campaign, nextPhase);

      // Identifier indicateurs
      const indicators = this.identifyEvolutionIndicators(campaign, nextPhase);

      return {
        campaignId,
        currentStatus: campaign.status,
        predictedNextPhase: nextPhase.name,
        probability,
        timeframe,
        indicators
      };
    } catch (error: any) {
      logger.error('Error predicting campaign evolution:', error.message);
      throw error;
    }
  }

  /**
   * Identifier phases Kill Chain actuelles
   */
  private static identifyKillChainPhases(ttps: any[]): Set<string> {
    const phases = new Set<string>();
    
    const tacticToPhase: Record<string, string> = {
      'Initial Access': 'Delivery',
      'Execution': 'Exploitation',
      'Persistence': 'Installation',
      'Privilege Escalation': 'Installation',
      'Defense Evasion': 'Installation',
      'Credential Access': 'Actions on Objectives',
      'Discovery': 'Actions on Objectives',
      'Lateral Movement': 'Actions on Objectives',
      'Collection': 'Actions on Objectives',
      'Command and Control': 'Command & Control',
      'Exfiltration': 'Actions on Objectives',
      'Impact': 'Actions on Objectives'
    };

    ttps.forEach(ttp => {
      const phase = tacticToPhase[ttp.tactic];
      if (phase) phases.add(phase);
    });

    return phases;
  }

  /**
   * Prédire prochaine phase Kill Chain
   */
  private static predictNextKillChainPhase(currentPhases: Set<string>): {
    name: string;
    description: string;
  } {
    const killChainOrder = [
      { name: 'Reconnaissance', desc: 'Collecte d\'informations sur la cible' },
      { name: 'Weaponization', desc: 'Création du payload malveillant' },
      { name: 'Delivery', desc: 'Livraison de la menace' },
      { name: 'Exploitation', desc: 'Exploitation des vulnérabilités' },
      { name: 'Installation', desc: 'Installation de malware/backdoor' },
      { name: 'Command & Control', desc: 'Établissement du C2' },
      { name: 'Actions on Objectives', desc: 'Exécution des objectifs finaux' }
    ];

    // Trouver phase la plus avancée
    let maxIndex = -1;
    killChainOrder.forEach((phase, index) => {
      if (currentPhases.has(phase.name)) {
        maxIndex = Math.max(maxIndex, index);
      }
    });

    // Prochaine phase
    const nextIndex = Math.min(maxIndex + 1, killChainOrder.length - 1);
    return {
      name: killChainOrder[nextIndex].name,
      description: killChainOrder[nextIndex].desc
    };
  }

  /**
   * Calculer probabilité d'évolution
   */
  private static calculateEvolutionProbability(
    campaign: any,
    currentPhases: Set<string>
  ): number {
    let probability = 50; // Base

    // Facteur 1: Status actif
    if (campaign.status === 'active') probability += 20;
    else if (campaign.status === 'dormant') probability -= 10;

    // Facteur 2: Activité récente
    const daysSinceLastSeen = Math.floor(
      (Date.now() - campaign.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastSeen <= 7) probability += 15;
    else if (daysSinceLastSeen <= 30) probability += 5;
    else probability -= 10;

    // Facteur 3: Phases déjà observées
    if (currentPhases.size >= 4) probability += 15;
    else if (currentPhases.size >= 2) probability += 10;

    // Facteur 4: Confidence
    if (campaign.confidence >= 80) probability += 10;

    return Math.max(10, Math.min(95, probability));
  }

  /**
   * Estimer timeframe d'évolution
   */
  private static estimateTimeframe(campaign: any, nextPhase: any): string {
    const daysSinceFirstSeen = Math.floor(
      (Date.now() - campaign.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (campaign.status === 'active') {
      if (daysSinceFirstSeen <= 7) return '24-48 heures';
      if (daysSinceFirstSeen <= 30) return '3-7 jours';
      return '1-2 semaines';
    }

    return '2-4 semaines';
  }

  /**
   * Identifier indicateurs d'évolution
   */
  private static identifyEvolutionIndicators(
    campaign: any,
    nextPhase: any
  ): string[] {
    const indicators: string[] = [];

    switch (nextPhase.name) {
      case 'Command & Control':
        indicators.push('Nouveaux domaines C2 observés');
        indicators.push('Trafic réseau suspect vers IPs connues');
        indicators.push('Beaconing patterns détectés');
        break;
      case 'Actions on Objectives':
        indicators.push('Mouvements latéraux dans le réseau');
        indicators.push('Accès aux données sensibles');
        indicators.push('Tentatives d\'exfiltration');
        break;
      case 'Installation':
        indicators.push('Nouveaux fichiers/processus suspects');
        indicators.push('Modifications du registre');
        indicators.push('Tâches planifiées créées');
        break;
      default:
        indicators.push('Activité réseau inhabituelle');
        indicators.push('Nouvelles connexions suspectes');
    }

    return indicators;
  }

  /**
   * Prédire prochain TTP
   */
  static async predictNextTTP(
    tenantId: string,
    campaignId: string
  ): Promise<TTPPrediction[]> {
    try {
      logger.info(`Predicting next TTPs for campaign: ${campaignId}`);

      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: { ttps: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Analyser TTPs actuels
      const currentTactics = new Set(campaign.ttps.map(t => t.tactic));
      const currentTechniques = new Set(campaign.ttps.map(t => t.techniqueId));

      // Chercher patterns dans autres campagnes
      const allCampaigns = await prisma.campaign.findMany({
        where: {
          tenantId,
          id: { not: campaignId }
        },
        include: { ttps: true },
        take: 50
      });

      // Analyser séquences TTP
      const ttpSequences = this.analyzeTPPSequences(allCampaigns, currentTechniques);

      // Top 5 prédictions
      const predictions = ttpSequences.slice(0, 5).map(seq => ({
        nextTTP: seq.ttp,
        probability: seq.probability,
        basedOn: seq.basedOn,
        relatedCampaigns: seq.campaigns
      }));

      return predictions;
    } catch (error: any) {
      logger.error('Error predicting next TTP:', error.message);
      throw error;
    }
  }

  /**
   * Analyser séquences TTP
   */
  private static analyzeTPPSequences(
    campaigns: any[],
    currentTechniques: Set<string>
  ): any[] {
    const ttpCounts = new Map<string, {
      count: number;
      basedOn: Set<string>;
      campaigns: Set<string>;
    }>();

    campaigns.forEach(campaign => {
      const campTechniques = campaign.ttps.map((t: any) => t.techniqueId);
      
      // Chercher overlap avec techniques actuelles
      const overlap = campTechniques.filter((t: string) => currentTechniques.has(t));
      
      if (overlap.length > 0) {
        // TTPs suivants dans cette campagne
        campTechniques.forEach((ttp: string) => {
          if (!currentTechniques.has(ttp)) {
            if (!ttpCounts.has(ttp)) {
              ttpCounts.set(ttp, {
                count: 0,
                basedOn: new Set(),
                campaigns: new Set()
              });
            }
            
            const entry = ttpCounts.get(ttp)!;
            entry.count++;
            overlap.forEach((o: string) => entry.basedOn.add(o));
            entry.campaigns.add(campaign.name);
          }
        });
      }
    });

    // Convertir en array et calculer probabilité
    const results: any[] = [];
    ttpCounts.forEach((data, ttp) => {
      const probability = Math.min(Math.round((data.count / campaigns.length) * 100), 95);
      
      if (probability >= 10) {
        results.push({
          ttp,
          probability,
          basedOn: Array.from(data.basedOn),
          campaigns: Array.from(data.campaigns).slice(0, 3)
        });
      }
    });

    // Trier par probabilité
    results.sort((a, b) => b.probability - a.probability);

    return results;
  }

  /**
   * Détecter anomalies dans les patterns
   */
  static async detectAnomalies(
    tenantId: string,
    entityType: 'campaign' | 'actor' | 'threat',
    entityId: string
  ): Promise<AnomalyDetection[]> {
    try {
      logger.info(`Detecting anomalies for ${entityType}:${entityId}`);

      const anomalies: AnomalyDetection[] = [];

      switch (entityType) {
        case 'campaign':
          const campaign = await prisma.campaign.findFirst({
            where: { id: entityId, tenantId },
            include: { ttps: true }
          });

          if (campaign) {
            // Anomalie 1: Changement soudain d'activité
            const activityAnomaly = await this.detectActivityAnomaly(tenantId, campaign);
            if (activityAnomaly) anomalies.push(activityAnomaly);

            // Anomalie 2: TTPs inhabituels
            const ttpAnomaly = this.detectTTPAnomaly(campaign);
            if (ttpAnomaly) anomalies.push(ttpAnomaly);

            // Anomalie 3: Changement de cibles
            const targetAnomaly = this.detectTargetAnomaly(campaign);
            if (targetAnomaly) anomalies.push(targetAnomaly);
          }
          break;

        case 'actor':
          // Similar analysis pour actors
          break;
      }

      return anomalies;
    } catch (error: any) {
      logger.error('Error detecting anomalies:', error.message);
      throw error;
    }
  }

  /**
   * Détecter anomalie d'activité
   */
  private static async detectActivityAnomaly(
    tenantId: string,
    campaign: any
  ): Promise<AnomalyDetection | null> {
    // Calculer baseline (moyenne campagnes similaires)
    const similarCampaigns = await prisma.campaign.findMany({
      where: {
        tenantId,
        id: { not: campaign.id }
      },
      take: 20
    });

    const avgDuration = similarCampaigns.reduce((sum, c) => {
      const duration = c.lastSeen.getTime() - c.firstSeen.getTime();
      return sum + duration / (1000 * 60 * 60 * 24); // jours
    }, 0) / similarCampaigns.length;

    const currentDuration = (campaign.lastSeen.getTime() - campaign.firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    const deviation = Math.abs(currentDuration - avgDuration) / avgDuration;

    if (deviation > 0.5) { // > 50% deviation
      return {
        entityId: campaign.id,
        entityType: 'campaign',
        anomalyType: 'activity_pattern',
        anomalyScore: Math.min(Math.round(deviation * 100), 100),
        baseline: { avgDuration: Math.round(avgDuration) },
        current: { duration: Math.round(currentDuration) },
        deviation: Math.round(deviation * 100)
      };
    }

    return null;
  }

  /**
   * Détecter anomalie de TTPs
   */
  private static detectTTPAnomaly(campaign: any): AnomalyDetection | null {
    const ttpCount = campaign.ttps.length;
    const uniqueTactics = new Set(campaign.ttps.map((t: any) => t.tactic)).size;

    // Baseline attendu: 2-5 tactics, 3-10 techniques
    if (ttpCount > 15 || uniqueTactics > 8) {
      return {
        entityId: campaign.id,
        entityType: 'campaign',
        anomalyType: 'ttp_unusual',
        anomalyScore: 75,
        baseline: { expectedTactics: '2-5', expectedTechniques: '3-10' },
        current: { tactics: uniqueTactics, techniques: ttpCount },
        deviation: 75
      };
    }

    return null;
  }

  /**
   * Détecter anomalie de cibles
   */
  private static detectTargetAnomaly(campaign: any): AnomalyDetection | null {
    const sectors = (campaign.targetSectors as string[]) || [];
    const countries = (campaign.targetCountries as string[]) || [];

    // Baseline: 1-3 secteurs, 1-5 pays
    if (sectors.length > 5 || countries.length > 10) {
      return {
        entityId: campaign.id,
        entityType: 'campaign',
        anomalyType: 'target_unusual',
        anomalyScore: 65,
        baseline: { expectedSectors: '1-3', expectedCountries: '1-5' },
        current: { sectors: sectors.length, countries: countries.length },
        deviation: 65
      };
    }

    return null;
  }

  /**
   * Générer recommandation
   */
  private static generateRecommendation(severity: string, factors: string[]): string {
    switch (severity) {
      case 'critical':
        return 'URGENT: Déclencher réponse d\'incident immédiate. Isoler systèmes affectés. Notifier CERT.';
      case 'high':
        return 'IMPORTANT: Investigation approfondie requise. Surveiller activité réseau. Préparer plan de réponse.';
      case 'medium':
        return 'ATTENTION: Monitoring continu recommandé. Valider IOCs. Mettre à jour signatures.';
      default:
        return 'INFO: Documenter et surveiller l\'évolution. Pas d\'action immédiate requise.';
    }
  }
}



