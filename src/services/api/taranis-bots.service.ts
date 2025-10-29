import { apiClient } from '../../lib/api-client';

/**
 * Service pour interagir avec les Taranis AI Bots
 * Fournit des fonctionnalités avancées de Threat Intelligence
 */
export const taranisBots = {
  /**
   * Extraire les IOCs depuis un texte avec Taranis AI Bot
   */
  async extractIOCs(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/ioc-extraction`);
      return response.data;
    } catch (error) {
      console.error('Erreur extraction IOCs:', error);
      return { data: { iocs: [] } };
    }
  },

  /**
   * Analyser le sentiment d'une story avec Taranis AI Bot
   */
  async analyzeSentiment(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/sentiment`);
      return response.data;
    } catch (error) {
      console.error('Erreur analyse sentiment:', error);
      return { data: { sentiment: 'neutral', score: 0 } };
    }
  },

  /**
   * Obtenir les tags NLP suggérés par Taranis AI Bot
   */
  async getNLPTags(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/nlp-tags`);
      return response.data;
    } catch (error) {
      console.error('Erreur tags NLP:', error);
      return { data: { tags: [] } };
    }
  },

  /**
   * Obtenir le clustering des menaces similaires
   */
  async getCluster(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/clustering`);
      return response.data;
    } catch (error) {
      console.error('Erreur clustering:', error);
      return { data: { cluster: null } };
    }
  },

  /**
   * Générer un résumé automatique de la story
   */
  async generateSummary(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/summary`);
      return response.data;
    } catch (error) {
      console.error('Erreur génération résumé:', error);
      return { data: { summary: '' } };
    }
  },

  /**
   * Classifier la menace selon les catégories cybersec
   */
  async classifyThreat(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/bots/classification`);
      return response.data;
    } catch (error) {
      console.error('Erreur classification:', error);
      return { data: { category: 'Unknown', confidence: 0 } };
    }
  },

  /**
   * Obtenir les attributs Taranis (MITRE ATT&CK, CVE, etc.)
   */
  async getAttributes(storyId: string) {
    try {
      const response = await apiClient.get(`/taranis/stories/${storyId}/attributes`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération attributs:', error);
      return { data: { attributes: [] } };
    }
  },

  /**
   * Obtenir les trending clusters du dashboard Taranis
   */
  async getTrendingClusters() {
    try {
      const response = await apiClient.get('/taranis/dashboard/trending-clusters');
      return response.data;
    } catch (error) {
      console.error('Erreur trending clusters:', error);
      return { data: { clusters: [] } };
    }
  },

  /**
   * Analyse complète d'une story avec tous les bots
   */
  async analyzeStory(storyId: string) {
    try {
      const [iocs, sentiment, nlpTags, cluster, summary, classification, attributes] = await Promise.all([
        this.extractIOCs(storyId),
        this.analyzeSentiment(storyId),
        this.getNLPTags(storyId),
        this.getCluster(storyId),
        this.generateSummary(storyId),
        this.classifyThreat(storyId),
        this.getAttributes(storyId),
      ]);

      return {
        iocs: iocs.data,
        sentiment: sentiment.data,
        nlpTags: nlpTags.data,
        cluster: cluster.data,
        summary: summary.data,
        classification: classification.data,
        attributes: attributes.data,
      };
    } catch (error) {
      console.error('Erreur analyse complète:', error);
      return null;
    }
  },
};


