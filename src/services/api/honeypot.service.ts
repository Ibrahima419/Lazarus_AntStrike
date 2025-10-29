/**
 * 🍯 Honeypot Service - API calls for honeypot integration
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface HoneypotType {
  name: string;
  description: string;
  supported: boolean;
  defaultPort: number;
  logFormat: string;
  iocTypes: string[];
}

export interface HoneypotConfig {
  cowrie: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    logPath: string;
  };
  dionaea: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    logPath: string;
  };
  tpot: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    logPath: string;
  };
}

export interface HoneypotConfigureResponse {
  success: boolean;
  message: string;
  data: {
    config: HoneypotConfig;
    testResults: Array<{
      honeypot: string;
      status: 'success' | 'error';
      message: string;
      responseTime: number;
    }>;
  };
}

export interface HoneypotAttack {
  id: string;
  honeypot: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  attackType: string;
  payload?: string;
  iocs: Array<{
    type: 'ip' | 'domain' | 'hash' | 'url';
    value: string;
    confidence: number;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  geoLocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

export interface HoneypotAttacksResponse {
  success: boolean;
  data: {
    attacks: HoneypotAttack[];
    total_count: number;
    page: number;
    pageSize: number;
    honeypots: Array<{
      name: string;
      count: number;
    }>;
  };
}

export interface HoneypotImportResponse {
  success: boolean;
  message: string;
  data: {
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
    duration: number;
    attacks: HoneypotAttack[];
  };
}

export interface HoneypotStatsResponse {
  success: boolean;
  data: {
    totalAttacks: number;
    attacksLast24h: number;
    attacksLast7d: number;
    attacksLast30d: number;
    attacksByHoneypot: Array<{
      honeypot: string;
      count: number;
    }>;
    attacksByType: Array<{
      type: string;
      count: number;
    }>;
    attacksBySeverity: Array<{
      severity: string;
      count: number;
    }>;
    iocsExtracted: number;
    iocsByType: Array<{
      type: string;
      count: number;
    }>;
    topSourceIPs: Array<{
      ip: string;
      count: number;
      country?: string;
    }>;
    lastImport: string;
    nextImport: string;
    importStatus: 'active' | 'paused' | 'error';
  };
}

export const honeypotService = {
  /**
   * 📋 Get supported honeypot types
   */
  async getSupportedTypes(): Promise<{ success: boolean; data: HoneypotType[] }> {
    const response = await apiClient.get('/honeypots/supported');
    return response.data;
  },

  /**
   * ⚙️ Configure honeypots
   */
  async configure(config: HoneypotConfig): Promise<HoneypotConfigureResponse> {
    const response = await apiClient.post<HoneypotConfigureResponse>('/honeypots/configure', config);
    return response.data;
  },

  /**
   * 📥 Import honeypot logs
   */
  async importLogs(honeypot?: string): Promise<HoneypotImportResponse> {
    const response = await apiClient.post<HoneypotImportResponse>('/honeypots/import', {
      honeypot
    });
    return response.data;
  },

  /**
   * 📊 Get honeypot statistics
   */
  async getStats(): Promise<HoneypotStatsResponse> {
    const response = await apiClient.get<HoneypotStatsResponse>('/honeypots/stats');
    return response.data;
  },

  /**
   * 📋 Get honeypot attacks
   */
  async getAttacks(filters?: {
    limit?: number;
    offset?: number;
    honeypot?: string;
    severity?: string;
    attackType?: string;
    sourceIp?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<HoneypotAttacksResponse> {
    const response = await apiClient.get<HoneypotAttacksResponse>('/honeypots/attacks', {
      params: filters
    });
    return response.data;
  },

  /**
   * 📄 Get specific attack details
   */
  async getAttack(attackId: string): Promise<{ success: boolean; data: HoneypotAttack }> {
    const response = await apiClient.get(`/honeypots/attacks/${attackId}`);
    return response.data;
  },

  /**
   * 🔍 Search attacks
   */
  async searchAttacks(query: string, filters?: any): Promise<any> {
    const response = await apiClient.get('/honeypots/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * ⚙️ Get configuration
   */
  async getConfig(): Promise<{ success: boolean; data: HoneypotConfig }> {
    const response = await apiClient.get('/honeypots/config');
    return response.data;
  },

  /**
   * 🔄 Trigger manual import
   */
  async triggerImport(honeypot?: string): Promise<HoneypotImportResponse> {
    const response = await apiClient.post<HoneypotImportResponse>('/honeypots/import/trigger', {
      honeypot
    });
    return response.data;
  },

  /**
   * ⏸️ Pause/Resume auto-import
   */
  async toggleAutoImport(enabled: boolean): Promise<any> {
    const response = await apiClient.put('/honeypots/auto-import', { enabled });
    return response.data;
  },

  /**
   * 📈 Get attack trends
   */
  async getTrends(period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    const response = await apiClient.get('/honeypots/trends', {
      params: { period }
    });
    return response.data;
  },

  /**
   * 🗺️ Get attack geolocation data
   */
  async getGeoData(): Promise<any> {
    const response = await apiClient.get('/honeypots/geo');
    return response.data;
  },

  /**
   * 🏷️ Get attack types
   */
  async getAttackTypes(): Promise<any> {
    const response = await apiClient.get('/honeypots/attack-types');
    return response.data;
  }
};
