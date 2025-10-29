/**
 * 🔄 Taranis API Proxy Service
 * Proxy intelligent avec filtering par tenant
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';

const TARANIS_API_URL = process.env.TARANIS_API_URL || 'http://localhost:8080';
const TARANIS_ADMIN_USER = process.env.TARANIS_ADMIN_USER || 'admin';
const TARANIS_ADMIN_PASS = process.env.TARANIS_ADMIN_PASS || 'admin';

export class TaranisProxyService {
  private static client: AxiosInstance;
  private static token: string | null = null;

  /**
   * Obtenir token Taranis
   */
  private static async getToken(): Promise<string> {
    if (this.token) {
      return this.token as string;
    }

    try {
      const response = await axios.post(`${TARANIS_API_URL}/api/auth/login`, {
        username: TARANIS_ADMIN_USER,
        password: TARANIS_ADMIN_PASS
      });

      this.token = response.data.access_token;
      logger.info('Taranis token obtained');
      return this.token as string;
    } catch (error: any) {
      logger.error('Failed to get Taranis token', { error: error.message });
      throw new InternalServerError('Failed to authenticate with Taranis');
    }
  }

  /**
   * Initialiser client Taranis
   */
  static async getClient(): Promise<AxiosInstance> {
    const token = await this.getToken();

    if (!this.client) {
      this.client = axios.create({
        baseURL: `${TARANIS_API_URL}/api`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000
      });

      // Log requests
      this.client.interceptors.request.use((config) => {
        logger.debug('Taranis Request', {
          method: config.method,
          url: config.url
        });
        return config;
      });

      // Log responses
      this.client.interceptors.response.use(
        (response) => {
          logger.debug('Taranis Response', {
            status: response.status,
            url: response.config.url
          });
          return response;
        },
        (error) => {
          logger.error('Taranis Error', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url
          });
          return Promise.reject(error);
        }
      );
    } else {
      // Update Authorization header with fresh token
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return this.client;
  }

  /**
   * Get Stories avec filtering tenant
   */
  static async getStories(tenantId: string, filters?: any) {
    try {
      const client = await this.getClient();
      
      // TODO: Mapper tenantId → taranisOrgId pour filtering
      const response = await client.get('/assess/stories', {
        params: {
          limit: filters?.limit || 100,
          offset: filters?.offset || 0,
          ...filters
        }
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error fetching stories', { error: error.message });
      throw new InternalServerError('Failed to fetch stories from Taranis');
    }
  }

  /**
   * Get Story détails
   */
  static async getStory(storyId: string) {
    try {
      const client = await this.getClient();
      const response = await client.get(`/assess/story/${storyId}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching story', { storyId, error: error.message });
      throw new InternalServerError('Failed to fetch story');
    }
  }

  /**
   * Get News Items
   */
  static async getNewsItems(filters?: any) {
    try {
      const client = await this.getClient();
      const response = await client.get('/assess/news-items', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching news items', { error: error.message });
      throw new InternalServerError('Failed to fetch news items');
    }
  }

  /**
   * Get OSINT Sources
   */
  static async getSources() {
    try {
      const client = await this.getClient();
      const response = await client.get('/config/osint-sources');
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching sources', { error: error.message });
      throw new InternalServerError('Failed to fetch sources');
    }
  }

  /**
   * Get Assets
   */
  static async getAssets(tenantId: string) {
    try {
      const client = await this.getClient();
      
      // TODO: Filter par tenant
      const response = await client.get('/assets');
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching assets', { error: error.message });
      throw new InternalServerError('Failed to fetch assets');
    }
  }

  /**
   * Get Product Types
   */
  static async getProductTypes() {
    try {
      const client = await this.getClient();
      const response = await client.get('/config/product-types');
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching product types', { error: error.message });
      throw new InternalServerError('Failed to fetch product types');
    }
  }

  /**
   * Generate Report
   */
  static async generateReport(productTypeId: string, data: any) {
    try {
      const client = await this.getClient();
      const response = await client.post(`/publish/products/${productTypeId}`, data);
      return response.data;
    } catch (error: any) {
      logger.error('Error generating report', { error: error.message });
      throw new InternalServerError('Failed to generate report');
    }
  }

  /**
   * Create Story
   */
  static async createStory(data: any) {
    try {
      const client = await this.getClient();
      const response = await client.post('/assess/stories', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating story', { error: error.message });
      throw new InternalServerError('Failed to create story');
    }
  }

  /**
   * Update Story
   */
  static async updateStory(storyId: string, data: any) {
    try {
      const client = await this.getClient();
      const response = await client.put(`/assess/story/${storyId}`, data);
      return response.data;
    } catch (error: any) {
      logger.error('Error updating story', { error: error.message });
      throw new InternalServerError('Failed to update story');
    }
  }

  /**
   * Get Bot Presets (IOC, NLP, etc.)
   */
  static async getBotPresets() {
    try {
      const client = await this.getClient();
      const response = await client.get('/config/bots');
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching bot presets', { error: error.message });
      throw new InternalServerError('Failed to fetch bot presets');
    }
  }

  /**
   * Run Bot on Story
   */
  static async runBot(storyId: string, botId: string) {
    try {
      const client = await this.getClient();
      const response = await client.post(`/assess/stories/botactions`, {
        bot_id: botId,
        story_id: storyId
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error running bot', { error: error.message });
      throw new InternalServerError('Failed to run bot');
    }
  }

  /**
   * Search Stories (semantic search)
   */
  static async searchStories(query: string, filters?: any) {
    try {
      const client = await this.getClient();
      const response = await client.get('/assess/stories', {
        params: { search: query, ...filters }
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error searching stories', { error: error.message });
      throw new InternalServerError('Failed to search stories');
    }
  }
}



