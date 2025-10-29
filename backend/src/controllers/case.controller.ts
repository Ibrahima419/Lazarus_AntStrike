import { Request, Response } from 'express';
import { CaseService } from '../services/case.service';
import { logger } from '../utils/logger';

export class CaseController {
  /**
   * POST /api/cases - Créer un nouveau case
   */
  static async createCase(req: Request, res: Response) {
    try {
      const { tenantId, userId } = (req as any).user;
      const newCase = await CaseService.createCase(tenantId, userId, req.body);

      res.status(201).json({
        success: true,
        data: newCase,
      });
    } catch (error) {
      logger.error('Erreur création case:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du case',
      });
    }
  }

  /**
   * GET /api/cases - Récupérer tous les cases
   */
  static async getCases(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { status, severity, priority, assignedTo } = req.query;

      const cases = await CaseService.getCases(tenantId, {
        status: status as any,
        severity: severity as string,
        priority: priority as string,
        assignedTo: assignedTo as string,
      });

      res.json({
        success: true,
        data: cases,
      });
    } catch (error) {
      logger.error('Erreur récupération cases:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des cases',
      });
    }
  }

  /**
   * GET /api/cases/:id - Récupérer un case spécifique
   */
  static async getCaseById(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const caseData = await CaseService.getCaseById(tenantId, id);

      res.json({
        success: true,
        data: caseData,
      });
    } catch (error) {
      logger.error('Erreur récupération case:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du case',
      });
    }
  }

  /**
   * PATCH /api/cases/:id - Mettre à jour un case
   */
  static async updateCase(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const updatedCase = await CaseService.updateCase(tenantId, id, req.body);

      res.json({
        success: true,
        data: updatedCase,
      });
    } catch (error) {
      logger.error('Erreur mise à jour case:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du case',
      });
    }
  }

  /**
   * POST /api/cases/:id/notes - Ajouter une note d'investigation
   * NOTE: Cette fonctionnalité sera implémentée dans une future version
   */
  static async addInvestigationNote(req: Request, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Fonctionnalité non implémentée pour le moment',
      });
    } catch (error) {
      logger.error('Erreur ajout note:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'ajout de la note',
      });
    }
  }

  /**
   * POST /api/cases/:id/close - Fermer un case
   */
  static async closeCase(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const { closureNotes } = req.body;

      const closedCase = await CaseService.closeCase(tenantId, id, closureNotes);

      res.json({
        success: true,
        data: closedCase,
      });
    } catch (error) {
      logger.error('Erreur fermeture case:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la fermeture du case',
      });
    }
  }

  /**
   * GET /api/cases/stats - Récupérer les statistiques
   */
  static async getCaseStats(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await CaseService.getCaseStats(tenantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Erreur récupération stats:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      });
    }
  }
}

