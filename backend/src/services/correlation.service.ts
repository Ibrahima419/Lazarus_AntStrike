import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CorrelationRule {
  minConfidence: number;
  maxTimeWindow: number; // en heures
  commonTags?: string[];
  commonIOCs?: string[];
  similarTitles?: boolean;
}

export class CorrelationService {
  /**
   * Corréler les menaces similaires
   */
  static async correlateThreat(
    tenantId: string,
    threatId: string,
    rule: CorrelationRule = {
      minConfidence: 0.7,
      maxTimeWindow: 72,
      similarTitles: true,
    }
  ) {
    try {
      logger.info(`Corrélation de la menace: ${threatId}`);

      // Récupérer la menace de référence (simulé)
      const referenceThreat = await this.getSimulatedThreat(threatId);

      // Trouver les menaces similaires
      const correlatedThreats = await this.findCorrelatedThreats(
        tenantId,
        referenceThreat,
        rule
      );

      // Calculer le score de confiance pour chaque corrélation
      const correlations = correlatedThreats.map((threat) => ({
        relatedThreatId: threat.id,
        confidenceScore: this.calculateConfidenceScore(referenceThreat, threat, rule),
        commonTags: this.findCommonTags(referenceThreat.tags, threat.tags),
        commonIOCs: this.findCommonIOCs(referenceThreat.iocs, threat.iocs),
        timeDifference: Math.abs(
          new Date(referenceThreat.created).getTime() - new Date(threat.created).getTime()
        ),
      }));

      // Filtrer par confiance minimale
      const validCorrelations = correlations.filter(
        (c) => c.confidenceScore >= rule.minConfidence
      );

      // Sauvegarder les corrélations
      for (const correlation of validCorrelations) {
        // Créer seulement (ignorer erreurs de duplicates)
        await prisma.threatCorrelation.create({
          data: {
            tenantId,
            threatId,
            relatedThreatId: correlation.relatedThreatId,
            confidenceScore: correlation.confidenceScore,
            commonIndicators: {
              tags: correlation.commonTags,
              iocs: correlation.commonIOCs,
              timeDiff: correlation.timeDifference
            }
          }
        }).catch((err) => {
          // Ignore duplicate errors
          if (!err.message.includes('Unique constraint')) {
            logger.error('Error creating correlation', err);
          }
        });
      }

      logger.info(`${validCorrelations.length} corrélations trouvées pour ${threatId}`);
      return validCorrelations;
    } catch (error) {
      logger.error('Erreur corrélation menace:', error);
      throw error;
    }
  }

  /**
   * Récupérer les corrélations d'une menace
   */
  static async getThreatCorrelations(tenantId: string, threatId: string) {
    try {
      const correlations = await prisma.threatCorrelation.findMany({
        where: {
          tenantId,
          OR: [{ threatId }, { relatedThreatId: threatId }],
        },
        orderBy: { confidenceScore: 'desc' },
      });

      return correlations;
    } catch (error) {
      logger.error('Erreur récupération corrélations:', error);
      throw error;
    }
  }

