/**
 * 📊 DASHBOARD SOC SERVICE
 * Service pour les APIs du dashboard SOC ultime
 * Alimenté par les données Taranis via notre backend
 */

import apiClient from '../../lib/api-client';
import { TrendingClustersResponse } from '../../types/taranis.types';


export interface DashboardMetrics {
  total_news_items: number;
  total_story_items: number;
  total_products: number;
  report_items_completed: number;
  report_items_in_progress: number;
  latest_collected: string;
  worker_status: {
    bot_task: { success_pct: number; successes: number; failures: number };
    collector_task: { success_pct: number; successes: number; failures: number };
    presenter_task: { success_pct: number; successes: number; failures: number };
  };
}

export interface Story {
  id: string;
  title: string;
  content: string;
  published: string;
  source: string;
  tags: string[];
  relevance: number;
  news_items: Array<{
    content: string;
    published: string;
    source: string;
  }>;
}

export interface Asset {
  id: number;
  name: string;
  description?: string;
  type?: string;
  asset_group_id?: string;
  vulnerabilities?: Array<{
    id: string;
    severity: string;
    cvss_score?: number;
  }>;
}

export interface AssetGroup {
  id: string;
  name: string;
  description?: string;
  assets?: Asset[];
}

export interface ThreatCluster {
  name: string;
  size: number;
  tags: Array<{ name: string; size: number }>;
}

export interface LocationThreat {
  location: string;
  threats: number;
  intensity: 'high' | 'medium' | 'low';
}

export interface ProductVulnerability {
  product: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TimelineData {
  date: string;
  threats: number;
  relevance: number;
  sources: number;
}

export interface DashboardAnalytics {
  locationThreats: LocationThreat[];
  productVulnerabilities: ProductVulnerability[];
  timelineData: TimelineData[];
  topSources: Record<string, number>;
}

export const dashboardService = {
  /**
   * Récupérer les métriques du dashboard
   */
  async getDashboardMetrics(): Promise<{ data: DashboardMetrics }> {
    const response = await apiClient.get('/taranis/dashboard');
    return { data: response.data.data.items[0] };
  },

  /**
   * Récupérer les stories pour le dashboard
   */
  async getStories(limit: number = 100): Promise<{ data: { items: Story[] } }> {
    const response = await apiClient.get('/taranis/assess/stories', {
      params: { limit }
    });
    return { data: { items: response.data.data || [] } };
  },

  /**
   * Récupérer les assets pour le dashboard
   */
  async getAssets(): Promise<{ data: { items: Asset[] } }> {
    const response = await apiClient.get('/taranis/assets');
    return { data: { items: response.data.data || [] } };
  },

  /**
   * Récupérer les groupes d'assets
   */
  async getAssetGroups(): Promise<{ data: { items: AssetGroup[] } }> {
    const response = await apiClient.get('/taranis/asset-groups');
    return { data: { items: response.data.data || [] } };
  },

  /**
   * Récupérer les trending clusters (tags) depuis Taranis
   */
  async getTrendingClusters(params?: { days?: number; legacy?: boolean }): Promise<TrendingClustersResponse> {
    const response = await apiClient.get('/taranis/dashboard/trending-clusters', { params });
    return response.data;
  },




  /**
   * Récupérer les données pour le dashboard analyste (stats + trending tags)
   */
  async getAnalystDashboardData(): Promise<{ stats: any; trendingTags: any }> {
    const response = await apiClient.get('/dashboard/analyst');
    return response.data;
  },

  /**
   * Calculer les analyses avancées pour le dashboard
   */
  calculateAnalytics(stories: Story[], assets: Asset[]): DashboardAnalytics {
    // Extraction des locations depuis le contenu des stories
    const locationRegex = /\b(France|Germany|USA|China|Russia|UK|Japan|Canada|Australia|Brazil|India|Italy|Spain|Netherlands|Belgium|Switzerland|Sweden|Austria|Poland|Portugal|Ireland|Denmark|Finland|Norway|Czech|Hungary|Slovakia|Slovenia|Croatia|Bulgaria|Romania|Greece|Turkey|Israel|Saudi|UAE|Egypt|South Africa|Mexico|Argentina|Chile|Colombia|Peru|Venezuela|Ecuador|Uruguay|Paraguay|Bolivia|Panama|Cuba|Jamaica|Haiti|Dominican|Costa Rica|Nicaragua|Honduras|El Salvador|Guatemala|Belize|Barbados|Trinidad|Tobago|Guyana|Suriname|French Guiana|Algeria|Morocco|Tunisia|Libya|Egypt|Sudan|Chad|Niger|Mali|Burkina Faso|Ghana|Cote d'Ivoire|Liberia|Sierra Leone|Guinea|Guinea-Bissau|Senegal|Gambia|Cape Verde|Mauritania|Western Sahara)\b/gi;

    const locationThreats = stories.reduce((acc, story) => {
      const locations = story.content.match(locationRegex) || [];
      locations.forEach(location => {
        const key = location.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Analyse des produits affectés
    const productVulnerabilities = assets.reduce((acc, asset) => {
      if (asset.vulnerabilities) {
        asset.vulnerabilities.forEach(vuln => {
          const productType = asset.type || 'Unknown';
          if (!acc[productType]) {
            acc[productType] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
          }
          acc[productType].total++;
          const severity = vuln.severity?.toLowerCase() || 'unknown';
          if (acc[productType][severity as keyof typeof acc[typeof productType]] !== undefined) {
            acc[productType][severity as keyof typeof acc[typeof productType]]++;
          }
        });
      }
      return acc;
    }, {} as Record<string, any>);

    // Timeline des menaces
    const timelineData = stories
      .sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime())
      .map(story => ({
        date: new Date(story.published).toLocaleDateString(),
        threats: 1,
        relevance: story.relevance,
        sources: story.news_items?.length || 1
      }))
      .reduce((acc, item) => {
        const existing = acc.find(x => x.date === item.date);
        if (existing) {
          existing.threats += item.threats;
          existing.relevance = Math.max(existing.relevance, item.relevance);
          existing.sources += item.sources;
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as any[]);

    // Top sources
    const topSources = stories.reduce((acc, story) => {
      const source = story.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      locationThreats: Object.entries(locationThreats).map(([location, count]) => ({
        location: location.charAt(0).toUpperCase() + location.slice(1),
        threats: count,
        intensity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
      })),
      productVulnerabilities: Object.entries(productVulnerabilities).map(([product, data]) => ({
        product,
        ...data
      })),
      timelineData,
      topSources
    };
  }
};