import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { correlationService, CorrelationRule } from '../services/api/correlation.service';
import { toast } from 'sonner';

/**
 * Hook pour récupérer les corrélations d'une menace
 */
export function useThreatCorrelations(threatId: string | null) {
  return useQuery({
    queryKey: ['correlations', threatId],
    queryFn: () => correlationService.getThreatCorrelations(threatId!),
    enabled: !!threatId,
  });
}

/**
 * Hook pour analyser les campagnes de menaces
 */
export function useThreatCampaigns(minClusterSize?: number) {
  return useQuery({
    queryKey: ['campaigns', { minClusterSize }],
    queryFn: () => correlationService.analyzeCampaigns(minClusterSize),
  });
}

/**
 * Hook pour récupérer les statistiques de corrélation
 */
export function useCorrelationStats() {
  return useQuery({
    queryKey: ['correlations', 'stats'],
    queryFn: () => correlationService.getCorrelationStats(),
  });
}

/**
 * Hook pour corréler une menace
 */
export function useCorrelateThreat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threatId, rule }: { threatId: string; rule?: CorrelationRule }) =>
      correlationService.correlateThreat(threatId, rule),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correlations'] });
      queryClient.invalidateQueries({ queryKey: ['correlations', variables.threatId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('✅ Corrélation effectuée');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Corrélation impossible'}`);
    },
  });
}


