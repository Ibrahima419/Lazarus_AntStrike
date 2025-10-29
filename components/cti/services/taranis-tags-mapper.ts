/**
 * Service de Mapping Tags depuis API Taranis Natif
 * Utilise /api/assess/tags et /api/assess/taglist
 * 
 * MIGRATION: Remplace les tags mockés par la taxonomie native Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisTag {
  name: string;
  tag_type: string;
  size: number;
}

export interface Tag {
  id: string;
  name: string;
  type: string;
  category: string;
  color: string;
  description: string;
  count: number;
  confidence: number;
}

export interface TagsExtraction {
  tags: Tag[];
  totalTags: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  extractionMethod: 'taranis_native' | 'fallback';
  lastUpdate: string;
}

// ============ CACHE ============

interface CachedTags {
  data: TagsExtraction;
  timestamp: number;
}

let tagsCache: CachedTags | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// ============ TAG TYPE MAPPING ============

const TAG_TYPE_CATEGORIES: Record<string, { category: string; color: string; description: string }> = {
  // Threat Actor & Attribution
  'threat_actor': { category: 'Attribution', color: '#ef4444', description: 'Groupe APT ou acteur malveillant' },
  'campaign': { category: 'Attribution', color: '#dc2626', description: 'Campagne d\'attaque identifiée' },
  'malware_family': { category: 'Attribution', color: '#f97316', description: 'Famille de malware' },
  
  // Technical
  'mitre_attack': { category: 'Technical', color: '#8b5cf6', description: 'MITRE ATT&CK technique' },
  'cve': { category: 'Technical', color: '#a855f7', description: 'Vulnérabilité CVE' },
  'tool': { category: 'Technical', color: '#6366f1', description: 'Outil utilisé' },
  
  // Target
  'sector': { category: 'Target', color: '#3b82f6', description: 'Secteur ciblé' },
  'country': { category: 'Target', color: '#0ea5e9', description: 'Pays ciblé' },
  'organization': { category: 'Target', color: '#06b6d4', description: 'Organisation ciblée' },
  
  // Classification
  'tlp': { category: 'Classification', color: '#10b981', description: 'Traffic Light Protocol' },
  'severity': { category: 'Classification', color: '#14b8a6', description: 'Niveau de sévérité' },
  'confidence': { category: 'Classification', color: '#22c55e', description: 'Niveau de confiance' },
  
  // Other
  'general': { category: 'General', color: '#6b7280', description: 'Tag général' },
  'custom': { category: 'Custom', color: '#64748b', description: 'Tag personnalisé' },
};

// ============ SERVICE CLASS ============

class TaranisTagsMapperService {
  private taranisService = getTaranisService();

  /**
   * Extrait les tags depuis /api/assess/tags
   */
  async extractTagsFromTaranis(minSize: number = 1, limit: number = 200): Promise<TagsExtraction> {
    // Vérifier le cache
    if (tagsCache && Date.now() - tagsCache.timestamp < CACHE_DURATION) {
      console.log('🏷️ Tags: Utilisation du cache');
      return tagsCache.data;
    }

    console.log('🏷️ Extraction tags depuis Taranis /api/assess/tags...');

    try {
      // Récupérer les tags depuis Taranis
      const taranisResponse = await this.taranisService.getTags({
        limit,
        min_size: minSize,
      });

      if (!taranisResponse?.items || taranisResponse.items.length === 0) {
        console.warn('⚠️ Aucun tag disponible dans Taranis');
        return this.createFallbackExtraction();
      }

      const tags: Tag[] = [];
      const byType: Record<string, number> = {};
      const byCategory: Record<string, number> = {};

      // Mapper chaque tag Taranis vers notre format
      for (const taranisTag of taranisResponse.items) {
        const tag = this.mapTaranisTagToTag(taranisTag);
        tags.push(tag);

        // Compter par type
        byType[tag.type] = (byType[tag.type] || 0) + 1;

        // Compter par catégorie
        byCategory[tag.category] = (byCategory[tag.category] || 0) + 1;
      }

      const extraction: TagsExtraction = {
        tags,
        totalTags: tags.length,
        byType,
        byCategory,
        extractionMethod: 'taranis_native',
        lastUpdate: new Date().toISOString(),
      };

      console.log(`✅ ${extraction.totalTags} tags extraits`);
      console.log(`📊 Par catégorie: ${Object.entries(byCategory).map(([k, v]) => `${k}=${v}`).join(', ')}`);

      // Mettre en cache
      tagsCache = {
        data: extraction,
        timestamp: Date.now(),
      };

      return extraction;

    } catch (error) {
      console.error('❌ Erreur extraction tags:', error);
      return this.createFallbackExtraction();
    }
  }

  /**
   * Rechercher des tags
   */
  async searchTags(searchTerm: string, limit: number = 50): Promise<Tag[]> {
    try {
      console.log(`🔍 Recherche tags: "${searchTerm}"`);

      const taranisResponse = await this.taranisService.getTags({
        search: searchTerm,
        limit,
        min_size: 0, // Pas de minimum pour la recherche
      });

      if (!taranisResponse?.items) {
        return [];
      }

      const tags = taranisResponse.items.map(t => this.mapTaranisTagToTag(t));
      console.log(`✅ ${tags.length} tags trouvés`);

      return tags;

    } catch (error) {
      console.error('❌ Erreur recherche tags:', error);
      return [];
    }
  }

  /**
   * Obtenir une liste simple de tags (autocomplete)
   */
  async getTagList(searchTerm?: string, limit: number = 50): Promise<string[]> {
    try {
      const response = await this.taranisService.getTagList({
        search: searchTerm,
        limit,
      });

      return response?.items || [];

    } catch (error) {
      console.error('❌ Erreur récupération taglist:', error);
      return [];
    }
  }

  /**
   * Obtenir les tags d'un type spécifique
   */
  async getTagsByType(tagType: string, limit: number = 100): Promise<Tag[]> {
    try {
      // Récupérer tous les tags et filtrer par type
      const extraction = await this.extractTagsFromTaranis(1, 200);
      
      return extraction.tags.filter(tag => tag.type === tagType).slice(0, limit);

    } catch (error) {
      console.error(`❌ Erreur récupération tags par type ${tagType}:`, error);
      return [];
    }
  }

  /**
   * Obtenir les tags les plus populaires
   */
  async getTrendingTags(limit: number = 20): Promise<Tag[]> {
    try {
      const extraction = await this.extractTagsFromTaranis(3, 200); // Min size 3 pour trending
      
      // Trier par count décroissant
      return extraction.tags
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Erreur récupération trending tags:', error);
      return [];
    }
  }

  /**
   * Mapper un tag Taranis vers notre interface Tag
   */
  private mapTaranisTagToTag(taranisTag: TaranisTag): Tag {
    // Déterminer la catégorie et la couleur depuis le type
    const tagTypeInfo = TAG_TYPE_CATEGORIES[taranisTag.tag_type] || TAG_TYPE_CATEGORIES['general'];

    // Calculer la confiance basée sur la taille (popularité)
    let confidence = 0.5;
    if (taranisTag.size >= 50) confidence = 0.95;
    else if (taranisTag.size >= 20) confidence = 0.85;
    else if (taranisTag.size >= 10) confidence = 0.75;
    else if (taranisTag.size >= 5) confidence = 0.65;

    return {
      id: `${taranisTag.tag_type}-${taranisTag.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      name: taranisTag.name,
      type: taranisTag.tag_type,
      category: tagTypeInfo.category,
      color: tagTypeInfo.color,
      description: tagTypeInfo.description,
      count: taranisTag.size,
      confidence,
    };
  }

  /**
   * Obtenir les statistiques des tags
   */
  async getTagStatistics(): Promise<{
    totalTags: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    mostUsed: Tag[];
    recent: Tag[];
  }> {
    try {
      const extraction = await this.extractTagsFromTaranis(1, 200);

      // Tags les plus utilisés (top 10)
      const mostUsed = [...extraction.tags]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Tags récents (simulation - Taranis n'a pas de timestamp sur tags)
      // On utilise les tags avec peu d'utilisation comme proxy
      const recent = [...extraction.tags]
        .filter(t => t.count >= 1 && t.count <= 5)
        .slice(0, 10);

      return {
        totalTags: extraction.totalTags,
        byType: extraction.byType,
        byCategory: extraction.byCategory,
        mostUsed,
        recent,
      };

    } catch (error) {
      console.error('❌ Erreur statistiques tags:', error);
      return {
        totalTags: 0,
        byType: {},
        byCategory: {},
        mostUsed: [],
        recent: [],
      };
    }
  }

  /**
   * Obtenir les tags par catégorie
   */
  async getTagsByCategory(category: string): Promise<Tag[]> {
    try {
      const extraction = await this.extractTagsFromTaranis(1, 200);
      
      return extraction.tags.filter(tag => tag.category === category);

    } catch (error) {
      console.error(`❌ Erreur récupération tags par catégorie ${category}:`, error);
      return [];
    }
  }

  /**
   * Invalide le cache
   */
  invalidateCache(): void {
    tagsCache = null;
    console.log('🗑️ Cache tags invalidé');
  }

  /**
   * Crée une extraction de fallback
   */
  private createFallbackExtraction(): TagsExtraction {
    return {
      tags: [],
      totalTags: 0,
      byType: {},
      byCategory: {},
      extractionMethod: 'fallback',
      lastUpdate: new Date().toISOString(),
    };
  }
}

// ============ SINGLETON EXPORT ============

let tagsMapperInstance: TaranisTagsMapperService | null = null;

export function getTaranisTagsMapperService(): TaranisTagsMapperService {
  if (!tagsMapperInstance) {
    tagsMapperInstance = new TaranisTagsMapperService();
  }
  return tagsMapperInstance;
}

export default getTaranisTagsMapperService;

