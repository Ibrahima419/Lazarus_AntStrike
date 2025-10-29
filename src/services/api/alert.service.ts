/**
 * 🚨 Alert Service - API calls for alerts
 */

import apiClient from '../../lib/api-client';

export interface CreateAlertData {
  storyId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: 'VULNERABILITY' | 'MALWARE' | 'RANSOMWARE' | 'PHISHING' | 'APT' | 'DATA_BREACH' | 'DENIAL_OF_SERVICE' | 'INSIDER_THREAT' | 'SUPPLY_CHAIN' | 'OTHER';
  title: string;
  summary: string;
  iocs?: string[];
  affectedAssets?: string[];
  recommendedActions?: string[];
}

export interface Alert {
  id: string;
  tenantId: string;
  storyId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: 'VULNERABILITY' | 'MALWARE' | 'RANSOMWARE' | 'PHISHING' | 'APT' | 'DATA_BREACH' | 'DENIAL_OF_SERVICE' | 'INSIDER_THREAT' | 'SUPPLY_CHAIN' | 'OTHER';
  title: string;
  summary: string;
  iocs: string[];
  affectedAssets: string[];
  recommendedActions: string[];
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedTo?: string;
  slaDeadline: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertFilters {
  severity?: string;
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

export const alertService = {
  /**
   * Get alerts list
   */
  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    const response = await apiClient.get<Alert[]>('/alerts', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single alert
   */
  async getAlert(id: string): Promise<Alert> {
    const response = await apiClient.get<Alert>(`/alerts/${id}`);
    return response.data;
  },

  /**
   * Create new alert
   */
  async createAlert(data: CreateAlertData): Promise<{ data: Alert }> {
    const response = await apiClient.post<{ data: Alert }>('/alerts', data);
    return response.data;
  },

  /**
   * Update alert
   */
  async updateAlert(id: string, data: Partial<Alert>): Promise<{ data: Alert }> {
    const response = await apiClient.put<{ data: Alert }>(`/alerts/${id}`, data);
    return response.data;
  },

  /**
   * Delete alert
   */
  async deleteAlert(id: string): Promise<void> {
    await apiClient.delete(`/alerts/${id}`);
  },

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id: string): Promise<{ data: Alert }> {
    const response = await apiClient.post<{ data: Alert }>(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  /**
   * Resolve alert
   */
  async resolveAlert(id: string): Promise<{ data: Alert }> {
    const response = await apiClient.post<{ data: Alert }>(`/alerts/${id}/resolve`);
    return response.data;
  },
};

