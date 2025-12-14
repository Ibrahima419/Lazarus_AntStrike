/**
 * 🌐 TARANIS Frontend Service
 * Service pour les appels API Taranis depuis le frontend
 */

import apiClient from '../../lib/api-client';

export interface OSINTSourceGroup {
  id: string;
  name: string;
  description?: string;
  default: boolean;
  osint_sources: string[];
  word_lists: any[];
}

export interface OSINTSource {
  id: string;
  name: string;
  description?: string;
  type: string;
  parameters?: any;
  enabled: boolean;
  status?: {
    id: string;
    last_run?: string;
    last_success?: string;
    result?: string;
    status?: string;
    task?: string;
  };
}

export interface CollectionResult {
  sourceId: string;
  sourceName: string;
  collected: number;
  errors: number;
  duration: number;
  timestamp: string;
}

export const taranisService = {
  // ========================================
  // OSINT Source Groups
  // ========================================

  async getSourceGroups(): Promise<{ data: { items: OSINTSourceGroup[]; total_count: number } }> {
    const response = await apiClient.get('/taranis/config/osint-source-groups');
    return response.data;
  },

  async createSourceGroup(data: {
    name: string;
    description?: string;
    osint_sources?: string[];
    word_lists?: any[];
  }): Promise<{ data: OSINTSourceGroup }> {
    const response = await apiClient.post('/taranis/config/osint-source-groups', data);
    return response.data;
  },

  async updateSourceGroup(groupId: string, data: Partial<{
    name: string;
    description?: string;
    osint_sources?: string[];
    word_lists?: any[];
  }>): Promise<{ data: OSINTSourceGroup }> {
    const response = await apiClient.put(`/taranis/config/osint-source-groups/${groupId}`, data);
    return response.data;
  },

  async deleteSourceGroup(groupId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/taranis/config/osint-source-groups/${groupId}`);
    return response.data;
  },

  // ========================================
  // OSINT Sources
  // ========================================

  async getSources(params?: {
    search?: string;
    group_id?: string;
    enabled?: boolean;
    type?: string;
  }): Promise<{ data: { items: OSINTSource[]; total_count: number } }> {
    const response = await apiClient.get('/taranis/config/osint-sources', { params });
    return response.data;
  },

  async createSource(data: {
    name: string;
    description?: string;
    type: string;
    parameters?: any;
  }): Promise<{ data: OSINTSource }> {
    const response = await apiClient.post('/taranis/config/osint-sources', data);
    return response.data;
  },

  async updateSource(sourceId: string, data: Partial<{
    name: string;
    description?: string;
    type: string;
    parameters?: any;
  }>): Promise<{ data: OSINTSource }> {
    const response = await apiClient.put(`/taranis/config/osint-sources/${sourceId}`, data);
    return response.data;
  },

  async deleteSource(sourceId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/taranis/config/osint-sources/${sourceId}`);
    return response.data;
  },

  async toggleSource(sourceId: string, enabled: boolean): Promise<{ data: OSINTSource }> {
    const response = await apiClient.patch(`/taranis/config/osint-sources/${sourceId}`, {
      state: enabled ? 'enabled' : 'disabled'
    });
    return response.data;
  },

  async collectSource(sourceId: string): Promise<{ data: CollectionResult }> {
    const response = await apiClient.post(`/taranis/config/osint-sources/${sourceId}/collect`);
    return response.data;
  },

  async collectAllSources(): Promise<{
    data: {
      results: CollectionResult[];
      summary: {
        sourcesProcessed: number;
        totalCollected: number;
        totalErrors: number;
      };
    };
    message: string;
  }> {
    const response = await apiClient.post('/taranis/config/osint-sources/collect');
    return response.data;
  },

  // ========================================
  // Parameters
  // ========================================

  async getParameters(): Promise<{ data: any }> {
    const response = await apiClient.get('/taranis/config/parameters');
    return response.data;
  },

  // ========================================
  // Tags
  // ========================================

  async getTags(params?: {
    search?: string;
    limit?: number;
    offset?: number;
    min_size?: number;
  }): Promise<{ success: boolean; data: { items: any[]; total_count: number } }> {
    const response = await apiClient.get('/taranis/assess/tags', { params });
    return response.data;
  },

  // ========================================
  // 5. ANALYZE - REPORT ITEMS
  // ========================================

  // --- Reporting & Collaboration (New Endpoints) ---

  async getReportItems(params?: {
    search?: string;
    completed?: boolean;
    offset?: number;
    limit?: number;
  }): Promise<{ data: any[] }> {
    const response = await apiClient.get('/taranis/analyze/report-items', { params });
    return response.data;
  },

  async getReportItem(id: string): Promise<{ data: any }> {
    const response = await apiClient.get(`/taranis/analyze/report-items/${id}`);
    return response.data;
  },

  async createReportItem(data: { title: string; report_item_type_id: number }): Promise<{ data: any }> {
    const response = await apiClient.post('/taranis/analyze/report-items', data);
    return response.data;
  },

  async updateReportItem(id: string, data: any): Promise<{ data: any }> {
    const response = await apiClient.put(`/taranis/analyze/report-items/${id}`, data);
    return response.data;
  },

  async deleteReportItem(id: string): Promise<{ data: any }> {
    const response = await apiClient.delete(`/taranis/analyze/report-items/${id}`);
    return response.data;
  },

  async getReportTypes(): Promise<{ data: any[] }> {
    const response = await apiClient.get('/taranis/analyze/report-types');
    return response.data;
  },

  // --- Locks ---
  async lockReportItem(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.put(`/taranis/analyze/report-items/${id}/lock`);
    return response.data;
  },

  async unlockReportItem(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/taranis/analyze/report-items/${id}/lock`);
    return response.data;
  },

  async getReportItemLock(id: string): Promise<{ data: any }> {
    const response = await apiClient.get(`/taranis/analyze/report-items/${id}/locks`);
    return response.data;
  },

  // --- Stories / Evidence ---

  async getStories(params?: any): Promise<{ data: any[] }> {
    const response = await apiClient.get('/taranis/assess/stories', { params });
    return response.data;
  },

  async addReportItemStories(itemId: string, storyIds: string[]): Promise<{ data: any }> {
    const response = await apiClient.post(`/taranis/analyze/report-items/${itemId}/stories`, storyIds);
    return response.data;
  },

  async getNewsItems(params?: any): Promise<{ data: any[] }> {
    const response = await apiClient.get('/taranis/assess/news-items', { params });
    return response.data;
  },

  async groupStories(newsItemIds: string[]): Promise<{ data: any }> {
    const response = await apiClient.put('/taranis/assess/stories/group', newsItemIds);
    return response.data;
  },

  async ungroupStories(newsItemIds: string[]): Promise<{ data: any }> {
    const response = await apiClient.put('/taranis/assess/stories/ungroup', newsItemIds);
    return response.data;
  },

  async addNewsItem(data: any): Promise<{ data: any }> {
    const response = await apiClient.post('/taranis/assess/news-items', data);
    return response.data;
  },

  async updateNewsItem(id: string, data: any): Promise<{ data: any }> {
    const response = await apiClient.put(`/taranis/assess/news-items/${id}`, data);
    return response.data;
  },

  async deleteNewsItem(id: string): Promise<{ data: any }> {
    const response = await apiClient.delete(`/taranis/assess/news-items/${id}`);
    return response.data;
  },

  async updateStory(id: string, data: any): Promise<{ data: any }> {
    const response = await apiClient.put(`/taranis/assess/story/${id}`, data);
    return response.data;
  },

  async deleteStory(id: string): Promise<{ data: any }> {
    const response = await apiClient.delete(`/taranis/assess/story/${id}`);
    return response.data;
  },

  async updateReportItemAttributes(id: string, data: any): Promise<{ data: any }> {
    const response = await apiClient.patch(`/taranis/analyze/report-items/${id}/attributes`, data);
    return response.data;
  },

  // ========================================
  // 8. ASSETS
  // ========================================

  async getAssets(params?: {
    search?: string;
    type?: string;
    group_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any }> {
    const response = await apiClient.get('/taranis/assets', { params });
    return response.data;
  },

  async getAsset(id: number | string): Promise<{ data: any }> {
    const response = await apiClient.get(`/taranis/assets/${id}`);
    return response.data;
  },

  async createAsset(data: {
    title: string;
    description?: string;
    type: string;
    organization_id?: number;
  }): Promise<{ data: any }> {
    const response = await apiClient.post('/taranis/assets', data);
    return response.data;
  },

  async updateAsset(id: number | string, data: any): Promise<{ data: any }> {
    const response = await apiClient.put(`/taranis/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: number | string): Promise<{ data: any }> {
    const response = await apiClient.delete(`/taranis/assets/${id}`);
    return response.data;
  },

  // ========================================
  // 6. PUBLISH - PRODUCTS
  // ========================================

  async getProducts(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[] }> {
    const response = await apiClient.get('/taranis/publish/products', { params });
    return response.data;
  },

  async createProduct(data: {
    title: string;
    product_type_id: number;
    report_items: string[];
  }): Promise<{ data: any }> {
    const response = await apiClient.post('/taranis/publish/products', data);
    return response.data;
  },

  async publishProduct(id: string, publisherId: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.post(`/taranis/publish/products/${id}/publishers/${publisherId}`);
    return response.data;
  },

  async renderProduct(id: string): Promise<{ data: any }> {
    const response = await apiClient.post(`/taranis/publish/products/${id}/render`);
    return response.data;
  },

  async getProductRender(id: string): Promise<{ data: any }> {
    const response = await apiClient.get(`/taranis/publish/products/${id}/render`);
    return response.data;
  }
};