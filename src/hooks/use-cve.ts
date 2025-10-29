/**
 * 🎯 useCVE - React Query hooks for CVE intelligence & enrichment
 * Design moderne avec recherche et enrichissement
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  cveService, 
  type CVESearchFilters,
  type CVESearchResponse,
  type CVEEnrichResponse,
  type CVEImportRecentResponse 
} from '../services/api/cve.service';

// ===== QUERIES =====

/**
 * 📊 Get CVE statistics
 */
export const useCVEStats = () => {
  return useQuery({
    queryKey: ['cve', 'stats'],
    queryFn: () => cveService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

/**
 * 🔍 Search CVEs
 */
export const useCVESearch = (filters?: CVESearchFilters) => {
  return useQuery({
    queryKey: ['cve', 'search', filters],
    queryFn: () => cveService.searchCVEs(filters),
    enabled: !!filters?.query || !!filters?.severity,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📋 List CVEs
 */
export const useCVEList = (filters?: CVESearchFilters) => {
  return useQuery({
    queryKey: ['cve', 'list', filters],
    queryFn: () => cveService.listCVEs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📄 Get specific CVE
 */
export const useCVE = (cveId: string) => {
  return useQuery({
    queryKey: ['cve', 'detail', cveId],
    queryFn: () => cveService.getCVE(cveId),
    enabled: !!cveId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 🔍 Search CVEs by keyword
 */
export const useCVESearchByKeyword = (keyword: string, filters?: CVESearchFilters) => {
  return useQuery({
    queryKey: ['cve', 'search-keyword', keyword, filters],
    queryFn: () => cveService.searchByKeyword(keyword, filters),
    enabled: !!keyword,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * 📈 Get CVE trends
 */
export const useCVETrends = (period: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: ['cve', 'trends', period],
    queryFn: () => cveService.getTrends(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * 🏷️ Get CVE tags
 */
export const useCVETags = () => {
  return useQuery({
    queryKey: ['cve', 'tags'],
    queryFn: () => cveService.getTags(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * 📊 Get CVE severity distribution
 */
export const useCVESeverityDistribution = () => {
  return useQuery({
    queryKey: ['cve', 'severity-distribution'],
    queryFn: () => cveService.getSeverityDistribution(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===== MUTATIONS =====

/**
 * 🔄 Enrich CVE with additional intelligence
 */
export const useEnrichCVE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cveId: string) => cveService.enrichCVE(cveId),
    onSuccess: (data: CVEEnrichResponse, cveId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['cve', 'detail', cveId] });
      queryClient.invalidateQueries({ queryKey: ['cve', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['cve', 'list'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ CVE ${cveId} enriched successfully`);
      }
    },
    onError: (error: any) => {
      console.error('❌ CVE enrichment failed:', error);
    },
  });
};

/**
 * 🔄 Bulk enrich multiple CVEs
 */
export const useBulkEnrichCVEs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cveIds: string[]) => cveService.bulkEnrich(cveIds),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['cve', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['cve', 'list'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Bulk enrichment completed: ${data.data.enriched} CVEs enriched`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Bulk CVE enrichment failed:', error);
    },
  });
};

/**
 * 📥 Import recent CVEs
 */
export const useImportRecentCVEs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limit = 50) => cveService.importRecent(limit),
    onSuccess: (data: CVEImportRecentResponse) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['cve', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['cve', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['collection', 'stats'] });
      
      // Show success message
      if (data.success) {
        console.log(`✅ Imported ${data.data.imported} recent CVEs`);
      }
    },
    onError: (error: any) => {
      console.error('❌ CVE import failed:', error);
    },
  });
};

// ===== UTILITY HOOKS =====

/**
 * 📊 Get CVE summary (computed data)
 */
export const useCVESummary = () => {
  const { data: stats } = useCVEStats();
  const { data: severityDist } = useCVESeverityDistribution();

  return {
    totalCVEs: stats?.data?.totalCVEs || 0,
    cvesLast24h: stats?.data?.cvesLast24h || 0,
    cvesLast7d: stats?.data?.cvesLast7d || 0,
    cvesLast30d: stats?.data?.cvesLast30d || 0,
    cvesBySeverity: stats?.data?.cvesBySeverity || [],
    cvesByYear: stats?.data?.cvesByYear || [],
    enrichedCVEs: stats?.data?.enrichedCVEs || 0,
    enrichmentRate: stats?.data?.enrichmentRate || 0,
    lastImport: stats?.data?.lastImport,
    lastEnrichment: stats?.data?.lastEnrichment,
    severityDistribution: severityDist?.data || [],
  };
};

/**
 * 🔄 Auto-refresh CVE data
 */
export const useCVEAutoRefresh = (enabled = true) => {
  const statsQuery = useCVEStats();
  const trendsQuery = useCVETrends();

  return {
    stats: statsQuery,
    trends: trendsQuery,
    isRefreshing: statsQuery.isFetching || trendsQuery.isFetching,
  };
};

/**
 * 🎯 Get CVEs by severity
 */
export const useCVEsBySeverity = (severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
  return useQuery({
    queryKey: ['cve', 'by-severity', severity],
    queryFn: () => cveService.searchCVEs({ severity }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
