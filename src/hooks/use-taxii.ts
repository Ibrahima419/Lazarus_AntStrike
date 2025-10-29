/**
 * 🌐 useTAXII - React Query hooks for TAXII 2.1 server
 * Design moderne avec gestion des collections
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  taxiiService, 
  type TAXIICollectionsResponse,
  type TAXIIObjectsResponse,
  type TAXIIAddObjectsResponse 
} from '../services/api/taxii.service';

// ===== QUERIES =====

/**
 * 🔍 Get TAXII discovery information
 */
export const useTAXIIDiscovery = () => {
  return useQuery({
    queryKey: ['taxii', 'discovery'],
    queryFn: () => taxiiService.getDiscovery(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 📋 Get TAXII collections
 */
export const useTAXIICollections = () => {
  return useQuery({
    queryKey: ['taxii', 'collections'],
    queryFn: () => taxiiService.getCollections(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 📄 Get specific TAXII collection
 */
export const useTAXIICollection = (collectionId: string) => {
  return useQuery({
    queryKey: ['taxii', 'collection', collectionId],
    queryFn: () => taxiiService.getCollection(collectionId),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 📦 Get objects from TAXII collection
 */
export const useTAXIIObjects = (
  collectionId: string,
  filters?: {
    limit?: number;
    offset?: number;
    added_after?: string;
    added_before?: string;
    type?: string;
  }
) => {
  return useQuery({
    queryKey: ['taxii', 'objects', collectionId, filters],
    queryFn: () => taxiiService.getObjects(collectionId, filters),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📊 Get TAXII statistics
 */
export const useTAXIIStats = () => {
  return useQuery({
    queryKey: ['taxii', 'stats'],
    queryFn: () => taxiiService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 🔍 Search objects in TAXII collection
 */
export const useSearchTAXIIObjects = (collectionId: string, query: string, filters?: any) => {
  return useQuery({
    queryKey: ['taxii', 'search', collectionId, query, filters],
    queryFn: () => taxiiService.searchObjects(collectionId, query, filters),
    enabled: !!collectionId && !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get object details from TAXII collection
 */
export const useTAXIIObject = (collectionId: string, objectId: string) => {
  return useQuery({
    queryKey: ['taxii', 'object', collectionId, objectId],
    queryFn: () => taxiiService.getObject(collectionId, objectId),
    enabled: !!collectionId && !!objectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===== MUTATIONS =====

/**
 * ➕ Add objects to TAXII collection
 */
export const useAddTAXIIObjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, objects }: { collectionId: string; objects: any[] }) =>
      taxiiService.addObjects(collectionId, objects),
    onSuccess: (data: TAXIIAddObjectsResponse, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['taxii', 'collections'] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'objects', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'stats'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Added ${data.data.objects_added} objects to TAXII collection`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Failed to add objects to TAXII collection:', error);
    },
  });
};

/**
 * 🗑️ Delete object from TAXII collection
 */
export const useDeleteTAXIIObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, objectId }: { collectionId: string; objectId: string }) =>
      taxiiService.deleteObject(collectionId, objectId),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['taxii', 'collections'] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'objects', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['taxii', 'stats'] });
      
      console.log('✅ Object deleted from TAXII collection');
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get TAXII summary (computed data)
 */
export const useTAXIISummary = () => {
  const { data: stats } = useTAXIIStats();
  const { data: collections } = useTAXIICollections();

  return {
    totalCollections: stats?.data?.total_collections || 0,
    totalObjects: stats?.data?.total_objects || 0,
    collections: collections?.data?.collections || [],
    objectsByCollection: stats?.data?.objects_by_collection || [],
    objectsByType: stats?.data?.objects_by_type || [],
    lastActivity: stats?.data?.last_activity,
  };
};

/**
 * 🔄 Get collection objects with pagination
 */
export const useTAXIICollectionObjects = (
  collectionId: string,
  page = 0,
  pageSize = 20,
  filters?: any
) => {
  const offset = page * pageSize;
  
  return useQuery({
    queryKey: ['taxii', 'objects', collectionId, page, pageSize, filters],
    queryFn: () => taxiiService.getObjects(collectionId, {
      limit: pageSize,
      offset,
      ...filters
    }),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
