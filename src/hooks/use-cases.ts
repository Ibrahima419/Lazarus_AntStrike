import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseService, CreateCaseData, UpdateCaseData, InvestigationNoteData } from '../services/api/case.service';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les cases
 */
export function useCases(filters?: {
  status?: string;
  severity?: string;
  assignedTo?: string;
}) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => caseService.getCases(filters),
  });
}

/**
 * Hook pour récupérer un case spécifique
 */
export function useCase(caseId: string | null) {
  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: () => caseService.getCaseById(caseId!),
    enabled: !!caseId,
  });
}

/**
 * Hook pour récupérer les statistiques des cases
 */
export function useCaseStats(analystId?: string) {
  return useQuery({
    queryKey: ['cases', 'stats', analystId],
    queryFn: () => caseService.getCaseStats(analystId),
  });
}

/**
 * Hook pour créer un case
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseData) => caseService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('✅ Case créé avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Création du case impossible'}`);
    },
  });
}

/**
 * Hook pour mettre à jour un case
 */
export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: UpdateCaseData }) =>
      caseService.updateCase(caseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] });
      toast.success('✅ Case mis à jour');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Mise à jour impossible'}`);
    },
  });
}

/**
 * Hook pour ajouter une note d'investigation
 */
export function useAddInvestigationNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: InvestigationNoteData }) =>
      caseService.addInvestigationNote(caseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] });
      toast.success('✅ Note ajoutée');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Ajout de note impossible'}`);
    },
  });
}

/**
 * Hook pour fermer un case
 */
export function useCloseCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, closureNotes }: { caseId: string; closureNotes: string }) =>
      caseService.closeCase(caseId, closureNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] });
      toast.success('✅ Case fermé avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Fermeture impossible'}`);
    },
  });
}


