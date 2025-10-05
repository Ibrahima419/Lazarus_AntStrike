/**
 * Bot IOC Extractor
 * Bot Taranis pour extraire automatiquement les IOCs depuis les news items
 */

import { getBotService } from './bot-service';
import { getIOCExtractorService, IOCExtractionResult } from './ioc-extractor-service';
import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface IOCExtractorBotConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  batchSize: number;
  timeRange: string; // e.g., '7d', '24h', '1h'
  confidenceThreshold: number;
  autoCreateReportItems: boolean;
  reportItemTypeId: number;
  enrichmentEnabled: boolean;
  notificationEnabled: boolean;
}

export interface IOCExtractorBotMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalIOCsExtracted: number;
  lastRun: Date;
  nextRun: Date;
  avgProcessingTime: number;
  errorRate: number;
}

// ============ BOT PRINCIPAL ============

export class IOCExtractorBot {
  private botService = getBotService();
  private iocExtractorService = getIOCExtractorService();
  private taranisService = getTaranisService();
  private config: IOCExtractorBotConfig;
  private metrics: IOCExtractorBotMetrics;
  private botId: string | null = null;

  constructor(config?: Partial<IOCExtractorBotConfig>) {
    this.config = {
      enabled: true,
      schedule: '0 */2 * * *', // Toutes les 2 heures
      batchSize: 100,
      timeRange: '24h',
      confidenceThreshold: 0.7,
      autoCreateReportItems: true,
      reportItemTypeId: 1, // À configurer selon votre setup
      enrichmentEnabled: true,
      notificationEnabled: true,
      ...config
    };

    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalIOCsExtracted: 0,
      lastRun: new Date(),
      nextRun: new Date(),
      avgProcessingTime: 0,
      errorRate: 0
    };
  }

  // ============ GESTION DU BOT ============

  /**
   * Crée et configure le bot IOC Extractor dans Taranis
   */
  async createBot(): Promise<string> {
    try {
      console.log('🤖 Création du bot IOC Extractor...');

      const botData = {
        name: 'IOC Extractor Bot',
        description: 'Extrait automatiquement les IOCs (IP, Domain, Hash, URL, Email) depuis les news items',
        type: 'analyzer',
        config: {
          enabled: this.config.enabled,
          schedule: this.config.schedule,
          parameters: {
            batchSize: this.config.batchSize,
            timeRange: this.config.timeRange,
            confidenceThreshold: this.config.confidenceThreshold,
            autoCreateReportItems: this.config.autoCreateReportItems,
            reportItemTypeId: this.config.reportItemTypeId,
            enrichmentEnabled: this.config.enrichmentEnabled,
            notificationEnabled: this.config.notificationEnabled
          }
        }
      };

      const bot = await this.botService.createBot(botData);
      this.botId = bot.id;

      console.log(`✅ Bot IOC Extractor créé avec l'ID: ${this.botId}`);
      return this.botId;
    } catch (error) {
      console.error('❌ Erreur lors de la création du bot IOC Extractor:', error);
      throw error;
    }
  }

  /**
   * Exécute le bot IOC Extractor
   */
  async execute(): Promise<IOCExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Démarrage de l\'extraction d\'IOCs...');
      this.metrics.totalRuns++;

      // Mettre à jour la configuration du service
      this.iocExtractorService.updateConfig({
        confidenceThreshold: this.config.confidenceThreshold,
        enrichmentEnabled: this.config.enrichmentEnabled
      });

      // Extraire les IOCs depuis les news items
      const result = await this.iocExtractorService.extractIOCsFromNewsItems(
        this.config.batchSize,
        this.config.timeRange
      );

      // Créer des report items si configuré
      if (this.config.autoCreateReportItems && result.iocs.length > 0) {
        await this.createReportItemsFromIOCs(result.iocs);
      }

      // Mettre à jour les métriques
      const processingTime = Date.now() - startTime;
      this.updateMetrics(result, processingTime, true);

      console.log(`✅ Extraction terminée: ${result.totalExtracted} IOCs extraits en ${processingTime}ms`);
      
      // Notification si configurée
      if (this.config.notificationEnabled) {
        await this.sendNotification(result);
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction d\'IOCs:', error);
      
      // Mettre à jour les métriques d'erreur
      const processingTime = Date.now() - startTime;
      this.updateMetrics(null, processingTime, false);
      
      throw error;
    }
  }

  /**
   * Arrête le bot
   */
  async stop(): Promise<boolean> {
    if (!this.botId) {
      console.log('⚠️ Bot IOC Extractor non créé');
      return false;
    }

    try {
      const success = await this.botService.stopBot(this.botId);
      if (success) {
        console.log('🛑 Bot IOC Extractor arrêté');
      }
      return success;
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du bot:', error);
      return false;
    }
  }

  /**
   * Redémarre le bot
   */
  async restart(): Promise<boolean> {
    if (!this.botId) {
      console.log('⚠️ Bot IOC Extractor non créé');
      return false;
    }

    try {
      const success = await this.botService.restartBot(this.botId);
      if (success) {
        console.log('🔄 Bot IOC Extractor redémarré');
      }
      return success;
    } catch (error) {
      console.error('❌ Erreur lors du redémarrage du bot:', error);
      return false;
    }
  }

  // ============ CRÉATION DE REPORT ITEMS ============

  /**
   * Crée des report items à partir des IOCs extraits
   */
  private async createReportItemsFromIOCs(iocs: any[]): Promise<void> {
    try {
      console.log(`📄 Création de ${iocs.length} report items pour les IOCs...`);

      // Grouper les IOCs par type pour créer des report items organisés
      const iocsByType = this.groupIOCsByType(iocs);

      for (const [type, typeIOCs] of Object.entries(iocsByType)) {
        const reportItem = {
          title: `IOCs ${type.toUpperCase()} - ${new Date().toLocaleDateString()}`,
          description: `Extraction automatique de ${typeIOCs.length} IOCs de type ${type}`,
          report_item_type_id: this.config.reportItemTypeId,
          completed: false,
          attributes: [
            {
              key: 'ioc_type',
              value: type,
              type: 'STRING'
            },
            {
              key: 'ioc_count',
              value: String(typeIOCs.length),
              type: 'NUMBER'
            },
            {
              key: 'extraction_date',
              value: new Date().toISOString(),
              type: 'DATE_TIME'
            },
            {
              key: 'ioc_list',
              value: JSON.stringify(typeIOCs.map(ioc => ({
                value: ioc.value,
                confidence: ioc.confidence,
                severity: ioc.severity,
                source: ioc.source,
                firstSeen: ioc.firstSeen,
                lastSeen: ioc.lastSeen
              }))),
              type: 'TEXT'
            },
            {
              key: 'confidence_avg',
              value: String(
                typeIOCs.reduce((sum, ioc) => sum + ioc.confidence, 0) / typeIOCs.length
              ),
              type: 'NUMBER'
            }
          ]
        };

        // Créer le report item via l'API Taranis
        await this.taranisService.createReportItem(reportItem);
      }

      console.log('✅ Report items créés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création des report items:', error);
      throw error;
    }
  }

  /**
   * Groupe les IOCs par type
   */
  private groupIOCsByType(iocs: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {
      ip: [],
      domain: [],
      hash: [],
      url: [],
      email: []
    };

    iocs.forEach(ioc => {
      if (grouped[ioc.type]) {
        grouped[ioc.type].push(ioc);
      }
    });

    return grouped;
  }

  // ============ MÉTRIQUES ============

  /**
   * Met à jour les métriques du bot
   */
  private updateMetrics(result: IOCExtractionResult | null, processingTime: number, success: boolean): void {
    this.metrics.lastRun = new Date();
    this.metrics.avgProcessingTime = (this.metrics.avgProcessingTime + processingTime) / 2;

    if (success && result) {
      this.metrics.successfulRuns++;
      this.metrics.totalIOCsExtracted += result.totalExtracted;
    } else {
      this.metrics.failedRuns++;
    }

    this.metrics.errorRate = this.metrics.failedRuns / this.metrics.totalRuns;
    
    // Calculer la prochaine exécution (approximative)
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + 2); // Toutes les 2h par défaut
    this.metrics.nextRun = nextRun;
  }

  /**
   * Récupère les métriques du bot
   */
  getMetrics(): IOCExtractorBotMetrics {
    return { ...this.metrics };
  }

  // ============ NOTIFICATIONS ============

  /**
   * Envoie une notification avec les résultats
   */
  private async sendNotification(result: IOCExtractionResult): Promise<void> {
    try {
      const message = `
🔍 **Extraction d'IOCs terminée**

📊 **Résultats:**
- Total IOCs extraits: ${result.totalExtracted}
- IPs: ${result.byType.ip}
- Domaines: ${result.byType.domain}
- Hashes: ${result.byType.hash}
- URLs: ${result.byType.url}
- Emails: ${result.byType.email}

🎯 **Confiance:**
- Élevée: ${result.confidence.high}
- Moyenne: ${result.confidence.medium}
- Faible: ${result.confidence.low}

📰 **Sources:** ${result.sources.length} sources analysées

⏰ **Heure:** ${new Date().toLocaleString()}
      `;

      console.log('📧 Notification:', message);
      // TODO: Intégrer avec le système de notifications Taranis
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }
  }

  // ============ CONFIGURATION ============

  /**
   * Met à jour la configuration du bot
   */
  updateConfig(newConfig: Partial<IOCExtractorBotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Mettre à jour le bot dans Taranis si il existe
    if (this.botId) {
      this.botService.updateBot(this.botId, {
        config: {
          enabled: this.config.enabled,
          schedule: this.config.schedule,
          parameters: this.config
        }
      });
    }
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): IOCExtractorBotConfig {
    return { ...this.config };
  }

  /**
   * Récupère l'ID du bot
   */
  getBotId(): string | null {
    return this.botId;
  }
}

// ============ INSTANCE SINGLETON ============

let iocExtractorBotInstance: IOCExtractorBot | null = null;

export function getIOCExtractorBot(): IOCExtractorBot {
  if (!iocExtractorBotInstance) {
    iocExtractorBotInstance = new IOCExtractorBot();
  }
  return iocExtractorBotInstance;
}
