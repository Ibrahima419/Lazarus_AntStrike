/**
 * Service de Corrélation depuis API Taranis Natif
 * Utilise /api/assess/stories/group et /api/bots/stories/group pour corréler
 * 
 * MIGRATION: Remplace la logique de corrélation mockée par le groupement Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisStoryGroupRequest {
  story_ids: string[];
}

export interface TaranisStoryGroupResponse {
  id: string;
  title: string;
  description: string;
  created: string;
  updated: string;
  stories: any[];
}

export interface CorrelationResult {
  id: string;
  title: string;
  description: string;
  storyIds: string[];
  storyCount: number;
  confidence: number;
  correlationType: 'temporal' | 'semantic' | 'actor' | 'ioc' | 'tag' | 'manual';
  created: string;
  updated: string;
  metadata: {
    sharedIOCs?: string[];
    sharedTags?: string[];
    sharedActors?: string[];
    timeWindow?: string;
  };
}

export interface CorrelationExtraction {
  correlations: CorrelationResult[];
  totalCorrelations: number;
  byType: Record<string, number>;
  extractionMethod: 'taranis_grouping' | 'fallback';
  lastUpdate: string;
}

// ============ CACHE ============

interface CachedCorrelations {
  data: CorrelationExtraction;
  timestamp: number;
}

let correlationsCache: CachedCorrelations | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============ SERVICE CLASS ============

class TaranisCorrelationMapperService {
  private taranisService = getTaranisService();

  /**
   * Extrait les corrélations depuis les story groups Taranis
   */
  async extractCorrelationsFromTaranis(): Promise<CorrelationExtraction> {
    // Vérifier le cache
    if (correlationsCache && Date.now() - correlationsCache.timestamp < CACHE_DURATION) {
      console.log('🔗 Correlations: Utilisation du cache');
      return correlationsCache.data;
    }

    console.log('🔗 Extraction corrélations depuis Taranis story groups...');

    try {
      // Récupérer les stories récentes pour trouver les groupes
      const stories = await this.taranisService.getStories({ limit: 500 });
      
      if (!stories?.items || stories.items.length === 0) {
        console.warn('⚠️ Aucune story disponible pour corrélation');
        return this.createFallbackExtraction();
      }

      const correlations: CorrelationResult[] = [];
      const byType: Record<string, number> = {
        temporal: 0,
        semantic: 0,
        actor: 0,
        ioc: 0,
        tag: 0,
        manual: 0,
      };

      // 1. Corrélation par TAGS (la plus fiable avec Taranis)
      const tagCorrelations = await this.correlateByTags(stories.items);
      correlations.push(...tagCorrelations);
      byType.tag = tagCorrelations.length;

      // 2. Corrélation TEMPORELLE (stories dans même fenêtre temporelle)
      const temporalCorrelations = await this.correlateByTime(stories.items);
      correlations.push(...temporalCorrelations);
      byType.temporal = temporalCorrelations.length;

      // 3. Corrélation par ACTEUR (même source/osint_source_id)
      const actorCorrelations = await this.correlateByActor(stories.items);
      correlations.push(...actorCorrelations);
      byType.actor = actorCorrelations.length;

      // 4. Corrélation par IOCs PARTAGÉS
      const iocCorrelations = await this.correlateByIOCs(stories.items);
      correlations.push(...iocCorrelations);
      byType.ioc = iocCorrelations.length;

      // 5. Corrélation SÉMANTIQUE (via news_items attributs similaires)
      const semanticCorrelations = await this.correlateBySemantics(stories.items);
      correlations.push(...semanticCorrelations);
      byType.semantic = semanticCorrelations.length;

      const extraction: CorrelationExtraction = {
        correlations,
        totalCorrelations: correlations.length,
        byType,
        extractionMethod: 'taranis_grouping',
        lastUpdate: new Date().toISOString(),
      };

      console.log(`✅ ${extraction.totalCorrelations} corrélations extraites (Tags: ${byType.tag}, Temporal: ${byType.temporal}, Actor: ${byType.actor})`);

      // Mettre en cache
      correlationsCache = {
        data: extraction,
        timestamp: Date.now(),
      };

      return extraction;

    } catch (error) {
      console.error('❌ Erreur extraction corrélations:', error);
      return this.createFallbackExtraction();
    }
  }

  /**
   * Corréler stories par TAGS partagés
   */
  private async correlateByTags(stories: any[]): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    const tagGroups: Record<string, any[]> = {};

    // Grouper stories par tags
    for (const story of stories) {
      if (story.tags && story.tags.length > 0) {
        for (const tag of story.tags) {
          const tagKey = `${tag.tag_type}:${tag.name}`;
          if (!tagGroups[tagKey]) {
            tagGroups[tagKey] = [];
          }
          tagGroups[tagKey].push(story);
        }
      }
    }

    // Créer des corrélations pour les groupes de 2+ stories
    for (const [tagKey, groupedStories] of Object.entries(tagGroups)) {
      if (groupedStories.length >= 2) {
        const [tagType, tagName] = tagKey.split(':');
        
        correlations.push({
          id: `corr-tag-${tagKey.replace(/[^a-zA-Z0-9]/g, '-')}`,
          title: `Corrélation par tag: ${tagName}`,
          description: `${groupedStories.length} stories partagent le tag "${tagName}" (${tagType})`,
          storyIds: groupedStories.map(s => s.id),
          storyCount: groupedStories.length,
          confidence: 0.9, // Haute confiance pour tags Taranis
          correlationType: 'tag',
          created: groupedStories[0].created,
          updated: new Date().toISOString(),
          metadata: {
            sharedTags: [tagKey],
          },
        });
      }
    }

    return correlations;
  }

  /**
   * Corréler stories dans même fenêtre temporelle
   */
  private async correlateByTime(stories: any[]): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    const timeWindow = 24 * 60 * 60 * 1000; // 24 heures

    // Trier par date
    const sortedStories = stories.sort((a, b) => 
      new Date(a.created).getTime() - new Date(b.created).getTime()
    );

    let currentGroup: any[] = [];
    let currentTime = 0;

    for (const story of sortedStories) {
      const storyTime = new Date(story.created).getTime();
      
      if (currentGroup.length === 0) {
        currentGroup = [story];
        currentTime = storyTime;
      } else if (storyTime - currentTime <= timeWindow) {
        currentGroup.push(story);
      } else {
        // Créer corrélation si groupe suffisant
        if (currentGroup.length >= 3) {
          correlations.push({
            id: `corr-time-${currentTime}`,
            title: `Activité groupée (${new Date(currentTime).toLocaleDateString()})`,
            description: `${currentGroup.length} stories dans une fenêtre de 24h`,
            storyIds: currentGroup.map(s => s.id),
            storyCount: currentGroup.length,
            confidence: 0.7,
            correlationType: 'temporal',
            created: currentGroup[0].created,
            updated: new Date().toISOString(),
            metadata: {
              timeWindow: '24h',
            },
          });
        }
        
        // Nouveau groupe
        currentGroup = [story];
        currentTime = storyTime;
      }
    }

    return correlations;
  }

  /**
   * Corréler stories par acteur (même source OSINT)
   */
  private async correlateByActor(stories: any[]): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    const sourceGroups: Record<string, any[]> = {};

    // Grouper par osint_source_id
    for (const story of stories) {
      if (story.osint_source_id) {
        if (!sourceGroups[story.osint_source_id]) {
          sourceGroups[story.osint_source_id] = [];
        }
        sourceGroups[story.osint_source_id].push(story);
      }
    }

    // Créer corrélations pour sources actives
    for (const [sourceId, groupedStories] of Object.entries(sourceGroups)) {
      if (groupedStories.length >= 3) {
        correlations.push({
          id: `corr-actor-${sourceId}`,
          title: `Campagne depuis source ${sourceId}`,
          description: `${groupedStories.length} stories depuis la même source OSINT`,
          storyIds: groupedStories.map(s => s.id),
          storyCount: groupedStories.length,
          confidence: 0.75,
          correlationType: 'actor',
          created: groupedStories[0].created,
          updated: new Date().toISOString(),
          metadata: {
            sharedActors: [sourceId],
          },
        });
      }
    }

    return correlations;
  }

  /**
   * Corréler stories par IOCs partagés
   */
  private async correlateByIOCs(stories: any[]): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    
    // Récupérer les news items pour chaque story et extraire IOCs
    const storyIOCs: Record<string, Set<string>> = {};
    
    for (const story of stories) {
      try {
        // Récupérer les news items de la story avec détails
        const storyDetail = await this.taranisService.getStoryById(story.id, true);
        const iocs = new Set<string>();
        
        if (storyDetail?.news_items) {
          for (const newsItem of storyDetail.news_items) {
            if (newsItem.attributes) {
              for (const attr of newsItem.attributes) {
                if (['ip', 'domain', 'hash', 'url', 'email'].includes(attr.key)) {
                  iocs.add(attr.value);
                }
              }
            }
          }
        }
        
        if (iocs.size > 0) {
          storyIOCs[story.id] = iocs;
        }
      } catch (error) {
        // Continuer si une story échoue
      }
    }

    // Trouver les stories avec IOCs partagés
    const storyIds = Object.keys(storyIOCs);
    for (let i = 0; i < storyIds.length; i++) {
      for (let j = i + 1; j < storyIds.length; j++) {
        const iocs1 = storyIOCs[storyIds[i]];
        const iocs2 = storyIOCs[storyIds[j]];
        
        // Calculer intersection
        const sharedIOCs = Array.from(iocs1).filter(ioc => iocs2.has(ioc));
        
        if (sharedIOCs.length >= 2) {
          const story1 = stories.find(s => s.id === storyIds[i]);
          const story2 = stories.find(s => s.id === storyIds[j]);
          
          correlations.push({
            id: `corr-ioc-${storyIds[i]}-${storyIds[j]}`,
            title: `Corrélation IOC: ${sharedIOCs.length} IOCs partagés`,
            description: `Infrastructure commune détectée entre 2 stories`,
            storyIds: [storyIds[i], storyIds[j]],
            storyCount: 2,
            confidence: 0.85,
            correlationType: 'ioc',
            created: story1?.created || new Date().toISOString(),
            updated: new Date().toISOString(),
            metadata: {
              sharedIOCs: sharedIOCs.slice(0, 10), // Limiter pour la taille
            },
          });
        }
      }
    }

    return correlations;
  }

  /**
   * Corréler stories par sémantique (attributs similaires)
   */
  private async correlateBySemantics(stories: any[]): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    
    // Grouper par attributs communs (hors IOCs)
    const attributeGroups: Record<string, any[]> = {};
    
    for (const story of stories) {
      if (story.attributes && story.attributes.length > 0) {
        for (const attr of story.attributes) {
          // Exclure les IOCs
          if (!['ip', 'domain', 'hash', 'url', 'email'].includes(attr.key)) {
            const attrKey = `${attr.key}:${attr.value}`;
            if (!attributeGroups[attrKey]) {
              attributeGroups[attrKey] = [];
            }
            attributeGroups[attrKey].push(story);
          }
        }
      }
    }

    // Créer corrélations pour groupes significatifs
    for (const [attrKey, groupedStories] of Object.entries(attributeGroups)) {
      if (groupedStories.length >= 2) {
        const [attrType, attrValue] = attrKey.split(':');
        
        correlations.push({
          id: `corr-sem-${attrKey.replace(/[^a-zA-Z0-9]/g, '-')}`,
          title: `Corrélation sémantique: ${attrType}`,
          description: `${groupedStories.length} stories partagent l'attribut "${attrValue}"`,
          storyIds: groupedStories.map(s => s.id),
          storyCount: groupedStories.length,
          confidence: 0.6,
          correlationType: 'semantic',
          created: groupedStories[0].created,
          updated: new Date().toISOString(),
          metadata: {},
        });
      }
    }

    return correlations;
  }

  /**
   * Groupe plusieurs stories manuellement via l'API Taranis
   */
  async groupStories(storyIds: string[], title: string, description: string): Promise<string | null> {
    try {
      console.log(`🔗 Groupement manuel de ${storyIds.length} stories...`);
      
      const response = await this.taranisService.groupStories({
        story_ids: storyIds,
        title,
        description,
      });

      if (response?.id) {
        console.log(`✅ Stories groupées avec succès (ID: ${response.id})`);
        // Invalider le cache pour forcer refresh
        this.invalidateCache();
        return response.id;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lors du groupement:', error);
      return null;
    }
  }

  /**
   * Invalide le cache
   */
  invalidateCache(): void {
    correlationsCache = null;
    console.log('🗑️ Cache corrélations invalidé');
  }

  /**
   * Crée une extraction de fallback
   */
  private createFallbackExtraction(): CorrelationExtraction {
    return {
      correlations: [],
      totalCorrelations: 0,
      byType: {
        temporal: 0,
        semantic: 0,
        actor: 0,
        ioc: 0,
        tag: 0,
        manual: 0,
      },
      extractionMethod: 'fallback',
      lastUpdate: new Date().toISOString(),
    };
  }
}

// ============ SINGLETON EXPORT ============

let correlationMapperInstance: TaranisCorrelationMapperService | null = null;

export function getTaranisCorrelationMapperService(): TaranisCorrelationMapperService {
  if (!correlationMapperInstance) {
    correlationMapperInstance = new TaranisCorrelationMapperService();
  }
  return correlationMapperInstance;
}

export default getTaranisCorrelationMapperService;

