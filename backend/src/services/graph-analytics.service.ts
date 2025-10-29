/**
 * 📊 Graph Analytics Service
 * Analyse de graphe pour CTI (IOCs, Threats, Actors, Campaigns)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

// Types de nœuds du graphe
type NodeType = 'ioc' | 'threat' | 'actor' | 'campaign' | 'ttp';

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata?: any;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  metadata?: any;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface CentralityScore {
  nodeId: string;
  score: number;
  rank: number;
}

interface Community {
  id: number;
  nodes: string[];
  size: number;
  density: number;
}

export class GraphAnalyticsService {
  /**
   * Construire le graphe depuis une entité centrale
   */
  static async buildGraph(
    tenantId: string,
    entityId: string,
    entityType: NodeType,
    depth: number = 2
  ): Promise<Graph> {
    try {
      logger.info(`Building graph for ${entityType}:${entityId} (depth=${depth})`);

      const nodes = new Map<string, GraphNode>();
      const edges: GraphEdge[] = [];

      // Ajouter nœud central
      const centralNode = await this.createNode(tenantId, entityId, entityType);
      if (centralNode) {
        nodes.set(centralNode.id, centralNode);
        
        // Explorer en profondeur
        await this.exploreNode(tenantId, centralNode, nodes, edges, depth, 0);
      }

      return {
        nodes: Array.from(nodes.values()),
        edges
      };
    } catch (error: any) {
      logger.error('Error building graph:', error.message);
      throw error;
    }
  }

  /**
   * Créer un nœud du graphe
   */
  private static async createNode(
    tenantId: string,
    entityId: string,
    entityType: NodeType
  ): Promise<GraphNode | null> {
    try {
      let label = entityId;
      let metadata: any = {};

      switch (entityType) {
        case 'campaign':
          const campaign = await prisma.campaign.findFirst({
            where: { id: entityId, tenantId },
            select: { id: true, name: true, threatActor: true, confidence: true, status: true }
          });
          if (campaign) {
            label = campaign.name;
            metadata = { threatActor: campaign.threatActor, confidence: campaign.confidence, status: campaign.status };
          }
          break;

        case 'actor':
          const actor = await prisma.threatActor.findFirst({
            where: { id: entityId, tenantId },
            select: { id: true, name: true, country: true, sophistication: true, threatLevel: true }
          });
          if (actor) {
            label = actor.name;
            metadata = { country: actor.country, sophistication: actor.sophistication, threatLevel: actor.threatLevel };
          }
          break;

        case 'ttp':
          const ttp = await prisma.tTP.findFirst({
            where: { id: entityId, tenantId },
            select: { id: true, technique: true, techniqueId: true, tactic: true, confidence: true }
          });
          if (ttp) {
            label = `${ttp.techniqueId}: ${ttp.technique}`;
            metadata = { tactic: ttp.tactic, confidence: ttp.confidence };
          }
          break;

        case 'threat':
          const threat = await prisma.threat.findFirst({
            where: { id: entityId, tenantId },
            select: { id: true, name: true, type: true, severity: true }
          });
          if (threat) {
            label = threat.name;
            metadata = { type: threat.type, severity: threat.severity };
          }
          break;

        case 'ioc':
          label = entityId; // IOC value
          metadata = { type: 'ioc' };
          break;
      }

      return {
        id: `${entityType}:${entityId}`,
        type: entityType,
        label,
        metadata
      };
    } catch (error: any) {
      logger.error('Error creating node:', error.message);
      return null;
    }
  }

  /**
   * Explorer un nœud et ses relations
   */
  private static async exploreNode(
    tenantId: string,
    node: GraphNode,
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[],
    maxDepth: number,
    currentDepth: number
  ): Promise<void> {
    if (currentDepth >= maxDepth) return;

    const [type, id] = node.id.split(':');

    try {
      switch (type as NodeType) {
        case 'campaign':
          // Campaign → TTPs
          const campaignTTPs = await prisma.tTP.findMany({
            where: { campaignId: id, tenantId },
            take: 20
          });

          for (const ttp of campaignTTPs) {
            const ttpNode = await this.createNode(tenantId, ttp.id, 'ttp');
            if (ttpNode && !nodes.has(ttpNode.id)) {
              nodes.set(ttpNode.id, ttpNode);
              edges.push({
                source: node.id,
                target: ttpNode.id,
                type: 'uses_ttp',
                weight: ttp.confidence / 100
              });
              
              if (currentDepth + 1 < maxDepth) {
                await this.exploreNode(tenantId, ttpNode, nodes, edges, maxDepth, currentDepth + 1);
              }
            }
          }

          // Campaign → Actor
          const campaign = await prisma.campaign.findFirst({
            where: { id, tenantId }
          });

          if (campaign?.threatActor) {
            const actor = await prisma.threatActor.findFirst({
              where: { name: campaign.threatActor, tenantId }
            });

            if (actor) {
              const actorNode = await this.createNode(tenantId, actor.id, 'actor');
              if (actorNode && !nodes.has(actorNode.id)) {
                nodes.set(actorNode.id, actorNode);
                edges.push({
                  source: actorNode.id,
                  target: node.id,
                  type: 'attributed_to',
                  weight: campaign.confidence / 100
                });
              }
            }
          }
          break;

        case 'actor':
          // Actor → Campaigns
          const actor = await prisma.threatActor.findFirst({
            where: { id, tenantId }
          });

          if (actor) {
            const campaigns = await prisma.campaign.findMany({
              where: { threatActor: actor.name, tenantId },
              take: 10
            });

            for (const camp of campaigns) {
              const campNode = await this.createNode(tenantId, camp.id, 'campaign');
              if (campNode && !nodes.has(campNode.id)) {
                nodes.set(campNode.id, campNode);
                edges.push({
                  source: node.id,
                  target: campNode.id,
                  type: 'attributed_to',
                  weight: camp.confidence / 100
                });
              }
            }
          }
          break;

        case 'ttp':
          // TTP → Campaign
          const ttp = await prisma.tTP.findFirst({
            where: { id, tenantId },
            include: { campaign: true }
          });

          if (ttp?.campaign) {
            const campNode = await this.createNode(tenantId, ttp.campaign.id, 'campaign');
            if (campNode && !nodes.has(campNode.id)) {
              nodes.set(campNode.id, campNode);
              edges.push({
                source: campNode.id,
                target: node.id,
                type: 'uses_ttp',
                weight: ttp.confidence / 100
              });
            }
          }

          // TTP → Related TTPs (même tactic)
          const relatedTTPs = await prisma.tTP.findMany({
            where: {
              tenantId,
              tactic: ttp?.tactic,
              id: { not: id }
            },
            take: 5
          });

          for (const relTTP of relatedTTPs) {
            const relNode = await this.createNode(tenantId, relTTP.id, 'ttp');
            if (relNode && !nodes.has(relNode.id)) {
              nodes.set(relNode.id, relNode);
              edges.push({
                source: node.id,
                target: relNode.id,
                type: 'same_tactic',
                weight: 0.5
              });
            }
          }
          break;
      }
    } catch (error: any) {
      logger.error('Error exploring node:', error.message);
    }
  }

  /**
   * Calculer PageRank (influence des nœuds)
   */
  static calculatePageRank(
    graph: Graph,
    iterations: number = 20,
    dampingFactor: number = 0.85
  ): CentralityScore[] {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // Initialiser scores
    const scores = new Map<string, number>();
    const initialScore = 1.0 / nodes.length;
    nodes.forEach(n => scores.set(n.id, initialScore));

    // Calculer outgoing links
    const outLinks = new Map<string, string[]>();
    edges.forEach(e => {
      if (!outLinks.has(e.source)) outLinks.set(e.source, []);
      outLinks.get(e.source)!.push(e.target);
    });

    // Calculer incoming links
    const inLinks = new Map<string, string[]>();
    edges.forEach(e => {
      if (!inLinks.has(e.target)) inLinks.set(e.target, []);
      inLinks.get(e.target)!.push(e.source);
    });

    // Itérations PageRank
    for (let i = 0; i < iterations; i++) {
      const newScores = new Map<string, number>();

      nodes.forEach(node => {
        let sum = 0;
        const incoming = inLinks.get(node.id) || [];
        
        incoming.forEach(sourceId => {
          const sourceScore = scores.get(sourceId) || 0;
          const outCount = (outLinks.get(sourceId) || []).length;
          if (outCount > 0) {
            sum += sourceScore / outCount;
          }
        });

        const newScore = (1 - dampingFactor) / nodes.length + dampingFactor * sum;
        newScores.set(node.id, newScore);
      });

      scores.clear();
      newScores.forEach((v, k) => scores.set(k, v));
    }

    // Convertir en array et trier
    const results: CentralityScore[] = [];
    scores.forEach((score, nodeId) => {
      results.push({ nodeId, score, rank: 0 });
    });

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => r.rank = i + 1);

    return results;
  }

  /**
   * Calculer Betweenness Centrality (nœuds intermédiaires)
   */
  static calculateBetweenness(graph: Graph): CentralityScore[] {
    const nodes = graph.nodes;
    const betweenness = new Map<string, number>();
    nodes.forEach(n => betweenness.set(n.id, 0));

    // Pour chaque paire de nœuds
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const source = nodes[i].id;
        const target = nodes[j].id;

        // Trouver tous les plus courts chemins
        const paths = this.findAllShortestPaths(graph, source, target);
        
        if (paths.length > 0) {
          // Compter passages par chaque nœud
          paths.forEach(path => {
            // Exclure source et target
            path.slice(1, -1).forEach(nodeId => {
              betweenness.set(nodeId, (betweenness.get(nodeId) || 0) + 1 / paths.length);
            });
          });
        }
      }
    }

    // Convertir et trier
    const results: CentralityScore[] = [];
    betweenness.forEach((score, nodeId) => {
      results.push({ nodeId, score, rank: 0 });
    });

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => r.rank = i + 1);

    return results;
  }

  /**
   * Trouver tous les plus courts chemins (BFS)
   */
  private static findAllShortestPaths(
    graph: Graph,
    source: string,
    target: string
  ): string[][] {
    const adjacency = new Map<string, string[]>();
    graph.edges.forEach(e => {
      if (!adjacency.has(e.source)) adjacency.set(e.source, []);
      adjacency.get(e.source)!.push(e.target);
    });

    const queue: { node: string; path: string[] }[] = [{ node: source, path: [source] }];
    const visited = new Set<string>();
    const allPaths: string[][] = [];
    let shortestLength = Infinity;

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;

      if (path.length > shortestLength) continue;

      if (node === target) {
        if (path.length < shortestLength) {
          shortestLength = path.length;
          allPaths.length = 0; // Clear
          allPaths.push(path);
        } else if (path.length === shortestLength) {
          allPaths.push(path);
        }
        continue;
      }

      if (visited.has(node) && path.length > shortestLength) continue;
      visited.add(node);

      const neighbors = adjacency.get(node) || [];
      neighbors.forEach(neighbor => {
        if (!path.includes(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      });
    }

    return allPaths;
  }

  /**
   * Détecter communautés (algorithme Louvain simplifié)
   */
  static detectCommunities(graph: Graph): Community[] {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // Initialiser: chaque nœud = sa propre communauté
    const nodeToCommunity = new Map<string, number>();
    nodes.forEach((n, i) => nodeToCommunity.set(n.id, i));

    // Adjacence
    const adjacency = new Map<string, Set<string>>();
    edges.forEach(e => {
      if (!adjacency.has(e.source)) adjacency.set(e.source, new Set());
      if (!adjacency.has(e.target)) adjacency.set(e.target, new Set());
      adjacency.get(e.source)!.add(e.target);
      adjacency.get(e.target)!.add(e.source);
    });

    // Phase 1: Maximiser modularité (itérations simplifiées)
    let improved = true;
    let iterations = 0;
    const maxIterations = 10;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (const node of nodes) {
        const currentComm = nodeToCommunity.get(node.id)!;
        const neighbors = adjacency.get(node.id) || new Set();
        
        // Compter communautés voisines
        const commCounts = new Map<number, number>();
        neighbors.forEach(neighbor => {
          const comm = nodeToCommunity.get(neighbor)!;
          commCounts.set(comm, (commCounts.get(comm) || 0) + 1);
        });

        // Trouver communauté avec le plus de voisins
        let bestComm = currentComm;
        let bestCount = 0;
        commCounts.forEach((count, comm) => {
          if (count > bestCount) {
            bestCount = count;
            bestComm = comm;
          }
        });

        if (bestComm !== currentComm && bestCount > 0) {
          nodeToCommunity.set(node.id, bestComm);
          improved = true;
        }
      }
    }

    // Regrouper résultats
    const communities = new Map<number, string[]>();
    nodeToCommunity.forEach((comm, nodeId) => {
      if (!communities.has(comm)) communities.set(comm, []);
      communities.get(comm)!.push(nodeId);
    });

    // Calculer densité de chaque communauté
    const results: Community[] = [];
    let commId = 0;

    communities.forEach(nodeIds => {
      if (nodeIds.length > 1) { // Ignorer communautés singleton
        // Compter edges internes
        let internalEdges = 0;
        const nodeSet = new Set(nodeIds);
        
        edges.forEach(e => {
          if (nodeSet.has(e.source) && nodeSet.has(e.target)) {
            internalEdges++;
          }
        });

        const maxPossibleEdges = (nodeIds.length * (nodeIds.length - 1)) / 2;
        const density = maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;

        results.push({
          id: commId++,
          nodes: nodeIds,
          size: nodeIds.length,
          density
        });
      }
    });

    // Trier par taille
    results.sort((a, b) => b.size - a.size);

    return results;
  }

  /**
   * Trouver le plus court chemin (Dijkstra)
   */
  static findShortestPath(
    graph: Graph,
    sourceId: string,
    targetId: string
  ): { path: string[]; distance: number } | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Initialiser
    graph.nodes.forEach(n => {
      distances.set(n.id, n.id === sourceId ? 0 : Infinity);
      previous.set(n.id, null);
      unvisited.add(n.id);
    });

    // Adjacence avec poids
    const adjacency = new Map<string, Map<string, number>>();
    graph.edges.forEach(e => {
      if (!adjacency.has(e.source)) adjacency.set(e.source, new Map());
      adjacency.get(e.source)!.set(e.target, 1 / e.weight); // Inverse weight (plus proche = poids faible)
    });

    while (unvisited.size > 0) {
      // Trouver nœud avec distance minimale
      let minNode: string | null = null;
      let minDist = Infinity;
      
      unvisited.forEach(nodeId => {
        const dist = distances.get(nodeId)!;
        if (dist < minDist) {
          minDist = dist;
          minNode = nodeId;
        }
      });

      if (minNode === null || minDist === Infinity) break;
      if (minNode === targetId) break;

      unvisited.delete(minNode);

      // Mettre à jour voisins
      const neighbors = adjacency.get(minNode) || new Map();
      neighbors.forEach((weight, neighbor) => {
        if (unvisited.has(neighbor)) {
          const alt = distances.get(minNode!)! + weight;
          if (alt < distances.get(neighbor)!) {
            distances.set(neighbor, alt);
            previous.set(neighbor, minNode);
          }
        }
      });
    }

    // Reconstruire chemin
    if (!previous.has(targetId) || previous.get(targetId) === null) {
      return null; // Pas de chemin
    }

    const path: string[] = [];
    let current: string | null = targetId;
    
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current)!;
    }

    return {
      path,
      distance: distances.get(targetId)!
    };
  }

  /**
   * Calculer influence d'un nœud (ego network)
   */
  static async calculateInfluence(
    tenantId: string,
    entityId: string,
    entityType: NodeType
  ): Promise<any> {
    try {
      // Construire graphe local (depth=2)
      const graph = await this.buildGraph(tenantId, entityId, entityType, 2);

      // PageRank
      const pagerank = this.calculatePageRank(graph);
      const entityNodeId = `${entityType}:${entityId}`;
      const entityRank = pagerank.find(p => p.nodeId === entityNodeId);

      // Betweenness
      const betweenness = this.calculateBetweenness(graph);
      const entityBetweenness = betweenness.find(b => b.nodeId === entityNodeId);

      // Degree (nombre de connexions)
      const degree = graph.edges.filter(e => 
        e.source === entityNodeId || e.target === entityNodeId
      ).length;

      return {
        entityId,
        entityType,
        metrics: {
          pagerank: entityRank?.score || 0,
          pagerankRank: entityRank?.rank || graph.nodes.length,
          betweenness: entityBetweenness?.score || 0,
          betweennessRank: entityBetweenness?.rank || graph.nodes.length,
          degree,
          influenceScore: this.calculateInfluenceScore(
            entityRank?.score || 0,
            entityBetweenness?.score || 0,
            degree,
            graph.nodes.length
          )
        },
        networkSize: graph.nodes.length,
        connectionCount: graph.edges.length
      };
    } catch (error: any) {
      logger.error('Error calculating influence:', error.message);
      throw error;
    }
  }

  /**
   * Calculer score d'influence global (0-100)
   */
  private static calculateInfluenceScore(
    pagerank: number,
    betweenness: number,
    degree: number,
    totalNodes: number
  ): number {
    // Normaliser metrics
    const pagerankNorm = pagerank * totalNodes * 100; // PageRank moyen = 1/N
    const betweennessNorm = Math.min((betweenness / totalNodes) * 100, 100);
    const degreeNorm = Math.min((degree / totalNodes) * 100, 100);

    // Score pondéré
    const score = (pagerankNorm * 0.4) + (betweennessNorm * 0.3) + (degreeNorm * 0.3);
    
    return Math.min(Math.round(score), 100);
  }
}



