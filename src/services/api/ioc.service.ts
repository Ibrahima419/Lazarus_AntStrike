import { apiClient } from '../../lib/api-client';

export interface IOCEnrichmentData {
  iocValue: string;
  iocType: 'IP' | 'DOMAIN' | 'URL' | 'FILE_HASH' | 'EMAIL' | 'CVE';
  source?: string;
}

export const iocService = {
  /**
   * Enrichir un IOC
   */
  async enrichIOC(data: IOCEnrichmentData) {
    const response = await apiClient.post('/ioc/enrich', data);
    return response.data;
  },

  /**
   * Récupérer tous les IOCs enrichis
   */
  async getEnrichedIOCs(filters?: {
    iocType?: string;
    limit?: number;
  }) {
    const response = await apiClient.get('/ioc', { params: filters });
    return response.data;
  },

  /**
   * Extraire les IOCs depuis un texte
   */
  async extractIOCs(text: string) {
    const response = await apiClient.post('/ioc/extract', { text });
    return response.data;
  },

  /**
   * Enrichir plusieurs IOCs en masse
   */
  async bulkEnrichIOCs(iocs: IOCEnrichmentData[]) {
    const response = await apiClient.post('/ioc/bulk-enrich', { iocs });
    return response.data;
  },
};


