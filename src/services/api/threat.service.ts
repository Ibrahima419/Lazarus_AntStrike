/**
 * 🎯 Threat Service - API calls for threats/stories
 */

import apiClient from '../../lib/api-client';

export interface ThreatFilters {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface Threat {
  id: string;
  title: string;
  description: string;
  created: string;
  updated: string;
  read: boolean;
  important: boolean;
  likes: number;
  dislikes: number;
  relevance: number;
  comments: string;
  summary: string;
  links: string[];
  news_items: any[];
  tags: any[];
}

export interface ThreatsResponse {
  counts: {
    total_count: number;
    biggest_story: number;
    important_count: number;
    in_reports_count: number;
    read_count: number;
  };
  items: Threat[];
}

export const threatService = {
  /**
   * Get threats list (stories from Taranis)
   */
  async getThreats(filters?: ThreatFilters): Promise<ThreatsResponse> {
    const response = await apiClient.get<ThreatsResponse>('/threats', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single threat details
   */
  async getThreat(id: string): Promise<Threat> {
    const response = await apiClient.get<Threat>(`/threats/${id}`);
    return response.data;
  },

  /**
   * Search threats
   */
  async searchThreats(query: string, filters?: ThreatFilters): Promise<ThreatsResponse> {
    const response = await apiClient.get<ThreatsResponse>('/threats/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  /**
   * Update threat
   */
  async updateThreat(id: string, data: Partial<Threat>): Promise<Threat> {
    const response = await apiClient.put<Threat>(`/threats/${id}`, data);
    return response.data;
  },
};

