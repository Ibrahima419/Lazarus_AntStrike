/**
 * 🍯 useHoneypots - React Query hooks for honeypot integration
 * Design moderne avec gestion des attaques
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  honeypotService, 
  type HoneypotConfig,
  type HoneypotAttacksResponse,
  type HoneypotImportResponse 
} from '../services/api/honeypot.service';

// ===== QUERIES =====

/**
 * 📊 Get honeypot statistics
 */
export const useHoneypotStats = () => {
  return useQuery({
    queryKey: ['honeypots', 'stats'],
    queryFn: () => honeypotService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 📋 Get supported honeypot types
 */
export const useHoneypotTypes = () => {
  return useQuery({
    queryKey: ['honeypots', 'types'],
    queryFn: () => honeypotService.getSupportedTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * 📋 Get honeypot attacks
 */
export const useHoneypotAttacks = (filters?: {
  limit?: number;
  offset?: number;
  honeypot?: string;
  severity?: string;
  attackType?: string;
  sourceIp?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['honeypots', 'attacks', filters],
    queryFn: () => honeypotService.getAttacks(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get specific attack details
 */
export const useHoneypotAttack = (attackId: string) => {
  return useQuery({
    queryKey: ['honeypots', 'attack', attackId],
    queryFn: () => honeypotService.getAttack(attackId),
    enabled: !!attackId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * ⚙️ Get honeypot configuration
 */
export const useHoneypotConfig = () => {
  return useQuery({
    queryKey: ['honeypots', 'config'],
    queryFn: () => honeypotService.getConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🔍 Search attacks
 */
export const useSearchHoneypotAttacks = (query: string, filters?: any) => {
  return useQuery({
    queryKey: ['honeypots', 'search', query, filters],
    queryFn: () => honeypotService.searchAttacks(query, filters),
    enabled: !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📈 Get attack trends
 */
export const useHoneypotTrends = (period: '7d' | '30d' | '90d' = '30d') => {
  return useQuery({
    queryKey: ['honeypots', 'trends', period],
    queryFn: () => honeypotService.getTrends(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🗺️ Get attack geolocation data
 */
export const useHoneypotGeoData = () => {
  return useQuery({
    queryKey: ['honeypots', 'geo'],
    queryFn: () => honeypotService.getGeoData(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * 🏷️ Get attack types
 */
export const useHoneypotAttackTypes = () => {
  return useQuery({
    queryKey: ['honeypots', 'attack-types'],
    queryFn: () => honeypotService.getAttackTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// ===== MUTATIONS =====

/**
 * ⚙️ Configure honeypots
 */
export const useConfigureHoneypots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: HoneypotConfig) => honeypotService.configure(config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'stats'] });
      
      if (data.success) {
        console.log('✅ Honeypots configured successfully');
      }
    },
    onError: (error: any) => {
      console.error('❌ Honeypot configuration failed:', error);
    },
  });
};

/**
 * 📥 Import honeypot logs
 */
export const useImportHoneypotLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (honeypot?: string) => honeypotService.importLogs(honeypot),
    onSuccess: (data: HoneypotImportResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'attacks'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Imported ${data.data.imported} honeypot attacks`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Honeypot import failed:', error);
    },
  });
};

/**
 * 🔄 Trigger manual import
 */
export const useTriggerHoneypotImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (honeypot?: string) => honeypotService.triggerImport(honeypot),
    onSuccess: (data: HoneypotImportResponse) => {
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'attacks'] });
      
      if (data.success) {
        console.log(`✅ Honeypot import triggered: ${data.data.imported} attacks imported`);
      }
    },
  });
};

/**
 * ⏸️ Toggle honeypot auto-import
 */
export const useToggleHoneypotAutoImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => honeypotService.toggleAutoImport(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['honeypots', 'stats'] });
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get honeypot summary (computed data)
 */
export const useHoneypotSummary = () => {
  const { data: stats } = useHoneypotStats();
  const { data: config } = useHoneypotConfig();
  const { data: types } = useHoneypotTypes();

  return {
    totalAttacks: stats?.data?.totalAttacks || 0,
    attacksLast24h: stats?.data?.attacksLast24h || 0,
    attacksLast7d: stats?.data?.attacksLast7d || 0,
    attacksLast30d: stats?.data?.attacksLast30d || 0,
    attacksByHoneypot: stats?.data?.attacksByHoneypot || [],
    attacksByType: stats?.data?.attacksByType || [],
    attacksBySeverity: stats?.data?.attacksBySeverity || [],
    iocsExtracted: stats?.data?.iocsExtracted || 0,
    iocsByType: stats?.data?.iocsByType || [],
    topSourceIPs: stats?.data?.topSourceIPs || [],
    lastImport: stats?.data?.lastImport,
    nextImport: stats?.data?.nextImport,
    importStatus: stats?.data?.importStatus || 'paused',
    isConfigured: config?.data?.cowrie?.enabled || config?.data?.dionaea?.enabled || config?.data?.tpot?.enabled,
    config: config?.data,
    supportedTypes: types?.data || [],
  };
};

/**
 * 🔄 Auto-refresh honeypot data
 */
export const useHoneypotAutoRefresh = (enabled = true) => {
  const statsQuery = useHoneypotStats();
  const attacksQuery = useHoneypotAttacks();

  return {
    stats: statsQuery,
    attacks: attacksQuery,
    isRefreshing: statsQuery.isFetching || attacksQuery.isFetching,
  };
};

/**
 * 🎯 Get attacks by honeypot type
 */
export const useHoneypotAttacksByType = (honeypot: 'cowrie' | 'dionaea' | 'tpot') => {
  return useQuery({
    queryKey: ['honeypots', 'attacks-by-type', honeypot],
    queryFn: () => honeypotService.getAttacks({ honeypot }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 🎯 Get attacks by severity
 */
export const useHoneypotAttacksBySeverity = (severity: 'low' | 'medium' | 'high' | 'critical') => {
  return useQuery({
    queryKey: ['honeypots', 'attacks-by-severity', severity],
    queryFn: () => honeypotService.getAttacks({ severity }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
