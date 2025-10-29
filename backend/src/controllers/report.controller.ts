/**
 * 📊 Report Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ReportingService } from '../services/reporting.service';
import { BadRequestError } from '../utils/errors';

export class ReportController {
  /**
   * GET /api/reports
   */
  static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { limit } = req.query;

      const reports = await ReportingService.getReports(
        tenantId,
        limit ? parseInt(limit as string) : 50
      );

      res.json(reports);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reports/generate
   */
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const {
        type,
        format,
        period,
        dateFrom,
        dateTo,
        sendEmail,
        recipients
      } = req.body;

      if (!type || !format) {
        throw new BadRequestError('Type and format are required');
      }

      const result = await ReportingService.generateReport({
        tenantId,
        type,
        format,
        period,
        dateFrom,
        dateTo,
        sendEmail,
        recipients
      });

      res.json({
        message: 'Report generated successfully',
        reportId: result.id,
        filename: result.filename,
        mimeType: result.mimeType,
        content: result.content
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/:id
   */
  static async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const report = await ReportingService.getReport(id, tenantId);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/:id/download
   */
  static async downloadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const report = await ReportingService.getReport(id, tenantId);

      // Regénérer contenu (ou stocker dans DB - TODO)
      const result = await ReportingService.generateReport({
        tenantId,
        type: report.type as any,
        format: report.format as any,
        period: (report.data as any).period || 'unknown'
      });

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.content);
    } catch (error) {
      next(error);
    }
  }
}


