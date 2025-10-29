/**
 * 📧 Email Service
 * SendGrid ou Resend
 */

import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class EmailService {
  private static transporter: any;

  /**
   * Initialiser transporter
   */
  private static getTransporter() {
    if (!this.transporter) {
      // Pour dev: console transport
      if (process.env.NODE_ENV === 'development') {
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
      } else {
        // Production: SendGrid SMTP ou autre
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      }
    }
    return this.transporter;
  }

  /**
   * Envoyer email d'alerte
   */
  static async sendAlertEmail(tenant: any, alert: any) {
    try {
      const transporter = this.getTransporter();

      const severityColors: any = {
        CRITICAL: '#DC2626',
        HIGH: '#EA580C',
        MEDIUM: '#F59E0B',
        LOW: '#3B82F6',
        INFO: '#6B7280'
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .ioc { background: #fee2e2; padding: 8px; border-left: 3px solid #ef4444; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Nouvelle Alerte: ${alert.severity}</h1>
              <p style="margin: 0;">Priorité: ${alert.priority} | Catégorie: ${alert.category}</p>
            </div>
            
            <div class="content">
              <h2>${alert.title}</h2>
              <p>${alert.summary}</p>
              
              ${alert.iocs && alert.iocs.length > 0 ? `
                <h3>🔍 Indicateurs de Compromission (IOCs)</h3>
                ${alert.iocs.map((ioc: string) => `
                  <div class="ioc">${ioc}</div>
                `).join('')}
              ` : ''}
              
              ${alert.recommendedActions && alert.recommendedActions.length > 0 ? `
                <h3>✅ Actions Recommandées</h3>
                <ul>
                  ${alert.recommendedActions.map((action: string) => `
                    <li>${action}</li>
                  `).join('')}
                </ul>
              ` : ''}
              
              <p style="margin-top: 20px;">
                <strong>SLA:</strong> Réponse requise avant ${new Date(alert.slaDeadline).toLocaleString('fr-FR')}
              </p>
            </div>
            
            <div class="footer">
              <p>AntStrike CTI Platform - ${tenant.name}</p>
              <p style="font-size: 12px; margin: 5px 0;">
                <a href="${process.env.FRONTEND_URL}/alerts/${alert.id}" style="color: #60a5fa;">
                  Voir dans la plateforme →
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Récupérer emails admin depuis tenant settings
      const settings = tenant.settings as any || {};
      const adminEmails = settings.alertEmails || settings.adminEmails || [];
      
      // Fallback: récupérer tous les admins du tenant
      if (adminEmails.length === 0) {
        const adminUsers = await prisma.user.findMany({
          where: { 
            tenantId: tenant.id,
            role: { in: ['ADMIN', 'MANAGER'] }
          },
          select: { email: true }
        });
        adminEmails.push(...adminUsers.map(u => u.email));
      }

      // Si toujours aucun email, utiliser email de fallback
      const recipients = adminEmails.length > 0 
        ? adminEmails.join(', ') 
        : process.env.FALLBACK_ALERT_EMAIL || 'alerts@antstrike-cti.com';

      await transporter.sendMail({
        from: process.env.SENDGRID_FROM || 'noreply@antstrike-cti.com',
        to: recipients,
        subject: `🚨 [${alert.severity}] ${alert.title}`,
        html
      });

      logger.info('Alert email sent', { 
        alertId: alert.id, 
        tenantId: tenant.id 
      });
    } catch (error: any) {
      logger.error('Error sending alert email', { 
        alertId: alert.id, 
        error: error.message 
      });
    }
  }

  /**
   * Envoyer rapport par email
   */
  static async sendReportEmail(tenant: any, report: any) {
    try {
      const transporter = this.getTransporter();

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat { flex: 1; text-align: center; background: white; padding: 15px; border-radius: 8px; }
            .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 ${report.title}</h1>
              <p style="margin: 0;">Période: ${report.period}</p>
            </div>
            
            <div class="content">
              <h2>Résumé Exécutif</h2>
              <p>Ce rapport couvre ${report.storiesCount} menaces analysées durant la période.</p>
              
              <div class="stats">
                <div class="stat">
                  <h3 style="color: #ef4444; margin: 0;">${report.criticalCount || 0}</h3>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Critiques</p>
                </div>
                <div class="stat">
                  <h3 style="color: #f59e0b; margin: 0;">${report.highCount || 0}</h3>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Élevées</p>
                </div>
                <div class="stat">
                  <h3 style="color: #3b82f6; margin: 0;">${report.mediumCount || 0}</h3>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Moyennes</p>
                </div>
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/reports/${report.id}" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  📥 Télécharger Rapport Complet
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>AntStrike CTI Platform - ${tenant.name}</p>
              <p style="font-size: 12px; margin: 5px 0;">
                Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Récupérer distribution list depuis tenant settings
      const settings = tenant.settings as any || {};
      const reportEmails = settings.reportEmails || settings.adminEmails || [];
      
      // Fallback: récupérer admins et managers
      if (reportEmails.length === 0) {
        const users = await prisma.user.findMany({
          where: { 
            tenantId: tenant.id,
            role: { in: ['ADMIN', 'MANAGER', 'ANALYST'] }
          },
          select: { email: true }
        });
        reportEmails.push(...users.map(u => u.email));
      }

      const recipients = reportEmails.length > 0 
        ? reportEmails.join(', ') 
        : process.env.FALLBACK_REPORT_EMAIL || 'reports@antstrike-cti.com';

      await transporter.sendMail({
        from: process.env.SENDGRID_FROM || 'reports@antstrike-cti.com',
        to: recipients,
        subject: `📊 ${report.title}`,
        html
      });

      logger.info('Report email sent', { 
        reportId: report.id, 
        tenantId: tenant.id 
      });
    } catch (error: any) {
      logger.error('Error sending report email', { 
        reportId: report.id, 
        error: error.message 
      });
    }
  }
}



