/**
 * 🎯 STIX Service - API calls for STIX 2.1 operations
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface STIXBundle {
  type: 'bundle';
  id: string;
  spec_version: string;
  objects: any[];
}

export interface STIXImportResponse {
  success: boolean;
  message: string;
  data: {
    bundleId: string;
    objectsCount: number;
    indicatorsCount: number;
    malwareCount: number;
    threatActorsCount: number;
    campaignsCount: number;
    vulnerabilitiesCount: number;
    parsedObjects: any[];
    errors: string[];
  };
}

export interface STIXExportResponse {
  success: boolean;
  data: {
    bundle: STIXBundle;
    objectsCount: number;
    indicatorsCount: number;
    malwareCount: number;
    threatActorsCount: number;
    campaignsCount: number;
    vulnerabilitiesCount: number;
  };
}

export interface STIXValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    objectsCount: number;
    indicatorsCount: number;
    malwareCount: number;
    threatActorsCount: number;
    campaignsCount: number;
    vulnerabilitiesCount: number;
  };
}

export interface STIXParseResponse {
  success: boolean;
  data: {
    parsedObjects: any[];
    indicatorsCount: number;
    malwareCount: number;
    threatActorsCount: number;
    campaignsCount: number;
    vulnerabilitiesCount: number;
    relationshipsCount: number;
    errors: string[];
  };
}

export interface STIXStatsResponse {
  success: boolean;
  data: {
    totalBundles: number;
    totalObjects: number;
    indicatorsCount: number;
    malwareCount: number;
    threatActorsCount: number;
    campaignsCount: number;
    vulnerabilitiesCount: number;
    relationshipsCount: number;
    lastImport: string;
    lastExport: string;
  };
}

export const stixService = {
  /**
   * 📦 Import STIX bundle
   */
  async importBundle(bundle: STIXBundle): Promise<STIXImportResponse> {
    const response = await apiClient.post<STIXImportResponse>('/stix/import', bundle);
    return response.data;
  },

  /**
   * 📤 Export STIX bundle
   */
  async exportBundle(iocIds?: string[]): Promise<STIXExportResponse> {
    const response = await apiClient.get<STIXExportResponse>('/stix/export', {
      params: iocIds ? { iocIds: iocIds.join(',') } : {}
    });
    return response.data;
  },

  /**
   * ✅ Validate STIX bundle
   */
  async validateBundle(bundle: STIXBundle): Promise<STIXValidationResponse> {
    const response = await apiClient.post<STIXValidationResponse>('/stix/validate', bundle);
    return response.data;
  },

  /**
   * 🔍 Parse STIX bundle
   */
  async parseBundle(bundle: STIXBundle): Promise<STIXParseResponse> {
    const response = await apiClient.post<STIXParseResponse>('/stix/parse', bundle);
    return response.data;
  },

  /**
   * 📊 Get STIX statistics
   */
  async getStats(): Promise<STIXStatsResponse> {
    const response = await apiClient.get<STIXStatsResponse>('/stix/stats');
    return response.data;
  },

  /**
   * 📋 List STIX bundles
   */
  async listBundles(limit = 20, offset = 0): Promise<any> {
    const response = await apiClient.get('/stix/bundles', {
      params: { limit, offset }
    });
    return response.data;
  },

  /**
   * 🔍 Search STIX objects
   */
  async searchObjects(query: string, type?: string): Promise<any> {
    const response = await apiClient.get('/stix/search', {
      params: { q: query, type }
    });
    return response.data;
  },

  /**
   * 📄 Get STIX object details
   */
  async getObject(id: string): Promise<any> {
    const response = await apiClient.get(`/stix/objects/${id}`);
    return response.data;
  }
};
