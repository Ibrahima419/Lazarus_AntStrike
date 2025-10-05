/**
 * Service de Gestion des Bots
 * Service centralisé pour la gestion des bots IA dans la plateforme CTI
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { 
  Bot, BotConfig, BotParameters, BotMetrics, BotHistoryEntry,
  BotTemplate, BotPipeline, PipelineStage, BotAlert, BotLog,
  BotStatistics, BotAction, BotProcessingResult
} from '../types/bot-types';

// ============ SERVICE PRINCIPAL ============

export class BotService {
  private taranisService = getTaranisService();
  private cache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  // ============ GESTION DES BOTS ============

  /**
   * Récupère tous les bots
   */
  async getBots(): Promise<Bot[]> {
    try {
      const cached = this.getCached('bots');
      if (cached) return cached;

      const taranisBots = await this.taranisService.getBots();
      const bots = taranisBots.map(tbot => this.mapTaranisBotToBot(tbot));
      
      this.setCached('bots', bots);
      return bots;
    } catch (error) {
      console.error('Erreur lors de la récupération des bots:', error);
      return [];
    }
  }

  /**
   * Récupère les bots en cours d'exécution via l'endpoint worker
   */
  async getActiveWorkerBots(): Promise<any[]> {
    try {
      const cached = this.getCached('worker_bots');
      if (cached) return cached;

      const workerBots = await this.taranisService.getWorkerBots();
      
      this.setCached('worker_bots', workerBots);
      return workerBots;
    } catch (error) {
      console.error('Erreur lors de la récupération des worker bots:', error);
      return [];
    }
  }

  /**
   * Récupère un bot par ID
   */
  async getBotById(id: string): Promise<Bot | null> {
    try {
      const bots = await this.getBots();
      return bots.find(bot => bot.id === id) || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du bot ${id}:`, error);
      return null;
    }
  }

  /**
   * Crée un nouveau bot via l'API Taranis
   */
  async createBot(botData: Partial<Bot>): Promise<Bot> {
    try {
      // Validation des données
      this.validateBotData(botData);
      
      // Préparer les données pour l'API Taranis
      const taranisBotData = {
        name: botData.name || 'Nouveau Bot',
        description: botData.description || '',
        type: botData.type || 'analyzer',
        parameters: this.mapBotConfigToTaranisParameters(botData.config)
      };
      
      // Appel API Taranis pour créer le bot
      const response = await this.taranisService.createBot(taranisBotData);
      
      if (!response || !response.id) {
        throw new Error('Échec de la création du bot via l\'API Taranis');
      }
      
      // Mapper la réponse Taranis vers notre format
      const newBot: Bot = {
        id: String(response.id),
        name: response.name || botData.name || 'Nouveau Bot',
        type: (response.type || botData.type || 'analyzer') as any,
        status: 'inactive',
        priority: 'medium',
        description: response.description || botData.description,
        config: botData.config || this.getDefaultBotConfig(),
        metrics: this.getDefaultMetrics(),
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user',
        tags: botData.tags || []
      };
      
      // Invalidation du cache
      this.invalidateCache('bots');
      
      console.log('Bot créé via API Taranis:', newBot.name, 'ID:', newBot.id);
      return newBot;
    } catch (error) {
      console.error('Erreur lors de la création du bot:', error);
      throw error;
    }
  }

  /**
   * Met à jour un bot via l'API Taranis
   */
  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot> {
    try {
      const existingBot = await this.getBotById(id);
      if (!existingBot) {
        throw new Error(`Bot ${id} non trouvé`);
      }
      
      // Préparer les données de mise à jour pour l'API Taranis
      const taranisUpdateData = {
        name: updates.name || existingBot.name,
        description: updates.description || existingBot.description,
        type: updates.type || existingBot.type,
        parameters: this.mapBotConfigToTaranisParameters(updates.config || existingBot.config)
      };
      
      // Appel API Taranis pour mettre à jour le bot
      const response = await this.taranisService.updateBot(id, taranisUpdateData);
      
      if (!response) {
        throw new Error('Échec de la mise à jour du bot via l\'API Taranis');
      }
      
      const updatedBot: Bot = {
        ...existingBot,
        ...updates,
        name: response.name || existingBot.name,
        description: response.description || existingBot.description,
        type: (response.type || existingBot.type) as any,
        updatedAt: new Date()
      };
      
      this.invalidateCache('bots');
      console.log('Bot mis à jour via API Taranis:', updatedBot.name, 'ID:', id);
      return updatedBot;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du bot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un bot via l'API Taranis
   */
  async deleteBot(id: string): Promise<boolean> {
    try {
      const existingBot = await this.getBotById(id);
      if (!existingBot) {
        throw new Error(`Bot ${id} non trouvé`);
      }
      
      // Appel API Taranis pour supprimer le bot
      const success = await this.taranisService.deleteBot(id);
      
      if (!success) {
        throw new Error('Échec de la suppression du bot via l\'API Taranis');
      }
      
      // Invalidation du cache
      this.invalidateCache('bots');
      console.log('Bot supprimé via API Taranis:', existingBot.name, 'ID:', id);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du bot ${id}:`, error);
      return false;
    }
  }

  /**
   * Exécute un bot via l'API Taranis
   */
  async executeBot(id: string, parameters?: any): Promise<boolean> {
    try {
      const existingBot = await this.getBotById(id);
      if (!existingBot) {
        throw new Error(`Bot ${id} non trouvé`);
      }
      
      // Appel API Taranis pour exécuter le bot
      const result = await this.taranisService.executeBotOnDemand(id, parameters);
      
      if (result !== null) {
        this.invalidateCache('bots');
        this.addBotHistoryEntry(id, {
          status: 'info',
          message: 'Bot exécuté avec succès',
          duration: 0,
          itemsProcessed: 0
        });
        console.log('Bot exécuté via API Taranis:', existingBot.name, 'ID:', id);
        return true;
      } else {
        throw new Error('Échec de l\'exécution du bot via l\'API Taranis');
      }
    } catch (error) {
      console.error(`Erreur lors de l'exécution du bot ${id}:`, error);
      this.addBotHistoryEntry(id, {
        status: 'error',
        message: `Erreur lors de l'exécution: ${error}`,
        duration: 0,
        itemsProcessed: 0
      });
      return false;
    }
  }

  // ============ CONTRÔLES DES BOTS ============

  /**
   * Démarre un bot
   */
  async startBot(id: string): Promise<boolean> {
    try {
      const success = await this.taranisService.startBot(id);
      
      if (success) {
        this.invalidateCache('bots');
        this.addBotHistoryEntry(id, {
          status: 'info',
          message: 'Bot démarré avec succès',
          duration: 0,
          itemsProcessed: 0
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Erreur lors du démarrage du bot ${id}:`, error);
      this.addBotHistoryEntry(id, {
        status: 'error',
        message: `Erreur lors du démarrage: ${error}`,
        duration: 0,
        itemsProcessed: 0
      });
      return false;
    }
  }

  /**
   * Arrête un bot
   */
  async stopBot(id: string): Promise<boolean> {
    try {
      const success = await this.taranisService.stopBot(id);
      
      if (success) {
        this.invalidateCache('bots');
        this.addBotHistoryEntry(id, {
          status: 'info',
          message: 'Bot arrêté avec succès',
          duration: 0,
          itemsProcessed: 0
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du bot ${id}:`, error);
      this.addBotHistoryEntry(id, {
        status: 'error',
        message: `Erreur lors de l'arrêt: ${error}`,
        duration: 0,
        itemsProcessed: 0
      });
      return false;
    }
  }

  /**
   * Redémarre un bot
   */
  async restartBot(id: string): Promise<boolean> {
    try {
      const stopped = await this.stopBot(id);
      if (!stopped) return false;
      
      // Attendre un peu avant de redémarrer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const started = await this.startBot(id);
      return started;
    } catch (error) {
      console.error(`Erreur lors du redémarrage du bot ${id}:`, error);
      return false;
    }
  }

  /**
   * Clone un bot
   */
  async cloneBot(id: string, newName?: string): Promise<Bot> {
    try {
      const originalBot = await this.getBotById(id);
      if (!originalBot) {
        throw new Error(`Bot ${id} non trouvé`);
      }

      const clonedData: Partial<Bot> = {
        ...originalBot,
        id: undefined, // Nouvel ID généré automatiquement
        name: newName || `${originalBot.name} (Clone)`,
        status: 'inactive',
        metrics: {
          ...originalBot.metrics,
          performance: {
            ...originalBot.metrics.performance,
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            lastRun: new Date(),
            nextRun: new Date()
          }
        },
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.createBot(clonedData);
    } catch (error) {
      console.error(`Erreur lors du clonage du bot ${id}:`, error);
      throw error;
    }
  }

  // ============ MÉTRIQUES ET STATISTIQUES ============

  /**
   * Récupère les statistiques globales des bots
   */
  async getBotStatistics(): Promise<BotStatistics> {
    try {
      const cached = this.getCached('statistics');
      if (cached) return cached;

      const bots = await this.getBots();
      
      const statistics: BotStatistics = {
        overview: {
          totalBots: bots.length,
          activeBots: bots.filter(b => b.status === 'active' || b.status === 'running').length,
          runningBots: bots.filter(b => b.status === 'running').length,
          errorBots: bots.filter(b => b.status === 'error').length,
          totalProcessed: bots.reduce((sum, bot) => sum + bot.metrics.performance.totalRuns, 0),
          avgSuccessRate: bots.length > 0 ? 
            bots.reduce((sum, bot) => sum + bot.metrics.operational.successRate, 0) / bots.length : 0
        },
        
        byType: this.calculateStatisticsByType(bots),
        
        trends: await this.calculateTrends(bots),
        
        topPerformers: {
          byThroughput: [...bots].sort((a, b) => 
            b.metrics.performance.throughput - a.metrics.performance.throughput
          ).slice(0, 5),
          
          byAccuracy: [...bots].sort((a, b) => 
            b.metrics.quality.accuracy - a.metrics.quality.accuracy
          ).slice(0, 5),
          
          byUptime: [...bots].sort((a, b) => 
            b.metrics.operational.uptime - a.metrics.operational.uptime
          ).slice(0, 5)
        }
      };

      this.setCached('statistics', statistics);
      return statistics;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return this.getDefaultStatistics();
    }
  }

  /**
   * Récupère les métriques d'un bot
   */
  async getBotMetrics(id: string): Promise<BotMetrics> {
    try {
      const bot = await this.getBotById(id);
      return bot?.metrics || this.getDefaultMetrics();
    } catch (error) {
      console.error(`Erreur lors de la récupération des métriques du bot ${id}:`, error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Récupère l'historique d'un bot
   */
  async getBotHistory(id: string, limit: number = 100): Promise<BotHistoryEntry[]> {
    try {
      const bot = await this.getBotById(id);
      return bot?.history.slice(-limit) || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique du bot ${id}:`, error);
      return [];
    }
  }

  // ============ ALERTES ET LOGS ============

  /**
   * Récupère les alertes actives
   */
  async getActiveAlerts(): Promise<BotAlert[]> {
    try {
      const cached = this.getCached('alerts');
      if (cached) return cached;

      // Simulation des alertes - à remplacer par l'API réelle
      const alerts: BotAlert[] = [];
      
      this.setCached('alerts', alerts);
      return alerts;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  /**
   * Récupère les logs des bots
   */
  async getBotLogs(botId?: string, level?: string, limit: number = 1000): Promise<BotLog[]> {
    try {
      // Simulation des logs - à remplacer par l'API réelle
      const logs: BotLog[] = [];
      
      return logs.filter(log => {
        if (botId && log.botId !== botId) return false;
        if (level && log.level !== level) return false;
        return true;
      }).slice(-limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  }

  // ============ PIPELINES ============

  /**
   * Récupère les pipelines de bots
   */
  async getPipelines(): Promise<BotPipeline[]> {
    try {
      const cached = this.getCached('pipelines');
      if (cached) return cached;

      // Simulation des pipelines - à remplacer par l'API réelle
      const pipelines: BotPipeline[] = [];
      
      this.setCached('pipelines', pipelines);
      return pipelines;
    } catch (error) {
      console.error('Erreur lors de la récupération des pipelines:', error);
      return [];
    }
  }

  // ============ FONCTIONNALITÉS AVANCÉES TARANIS ============

  /**
   * Enrichit un news item avec les bots d'analyse
   */
  async enrichNewsItem(newsItemId: string, attributes: any): Promise<boolean> {
    try {
      const success = await this.taranisService.enrichNewsItemWithBots(newsItemId, attributes);
      
      if (success) {
        console.log('News item enrichi avec succès:', newsItemId);
        return true;
      } else {
        throw new Error('Échec de l\'enrichissement du news item');
      }
    } catch (error) {
      console.error(`Erreur lors de l'enrichissement du news item ${newsItemId}:`, error);
      return false;
    }
  }

  /**
   * Groupe des stories avec l'IA
   */
  async groupStoriesWithAI(newsItemIds: string[]): Promise<any> {
    try {
      const result = await this.taranisService.groupStoriesWithAI(newsItemIds);
      
      if (result) {
        console.log('Stories groupées avec succès:', newsItemIds.length, 'items');
        return result;
      } else {
        throw new Error('Échec du groupement des stories');
      }
    } catch (error) {
      console.error('Erreur lors du groupement des stories:', error);
      return null;
    }
  }

  /**
   * Récupère les news items pour traitement par les bots
   */
  async getNewsItemsForProcessing(limit: number = 100): Promise<any[]> {
    try {
      const newsItems = await this.taranisService.getNewsItems(limit);
      return newsItems;
    } catch (error) {
      console.error('Erreur lors de la récupération des news items:', error);
      return [];
    }
  }

  /**
   * Récupère les stories pour analyse
   */
  async getStoriesForAnalysis(): Promise<any[]> {
    try {
      const stories = await this.taranisService.getStories();
      return stories;
    } catch (error) {
      console.error('Erreur lors de la récupération des stories:', error);
      return [];
    }
  }

  /**
   * Récupère les tags disponibles pour les bots
   */
  async getAvailableTags(): Promise<string[]> {
    try {
      const tags = await this.taranisService.getWorkerTags();
      return tags;
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      return [];
    }
  }

  /**
   * Met à jour les tags d'un news item via les bots
   */
  async updateNewsItemTags(newsItemId: string, tags: any): Promise<boolean> {
    try {
      // Utiliser une méthode publique du service Taranis si disponible
      // ou implémenter une méthode spécifique dans le service Taranis
      console.log('Mise à jour des tags pour news item:', newsItemId, tags);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags:', error);
      return false;
    }
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Valide les données d'un bot
   */
  private validateBotData(botData: Partial<Bot>): void {
    if (!botData.name) {
      throw new Error('Le nom du bot est requis');
    }
    if (!botData.type) {
      throw new Error('Le type du bot est requis');
    }
    if (!botData.config) {
      throw new Error('La configuration du bot est requise');
    }
  }

  /**
   * Mappe un bot Taranis vers notre format
   */
  private mapTaranisBotToBot(tbot: any): Bot {
    return {
      id: String(tbot.id || Math.random()),
      name: String(tbot.name || 'Unknown Bot'),
      type: (tbot.type || 'analyzer') as any,
      status: (tbot.status || 'inactive') as any,
      priority: 'medium',
      description: tbot.description,
      config: this.mapTaranisConfigToBotConfig(tbot),
      metrics: this.mapTaranisMetricsToBotMetrics(tbot),
      history: [],
      createdAt: new Date(tbot.created_at || Date.now()),
      updatedAt: new Date(tbot.updated_at || Date.now()),
      createdBy: tbot.created_by || 'system',
      tags: tbot.tags || []
    };
  }

  /**
   * Mappe un bot vers le format Taranis
   */
  private mapBotToTaranisBot(bot: Partial<Bot>): any {
    return {
      name: bot.name,
      type: bot.type,
      description: bot.description,
      enabled: bot.config?.enabled || true,
      schedule: bot.config?.schedule,
      parameters: bot.config?.parameters
    };
  }

  /**
   * Mappe la configuration du bot vers les paramètres Taranis
   */
  private mapBotConfigToTaranisParameters(config?: BotConfig): any[] {
    if (!config || !config.parameters) {
      return [];
    }

    return Object.entries(config.parameters).map(([key, value]) => ({
      parameter: {
        key: key,
        name: key,
        type: typeof value === 'number' ? 'NUMBER' : 
              typeof value === 'boolean' ? 'BOOLEAN' : 'STRING',
        description: `Parameter ${key}`
      },
      value: String(value)
    }));
  }

  /**
   * Mappe la configuration Taranis vers notre format
   */
  private mapTaranisConfigToBotConfig(tbot: any): BotConfig {
    return {
      enabled: Boolean(tbot.enabled),
      schedule: tbot.schedule || '0 */8 * * *',
      timeout: tbot.timeout || 3600,
      retryAttempts: tbot.retry_attempts || 3,
      retryDelay: tbot.retry_delay || 60,
      resources: {
        cpuLimit: tbot.cpu_limit || 2,
        memoryLimit: tbot.memory_limit || 1024,
        diskSpace: tbot.disk_space || 100
      },
      parameters: tbot.parameters || {},
      triggers: {
        timeBased: true,
        eventBased: false,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: false
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    };
  }

  /**
   * Mappe les métriques Taranis vers notre format
   */
  private mapTaranisMetricsToBotMetrics(tbot: any): BotMetrics {
    return {
      performance: {
        totalRuns: Number(tbot.processed_count || 0),
        successfulRuns: Math.floor(Number(tbot.processed_count || 0) * Number(tbot.success_rate || 0) / 100),
        failedRuns: Math.floor(Number(tbot.processed_count || 0) * (1 - Number(tbot.success_rate || 0) / 100)),
        avgProcessingTime: 0,
        throughput: 0,
        lastRun: new Date(tbot.last_run || Date.now()),
        nextRun: new Date()
      },
      resources: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0
      },
      quality: {
        accuracy: Number(tbot.success_rate || 0),
        precision: 0,
        recall: 0,
        f1Score: 0,
        falsePositiveRate: 0
      },
      operational: {
        uptime: Number(tbot.success_rate || 0),
        lastError: null,
        errorCount: 0,
        successRate: Number(tbot.success_rate || 0),
        availability: 100
      }
    };
  }

  /**
   * Calcule les statistiques par type
   */
  private calculateStatisticsByType(bots: Bot[]) {
    const byType: Record<string, any> = {};
    
    const types = ['collector', 'analyzer', 'enricher', 'correlator', 'reporter'];
    
    types.forEach(type => {
      const typeBots = bots.filter(bot => bot.type === type);
      byType[type] = {
        count: typeBots.length,
        successRate: typeBots.length > 0 ? 
          typeBots.reduce((sum, bot) => sum + bot.metrics.operational.successRate, 0) / typeBots.length : 0,
        avgProcessingTime: typeBots.length > 0 ?
          typeBots.reduce((sum, bot) => sum + bot.metrics.performance.avgProcessingTime, 0) / typeBots.length : 0,
        totalProcessed: typeBots.reduce((sum, bot) => sum + bot.metrics.performance.totalRuns, 0)
      };
    });
    
    return byType;
  }

  /**
   * Calcule les tendances
   */
  private async calculateTrends(bots: Bot[]) {
    // Simulation des tendances - à remplacer par l'API réelle
    return {
      daily: [],
      weekly: [],
      monthly: []
    };
  }

  /**
   * Ajoute une entrée à l'historique d'un bot
   */
  private addBotHistoryEntry(botId: string, entry: Partial<BotHistoryEntry>): void {
    // Simulation - à remplacer par l'API réelle
    console.log(`Bot ${botId} history entry:`, entry);
  }

  /**
   * Gestion du cache
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Métriques par défaut
   */
  private getDefaultMetrics(): BotMetrics {
    return {
      performance: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        avgProcessingTime: 0,
        throughput: 0,
        lastRun: new Date(),
        nextRun: new Date()
      },
      resources: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0
      },
      quality: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        falsePositiveRate: 0
      },
      operational: {
        uptime: 0,
        lastError: null,
        errorCount: 0,
        successRate: 0,
        availability: 0
      }
    };
  }

  /**
   * Configuration par défaut d'un bot
   */
  private getDefaultBotConfig(): BotConfig {
    return {
      enabled: true,
      schedule: '0 */8 * * *',
      timeout: 3600,
      retryAttempts: 3,
      retryDelay: 60,
      resources: {
        cpuLimit: 2,
        memoryLimit: 1024,
        diskSpace: 100
      },
      parameters: {},
      triggers: {
        timeBased: true,
        eventBased: false,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: false
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    };
  }

  /**
   * Statistiques par défaut
   */
  private getDefaultStatistics(): BotStatistics {
    return {
      overview: {
        totalBots: 0,
        activeBots: 0,
        runningBots: 0,
        errorBots: 0,
        totalProcessed: 0,
        avgSuccessRate: 0
      },
      byType: {
        collector: { count: 0, successRate: 0, avgProcessingTime: 0, totalProcessed: 0 },
        analyzer: { count: 0, successRate: 0, avgProcessingTime: 0, totalProcessed: 0 },
        enricher: { count: 0, successRate: 0, avgProcessingTime: 0, totalProcessed: 0 },
        correlator: { count: 0, successRate: 0, avgProcessingTime: 0, totalProcessed: 0 },
        reporter: { count: 0, successRate: 0, avgProcessingTime: 0, totalProcessed: 0 }
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      topPerformers: {
        byThroughput: [],
        byAccuracy: [],
        byUptime: []
      }
    };
  }
}

// ============ INSTANCE SINGLETON ============

let botServiceInstance: BotService | null = null;

export function getBotService(): BotService {
  if (!botServiceInstance) {
    botServiceInstance = new BotService();
  }
  return botServiceInstance;
}
