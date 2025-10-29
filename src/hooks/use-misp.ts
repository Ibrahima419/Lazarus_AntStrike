/**
 * 🔗 useMISP - React Query hooks for MISP bidirectional sync
 * Design moderne avec gestion des événements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  mispService, 
  type MISPConfig,
  type MISPEventsResponse,
  type MISPSyncResponse 
} from '../services/api/misp.service';

// ===== QUERIES =====

/**
 * 📊 Get MISP statistics
 */
export const useMISPStats = () => {
  return useQuery({
    queryKey: ['misp', 'stats'],
    queryFn: () => mispService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 📋 Get MISP events
 */
export const useMISPEvents = (filters?: {
  limit?: number;
  offset?: number;
  published?: boolean;
  tags?: string[];
  org?: string[];
  search?: string;
}) => {
  return useQuery({
    queryKey: ['misp', 'events', filters],
    queryFn: () => mispService.getEvents(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get specific MISP event
 */
export const useMISPEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['misp', 'event', eventId],
    queryFn: () => mispService.getEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * ⚙️ Get MISP configuration
 */
export const useMISPConfig = () => {
  return useQuery({
    queryKey: ['misp', 'config'],
    queryFn: () => mispService.getConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🔍 Search MISP events
 */
export const useSearchMISPEvents = (query: string, filters?: any) => {
  return useQuery({
    queryKey: ['misp', 'search', query, filters],
    queryFn: () => mispService.searchEvents(query, filters),
    enabled: !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ===== MUTATIONS =====

/**
 * ⚙️ Configure MISP server
 */
export const useConfigureMISP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: MISPConfig) => mispService.configure(config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['misp', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['misp', 'stats'] });
      
      if (data.success) {
        console.log('✅ MISP configured successfully');
      }
    },
    onError: (error: any) => {
      console.error('❌ MISP configuration failed:', error);
    },
  });
};

/**
 * 🔍 Test MISP connection
 */
export const useTestMISPConnection = () => {
  return useMutation({
    mutationFn: (config?: Partial<MISPConfig>) => mispService.testConnection(config),
    onSuccess: (data) => {
      if (data.data.connected) {
        console.log('✅ MISP connection successful');
      } else {
        console.warn('⚠️ MISP connection failed:', data.data.message);
      }
    },
  });
};

/**
 * 🔄 Sync IOCs from MISP events
 */
export const useSyncMISPIOCs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventIds?: string[]) => mispService.syncIOCs(eventIds),
    onSuccess: (data: MISPSyncResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['misp', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['ioc'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ MISP sync completed: ${data.data.iocsImported} IOCs imported`);
      }
    },
    onError: (error: any) => {
      console.error('❌ MISP sync failed:', error);
    },
  });
};

/**
 * 🔄 Trigger manual MISP sync
 */
export const useTriggerMISPSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mispService.triggerSync(),
    onSuccess: (data: MISPSyncResponse) => {
      queryClient.invalidateQueries({ queryKey: ['misp', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      
      if (data.success) {
        console.log(`✅ MISP sync triggered: ${data.data.iocsImported} IOCs imported`);
      }
    },
  });
};

/**
 * ⏸️ Toggle MISP auto-sync
 */
export const useToggleMISPAutoSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => mispService.toggleAutoSync(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misp', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['misp', 'stats'] });
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get MISP summary (computed data)
 */
export const useMISPSummary = () => {
  const { data: stats } = useMISPStats();
  const { data: config } = useMISPConfig();

  return {
    totalEvents: stats?.data?.totalEvents || 0,
    totalIOCs: stats?.data?.totalIOCs || 0,
    eventsLast24h: stats?.data?.eventsLast24h || 0,
    eventsLast7d: stats?.data?.eventsLast7d || 0,
    eventsLast30d: stats?.data?.eventsLast30d || 0,
    iocsByType: stats?.data?.iocsByType || [],
    iocsByCategory: stats?.data?.iocsByCategory || [],
    lastSync: stats?.data?.lastSync,
    nextSync: stats?.data?.nextSync,
    syncStatus: stats?.data?.syncStatus || 'paused',
    isConfigured: config?.data?.url && config?.data?.apiKey,
    config: config?.data,
  };
};

/**
 * 🔄 Auto-refresh MISP data
 */
export const useMISPAutoRefresh = (enabled = true) => {
  const statsQuery = useMISPStats();
  const configQuery = useMISPConfig();

  return {
    stats: statsQuery,
    config: configQuery,
    isRefreshing: statsQuery.isFetching || configQuery.isFetching,
  };
};
