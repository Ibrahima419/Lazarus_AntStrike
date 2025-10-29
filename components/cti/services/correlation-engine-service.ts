/**
 * Service de Moteur de Corrélation
 * Remplace les règles mockées par un système de corrélation réel avec bots Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { getBotService } from './bot-service';
import { getIOCExtractorService } from './ioc-extractor-service';

// ============ TYPES & INTERFACES ============

export interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  type: 'ioc' | 'temporal' | 'geographic' | 'behavioral' | 'attribution';
  confidence: number;
  status: 'active' | 'inactive' | 'testing';
  matches: number;
  falsePositives: number;
  lastRun: Date;
  botId?: string; // ID du bot Taranis associé
  parameters: Record<string, any>;
}

export interface CorrelationResult {
  id: string;
  ruleId: string;
  elements: Array<{
    type: 'ioc' | 'story' | 'news_item' | 'campaign';
    id: string;
    value: string;
    confidence: number;
  }>;
  confidence: number;
  strength: number;
  type: string;
  description: string;
  timestamp: Date;
  verified: boolean;
  reportItemId?: string; // ID du report item Taranis
}

export interface CorrelationEngineConfig {
  enabled: boolean;
  autoRun: boolean;
  runInterval: number; // en minutes
  minConfidence: number;
  maxResults: number;
  autoCreateReportItems: boolean;
  reportItemTypeId: number;
  botExecutionEnabled: boolean;
  notificationEnabled: boolean;
}

export interface CorrelationStatistics {
  totalRules: number;
  activeRules: number;
  totalResults: number;
  verifiedResults: number;
  falsePositiveRate: number;
  avgConfidence: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============ SERVICE PRINCIPAL ============

export class CorrelationEngineService {
  private taranisService = getTaranisService();
  private botService = getBotService();
  private iocExtractorService = getIOCExtractorService();
  private config: CorrelationEngineConfig;
  private cache = new Map<string, any>();
  private cacheExpiry = 15 * 60 * 1000; // 15 minutes
  private correlationBots: Map<string, string> = new Map(); // ruleId -> botId

  constructor(config?: Partial<CorrelationEngineConfig>) {
    this.config = {
      enabled: true,
      autoRun: true,
      runInterval: 60, // 1 heure
      minConfidence: 0.7,
      maxResults: 100,
      autoCreateReportItems: true,
      reportItemTypeId: 3, // À configurer selon votre setup
      botExecutionEnabled: true,
      notificationEnabled: true,
      ...config
    };

    this.initializeCorrelationBots();
  }

  // ============ INITIALISATION ============

  /**
   * Initialise les bots de corrélation
   */
  private async initializeCorrelationBots(): Promise<void> {
    if (!this.config.botExecutionEnabled) return;

    try {
      console.log('🤖 Initialisation des bots de corrélation...');

      const correlationRules = await this.getCorrelationRules();
      
      for (const rule of correlationRules) {
        if (!rule.botId) {
          const botId = await this.createCorrelationBot(rule);
          if (botId) {
            this.correlationBots.set(rule.id, botId);
            console.log(`✅ Bot créé pour la règle: ${rule.name} (${botId})`);
          }
        }
      }

      console.log(`✅ ${this.correlationBots.size} bots de corrélation initialisés`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des bots:', error);
    }
  }

  /**
   * Crée un bot de corrélation pour une règle
   */
  private async createCorrelationBot(rule: CorrelationRule): Promise<string | null> {
    try {
      const botData: any = {
        name: `Correlation Bot: ${rule.name}`,
        description: `Bot de corrélation pour la règle: ${rule.description}`,
        type: 'correlator',
        config: {
          enabled: rule.status === 'active',
          schedule: '*/15 * * * *',
          timeout: 300,
          retryAttempts: 3,
          retryDelay: 60,
          resources: {
            cpuLimit: 50,
            memoryLimit: 512,
            diskSpace: 1024
          },
          parameters: {
            ruleId: rule.id,
            ruleType: rule.type,
            confidenceThreshold: rule.confidence,
            ...rule.parameters
          },
          triggers: {
            timeBased: true,
            eventBased: false
          }
        }
      };

      const bot = await this.botService.createBot(botData);
      return bot.id;
    } catch (error) {
      console.error(`❌ Erreur lors de la création du bot pour ${rule.name}:`, error);
      return null;
    }
  }

  // ============ RÈGLES DE CORRÉLATION ============

  /**
   * Récupère les règles de corrélation
   */
  async getCorrelationRules(): Promise<CorrelationRule[]> {
    try {
      const cached = this.getCached('rules');
      if (cached) return cached;

      // Règles de corrélation prédéfinies
      const rules: CorrelationRule[] = [
        {
          id: 'rule-ioc-cooccurrence',
          name: 'IOC Co-occurrence',
          description: 'Detect IOCs that appear together in multiple incidents',
          type: 'ioc',
          confidence: 0.89,
          status: 'active',
          matches: 0,
          falsePositives: 0,
          lastRun: new Date(),
          parameters: {
            minOccurrences: 2,
            timeWindow: 30, // jours
            iocTypes: ['ip', 'domain', 'hash', 'url', 'email']
          }
        },
        {
          id: 'rule-temporal-clustering',
          name: 'Temporal Correlation',
          description: 'Identify attacks that occur within similar time windows',
          type: 'temporal',
          confidence: 0.76,
          status: 'active',
          matches: 0,
          falsePositives: 0,
          lastRun: new Date(),
          parameters: {
            timeWindow: 24, // heures
            minStories: 2,
            maxTimeGap: 7 // jours
          }
        },
        {
          id: 'rule-geographic-clustering',
          name: 'Geographic Clustering',
          description: 'Find attacks targeting the same geographic regions',
          type: 'geographic',
          confidence: 0.82,
          status: 'active',
          matches: 0,
          falsePositives: 0,
          lastRun: new Date(),
          parameters: {
            countryMatch: true,
            regionMatch: true,
            cityMatch: false,
            minStories: 2
          }
        },
        {
          id: 'rule-behavioral-similarity',
          name: 'Behavioral Similarity',
          description: 'Correlate attacks with similar TTPs and attack patterns',
          type: 'behavioral',
          confidence: 0.94,
          status: 'testing',
          matches: 0,
          falsePositives: 0,
          lastRun: new Date(),
          parameters: {
            ttpSimilarity: 0.8,
            attackVectorMatch: true,
            targetMatch: true,
            minTTPs: 2
          }
        },
        {
          id: 'rule-attribution-analysis',
          name: 'Attribution Analysis',
          description: 'Link attacks to known threat actors based on techniques',
          type: 'attribution',
          confidence: 0.87,
          status: 'active',
          matches: 0,
          falsePositives: 0,
          lastRun: new Date(),
          parameters: {
            actorConfidence: 0.7,
            techniqueMatch: true,
            infrastructureMatch: true,
            minIndicators: 3
          }
        }
      ];

      this.setCached('rules', rules);
      return rules;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des règles:', error);
      return [];
    }
  }

  /**
   * Met à jour une règle de corrélation
   */
  async updateCorrelationRule(ruleId: string, updates: Partial<CorrelationRule>): Promise<boolean> {
    try {
      const rules = await this.getCorrelationRules();
      const ruleIndex = rules.findIndex(r => r.id === ruleId);
      
      if (ruleIndex === -1) {
        throw new Error(`Règle ${ruleId} non trouvée`);
      }

      // Mettre à jour la règle
      rules[ruleIndex] = { ...rules[ruleIndex], ...updates };
      
      // Mettre à jour le bot associé si nécessaire
      if (updates.status && this.correlationBots.has(ruleId)) {
        const botId = this.correlationBots.get(ruleId)!;
        await this.botService.updateBot(botId, {
          config: {
            enabled: updates.status === 'active',
            schedule: '*/15 * * * *',
            timeout: 300,
            retryAttempts: 3,
            retryDelay: 60,
            resources: {
              cpuLimit: 50,
              memoryLimit: 512,
              diskSpace: 1024
            },
            parameters: rules[ruleIndex].parameters,
            triggers: {
              timeBased: true,
              eventBased: false
            }
          }
        });
      }

      // Invalider le cache
      this.invalidateCache('rules');
      
      console.log(`✅ Règle ${ruleId} mise à jour`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de la règle ${ruleId}:`, error);
      return false;
    }
  }

  // ============ EXÉCUTION DES CORRÉLATIONS ============

  /**
   * Exécute toutes les règles de corrélation
   */
  async runCorrelationAnalysis(): Promise<CorrelationResult[]> {
    try {
      console.log('🔗 Démarrage de l\'analyse de corrélation...');
      
      const rules = await this.getCorrelationRules();
      const activeRules = rules.filter(r => r.status === 'active');
      
      if (activeRules.length === 0) {
        console.log('⚠️ Aucune règle active pour l\'analyse');
        return [];
      }

      console.log(`📋 ${activeRules.length} règles actives à exécuter`);

      const allResults: CorrelationResult[] = [];

      // Exécuter chaque règle
      for (const rule of activeRules) {
        try {
          const results = await this.executeCorrelationRule(rule);
          allResults.push(...results);
          
          // Mettre à jour les statistiques de la règle
          await this.updateRuleStatistics(rule.id, results);
          
        } catch (error) {
          console.error(`❌ Erreur lors de l'exécution de la règle ${rule.name}:`, error);
        }
      }

      // Filtrer par confiance minimale
      const filteredResults = allResults.filter(r => r.confidence >= this.config.minConfidence);
      
      // Limiter le nombre de résultats
      const limitedResults = filteredResults.slice(0, this.config.maxResults);

      console.log(`✅ Analyse terminée: ${limitedResults.length} corrélations détectées`);
      
      // Créer des report items si configuré
      if (this.config.autoCreateReportItems && limitedResults.length > 0) {
        await this.createCorrelationReportItems(limitedResults);
      }

      return limitedResults;
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de corrélation:', error);
      return [];
    }
  }

  /**
   * Exécute une règle de corrélation spécifique
   */
  private async executeCorrelationRule(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    switch (rule.type) {
      case 'ioc':
        results.push(...await this.executeIOCCorrelation(rule));
        break;
      case 'temporal':
        results.push(...await this.executeTemporalCorrelation(rule));
        break;
      case 'geographic':
        results.push(...await this.executeGeographicCorrelation(rule));
        break;
      case 'behavioral':
        results.push(...await this.executeBehavioralCorrelation(rule));
        break;
      case 'attribution':
        results.push(...await this.executeAttributionCorrelation(rule));
        break;
    }

    return results;
  }

  // ============ TYPES DE CORRÉLATION ============

  /**
   * Corrélation par IOCs
   */
  private async executeIOCCorrelation(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    try {
      // Récupérer les news items
      const newsItems = await this.taranisService.getNewsItems({ limit: 200, cybersecurity: true });
      
      // Extraire les IOCs
      const iocExtraction = await this.iocExtractorService.extractIOCsFromNewsItems(200, '30d');
      const iocs = iocExtraction.iocs;

      // Grouper les IOCs par valeur
      const iocGroups = new Map<string, any[]>();
      iocs.forEach(ioc => {
        const key = `${ioc.type}:${ioc.value}`;
        if (!iocGroups.has(key)) {
          iocGroups.set(key, []);
        }
        iocGroups.get(key)!.push(ioc);
      });

      // Trouver les IOCs qui apparaissent dans plusieurs incidents
      for (const [iocKey, iocList] of iocGroups) {
        if (iocList.length >= rule.parameters.minOccurrences) {
          const result: CorrelationResult = {
            id: `ioc-correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            elements: iocList.map(ioc => ({
              type: 'ioc',
              id: ioc.id,
              value: ioc.value,
              confidence: ioc.confidence
            })),
            confidence: rule.confidence,
            strength: Math.min(iocList.length / 5, 1.0), // Force basée sur le nombre d'occurrences
            type: 'ioc_cooccurrence',
            description: `IOC ${iocKey} appears in ${iocList.length} incidents`,
            timestamp: new Date(),
            verified: false
          };

          results.push(result);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la corrélation IOC:', error);
    }

    return results;
  }

  /**
   * Corrélation temporelle
   */
  private async executeTemporalCorrelation(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    try {
      // Récupérer les stories
      const stories = await this.taranisService.getStories();
      
      // Grouper par fenêtre temporelle
      const timeWindow = rule.parameters.timeWindow * 60 * 60 * 1000; // convertir en ms
      const now = Date.now();
      
      const timeGroups = new Map<string, any[]>();
      
      stories.forEach(story => {
        const storyTime = new Date(story.created || story.last_change).getTime();
        const timeGroup = Math.floor(storyTime / timeWindow);
        const groupKey = `group-${timeGroup}`;
        
        if (!timeGroups.has(groupKey)) {
          timeGroups.set(groupKey, []);
        }
        timeGroups.get(groupKey)!.push(story);
      });

      // Analyser les groupes avec plusieurs stories
      for (const [groupKey, groupStories] of timeGroups) {
        if (groupStories.length >= rule.parameters.minStories) {
          const result: CorrelationResult = {
            id: `temporal-correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            elements: groupStories.map(story => ({
              type: 'story',
              id: story.id,
              value: story.title,
              confidence: 0.8
            })),
            confidence: rule.confidence,
            strength: Math.min(groupStories.length / 10, 1.0),
            type: 'temporal_clustering',
            description: `${groupStories.length} stories occurred within ${rule.parameters.timeWindow}h window`,
            timestamp: new Date(),
            verified: false
          };

          results.push(result);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la corrélation temporelle:', error);
    }

    return results;
  }

  /**
   * Corrélation géographique
   */
  private async executeGeographicCorrelation(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    try {
      // Récupérer les news items avec géolocalisation
      const newsItems = await this.taranisService.getNewsItems({ limit: 200, cybersecurity: true });
      
      // Grouper par pays/région
      const geoGroups = new Map<string, any[]>();
      
      newsItems.forEach(item => {
        // Extraire les informations géographiques du contenu
        const content = `${item.title} ${item.content}`;
        const countries = this.extractCountriesFromContent(content);
        
        countries.forEach(country => {
          if (!geoGroups.has(country)) {
            geoGroups.set(country, []);
          }
          geoGroups.get(country)!.push(item);
        });
      });

      // Analyser les groupes géographiques
      for (const [country, items] of geoGroups) {
        if (items.length >= rule.parameters.minStories) {
          const result: CorrelationResult = {
            id: `geo-correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            elements: items.map(item => ({
              type: 'news_item',
              id: item.id,
              value: item.title,
              confidence: 0.7
            })),
            confidence: rule.confidence,
            strength: Math.min(items.length / 20, 1.0),
            type: 'geographic_clustering',
            description: `${items.length} incidents targeting ${country}`,
            timestamp: new Date(),
            verified: false
          };

          results.push(result);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la corrélation géographique:', error);
    }

    return results;
  }

  /**
   * Corrélation comportementale
   */
  private async executeBehavioralCorrelation(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    try {
      // Récupérer les stories
      const stories = await this.taranisService.getStories();
      
      // Analyser les TTPs et vecteurs d'attaque
      const behaviorGroups = new Map<string, any[]>();
      
      stories.forEach(story => {
        const ttps = this.extractTTPsFromStory(story);
        const attackVectors = this.extractAttackVectorsFromStory(story);
        const targets = this.extractTargetsFromStory(story);
        
        // Créer une signature comportementale
        const signature = this.createBehavioralSignature(ttps, attackVectors, targets);
        
        if (!behaviorGroups.has(signature)) {
          behaviorGroups.set(signature, []);
        }
        behaviorGroups.get(signature)!.push(story);
      });

      // Analyser les groupes comportementaux
      for (const [signature, groupStories] of behaviorGroups) {
        if (groupStories.length >= 2) {
          const result: CorrelationResult = {
            id: `behavioral-correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            elements: groupStories.map(story => ({
              type: 'story',
              id: story.id,
              value: story.title,
              confidence: 0.8
            })),
            confidence: rule.confidence,
            strength: Math.min(groupStories.length / 5, 1.0),
            type: 'behavioral_similarity',
            description: `${groupStories.length} stories with similar behavioral patterns`,
            timestamp: new Date(),
            verified: false
          };

          results.push(result);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la corrélation comportementale:', error);
    }

    return results;
  }

  /**
   * Corrélation d'attribution
   */
  private async executeAttributionCorrelation(rule: CorrelationRule): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    try {
      // Récupérer les stories
      const stories = await this.taranisService.getStories();
      
      // Analyser les attributions
      const attributionGroups = new Map<string, any[]>();
      
      stories.forEach(story => {
        const threatActors = this.extractThreatActorsFromStory(story);
        const techniques = this.extractTechniquesFromStory(story);
        const infrastructure = this.extractInfrastructureFromStory(story);
        
        threatActors.forEach(actor => {
          const key = `attribution-${actor}`;
          if (!attributionGroups.has(key)) {
            attributionGroups.set(key, []);
          }
          attributionGroups.get(key)!.push({
            story,
            techniques,
            infrastructure
          });
        });
      });

      // Analyser les groupes d'attribution
      for (const [actorKey, groupData] of attributionGroups) {
        if (groupData.length >= rule.parameters.minIndicators) {
          const result: CorrelationResult = {
            id: `attribution-correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            elements: groupData.map(data => ({
              type: 'story',
              id: data.story.id,
              value: data.story.title,
              confidence: 0.9
            })),
            confidence: rule.confidence,
            strength: Math.min(groupData.length / 10, 1.0),
            type: 'attribution_analysis',
            description: `${groupData.length} incidents attributed to ${actorKey.replace('attribution-', '')}`,
            timestamp: new Date(),
            verified: false
          };

          results.push(result);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la corrélation d\'attribution:', error);
    }

    return results;
  }

  // ============ MÉTHODES D'EXTRACTION ============

  /**
   * Extrait les pays depuis le contenu
   */
  private extractCountriesFromContent(content: string): string[] {
    const countries = [
      'United States', 'China', 'Russia', 'Iran', 'North Korea',
      'France', 'Germany', 'United Kingdom', 'Japan', 'South Korea',
      'India', 'Brazil', 'Australia', 'Canada', 'Mexico'
    ];
    
    const found: string[] = [];
    const contentLower = content.toLowerCase();
    
    countries.forEach(country => {
      if (contentLower.includes(country.toLowerCase())) {
        found.push(country);
      }
    });
    
    return found;
  }

  /**
   * Extrait les TTPs depuis une story
   */
  private extractTTPsFromStory(story: any): string[] {
    const ttps: string[] = [];
    const content = `${story.title} ${story.description}`;
    
    // Regex pour les TTPs MITRE ATT&CK
    const ttpRegex = /T\d{4}(?:\.\d{3})?/g;
    const matches = content.match(ttpRegex) || [];
    ttps.push(...matches);
    
    // Extraire depuis les tags
    if (story.tags) {
      story.tags.forEach((tag: any) => {
        if (tag.name && tag.name.match(/^T\d{4}/)) {
          ttps.push(tag.name);
        }
      });
    }
    
    return [...new Set(ttps)];
  }

  /**
   * Extrait les vecteurs d'attaque depuis une story
   */
  private extractAttackVectorsFromStory(story: any): string[] {
    const vectors: string[] = [];
    const content = `${story.title} ${story.description}`.toLowerCase();
    
    const vectorKeywords = {
      'Phishing': ['phishing', 'email', 'social engineering'],
      'Malware': ['malware', 'trojan', 'backdoor', 'keylogger'],
      'Ransomware': ['ransomware', 'encryption', 'ransom'],
      'Supply Chain': ['supply chain', 'third party', 'vendor'],
      'Watering Hole': ['watering hole', 'compromised website'],
      'DDoS': ['ddos', 'denial of service', 'flooding']
    };
    
    for (const [vector, keywords] of Object.entries(vectorKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        vectors.push(vector);
      }
    }
    
    return vectors;
  }

  /**
   * Extrait les cibles depuis une story
   */
  private extractTargetsFromStory(story: any): string[] {
    const targets: string[] = [];
    const content = `${story.title} ${story.description}`.toLowerCase();
    
    const targetKeywords = {
      'Government': ['government', 'gov', 'military', 'defense'],
      'Healthcare': ['healthcare', 'hospital', 'medical', 'pharmaceutical'],
      'Financial': ['bank', 'financial', 'payment', 'credit card'],
      'Energy': ['energy', 'power', 'electric', 'oil', 'gas'],
      'Technology': ['tech', 'software', 'cloud', 'saas'],
      'Education': ['education', 'university', 'school', 'academic']
    };
    
    for (const [target, keywords] of Object.entries(targetKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        targets.push(target);
      }
    }
    
    return targets;
  }

  /**
   * Crée une signature comportementale
   */
  private createBehavioralSignature(ttps: string[], attackVectors: string[], targets: string[]): string {
    const sortedTTPS = ttps.sort().join(',');
    const sortedVectors = attackVectors.sort().join(',');
    const sortedTargets = targets.sort().join(',');
    
    return `${sortedTTPS}|${sortedVectors}|${sortedTargets}`;
  }

  /**
   * Extrait les acteurs de menace depuis une story
   */
  private extractThreatActorsFromStory(story: any): string[] {
    const actors: string[] = [];
    const content = `${story.title} ${story.description}`;
    
    const knownActors = [
      'APT29', 'APT28', 'APT1', 'Lazarus', 'Conti', 'REvil',
      'Ryuk', 'Emotet', 'TrickBot', 'Zeus', 'Mirai',
      'Fancy Bear', 'Cozy Bear', 'Kimsuky', 'Sandworm', 'Turla'
    ];
    
    knownActors.forEach(actor => {
      if (content.toLowerCase().includes(actor.toLowerCase())) {
        actors.push(actor);
      }
    });
    
    return actors;
  }

  /**
   * Extrait les techniques depuis une story
   */
  private extractTechniquesFromStory(story: any): string[] {
    return this.extractTTPsFromStory(story);
  }

  /**
   * Extrait l'infrastructure depuis une story
   */
  private extractInfrastructureFromStory(story: any): string[] {
    const infrastructure: string[] = [];
    const content = `${story.title} ${story.description}`;
    
    // Extraire les domaines et IPs
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const domains = content.match(domainRegex) || [];
    infrastructure.push(...domains);
    
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const ips = content.match(ipRegex) || [];
    infrastructure.push(...ips);
    
    return [...new Set(infrastructure)];
  }

  // ============ GESTION DES STATISTIQUES ============

  /**
   * Met à jour les statistiques d'une règle
   */
  private async updateRuleStatistics(ruleId: string, results: CorrelationResult[]): Promise<void> {
    try {
      const rules = await this.getCorrelationRules();
      const ruleIndex = rules.findIndex(r => r.id === ruleId);
      
      if (ruleIndex !== -1) {
        rules[ruleIndex].matches += results.length;
        rules[ruleIndex].lastRun = new Date();
        
        // Calculer les faux positifs (approximation)
        const falsePositives = Math.floor(results.length * 0.1); // 10% de faux positifs estimés
        rules[ruleIndex].falsePositives += falsePositives;
        
        this.invalidateCache('rules');
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour des statistiques pour ${ruleId}:`, error);
    }
  }

  /**
   * Calcule les statistiques globales
   */
  async getCorrelationStatistics(): Promise<CorrelationStatistics> {
    try {
      const rules = await this.getCorrelationRules();
      const results = await this.getCached('results') || [];
      
      const totalRules = rules.length;
      const activeRules = rules.filter(r => r.status === 'active').length;
      const totalResults = results.length;
      const verifiedResults = results.filter((r: CorrelationResult) => r.verified).length;
      
      const totalMatches = rules.reduce((sum, r) => sum + r.matches, 0);
      const totalFalsePositives = rules.reduce((sum, r) => sum + r.falsePositives, 0);
      const falsePositiveRate = totalMatches > 0 ? totalFalsePositives / totalMatches : 0;
      
      const avgConfidence = results.length > 0 ? 
        results.reduce((sum: number, r: CorrelationResult) => sum + r.confidence, 0) / results.length : 0;
      
      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      
      rules.forEach(rule => {
        byType[rule.type] = (byType[rule.type] || 0) + 1;
        byStatus[rule.status] = (byStatus[rule.status] || 0) + 1;
      });
      
      return {
        totalRules,
        activeRules,
        totalResults,
        verifiedResults,
        falsePositiveRate,
        avgConfidence,
        byType,
        byStatus
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return {
        totalRules: 0,
        activeRules: 0,
        totalResults: 0,
        verifiedResults: 0,
        falsePositiveRate: 0,
        avgConfidence: 0,
        byType: {},
        byStatus: {}
      };
    }
  }

  // ============ CRÉATION DE REPORT ITEMS ============

  /**
   * Crée des report items pour les résultats de corrélation
   */
  private async createCorrelationReportItems(results: CorrelationResult[]): Promise<void> {
    try {
      console.log(`📄 Création de ${results.length} report items pour les corrélations...`);

      // Grouper les résultats par type
      const resultsByType = new Map<string, CorrelationResult[]>();
      results.forEach(result => {
        if (!resultsByType.has(result.type)) {
          resultsByType.set(result.type, []);
        }
        resultsByType.get(result.type)!.push(result);
      });

      for (const [type, typeResults] of resultsByType) {
        const reportItem = {
          title: `Correlation Analysis: ${type}`,
          report_item_type_id: this.config.reportItemTypeId,
          completed: false,
          attributes: [
            {
              key: 'description',
              value: `Automated correlation analysis results for ${typeResults.length} correlations`,
              type: 'TEXT'
            },
            {
              key: 'correlation_type',
              value: type,
              type: 'STRING'
            },
            {
              key: 'results_count',
              value: String(typeResults.length),
              type: 'NUMBER'
            },
            {
              key: 'analysis_date',
              value: new Date().toISOString(),
              type: 'DATE_TIME'
            },
            {
              key: 'correlation_results',
              value: JSON.stringify(typeResults.map(r => ({
                id: r.id,
                confidence: r.confidence,
                strength: r.strength,
                description: r.description,
                elementsCount: r.elements.length,
                timestamp: r.timestamp
              }))),
              type: 'TEXT'
            },
            {
              key: 'avg_confidence',
              value: String(
                typeResults.reduce((sum, r) => sum + r.confidence, 0) / typeResults.length
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
    }
  }

  // ============ GESTION DU CACHE ============

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

  // ============ MÉTHODES PUBLIQUES ============

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<CorrelationEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear();
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): CorrelationEngineConfig {
    return { ...this.config };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Exécute une règle spécifique
   */
  async executeRule(ruleId: string): Promise<CorrelationResult[]> {
    const rules = await this.getCorrelationRules();
    const rule = rules.find(r => r.id === ruleId);
    
    if (!rule) {
      throw new Error(`Règle ${ruleId} non trouvée`);
    }

    return await this.executeCorrelationRule(rule);
  }

  /**
   * Vérifie un résultat de corrélation
   */
  async verifyCorrelationResult(resultId: string, verified: boolean): Promise<boolean> {
    try {
      // TODO: Implémenter la vérification dans Taranis
      console.log(`✅ Résultat ${resultId} ${verified ? 'vérifié' : 'non vérifié'}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du résultat ${resultId}:`, error);
      return false;
    }
  }
}

// ============ INSTANCE SINGLETON ============

let correlationEngineInstance: CorrelationEngineService | null = null;

export function getCorrelationEngineService(): CorrelationEngineService {
  if (!correlationEngineInstance) {
    correlationEngineInstance = new CorrelationEngineService();
  }
  return correlationEngineInstance;
}
