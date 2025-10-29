/**
 * 🎯 Campaign Controller
 * Gestion du suivi des campagnes d'attaque
 */

import { Request, Response, NextFunction } from 'express';
import { CampaignTrackingService } from '../services/campaign-tracking.service';
import { BadRequestError } from '../utils/errors';

export class CampaignController {
  /**
   * POST /api/analysis/campaign
   * Créer une nouvelle campagne
   */
  static async createCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const input = req.body;

      if (!input.name) {
        throw new BadRequestError('Campaign name is required');
      }

      const campaign = await CampaignTrackingService.createCampaign(tenantId, input);

      res.status(201).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/campaign/:id
   * Obtenir une campagne
   */
  static async getCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const campaign = await CampaignTrackingService.getCampaign(tenantId, id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/campaigns
   * Lister les campagnes
   */
  static async listCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { status, threatActor, minConfidence } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (threatActor) filters.threatActor = threatActor;
      if (minConfidence) filters.minConfidence = parseInt(minConfidence as string);

      const campaigns = await CampaignTrackingService.listCampaigns(tenantId, filters);

      res.json({
        success: true,
        data: campaigns,
        count: campaigns.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/analysis/campaign/:id
   * Mettre à jour une campagne
   */
  static async updateCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const updates = req.body;

      const campaign = await CampaignTrackingService.updateCampaign(tenantId, id, updates);

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/campaign/:id/ioc
   * Ajouter IOC à une campagne
   */
  static async addIOC(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const { ioc } = req.body;

      if (!ioc) {
        throw new BadRequestError('IOC is required');
      }

      const result = await CampaignTrackingService.addIOC(tenantId, id, ioc);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/campaign/:id/ttp
   * Lier un TTP à une campagne
   */
  static async linkTTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const { ttpId } = req.body;

      if (!ttpId) {
        throw new BadRequestError('ttpId is required');
      }

      const ttp = await CampaignTrackingService.linkTTP(tenantId, id, ttpId);

      res.json({
        success: true,
        data: ttp
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/campaign/auto-detect
   * Auto-détecter campagnes depuis IOCs/TTPs
   */
  static async autoDetect(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocs, ttps, threatActor } = req.body;

      const result = await CampaignTrackingService.autoDetectCampaign(tenantId, {
        iocs,
        ttps,
        threatActor
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/campaign/:id/correlate
   * Corréler campagnes similaires
   */
  static async correlateCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const correlations = await CampaignTrackingService.correlateCampaigns(tenantId, id);

      res.json({
        success: true,
        data: correlations,
        count: correlations.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/campaign/:id/report
   * Générer rapport de campagne
   */
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const report = await CampaignTrackingService.generateCampaignReport(tenantId, id);

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
   * GET /api/analysis/campaign-stats
   * Stats globales campagnes
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await CampaignTrackingService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}



