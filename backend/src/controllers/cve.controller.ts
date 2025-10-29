/**
 * 🔍 CVE Controller
 */

import { Request, Response, NextFunction } from 'express';
import { CVEEnrichmentService } from '../services/cve-enrichment.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class CVEController {
  /**
   * POST /api/cve/enrich
   * Enrichir un CVE
   */
  static async enrichCVE(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { cveId } = req.body;

      if (!cveId) {
        throw new BadRequestError('CVE ID required');
      }

      const enrichment = await CVEEnrichmentService.enrichAndStore(tenantId, cveId);

      res.json({
        success: true,
        data: enrichment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cve/bulk-enrich
   * Enrichir plusieurs CVEs
   */
  static async bulkEnrich(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { cveIds } = req.body;

      if (!Array.isArray(cveIds) || cveIds.length === 0) {
        throw new BadRequestError('CVE IDs array required');
      }

      if (cveIds.length > 100) {
        throw new BadRequestError('Maximum 100 CVEs per request');
      }

      logger.info(`Bulk enriching ${cveIds.length} CVEs for tenant ${tenantId}`);

      const stats = await CVEEnrichmentService.importBulkCVEs(tenantId, cveIds);

      res.json({
        success: true,
        message: `${stats.imported} CVEs enriched`,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cve/search
   * Rechercher CVEs récents
   */
  static async searchRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const { lastDays, severity, keyword, limit } = req.query;

      const cves = await CVEEnrichmentService.searchRecentCVEs({
        lastDays: lastDays ? parseInt(lastDays as string) : 7,
        severity: severity as string,
        keyword: keyword as string,
        limit: limit ? parseInt(limit as string) : 100
      });

      res.json({
        success: true,
        data: cves,
        count: cves.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cve/:cveId
   * Obtenir détails d'un CVE
   */
  static async getCVE(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { cveId } = req.params;

      const { prisma } = await import('../config/database');
      
      const cve = await prisma.cVEVulnerability.findFirst({
        where: {
          tenantId,
          cveId: cveId.toUpperCase()
        }
      });

      if (!cve) {
        // Si pas trouvé, enrichir à la volée
        const enrichment = await CVEEnrichmentService.enrichAndStore(tenantId, cveId.toUpperCase());
        
        return res.json({
          success: true,
          data: enrichment
        });
      }

      res.json({
        success: true,
        data: cve
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cve
   * Liste des CVEs enrichis
   */
  static async listCVEs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { severity, limit, offset } = req.query;

      const { prisma } = await import('../config/database');

      const where: any = { tenantId };
      if (severity) {
        where.severity = severity;
      }

      const cves = await prisma.cVEVulnerability.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0
      });

      const total = await prisma.cVEVulnerability.count({ where });

      res.json({
        success: true,
        data: cves,
        total,
        count: cves.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cve/stats
   * Statistiques CVE
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await CVEEnrichmentService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cve/import-recent
   * Importer CVEs récents automatiquement
   */
  static async importRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { lastDays, severity, limit } = req.body;

      logger.info(`Importing recent CVEs for tenant ${tenantId}`, {
        lastDays: lastDays || 7,
        severity,
        limit: limit || 50
      });

      // Rechercher CVEs récents
      const cves = await CVEEnrichmentService.searchRecentCVEs({
        lastDays: lastDays || 7,
        severity,
        limit: limit || 50
      });

      // Importer
      const cveIds = cves.map(cve => cve.cveId);
      const stats = await CVEEnrichmentService.importBulkCVEs(tenantId, cveIds);

      res.json({
        success: true,
        message: `${stats.imported} new CVEs imported`,
        data: {
          found: cves.length,
          ...stats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}




