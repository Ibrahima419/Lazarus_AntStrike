/**
 * 📊 Reporting Service
 * Génération rapports CTI (HTML, PDF, CSV, JSON)
 */

import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { TaranisProxyService } from './taranis-proxy.service';
import { EmailService } from './email.service';
import { NotFoundError, BadRequestError } from '../utils/errors';

export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND' | 'INCIDENT';
export type ReportFormat = 'HTML' | 'PDF' | 'JSON' | 'CSV';

interface GenerateReportOptions {
  tenantId: string;
  type: ReportType;
  format: ReportFormat;
  period?: string; // '24h', '7d', '30d'
  dateFrom?: string;
  dateTo?: string;
  sendEmail?: boolean;
  recipients?: string[];
}

export class ReportingService {
  /**
   * Générer rapport
   */
  static async generateReport(options: GenerateReportOptions) {
    const {
      tenantId,
      type,
      format,
      period = '24h',
      dateFrom,
      dateTo,
      sendEmail = false,
      recipients = []
    } = options;

    logger.info('Generating report', { tenantId, type, format, period });

    try {
      // 1. Récupérer données (threats + alerts)
      const data = await this.fetchReportData(tenantId, dateFrom, dateTo, period);

      // 2. Générer contenu selon format
      let content: string;
      let mimeType: string;

      switch (format) {
        case 'HTML':
          content = this.generateHTMLReport(data, type, period);
          mimeType = 'text/html';
          break;

        case 'JSON':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          break;

        case 'CSV':
          content = this.generateCSVReport(data);
          mimeType = 'text/csv';
          break;

        case 'PDF':
          // TODO: Implémenter PDF avec Puppeteer
          throw new BadRequestError('PDF generation not yet implemented');

        default:
          throw new BadRequestError(`Format ${format} not supported`);
      }

      // 3. Enregistrer dans reports
      const reportLog = await prisma.report.create({
        data: {
          tenantId,
          name: this.getReportTitle(type, period),
          type,
          format,
          data: {
            title: this.getReportTitle(type, period),
            storiesCount: data.threats.length,
            period,
            sentTo: recipients,
            sentVia: sendEmail ? 'email' : 'download',
            stats: data.stats
          }
        }
      });

      logger.info('Report generated', {
        reportId: reportLog.id,
        type,
        format,
        threatsCount: data.threats.length
      });

      // 4. Envoyer par email si demandé
      if (sendEmail && recipients.length > 0) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId }
        });

        if (tenant) {
          await EmailService.sendReportEmail(tenant, {
            id: reportLog.id,
            title: (reportLog.data as any).title,
            storiesCount: data.threats.length,
            period,
            criticalCount: data.stats.critical,
            highCount: data.stats.high,
            mediumCount: data.stats.medium
          });
        }
      }

      return {
        id: reportLog.id,
        content,
        mimeType,
        filename: this.getFilename(type, period, format)
      };
    } catch (error: any) {
      logger.error('Error generating report', {
        tenantId,
        type,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupérer données pour rapport
   */
  private static async fetchReportData(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string,
    period?: string
  ) {
    // Calculer dates si period fournie
    let from = dateFrom ? new Date(dateFrom) : new Date();
    let to = dateTo ? new Date(dateTo) : new Date();

    if (period) {
      to = new Date();
      if (period === '24h') {
        from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      } else if (period === '7d') {
        from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === '30d') {
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Récupérer threats depuis Taranis
    const threatsResponse = await TaranisProxyService.getStories(tenantId, {
      limit: 1000,
      // TODO: Filter par date (timefrom, timeto)
    });

    const threats = threatsResponse.items || [];

    // Récupérer alerts depuis database
    const alerts = await prisma.alert.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: from,
          lte: to
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer stats
    const stats = {
      total: threats.length,
      critical: threats.filter((t: any) => t.relevance >= 4).length,
      high: threats.filter((t: any) => t.relevance === 3).length,
      medium: threats.filter((t: any) => t.relevance === 2).length,
      low: threats.filter((t: any) => t.relevance <= 1).length,
      alerts: {
        total: alerts.length,
        new: alerts.filter(a => a.status === 'NEW').length,
        resolved: alerts.filter(a => a.status === 'RESOLVED').length
      }
    };

    return {
      tenant: await prisma.tenant.findUnique({ where: { id: tenantId } }),
      threats,
      alerts,
      stats,
      period: { from, to }
    };
  }

  /**
   * Générer rapport HTML
   */
  private static generateHTMLReport(data: any, type: string, period: string): string {
    const { tenant, threats, alerts, stats } = data;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport CTI - ${tenant?.name || 'AntStrike'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #e2e8f0;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #06b6d4, #2563eb);
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 30px;
      box-shadow: 0 20px 50px rgba(6, 182, 212, 0.3);
    }
    .header h1 { font-size: 36px; margin-bottom: 10px; }
    .header p { font-size: 16px; opacity: 0.9; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(30, 41, 59, 0.8);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    .stat-value {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stat-label { font-size: 14px; color: #94a3b8; }
    .critical { color: #ef4444; }
    .high { color: #f97316; }
    .medium { color: #f59e0b; }
    .low { color: #3b82f6; }
    .section {
      background: rgba(30, 41, 59, 0.6);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #06b6d4;
    }
    .threat-item {
      background: rgba(15, 23, 42, 0.8);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 4px solid #06b6d4;
    }
    .threat-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .threat-meta { font-size: 12px; color: #94a3b8; }
    .footer {
      text-align: center;
      padding: 30px;
      color: #64748b;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
    .badge-critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .badge-high { background: rgba(249, 115, 22, 0.2); color: #f97316; }
    .badge-medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🛡️ Rapport Cyber Threat Intelligence</h1>
      <p>${tenant?.name || 'Organisation'} • ${this.formatPeriod(period)} • Généré le ${new Date().toLocaleString('fr-FR')}</p>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value critical">${stats.critical}</div>
        <div class="stat-label">Menaces Critiques</div>
      </div>
      <div class="stat-card">
        <div class="stat-value high">${stats.high}</div>
        <div class="stat-label">Menaces Élevées</div>
      </div>
      <div class="stat-card">
        <div class="stat-value medium">${stats.medium}</div>
        <div class="stat-label">Menaces Moyennes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Menaces</div>
      </div>
    </div>

    <!-- Résumé Exécutif -->
    <div class="section">
      <h2>📋 Résumé Exécutif</h2>
      <p style="line-height: 1.8; color: #cbd5e1;">
        Durant la période ${this.formatPeriod(period)}, nous avons identifié <strong>${stats.total} menaces</strong>,
        dont <strong class="critical">${stats.critical} critiques</strong> et 
        <strong class="high">${stats.high} élevées</strong>.
        Un total de <strong>${stats.alerts.total} alertes</strong> ont été générées,
        avec <strong>${stats.alerts.resolved} résolues</strong>.
      </p>
    </div>

    <!-- Top Menaces -->
    <div class="section">
      <h2>🎯 Top Menaces</h2>
      ${threats.slice(0, 10).map((threat: any) => `
        <div class="threat-item">
          <div class="threat-title">
            ${threat.relevance >= 4 ? '<span class="badge badge-critical">CRITIQUE</span>' : ''}
            ${threat.relevance === 3 ? '<span class="badge badge-high">ÉLEVÉ</span>' : ''}
            ${threat.relevance === 2 ? '<span class="badge badge-medium">MOYEN</span>' : ''}
            ${threat.title}
          </div>
          <div class="threat-meta">
            📅 ${new Date(threat.created).toLocaleDateString('fr-FR')} • 
            📰 ${threat.news_items?.length || 0} sources • 
            🎯 Score: ${threat.relevance}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Alertes -->
    <div class="section">
      <h2>🚨 Alertes Générées</h2>
      <p style="margin-bottom: 16px; color: #cbd5e1;">
        <strong>${stats.alerts.total}</strong> alertes au total • 
        <strong class="critical">${stats.alerts.new}</strong> nouvelles • 
        <strong style="color: #10b981;">${stats.alerts.resolved}</strong> résolues
      </p>
      ${alerts.slice(0, 5).map((alert: any) => `
        <div class="threat-item">
          <div class="threat-title">
            ${alert.severity === 'CRITICAL' ? '<span class="badge badge-critical">CRITIQUE</span>' : ''}
            ${alert.severity === 'HIGH' ? '<span class="badge badge-high">ÉLEVÉ</span>' : ''}
            ${alert.title}
          </div>
          <div class="threat-meta">
            🏷️ ${alert.category} • 
            🎯 ${alert.priority} • 
            📊 ${alert.status}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Rapport généré par <strong>AntStrike CTI Platform</strong></p>
      <p style="margin-top: 8px;">Sécurisé • Confidentiel • ${tenant?.name}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Générer rapport CSV
   */
  private static generateCSVReport(data: any): string {
    const { threats } = data;

    const headers = ['ID', 'Titre', 'Créé', 'Relevance', 'Sources', 'Tags'];
    const rows = threats.map((t: any) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      new Date(t.created).toISOString(),
      t.relevance,
      t.news_items?.length || 0,
      t.tags?.map((tag: any) => tag.name).join('; ') || ''
    ]);

    return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
  }

  /**
   * Get report logs
   */
  static async getReports(tenantId: string, limit = 50) {
    const reports = await prisma.report.findMany({
      where: { tenantId },
      orderBy: { generatedAt: 'desc' },
      take: limit
    });

    return reports;
  }

  /**
   * Get report by ID
   */
  static async getReport(reportId: string, tenantId: string) {
    const report = await prisma.report.findFirst({
      where: { id: reportId, tenantId }
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    return report;
  }

  /**
   * Helper: Format period
   */
  private static formatPeriod(period: string): string {
    if (period === '24h') return 'dernières 24 heures';
    if (period === '7d') return '7 derniers jours';
    if (period === '30d') return '30 derniers jours';
    return period;
  }

  /**
   * Helper: Get report title
   */
  private static getReportTitle(type: string, period: string): string {
    const formattedPeriod = this.formatPeriod(period);
    return `Rapport ${type} - ${formattedPeriod}`;
  }

  /**
   * Helper: Get filename
   */
  private static getFilename(type: string, period: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `rapport_cti_${type.toLowerCase()}_${period}_${timestamp}.${format.toLowerCase()}`;
  }
}

