/**
 * 📁 Enhanced Case Controller
 * Contrôleur amélioré pour la gestion complète des cases
 */

import { Request, Response, NextFunction } from 'express';
import { CaseManagementService } from '../services/case-management.service';
import { EvidenceManagementService } from '../services/evidence-management.service';
import { TaskManagementService } from '../services/task-management.service';
import { CaseReportingService } from '../services/case-reporting.service';
import { BadRequestError } from '../utils/errors';

export class CaseEnhancedController {
  /**
   * POST /api/cases
   * Créer un case
   */
  static async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const input = req.body;

      if (!input.title || !input.severity) {
        throw new BadRequestError('title and severity are required');
      }

      const caseRecord = await CaseManagementService.createCase(tenantId, input, userId);

      res.status(201).json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases
   * Lister les cases
   */
  static async listCases(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { type, severity, status, priority, assignee, investigator, category, startDate, endDate, page, limit } = req.query;

      const filters: any = {};
      if (type) filters.type = Array.isArray(type) ? type : [type];
      if (severity) filters.severity = Array.isArray(severity) ? severity : [severity];
      if (status) filters.status = Array.isArray(status) ? status : [status];
      if (priority) filters.priority = Array.isArray(priority) ? priority : [priority];
      if (assignee) filters.assignee = assignee;
      if (investigator) filters.investigator = investigator;
      if (category) filters.category = category;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await CaseManagementService.listCases(
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
   * GET /api/cases/:id
   * Obtenir un case
   */
  static async getCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const caseRecord = await CaseManagementService.getCase(tenantId, id);

      if (!caseRecord) {
        return res.status(404).json({
          success: false,
          error: 'Case not found'
        });
      }

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cases/:id
   * Mettre à jour un case
   */
  static async updateCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const updates = req.body;

      const caseRecord = await CaseManagementService.updateCase(tenantId, id, updates, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/triage
   * Triage
   */
  static async triage(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;

      const caseRecord = await CaseManagementService.triage(tenantId, id, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/investigate
   * Start investigation
   */
  static async investigate(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const { investigator } = req.body;

      if (!investigator) {
        throw new BadRequestError('investigator is required');
      }

      const caseRecord = await CaseManagementService.investigate(tenantId, id, investigator, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/contain
   * Contain
   */
  static async contain(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;

      const caseRecord = await CaseManagementService.contain(tenantId, id, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/remediate
   * Remediate
   */
  static async remediate(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;

      const caseRecord = await CaseManagementService.remediate(tenantId, id, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/close
   * Close case
   */
  static async closeCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const { resolution } = req.body;

      const caseRecord = await CaseManagementService.closeCase(tenantId, id, resolution, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/assign
   * Assigner
   */
  static async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const { assignee } = req.body;

      if (!assignee) {
        throw new BadRequestError('assignee is required');
      }

      const caseRecord = await CaseManagementService.assignCase(tenantId, id, assignee, userId);

      res.json({
        success: true,
        data: caseRecord
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/notes
   * Ajouter une note
   */
  static async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;
      const { content, type, isPrivate } = req.body;

      if (!content) {
        throw new BadRequestError('content is required');
      }

      const note = await CaseManagementService.addNote(id, userId, content, type, isPrivate);

      res.status(201).json({
        success: true,
        data: note
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/evidence
   * Upload evidence
   */
  static async uploadEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      
      // TODO: Gérer file upload avec multer
      const input = {
        caseId: id,
        ...req.body
      };

      const evidence = await EvidenceManagementService.uploadEvidence(
        tenantId,
        input,
        undefined,
        userId
      );

      res.status(201).json({
        success: true,
        data: evidence
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/evidence
   * Lister evidence
   */
  static async listEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const evidence = await EvidenceManagementService.listEvidence(tenantId, id);

      res.json({
        success: true,
        data: evidence,
        count: evidence.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/tasks
   * Créer une task
   */
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as any).user;
      const { id } = req.params;
      const input = req.body;

      const task = await TaskManagementService.createTask(tenantId, id, input, userId);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/tasks
   * Lister tasks
   */
  static async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const tasks = await TaskManagementService.getTasksByCase(tenantId, id);

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/report/executive
   * Rapport executive
   */
  static async getExecutiveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const report = await CaseReportingService.generateExecutiveReport(tenantId, id);

      res.json({
        success: true,
        data: {
          report,
          format: 'markdown'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/report/technical
   * Rapport technique
   */
  static async getTechnicalReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const report = await CaseReportingService.generateTechnicalReport(tenantId, id);

      res.json({
        success: true,
        data: {
          report,
          format: 'markdown'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/report/post-incident
   * Rapport post-incident
   */
  static async getPostIncidentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const report = await CaseReportingService.generatePostIncidentReport(tenantId, id);

      res.json({
        success: true,
        data: {
          report,
          format: 'markdown'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/stats
   * Stats globales
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await CaseManagementService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}



