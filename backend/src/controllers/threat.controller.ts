/**
 * 🎯 Threat Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TaranisProxyService } from '../services/taranis-proxy.service';

export class ThreatController {
  /**
   * GET /api/threats
   */
  static async getThreats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { limit, offset, search } = req.query;

      const stories = await TaranisProxyService.getStories(tenantId, {
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0,
        search
      });

      res.json(stories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/threats/:id
   */
  static async getThreat(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const story = await TaranisProxyService.getStory(id);

      res.json(story);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/threats/:id
   */
  static async updateThreat(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await TaranisProxyService.updateStory(id, req.body);

      res.json({
        message: 'Threat updated',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/threats/search
   */
  static async searchThreats(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      const results = await TaranisProxyService.searchStories(q as string);

      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}



