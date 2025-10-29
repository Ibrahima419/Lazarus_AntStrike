/**
 * 📦 STIX Controller
 */

import { Request, Response, NextFunction } from 'express';
import { STIXParserService } from '../services/stix-parser.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class STIXController {
  /**
   * POST /api/stix/import
   * Importer un STIX bundle
   */
  static async importBundle(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { bundle } = req.body;

      if (!bundle) {
        throw new BadRequestError('STIX bundle required');
      }

      const result = await STIXParserService.importBundle(tenantId, bundle);

      res.status(201).json({
        success: true,
        message: 'STIX bundle imported',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/stix/import/file
   * Importer fichier STIX
   */
  static async importFile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { fileContent } = req.body;

      if (!fileContent) {
        throw new BadRequestError('File content required');
      }

      const result = await STIXParserService.importSTIXFile(tenantId, fileContent);

      res.status(201).json({
        success: true,
        message: 'STIX file imported',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/stix/parse
   * Parser un bundle sans importer
   */
  static async parseBundle(req: Request, res: Response, next: NextFunction) {
    try {
      const { bundle } = req.body;

      if (!bundle) {
        throw new BadRequestError('STIX bundle required');
      }

      const result = await STIXParserService.parseBundle(bundle);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/stix/validate
   * Valider un STIX bundle
   */
  static async validateBundle(req: Request, res: Response, next: NextFunction) {
    try {
      const { bundle } = req.body;

      if (!bundle) {
        throw new BadRequestError('STIX bundle required');
      }

      const validation = STIXParserService.validateBundle(bundle);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/stix/export
   * Exporter IOCs en STIX
   */
  static async exportBundle(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { iocTypes, severity, dateFrom, dateTo } = req.query;

      const filters = {
        iocTypes: iocTypes ? (iocTypes as string).split(',') : undefined,
        severity: severity as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const bundle = await STIXParserService.exportToSTIX(tenantId, filters);

      res.json({
        success: true,
        data: bundle
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/stix/export/iocs
   * Exporter IOCs spécifiques en STIX
   */
  static async exportIOCs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { iocIds } = req.body;

      if (!Array.isArray(iocIds)) {
        throw new BadRequestError('IOC IDs array required');
      }

      const bundle = await STIXParserService.createBundleFromIOCs(tenantId, iocIds);

      res.json({
        success: true,
        data: bundle
      });
    } catch (error) {
      next(error);
    }
  }
}




