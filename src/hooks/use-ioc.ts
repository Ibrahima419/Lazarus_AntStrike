import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iocService, IOCEnrichmentData } from '../services/api/ioc.service';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les IOCs enrichis
 */
export function useEnrichedIOCs(filters?: {
  iocType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['iocs', filters],
    queryFn: () => iocService.getEnrichedIOCs(filters),
  });
}

/**
 * Hook pour enrichir un IOC
 */
export function useEnrichIOC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IOCEnrichmentData) => iocService.enrichIOC(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iocs'] });
      toast.success('✅ IOC enrichi avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Enrichissement impossible'}`);
    },
  });
}

/**
 * Hook pour extraire les IOCs depuis un texte
 */
export function useExtractIOCs() {
  return useMutation({
    mutationFn: (text: string) => iocService.extractIOCs(text),
    onSuccess: () => {
      toast.success('✅ IOCs extraits avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Extraction impossible'}`);
    },
  });
}

/**
 * Hook pour enrichir plusieurs IOCs en masse
 */
export function useBulkEnrichIOCs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (iocs: IOCEnrichmentData[]) => iocService.bulkEnrichIOCs(iocs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iocs'] });
      toast.success('✅ IOCs enrichis en masse');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Enrichissement masse impossible'}`);
    },
  });
}


