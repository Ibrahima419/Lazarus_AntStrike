/**
 * Service de Mapping Dashboard Statistics depuis API Taranis Natif
 * Utilise /api/dashboard pour métriques réelles au lieu de calculs mockés
 * 
 * MIGRATION: Utilise /api/dashboard endpoint natif Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisDashboardResponse {
  total_assess_items: number;
  total_analyze_items: number;
  total_products: number;
  user_count: number;
  organization_count: number;
  role_count: number;
  acl_entry_count: number;
  word_list_count: number;
  product_type_count: number;
  report_item_type_count: number;
  attribute_enums_count: number;
  analyze_in_progress: number;
  analyze_completed: number;
  analyze_failed: number;
  publish_in_progress: number;
  publish_completed: number;
  publish_failed: number;
}

export interface CTIDashboardStats {
  // Métriques de base
  totalIncidents: number;
  totalThreats: number;
  totalIOCs: number;
  totalCampaigns: number;
  
  // Analyse
  activeInvestigations: number;
  pendingAnalysis: number;
  completedAnalysis: number;
  
  // Rapports & Publications
  reportsGenerated: number;
  productsPublished: number;
  
  // Système
  userCount: number;
  organizationCount: number;
  
  // Statuts
  analyzeStatus: {
    inProgress: number;
    completed: number;
    failed: number;
  };
  publishStatus: {
    inProgress: number;
    completed: number;
    failed: number;
  };
  
  // Métadonnées
  lastUpdate: string;
  extractionMethod: 'taranis_dashboard' | 'fallback';
}

export interface TrendingCluster {
  tag_type: string;
  clusters: Array<{
    tag_name: string;
    size: number;
    stories: any[];
  }>;
}

export interface StoryCluster {
  id: string;
  title: string;
  size: number;
  created: string;
  updated: string;
  relevance: number;
}

// ============ CACHE ============

interface CachedDashboardStats {
  data: CTIDashboardStats;
  timestamp: number;
}

let dashboardStatsCache: CachedDashboardStats | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes - dashboard se rafraîchit souvent

// ============ SERVICE CLASS ============

class TaranisDashboardMapperService {
  private taranisService = getTaranisService();

  /**
   * Extrait les statistiques dashboard depuis Taranis
   */
  async extractDashboardStats(): Promise<CTIDashboardStats> {
    // Vérifier le cache
    if (dashboardStatsCache && Date.now() - dashboardStatsCache.timestamp < CACHE_DURATION) {
      console.log('📊 Dashboard Stats: Utilisation du cache');
      return dashboardStatsCache.data;
    }

    console.log('📊 Dashboard Stats: Extraction depuis Taranis /api/dashboard...');

    try {
      // Récupérer les données dashboard natif
      const dashboardData = await this.taranisService.getDashboard();
      
      if (!dashboardData) {
        console.warn('⚠️ Aucune donnée dashboard Taranis disponible');
        return this.createFallbackStats();
      }

      // Récupérer aussi les trending clusters pour des stats enrichies
      let trendingClusters: TrendingCluster[] = [];
      let storyClusters: StoryCluster[] = [];
      
      try {
        trendingClusters = await this.taranisService.getTrendingClusters();
        storyClusters = await this.taranisService.getStoryClusters();
      } catch (error) {
        console.warn('⚠️ Clusters non disponibles, stats de base uniquement', error);
      }

      // Mapper vers notre format
      const stats: CTIDashboardStats = {
        // Métriques de base depuis dashboard
        totalIncidents: dashboardData.total_assess_items || 0,
        totalThreats: trendingClusters.reduce((sum, tc) => sum + tc.clusters.length, 0),
        totalIOCs: 0, // Sera enrichi par le comptage des attributs
        totalCampaigns: storyClusters.length || 0,
        
        // Analyse
        activeInvestigations: dashboardData.analyze_in_progress || 0,
        pendingAnalysis: dashboardData.total_assess_items - (dashboardData.analyze_completed + dashboardData.analyze_failed + dashboardData.analyze_in_progress) || 0,
        completedAnalysis: dashboardData.analyze_completed || 0,
        
        // Rapports & Publications
        reportsGenerated: dashboardData.total_analyze_items || 0,
        productsPublished: dashboardData.total_products || 0,
        
        // Système
        userCount: dashboardData.user_count || 0,
        organizationCount: dashboardData.organization_count || 0,
        
        // Statuts détaillés
        analyzeStatus: {
          inProgress: dashboardData.analyze_in_progress || 0,
          completed: dashboardData.analyze_completed || 0,
          failed: dashboardData.analyze_failed || 0,
        },
        publishStatus: {
          inProgress: dashboardData.publish_in_progress || 0,
          completed: dashboardData.publish_completed || 0,
          failed: dashboardData.publish_failed || 0,
        },
        
        // Métadonnées
        lastUpdate: new Date().toISOString(),
        extractionMethod: 'taranis_dashboard',
      };

      // Enrichir le comptage d'IOCs avec les news items récents
      try {
        const recentNews = await this.taranisService.getNewsItems({ limit: 500 });
        if (recentNews?.items) {
          const iocCount = recentNews.items.reduce((sum, item) => {
            return sum + (item.attributes?.filter(attr => 
              ['ip', 'domain', 'hash', 'url', 'email', 'cve'].includes(attr.key)
            ).length || 0);
          }, 0);
          stats.totalIOCs = iocCount;
        }
      } catch (error) {
        console.warn('⚠️ Comptage IOCs non disponible', error);
      }

      console.log(`✅ Dashboard Stats extraites: ${stats.totalIncidents} incidents, ${stats.totalThreats} threats, ${stats.totalIOCs} IOCs`);

      // Mettre en cache
      dashboardStatsCache = {
        data: stats,
        timestamp: Date.now(),
      };

      return stats;
      
    } catch (error) {
      console.error('❌ Erreur extraction dashboard stats:', error);
      return this.createFallbackStats();
    }
  }

  /**
   * Obtient des statistiques en temps réel spécifiques
   */
  async getSpecificMetric(metric: keyof CTIDashboardStats): Promise<number> {
    const stats = await this.extractDashboardStats();
    const value = stats[metric];
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Obtient les tendances sur une période
   */
  async getDashboardTrends(days: number = 7): Promise<{
    incidentsTrend: Array<{ date: string; count: number }>;
    threatsTrend: Array<{ date: string; count: number }>;
    iocsTrend: Array<{ date: string; count: number }>;
  }> {
    console.log(`📈 Extraction tendances dashboard sur ${days} jours...`);

    try {
      // Récupérer les news items avec pagination pour calculer les tendances
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const newsItems = await this.taranisService.getNewsItems({
        limit: 1000,
        search: `collected:>${startDate.toISOString().split('T')[0]}`
      });

      // Grouper par date
      const incidentsByDate: Record<string, number> = {};
      const iocsByDate: Record<string, number> = {};

      newsItems?.items?.forEach(item => {
        const date = item.collected?.split('T')[0] || '';
        if (date) {
          incidentsByDate[date] = (incidentsByDate[date] || 0) + 1;
          
          const iocCount = item.attributes?.filter(attr =>
            ['ip', 'domain', 'hash', 'url', 'email'].includes(attr.key)
          ).length || 0;
          iocsByDate[date] = (iocsByDate[date] || 0) + iocCount;
        }
      });

      // Récupérer les trending clusters pour les threats
      const trendingClusters = await this.taranisService.getTrendingClusters();
      const threatsByDate: Record<string, number> = {};
      
      trendingClusters?.forEach(tc => {
        tc.clusters?.forEach(cluster => {
          cluster.stories?.forEach(story => {
            const date = story.created?.split('T')[0] || '';
            if (date) {
              threatsByDate[date] = (threatsByDate[date] || 0) + 1;
            }
          });
        });
      });

      // Convertir en format de sortie
      const incidentsTrend = Object.entries(incidentsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const threatsTrend = Object.entries(threatsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const iocsTrend = Object.entries(iocsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      console.log(`✅ Tendances extraites: ${incidentsTrend.length} jours de données`);

      return { incidentsTrend, threatsTrend, iocsTrend };

    } catch (error) {
      console.error('❌ Erreur extraction tendances:', error);
      return {
        incidentsTrend: [],
        threatsTrend: [],
        iocsTrend: [],
      };
    }
  }

  /**
   * Invalide le cache (forcer rafraîchissement)
   */
  invalidateCache(): void {
    dashboardStatsCache = null;
    console.log('🗑️ Cache dashboard stats invalidé');
  }

  /**
   * Crée des stats de fallback en cas d'erreur
   */
  private createFallbackStats(): CTIDashboardStats {
    return {
      totalIncidents: 0,
      totalThreats: 0,
      totalIOCs: 0,
      totalCampaigns: 0,
      activeInvestigations: 0,
      pendingAnalysis: 0,
      completedAnalysis: 0,
      reportsGenerated: 0,
      productsPublished: 0,
      userCount: 0,
      organizationCount: 0,
      analyzeStatus: { inProgress: 0, completed: 0, failed: 0 },
      publishStatus: { inProgress: 0, completed: 0, failed: 0 },
      lastUpdate: new Date().toISOString(),
      extractionMethod: 'fallback',
    };
  }
}

// ============ SINGLETON EXPORT ============

let dashboardMapperInstance: TaranisDashboardMapperService | null = null;

export function getTaranisDashboardMapperService(): TaranisDashboardMapperService {
  if (!dashboardMapperInstance) {
    dashboardMapperInstance = new TaranisDashboardMapperService();
  }
  return dashboardMapperInstance;
}

export default getTaranisDashboardMapperService;

