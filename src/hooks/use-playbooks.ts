import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playbookService, CreatePlaybookData, UpdatePlaybookData } from '../services/api/playbook.service';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les playbooks
 */
export function usePlaybooks(onlyEnabled = false) {
  return useQuery({
    queryKey: ['playbooks', { onlyEnabled }],
    queryFn: () => playbookService.getPlaybooks(onlyEnabled),
  });
}

/**
 * Hook pour récupérer un playbook spécifique
 */
export function usePlaybook(playbookId: string | null) {
  return useQuery({
    queryKey: ['playbooks', playbookId],
    queryFn: () => playbookService.getPlaybookById(playbookId!),
    enabled: !!playbookId,
  });
}

/**
 * Hook pour créer un playbook
 */
export function useCreatePlaybook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlaybookData) => playbookService.createPlaybook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('✅ Playbook créé avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Création impossible'}`);
    },
  });
}

/**
 * Hook pour mettre à jour un playbook
 */
export function useUpdatePlaybook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playbookId, data }: { playbookId: string; data: UpdatePlaybookData }) =>
      playbookService.updatePlaybook(playbookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', variables.playbookId] });
      toast.success('✅ Playbook mis à jour');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Mise à jour impossible'}`);
    },
  });
}

/**
 * Hook pour activer/désactiver un playbook
 */
export function useTogglePlaybook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playbookId, enabled }: { playbookId: string; enabled: boolean }) =>
      playbookService.togglePlaybook(playbookId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('✅ Playbook mis à jour');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Toggle impossible'}`);
    },
  });
}

/**
 * Hook pour supprimer un playbook
 */
export function useDeletePlaybook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playbookId: string) => playbookService.deletePlaybook(playbookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('✅ Playbook supprimé');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Suppression impossible'}`);
    },
  });
}

/**
 * Hook pour exécuter un playbook
 */
export function useExecutePlaybook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playbookId, context }: { playbookId: string; context?: any }) =>
      playbookService.executePlaybook(playbookId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('✅ Playbook exécuté avec succès');
    },
    onError: (error: any) => {
      toast.error(`❌ Erreur: ${error.response?.data?.error || 'Exécution impossible'}`);
    },
  });
}


