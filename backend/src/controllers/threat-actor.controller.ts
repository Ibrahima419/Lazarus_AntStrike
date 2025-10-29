/**
 * 🕵️ Threat Actor Controller
 * Gestion du profilage des acteurs de menace
 */

import { Request, Response, NextFunction } from 'express';
import { ThreatActorProfilingService } from '../services/threat-actor-profiling.service';
import { BadRequestError } from '../utils/errors';

export class ThreatActorController {
  /**
   * POST /api/analysis/threat-actor
   * Créer un profil threat actor
   */
  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const input = req.body;

      if (!input.name) {
        throw new BadRequestError('Threat actor name is required');
      }

      const actor = await ThreatActorProfilingService.createProfile(tenantId, input);

      res.status(201).json({
        success: true,
        data: actor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/threat-actor/:id
   * Obtenir un profil
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const actor = await ThreatActorProfilingService.getProfile(tenantId, id);

      if (!actor) {
        return res.status(404).json({
          success: false,
          error: 'Threat actor not found'
        });
      }

      res.json({
        success: true,
        data: actor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/threat-actors
   * Lister les threat actors
   */
  static async listProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { type, country, status, threatLevel } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (country) filters.country = country;
      if (status) filters.status = status;
      if (threatLevel) filters.threatLevel = threatLevel;

      const actors = await ThreatActorProfilingService.listProfiles(tenantId, filters);

      res.json({
        success: true,
        data: actors,
        count: actors.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/analysis/threat-actor/:id
   * Mettre à jour un profil
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const updates = req.body;

      const actor = await ThreatActorProfilingService.updateProfile(tenantId, id, updates);

      res.json({
        success: true,
        data: actor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analysis/threat-actor/:id/infrastructure
   * Ajouter infrastructure
   */
  static async addInfrastructure(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;
      const { type, value } = req.body;

      if (!type || !value) {
        throw new BadRequestError('type and value are required');
      }

      if (!['ip', 'domain', 'email'].includes(type)) {
        throw new BadRequestError('type must be: ip, domain, or email');
      }

      const result = await ThreatActorProfilingService.addInfrastructure(
        tenantId,
        id,
        type,
        value
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
   * POST /api/analysis/threat-actor/attribution
   * Attribution automatique
   */
  static async autoAttribution(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { iocs, ttps, tools, malware, targetSectors, country } = req.body;

      const result = await ThreatActorProfilingService.autoAttribution(tenantId, {
        iocs,
        ttps,
        tools,
        malware,
        targetSectors,
        country
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
   * POST /api/analysis/threat-actor/compare
   * Comparer deux threat actors
   */
  static async compareActors(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { actorId1, actorId2 } = req.body;

      if (!actorId1 || !actorId2) {
        throw new BadRequestError('actorId1 and actorId2 are required');
      }

      const comparison = await ThreatActorProfilingService.compareActors(
        tenantId,
        actorId1,
        actorId2
      );

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/threat-actor/:id/report
   * Générer rapport de profil
   */
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;
      const { id } = req.params;

      const report = await ThreatActorProfilingService.generateProfileReport(tenantId, id);

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
   * GET /api/analysis/threat-actor-stats
   * Stats globales
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as any).user;

      const stats = await ThreatActorProfilingService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}



