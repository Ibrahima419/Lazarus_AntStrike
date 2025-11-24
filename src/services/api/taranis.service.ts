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
  }
};