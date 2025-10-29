/**
 * 🚀 Collection Service - API calls for collection & aggregation
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface CollectionTriggerRequest {
  sources?: string[];
}

export interface CollectionTriggerResponse {
  success: boolean;
  message: string;
  data: {
    duration: string;
    totalItemsCollected: number;
    totalItemsQueued: number;
    successRate: string;
    results: Array<{
      source: string;
      status: 'success' | 'error' | 'partial';
      itemsCollected: number;
      itemsQueued: number;
      errors: string[];
      duration: number;
    }>;
  };
}

export interface QueueStatusResponse {
  success: boolean;
  data: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  };
}

export interface CollectionStatsResponse {
  success: boolean;
  data: {
    totalItems: number;
    itemsLast24h: number;
    itemsLast7d: number;
    itemsLast30d: number;
    sourcesCount: number;
    successRate: number;
    avgDuration: number;
    lastCollection: string;
    nextScheduled: string;
  };
}

export interface CollectionHealthResponse {
  success: boolean;
  data: {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    sources: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
      lastCheck: string;
      responseTime: number;
      message: string;
      configStatus: 'configured' | 'not_configured' | 'error';
    }>;
  };
}

export interface CollectionHistoryResponse {
  success: boolean;
  data: Array<{
    id: string;
    timestamp: string;
    source: string;
    status: 'success' | 'error' | 'partial';
    itemsCollected: number;
    duration: number;
    errors: string[];
  }>;
}

export const collectionService = {
  /**
   * 🚀 Trigger collection for specific sources or all
   */
  async triggerCollection(request?: CollectionTriggerRequest): Promise<CollectionTriggerResponse> {
    const response = await apiClient.post<CollectionTriggerResponse>('/collection/trigger', request || {});
    return response.data;
  },

  /**
   * 📊 Get queue status (BullMQ)
   */
  async getQueueStatus(): Promise<QueueStatusResponse> {
    const response = await apiClient.get<QueueStatusResponse>('/collection/queue/status');
    return response.data;
  },

  /**
   * 📈 Get collection statistics
   */
  async getStats(): Promise<CollectionStatsResponse> {
    const response = await apiClient.get<CollectionStatsResponse>('/collection/stats');
    return response.data;
  },

  /**
   * 🏥 Get collection health status
   */
  async getHealth(): Promise<CollectionHealthResponse> {
    const response = await apiClient.get<CollectionHealthResponse>('/collection/health');
    return response.data;
  },

  /**
   * 📜 Get collection history
   */
  async getHistory(limit = 20): Promise<CollectionHistoryResponse> {
    const response = await apiClient.get<CollectionHistoryResponse>('/collection/history', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * 🔄 Get collection logs
   */
  async getLogs(source?: string, limit = 50): Promise<any> {
    const response = await apiClient.get('/collection/logs', {
      params: { source, limit }
    });
    return response.data;
  },

  /**
   * ⚙️ Get collection configuration
   */
  async getConfig(): Promise<any> {
    const response = await apiClient.get('/collection/config');
    return response.data;
  },

  /**
   * ⚙️ Update collection configuration
   */
  async updateConfig(config: any): Promise<any> {
    const response = await apiClient.put('/collection/config', config);
    return response.data;
  }
};
