/**
 * 📡 COLLECTION CONTROLLER
 * Endpoints pour gérer la collecte de threat intelligence
 */

import { Request, Response } from 'express';
import { CollectionOrchestrator } from '../services/collection-orchestrator.service';
import { triggerManualCollection } from '../schedulers/collection.scheduler';
import { getQueueStats } from '../queues/collection.queue';
import { logger } from '../utils/logger';

export class CollectionController {
  /**
   * Déclencher collecte complète
   * POST /api/collection/trigger
   */
  static async triggerCollection(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      
      logger.info('Manual collection triggered via API', {
        tenantId,
        userId: (req as any).user?.userId
      });
      
      // Déclencher collecte async
      const result = await triggerManualCollection(tenantId);
      
      res.json({
        success: true,
        message: 'Collection completed',
        data: {
          duration: `${result.duration}ms`,
          totalItemsCollected: result.totalItemsCollected,
          totalItemsQueued: result.totalItemsQueued,
          successRate: `${result.successRate}%`,
          results: result.results
        }
      });
      
    } catch (error: any) {
      logger.error('Collection trigger failed', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: 'Collection failed',
        message: error.message
      });
    }
  }
  
  /**
   * Déclencher collecte d'une source spécifique
   * POST /api/collection/trigger/:source
   */
  static async triggerSourceCollection(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const { source } = req.params;
      
      const validSources = ['taranis', 'misp', 'osint', 'cve'];
      if (!validSources.includes(source)) {
        return res.status(400).json({
          success: false,
          error: `Invalid source. Must be one of: ${validSources.join(', ')}`
        });
      }
      
      logger.info(`Manual ${source} collection triggered`, { tenantId });
      
      const result = await CollectionOrchestrator.collectFromSource(
        tenantId, 
        source as any
      );
      
      res.json({
        success: true,
        message: `${source} collection completed`,
        data: result
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Obtenir statistiques de collecte
   * GET /api/collection/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      
      // Stats de la queue
      const queueStats = await getQueueStats();
      
      // Stats des threats collectés (dernières 24h)
      const last24h = new Date(Date.now() - 24 * 3600 * 1000);
      const recentThreats = await (await import('../config/database')).prisma.threat.count({
        where: {
          tenantId,
          createdAt: { gte: last24h }
        }
      });
      
      // Stats par source
      const threatsBySource = await (await import('../config/database')).prisma.threat.groupBy({
        by: ['source'],
        where: {
          tenantId,
          createdAt: { gte: last24h }
        },
        _count: true
      });
      
      res.json({
        success: true,
        data: {
          queue: queueStats,
          threats: {
            last24h: recentThreats,
            bySource: threatsBySource.reduce((acc: any, curr: any) => {
              acc[curr.source] = curr._count;
              return acc;
            }, {})
          }
        }
      });
      
    } catch (error: any) {
      logger.error('Failed to get collection stats', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Obtenir statut de la queue
   * GET /api/collection/queue/status
   */
  static async getQueueStatus(req: Request, res: Response) {
    try {
      const stats = await getQueueStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Obtenir historique de collecte
   * GET /api/collection/history
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const { limit = 10, source } = req.query;
      
      const where: any = { tenantId };
      if (source) where.source = source;
      
      const threats = await (await import('../config/database')).prisma.threat.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        select: {
          id: true,
          name: true,
          type: true,
          severity: true,
          source: true,
          createdAt: true,
          iocs: true
        }
      });
      
      res.json({
        success: true,
        data: threats
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Health check des sources
   * GET /api/collection/health
   */
  static async checkHealth(req: Request, res: Response) {
    try {
      const health = {
        taranis: await checkTaranisHealth(),
        misp: await checkMISPHealth(),
        osint: await checkOSINTHealth(),
        queue: await checkQueueHealth()
      };
      
      const allHealthy = Object.values(health).every((h: any) => h.status === 'healthy');
      
      res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        data: health,
        overall: allHealthy ? 'healthy' : 'degraded'
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

/**
 * Helper: Check Taranis health
 */
async function checkTaranisHealth(): Promise<any> {
  try {
    const { TaranisService } = await import('../services/taranis.service');
    await TaranisService.isAlive();
    return { status: 'healthy', message: 'Taranis is reachable' };
  } catch (error: any) {
    return { status: 'unhealthy', message: error.message };
  }
}

/**
 * Helper: Check MISP health
 */
async function checkMISPHealth(): Promise<any> {
  const mispUrl = process.env.MISP_URL || '';
  const mispApiKey = process.env.MISP_API_KEY || '';
  
  // Si pas de config MISP, retourner "disabled" au lieu d'erreur
  if (!mispUrl || !mispApiKey) {
    return { 
      status: 'disabled', 
      message: 'MISP not configured (set MISP_URL and MISP_API_KEY)' 
    };
  }
  
  try {
    const { MISPClientService } = await import('../services/misp-client.service');
    
    // Vérifier que l'URL est valide avant d'appeler testConnection
    if (!mispUrl || mispUrl.trim() === '') {
      return { status: 'disabled', message: 'MISP URL is empty' };
    }
    
    const isConnected = await MISPClientService.testConnection({
      url: mispUrl,
      apiKey: mispApiKey,
      verifySsl: false
    });
    
    return isConnected 
      ? { status: 'healthy', message: 'MISP is connected' }
      : { status: 'unhealthy', message: 'MISP connection failed' };
      
  } catch (error: any) {
    // Capturer spécifiquement les erreurs "Invalid URL"
    if (error.message && error.message.includes('Invalid URL')) {
      return { status: 'disabled', message: 'MISP URL is invalid' };
    }
    return { status: 'unhealthy', message: error.message || 'MISP check failed' };
  }
}

/**
 * Helper: Check OSINT feeds health
 */
async function checkOSINTHealth(): Promise<any> {
  // TODO: Implémenter vérification feeds OSINT
  return { status: 'healthy', message: 'OSINT feeds operational' };
}

/**
 * Helper: Check queue health
 */
async function checkQueueHealth(): Promise<any> {
  try {
    const stats = await getQueueStats();
    
    // Alert si trop de jobs en attente
    if (stats.waiting > 1000) {
      return {
        status: 'degraded',
        message: `Queue backlog: ${stats.waiting} jobs waiting`,
        stats
      };
    }
    
    return {
      status: 'healthy',
      message: 'Queue operational',
      stats
    };
    
  } catch (error: any) {
    return { status: 'unhealthy', message: error.message };
  }
}

