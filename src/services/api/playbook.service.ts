import { apiClient } from '../../lib/api-client';

export interface CreatePlaybookData {
  name: string;
  description: string;
  triggerConditions: any;
  actions: any[];
  enabled?: boolean;
}

export interface UpdatePlaybookData {
  name?: string;
  description?: string;
  triggerConditions?: any;
  actions?: any[];
  enabled?: boolean;
}

export const playbookService = {
  /**
   * Créer un nouveau playbook
   */
  async createPlaybook(data: CreatePlaybookData) {
    const response = await apiClient.post('/playbooks', data);
    return response.data;
  },

  /**
   * Récupérer tous les playbooks
   */
  async getPlaybooks(onlyEnabled = false) {
    const response = await apiClient.get('/playbooks', {
      params: { onlyEnabled },
    });
    return response.data;
  },

  /**
   * Récupérer un playbook spécifique
   */
  async getPlaybookById(playbookId: string) {
    const response = await apiClient.get(`/playbooks/${playbookId}`);
    return response.data;
  },

  /**
   * Mettre à jour un playbook
   */
  async updatePlaybook(playbookId: string, data: UpdatePlaybookData) {
    const response = await apiClient.patch(`/playbooks/${playbookId}`, data);
    return response.data;
  },

  /**
   * Activer/désactiver un playbook
   */
  async togglePlaybook(playbookId: string, enabled: boolean) {
    const response = await apiClient.post(`/playbooks/${playbookId}/toggle`, { enabled });
    return response.data;
  },

  /**
   * Supprimer un playbook
   */
  async deletePlaybook(playbookId: string) {
    const response = await apiClient.delete(`/playbooks/${playbookId}`);
    return response.data;
  },

  /**
   * Exécuter un playbook
   */
  async executePlaybook(playbookId: string, context?: any) {
    const response = await apiClient.post(`/playbooks/${playbookId}/execute`, { context });
    return response.data;
  },
};


