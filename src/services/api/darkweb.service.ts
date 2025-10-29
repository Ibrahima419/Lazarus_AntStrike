/**
 * 🌑 Dark Web Service - API calls for dark web monitoring
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface DarkWebMention {
  id: string;
  source: 'pastebin' | 'github' | 'tor' | 'telegram';
  title: string;
  content: string;
  url: string;
  author?: string;
  published: string;
  discovered: string;
  keywords: string[];
  relevance: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  iocs: Array<{
    type: 'ip' | 'domain' | 'email' | 'hash' | 'url';
    value: string;
    confidence: number;
  }>;
}

export interface DarkWebMentionsResponse {
  success: boolean;
  data: {
    mentions: DarkWebMention[];
    total_count: number;
    page: number;
    pageSize: number;
    sources: Array<{
      source: string;
      count: number;
    }>;
  };
}

export interface DarkWebConfig {
  pastebin: {
    enabled: boolean;
    keywords: string[];
    monitoringInterval: number;
  };
  github: {
    enabled: boolean;
    keywords: string[];
    repositories: string[];
    monitoringInterval: number;
  };
  tor: {
    enabled: boolean;
    keywords: string[];
    monitoringInterval: number;
  };
  telegram: {
    enabled: boolean;
    keywords: string[];
    channels: string[];
    monitoringInterval: number;
  };
}

export interface DarkWebConfigureResponse {
  success: boolean;
  message: string;
  data: {
    config: DarkWebConfig;
    testResults: Array<{
      source: string;
      status: 'success' | 'error';
      message: string;
    }>;
  };
}

export interface DarkWebScanRequest {
  query: string;
  sources?: string[];
  maxResults?: number;
  timeRange?: '1h' | '24h' | '7d' | '30d';
}

export interface DarkWebScanResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    results: DarkWebMention[];
    totalFound: number;
    sourcesScanned: string[];
    duration: number;
    iocsExtracted: number;
  };
}

export interface DarkWebStatsResponse {
  success: boolean;
  data: {
    totalMentions: number;
    mentionsLast24h: number;
    mentionsLast7d: number;
    mentionsLast30d: number;
    mentionsBySource: Array<{
      source: string;
      count: number;
    }>;
    mentionsByThreatLevel: Array<{
      level: string;
      count: number;
    }>;
    iocsExtracted: number;
    iocsByType: Array<{
      type: string;
      count: number;
    }>;
    lastScan: string;
    nextScan: string;
    monitoringStatus: 'active' | 'paused' | 'error';
  };
}

export const darkwebService = {
  /**
   * 📋 Get dark web mentions
   */
  async getMentions(filters?: {
    limit?: number;
    offset?: number;
    source?: string;
    threatLevel?: string;
    keywords?: string[];
    publishedAfter?: string;
    publishedBefore?: string;
  }): Promise<DarkWebMentionsResponse> {
    const response = await apiClient.get<DarkWebMentionsResponse>('/darkweb/mentions', {
      params: filters
    });
    return response.data;
  },

  /**
   * ⚙️ Configure dark web monitoring
   */
  async configure(config: DarkWebConfig): Promise<DarkWebConfigureResponse> {
    const response = await apiClient.post<DarkWebConfigureResponse>('/darkweb/configure', config);
    return response.data;
  },

  /**
   * 🔍 Scan dark web for specific query
   */
  async scan(request: DarkWebScanRequest): Promise<DarkWebScanResponse> {
    const response = await apiClient.post<DarkWebScanResponse>('/darkweb/scan', request);
    return response.data;
  },

  /**
   * 📊 Get dark web statistics
   */
  async getStats(): Promise<DarkWebStatsResponse> {
    const response = await apiClient.get<DarkWebStatsResponse>('/darkweb/stats');
    return response.data;
  },

  /**
   * 📄 Get specific mention details
   */
  async getMention(mentionId: string): Promise<{ success: boolean; data: DarkWebMention }> {
    const response = await apiClient.get(`/darkweb/mentions/${mentionId}`);
    return response.data;
  },

  /**
   * 🔍 Search mentions
   */
  async searchMentions(query: string, filters?: any): Promise<any> {
    const response = await apiClient.get('/darkweb/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * ⚙️ Get configuration
   */
  async getConfig(): Promise<{ success: boolean; data: DarkWebConfig }> {
    const response = await apiClient.get('/darkweb/config');
    return response.data;
  },

  /**
   * 🔄 Trigger manual scan
   */
  async triggerScan(sources?: string[]): Promise<any> {
    const response = await apiClient.post('/darkweb/scan/trigger', {
      sources
    });
    return response.data;
  },

  /**
   * ⏸️ Pause/Resume monitoring
   */
  async toggleMonitoring(enabled: boolean): Promise<any> {
    const response = await apiClient.put('/darkweb/monitoring', { enabled });
    return response.data;
  },

  /**
   * 🏷️ Get available keywords
   */
  async getKeywords(): Promise<any> {
    const response = await apiClient.get('/darkweb/keywords');
    return response.data;
  },

  /**
   * 📈 Get mention trends
   */
  async getTrends(period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    const response = await apiClient.get('/darkweb/trends', {
      params: { period }
    });
    return response.data;
  }
};