  /**
   * Analyser les campagnes de menaces (threat campaigns)
   */
  static async analyzeThreatCampaigns(tenantId: string, minClusterSize = 3) {
    try {
      logger.info('Analyse des campagnes de menaces...');

      // Récupérer toutes les corrélations avec haute confiance
      const correlations = await prisma.threatCorrelation.findMany({
        where: {
          tenantId,
          confidenceScore: { gte: 0.8 },
        },
      });

      // Construire un graphe de corrélations
      const graph = this.buildCorrelationGraph(correlations);

      // Identifier les clusters (campagnes)
      const campaigns = this.identifyClusters(graph, minClusterSize);

      logger.info(`${campaigns.length} campagnes identifiées`);
      return campaigns;
    } catch (error) {
      logger.error('Erreur analyse campagnes:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de corrélation
   */
  static async getCorrelationStats(tenantId: string) {
    try {
      const [totalCorrelations, highConfidence, campaigns] = await Promise.all([
        prisma.threatCorrelation.count({ where: { tenantId } }),
        prisma.threatCorrelation.count({
          where: { tenantId, confidenceScore: { gte: 0.8 } },
        }),
        this.analyzeThreatCampaigns(tenantId),
      ]);

      return {
        totalCorrelations,
        highConfidence,
        campaignCount: campaigns.length,
        avgConfidence: await this.calculateAvgConfidence(tenantId),
      };
    } catch (error) {
      logger.error('Erreur stats corrélation:', error);
      throw error;
    }
  }

  // ========== Méthodes privées ==========

  /**
   * Trouver les menaces corrélées (simulé avec données Taranis)
   */
  private static async findCorrelatedThreats(
    tenantId: string,
    referenceThreat: any,
    rule: CorrelationRule
  ): Promise<any[]> {
    // Dans un vrai système, cela interrogerait Taranis ou la base de données
    // Pour l'instant, retourner une liste vide pour la démo
    return [];
  }

  /**
   * Calculer le score de confiance de corrélation
   */
  private static calculateConfidenceScore(threat1: any, threat2: any, rule: CorrelationRule): number {
    let score = 0;
    let weights = 0;

    // Similarité des tags (poids: 0.3)
    const tagSimilarity = this.calculateTagSimilarity(threat1.tags, threat2.tags);
    score += tagSimilarity * 0.3;
    weights += 0.3;

    // Similarité des IOCs (poids: 0.4)
    const iocSimilarity = this.calculateIOCSimilarity(threat1.iocs, threat2.iocs);
    score += iocSimilarity * 0.4;
    weights += 0.4;

    // Similarité des titres (poids: 0.2)
    if (rule.similarTitles) {
      const titleSimilarity = this.calculateTitleSimilarity(threat1.title, threat2.title);
      score += titleSimilarity * 0.2;
      weights += 0.2;
    }

    // Proximité temporelle (poids: 0.1)
    const timeSimilarity = this.calculateTimeSimilarity(
      threat1.created,
      threat2.created,
      rule.maxTimeWindow
    );
    score += timeSimilarity * 0.1;
    weights += 0.1;

    return weights > 0 ? score / weights : 0;
  }

  /**
   * Calculer la similarité des tags
   */
  private static calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    if (!tags1?.length || !tags2?.length) return 0;

    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = [...set1].filter((tag) => set2.has(tag));

    return intersection.length / Math.max(set1.size, set2.size);
  }

  /**
   * Calculer la similarité des IOCs
   */
  private static calculateIOCSimilarity(iocs1: string[], iocs2: string[]): number {
    if (!iocs1?.length || !iocs2?.length) return 0;

    const set1 = new Set(iocs1);
    const set2 = new Set(iocs2);
    const intersection = [...set1].filter((ioc) => set2.has(ioc));

    return intersection.length / Math.max(set1.size, set2.size);
  }

  /**
   * Calculer la similarité des titres (distance de Levenshtein simplifiée)
   */
  private static calculateTitleSimilarity(title1: string, title2: string): number {
    if (!title1 || !title2) return 0;

    const t1 = title1.toLowerCase().trim();
    const t2 = title2.toLowerCase().trim();

    if (t1 === t2) return 1;

    // Similarité basique par mots communs
    const words1 = new Set(t1.split(/\s+/));
    const words2 = new Set(t2.split(/\s+/));
    const commonWords = [...words1].filter((word) => words2.has(word));

    return commonWords.length / Math.max(words1.size, words2.size);
  }

  /**
   * Calculer la similarité temporelle
   */
  private static calculateTimeSimilarity(
    time1: string,
    time2: string,
    maxWindowHours: number
  ): number {
    const diff = Math.abs(new Date(time1).getTime() - new Date(time2).getTime());
    const diffHours = diff / 1000 / 60 / 60;

    if (diffHours > maxWindowHours) return 0;

    return 1 - diffHours / maxWindowHours;
  }

  /**
   * Trouver les tags communs
   */
  private static findCommonTags(tags1: string[], tags2: string[]): string[] {
    if (!tags1?.length || !tags2?.length) return [];

    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    return [...set1].filter((tag) => set2.has(tag));
  }

  /**
   * Trouver les IOCs communs
   */
  private static findCommonIOCs(iocs1: string[], iocs2: string[]): string[] {
    if (!iocs1?.length || !iocs2?.length) return [];

    const set1 = new Set(iocs1);
    const set2 = new Set(iocs2);
    return [...set1].filter((ioc) => set2.has(ioc));
  }

  /**
   * Construire un graphe de corrélations
   */
  private static buildCorrelationGraph(correlations: any[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const correlation of correlations) {
      if (!graph.has(correlation.threatId)) {
        graph.set(correlation.threatId, new Set());
      }
      if (!graph.has(correlation.relatedThreatId)) {
        graph.set(correlation.relatedThreatId, new Set());
      }

      graph.get(correlation.threatId)!.add(correlation.relatedThreatId);
      graph.get(correlation.relatedThreatId)!.add(correlation.threatId);
    }

    return graph;
  }

  /**
   * Identifier les clusters (algorithme de clustering simple)
   */
  private static identifyClusters(
    graph: Map<string, Set<string>>,
    minSize: number
  ): Array<{ id: string; threatIds: string[]; size: number }> {
    const visited = new Set<string>();
    const clusters: Array<{ id: string; threatIds: string[]; size: number }> = [];

    for (const [nodeId, _] of graph) {
      if (!visited.has(nodeId)) {
        const cluster = this.dfsCluster(graph, nodeId, visited);

        if (cluster.length >= minSize) {
          clusters.push({
            id: `campaign-${clusters.length + 1}`,
            threatIds: cluster,
            size: cluster.length,
          });
        }
      }
    }

    return clusters;
  }

  /**
   * DFS pour identifier un cluster
   */
  private static dfsCluster(
    graph: Map<string, Set<string>>,
    startNode: string,
    visited: Set<string>
  ): string[] {
    const cluster: string[] = [];
    const stack = [startNode];

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (!visited.has(node)) {
        visited.add(node);
        cluster.push(node);

        const neighbors = graph.get(node) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return cluster;
  }

  /**
   * Calculer la confiance moyenne
   */
  private static async calculateAvgConfidence(tenantId: string): Promise<number> {
    const result = await prisma.threatCorrelation.aggregate({
      where: { tenantId },
      _avg: { confidenceScore: true },
    });

    return result._avg.confidenceScore || 0;
  }

  /**
   * Récupérer une menace simulée (à remplacer par vraie logique Taranis)
   */
  private static async getSimulatedThreat(threatId: string): Promise<any> {
    return {
      id: threatId,
      title: 'Exemple de menace',
      created: new Date().toISOString(),
      tags: ['malware', 'ransomware', 'apt'],
      iocs: ['192.168.1.1', 'evil.com', 'abc123hash'],
    };
  }
}


