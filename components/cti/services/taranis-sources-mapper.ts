/**
 * Service de Mapping Sources OSINT depuis API Taranis Natif
 * Utilise /api/assess/osint-sources-list et /api/config/osint-sources
 * 
 * MIGRATION: Remplace les sources mockées par les vraies sources avec état/métriques
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisOSINTSource {
  id: string;
  name: string;
  description: string;
  icon: string; // base64
  state: 'COLLECTING' | 'DISABLED' | 'ERROR';
  type: string;
  last_collected?: string;
  last_attempt?: string;
  last_error_message?: string;
  parameters?: Record<string, any>;
}

export interface OSINTSource {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'collecting';
  icon?: string;
  lastCollected?: string;
  lastAttempt?: string;
  lastError?: string;
  collectCount: number;
  errorCount: number;
  health: number; // 0-100
  parameters?: Record<string, any>;
}

export interface SourcesExtraction {
  sources: OSINTSource[];
  totalSources: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  healthScore: number;
  extractionMethod: 'taranis_native' | 'fallback';
  lastUpdate: string;
}

// ============ CACHE ============

interface CachedSources {
  data: SourcesExtraction;
  timestamp: number;
}

let sourcesCache: CachedSources | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes - sources changent souvent

// ============ SERVICE CLASS ============

class TaranisSourcesMapperService {
  private taranisService = getTaranisService();

  /**
   * Extrait les sources OSINT depuis /api/assess/osint-sources-list
   */
  async extractSourcesFromTaranis(): Promise<SourcesExtraction> {
    // Vérifier le cache
    if (sourcesCache && Date.now() - sourcesCache.timestamp < CACHE_DURATION) {
      console.log('📡 Sources OSINT: Utilisation du cache');
      return sourcesCache.data;
    }

    console.log('📡 Extraction sources OSINT depuis Taranis...');

    try {
      // Récupérer les sources depuis l'API assessment (liste publique)
      const sourcesListResponse = await this.taranisService.getOSINTSourcesList();

      if (!sourcesListResponse?.items || sourcesListResponse.items.length === 0) {
        console.warn('⚠️ Aucune source OSINT disponible');
        return this.createFallbackExtraction();
      }

      // Récupérer aussi les détails depuis config si possible
      let detailedSources: any[] = [];
      try {
        const configResponse = await this.taranisService.getOSINTSources();
        detailedSources = configResponse?.items || [];
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer détails sources (permissions?)', error);
      }

      const sources: OSINTSource[] = [];
      const byStatus: Record<string, number> = {
        active: 0,
        inactive: 0,
        error: 0,
        collecting: 0,
      };
      const byType: Record<string, number> = {};
      let totalHealth = 0;

      // Mapper chaque source
      for (const taranisSource of sourcesListResponse.items) {
        // Trouver les détails correspondants si disponibles
        const details = detailedSources.find(d => d.id === taranisSource.id);

        const source = this.mapTaranisSourceToSource(taranisSource, details);
        sources.push(source);

        // Compter par status
        byStatus[source.status]++;

        // Compter par type
        byType[source.type] = (byType[source.type] || 0) + 1;

        // Calculer health total
        totalHealth += source.health;
      }

      const extraction: SourcesExtraction = {
        sources,
        totalSources: sources.length,
        byStatus,
        byType,
        healthScore: sources.length > 0 ? Math.round(totalHealth / sources.length) : 0,
        extractionMethod: 'taranis_native',
        lastUpdate: new Date().toISOString(),
      };

      console.log(`✅ ${extraction.totalSources} sources OSINT extraites`);
      console.log(`📊 Statut: Active=${byStatus.active}, Collecting=${byStatus.collecting}, Error=${byStatus.error}, Inactive=${byStatus.inactive}`);
      console.log(`💚 Health Score: ${extraction.healthScore}%`);

      // Mettre en cache
      sourcesCache = {
        data: extraction,
        timestamp: Date.now(),
      };

      return extraction;

    } catch (error) {
      console.error('❌ Erreur extraction sources:', error);
      return this.createFallbackExtraction();
    }
  }

  /**
   * Obtenir une source spécifique
   */
  async getSourceById(sourceId: string): Promise<OSINTSource | null> {
    try {
      const details = await this.taranisService.getOSINTSourceById(sourceId);
      
      if (!details) {
        return null;
      }

      return this.mapTaranisSourceToSource(details, details);

    } catch (error) {
      console.error(`❌ Erreur récupération source ${sourceId}:`, error);
      return null;
    }
  }

  /**
   * Lancer la collecte pour une source
   */
  async collectSource(sourceId: string): Promise<boolean> {
    try {
      console.log(`🚀 Lancement collecte pour source ${sourceId}...`);
      
      await this.taranisService.collectOSINTSource(sourceId);
      
      console.log(`✅ Collecte lancée pour source ${sourceId}`);
      
      // Invalider le cache pour forcer refresh
      this.invalidateCache();
      
      return true;

    } catch (error) {
      console.error(`❌ Erreur lancement collecte:`, error);
      return false;
    }
  }

  /**
   * Lancer la collecte pour toutes les sources
   */
  async collectAllSources(): Promise<boolean> {
    try {
      console.log('🚀 Lancement collecte pour toutes les sources...');
      
      await this.taranisService.collectAllOSINTSources();
      
      console.log('✅ Collecte lancée pour toutes les sources');
      
      // Invalider le cache
      this.invalidateCache();
      
      return true;

    } catch (error) {
      console.error('❌ Erreur lancement collecte globale:', error);
      return false;
    }
  }

  /**
   * Obtenir les sources par statut
   */
  async getSourcesByStatus(status: OSINTSource['status']): Promise<OSINTSource[]> {
    try {
      const extraction = await this.extractSourcesFromTaranis();
      
      return extraction.sources.filter(s => s.status === status);

    } catch (error) {
      console.error(`❌ Erreur récupération sources par statut ${status}:`, error);
      return [];
    }
  }

  /**
   * Obtenir les sources avec erreurs
   */
  async getSourcesWithErrors(): Promise<Array<OSINTSource & { lastError: string }>> {
    try {
      const extraction = await this.extractSourcesFromTaranis();
      
      return extraction.sources
        .filter(s => s.status === 'error' && s.lastError)
        .map(s => ({ ...s, lastError: s.lastError! }));

    } catch (error) {
      console.error('❌ Erreur récupération sources avec erreurs:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques des sources
   */
  async getSourceStatistics(): Promise<{
    total: number;
    active: number;
    collecting: number;
    errors: number;
    inactive: number;
    healthScore: number;
    byType: Record<string, number>;
    topPerformers: OSINTSource[];
    problematic: OSINTSource[];
  }> {
    try {
      const extraction = await this.extractSourcesFromTaranis();

      // Top performers (health > 80)
      const topPerformers = extraction.sources
        .filter(s => s.health >= 80)
        .sort((a, b) => b.health - a.health)
        .slice(0, 5);

      // Problematic sources (health < 50 ou avec erreurs)
      const problematic = extraction.sources
        .filter(s => s.health < 50 || s.errorCount > 0)
        .sort((a, b) => a.health - b.health)
        .slice(0, 5);

      return {
        total: extraction.totalSources,
        active: extraction.byStatus.active || 0,
        collecting: extraction.byStatus.collecting || 0,
        errors: extraction.byStatus.error || 0,
        inactive: extraction.byStatus.inactive || 0,
        healthScore: extraction.healthScore,
        byType: extraction.byType,
        topPerformers,
        problematic,
      };

    } catch (error) {
      console.error('❌ Erreur statistiques sources:', error);
      return {
        total: 0,
        active: 0,
        collecting: 0,
        errors: 0,
        inactive: 0,
        healthScore: 0,
        byType: {},
        topPerformers: [],
        problematic: [],
      };
    }
  }

  /**
   * Mapper une source Taranis vers notre interface
   */
  private mapTaranisSourceToSource(
    taranisSource: TaranisOSINTSource,
    details?: any
  ): OSINTSource {
    // Mapper le state Taranis vers notre status
    let status: OSINTSource['status'] = 'inactive';
    if (taranisSource.state === 'COLLECTING') {
      status = 'collecting';
    } else if (taranisSource.state === 'DISABLED') {
      status = 'inactive';
    } else if (taranisSource.state === 'ERROR') {
      status = 'error';
    } else {
      // Si pas d'état explicite, vérifier last_collected
      status = taranisSource.last_collected ? 'active' : 'inactive';
    }

    // Calculer health score
    let health = 50; // Par défaut

    if (taranisSource.state === 'COLLECTING') {
      health = 100;
    } else if (taranisSource.state === 'ERROR' || taranisSource.last_error_message) {
      health = 20;
    } else if (taranisSource.last_collected) {
      // Calculer health basé sur la fraîcheur de last_collected
      const lastCollectedDate = new Date(taranisSource.last_collected);
      const hoursSinceCollect = (Date.now() - lastCollectedDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCollect < 1) health = 95;
      else if (hoursSinceCollect < 24) health = 85;
      else if (hoursSinceCollect < 72) health = 70;
      else if (hoursSinceCollect < 168) health = 50;
      else health = 30;
    }

    // Compter erreurs (approximation)
    const errorCount = taranisSource.last_error_message ? 1 : 0;

    // Compter collectes (approximation - on pourrait améliorer avec task_results)
    const collectCount = taranisSource.last_collected ? 1 : 0;

    return {
      id: taranisSource.id,
      name: taranisSource.name,
      description: taranisSource.description || '',
      type: taranisSource.type,
      status,
      icon: taranisSource.icon,
      lastCollected: taranisSource.last_collected,
      lastAttempt: taranisSource.last_attempt,
      lastError: taranisSource.last_error_message,
      collectCount,
      errorCount,
      health,
      parameters: details?.parameters || taranisSource.parameters,
    };
  }

  /**
   * Invalide le cache
   */
  invalidateCache(): void {
    sourcesCache = null;
    console.log('🗑️ Cache sources invalidé');
  }

  /**
   * Crée une extraction de fallback
   */
  private createFallbackExtraction(): SourcesExtraction {
    return {
      sources: [],
      totalSources: 0,
      byStatus: { active: 0, inactive: 0, error: 0, collecting: 0 },
      byType: {},
      healthScore: 0,
      extractionMethod: 'fallback',
      lastUpdate: new Date().toISOString(),
    };
  }
}

// ============ SINGLETON EXPORT ============

let sourcesMapperInstance: TaranisSourcesMapperService | null = null;

export function getTaranisSourcesMapperService(): TaranisSourcesMapperService {
  if (!sourcesMapperInstance) {
    sourcesMapperInstance = new TaranisSourcesMapperService();
  }
  return sourcesMapperInstance;
}

export default getTaranisSourcesMapperService;

