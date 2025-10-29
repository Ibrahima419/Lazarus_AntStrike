/**
 * 📧 Notification Service
 * Multi-channel notifications (Email, Slack, Teams, PagerDuty, Webhooks)
 */

import { logger } from '../utils/logger';
import axios from 'axios';

interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'pagerduty' | 'webhook' | 'sms';
  name: string;
  config: any;
  enabled: boolean;
}

interface NotificationPayload {
  title: string;
  message: string;
  severity: string;
  alertId?: string;
  metadata?: any;
}

export class NotificationService {
  /**
   * Envoyer notification sur tous les canaux configurés
   */
  static async sendNotification(
    tenantId: string,
    payload: NotificationPayload,
    channels?: string[]
  ): Promise<any> {
    try {
      logger.info(`Sending notification: ${payload.title}`);

      // TODO: Récupérer channels configurés depuis DB
      const results: any[] = [];

      // Pour l'instant, simulations
      if (!channels || channels.includes('email')) {
        const emailResult = await this.sendEmail(payload);
        results.push({ channel: 'email', ...emailResult });
      }

      if (!channels || channels.includes('slack')) {
        const slackResult = await this.sendSlack(payload);
        results.push({ channel: 'slack', ...slackResult });
      }

      if (!channels || channels.includes('teams')) {
        const teamsResult = await this.sendTeams(payload);
        results.push({ channel: 'teams', ...teamsResult });
      }

      if (!channels || channels.includes('webhook')) {
        const webhookResult = await this.sendWebhook(payload);
        results.push({ channel: 'webhook', ...webhookResult });
      }

      return {
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error: any) {
      logger.error('Error sending notification:', error.message);
      throw error;
    }
  }

  /**
   * Envoyer Email
   */
  private static async sendEmail(payload: NotificationPayload): Promise<any> {
    try {
      logger.info('Sending email notification');

      // TODO: Intégrer avec SMTP/SendGrid
      // Pour l'instant, simulation
      
      const emailConfig = {
        from: process.env.EMAIL_FROM || 'alerts@antstrike.io',
        to: process.env.EMAIL_TO || 'soc@company.com',
        subject: `[${payload.severity.toUpperCase()}] ${payload.title}`,
        html: this.buildEmailTemplate(payload)
      };

      logger.info(`Email would be sent to: ${emailConfig.to}`);

      return {
        success: true,
        sentAt: new Date(),
        config: emailConfig
      };
    } catch (error: any) {
      logger.error('Error sending email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Template Email HTML
   */
  private static buildEmailTemplate(payload: NotificationPayload): string {
    const severityColors: Record<string, string> = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };

    const color = severityColors[payload.severity] || '#6c757d';

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center; }
    .btn { background: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚨 ${payload.severity.toUpperCase()} Alert</h2>
      <p>${payload.title}</p>
    </div>
    <div class="content">
      <p>${payload.message}</p>
      ${payload.alertId ? `<p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${payload.alertId}" class="btn">View Alert</a></p>` : ''}
    </div>
    <div class="footer">
      <p>AntStrike CTI Platform | ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Envoyer Slack
   */
  private static async sendSlack(payload: NotificationPayload): Promise<any> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn('Slack webhook URL not configured');
        return { success: false, error: 'Webhook URL not configured' };
      }

      const severityEmoji: Record<string, string> = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      };

      const emoji = severityEmoji[payload.severity] || '⚪';

      const slackMessage = {
        text: `${emoji} *${payload.severity.toUpperCase()}* Alert`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ${payload.title}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:*\n${payload.severity}`
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${new Date().toISOString()}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: payload.message
            }
          }
        ]
      };

      if (payload.alertId) {
        slackMessage.blocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Alert'
              },
              url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${payload.alertId}`
            }
          ]
        } as any);
      }

      await axios.post(webhookUrl, slackMessage);

      logger.info('Slack notification sent');
      return { success: true, sentAt: new Date() };
    } catch (error: any) {
      logger.error('Error sending Slack notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer Microsoft Teams
   */
  private static async sendTeams(payload: NotificationPayload): Promise<any> {
    try {
      const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn('Teams webhook URL not configured');
        return { success: false, error: 'Webhook URL not configured' };
      }

      const severityColors: Record<string, string> = {
        critical: 'attention',
        high: 'warning',
        medium: 'good',
        low: 'good'
      };

      const teamsMessage = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: payload.title,
        themeColor: severityColors[payload.severity] || 'default',
        title: `🚨 ${payload.severity.toUpperCase()} Alert`,
        sections: [
          {
            activityTitle: payload.title,
            activitySubtitle: new Date().toISOString(),
            facts: [
              {
                name: 'Severity',
                value: payload.severity
              },
              {
                name: 'Alert ID',
                value: payload.alertId || 'N/A'
              }
            ],
            text: payload.message
          }
        ],
        potentialAction: payload.alertId ? [
          {
            '@type': 'OpenUri',
            name: 'View Alert',
            targets: [
              {
                os: 'default',
                uri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${payload.alertId}`
              }
            ]
          }
        ] : []
      };

      await axios.post(webhookUrl, teamsMessage);

      logger.info('Teams notification sent');
      return { success: true, sentAt: new Date() };
    } catch (error: any) {
      logger.error('Error sending Teams notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer PagerDuty
   */
  private static async sendPagerDuty(payload: NotificationPayload): Promise<any> {
    try {
      const apiKey = process.env.PAGERDUTY_API_KEY;
      const serviceKey = process.env.PAGERDUTY_SERVICE_KEY;

      if (!apiKey || !serviceKey) {
        logger.warn('PagerDuty not configured');
        return { success: false, error: 'PagerDuty not configured' };
      }

      const pdEvent = {
        routing_key: serviceKey,
        event_action: 'trigger',
        payload: {
          summary: payload.title,
          severity: payload.severity,
          source: 'AntStrike CTI',
          custom_details: {
            message: payload.message,
            alert_id: payload.alertId
          }
        }
      };

      await axios.post('https://events.pagerduty.com/v2/enqueue', pdEvent);

      logger.info('PagerDuty incident created');
      return { success: true, sentAt: new Date() };
    } catch (error: any) {
      logger.error('Error sending PagerDuty notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer Webhook générique
   */
  private static async sendWebhook(payload: NotificationPayload): Promise<any> {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn('Webhook URL not configured');
        return { success: false, error: 'Webhook URL not configured' };
      }

      const webhookPayload = {
        event: 'alert.created',
        timestamp: new Date().toISOString(),
        data: {
          title: payload.title,
          message: payload.message,
          severity: payload.severity,
          alertId: payload.alertId,
          metadata: payload.metadata
        }
      };

      await axios.post(webhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-AntStrike-Signature': this.generateWebhookSignature(webhookPayload)
        }
      });

      logger.info('Webhook notification sent');
      return { success: true, sentAt: new Date() };
    } catch (error: any) {
      logger.error('Error sending webhook notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer signature webhook
   */
  private static generateWebhookSignature(payload: any): string {
    const secret = process.env.WEBHOOK_SECRET || 'default-secret';
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Tester un channel
   */
  static async testChannel(
    type: string,
    config: any
  ): Promise<any> {
    const testPayload: NotificationPayload = {
      title: 'Test Notification',
      message: 'This is a test notification from AntStrike CTI',
      severity: 'low'
    };

    switch (type) {
      case 'email':
        return await this.sendEmail(testPayload);
      case 'slack':
        return await this.sendSlack(testPayload);
      case 'teams':
        return await this.sendTeams(testPayload);
      case 'pagerduty':
        return await this.sendPagerDuty(testPayload);
      case 'webhook':
        return await this.sendWebhook(testPayload);
      default:
        return { success: false, error: 'Unknown channel type' };
    }
  }
}



