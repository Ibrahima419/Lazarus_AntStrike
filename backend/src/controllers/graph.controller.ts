/**
 * 📊 Graph Analytics Controller
 * Contrôleur pour l'analyse de graphe CTI
 */

import { Request, Response, NextFunction } from 'express';
import { GraphAnalyticsService } from '../services/graph-analytics.service';
import { BadRequestError } from '../utils/errors';

export class GraphController {
  /**
   * POST /api/analysis/graph/build
   * Construire un graphe depuis une entité
   */
  static async buildGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { entityId, entityType, depth } = req.body;

      if (!entityId || !entityType) {
        throw new BadRequestError('entityId and entityType are required');
      }

      const validTypes = ['ioc', 'threat', 'actor', 'campaign', 'ttp'];
      if (!validTypes.includes(entityType)) {
        throw new BadRequestError(`entityType must be one of: ${validTypes.join(', ')}`);
      }

      const graph = await GraphAnalyticsService.buildGraph(
        tenantId,
        entityId,
        entityType,
        depth || 2
      );

      res.json({
        success: true,
        data: graph
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/graph/:entityType/:entityId
   * Obtenir le graphe d'une entité
   */
  static async getGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { entityType, entityId } = req.params;
      const { depth } = req.query;

      const graph = await GraphAnalyticsService.buildGraph(
        tenantId,
        entityId,
        entityType as any,
        depth ? parseInt(depth as string) : 2
      );

      res.json({
        success: true,
        data: graph
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/graph/centrality/pagerank
   * Calculer PageRank
   */
  static async calculatePageRank(req: Request, res: Response, next: NextFunction) {
    try {
      const { graph, iterations, dampingFactor } = req.body;

      if (!graph || !graph.nodes || !graph.edges) {
        throw new BadRequestError('Valid graph object required');
      }

      const pagerank = GraphAnalyticsService.calculatePageRank(
        graph,
        iterations || 20,
        dampingFactor || 0.85
      );

      res.json({
        success: true,
        data: pagerank
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/graph/centrality/betweenness
   * Calculer Betweenness Centrality
   */
  static async calculateBetweenness(req: Request, res: Response, next: NextFunction) {
    try {
      const { graph } = req.body;

      if (!graph || !graph.nodes || !graph.edges) {
        throw new BadRequestError('Valid graph object required');
      }

      const betweenness = GraphAnalyticsService.calculateBetweenness(graph);

      res.json({
        success: true,
        data: betweenness
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/graph/communities
   * Détecter communautés
   */
  static async detectCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const { graph } = req.body;

      if (!graph || !graph.nodes || !graph.edges) {
        throw new BadRequestError('Valid graph object required');
      }

      const communities = GraphAnalyticsService.detectCommunities(graph);

      res.json({
        success: true,
        data: communities,
        count: communities.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/graph/shortest-path
   * Trouver le plus court chemin
   */
  static async findShortestPath(req: Request, res: Response, next: NextFunction) {
    try {
      const { graph, sourceId, targetId } = req.body;

      if (!graph || !graph.nodes || !graph.edges) {
        throw new BadRequestError('Valid graph object required');
      }

      if (!sourceId || !targetId) {
        throw new BadRequestError('sourceId and targetId are required');
      }

      const result = GraphAnalyticsService.findShortestPath(graph, sourceId, targetId);

      if (!result) {
        return res.json({
          success: true,
          data: null,
          message: 'No path found between nodes'
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/graph/influence/:entityType/:entityId
   * Calculer l'influence d'une entité
   */
  static async calculateInfluence(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { entityType, entityId } = req.params;

      const influence = await GraphAnalyticsService.calculateInfluence(
        tenantId,
        entityId,
        entityType as any
      );

      res.json({
        success: true,
        data: influence
      });
    } catch (error) {
      next(error);
    }
  }
}



