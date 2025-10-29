/**
 * 🚨 Alert Controller
 * Contrôleur pour la gestion avancée des alertes
 */

import { Request, Response, NextFunction } from 'express';
import { AlertManagementService } from '../services/alert-management.service';
import { NotificationService } from '../services/notification.service';
import { BadRequestError } from '../utils/errors';

export class AlertController {
  /**
   * POST /api/alerts
   * Créer une alerte
   */
  static async createAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const input = req.body;

      if (!input.title || !input.severity) {
        throw new BadRequestError('title and severity are required');
      }

      const result = await AlertManagementService.createAlert(tenantId, input);

      // Envoyer notifications si nouvelle alerte
      if (!result.isDuplicate && input.severity === 'critical') {
        await NotificationService.sendNotification(tenantId, {
          title: input.title,
          message: input.description || 'Critical alert created',
          severity: input.severity,
          alertId: result.alert.id
        });
      }

      res.status(result.isDuplicate ? 200 : 201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alerts
   * Lister les alertes
   */
  static async listAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { severity, status, priority, assignee, category, startDate, endDate, page, limit } = req.query;

      const filters: any = {};
      if (severity) filters.severity = Array.isArray(severity) ? severity : [severity];
      if (status) filters.status = Array.isArray(status) ? status : [status];
      if (priority) filters.priority = Array.isArray(priority) ? priority : [priority];
      if (assignee) filters.assignee = assignee;
      if (category) filters.category = category;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await AlertManagementService.listAlerts(
        tenantId,
        filters,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alerts/:id
   * Obtenir une alerte
   */
  static async getAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const alert = await AlertManagementService.getAlert(tenantId, id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/alerts/:id
   * Mettre à jour une alerte
   */
  static async updateAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const updates = req.body;

      const alert = await AlertManagementService.updateAlert(tenantId, id, updates, userId);

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/acknowledge
   * Acquitter une alerte
   */
  static async acknowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;

      const alert = await AlertManagementService.acknowledgeAlert(tenantId, id, userId);

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/assign
   * Assigner une alerte
   */
  static async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const { assignee } = req.body;

      if (!assignee) {
        throw new BadRequestError('assignee is required');
      }

      const alert = await AlertManagementService.assignAlert(tenantId, id, assignee, userId);

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/resolve
   * Résoudre une alerte
   */
  static async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const { resolution } = req.body;

      const alert = await AlertManagementService.resolveAlert(tenantId, id, resolution, userId);

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/close
   * Clôturer une alerte
   */
  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;

      const alert = await AlertManagementService.closeAlert(tenantId, id, userId);

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/notes
   * Ajouter une note
   */
  static async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        throw new BadRequestError('content is required');
      }

      const note = await AlertManagementService.addNote(id, userId, content);

      res.status(201).json({
        success: true,
        data: note
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alerts/:id/history
   * Obtenir historique
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const history = await AlertManagementService.getHistory(id);

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/bulk
   * Opérations bulk
   */
  static async bulkOperation(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { alertIds, operation, data } = req.body;

      if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
        throw new BadRequestError('alertIds array is required');
      }

      if (!operation) {
        throw new BadRequestError('operation is required');
      }

      const result = await AlertManagementService.bulkOperation(
        tenantId,
        alertIds,
        operation,
        data,
        userId
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
   * GET /api/alerts/stats
   * Statistiques alertes
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await AlertManagementService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sla/violations
   * Violations SLA
   */
  static async getSLAViolations(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const violations = await AlertManagementService.getSLAViolations(tenantId);

      res.json({
        success: true,
        data: violations,
        count: violations.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sla/check
   * Vérifier violations SLA
   */
  static async checkSLA(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const violationCount = await AlertManagementService.checkSLAViolations(tenantId);

      res.json({
        success: true,
        data: {
          violations: violationCount,
          checkedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
