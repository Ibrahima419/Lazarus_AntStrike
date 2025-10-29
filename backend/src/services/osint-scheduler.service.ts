/**
 * ⏰ OSINT Feeds Auto-Import Scheduler
 * Import automatique périodique des feeds OSINT
 */

import * as cron from 'node-cron';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { OSINTFeedsService } from './osint-feeds.service';

export class OSINTSchedulerService {
  private static scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Démarrer tous les schedulers OSINT actifs
   */
  static async startAllSchedulers(): Promise<void> {
    try {
      logger.info('Starting OSINT feed schedulers...');

      const tenants = await prisma.tenant.findMany({
        where: { isActive: true }
      });

      let activeSchedulers = 0;

      for (const tenant of tenants) {
        const settings = ({} as Record<string, any>);
        const osintConfig = settings?.osintFeeds;

        if (osintConfig?.enabled && osintConfig?.autoImport) {
          await this.startScheduler(tenant.id, osintConfig.importInterval || 24);
          activeSchedulers++;
        }
      }

      logger.info(`OSINT schedulers started: ${activeSchedulers} active`);
    } catch (error) {
      logger.error('Error starting OSINT schedulers:', error);
    }
  }

  /**
   * Démarrer scheduler pour un tenant
   */
  static async startScheduler(tenantId: string, intervalHours: number = 24): Promise<void> {
    try {
      // Arrêter scheduler existant
      this.stopScheduler(tenantId);

      // Convertir intervalle en cron
      const cronExpression = this.intervalToCron(intervalHours);

      logger.info(`Starting OSINT scheduler for tenant ${tenantId}: ${cronExpression}`);

      const task = cron.schedule(cronExpression, async () => {
        await this.executeImportJob(tenantId);
      });

      this.scheduledJobs.set(tenantId, task);
    } catch (error) {
      logger.error(`Error starting OSINT scheduler for tenant ${tenantId}:`, error);
    }
  }

  /**
   * Arrêter scheduler pour un tenant
   */
  static stopScheduler(tenantId: string): void {
    const task = this.scheduledJobs.get(tenantId);
    if (task) {
      task.stop();
      this.scheduledJobs.delete(tenantId);
      logger.info(`OSINT scheduler stopped for tenant ${tenantId}`);
    }
  }

  /**
   * Arrêter tous les schedulers
   */
  static stopAllSchedulers(): void {
    logger.info(`Stopping ${this.scheduledJobs.size} OSINT schedulers...`);
    
    for (const [tenantId, task] of this.scheduledJobs) {
      task.stop();
    }
    
    this.scheduledJobs.clear();
    logger.info('All OSINT schedulers stopped');
  }

  /**
   * Exécuter job d'import
   */
  private static async executeImportJob(tenantId: string): Promise<void> {
    try {
      logger.info(`Executing OSINT feed import job for tenant ${tenantId}`);

      const results = await OSINTFeedsService.importAllFeeds(tenantId);

      const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

      logger.info(`OSINT import job completed for tenant ${tenantId}:`, {
        feeds: results.length,
        imported: totalImported,
        errors: totalErrors
      });

      // Notification si beaucoup de nouveaux IOCs
      if (totalImported > 100) {
        await this.sendImportNotification(tenantId, totalImported);
      }
    } catch (error: any) {
      logger.error(`OSINT import job failed for tenant ${tenantId}:`, error.message);
    }
  }

  /**
   * Convertir intervalle en cron
   */
  private static intervalToCron(hours: number): string {
    if (hours <= 1) return '0 * * * *';        // Toutes les heures
    if (hours <= 6) return '0 */6 * * *';      // Toutes les 6h
    if (hours <= 12) return '0 */12 * * *';    // Toutes les 12h
    return '0 0 * * *';  // 24h (par défaut - minuit)
  }

  /**
   * Envoyer notification
   */
  private static async sendImportNotification(
    tenantId: string,
    count: number
  ): Promise<void> {
    try {
      logger.info(`OSINT import notification: ${count} new IOCs for tenant ${tenantId}`);
      // TODO: Intégrer avec EmailService
    } catch (error) {
      logger.warn('Failed to send OSINT import notification:', error);
    }
  }

  /**
   * Obtenir état des schedulers
   */
  static getSchedulersStatus(): Array<{ tenantId: string; active: boolean }> {
    return Array.from(this.scheduledJobs.entries()).map(([tenantId, task]) => ({
      tenantId,
      active: true
    }));
  }

  /**
   * Restart scheduler (après update config)
   */
  static async restartScheduler(tenantId: string): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = {} as Record<string, any> as any;
    const osintConfig = settings?.osintFeeds;

    if (osintConfig?.enabled && osintConfig?.autoImport) {
      await this.startScheduler(tenantId, osintConfig.importInterval || 24);
    } else {
      this.stopScheduler(tenantId);
    }
  }
}




