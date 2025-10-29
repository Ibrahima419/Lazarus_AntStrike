/**
 * ⏰ COLLECTION SCHEDULER
 * Automatise la collecte de threat intelligence selon planning
 */

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { CollectionOrchestrator } from '../services/collection-orchestrator.service';
import { prisma } from '../config/database';
import { cleanQueue } from '../queues/collection.queue';

/**
 * Initialiser tous les schedulers
 */
export function initializeCollectionSchedulers() {
  logger.info('🕐 Initializing collection schedulers...');
  
  // 1. Collecte complète toutes les 6 heures
  scheduleFullCollection();
  
  // 2. Collecte Taranis rapide toutes les heures
  scheduleTaranisCollection();
  
  // 3. Nettoyage queue quotidien
  scheduleQueueCleaning();
  
  logger.info('✅ Collection schedulers initialized');
}

/**
 * Collecte complète (toutes sources) - Toutes les 6h
 */
function scheduleFullCollection() {
  // Cron: À 00:00, 06:00, 12:00, 18:00
  cron.schedule('0 */6 * * *', async () => {
    logger.info('🎯 Starting scheduled full collection');
    
    try {
      // Récupérer tous les tenants actifs
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
      });
      
      logger.info(`Found ${tenants.length} active tenants`);
      
      // Collecter pour chaque tenant
      for (const tenant of tenants) {
        try {
          logger.info(`Collecting for tenant: ${tenant.name}`, {
            tenantId: tenant.id
          });
          
          const result = await CollectionOrchestrator.orchestrateCollection(tenant.id);
          
          logger.info(`✅ Collection completed for ${tenant.name}`, {
            duration: result.duration,
            totalItems: result.totalItemsCollected,
            successRate: `${result.successRate}%`
          });
          
        } catch (error: any) {
          logger.error(`❌ Collection failed for tenant ${tenant.name}`, {
            tenantId: tenant.id,
            error: error.message
          });
        }
      }
      
      logger.info('✅ Scheduled full collection completed');
      
    } catch (error: any) {
      logger.error('❌ Scheduled collection failed', {
        error: error.message
      });
    }
  });
  
  logger.info('✅ Full collection scheduled (every 6 hours)');
}

/**
 * Collecte Taranis rapide - Toutes les heures
 */
function scheduleTaranisCollection() {
  // Cron: Toutes les heures
  cron.schedule('0 * * * *', async () => {
    logger.info('📡 Starting scheduled Taranis collection');
    
    try {
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      
      for (const tenant of tenants) {
        try {
          await CollectionOrchestrator.collectFromSource(tenant.id, 'taranis');
        } catch (error: any) {
          logger.error('Taranis collection failed', {
            tenantId: tenant.id,
            error: error.message
          });
        }
      }
      
      logger.info('✅ Scheduled Taranis collection completed');
      
    } catch (error: any) {
      logger.error('❌ Scheduled Taranis collection failed', {
        error: error.message
      });
    }
  });
  
  logger.info('✅ Taranis collection scheduled (every hour)');
}

/**
 * Nettoyage queue - Quotidien à 2h du matin
 */
function scheduleQueueCleaning() {
  // Cron: Tous les jours à 02:00
  cron.schedule('0 2 * * *', async () => {
    logger.info('🧹 Starting scheduled queue cleaning');
    
    try {
      await cleanQueue();
      logger.info('✅ Queue cleaned successfully');
    } catch (error: any) {
      logger.error('❌ Queue cleaning failed', {
        error: error.message
      });
    }
  });
  
  logger.info('✅ Queue cleaning scheduled (daily at 2:00 AM)');
}

/**
 * Collecte manuelle immédiate
 */
export async function triggerManualCollection(tenantId: string): Promise<any> {
  logger.info('🚀 Manual collection triggered', { tenantId });
  
  try {
    const result = await CollectionOrchestrator.orchestrateCollection(tenantId);
    
    logger.info('✅ Manual collection completed', {
      tenantId,
      duration: result.duration,
      totalItems: result.totalItemsCollected
    });
    
    return result;
    
  } catch (error: any) {
    logger.error('❌ Manual collection failed', {
      tenantId,
      error: error.message
    });
    throw error;
  }
}



