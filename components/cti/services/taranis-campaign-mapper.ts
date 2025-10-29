/**
 * Service de Mapping Campagnes depuis API Taranis Natif
 * Utilise les trending clusters et story clusters de Taranis
 * 
 * MIGRATION: Utilise /api/dashboard/trending-clusters et /api/dashboard/story-clusters
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisTrendingCluster {
  tag_type: string;
  clusters: {
    tag_name: string;
    size: number;
    stories: any[];
  }[];
}

export interface TaranisStoryCluster {
  id: string;
  title: string;
  size: number;
  created: string;
  updated: string;
  relevance: number;
  tags: any[];
}

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
  stories: string[];
  newsItems: string[];
  clusterSize: number;
  relevance: number;
}

export interface CampaignExtractionResult {
  campaigns: Campaign[];
  totalCampaigns: number;
  activeCampaigns: number;
  dormantCampaigns: number;
  byThreatActor: Record<string, number>;
  bySeverity: Record<string, number>;
  totalStories: number;
  extractionMethod: 'trending_clusters' | 'story_clusters' | 'hybrid';
}

export interface TaranisCampaignMapperConfig {
  enabled: boolean;
  daysRange: number; // Nombre de jours pour trending clusters
  minClusterSize: number; // Taille minimum du cluster pour être considéré comme campagne
  confidenceThreshold: number;
  extractIOCs: boolean; // Extraire les IOCs des stories de la campagne
  extractTTPs: boolean; // Extraire les TTPs MITRE
}

// ============ SERVICE PRINCIPAL ============

export class TaranisCampaignMapperService {
  private taranisService = getTaranisService();
  private config: TaranisCampaignMapperConfig;
  private cache = new Map<string, CampaignExtractionResult>();
  private cacheExpiry = 15 * 60 * 1000; // 15 minutes

  constructor(config?: Partial<TaranisCampaignMapperConfig>) {
    this.config = {
      enabled: true,
      daysRange: 30,
      minClusterSize: 2,
      confidenceThreshold: 0.7,
      extractIOCs: true,
      extractTTPs: true,
      ...config
    };
  }

  // ============ EXTRACTION PRINCIPALE ============

  /**
   * Extrait les campagnes depuis les trending clusters Taranis (NATIF)
   */
  async extractCampaignsFromTaranis(days?: number): Promise<CampaignExtractionResult> {
    try {
      const daysRange = days || this.config.daysRange;
      const cacheKey = `campaigns-${daysRange}`;
      
      // Vérifier le cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        const age = Date.now() - (cached as any).timestamp;
        if (age < this.cacheExpiry) {
          console.log(`📦 Campagnes récupérées depuis le cache (${Math.round(age / 1000)}s)`);
          return cached;
        }
      }

      console.log(`🎯 Extraction campagnes depuis Taranis API: ${daysRange} jours`);
      
      // Récupérer les trending clusters depuis Taranis
      const trendingClusters = await this.fetchTrendingClusters(daysRange);
      console.log(`📊 ${trendingClusters?.length || 0} trending clusters récupérés`);
      
      // Récupérer les story clusters depuis Taranis
      const storyClusters = await this.fetchStoryClusters(daysRange);
      console.log(`📚 ${storyClusters?.length || 0} story clusters récupérés`);
      
      // Extraire campagnes depuis trending clusters (PRIORITAIRE)
      const campaignsFromTrending = await this.extractCampaignsFromTrendingClusters(trendingClusters);
      console.log(`✅ ${campaignsFromTrending.length} campagnes depuis trending clusters`);
      
      // Extraire campagnes depuis story clusters (COMPLÉMENTAIRE)
      const campaignsFromStories = await this.extractCampaignsFromStoryClusters(storyClusters);
      console.log(`✅ ${campaignsFromStories.length} campagnes depuis story clusters`);
      
      // Combiner et dédupliquer
      const allCampaigns = [...campaignsFromTrending, ...campaignsFromStories];
      const uniqueCampaigns = this.deduplicateCampaigns(allCampaigns);
      
      // Filtrer par taille minimum
      const filteredCampaigns = uniqueCampaigns.filter(
        c => c.clusterSize >= this.config.minClusterSize
      );
      
      // Enrichir avec IOCs et TTPs si configuré
      const enrichedCampaigns = await this.enrichCampaigns(filteredCampaigns);
      
      // Calculer les statistiques
      const method = campaignsFromStories.length > 0 ? 'hybrid' : 'trending_clusters';
      const result = this.calculateExtractionResult(enrichedCampaigns, method);
      
      // Mettre en cache
      (result as any).timestamp = Date.now();
      this.cache.set(cacheKey, result);
      
      console.log(`✅ Extraction terminée: ${result.totalCampaigns} campagnes`);
      console.log(`📊 Active: ${result.activeCampaigns}, Dormant: ${result.dormantCampaigns}`);
      console.log(`📈 Méthode: ${result.extractionMethod}`);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur extraction campagnes:', error);
      return this.getEmptyResult('trending_clusters');
    }
  }

  // ============ EXTRACTION DEPUIS TRENDING CLUSTERS (NATIF) ============

  /**
   * Extrait campagnes depuis les trending clusters Taranis
   */
  private async extractCampaignsFromTrendingClusters(
    trendingClusters: TaranisTrendingCluster[]
  ): Promise<Campaign[]> {
    const campaigns: Campaign[] = [];
    
    // S'assurer que trendingClusters est bien un array
    if (!Array.isArray(trendingClusters)) {
      console.warn('⚠️ trendingClusters n\'est pas un array, retour []');
      return campaigns;
    }
    
    for (const trendingCluster of trendingClusters) {
      const tagType = trendingCluster.tag_type;
      
      for (const cluster of trendingCluster.clusters) {
        // Filtrer les petits clusters
        if (cluster.size < this.config.minClusterSize) {
          continue;
        }
        
        // Créer une campagne depuis le cluster
        const campaign = await this.createCampaignFromCluster({
          tag_name: cluster.tag_name,
          tag_type: tagType,
          size: cluster.size,
          stories: cluster.stories
        });
        
        if (campaign) {
          campaigns.push(campaign);
        }
      }
    }
    
    return campaigns;
  }

  /**
   * Extrait campagnes depuis les story clusters Taranis
   */
  private async extractCampaignsFromStoryClusters(
    storyClusters: TaranisStoryCluster[]
  ): Promise<Campaign[]> {
    const campaigns: Campaign[] = [];
    
    for (const storyCluster of storyClusters) {
      // Filtrer les petits clusters
      if (storyCluster.size < this.config.minClusterSize) {
        continue;
      }
      
      // Créer une campagne depuis le story cluster
      const campaign = await this.createCampaignFromStoryCluster(storyCluster);
      
      if (campaign) {
        campaigns.push(campaign);
      }
    }
    
    return campaigns;
  }

  /**
   * Crée une campagne depuis un trending cluster Taranis
   */
  private async createCampaignFromCluster(data: {
    tag_name: string;
    tag_type: string;
    size: number;
    stories: any[];
  }): Promise<Campaign | null> {
    try {
      // Déterminer le threat actor depuis le tag
      const threatActor = this.extractThreatActor(data.tag_name, data.tag_type);
      
      // Déterminer le statut (active si stories récentes)
      const status = this.determineStatus(data.stories);
      
      // Déterminer la sévérité
      const severity = this.determineSeverity(data.tag_name, data.size);
      
      // Extraire les dates
      const dates = this.extractDates(data.stories);
      
      // Extraire les targets (industries, pays)
      const targets = this.extractTargets(data.stories);
      
      // Créer la campagne
      const campaign: Campaign = {
        id: `campaign-${this.hashString(data.tag_name)}`,
        name: this.formatCampaignName(data.tag_name, threatActor),
        description: `Campagne détectée depuis cluster Taranis: ${data.tag_name} (${data.tag_type})`,
        threatActor,
        status,
        severity,
        startDate: dates.start,
        lastActivity: dates.last,
        targets: targets.industries,
        iocs: [], // Sera enrichi plus tard
        ttp: [], // Sera enrichi plus tard
        countries: targets.countries,
        industries: targets.industries,
        victimCount: data.size, // Approximation: size du cluster
        attackVectors: this.extractAttackVectors(data.tag_name),
        attribution: {
          confidence: this.calculateAttributionConfidence(threatActor, data.tag_type),
          sources: ['Taranis Trending Clusters']
        },
        stories: data.stories.map(s => s.id || s),
        newsItems: [],
        clusterSize: data.size,
        relevance: data.size // Plus le cluster est grand, plus c'est pertinent
      };
      
      return campaign;
    } catch (error) {
      console.error('❌ Erreur création campagne depuis cluster:', error);
      return null;
    }
  }

  /**
   * Crée une campagne depuis un story cluster Taranis
   */
  private async createCampaignFromStoryCluster(
    storyCluster: TaranisStoryCluster
  ): Promise<Campaign | null> {
    try {
      // Extraire threat actor depuis les tags
      const threatActor = this.extractThreatActorFromTags(storyCluster.tags);
      
      // Déterminer sévérité basée sur relevance
      const severity = this.determineSeverityFromRelevance(storyCluster.relevance);
      
      // Déterminer statut
      const status = this.determineStatusFromDates(
        new Date(storyCluster.created),
        new Date(storyCluster.updated)
      );
      
      const campaign: Campaign = {
        id: `campaign-story-${storyCluster.id}`,
        name: storyCluster.title || `Campagne ${storyCluster.id}`,
        description: `Campagne détectée depuis story cluster Taranis`,
        threatActor,
        status,
        severity,
        startDate: new Date(storyCluster.created),
        lastActivity: new Date(storyCluster.updated),
        targets: [],
        iocs: [],
        ttp: [],
        countries: [],
        industries: [],
        victimCount: storyCluster.size,
        attackVectors: [],
        attribution: {
          confidence: 0.75,
          sources: ['Taranis Story Clusters']
        },
        stories: [storyCluster.id],
        newsItems: [],
        clusterSize: storyCluster.size,
        relevance: storyCluster.relevance
      };
      
      return campaign;
    } catch (error) {
      console.error('❌ Erreur création campagne depuis story cluster:', error);
      return null;
    }
  }

  // ============ UTILITAIRES ============

  /**
   * Récupère les trending clusters depuis Taranis
   */
  private async fetchTrendingClusters(days: number): Promise<TaranisTrendingCluster[]> {
    try {
      // Utiliser la méthode du service Taranis directement
      const response = await this.taranisService.getTrendingClusters(days);
      // S'assurer que c'est toujours un array
      const clusters = Array.isArray(response) ? response : (response?.items || response?.data || []);
      return clusters;
    } catch (error) {
      console.error('❌ Erreur récupération trending clusters:', error);
      return [];
    }
  }

  /**
   * Récupère les story clusters depuis Taranis
   */
  private async fetchStoryClusters(days: number, limit: number = 50): Promise<TaranisStoryCluster[]> {
    try {
      // Utiliser la méthode du service Taranis directement
      const response = await this.taranisService.getStoryClusters(days, limit);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ Erreur récupération story clusters:', error);
      return [];
    }
  }

  /**
   * Extrait le threat actor depuis un tag
   */
  private extractThreatActor(tagName: string, tagType: string): string {
    const lowerTag = tagName.toLowerCase();
    
    // APT groups connus
    const aptGroups = [
      'apt1', 'apt28', 'apt29', 'apt32', 'apt34', 'apt38', 'apt40', 'apt41',
      'lazarus', 'cozy bear', 'fancy bear', 'equation', 'turla', 'carbanak',
      'fin7', 'fin8', 'conti', 'lockbit', 'blackcat', 'alphv', 'revil'
    ];
    
    for (const apt of aptGroups) {
      if (lowerTag.includes(apt)) {
        return apt.toUpperCase();
      }
    }
    
    // Si c'est un tag de type "actor", utiliser le nom directement
    if (tagType.toLowerCase().includes('actor') || tagType.toLowerCase().includes('threat')) {
      return tagName;
    }
    
    return 'Unknown';
  }

  /**
   * Extrait threat actor depuis les tags d'un story cluster
   */
  private extractThreatActorFromTags(tags: any[]): string {
    if (!tags || tags.length === 0) return 'Unknown';
    
    for (const tag of tags) {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      if (tagName) {
        const actor = this.extractThreatActor(tagName, '');
        if (actor !== 'Unknown') {
          return actor;
        }
      }
    }
    
    return 'Unknown';
  }

  /**
   * Détermine le statut d'une campagne
   */
  private determineStatus(stories: any[]): 'active' | 'dormant' | 'terminated' {
    if (!stories || stories.length === 0) return 'dormant';
    
    // Si des stories récentes (< 7 jours), campagne active
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentStories = stories.filter(s => {
      const date = new Date(s.updated || s.created).getTime();
      return date > sevenDaysAgo;
    });
    
    return recentStories.length > 0 ? 'active' : 'dormant';
  }

  /**
   * Détermine le statut depuis les dates
   */
  private determineStatusFromDates(created: Date, updated: Date): 'active' | 'dormant' | 'terminated' {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    return updated.getTime() > sevenDaysAgo ? 'active' : 'dormant';
  }

  /**
   * Détermine la sévérité
   */
  private determineSeverity(tagName: string, size: number): 'low' | 'medium' | 'high' | 'critical' {
    const lowerTag = tagName.toLowerCase();
    
    // Mots-clés critiques
    const criticalKeywords = ['ransomware', 'critical', 'apt', 'espionage', 'nation-state'];
    if (criticalKeywords.some(k => lowerTag.includes(k))) {
      return 'critical';
    }
    
    // Basé sur la taille du cluster
    if (size > 50) return 'critical';
    if (size > 20) return 'high';
    if (size > 10) return 'medium';
    return 'low';
  }

  /**
   * Détermine sévérité depuis relevance
   */
  private determineSeverityFromRelevance(relevance: number): 'low' | 'medium' | 'high' | 'critical' {
    if (relevance >= 80) return 'critical';
    if (relevance >= 60) return 'high';
    if (relevance >= 40) return 'medium';
    return 'low';
  }

  /**
   * Extrait les dates
   */
  private extractDates(stories: any[]): { start: Date; last: Date } {
    if (!stories || stories.length === 0) {
      const now = new Date();
      return { start: now, last: now };
    }
    
    const dates = stories.map(s => new Date(s.created || s.updated || Date.now()).getTime());
    const start = new Date(Math.min(...dates));
    const last = new Date(Math.max(...dates));
    
    return { start, last };
  }

  /**
   * Extrait les targets (industries, pays)
   */
  private extractTargets(stories: any[]): { industries: string[]; countries: string[] } {
    // TODO: Analyser le contenu des stories pour extraire targets
    // Pour l'instant, retourne vide (à enrichir)
    return {
      industries: [],
      countries: []
    };
  }

  /**
   * Extrait les vecteurs d'attaque
   */
  private extractAttackVectors(tagName: string): string[] {
    const lowerTag = tagName.toLowerCase();
    const vectors: string[] = [];
    
    if (lowerTag.includes('phish')) vectors.push('Phishing');
    if (lowerTag.includes('malware')) vectors.push('Malware');
    if (lowerTag.includes('ransomware')) vectors.push('Ransomware');
    if (lowerTag.includes('exploit')) vectors.push('Exploit');
    if (lowerTag.includes('social')) vectors.push('Social Engineering');
    
    return vectors;
  }

  /**
   * Calcule la confiance de l'attribution
   */
  private calculateAttributionConfidence(threatActor: string, tagType: string): number {
    if (threatActor === 'Unknown') return 0.5;
    if (tagType.toLowerCase().includes('actor')) return 0.9;
    return 0.75;
  }

  /**
   * Formate le nom de la campagne
   */
  private formatCampaignName(tagName: string, threatActor: string): string {
    if (threatActor !== 'Unknown') {
      return `${threatActor} Campaign: ${tagName}`;
    }
    return `Campaign: ${tagName}`;
  }

  /**
   * Déduplique les campagnes
   */
  private deduplicateCampaigns(campaigns: Campaign[]): Campaign[] {
    const seen = new Map<string, Campaign>();
    
    for (const campaign of campaigns) {
      // Dédupliquer par nom ou ID
      const key = campaign.name.toLowerCase();
      
      if (!seen.has(key)) {
        seen.set(key, campaign);
      } else {
        // Garder celle avec le plus grand cluster
        const existing = seen.get(key)!;
        if (campaign.clusterSize > existing.clusterSize) {
          seen.set(key, campaign);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * Enrichit les campagnes avec IOCs et TTPs
   */
  private async enrichCampaigns(campaigns: Campaign[]): Promise<Campaign[]> {
    // TODO: Enrichir avec IOCs et TTPs depuis les stories
    // Pour l'instant, retourne tel quel
    return campaigns;
  }

  /**
   * Calcule le résultat d'extraction
   */
  private calculateExtractionResult(
    campaigns: Campaign[],
    method: 'trending_clusters' | 'story_clusters' | 'hybrid'
  ): CampaignExtractionResult {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const dormantCampaigns = campaigns.filter(c => c.status === 'dormant').length;
    
    const byThreatActor: Record<string, number> = {};
    campaigns.forEach(c => {
      byThreatActor[c.threatActor] = (byThreatActor[c.threatActor] || 0) + 1;
    });
    
    const bySeverity: Record<string, number> = {};
    campaigns.forEach(c => {
      bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
    });
    
    const totalStories = campaigns.reduce((sum, c) => sum + c.stories.length, 0);
    
    return {
      campaigns,
      totalCampaigns: campaigns.length,
      activeCampaigns,
      dormantCampaigns,
      byThreatActor,
      bySeverity,
      totalStories,
      extractionMethod: method
    };
  }

  /**
   * Résultat vide
   */
  private getEmptyResult(method: 'trending_clusters' | 'story_clusters' | 'hybrid'): CampaignExtractionResult {
    return {
      campaigns: [],
      totalCampaigns: 0,
      activeCampaigns: 0,
      dormantCampaigns: 0,
      byThreatActor: {},
      bySeverity: {},
      totalStories: 0,
      extractionMethod: method
    };
  }

  /**
   * Hash simple pour IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ============ SINGLETON ============

let instance: TaranisCampaignMapperService | null = null;

export function getTaranisCampaignMapperService(config?: Partial<TaranisCampaignMapperConfig>): TaranisCampaignMapperService {
  if (!instance) {
    instance = new TaranisCampaignMapperService(config);
  }
  return instance;
}

export function resetTaranisCampaignMapperService(): void {
  instance = null;
}

