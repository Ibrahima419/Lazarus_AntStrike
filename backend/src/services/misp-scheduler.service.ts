/**
 * ⏰ MISP Auto-Sync Scheduler
 * Synchronisation automatique périodique des IOCs MISP
 */

import * as cron from 'node-cron';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { MISPClientService } from './misp-client.service';

export class MISPSchedulerService {
  private static scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Démarrer tous les schedulers MISP actifs
   */
  static async startAllSchedulers(): Promise<void> {
    try {
      logger.info('Starting MISP schedulers...');

      // Récupérer tous les tenants avec MISP autoSync activé
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true }
      });

      let activeSchedulers = 0;

      for (const tenant of tenants) {
        const settings = ({} as Record<string, any>);
        const mispConfig = settings?.misp;

        if (mispConfig?.enabled && mispConfig?.autoSync && mispConfig?.url && mispConfig?.apiKey) {
          await this.startScheduler(tenant.id, mispConfig.syncInterval || 3600);
          activeSchedulers++;
        }
      }

      logger.info(`MISP schedulers started: ${activeSchedulers} active`);
    } catch (error) {
      logger.error('Error starting MISP schedulers:', error);
    }
  }

  /**
   * Démarrer scheduler pour un tenant
   */
  static async startScheduler(tenantId: string, intervalSeconds: number = 3600): Promise<void> {
    try {
      // Arrêter scheduler existant si présent
      this.stopScheduler(tenantId);

      // Convertir intervalle en cron expression
      const cronExpression = this.intervalToCron(intervalSeconds);

      logger.info(`Starting MISP scheduler for tenant ${tenantId}: ${cronExpression}`);

      // Créer tâche cron
      const task = cron.schedule(cronExpression, async () => {
        await this.executeSyncJob(tenantId);
      });

      this.scheduledJobs.set(tenantId, task);

      // Lancer première sync immédiatement (optionnel)
      // await this.executeSyncJob(tenantId);
    } catch (error) {
      logger.error(`Error starting MISP scheduler for tenant ${tenantId}:`, error);
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
      logger.info(`MISP scheduler stopped for tenant ${tenantId}`);
    }
  }

  /**
   * Arrêter tous les schedulers
   */
  static stopAllSchedulers(): void {
    logger.info(`Stopping ${this.scheduledJobs.size} MISP schedulers...`);
    
    for (const [tenantId, task] of this.scheduledJobs) {
      task.stop();
    }
    
    this.scheduledJobs.clear();
    logger.info('All MISP schedulers stopped');
  }

  /**
   * Exécuter job de synchronisation
   */
  private static async executeSyncJob(tenantId: string): Promise<void> {
    try {
      logger.info(`Executing MISP sync job for tenant ${tenantId}`);

      const config = await MISPClientService.getTenantMISPConfig(tenantId);

      if (!config) {
        logger.warn(`MISP not configured for tenant ${tenantId}, stopping scheduler`);
        this.stopScheduler(tenantId);
        return;
      }

      const stats = await MISPClientService.syncIOCs(tenantId, config, {
        lastDays: 1,  // Sync dernières 24h
        autoEnrich: true
      });

      logger.info(`MISP sync job completed for tenant ${tenantId}`, stats);

      // Envoyer notification si beaucoup de nouveaux IOCs
      if (stats.imported > 50) {
        await this.sendSyncNotification(tenantId, stats);
      }
    } catch (error: any) {
      logger.error(`MISP sync job failed for tenant ${tenantId}:`, error.message);
    }
  }

  /**
   * Convertir intervalle (secondes) en cron expression
   */
  private static intervalToCron(seconds: number): string {
    // Intervalles standards
    if (seconds <= 300) return '*/5 * * * *';      // 5 min
    if (seconds <= 900) return '*/15 * * * *';     // 15 min
    if (seconds <= 1800) return '*/30 * * * *';    // 30 min
    if (seconds <= 3600) return '0 * * * *';       // 1h
    if (seconds <= 7200) return '0 */2 * * *';     // 2h
    if (seconds <= 21600) return '0 */6 * * *';    // 6h
    if (seconds <= 43200) return '0 */12 * * *';   // 12h
    return '0 0 * * *';  // 24h (par défaut)
  }

  /**
   * Envoyer notification après sync
   */
  private static async sendSyncNotification(
    tenantId: string,
    stats: { imported: number; skipped: number; errors: number }
  ): Promise<void> {
    try {
      // Récupérer tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) return;

      // Envoyer email ou créer alerte
      logger.info(`MISP sync notification: ${stats.imported} new IOCs for ${tenant.name}`);

      // TODO: Intégrer avec EmailService pour envoyer notification
      // await EmailService.sendMISPSyncNotification(tenant, stats);
    } catch (error) {
      logger.warn('Failed to send MISP sync notification:', error);
    }
  }

  /**
   * Obtenir état des schedulers
   */
  static getSchedulersStatus(): Array<{ tenantId: string; active: boolean }> {
    return Array.from(this.scheduledJobs.entries()).map(([tenantId, task]) => ({
      tenantId,
      active: true  // Si dans la Map, c'est actif
    }));
  }

  /**
   * Restart scheduler pour un tenant (après update config)
   */
  static async restartScheduler(tenantId: string): Promise<void> {
    const config = await MISPClientService.getTenantMISPConfig(tenantId);
    
    if (!config) {
      this.stopScheduler(tenantId);
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = {} as Record<string, any> as any;
    const mispConfig = settings?.misp;

    if (mispConfig?.enabled && mispConfig?.autoSync) {
      await this.startScheduler(tenantId, mispConfig.syncInterval || 3600);
    } else {
      this.stopScheduler(tenantId);
    }
  }
}




