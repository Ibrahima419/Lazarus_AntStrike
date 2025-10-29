import { apiClient } from '../../lib/api-client';

export interface CorrelationRule {
  minConfidence?: number;
  maxTimeWindow?: number;
  commonTags?: string[];
  commonIOCs?: string[];
  similarTitles?: boolean;
}

export const correlationService = {
  /**
   * Corréler une menace
   */
  async correlateThreat(threatId: string, rule?: CorrelationRule) {
    const response = await apiClient.post(`/correlation/correlate/${threatId}`, rule || {});
    return response.data;
  },

  /**
   * Récupérer les corrélations d'une menace
   */
  async getThreatCorrelations(threatId: string) {
    const response = await apiClient.get(`/correlation/${threatId}`);
    return response.data;
  },

  /**
   * Analyser les campagnes de menaces
   */
  async analyzeCampaigns(minClusterSize?: number) {
    const response = await apiClient.get('/correlation/campaigns', {
      params: { minClusterSize },
    });
    return response.data;
  },

  /**
   * Récupérer les statistiques de corrélation
   */
  async getCorrelationStats() {
    const response = await apiClient.get('/correlation/stats');
    return response.data;
  },
};


