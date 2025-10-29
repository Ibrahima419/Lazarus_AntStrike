/**
 * 📬 COLLECTION QUEUE (BullMQ)
 * Queue système pour processing asynchrone des threats collectés
 * Architecture: Event-driven avec retry logic et priorités
 */

import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { NormalizationPipeline } from '../services/normalization-pipeline.service';
import { DeduplicationEngine } from '../services/deduplication-engine.service';
import { ThreatScorer } from '../services/threat-scorer.service';
import { IOCExtractor } from '../services/ioc-extractor.service';
import { prisma } from '../config/database';

/**
 * Redis connection
 */
const connection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
);

/**
 * Collection Queue
 */
export const collectionQueue = new Queue('collection', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s
    },
    removeOnComplete: 1000, // Garder 1000 jobs complétés
    removeOnFail: 5000      // Garder 5000 jobs échoués pour debug
  }
});

/**
 * Queue Scheduler (pour delayed jobs)
 * Note: QueueScheduler deprecated dans BullMQ v4+, scheduler intégré dans Queue
 */

/**
 * Worker qui traite les jobs de normalisation
 */
export const collectionWorker = new Worker(
  'collection',
  async (job) => {
    const { tenantId, source, sourceId, rawData, priority } = job.data;
    
    logger.info(`⚙️  Processing collection job ${job.id}`, {
      source,
      sourceId,
      priority,
      attempt: job.attemptsMade + 1
    });
    
    try {
      // 1. NORMALISATION - Convertir au format unifié
      const normalized = await NormalizationPipeline.normalize(rawData, source);
      
      // 2. EXTRACTION IOCs - Extraire tous les IOCs
      const iocs = await IOCExtractor.extract(normalized);
      normalized.iocs = iocs;
      
      // 3. DÉDUPLICATION - Vérifier si existe déjà
      const deduplicated = await DeduplicationEngine.process(normalized, tenantId);
      
      // 4. SCORING - Calculer threat score
      const scored = await ThreatScorer.score(deduplicated);
      
      // 5. FILTRAGE - Sauver seulement si pertinent
      if (scored.threatScore >= 30) { // Threshold configurable
        const threat = await prisma.threat.create({
          data: {
            tenantId,
            name: scored.title,
            type: scored.type,
            severity: scored.severity,
            confidence: scored.confidence,
            status: 'new',
            description: scored.description,
            iocs: scored.iocs,
            mitreTactics: scored.mitreTactics || [],
            tags: scored.tags,
            source: scored.source,
            firstSeen: scored.publishedAt,
            lastSeen: new Date()
          }
        });
        
        logger.info(`✅ Threat created from ${source}`, {
          threatId: threat.id,
          threatScore: scored.threatScore,
          iocCount: iocs.length
        });
        
        return { 
          success: true, 
          threatId: threat.id,
          threatScore: scored.threatScore,
          action: 'created'
        };
      } else {
        logger.debug(`⏭️  Threat filtered out (low score: ${scored.threatScore})`, {
          source,
          sourceId
        });
        
        return { 
          success: true, 
          action: 'filtered',
          threatScore: scored.threatScore 
        };
      }
      
    } catch (error: any) {
      logger.error(`❌ Job ${job.id} failed`, {
        error: error.message,
        stack: error.stack,
        source,
        sourceId
      });
      
      throw error; // BullMQ va retry automatiquement
    }
  },
  {
    connection,
    concurrency: 10, // 10 workers en parallèle
    limiter: {
      max: 100,      // Max 100 jobs
      duration: 60000 // Par minute
    }
  }
);

/**
 * Event: Job complété avec succès
 */
collectionWorker.on('completed', (job, result) => {
  logger.info(`✅ Job ${job.id} completed`, {
    action: result.action,
    threatId: result.threatId,
    duration: Date.now() - job.timestamp
  });
});

/**
 * Event: Job échoué après tous les retries
 */
collectionWorker.on('failed', (job, error) => {
  logger.error(`❌ Job ${job?.id} failed permanently`, {
    error: error.message,
    attempts: job?.attemptsMade,
    data: job?.data
  });
});

/**
 * Event: Worker prêt
 */
collectionWorker.on('ready', () => {
  logger.info('✅ Collection worker ready');
});

/**
 * Event: Worker en erreur
 */
collectionWorker.on('error', (error) => {
  logger.error('❌ Collection worker error', {
    error: error.message
  });
});

/**
 * Helper: Ajouter job à la queue
 */
export async function enqueueNormalization(
  tenantId: string,
  source: string,
  sourceId: string,
  rawData: any,
  priority: number = 5
) {
  return await collectionQueue.add('normalize-threat', {
    tenantId,
    source,
    sourceId,
    rawData,
    priority
  }, {
    priority,
    jobId: `${source}-${sourceId}-${tenantId}` // Évite doublons dans queue
  });
}

/**
 * Helper: Obtenir statistiques de la queue
 */
export async function getQueueStats() {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed
  ] = await Promise.all([
    collectionQueue.getWaitingCount(),
    collectionQueue.getActiveCount(),
    collectionQueue.getCompletedCount(),
    collectionQueue.getFailedCount(),
    collectionQueue.getDelayedCount()
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed
  };
}

/**
 * Helper: Nettoyer la queue
 */
export async function cleanQueue() {
  await collectionQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // 24h
  await collectionQueue.clean(7 * 24 * 3600 * 1000, 1000, 'failed'); // 7 jours
  
  logger.info('✅ Queue cleaned');
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await collectionWorker.close();
  await connection.quit();
});

