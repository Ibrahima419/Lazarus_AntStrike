/**
 * 📡 OSINT Service - API calls for OSINT feeds management
 */

import apiClient from '../../lib/api-client';

export interface OSINTFeed {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string;
  updateFrequency: number;
  enabled: boolean;
  description: string;
}

export interface OSINTFeedStats {
  availableFeeds: number;
  activeFeeds: number;
  totalIOCsFromFeeds: number;
  lastImport: string | null;
  topFeeds: Array<any>;
  importHistory: Array<any>;
}

export interface OSINTConfiguration {
  enabled: boolean;
  autoImport: boolean;
  importInterval?: number;
  selectedFeeds?: string[];
}

export interface ImportResult {
  feedId: string;
  feedName: string;
  imported: number;
  skipped: number;
  errors: number;
  duration: number;
}

export const osintService = {
  /**
   * Get available OSINT feeds
   */
  async getAvailableFeeds(): Promise<{ data: OSINTFeed[]; count: number }> {
    const response = await apiClient.get<{ data: OSINTFeed[]; count: number }>('/osint-feeds');
    return response.data;
  },

  /**
   * Configure OSINT feeds for tenant
   */
  async configureFeeds(config: OSINTConfiguration): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/osint-feeds/configure', config);
    return response.data;
  },

  /**
   * Import all active feeds manually
   */
  async importAllFeeds(): Promise<{
    message: string;
    data: {
      results: ImportResult[];
      summary: {
        feedsProcessed: number;
        totalImported: number;
        totalSkipped: number;
        totalErrors: number;
      };
    };
  }> {
    const response = await apiClient.post<{
      message: string;
      data: {
        results: ImportResult[];
        summary: {
          feedsProcessed: number;
          totalImported: number;
          totalSkipped: number;
          totalErrors: number;
        };
      };
    }>('/osint-feeds/import');
    return response.data;
  },

  /**
   * Import specific feed manually
   */
  async importFeed(feedId: string): Promise<{
    message: string;
    data: ImportResult;
  }> {
    const response = await apiClient.post<{
      message: string;
      data: ImportResult;
    }>(`/osint-feeds/import/${feedId}`);
    return response.data;
  },

  /**
   * Get OSINT feeds statistics
   */
  async getStats(): Promise<{ data: OSINTFeedStats }> {
    const response = await apiClient.get<{ data: OSINTFeedStats }>('/osint-feeds/stats');
    return response.data;
  },
};