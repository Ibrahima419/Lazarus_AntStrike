/**
 * Service de Tracking des Campagnes
 * Remplace les données mockées par la création réelle de campagnes depuis les stories Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { getIOCExtractorService } from './ioc-extractor-service';

// ============ TYPES & INTERFACES ============

export interface Campaign {
  id: string;
  name: string;
  description: string;
  threatActor: string;
  status: 'active' | 'dormant' | 'terminated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  lastActivity: Date;
  targets: string[];
  iocs: string[];
  ttp: string[];
  countries: string[];
  industries: string[];
  victimCount: number;
  attackVectors: string[];
  attribution: {
    confidence: number;
    sources: string[];
  };
  stories: string[]; // IDs des stories liées
  newsItems: string[]; // IDs des news items liés
  reportItemId?: string; // ID du report item Taranis
}

export interface CampaignCreationResult {
  campaign: Campaign;
  created: boolean;
  storiesGrouped: number;
  iocsExtracted: number;
  confidence: number;
}

export interface CampaignTrackerConfig {
  enabled: boolean;
  minStoriesForCampaign: number;
  similarityThreshold: number;
  temporalWindow: number; // en jours
  autoCreateReportItems: boolean;
  reportItemTypeId: number;
  iocExtractionEnabled: boolean;
  attributionEnabled: boolean;
  clusteringEnabled: boolean;
}

export interface StorySimilarity {
  story1: string;
  story2: string;
  similarity: number;
  factors: {
    temporal: number;
    ioc: number;
    ttp: number;
    geographic: number;
    thematic: number;
  };
}

// ============ SERVICE PRINCIPAL ============

export class CampaignTrackerService {
  private taranisService = getTaranisService();
  private iocExtractorService = getIOCExtractorService();
  private config: CampaignTrackerConfig;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  constructor(config?: Partial<CampaignTrackerConfig>) {
    this.config = {
      enabled: true,
      minStoriesForCampaign: 2,
      similarityThreshold: 0.7,
      temporalWindow: 30, // 30 jours
      autoCreateReportItems: true,
      reportItemTypeId: 2, // À configurer selon votre setup
      iocExtractionEnabled: true,
      attributionEnabled: true,
      clusteringEnabled: true,
      ...config
    };
  }

  // ============ TRACKING PRINCIPAL ============

  /**
   * Analyse les stories et crée des campagnes
   */
  async trackCampaigns(range: string = '30d'): Promise<Campaign[]> {
    try {
      console.log(`🎯 Tracking des campagnes sur ${range}...`);
      
      // Récupérer les stories depuis Taranis
      const stories = await this.taranisService.getStories();
      
      if (!stories || stories.length === 0) {
        console.log('⚠️ Aucune story trouvée pour le tracking des campagnes');
        return [];
      }

      console.log(`📚 ${stories.length} stories récupérées`);

      // Filtrer les stories récentes
      const recentStories = this.filterRecentStories(stories, range);
      console.log(`📅 ${recentStories.length} stories récentes`);

      // Analyser les similarités entre stories
      const similarities = await this.analyzeStorySimilarities(recentStories);
      console.log(`🔗 ${similarities.length} similarités détectées`);

      // Grouper les stories en clusters
      const clusters = this.clusterStoriesBySimilarity(recentStories, similarities);
      console.log(`🎯 ${clusters.length} clusters de campagnes détectés`);

      // Créer les campagnes depuis les clusters
      const campaigns: Campaign[] = [];
      for (const cluster of clusters) {
        if (cluster.stories.length >= this.config.minStoriesForCampaign) {
          const campaign = await this.createCampaignFromCluster(cluster);
          campaigns.push(campaign);
        }
      }

      console.log(`✅ ${campaigns.length} campagnes créées`);
      
      // Mettre en cache
      this.setCached('campaigns', campaigns);
      
      return campaigns;
    } catch (error) {
      console.error('❌ Erreur lors du tracking des campagnes:', error);
      return [];
    }
  }

  /**
   * Crée une campagne depuis un cluster de stories
   */
  private async createCampaignFromCluster(cluster: {
    stories: any[];
    similarity: number;
    commonIOCs: string[];
    commonTTPs: string[];
    countries: string[];
    industries: string[];
  }): Promise<Campaign> {
    const stories = cluster.stories;
    const storyIds = stories.map(s => s.id);
    const newsItemIds = stories.flatMap(s => s.news_items?.map((ni: any) => ni.id) || []);

    // Analyser les données des stories
    const analysis = this.analyzeStoriesForCampaign(stories);

    // Créer l'ID de la campagne
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Créer la campagne
    const campaign: Campaign = {
      id: campaignId,
      name: analysis.name,
      description: analysis.description,
      threatActor: analysis.threatActor,
      status: this.determineCampaignStatus(stories),
      severity: analysis.severity,
      startDate: analysis.startDate,
      lastActivity: analysis.lastActivity,
      targets: analysis.targets,
      iocs: cluster.commonIOCs,
      ttp: cluster.commonTTPs,
      countries: cluster.countries,
      industries: cluster.industries,
      victimCount: analysis.victimCount,
      attackVectors: analysis.attackVectors,
      attribution: {
        confidence: analysis.attributionConfidence,
        sources: analysis.attributionSources
      },
      stories: storyIds,
      newsItems: newsItemIds
    };

    // Créer un report item dans Taranis si configuré
    if (this.config.autoCreateReportItems) {
      try {
        const reportItemId = await this.createCampaignReportItem(campaign);
        campaign.reportItemId = reportItemId;
      } catch (error) {
        console.error('❌ Erreur lors de la création du report item:', error);
      }
    }

    return campaign;
  }

  // ============ ANALYSE DES SIMILARITÉS ============

  /**
   * Analyse les similarités entre stories
   */
  private async analyzeStorySimilarities(stories: any[]): Promise<StorySimilarity[]> {
    const similarities: StorySimilarity[] = [];

    for (let i = 0; i < stories.length; i++) {
      for (let j = i + 1; j < stories.length; j++) {
        const story1 = stories[i];
        const story2 = stories[j];

        const similarity = await this.calculateStorySimilarity(story1, story2);
        
        if (similarity.similarity >= this.config.similarityThreshold) {
          similarities.push({
            story1: story1.id,
            story2: story2.id,
            similarity: similarity.similarity,
            factors: similarity.factors
          });
        }
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calcule la similarité entre deux stories
   */
  private async calculateStorySimilarity(story1: any, story2: any): Promise<{
    similarity: number;
    factors: {
      temporal: number;
      ioc: number;
      ttp: number;
      geographic: number;
      thematic: number;
    };
  }> {
    const factors = {
      temporal: 0,
      ioc: 0,
      ttp: 0,
      geographic: 0,
      thematic: 0
    };

    // 1. Similarité temporelle
    const date1 = new Date(story1.created || story1.last_change);
    const date2 = new Date(story2.created || story2.last_change);
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= this.config.temporalWindow) {
      factors.temporal = Math.max(0, 1 - (daysDiff / this.config.temporalWindow));
    }

    // 2. Similarité des IOCs
    const iocs1 = this.extractIOCsFromStory(story1);
    const iocs2 = this.extractIOCsFromStory(story2);
    factors.ioc = this.calculateSetSimilarity(iocs1, iocs2);

    // 3. Similarité des TTPs (basée sur les tags)
    const ttp1 = this.extractTTPsFromStory(story1);
    const ttp2 = this.extractTTPsFromStory(story2);
    factors.ttp = this.calculateSetSimilarity(ttp1, ttp2);

    // 4. Similarité géographique
    const geo1 = this.extractGeographicInfo(story1);
    const geo2 = this.extractGeographicInfo(story2);
    factors.geographic = this.calculateSetSimilarity(geo1, geo2);

    // 5. Similarité thématique (basée sur le contenu)
    const thematic1 = this.extractThematicKeywords(story1);
    const thematic2 = this.extractThematicKeywords(story2);
    factors.thematic = this.calculateSetSimilarity(thematic1, thematic2);

    // Calculer la similarité globale (moyenne pondérée)
    const weights = {
      temporal: 0.2,
      ioc: 0.3,
      ttp: 0.25,
      geographic: 0.15,
      thematic: 0.1
    };

    const similarity = 
      factors.temporal * weights.temporal +
      factors.ioc * weights.ioc +
      factors.ttp * weights.ttp +
      factors.geographic * weights.geographic +
      factors.thematic * weights.thematic;

    return { similarity, factors };
  }

  // ============ CLUSTERING ============

  /**
   * Groupe les stories en clusters basés sur la similarité
   */
  private clusterStoriesBySimilarity(stories: any[], similarities: StorySimilarity[]): Array<{
    stories: any[];
    similarity: number;
    commonIOCs: string[];
    commonTTPs: string[];
    countries: string[];
    industries: string[];
  }> {
    const clusters: Array<{
      stories: any[];
      similarity: number;
      commonIOCs: string[];
      commonTTPs: string[];
      countries: string[];
      industries: string[];
    }> = [];

    const processed = new Set<string>();

    for (const story of stories) {
      if (processed.has(story.id)) continue;

      // Trouver toutes les stories similaires
      const similarStories = this.findSimilarStories(story.id, similarities, processed);
      similarStories.push(story);

      if (similarStories.length >= this.config.minStoriesForCampaign) {
        // Calculer les métadonnées du cluster
        const cluster = this.analyzeCluster(similarStories);
        clusters.push(cluster);

        // Marquer comme traitées
        similarStories.forEach(s => processed.add(s.id));
      }
    }

    return clusters;
  }

  /**
   * Trouve les stories similaires à une story donnée
   */
  private findSimilarStories(
    storyId: string, 
    similarities: StorySimilarity[], 
    processed: Set<string>
  ): any[] {
    const similarStories: any[] = [];
    const toProcess = [storyId];

    while (toProcess.length > 0) {
      const currentId = toProcess.pop()!;
      
      for (const sim of similarities) {
        let otherId: string | null = null;
        
        if (sim.story1 === currentId) {
          otherId = sim.story2;
        } else if (sim.story2 === currentId) {
          otherId = sim.story1;
        }

        if (otherId && !processed.has(otherId) && !similarStories.some(s => s.id === otherId)) {
          // Récupérer la story (on devrait avoir un cache)
          const story = this.getStoryById(otherId);
          if (story) {
            similarStories.push(story);
            toProcess.push(otherId);
          }
        }
      }
    }

    return similarStories;
  }

  // ============ EXTRACTION DE DONNÉES ============

  /**
   * Extrait les IOCs d'une story
   */
  private extractIOCsFromStory(story: any): Set<string> {
    const iocs = new Set<string>();
    
    // Extraire depuis le contenu de la story
    const content = `${story.title} ${story.description} ${story.comments}`;
    
    // IPs
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const ips = content.match(ipRegex) || [];
    ips.forEach(ip => iocs.add(`ip:${ip}`));

    // Domaines
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const domains = content.match(domainRegex) || [];
    domains.forEach(domain => iocs.add(`domain:${domain.toLowerCase()}`));

    // Hashes
    const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
    const hashes = content.match(hashRegex) || [];
    hashes.forEach(hash => iocs.add(`hash:${hash.toLowerCase()}`));

    // URLs
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = content.match(urlRegex) || [];
    urls.forEach(url => iocs.add(`url:${url}`));

    // Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex) || [];
    emails.forEach(email => iocs.add(`email:${email.toLowerCase()}`));

    return iocs;
  }

  /**
   * Extrait les TTPs d'une story
   */
  private extractTTPsFromStory(story: any): Set<string> {
    const ttps = new Set<string>();
    
    // Extraire depuis les tags
    if (story.tags) {
      story.tags.forEach((tag: any) => {
        if (tag.name && tag.name.match(/^T\d{4}/)) {
          ttps.add(tag.name);
        }
      });
    }

    // Extraire depuis le contenu
    const content = `${story.title} ${story.description}`;
    const ttpRegex = /T\d{4}(?:\.\d{3})?/g;
    const matches = content.match(ttpRegex) || [];
    matches.forEach(ttp => ttps.add(ttp));

    return ttps;
  }

  /**
   * Extrait les informations géographiques d'une story
   */
  private extractGeographicInfo(story: any): Set<string> {
    const geo = new Set<string>();
    
    const content = `${story.title} ${story.description}`;
    
    // Pays
    const countries = [
      'United States', 'China', 'Russia', 'Iran', 'North Korea',
      'France', 'Germany', 'United Kingdom', 'Japan', 'South Korea',
      'India', 'Brazil', 'Australia', 'Canada', 'Mexico'
    ];
    
    countries.forEach(country => {
      if (content.toLowerCase().includes(country.toLowerCase())) {
        geo.add(country);
      }
    });

    return geo;
  }

  /**
   * Extrait les mots-clés thématiques d'une story
   */
  private extractThematicKeywords(story: any): Set<string> {
    const keywords = new Set<string>();
    
    const content = `${story.title} ${story.description}`.toLowerCase();
    
    const themes = [
      'apt', 'ransomware', 'phishing', 'malware', 'trojan',
      'backdoor', 'keylogger', 'botnet', 'ddos', 'espionage',
      'cybercrime', 'hacktivism', 'nation-state', 'criminal',
      'financial', 'healthcare', 'government', 'critical infrastructure'
    ];
    
    themes.forEach(theme => {
      if (content.includes(theme)) {
        keywords.add(theme);
      }
    });

    return keywords;
  }

  // ============ ANALYSE DES CAMPAGNES ============

  /**
   * Analyse un cluster de stories pour créer une campagne
   */
  private analyzeStoriesForCampaign(stories: any[]): {
    name: string;
    description: string;
    threatActor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    startDate: Date;
    lastActivity: Date;
    targets: string[];
    victimCount: number;
    attackVectors: string[];
    attributionConfidence: number;
    attributionSources: string[];
  } {
    // Analyser les dates
    const dates = stories.map(s => new Date(s.created || s.last_change)).sort();
    const startDate = dates[0];
    const lastActivity = dates[dates.length - 1];

    // Analyser les tags pour déterminer la sévérité
    const allTags = stories.flatMap(s => s.tags || []).map((t: any) => t.name);
    const severity = this.determineSeverityFromTags(allTags);

    // Analyser les acteurs de menace
    const threatActor = this.determineThreatActor(stories);

    // Analyser les cibles
    const targets = this.determineTargets(stories);

    // Analyser les vecteurs d'attaque
    const attackVectors = this.determineAttackVectors(stories);

    // Générer le nom de la campagne
    const name = this.generateCampaignName(threatActor, targets, startDate);

    // Générer la description
    const description = this.generateCampaignDescription(stories, threatActor, targets);

    return {
      name,
      description,
      threatActor,
      severity,
      startDate,
      lastActivity,
      targets,
      victimCount: stories.length, // Approximation
      attackVectors,
      attributionConfidence: 0.8, // À améliorer avec ML
      attributionSources: ['OSINT', 'Technical Analysis', 'Intelligence Reports']
    };
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Filtre les stories récentes
   */
  private filterRecentStories(stories: any[], range: string): any[] {
    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return stories.filter(story => {
      const storyDate = new Date(story.created || story.last_change);
      return storyDate >= cutoffDate;
    });
  }

  /**
   * Calcule la similarité entre deux ensembles
   */
  private calculateSetSimilarity(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 && set2.size === 0) return 1;
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Détermine le statut d'une campagne
   */
  private determineCampaignStatus(stories: any[]): 'active' | 'dormant' | 'terminated' {
    const now = new Date();
    const lastActivity = Math.max(...stories.map(s => new Date(s.created || s.last_change).getTime()));
    const daysSinceLastActivity = (now.getTime() - lastActivity) / (1000 * 60 * 60 * 24);

    if (daysSinceLastActivity <= 7) return 'active';
    if (daysSinceLastActivity <= 30) return 'dormant';
    return 'terminated';
  }

  /**
   * Détermine la sévérité depuis les tags
   */
  private determineSeverityFromTags(tags: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['apt', 'nation-state', 'critical infrastructure', 'ransomware'];
    const highKeywords = ['malware', 'trojan', 'backdoor', 'espionage'];
    const mediumKeywords = ['phishing', 'social engineering', 'credential theft'];

    const tagString = tags.join(' ').toLowerCase();

    if (criticalKeywords.some(keyword => tagString.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => tagString.includes(keyword))) {
      return 'high';
    }
    if (mediumKeywords.some(keyword => tagString.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Détermine l'acteur de menace
   */
  private determineThreatActor(stories: any[]): string {
    const allContent = stories.map(s => `${s.title} ${s.description}`).join(' ').toLowerCase();
    
    const actors = [
      'APT29', 'APT28', 'APT1', 'Lazarus', 'Conti', 'REvil',
      'Ryuk', 'Emotet', 'TrickBot', 'Zeus', 'Mirai'
    ];

    for (const actor of actors) {
      if (allContent.includes(actor.toLowerCase())) {
        return actor;
      }
    }

    return 'Unknown';
  }

  /**
   * Détermine les cibles
   */
  private determineTargets(stories: any[]): string[] {
    const targets = new Set<string>();
    const allContent = stories.map(s => `${s.title} ${s.description}`).join(' ').toLowerCase();

    const targetKeywords = {
      'Government': ['government', 'gov', 'military', 'defense'],
      'Healthcare': ['healthcare', 'hospital', 'medical', 'pharmaceutical'],
      'Financial': ['bank', 'financial', 'payment', 'credit card'],
      'Energy': ['energy', 'power', 'electric', 'oil', 'gas'],
      'Technology': ['tech', 'software', 'cloud', 'saas'],
      'Education': ['education', 'university', 'school', 'academic'],
      'Manufacturing': ['manufacturing', 'industrial', 'factory'],
      'Retail': ['retail', 'ecommerce', 'shopping']
    };

    for (const [target, keywords] of Object.entries(targetKeywords)) {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        targets.add(target);
      }
    }

    return Array.from(targets);
  }

  /**
   * Détermine les vecteurs d'attaque
   */
  private determineAttackVectors(stories: any[]): string[] {
    const vectors = new Set<string>();
    const allContent = stories.map(s => `${s.title} ${s.description}`).join(' ').toLowerCase();

    const vectorKeywords = {
      'Phishing': ['phishing', 'email', 'social engineering'],
      'Supply Chain': ['supply chain', 'third party', 'vendor'],
      'Watering Hole': ['watering hole', 'compromised website'],
      'Spear Phishing': ['spear phishing', 'targeted email'],
      'Malware': ['malware', 'trojan', 'backdoor', 'keylogger'],
      'Ransomware': ['ransomware', 'encryption', 'ransom'],
      'DDoS': ['ddos', 'denial of service', 'flooding'],
      'Insider Threat': ['insider', 'employee', 'privileged access']
    };

    for (const [vector, keywords] of Object.entries(vectorKeywords)) {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        vectors.add(vector);
      }
    }

    return Array.from(vectors);
  }

  /**
   * Génère un nom de campagne
   */
  private generateCampaignName(threatActor: string, targets: string[], startDate: Date): string {
    const targetStr = targets.length > 0 ? targets[0] : 'Multiple';
    const month = startDate.toLocaleDateString('en-US', { month: 'short' });
    const year = startDate.getFullYear();
    
    return `${threatActor} ${targetStr} Campaign ${month} ${year}`;
  }

  /**
   * Génère une description de campagne
   */
  private generateCampaignDescription(stories: any[], threatActor: string, targets: string[]): string {
    const targetStr = targets.length > 0 ? targets.join(', ') : 'multiple sectors';
    return `Campaign targeting ${targetStr} attributed to ${threatActor}. Analysis based on ${stories.length} related stories.`;
  }

  /**
   * Analyse un cluster de stories
   */
  private analyzeCluster(stories: any[]): {
    stories: any[];
    similarity: number;
    commonIOCs: string[];
    commonTTPs: string[];
    countries: string[];
    industries: string[];
  } {
    // Collecter tous les IOCs
    const allIOCs = new Set<string>();
    stories.forEach(story => {
      const iocs = this.extractIOCsFromStory(story);
      iocs.forEach(ioc => allIOCs.add(ioc));
    });

    // Collecter tous les TTPs
    const allTTPs = new Set<string>();
    stories.forEach(story => {
      const ttps = this.extractTTPsFromStory(story);
      ttps.forEach(ttp => allTTPs.add(ttp));
    });

    // Collecter les pays
    const allCountries = new Set<string>();
    stories.forEach(story => {
      const geo = this.extractGeographicInfo(story);
      geo.forEach(country => allCountries.add(country));
    });

    // Collecter les industries
    const allIndustries = new Set<string>();
    stories.forEach(story => {
      const targets = this.determineTargets([story]);
      targets.forEach(target => allIndustries.add(target));
    });

    return {
      stories,
      similarity: 0.8, // À calculer plus précisément
      commonIOCs: Array.from(allIOCs),
      commonTTPs: Array.from(allTTPs),
      countries: Array.from(allCountries),
      industries: Array.from(allIndustries)
    };
  }

  /**
   * Récupère une story par ID (à implémenter avec cache)
   */
  private getStoryById(id: string): any {
    // TODO: Implémenter avec un cache des stories
    return null;
  }

  /**
   * Crée un report item pour une campagne
   */
  private async createCampaignReportItem(campaign: Campaign): Promise<string> {
    const reportItem = {
      title: campaign.name,
      description: campaign.description,
      report_item_type_id: this.config.reportItemTypeId,
      completed: false,
      attributes: [
        {
          key: 'threat_actor',
          value: campaign.threatActor,
          type: 'STRING'
        },
        {
          key: 'severity',
          value: campaign.severity,
          type: 'STRING'
        },
        {
          key: 'status',
          value: campaign.status,
          type: 'STRING'
        },
        {
          key: 'start_date',
          value: campaign.startDate.toISOString(),
          type: 'DATE_TIME'
        },
        {
          key: 'last_activity',
          value: campaign.lastActivity.toISOString(),
          type: 'DATE_TIME'
        },
        {
          key: 'targets',
          value: JSON.stringify(campaign.targets),
          type: 'TEXT'
        },
        {
          key: 'iocs',
          value: JSON.stringify(campaign.iocs),
          type: 'TEXT'
        },
        {
          key: 'ttp',
          value: JSON.stringify(campaign.ttp),
          type: 'TEXT'
        },
        {
          key: 'countries',
          value: JSON.stringify(campaign.countries),
          type: 'TEXT'
        },
        {
          key: 'industries',
          value: JSON.stringify(campaign.industries),
          type: 'TEXT'
        },
        {
          key: 'victim_count',
          value: String(campaign.victimCount),
          type: 'NUMBER'
        },
        {
          key: 'attack_vectors',
          value: JSON.stringify(campaign.attackVectors),
          type: 'TEXT'
        },
        {
          key: 'attribution_confidence',
          value: String(campaign.attribution.confidence),
          type: 'NUMBER'
        },
        {
          key: 'stories_count',
          value: String(campaign.stories.length),
          type: 'NUMBER'
        }
      ]
    };

    // Créer le report item via l'API Taranis
    const response = await this.taranisService.createReportItem(reportItem);
    return response.id;
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

  // ============ MÉTHODES PUBLIQUES ============

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<CampaignTrackerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear();
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): CampaignTrackerConfig {
    return { ...this.config };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============ INSTANCE SINGLETON ============

let campaignTrackerInstance: CampaignTrackerService | null = null;

export function getCampaignTrackerService(): CampaignTrackerService {
  if (!campaignTrackerInstance) {
    campaignTrackerInstance = new CampaignTrackerService();
  }
  return campaignTrackerInstance;
}
