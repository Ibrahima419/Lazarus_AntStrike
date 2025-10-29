/**
 * 🔗 MISP Service - API calls for MISP bidirectional sync
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface MISPConfig {
  url: string;
  apiKey: string;
  sslVerify: boolean;
  autoSync: boolean;
  syncInterval: number;
  eventFilters?: {
    published?: boolean;
    tags?: string[];
    org?: string[];
  };
}

export interface MISPConfigureResponse {
  success: boolean;
  message: string;
  data: {
    config: MISPConfig;
    testResult: {
      connected: boolean;
      responseTime: number;
      message: string;
    };
  };
}

export interface MISPTestResponse {
  success: boolean;
  data: {
    connected: boolean;
    responseTime: number;
    message: string;
    serverInfo?: {
      version: string;
      orgName: string;
      userCount: number;
      eventCount: number;
    };
  };
}

export interface MISPEvent {
  id: string;
  info: string;
  threat_level_id: string;
  analysis: string;
  date: string;
  published: boolean;
  orgc: {
    name: string;
  };
  Attribute: Array<{
    id: string;
    type: string;
    value: string;
    category: string;
    to_ids: boolean;
  }>;
  Tag: Array<{
    id: string;
    name: string;
    colour: string;
  }>;
}

export interface MISPEventsResponse {
  success: boolean;
  data: {
    events: MISPEvent[];
    total_count: number;
    page: number;
    pageSize: number;
  };
}

export interface MISPSyncResponse {
  success: boolean;
  message: string;
  data: {
    eventsProcessed: number;
    iocsImported: number;
    iocsUpdated: number;
    iocsFailed: number;
    errors: string[];
    duration: number;
  };
}

export interface MISPStatsResponse {
  success: boolean;
  data: {
    totalEvents: number;
    totalIOCs: number;
    eventsLast24h: number;
    eventsLast7d: number;
    eventsLast30d: number;
    iocsByType: Array<{
      type: string;
      count: number;
    }>;
    iocsByCategory: Array<{
      category: string;
      count: number;
    }>;
    lastSync: string;
    nextSync: string;
    syncStatus: 'active' | 'paused' | 'error';
  };
}

export const mispService = {
  /**
   * ⚙️ Configure MISP server
   */
  async configure(config: MISPConfig): Promise<MISPConfigureResponse> {
    const response = await apiClient.post<MISPConfigureResponse>('/misp/configure', config);
    return response.data;
  },

  /**
   * 🔍 Test MISP connection
   */
  async testConnection(config?: Partial<MISPConfig>): Promise<MISPTestResponse> {
    const response = await apiClient.post<MISPTestResponse>('/misp/test', config || {});
    return response.data;
  },

  /**
   * 📋 Get MISP events
   */
  async getEvents(filters?: {
    limit?: number;
    offset?: number;
    published?: boolean;
    tags?: string[];
    org?: string[];
    search?: string;
  }): Promise<MISPEventsResponse> {
    const response = await apiClient.get<MISPEventsResponse>('/misp/events', {
      params: filters
    });
    return response.data;
  },

  /**
   * 🔄 Sync IOCs from MISP events
   */
  async syncIOCs(eventIds?: string[]): Promise<MISPSyncResponse> {
    const response = await apiClient.post<MISPSyncResponse>('/misp/sync', {
      eventIds
    });
    return response.data;
  },

  /**
   * 📊 Get MISP statistics
   */
  async getStats(): Promise<MISPStatsResponse> {
    const response = await apiClient.get<MISPStatsResponse>('/misp/stats');
    return response.data;
  },

  /**
   * 📄 Get MISP event details
   */
  async getEvent(eventId: string): Promise<{ success: boolean; data: MISPEvent }> {
    const response = await apiClient.get(`/misp/events/${eventId}`);
    return response.data;
  },

  /**
   * 🔍 Search MISP events
   */
  async searchEvents(query: string, filters?: any): Promise<any> {
    const response = await apiClient.get('/misp/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * ⚙️ Get MISP configuration
   */
  async getConfig(): Promise<{ success: boolean; data: MISPConfig }> {
    const response = await apiClient.get('/misp/config');
    return response.data;
  },

  /**
   * 🔄 Trigger manual sync
   */
  async triggerSync(): Promise<MISPSyncResponse> {
    const response = await apiClient.post<MISPSyncResponse>('/misp/sync/trigger');
    return response.data;
  },

  /**
   * ⏸️ Pause/Resume auto-sync
   */
  async toggleAutoSync(enabled: boolean): Promise<any> {
    const response = await apiClient.put('/misp/auto-sync', { enabled });
    return response.data;
  }
};
