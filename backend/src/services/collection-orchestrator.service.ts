/**
 * 🎯 COLLECTION ORCHESTRATOR
 * Coordonne et orchestre toutes les sources de collecte de threat intelligence
 * Architecture moderne : Event-driven + Queue-based
 */

import { logger } from '../utils/logger';
import { TaranisService } from './taranis.service';
import { MISPClientService } from './misp-client.service';
import { CVEEnrichmentService } from './cve-enrichment.service';
import { collectionQueue } from '../queues/collection.queue';

interface CollectionResult {
  source: string;
  status: 'success' | 'error' | 'partial';
  itemsCollected: number;
  itemsQueued: number;
  errors: string[];
  duration: number;
}

interface OrchestrationSummary {
  startTime: Date;
  endTime: Date;
  duration: number;
  results: CollectionResult[];
  totalItemsCollected: number;
  totalItemsQueued: number;
  successRate: number;
}

export class CollectionOrchestrator {
  /**
   * Orchestrer toutes les sources de collecte pour un tenant
   */
  static async orchestrateCollection(tenantId: string): Promise<OrchestrationSummary> {
    const startTime = new Date();
    
    logger.info('🎯 Starting collection orchestration', { 
      tenantId,
      timestamp: startTime 
    });
    
    const results: CollectionResult[] = [];
    
    try {
      // Exécuter collections en parallèle avec priorités
      const collectionPromises = [
        this.collectFromTaranis(tenantId),     // Priorité 1: OSINT frais
        this.collectFromMISP(tenantId),        // Priorité 1: Threat sharing
        this.collectFromOSINTFeeds(tenantId),  // Priorité 2: Bulk IOCs
        this.collectFromCVE(tenantId)          // Priorité 3: Vulns
      ];
      
      // Attendre toutes les collections (même si certaines échouent)
      const settledResults = await Promise.allSettled(collectionPromises);
      
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const sources = ['Taranis', 'MISP', 'OSINT Feeds', 'CVE'];
          results.push({
            source: sources[index],
            status: 'error',
            itemsCollected: 0,
            itemsQueued: 0,
            errors: [result.reason?.message || 'Unknown error'],
            duration: 0
          });
        }
      });
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      const summary: OrchestrationSummary = {
        startTime,
        endTime,
        duration,
        results,
        totalItemsCollected: results.reduce((sum, r) => sum + r.itemsCollected, 0),
        totalItemsQueued: results.reduce((sum, r) => sum + r.itemsQueued, 0),
        successRate: this.calculateSuccessRate(results)
      };
      
      logger.info('✅ Collection orchestration completed', {
        tenantId,
        summary: {
          duration: `${duration}ms`,
          totalItems: summary.totalItemsCollected,
          queued: summary.totalItemsQueued,
          successRate: `${summary.successRate}%`
        }
      });
      
      return summary;
      
    } catch (error: any) {
      logger.error('❌ Collection orchestration failed', {
        tenantId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  /**
   * Collecter depuis Taranis AI
   */
  private static async collectFromTaranis(tenantId: string): Promise<CollectionResult> {
    const startTime = Date.now();
    const result: CollectionResult = {
      source: 'Taranis',
      status: 'success',
      itemsCollected: 0,
      itemsQueued: 0,
      errors: [],
      duration: 0
    };
    
    try {
      logger.info('📡 Collecting from Taranis', { tenantId });
      
      // Fetch recent stories (dernières 24h)
      const stories = await TaranisService.getStories({
        range: '1d',
        limit: 100,
        sort: '-published',
        relevant: true // Seulement stories pertinentes
      });
      
      result.itemsCollected = stories.items?.length || 0;
      
      // Queue chaque story pour traitement async
      if (stories.items) {
        for (const story of stories.items) {
          try {
            const priority = this.calculatePriority(story, 'taranis');
            
            await collectionQueue.add('normalize-threat', {
              tenantId,
              source: 'taranis',
              sourceId: story.id,
              rawData: story,
              priority
            }, {
              priority,
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 }
            });
            
            result.itemsQueued++;
          } catch (error: any) {
            result.errors.push(`Failed to queue story ${story.id}: ${error.message}`);
          }
        }
      }
      
      result.duration = Date.now() - startTime;
      
      logger.info('✅ Taranis collection completed', {
        collected: result.itemsCollected,
        queued: result.itemsQueued,
        duration: `${result.duration}ms`
      });
      
    } catch (error: any) {
      result.status = 'error';
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      
      logger.error('❌ Taranis collection failed', {
        error: error.message
      });
    }
    
    return result;
  }
  
  /**
   * Collecter depuis MISP
   */
  private static async collectFromMISP(tenantId: string): Promise<CollectionResult> {
    const startTime = Date.now();
    const result: CollectionResult = {
      source: 'MISP',
      status: 'success',
      itemsCollected: 0,
      itemsQueued: 0,
      errors: [],
      duration: 0
    };
    
    try {
      logger.info('🔄 Collecting from MISP', { tenantId });
      
      const mispConfig = {
        url: process.env.MISP_URL || 'https://misp.local',
        apiKey: process.env.MISP_API_KEY || '',
        verifySsl: false
      };
      
      // Tester connexion d'abord
      const isConnected = await MISPClientService.testConnection(mispConfig);
      if (!isConnected) {
        result.status = 'error';
        result.errors.push('MISP connection failed');
        return result;
      }
      
      // Fetch events récents (7 derniers jours)
      const events = await MISPClientService.getRecentEvents(mispConfig, 7);
      result.itemsCollected = events.length;
      
      // Queue chaque event
      for (const event of events) {
        try {
          const priority = this.calculatePriority(event, 'misp');
          
          await collectionQueue.add('normalize-threat', {
            tenantId,
            source: 'misp',
            sourceId: event.id,
            rawData: event,
            priority
          }, {
            priority,
            attempts: 3
          });
          
          result.itemsQueued++;
        } catch (error: any) {
          result.errors.push(`Failed to queue MISP event ${event.id}: ${error.message}`);
        }
      }
      
      result.duration = Date.now() - startTime;
      
      logger.info('✅ MISP collection completed', {
        collected: result.itemsCollected,
        queued: result.itemsQueued,
        duration: `${result.duration}ms`
      });
      
    } catch (error: any) {
      result.status = 'error';
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      
      logger.error('❌ MISP collection failed', {
        error: error.message
      });
    }
    
    return result;
  }
  
  /**
   * Collecter depuis OSINT Feeds
   */
  private static async collectFromOSINTFeeds(tenantId: string): Promise<CollectionResult> {
    const startTime = Date.now();
    const result: CollectionResult = {
      source: 'OSINT Feeds',
      status: 'success',
      itemsCollected: 0,
      itemsQueued: 0,
      errors: [],
      duration: 0
    };
    
    try {
      logger.info('📰 Collecting from OSINT feeds', { tenantId });
      
      // Fetch tous les feeds actifs
      // Collecte OSINT feeds - Pour l'instant on skip, à implémenter
      const feedResults = { totalIocs: 0 }; // await OSINTFeedsService.collectFromAllFeeds(tenantId);
      
      result.itemsCollected = feedResults.totalIocs || 0;
      result.itemsQueued = feedResults.totalIocs || 0; // Déjà sauvés par OSINTFeedsService
      
      result.duration = Date.now() - startTime;
      
      logger.info('✅ OSINT feeds collection completed', {
        collected: result.itemsCollected,
        duration: `${result.duration}ms`
      });
      
    } catch (error: any) {
      result.status = 'error';
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      
      logger.error('❌ OSINT feeds collection failed', {
        error: error.message
      });
    }
    
    return result;
  }
  
  /**
   * Collecter CVEs récents
   */
  private static async collectFromCVE(tenantId: string): Promise<CollectionResult> {
    const startTime = Date.now();
    const result: CollectionResult = {
      source: 'CVE',
      status: 'success',
      itemsCollected: 0,
      itemsQueued: 0,
      errors: [],
      duration: 0
    };
    
    try {
      logger.info('🔐 Collecting CVEs', { tenantId });
      
      // Pour l'instant, on skip CVE car c'est plus lourd
      // À implémenter: fetch CVEs modifiés dans dernières 24h depuis NVD
      
      result.status = 'partial';
      result.errors.push('CVE collection not yet implemented');
      result.duration = Date.now() - startTime;
      
    } catch (error: any) {
      result.status = 'error';
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
    }
    
    return result;
  }
  
  /**
   * Calculer priorité d'un item (1 = urgent, 10 = basse)
   */
  private static calculatePriority(data: any, source: string): number {
    let priority = 5; // Default: medium
    
    if (source === 'taranis') {
      // Très haute priorité si marqué important
      if (data.important) return 1;
      
      // Haute priorité si keywords critiques
      const text = `${data.title || ''} ${data.summary || ''}`.toLowerCase();
      if (text.includes('zero-day') || text.includes('0-day')) return 1;
      if (text.includes('ransomware') || text.includes('apt')) return 2;
      if (text.includes('exploit') || text.includes('breach')) return 3;
      
      // Priorité selon fraîcheur
      const published = new Date(data.published);
      const ageInHours = (Date.now() - published.getTime()) / (1000 * 3600);
      
      if (ageInHours < 6) return 3;  // < 6h = haute
      if (ageInHours < 24) return 5; // < 24h = moyenne
      return 7; // > 24h = basse
    }
    
    if (source === 'misp') {
      // Priorité selon threat level MISP
      if (data.threat_level_id === 1) return 2; // High
      if (data.threat_level_id === 2) return 4; // Medium
      return 6; // Low
    }
    
    return priority;
  }
  
  /**
   * Calculer taux de succès
   */
  private static calculateSuccessRate(results: CollectionResult[]): number {
    const total = results.length;
    const successful = results.filter(r => r.status === 'success').length;
    return Math.round((successful / total) * 100);
  }
  
  /**
   * Collecter seulement depuis une source spécifique
   */
  static async collectFromSource(
    tenantId: string, 
    source: 'taranis' | 'misp' | 'osint' | 'cve'
  ): Promise<CollectionResult> {
    logger.info(`🎯 Collecting from ${source}`, { tenantId });
    
    switch (source) {
      case 'taranis':
        return await this.collectFromTaranis(tenantId);
      
      case 'misp':
        return await this.collectFromMISP(tenantId);
      
      case 'osint':
        return await this.collectFromOSINTFeeds(tenantId);
      
      case 'cve':
        return await this.collectFromCVE(tenantId);
      
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }
  
  /**
   * Obtenir statistiques de collecte
   */
  static async getCollectionStats(tenantId: string): Promise<any> {
    // TODO: Implémenter avec table de stats dans DB
    return {
      lastRun: null,
      totalCollected: 0,
      sources: {}
    };
  }
}

