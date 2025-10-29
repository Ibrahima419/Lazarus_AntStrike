/**
 * 🚀 useCollection - React Query hooks for collection & aggregation
 * Design moderne avec refetch temps réel
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collectionService, 
  type CollectionTriggerRequest,
  type CollectionTriggerResponse 
} from '../services/api/collection.service';

// ===== QUERIES =====

/**
 * 📊 Get collection statistics
 */
export const useCollectionStats = () => {
  return useQuery({
    queryKey: ['collection', 'stats'],
    queryFn: () => collectionService.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

/**
 * 📋 Get queue status (BullMQ)
 */
export const useQueueStatus = () => {
  return useQuery({
    queryKey: ['collection', 'queue'],
    queryFn: () => collectionService.getQueueStatus(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds (real-time)
  });
};

/**
 * 🏥 Get collection health status
 */
export const useCollectionHealth = () => {
  return useQuery({
    queryKey: ['collection', 'health'],
    queryFn: () => collectionService.getHealth(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

/**
 * 📜 Get collection history
 */
export const useCollectionHistory = (limit = 20) => {
  return useQuery({
    queryKey: ['collection', 'history', limit],
    queryFn: () => collectionService.getHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 📝 Get collection logs
 */
export const useCollectionLogs = (source?: string, limit = 50) => {
  return useQuery({
    queryKey: ['collection', 'logs', source, limit],
    queryFn: () => collectionService.getLogs(source, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
  });
};

/**
 * ⚙️ Get collection configuration
 */
export const useCollectionConfig = () => {
  return useQuery({
    queryKey: ['collection', 'config'],
    queryFn: () => collectionService.getConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// ===== MUTATIONS =====

/**
 * 🚀 Trigger collection
 */
export const useTriggerCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: CollectionTriggerRequest) =>
      collectionService.triggerCollection(request),
    onSuccess: (data: CollectionTriggerResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'health'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'history'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Collection triggered: ${data.data.totalItemsCollected} items collected`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Collection trigger failed:', error);
    },
  });
};

/**
 * ⚙️ Update collection configuration
 */
export const useUpdateCollectionConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: any) => collectionService.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'health'] });
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 🔄 Auto-refresh collection data
 */
export const useCollectionAutoRefresh = (enabled = true) => {
  const statsQuery = useCollectionStats();
  const queueQuery = useQueueStatus();
  const healthQuery = useCollectionHealth();

  return {
    stats: statsQuery,
    queue: queueQuery,
    health: healthQuery,
    isRefreshing: statsQuery.isFetching || queueQuery.isFetching || healthQuery.isFetching,
  };
};

/**
 * 📊 Get collection summary (computed data)
 */
export const useCollectionSummary = () => {
  const { data: stats } = useCollectionStats();
  const { data: queue } = useQueueStatus();
  const { data: health } = useCollectionHealth();

  return {
    totalItems: stats?.data?.totalItems || 0,
    itemsLast24h: stats?.data?.itemsLast24h || 0,
    itemsLast7d: stats?.data?.itemsLast7d || 0,
    itemsLast30d: stats?.data?.itemsLast30d || 0,
    sourcesCount: stats?.data?.sourcesCount || 0,
    successRate: stats?.data?.successRate || 0,
    avgDuration: stats?.data?.avgDuration || 0,
    lastCollection: stats?.data?.lastCollection,
    nextScheduled: stats?.data?.nextScheduled,
    
    // Queue status
    queueWaiting: queue?.data?.waiting || 0,
    queueActive: queue?.data?.active || 0,
    queueCompleted: queue?.data?.completed || 0,
    queueFailed: queue?.data?.failed || 0,
    queueTotal: queue?.data?.total || 0,
    
    // Health status
    overallHealth: health?.data?.overall || 'unknown',
    healthySources: health?.data?.sources?.filter(s => s.status === 'healthy').length || 0,
    totalSources: health?.data?.sources?.length || 0,
    sources: health?.data?.sources || [],
  };
};
