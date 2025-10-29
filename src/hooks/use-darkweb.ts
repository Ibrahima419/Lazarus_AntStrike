/**
 * 🌑 useDarkWeb - React Query hooks for dark web monitoring
 * Design moderne avec gestion des mentions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  darkwebService, 
  type DarkWebConfig,
  type DarkWebMentionsResponse,
  type DarkWebScanResponse 
} from '../services/api/darkweb.service';

// ===== QUERIES =====

/**
 * 📊 Get dark web statistics
 */
export const useDarkWebStats = () => {
  return useQuery({
    queryKey: ['darkweb', 'stats'],
    queryFn: () => darkwebService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 📋 Get dark web mentions
 */
export const useDarkWebMentions = (filters?: {
  limit?: number;
  offset?: number;
  source?: string;
  threatLevel?: string;
  keywords?: string[];
  publishedAfter?: string;
  publishedBefore?: string;
}) => {
  return useQuery({
    queryKey: ['darkweb', 'mentions', filters],
    queryFn: () => darkwebService.getMentions(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get specific mention details
 */
export const useDarkWebMention = (mentionId: string) => {
  return useQuery({
    queryKey: ['darkweb', 'mention', mentionId],
    queryFn: () => darkwebService.getMention(mentionId),
    enabled: !!mentionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * ⚙️ Get dark web configuration
 */
export const useDarkWebConfig = () => {
  return useQuery({
    queryKey: ['darkweb', 'config'],
    queryFn: () => darkwebService.getConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🔍 Search mentions
 */
export const useSearchDarkWebMentions = (query: string, filters?: any) => {
  return useQuery({
    queryKey: ['darkweb', 'search', query, filters],
    queryFn: () => darkwebService.searchMentions(query, filters),
    enabled: !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 🏷️ Get available keywords
 */
export const useDarkWebKeywords = () => {
  return useQuery({
    queryKey: ['darkweb', 'keywords'],
    queryFn: () => darkwebService.getKeywords(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * 📈 Get mention trends
 */
export const useDarkWebTrends = (period: '7d' | '30d' | '90d' = '30d') => {
  return useQuery({
    queryKey: ['darkweb', 'trends', period],
    queryFn: () => darkwebService.getTrends(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🗺️ Get attack geolocation data
 */
export const useDarkWebGeoData = () => {
  return useQuery({
    queryKey: ['darkweb', 'geo'],
    queryFn: () => darkwebService.getGeoData(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// ===== MUTATIONS =====

/**
 * ⚙️ Configure dark web monitoring
 */
export const useConfigureDarkWeb = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: DarkWebConfig) => darkwebService.configure(config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'stats'] });
      
      if (data.success) {
        console.log('✅ Dark web monitoring configured successfully');
      }
    },
    onError: (error: any) => {
      console.error('❌ Dark web configuration failed:', error);
    },
  });
};

/**
 * 🔍 Scan dark web for specific query
 */
export const useDarkWebScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => darkwebService.scan(request),
    onSuccess: (data: DarkWebScanResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'mentions'] });
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'stats'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Dark web scan completed: ${data.data.totalFound} mentions found`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Dark web scan failed:', error);
    },
  });
};

/**
 * 🔄 Trigger manual scan
 */
export const useTriggerDarkWebScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sources?: string[]) => darkwebService.triggerScan(sources),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'mentions'] });
      
      if (data.success) {
        console.log('✅ Dark web scan triggered successfully');
      }
    },
  });
};

/**
 * ⏸️ Toggle dark web monitoring
 */
export const useToggleDarkWebMonitoring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => darkwebService.toggleMonitoring(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['darkweb', 'stats'] });
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get dark web summary (computed data)
 */
export const useDarkWebSummary = () => {
  const { data: stats } = useDarkWebStats();
  const { data: config } = useDarkWebConfig();

  return {
    totalMentions: stats?.data?.totalMentions || 0,
    mentionsLast24h: stats?.data?.mentionsLast24h || 0,
    mentionsLast7d: stats?.data?.mentionsLast7d || 0,
    mentionsLast30d: stats?.data?.mentionsLast30d || 0,
    mentionsBySource: stats?.data?.mentionsBySource || [],
    mentionsByThreatLevel: stats?.data?.mentionsByThreatLevel || [],
    iocsExtracted: stats?.data?.iocsExtracted || 0,
    iocsByType: stats?.data?.iocsByType || [],
    lastScan: stats?.data?.lastScan,
    nextScan: stats?.data?.nextScan,
    monitoringStatus: stats?.data?.monitoringStatus || 'paused',
    isConfigured: config?.data?.pastebin?.enabled || config?.data?.github?.enabled || 
                  config?.data?.tor?.enabled || config?.data?.telegram?.enabled,
    config: config?.data,
  };
};

/**
 * 🔄 Auto-refresh dark web data
 */
export const useDarkWebAutoRefresh = (enabled = true) => {
  const statsQuery = useDarkWebStats();
  const mentionsQuery = useDarkWebMentions();

  return {
    stats: statsQuery,
    mentions: mentionsQuery,
    isRefreshing: statsQuery.isFetching || mentionsQuery.isFetching,
  };
};

/**
 * 🎯 Get mentions by threat level
 */
export const useDarkWebMentionsByThreatLevel = (threatLevel: 'low' | 'medium' | 'high' | 'critical') => {
  return useQuery({
    queryKey: ['darkweb', 'mentions-by-threat', threatLevel],
    queryFn: () => darkwebService.getMentions({ threatLevel }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
