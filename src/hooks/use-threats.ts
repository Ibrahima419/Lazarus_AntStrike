/**
 * 🎯 useThreats - React Query hook for threats
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatService, type ThreatFilters } from '../services/api/threat.service';

export const useThreats = (filters?: ThreatFilters) => {
  return useQuery({
    queryKey: ['threats', filters],
    queryFn: () => threatService.getThreats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute (real-time)
  });
};

export const useThreat = (id: string) => {
  return useQuery({
    queryKey: ['threat', id],
    queryFn: () => threatService.getThreat(id),
    enabled: !!id,
  });
};

export const useSearchThreats = (query: string, filters?: ThreatFilters) => {
  return useQuery({
    queryKey: ['threats', 'search', query, filters],
    queryFn: () => threatService.searchThreats(query, filters),
    enabled: !!query,
  });
};

export const useUpdateThreat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      threatService.updateThreat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};

