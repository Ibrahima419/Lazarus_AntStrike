import { apiClient } from '../../lib/api-client';

export interface MetricsPeriod {
  startDate: string;
  endDate: string;
}

export const metricsService = {
  /**
   * Récupérer les métriques d'un analyste
   */
  async getAnalystMetrics(userId: string, period?: MetricsPeriod) {
    const response = await apiClient.get(`/metrics/analyst/${userId}`, {
      params: period,
    });
    return response.data;
  },

  /**
   * Récupérer les métriques agrégées d'un analyste
   */
  async getAggregatedMetrics(userId: string, period?: MetricsPeriod) {
    const response = await apiClient.get(`/metrics/analyst/${userId}/aggregated`, {
      params: period,
    });
    return response.data;
  },

  /**
   * Récupérer les métriques d'équipe
   */
  async getTeamMetrics(period?: MetricsPeriod) {
    const response = await apiClient.get('/metrics/team', { params: period });
    return response.data;
  },

  /**
   * Comparer les analystes
   */
  async compareAnalysts(period?: MetricsPeriod) {
    const response = await apiClient.get('/metrics/compare', { params: period });
    return response.data;
  },

  /**
   * Mettre à jour les métriques quotidiennes
   */
  async updateDailyMetrics(userId: string, date?: string) {
    const response = await apiClient.post(`/metrics/analyst/${userId}/update`, { date });
    return response.data;
  },
};


