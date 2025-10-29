import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsService, MetricsPeriod } from '../services/api/metrics.service';
import { toast } from 'sonner';

/**
 * Hook pour récupérer les métriques d'un analyste
 */
export function useAnalystMetrics(userId: string, period?: MetricsPeriod) {
  return useQuery({
    queryKey: ['metrics', 'analyst', userId, period],
    queryFn: () => metricsService.getAnalystMetrics(userId, period),
    enabled: !!userId,
  });
}

/**
 * Hook pour récupérer les métriques agrégées d'un analyste
 */
export function useAggregatedMetrics(userId: string, period?: MetricsPeriod) {
  return useQuery({
    queryKey: ['metrics', 'aggregated', userId, period],
    queryFn: () => metricsService.getAggregatedMetrics(userId, period),
    enabled: !!userId,
  });
}

/**
 * Hook pour récupérer les métriques d'équipe
 */
export function useTeamMetrics(period?: MetricsPeriod) {
  return useQuery({
    queryKey: ['metrics', 'team', period],
    queryFn: () => metricsService.getTeamMetrics(period),
  });
}

/**
 * Hook pour comparer les analystes
 */
export function useCompareAnalysts(period?: MetricsPeriod) {
  return useQuery({
    queryKey: ['metrics', 'compare', period],
    queryFn: () => metricsService.compareAnalysts(period),
  });
}

/**
 * Hook pour mettre à jour les métriques quotidiennes
 */
export function useUpdateDailyMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, date }: { userId: string; date?: string }) =>
      metricsService.updateDailyMetrics(userId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('✅ Métriques mises à jour');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Mise à jour impossible'}`);
    },
  });
}


