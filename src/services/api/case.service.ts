import { apiClient } from '../../lib/api-client';

export interface CreateCaseData {
  title: string;
  description: string;
  severity: string;
  priority: string;
  alertIds?: string[];
  threatIds?: string[];
  assignedTo?: string;
}

export interface UpdateCaseData {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  priority?: string;
  assignedTo?: string;
  closureNotes?: string;
}

export interface InvestigationNoteData {
  content: string;
  noteType?: 'OBSERVATION' | 'FINDING' | 'ACTION' | 'CONCLUSION';
}

export const caseService = {
  /**
   * Créer un nouveau case
   */
  async createCase(data: CreateCaseData) {
    const response = await apiClient.post('/cases', data);
    return response.data;
  },

  /**
   * Récupérer tous les cases
   */
  async getCases(filters?: {
    status?: string;
    severity?: string;
    assignedTo?: string;
  }) {
    const response = await apiClient.get('/cases', { params: filters });
    return response.data;
  },

  /**
   * Récupérer un case spécifique
   */
  async getCaseById(caseId: string) {
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
  },

  /**
   * Mettre à jour un case
   */
  async updateCase(caseId: string, data: UpdateCaseData) {
    const response = await apiClient.patch(`/cases/${caseId}`, data);
    return response.data;
  },

  /**
   * Ajouter une note d'investigation
   */
  async addInvestigationNote(caseId: string, data: InvestigationNoteData) {
    const response = await apiClient.post(`/cases/${caseId}/notes`, data);
    return response.data;
  },

  /**
   * Fermer un case
   */
  async closeCase(caseId: string, closureNotes: string) {
    const response = await apiClient.post(`/cases/${caseId}/close`, { closureNotes });
    return response.data;
  },

  /**
   * Récupérer les statistiques
   */
  async getCaseStats(analystId?: string) {
    const response = await apiClient.get('/cases/stats', {
      params: { analystId },
    });
    return response.data;
  },
};


