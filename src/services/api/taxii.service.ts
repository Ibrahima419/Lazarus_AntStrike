/**
 * 🌐 TAXII Service - API calls for TAXII 2.1 server
 * Design moderne aligné avec le SOC Dashboard
 */

import apiClient from '../../lib/api-client';

export interface TAXIIDiscoveryResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    contact: string;
    default: string;
    api_roots: string[];
  };
}

export interface TAXIICollection {
  id: string;
  title: string;
  description: string;
  can_read: boolean;
  can_write: boolean;
  media_types: string[];
  objects_count: number;
  last_updated: string;
}

export interface TAXIICollectionsResponse {
  success: boolean;
  data: {
    collections: TAXIICollection[];
    total_count: number;
  };
}

export interface TAXIIObjectsResponse {
  success: boolean;
  data: {
    objects: any[];
    total_count: number;
    next?: string;
    prev?: string;
  };
}

export interface TAXIIAddObjectsResponse {
  success: boolean;
  message: string;
  data: {
    objects_added: number;
    objects_updated: number;
    objects_failed: number;
    errors: string[];
  };
}

export interface TAXIIStatsResponse {
  success: boolean;
  data: {
    total_collections: number;
    total_objects: number;
    objects_by_collection: Array<{
      collection_id: string;
      collection_title: string;
      objects_count: number;
      last_updated: string;
    }>;
    objects_by_type: Array<{
      type: string;
      count: number;
    }>;
    last_activity: string;
  };
}

export const taxiiService = {
  /**
   * 🔍 Get TAXII discovery information
   */
  async getDiscovery(): Promise<TAXIIDiscoveryResponse> {
    const response = await apiClient.get<TAXIIDiscoveryResponse>('/taxii/');
    return response.data;
  },

  /**
   * 📋 Get TAXII collections
   */
  async getCollections(): Promise<TAXIICollectionsResponse> {
    const response = await apiClient.get<TAXIICollectionsResponse>('/taxii/collections');
    return response.data;
  },

  /**
   * 📄 Get specific TAXII collection
   */
  async getCollection(collectionId: string): Promise<{ success: boolean; data: TAXIICollection }> {
    const response = await apiClient.get(`/taxii/collections/${collectionId}`);
    return response.data;
  },

  /**
   * 📦 Get objects from TAXII collection
   */
  async getObjects(
    collectionId: string,
    filters?: {
      limit?: number;
      offset?: number;
      added_after?: string;
      added_before?: string;
      type?: string;
    }
  ): Promise<TAXIIObjectsResponse> {
    const response = await apiClient.get<TAXIIObjectsResponse>(`/taxii/collections/${collectionId}/objects`, {
      params: filters
    });
    return response.data;
  },

  /**
   * ➕ Add objects to TAXII collection
   */
  async addObjects(collectionId: string, objects: any[]): Promise<TAXIIAddObjectsResponse> {
    const response = await apiClient.post<TAXIIAddObjectsResponse>(`/taxii/collections/${collectionId}/objects`, {
      objects
    });
    return response.data;
  },

  /**
   * 📊 Get TAXII statistics
   */
  async getStats(): Promise<TAXIIStatsResponse> {
    const response = await apiClient.get<TAXIIStatsResponse>('/taxii/stats');
    return response.data;
  },

  /**
   * 🔍 Search objects in TAXII collection
   */
  async searchObjects(collectionId: string, query: string, filters?: any): Promise<any> {
    const response = await apiClient.get(`/taxii/collections/${collectionId}/search`, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * 📄 Get object details from TAXII collection
   */
  async getObject(collectionId: string, objectId: string): Promise<any> {
    const response = await apiClient.get(`/taxii/collections/${collectionId}/objects/${objectId}`);
    return response.data;
  },

  /**
   * 🗑️ Delete object from TAXII collection
   */
  async deleteObject(collectionId: string, objectId: string): Promise<any> {
    const response = await apiClient.delete(`/taxii/collections/${collectionId}/objects/${objectId}`);
    return response.data;
  }
};
