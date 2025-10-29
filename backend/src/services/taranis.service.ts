/**
 * 🌐 TARANIS AI SERVICE - ENDPOINTS RÉELS
 * Service complet avec TOUS les endpoints réels de Taranis AI
 * Basé sur la documentation officielle complète
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

const TARANIS_API_URL = process.env.TARANIS_API_URL || 'http://localhost:8080';
const TARANIS_USERNAME = process.env.TARANIS_USERNAME || 'admin';
const TARANIS_PASSWORD = process.env.TARANIS_PASSWORD || 'admin';

export class TaranisService {
  private static client: AxiosInstance | null = null;
  private static token: string | null = null;
  private static tokenExpiry: Date | null = null;

  /**
   * Obtenir le token JWT
   */
  private static async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${TARANIS_API_URL}/api/auth/login`, {
        username: TARANIS_USERNAME,
        password: TARANIS_PASSWORD
      });

      this.token = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55min

      logger.info('✅ Taranis token obtained');
      return this.token as string;
    } catch (error: any) {
      logger.error('❌ Failed to get Taranis token', { 
        status: error.response?.status,
        message: error.message 
      });
      throw new Error('Taranis authentication failed');
    }
  }

  /**
   * Obtenir le client Axios configuré
   */
  private static async getClient(): Promise<AxiosInstance> {
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

      // Interceptor pour refresh token
      this.client.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401) {
            logger.warn('⚠️ Token expired, refreshing...');
            this.token = null;
            const newToken = await this.getToken();
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            return axios.request(error.config);
          }
          return Promise.reject(error);
        }
      );
    } else {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return this.client;
  }

  // ========================================
  // 1. AUTHENTIFICATION
  // ========================================

  static async login(username: string, password: string) {
    const response = await axios.post(`${TARANIS_API_URL}/api/auth/login`, {
      username,
      password
    });
    return response.data;
  }

  static async refreshToken() {
    const client = await this.getClient();
    return (await client.get('/auth/refresh')).data;
  }

  static async logout() {
    const client = await this.getClient();
    return (await client.delete('/auth/logout')).data;
  }

  static async getAuthMethod() {
    const response = await axios.get(`${TARANIS_API_URL}/api/auth/method`);
    return response.data;
  }

  // ========================================
  // 2. UTILISATEURS
  // ========================================

  static async getCurrentUser() {
    const client = await this.getClient();
    return (await client.get('/users/')).data;
  }

  static async getUserProfile() {
    const client = await this.getClient();
    return (await client.get('/users/profile')).data;
  }

  static async updateUserProfile(profile: any) {
    const client = await this.getClient();
    return (await client.put('/users/profile', profile)).data;
  }

  static async notifySSEConnected() {
    const client = await this.getClient();
    return (await client.post('/users/sse-connected')).data;
  }

  // ========================================
  // 3. DASHBOARD
  // ========================================

  static async getDashboard() {
    const client = await this.getClient();
    return (await client.get('/dashboard')).data;
  }

  static async getTrendingClusters(params?: { days?: number; legacy?: boolean }) {
    const client = await this.getClient();
    return (await client.get('/dashboard/trending-clusters', { params })).data;
  }

  static async getStoryClusters(params?: { days?: number; limit?: number }) {
    const client = await this.getClient();
    return (await client.get('/dashboard/story-clusters', { params })).data;
  }

  static async getClusterByType(tagType: string, params?: {
    per_page?: number;
    page?: number;
    sort_by?: string;
    search?: string;
  }) {
    const client = await this.getClient();
    return (await client.get(`/dashboard/cluster/${tagType}`, { params })).data;
  }

  static async deleteTag(tagName: string) {
    const client = await this.getClient();
    return (await client.delete(`/dashboard/delete-tag/${tagName}`)).data;
  }

  static async getBuildInfo() {
    const client = await this.getClient();
    return (await client.get('/dashboard/build-info')).data;
  }

  // ========================================
  // 4. ASSESS - STORIES
  // ========================================

  static async getStories(params?: {
    search?: string;
    read?: boolean;
    unread?: boolean;
    important?: boolean;
    cybersecurity?: boolean;
    relevant?: boolean;
    in_report?: boolean;
    range?: string;
    sort?: string;
    timefrom?: string;
    timeto?: string;
    limit?: number;
    offset?: number;
    page?: number;
    no_count?: boolean;
    exclude_attr?: boolean;
    source?: string[];
    group?: string[];
    tags?: string[];
  }) {
    const client = await this.getClient();
    return (await client.get('/assess/stories', { params })).data;
  }

  static async getStory(storyId: string) {
    const client = await this.getClient();
    return (await client.get(`/assess/story/${storyId}`)).data;
  }

  static async updateStory(storyId: string, data: {
    title?: string;
    description?: string;
    read?: boolean;
    important?: boolean;
    relevance?: number;
    comments?: string;
    summary?: string;
    links?: string[];
    attributes?: any[];
  }) {
    const client = await this.getClient();
    return (await client.put(`/assess/story/${storyId}`, data)).data;
  }

  static async deleteStory(storyId: string) {
    const client = await this.getClient();
    return (await client.delete(`/assess/story/${storyId}`)).data;
  }

  static async shareStory(connectorId: string, storyIds: string[]) {
    const client = await this.getClient();
    return (await client.post(`/assess/story/${connectorId}/share`, { story_ids: storyIds })).data;
  }

  // ========================================
  // 4.2 ASSESS - NEWS ITEMS
  // ========================================

  static async getNewsItems(params?: {
    search?: string;
    read?: boolean;
    important?: boolean;
    relevant?: boolean;
    in_analyze?: boolean;
    range?: string;
    sort?: string;
    limit?: number;
    offset?: number;
    page?: number;
  }) {
    const client = await this.getClient();
    return (await client.get('/assess/news-items', { params })).data;
  }

  static async getNewsItem(itemId: string) {
    const client = await this.getClient();
    return (await client.get(`/assess/news-items/${itemId}`)).data;
  }

  static async createNewsItem(data: {
    title: string;
    content: string;
    review?: string;
    author?: string;
    link?: string;
    published?: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/assess/news-items', data)).data;
  }

  static async updateNewsItem(itemId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/assess/news-items/${itemId}`, data)).data;
  }

  static async deleteNewsItem(itemId: string) {
    const client = await this.getClient();
    return (await client.delete(`/assess/news-items/${itemId}`)).data;
  }

  static async updateNewsItemAttributes(itemId: string, attributes: Array<{ key: string; value: string }>) {
    const client = await this.getClient();
    return (await client.put(`/assess/news-items/${itemId}/attributes`, attributes)).data;
  }

  // ========================================
  // 4.3 ASSESS - GROUPEMENT
  // ========================================

  static async groupStories(storyIds: string[]) {
    const client = await this.getClient();
    return (await client.put('/assess/stories/group', storyIds)).data;
  }

  static async ungroupStories(storyIds: string[]) {
    const client = await this.getClient();
    return (await client.put('/assess/stories/ungroup', storyIds)).data;
  }

  static async ungroupNewsItems(newsItemIds: string[]) {
    const client = await this.getClient();
    return (await client.put('/assess/news-items/ungroup', newsItemIds)).data;
  }

  static async executeBotAction(botId: string, storyId: string) {
    const client = await this.getClient();
    return (await client.post('/assess/stories/botactions', { bot_id: botId, story_id: storyId })).data;
  }

  // ========================================
  // 4.4 ASSESS - SOURCES & TAGS
  // ========================================

  static async getOSINTSourceGroups() {
    const client = await this.getClient();
    return (await client.get('/assess/osint-source-group-list')).data;
  }

  static async getOSINTSourcesList() {
    const client = await this.getClient();
    return (await client.get('/assess/osint-sources-list')).data;
  }

  static async getTags(params?: {
    search?: string;
    limit?: number;
    offset?: number;
    min_size?: number;
  }) {
    const client = await this.getClient();
    return (await client.get('/assess/tags', { params })).data;
  }

  static async getTagList(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const client = await this.getClient();
    return (await client.get('/assess/taglist', { params })).data;
  }

  static async getConnectorProposals() {
    const client = await this.getClient();
    return (await client.get('/assess/connectors/proposals')).data;
  }

  // ========================================
  // 5. ANALYZE - REPORT ITEMS
  // ========================================

  static async getReportItems(params?: {
    search?: string;
    completed?: boolean;
    range?: string;
    sort?: string;
    group?: string;
    offset?: number;
    limit?: number;
  }) {
    const client = await this.getClient();
    return (await client.get('/analyze/report-items', { params })).data;
  }

  static async getReportItem(reportItemId: string) {
    const client = await this.getClient();
    return (await client.get(`/analyze/report-items/${reportItemId}`)).data;
  }

  static async createReportItem(data: {
    title: string;
    report_item_type_id: number;
    stories?: string[];
    attributes?: any[];
    completed?: boolean;
  }) {
    const client = await this.getClient();
    return (await client.post('/analyze/report-items', data)).data;
  }

  static async updateReportItem(reportItemId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/analyze/report-items/${reportItemId}`, data)).data;
  }

  static async deleteReportItem(reportItemId: string) {
    const client = await this.getClient();
    return (await client.delete(`/analyze/report-items/${reportItemId}`)).data;
  }

  static async cloneReportItem(reportItemId: string) {
    const client = await this.getClient();
    return (await client.post(`/analyze/report-items/${reportItemId}/clone`)).data;
  }

  static async getReportItemStories(reportItemId: string) {
    const client = await this.getClient();
    return (await client.get(`/analyze/report-items/${reportItemId}/stories`)).data;
  }

  static async setReportItemStories(reportItemId: string, storyIds: string[]) {
    const client = await this.getClient();
    return (await client.put(`/analyze/report-items/${reportItemId}/stories`, storyIds)).data;
  }

  static async addReportItemStories(reportItemId: string, storyIds: string[]) {
    const client = await this.getClient();
    return (await client.post(`/analyze/report-items/${reportItemId}/stories`, storyIds)).data;
  }

  // ========================================
  // 5.2 ANALYZE - LOCKS
  // ========================================

  static async getReportItemLock(reportItemId: string) {
    const client = await this.getClient();
    return (await client.get(`/analyze/report-items/${reportItemId}/locks`)).data;
  }

  static async lockReportItem(reportItemId: string) {
    const client = await this.getClient();
    return (await client.put(`/analyze/report-items/${reportItemId}/lock`)).data;
  }

  static async unlockReportItem(reportItemId: string) {
    const client = await this.getClient();
    return (await client.delete(`/analyze/report-items/${reportItemId}/lock`)).data;
  }

  // ========================================
  // 5.3 ANALYZE - REPORT TYPES
  // ========================================

  static async getReportTypes() {
    const client = await this.getClient();
    return (await client.get('/analyze/report-types')).data;
  }

  // ========================================
  // 6. PUBLISH - PRODUCTS
  // ========================================

  static async getProducts(params?: {
    search?: string;
    range?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    const client = await this.getClient();
    return (await client.get('/publish/products', { params })).data;
  }

  static async getProduct(productId: string) {
    const client = await this.getClient();
    return (await client.get(`/publish/products/${productId}`)).data;
  }

  static async createProduct(data: {
    title: string;
    description?: string;
    product_type_id: number;
    report_items?: string[];
  }) {
    const client = await this.getClient();
    return (await client.post('/publish/products', data)).data;
  }

  static async updateProduct(productId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/publish/products/${productId}`, data)).data;
  }

  static async deleteProduct(productId: string) {
    const client = await this.getClient();
    return (await client.delete(`/publish/products/${productId}`)).data;
  }

  static async getProductRender(productId: string) {
    const client = await this.getClient();
    return (await client.get(`/publish/products/${productId}/render`)).data;
  }

  static async renderProduct(productId: string) {
    const client = await this.getClient();
    return (await client.post(`/publish/products/${productId}/render`)).data;
  }

  static async publishProduct(productId: string, publisherId: string) {
    const client = await this.getClient();
    return (await client.post(`/publish/products/${productId}/publishers/${publisherId}`)).data;
  }

  static async getProductTypes() {
    const client = await this.getClient();
    return (await client.get('/publish/product-types')).data;
  }

  // ========================================
  // 7. CONFIG - USERS & ROLES
  // ========================================

  static async getUsers(params?: { search?: string }) {
    const client = await this.getClient();
    return (await client.get('/config/users', { params })).data;
  }

  static async getUser(userId: number) {
    const client = await this.getClient();
    return (await client.get(`/config/users/${userId}`)).data;
  }

  static async createUser(data: {
    username: string;
    name: string;
    password: string;
    organization_id: number;
    roles: number[];
  }) {
    const client = await this.getClient();
    return (await client.post('/config/users', data)).data;
  }

  static async updateUser(userId: number, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/users/${userId}`, data)).data;
  }

  static async deleteUser(userId: number) {
    const client = await this.getClient();
    return (await client.delete(`/config/users/${userId}`)).data;
  }

  static async getRoles(params?: { search?: string }) {
    const client = await this.getClient();
    return (await client.get('/config/roles', { params })).data;
  }

  static async getRole(roleId: number) {
    const client = await this.getClient();
    return (await client.get(`/config/roles/${roleId}`)).data;
  }

  static async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
  }) {
    const client = await this.getClient();
    return (await client.post('/config/roles', data)).data;
  }

  static async updateRole(roleId: number, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/roles/${roleId}`, data)).data;
  }

  static async deleteRole(roleId: number) {
    const client = await this.getClient();
    return (await client.delete(`/config/roles/${roleId}`)).data;
  }

  static async getPermissions() {
    const client = await this.getClient();
    return (await client.get('/config/permissions')).data;
  }

  // ========================================
  // 7.2 CONFIG - ORGANIZATIONS
  // ========================================

  static async getOrganizations(params?: { search?: string }) {
    const client = await this.getClient();
    return (await client.get('/config/organizations', { params })).data;
  }

  static async getOrganization(orgId: number) {
    const client = await this.getClient();
    return (await client.get(`/config/organizations/${orgId}`)).data;
  }

  static async createOrganization(data: {
    name: string;
    description?: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/config/organizations', data)).data;
  }

  static async updateOrganization(orgId: number, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/organizations/${orgId}`, data)).data;
  }

  static async deleteOrganization(orgId: number) {
    const client = await this.getClient();
    return (await client.delete(`/config/organizations/${orgId}`)).data;
  }

  // ========================================
  // 7.3 CONFIG - OSINT SOURCES
  // ========================================

  static async getOSINTSources(params?: { search?: string }) {
    const client = await this.getClient();
    return (await client.get('/config/osint-sources', { params })).data;
  }

  static async getOSINTSource(sourceId: string) {
    const client = await this.getClient();
    return (await client.get(`/config/osint-sources/${sourceId}`)).data;
  }

  static async createOSINTSource(data: {
    name: string;
    description?: string;
    type: string;
    parameters: any;
    osint_source_group_id?: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/config/osint-sources', data)).data;
  }

  static async updateOSINTSource(sourceId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/osint-sources/${sourceId}`, data)).data;
  }

  static async toggleOSINTSource(sourceId: string, state: 'enabled' | 'disabled') {
    const client = await this.getClient();
    return (await client.patch(`/config/osint-sources/${sourceId}`, { state })).data;
  }

  static async deleteOSINTSource(sourceId: string, force?: boolean) {
    const client = await this.getClient();
    return (await client.delete(`/config/osint-sources/${sourceId}`, { params: { force } })).data;
  }

  static async collectOSINTSource(sourceId: string) {
    const client = await this.getClient();
    return (await client.post(`/config/osint-sources/${sourceId}/collect`)).data;
  }

  static async collectAllOSINTSources() {
    const client = await this.getClient();
    return (await client.post('/config/osint-sources/collect')).data;
  }

  static async previewOSINTSource(sourceId: string) {
    const client = await this.getClient();
    return (await client.get(`/config/osint-sources/${sourceId}/preview`)).data;
  }

  // ========================================
  // 7.4 CONFIG - OSINT SOURCE GROUPS
  // ========================================

  static async getOSINTSourceGroupsConfig() {
    const client = await this.getClient();
    return (await client.get('/config/osint-source-groups')).data;
  }

  static async getOSINTSourceGroup(groupId: string) {
    const client = await this.getClient();
    return (await client.get(`/config/osint-source-groups/${groupId}`)).data;
  }

  static async createOSINTSourceGroup(data: {
    name: string;
    description?: string;
    default?: boolean;
  }) {
    const client = await this.getClient();
    return (await client.post('/config/osint-source-groups', data)).data;
  }

  static async updateOSINTSourceGroup(groupId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/osint-source-groups/${groupId}`, data)).data;
  }

  static async deleteOSINTSourceGroup(groupId: string) {
    const client = await this.getClient();
    return (await client.delete(`/config/osint-source-groups/${groupId}`)).data;
  }

  // ========================================
  // 7.5 CONFIG - BOTS
  // ========================================

  static async getBots() {
    const client = await this.getClient();
    return (await client.get('/config/bots')).data;
  }

  static async getBot(botId: string) {
    const client = await this.getClient();
    return (await client.get(`/config/bots/${botId}`)).data;
  }

  static async createBot(data: {
    name: string;
    description?: string;
    type: string;
    parameters: any;
  }) {
    const client = await this.getClient();
    return (await client.post('/config/bots', data)).data;
  }

  static async updateBot(botId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/bots/${botId}`, data)).data;
  }

  static async deleteBot(botId: string) {
    const client = await this.getClient();
    return (await client.delete(`/config/bots/${botId}`)).data;
  }

  static async executeBot(botId: string) {
    const client = await this.getClient();
    return (await client.post(`/config/bots/${botId}/execute`)).data;
  }

  // ========================================
  // 7.6 CONFIG - WORD LISTS
  // ========================================

  static async getWordLists(params?: {
    search?: string;
    usage?: string;
    with_entries?: boolean;
  }) {
    const client = await this.getClient();
    return (await client.get('/config/word-lists', { params })).data;
  }

  static async getWordList(wordListId: number) {
    const client = await this.getClient();
    return (await client.get(`/config/word-lists/${wordListId}`)).data;
  }

  static async createWordList(data: {
    name: string;
    description?: string;
    usage: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/config/word-lists', data)).data;
  }

  static async updateWordList(wordListId: number, data: any) {
    const client = await this.getClient();
    return (await client.put(`/config/word-lists/${wordListId}`, data)).data;
  }

  static async deleteWordList(wordListId: number) {
    const client = await this.getClient();
    return (await client.delete(`/config/word-lists/${wordListId}`)).data;
  }

  static async gatherWordList(wordListId: number) {
    const client = await this.getClient();
    return (await client.post(`/config/word-lists/gather/${wordListId}`)).data;
  }

  static async gatherAllWordLists() {
    const client = await this.getClient();
    return (await client.post('/config/word-lists/gather')).data;
  }

  // ========================================
  // 8. ASSETS
  // ========================================

  static async getAssets(params?: {
    search?: string;
    vulnerable?: boolean;
    group?: string;
    sort?: string;
  }) {
    const client = await this.getClient();
    return (await client.get('/assets', { params })).data;
  }

  static async getAsset(assetId: number) {
    const client = await this.getClient();
    return (await client.get(`/assets/${assetId}`)).data;
  }

  static async createAsset(data: {
    name: string;
    description?: string;
    type?: string;
    serial?: string;
    asset_group_id?: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/assets', data)).data;
  }

  static async updateAsset(assetId: number, data: any) {
    const client = await this.getClient();
    return (await client.put(`/assets/${assetId}`, data)).data;
  }

  static async deleteAsset(assetId: number) {
    const client = await this.getClient();
    return (await client.delete(`/assets/${assetId}`)).data;
  }

  static async updateAssetVulnerability(assetId: number, vulnerabilityId: string, solved: boolean) {
    const client = await this.getClient();
    return (await client.put(`/assets/${assetId}/vulnerabilities/${vulnerabilityId}`, { solved })).data;
  }

  static async getAssetGroups() {
    const client = await this.getClient();
    return (await client.get('/asset-groups')).data;
  }

  static async getAssetGroup(groupId: string) {
    const client = await this.getClient();
    return (await client.get(`/asset-groups/${groupId}`)).data;
  }

  static async createAssetGroup(data: {
    name: string;
    description?: string;
  }) {
    const client = await this.getClient();
    return (await client.post('/asset-groups', data)).data;
  }

  static async updateAssetGroup(groupId: string, data: any) {
    const client = await this.getClient();
    return (await client.put(`/asset-groups/${groupId}`, data)).data;
  }

  static async deleteAssetGroup(groupId: string) {
    const client = await this.getClient();
    return (await client.delete(`/asset-groups/${groupId}`)).data;
  }

  // ========================================
  // 9. ADMIN
  // ========================================

  static async getAdminSettings() {
    const client = await this.getClient();
    return (await client.get('/admin/settings')).data;
  }

  static async updateAdminSettings(settings: any) {
    const client = await this.getClient();
    return (await client.put('/admin/settings', settings)).data;
  }

  static async deleteAllTags() {
    const client = await this.getClient();
    return (await client.post('/admin/delete-tags')).data;
  }

  static async deleteAllStories() {
    const client = await this.getClient();
    return (await client.post('/admin/delete-stories')).data;
  }

  static async clearQueues() {
    const client = await this.getClient();
    return (await client.post('/admin/clear-queues')).data;
  }

  static async exportStories(metadata?: boolean) {
    const client = await this.getClient();
    return (await client.get('/admin/export-stories', { params: { metadata } })).data;
  }

  // ========================================
  // 10. CONNECTORS (CONFLICTS)
  // ========================================

  static async getStoryConflicts() {
    const client = await this.getClient();
    return (await client.get('/connectors/conflicts/stories')).data;
  }

  static async getStoryConflict(storyId: string) {
    const client = await this.getClient();
    return (await client.get(`/connectors/conflicts/stories/${storyId}`)).data;
  }

  static async resolveStoryConflict(storyId: string, resolution: any) {
    const client = await this.getClient();
    return (await client.put(`/connectors/conflicts/stories/${storyId}`, resolution)).data;
  }

  static async getNewsItemConflicts() {
    const client = await this.getClient();
    return (await client.get('/connectors/conflicts/news-items')).data;
  }

  static async ingestNewsItems(newsItems: any[]) {
    const client = await this.getClient();
    return (await client.post('/connectors/conflicts/news-items', newsItems)).data;
  }

  static async resolveNewsItemConflicts(data: {
    story_ids: string[];
    news_item_ids: string[];
  }) {
    const client = await this.getClient();
    return (await client.put('/connectors/conflicts/news-items', data)).data;
  }

  static async getStorySummary(storyId: string) {
    const client = await this.getClient();
    return (await client.get(`/connectors/story-summary/${storyId}`)).data;
  }

  static async clearAllConflicts() {
    const client = await this.getClient();
    return (await client.post('/connectors/conflicts/clear')).data;
  }

  static async updateLastChange(data: {
    stories?: string[];
    news_items?: string[];
  }) {
    const client = await this.getClient();
    return (await client.post('/connectors/last-change', data)).data;
  }

  // ========================================
  // 11. TASKS
  // ========================================

  static async getTaskResult(taskId: string) {
    const client = await this.getClient();
    return (await client.get(`/tasks/${taskId}`)).data;
  }

  // ========================================
  // 12. SANTÉ
  // ========================================

  static async isAlive() {
    const response = await axios.get(`${TARANIS_API_URL}/api/isalive`);
    return response.data;
  }
}


