import apiClient from '../../lib/api-client';

// Types basés directement sur les réponses backend Taranis
export interface TaranisDashboardSummary {
  stories_count: number;
  news_items_count: number;
  report_items_count: number;
  products_count: number;
}

export interface TrendingCluster {
  name: string;
  size: number;
  score?: number;
  tags?: Array<{ name: string; size: number }>;
}

export interface TaranisStory {
  id: string;
  title: string;
  published: string;
  source: string;
  relevance?: number;
}

export interface TaranisAsset {
  id: number;
  name: string;
  type?: string;
  vulnerable?: boolean;
}

export const taranisDashboardNativeService = {
  async getDashboardRaw() {
    // backend: GET /taranis/dashboard
    const response = await apiClient.get('/taranis/dashboard');
    return response.data;
  },

  async getTrendingClusters(params?: { days?: number; limit?: number }) {
    const response = await apiClient.get('/taranis/dashboard/trending-clusters', { params });
    return response.data as { success: boolean; data: TrendingCluster[] };
  },

  async getStories(params?: { limit?: number; range?: string }) {
    const response = await apiClient.get('/taranis/assess/stories', { params });
    return response.data as { success: boolean; data: TaranisStory[] };
  },

  async getAssets() {
    const response = await apiClient.get('/taranis/assets');
    return response.data as { success: boolean; data: TaranisAsset[] };
  },
};
