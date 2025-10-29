/**
 * 🎯 CVE Service - API calls for CVE intelligence & enrichment
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface CVESearchFilters {
  query?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssMin?: number;
  cvssMax?: number;
  publishedAfter?: string;
  publishedBefore?: string;
  limit?: number;
  offset?: number;
}

export interface CVE {
  id: string;
  summary: string;
  severity: string;
  cvss: number;
  published: string;
  modified: string;
  references: string[];
  cwe: string[];
  configurations: any[];
  enriched: boolean;
  enrichmentData?: {
    exploitability: string;
    impact: string;
    remediation: string;
    references: string[];
    tags: string[];
  };
}

export interface CVESearchResponse {
  success: boolean;
  data: {
    cves: CVE[];
    total_count: number;
    page: number;
    pageSize: number;
    facets: {
      severity: Array<{ value: string; count: number }>;
      cvss: Array<{ range: string; count: number }>;
      year: Array<{ value: string; count: number }>;
    };
  };
}

export interface CVEResponse {
  success: boolean;
  data: CVE;
}

export interface CVEEnrichResponse {
  success: boolean;
  message: string;
  data: {
    cveId: string;
    enriched: boolean;
    enrichmentData: {
      exploitability: string;
      impact: string;
      remediation: string;
      references: string[];
      tags: string[];
      lastEnriched: string;
    };
  };
}

export interface CVEBulkEnrichResponse {
  success: boolean;
  message: string;
  data: {
    totalRequested: number;
    enriched: number;
    failed: number;
    errors: string[];
    duration: number;
  };
}

export interface CVEImportRecentResponse {
  success: boolean;
  message: string;
  data: {
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
    duration: number;
    cves: CVE[];
  };
}

export interface CVEStatsResponse {
  success: boolean;
  data: {
    totalCVEs: number;
    cvesLast24h: number;
    cvesLast7d: number;
    cvesLast30d: number;
    cvesBySeverity: Array<{
      severity: string;
      count: number;
    }>;
    cvesByYear: Array<{
      year: string;
      count: number;
    }>;
    enrichedCVEs: number;
    enrichmentRate: number;
    lastImport: string;
    lastEnrichment: string;
  };
}

export const cveService = {
  /**
   * 🔍 Search CVEs
   */
  async searchCVEs(filters?: CVESearchFilters): Promise<CVESearchResponse> {
    const response = await apiClient.get<CVESearchResponse>('/cve/search', {
      params: filters
    });
    return response.data;
  },

  /**
   * 📄 Get specific CVE
   */
  async getCVE(cveId: string): Promise<CVEResponse> {
    const response = await apiClient.get<CVEResponse>(`/cve/${cveId}`);
    return response.data;
  },

  /**
   * 🔄 Enrich CVE with additional intelligence
   */
  async enrichCVE(cveId: string): Promise<CVEEnrichResponse> {
    const response = await apiClient.post<CVEEnrichResponse>(`/cve/${cveId}/enrich`);
    return response.data;
  },

  /**
   * 🔄 Bulk enrich multiple CVEs
   */
  async bulkEnrich(cveIds: string[]): Promise<CVEBulkEnrichResponse> {
    const response = await apiClient.post<CVEBulkEnrichResponse>('/cve/bulk-enrich', {
      cveIds
    });
    return response.data;
  },

  /**
   * 📥 Import recent CVEs
   */
  async importRecent(limit = 50): Promise<CVEImportRecentResponse> {
    const response = await apiClient.post<CVEImportRecentResponse>('/cve/import-recent', {
      limit
    });
    return response.data;
  },

  /**
   * 📊 Get CVE statistics
   */
  async getStats(): Promise<CVEStatsResponse> {
    const response = await apiClient.get<CVEStatsResponse>('/cve/stats');
    return response.data;
  },

  /**
   * 📋 List CVEs with filters
   */
  async listCVEs(filters?: CVESearchFilters): Promise<CVESearchResponse> {
    const response = await apiClient.get<CVESearchResponse>('/cve/', {
      params: filters
    });
    return response.data;
  },

  /**
   * 🔍 Search CVEs by keyword
   */
  async searchByKeyword(keyword: string, filters?: CVESearchFilters): Promise<CVESearchResponse> {
    const response = await apiClient.get<CVESearchResponse>('/cve/search', {
      params: { q: keyword, ...filters }
    });
    return response.data;
  },

  /**
   * 📈 Get CVE trends
   */
  async getTrends(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    const response = await apiClient.get('/cve/trends', {
      params: { period }
    });
    return response.data;
  },

  /**
   * 🏷️ Get CVE tags
   */
  async getTags(): Promise<any> {
    const response = await apiClient.get('/cve/tags');
    return response.data;
  },

  /**
   * 📊 Get CVE severity distribution
   */
  async getSeverityDistribution(): Promise<any> {
    const response = await apiClient.get('/cve/severity-distribution');
    return response.data;
  }
};
