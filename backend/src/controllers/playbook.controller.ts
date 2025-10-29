/**
 * 🤖 Playbook Controller
 * Contrôleur pour la gestion des playbooks SOAR
 */

import { Request, Response, NextFunction } from 'express';
import { PlaybookEngineService } from '../services/playbook-engine.service';
import { ActionLibraryService } from '../services/action-library.service';
import { BadRequestError } from '../utils/errors';
import { prisma } from '../config/database';

export class PlaybookController {
  /**
   * POST /api/playbooks
   * Créer un playbook
   */
  static async createPlaybook(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { name, description, category, type, trigger, steps, variables } = req.body;

      if (!name || !category) {
        throw new BadRequestError('name and category are required');
      }

      const playbook = await prisma.playbook.create({
        data: {
          tenantId,
          name,
          description,
          category,
          type: type || 'response',
          trigger: trigger || {},
          steps: steps || [],
          variables: variables || {},
          createdBy: userId,
          author: userId
        }
      });

      res.status(201).json({
        success: true,
        data: playbook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/playbooks
   * Lister les playbooks
   */
  static async listPlaybooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { category, type, isPublished, isActive } = req.query;

      const where: any = { tenantId };
      if (category) where.category = category;
      if (type) where.type = type;
      if (isPublished !== undefined) where.isPublished = isPublished === 'true';
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const playbooks = await prisma.playbook.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: playbooks,
        count: playbooks.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/playbooks/:id
   * Obtenir un playbook
   */
  static async getPlaybook(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const playbook = await prisma.playbook.findFirst({
        where: { id, tenantId }
      });

      if (!playbook) {
        return res.status(404).json({
          success: false,
          error: 'Playbook not found'
        });
      }

      res.json({
        success: true,
        data: playbook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/playbooks/:id
   * Mettre à jour un playbook
   */
  static async updatePlaybook(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const updates = req.body;

      const playbook = await prisma.playbook.updateMany({
        where: { id, tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: playbook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/playbooks/:id/execute
   * Exécuter un playbook
   */
  static async executePlaybook(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const { triggerData, triggeredBy } = req.body;

      const result = await PlaybookEngineService.executePlaybook(
        tenantId,
        id,
        triggerData || {},
        triggeredBy || 'manual'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/playbook-executions
   * Lister les executions
   */
  static async listExecutions(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { playbookId, limit } = req.query;

      const executions = await PlaybookEngineService.getExecutions(
        tenantId,
        playbookId as string,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        data: executions,
        count: executions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/playbook-executions/:id
   * Détails execution
   */
  static async getExecution(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const execution = await PlaybookEngineService.getExecutionDetails(tenantId, id);

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found'
        });
      }

      res.json({
        success: true,
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/playbook-executions/:id/cancel
   * Annuler execution
   */
  static async cancelExecution(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const result = await PlaybookEngineService.cancelExecution(tenantId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actions
   * Lister les actions disponibles
   */
  static async listActions(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;

      const actions = category 
        ? ActionLibraryService.getActionsByCategory(category as string)
        : ActionLibraryService.getAllActions();

      res.json({
        success: true,
        data: actions,
        count: actions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actions/categories
   * Lister les catégories d'actions
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = ActionLibraryService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actions/stats
   * Stats actions
   */
  static async getActionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = ActionLibraryService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
