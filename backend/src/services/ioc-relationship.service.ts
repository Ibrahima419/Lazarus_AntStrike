/**
 * 🔗 IOC Relationship Service
 * Gestion des relations entre IOCs
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export type RelationshipType = 
  | 'same_campaign'           // Même campagne d'attaque
  | 'same_infrastructure'     // Même infrastructure (C2, hosting)
  | 'same_actor'              // Même acteur/APT
  | 'related'                 // Relation générique
  | 'same_malware_family'     // Même famille de malware
  | 'observed_together'       // Observés ensemble
  | 'sequential';             // Observés en séquence

interface IOCGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    avgDegree: number;
    clusters: number;
  };
}

interface GraphNode {
  id: string;
  iocValue: string;
  iocType: string;
  threatScore: number;
  reputation: string;
  degree: number; // Nombre de connexions
}

interface GraphEdge {
  source: string;
  target: string;
  relationshipType: string;
  confidence: number;
  weight: number;
}

export class IOCRelationshipService {
  /**
   * Créer relation entre IOCs
   */
  static async createRelationship(
    tenantId: string,
    ioc1: string,
    ioc2: string,
    relationshipType: RelationshipType,
    confidence: number = 70,
    context?: any
  ): Promise<any> {
    try {
      // Vérifier si relation existe déjà
      const existing = await prisma.iOCRelationship.findFirst({
        where: {
          tenantId,
          OR: [
            { ioc1, ioc2 },
            { ioc1: ioc2, ioc2: ioc1 } // Relation bidirectionnelle
          ]
        }
      });

      if (existing) {
        // Mettre à jour confidence si plus élevée
        if (confidence > existing.confidence) {
          await prisma.iOCRelationship.update({
            where: { id: existing.id },
            data: { confidence, context }
          });
        }
        return existing;
      }

      // Créer nouvelle relation
      const relationship = await prisma.iOCRelationship.create({
        data: {
          tenantId,
          ioc1,
          ioc2,
          relationshipType,
          confidence,
          context: context || {}
        }
      });

      logger.info(`Relationship created: ${ioc1} <-> ${ioc2} (${relationshipType})`);

      return relationship;
    } catch (error: any) {
      logger.error('Error creating IOC relationship:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir graphe de relations
   */
  static async getRelationshipGraph(
    tenantId: string,
    iocValue: string,
    depth: number = 2
  ): Promise<IOCGraph> {
    try {
      logger.info(`Building relationship graph for ${iocValue}, depth ${depth}`);

      const nodes = new Map<string, GraphNode>();
      const edges: GraphEdge[] = [];
      const visited = new Set<string>();

      // BFS pour construire le graphe
      await this.buildGraphBFS(tenantId, iocValue, depth, nodes, edges, visited);

      // Calculer statistiques
      const stats = this.calculateGraphStats(nodes, edges);

      return {
        nodes: Array.from(nodes.values()),
        edges,
        stats
      };
    } catch (error: any) {
      logger.error('Error building relationship graph:', error.message);
      throw error;
    }
  }

  /**
   * BFS pour construire graphe
   */
  private static async buildGraphBFS(
    tenantId: string,
    startIOC: string,
    maxDepth: number,
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[],
    visited: Set<string>
  ): Promise<void> {
    const queue: Array<{ ioc: string; depth: number }> = [{ ioc: startIOC, depth: 0 }];
    visited.add(startIOC);

    // Ajouter nœud de départ
    const startNode = await this.createGraphNode(tenantId, startIOC);
    if (startNode) nodes.set(startIOC, startNode);

    while (queue.length > 0) {
      const { ioc, depth } = queue.shift()!;

      if (depth >= maxDepth) continue;

      // Trouver relations
      const relationships = await prisma.iOCRelationship.findMany({
        where: {
          tenantId,
          OR: [
            { ioc1: ioc },
            { ioc2: ioc }
          ]
        }
      });

      for (const rel of relationships) {
        const otherIOC = rel.ioc1 === ioc ? rel.ioc2 : rel.ioc1;

        // Ajouter edge
        edges.push({
          source: ioc,
          target: otherIOC,
          relationshipType: rel.relationshipType,
          confidence: rel.confidence,
          weight: rel.confidence / 100
        });

        // Ajouter nœud si pas encore visité
        if (!visited.has(otherIOC)) {
          visited.add(otherIOC);
          
          const node = await this.createGraphNode(tenantId, otherIOC);
          if (node) {
            nodes.set(otherIOC, node);
            queue.push({ ioc: otherIOC, depth: depth + 1 });
          }
        }
      }
    }
  }

  /**
   * Créer nœud de graphe
   */
  private static async createGraphNode(
    tenantId: string,
    iocValue: string
  ): Promise<GraphNode | null> {
    try {
      const ioc = await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue
        }
      });

      if (!ioc) return null;

      const enrichData = ioc.enrichmentData as any;

      return {
        id: iocValue,
        iocValue,
        iocType: ioc.iocType,
        threatScore: enrichData.threatScore || 0,
        reputation: enrichData.reputation || 'unknown',
        degree: 0 // Sera calculé après
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculer stats du graphe
   */
  private static calculateGraphStats(
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): any {
    // Calculer degree pour chaque nœud
    const degreeMap = new Map<string, number>();
    
    edges.forEach(edge => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    });

    // Mettre à jour degree dans nodes
    nodes.forEach((node, id) => {
      node.degree = degreeMap.get(id) || 0;
    });

    const degrees = Array.from(degreeMap.values());
    const avgDegree = degrees.length > 0 
      ? degrees.reduce((a, b) => a + b, 0) / degrees.length 
      : 0;

    return {
      totalNodes: nodes.size,
      totalEdges: edges.length,
      avgDegree: Math.round(avgDegree * 10) / 10,
      clusters: this.detectClusters(nodes, edges)
    };
  }

  /**
   * Détecter clusters (groupes d'IOCs reliés)
   */
  private static detectClusters(
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): number {
    // Algorithme union-find simplifié
    const parent = new Map<string, string>();
    
    // Initialiser
    nodes.forEach((node, id) => {
      parent.set(id, id);
    });

    // Find
    const find = (x: string): string => {
      const p = parent.get(x);
      if (!p || p === x) return x;
      const root = find(p);
      parent.set(x, root); // Path compression
      return root;
    };

    // Union
    const union = (x: string, y: string) => {
      const rootX = find(x);
      const rootY = find(y);
      if (rootX !== rootY) {
        parent.set(rootX, rootY);
      }
    };

    // Unir tous les edges
    edges.forEach(edge => {
      union(edge.source, edge.target);
    });

    // Compter clusters uniques
    const roots = new Set<string>();
    nodes.forEach((node, id) => {
      roots.add(find(id));
    });

    return roots.size;
  }

  /**
   * Détecter relations automatiquement
   */
  static async autoDetectRelationships(
    tenantId: string,
    maxIOCs: number = 100
  ): Promise<{ created: number }> {
    try {
      logger.info(`Auto-detecting IOC relationships for tenant ${tenantId}`);

      let created = 0;

      // Trouver IOCs dans les mêmes alertes
      const alerts = await prisma.alert.findMany({
        where: { tenantId },
        select: { id: true, raw: true },
        take: maxIOCs
      });

      for (const alert of alerts) {
        if ((alert.raw as any)?.iocs || [].length >= 2) {
          // Créer relations entre tous les IOCs de l'alerte
          for (let i = 0; i < (alert.raw as any)?.iocs || [].length; i++) {
            for (let j = i + 1; j < (alert.raw as any)?.iocs || [].length; j++) {
              try {
                await this.createRelationship(
                  tenantId,
                  (alert.raw as any)?.iocs || [][i],
                  (alert.raw as any)?.iocs || [][j],
                  'observed_together',
                  80,
                  { alertCategory: 'Unknown' }
                );
                created++;
              } catch (error) {
                // Peut déjà exister
              }
            }
          }
        }
      }

      logger.info(`Auto-detection completed: ${created} relationships created`);

      return { created };
    } catch (error: any) {
      logger.error('Error auto-detecting relationships:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir statistiques relationships
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.iOCRelationship.count({
      where: { tenantId }
    });

    const byType = await prisma.iOCRelationship.groupBy({
      by: ['relationshipType'],
      where: { tenantId },
      _count: true
    });

    const typeStats = byType.reduce((acc: any, item) => {
      acc[item.relationshipType] = item._count;
      return acc;
    }, {});

    // IOCs les plus connectés
    const allRels = await prisma.iOCRelationship.findMany({
      where: { tenantId },
      select: { ioc1: true, ioc2: true }
    });

    const connectionCount = new Map<string, number>();
    allRels.forEach(rel => {
      connectionCount.set(rel.ioc1, (connectionCount.get(rel.ioc1) || 0) + 1);
      connectionCount.set(rel.ioc2, (connectionCount.get(rel.ioc2) || 0) + 1);
    });

    const topConnected = Array.from(connectionCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ioc, count]) => ({ ioc, connections: count }));

    return {
      totalRelationships: total,
      byType: typeStats,
      topConnectedIOCs: topConnected
    };
  }
}




