/**
 * 🎯 useSTIX - React Query hooks for STIX 2.1 operations
 * Design moderne avec gestion des bundles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  stixService, 
  type STIXBundle,
  type STIXImportResponse,
  type STIXExportResponse 
} from '../services/api/stix.service';

// ===== QUERIES =====

/**
 * 📊 Get STIX statistics
 */
export const useSTIXStats = () => {
  return useQuery({
    queryKey: ['stix', 'stats'],
    queryFn: () => stixService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 📋 List STIX bundles
 */
export const useSTIXBundles = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['stix', 'bundles', limit, offset],
    queryFn: () => stixService.listBundles(limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 📤 Export STIX bundle
 */
export const useExportSTIX = (iocIds?: string[]) => {
  return useQuery({
    queryKey: ['stix', 'export', iocIds],
    queryFn: () => stixService.exportBundle(iocIds),
    enabled: false, // Manual trigger only
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 🔍 Search STIX objects
 */
export const useSearchSTIXObjects = (query: string, type?: string) => {
  return useQuery({
    queryKey: ['stix', 'search', query, type],
    queryFn: () => stixService.searchObjects(query, type),
    enabled: !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get STIX object details
 */
export const useSTIXObject = (id: string) => {
  return useQuery({
    queryKey: ['stix', 'object', id],
    queryFn: () => stixService.getObject(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===== MUTATIONS =====

/**
 * 📦 Import STIX bundle
 */
export const useImportSTIX = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bundle: STIXBundle) => stixService.importBundle(bundle),
    onSuccess: (data: STIXImportResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['stix', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['stix', 'bundles'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ STIX bundle imported: ${data.data.objectsCount} objects, ${data.data.indicatorsCount} indicators`);
      }
    },
    onError: (error: any) => {
      console.error('❌ STIX import failed:', error);
    },
  });
};

/**
 * ✅ Validate STIX bundle
 */
export const useValidateSTIX = () => {
  return useMutation({
    mutationFn: (bundle: STIXBundle) => stixService.validateBundle(bundle),
    onSuccess: (data) => {
      if (data.data.isValid) {
        console.log('✅ STIX bundle is valid');
      } else {
        console.warn('⚠️ STIX bundle validation failed:', data.data.errors);
      }
    },
  });
};

/**
 * 🔍 Parse STIX bundle
 */
export const useParseSTIX = () => {
  return useMutation({
    mutationFn: (bundle: STIXBundle) => stixService.parseBundle(bundle),
    onSuccess: (data) => {
      console.log(`✅ STIX bundle parsed: ${data.data.parsedObjects.length} objects`);
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get STIX summary (computed data)
 */
export const useSTIXSummary = () => {
  const { data: stats } = useSTIXStats();

  return {
    totalBundles: stats?.data?.totalBundles || 0,
    totalObjects: stats?.data?.totalObjects || 0,
    indicatorsCount: stats?.data?.indicatorsCount || 0,
    malwareCount: stats?.data?.malwareCount || 0,
    threatActorsCount: stats?.data?.threatActorsCount || 0,
    campaignsCount: stats?.data?.campaignsCount || 0,
    vulnerabilitiesCount: stats?.data?.vulnerabilitiesCount || 0,
    relationshipsCount: stats?.data?.relationshipsCount || 0,
    lastImport: stats?.data?.lastImport,
    lastExport: stats?.data?.lastExport,
  };
};

/**
 * 🔄 Trigger STIX export
 */
export const useTriggerSTIXExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (iocIds?: string[]) => stixService.exportBundle(iocIds),
    onSuccess: (data: STIXExportResponse) => {
      queryClient.setQueryData(['stix', 'export', data.data.bundle.id], data);
      console.log(`✅ STIX bundle exported: ${data.data.objectsCount} objects`);
    },
  });
};
