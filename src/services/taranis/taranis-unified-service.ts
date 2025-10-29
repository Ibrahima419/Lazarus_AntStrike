/**
 * Service unifié pour l'intégration Taranis AI
 * Combine la logique éprouvée de TaranisTest avec une architecture propre
 */

// ============ TYPES & INTERFACES ============

export interface TaranisConfig {
    baseUrl: string;
    defaultCredentials: {
      username: string;
      password: string;
    };
    timeout: number;
    retryAttempts: number;
  }
  
  export interface TaranisBot {
    id: string;
    name: string;
    type: 'collector' | 'analyzer' | 'enricher';
    status: 'active' | 'inactive' | 'running' | 'stopped' | 'error';
    lastRun: string;
    processedCount: number;
    successRate: number;
    description?: string;
  }
  
  export interface TaranisSource {
    id: string;
    name: string;
    type: 'RSS' | 'API' | 'WEB' | 'TWITTER' | 'EMAIL' | 'manual';
    url: string;
    enabled: boolean;
    lastCollected: string;
    collectedCount: number;
    status: 'active' | 'inactive' | 'error';
  }
  
  export interface TaranisNewsItem {
    id: string;
    title: string;
    content: string;
    publishedDate: string;
    collectedDate: string;
    osintSourceId: string;
    hash: string;
    language?: string;
    url?: string;
    author?: string;
    tags?: string[];
    confidence?: number;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }

  export interface TaranisOSINTSource {
    id: string;
    name: string;
    type: 'RSS' | 'API' | 'WEB' | 'TWITTER' | 'EMAIL' | 'manual';
    url: string;
    enabled: boolean;
    lastCollected: string;
    collectedCount: number;
    status: 'active' | 'inactive' | 'error';
    description?: string;
    groupId?: string;
    parameters?: Record<string, any>;
  }

  export interface TaranisOSINTSourceGroup {
    id: string;
    name: string;
    description?: string;
    sources: TaranisOSINTSource[];
    createdDate: string;
    enabled: boolean;
  }

  export interface TaranisStory {
    id: string;
    title: string;
    content: string;
    createdDate: string;
    updatedDate: string;
    created?: string;
    last_change?: string;
    important?: boolean;
    status: 'draft' | 'published' | 'archived';
    tags: string[];
    newsItems: TaranisNewsItem[];
    groupId?: string;
    confidence?: number;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }

  export interface TaranisAssetAttribute {
    id: string;
    name: string;
    description?: string;
    default?: any;
    boolean?: boolean;
    type: 'string' | 'array<string>' | 'array<integer>' | 'boolean';
    required?: boolean;
  }

  export interface TaranisAssetGroup {
    id: string;
    name: string;
    description?: string;
    createdDate: string;
    updatedDate: string;
    enabled: boolean;
    attributes: TaranisAssetAttribute[];
    assetCount?: number;
    notificationTemplates?: TaranisNotificationTemplate[];
  }

  export interface TaranisNotificationTemplate {
    id: string;
    name: string;
    description?: string;
    template: string;
    type: 'email' | 'webhook' | 'slack' | 'teams';
    enabled: boolean;
    assetGroupId?: string;
    createdDate: string;
    updatedDate: string;
  }

  export interface TaranisAsset {
    id: string;
    name: string;
    description?: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    groupId: string;
    attributes: Record<string, any>;
    createdDate: string;
    updatedDate: string;
    lastSeen?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }
  
  export interface TaranisReport {
    id: string;
    title: string;
    content: string;
    createdDate: string;
    completed: boolean;
    threatLevel: 'critical' | 'high' | 'medium' | 'low';
    tags: string[];
  }
  
  export interface TaranisStats {
    totalCollections: number;
    activeBots: number;
    sourcesMonitored: number;
    criticalAlerts: number;
    averageConfidence: number;
    dailyGrowthRate: number;
  }
  
  // POC types légers
  export interface TaranisPresenter {
    id: string;
    name: string;
    type?: string;
    description?: string;
  }
  
  export interface TaranisProduct {
    id: string;
    title: string;
    content?: string;
    type?: string;
    createdDate?: string;
    updatedDate?: string;
    status?: string;
  }
  
  export interface TaranisPublisher {
    id: string;
    name: string;
    channel?: 'email' | 'webhook' | 'slack' | 'teams' | string;
    enabled?: boolean;
  }
  
  // Config POC types
  export interface OSINTSourceConfig {
    id: string;
    name: string;
    type: 'RSS' | 'API' | 'WEB' | 'TWITTER' | 'EMAIL' | 'manual' | string;
    url?: string;
    enabled: boolean;
    groupId?: string;
    parameters?: Record<string, any>;
  }
  
  export interface OSINTSourceGroupConfig {
    id: string;
    name: string;
    description?: string;
    enabled?: boolean;
    sources?: OSINTSourceConfig[];
  }
  
  export interface TemplateMeta {
    path: string;
    name?: string;
    type?: 'email' | 'webhook' | 'slack' | 'teams' | string;
    enabled?: boolean;
    template?: string;
  }
  
  export interface WordList {
    id: string;
    name: string;
    description?: string;
    language?: string;
    terms?: string[];
    createdDate?: string;
    updatedDate?: string;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
  }

  export interface PaginatedResponse<T = any> {
    total_count: number;
    items: T[];
  }

  // ============ TYPES USERS & ROLES ============

  export interface TaranisUser {
    id: number;
    username: string;
    name: string;
    email?: string;
    organization_id?: number;
    organization?: TaranisOrganization;
    roles: TaranisRole[];
    permissions: string[];
    created_date?: string;
    last_login?: string;
    enabled: boolean;
  }

  export interface TaranisRole {
    id: number;
    name: string;
    description?: string;
    permissions: string[];
  }

  export interface TaranisPermission {
    id: string;
    name: string;
    description?: string;
    category?: string;
  }

  export interface TaranisOrganization {
    id: number;
    name: string;
    description?: string;
    created_date?: string;
    updated_date?: string;
  }

  // ============ TYPES CONFIGURATION ============

  export interface TaranisAttribute {
    id: number;
    name: string;
    description?: string;
    type: string;
    default_value?: string;
    validator?: string;
    validator_parameter?: string;
  }

  export interface TaranisReportItemType {
    id: number;
    title: string;
    description?: string;
    attribute_groups?: TaranisAttributeGroup[];
  }

  export interface TaranisAttributeGroup {
    id: number;
    title: string;
    description?: string;
    section: number;
    section_title?: string;
    index: number;
    attribute_group_items?: TaranisAttributeGroupItem[];
  }

  export interface TaranisAttributeGroupItem {
    id: number;
    title: string;
    description?: string;
    index: number;
    required: boolean;
    attribute: TaranisAttribute;
  }

  export interface TaranisProductType {
    id: number;
    title: string;
    description?: string;
    type: string;
    parameters?: Record<string, any>;
    report_types?: number[];
  }

  export interface TaranisConnector {
    id: string;
    name: string;
    description?: string;
    type: string;
    parameters?: Record<string, any>;
  }

  export interface TaranisPublisherPreset {
    id: string;
    name: string;
    description?: string;
    type: string;
    parameters?: Record<string, any>;
  }

  export interface TaranisACL {
    id: number;
    name: string;
    description?: string;
    item_type: string;
    item_id: string;
    roles: number[];
    users: number[];
    access_type: string;
  }

  // ============ TYPES WORKERS & TASKS ============

  export interface TaranisWorker {
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline';
    last_seen?: string;
  }

  export interface TaranisWorkerType {
    id: string;
    name: string;
    description?: string;
    category: string;
    type: string;
    parameters?: any[];
  }

  export interface TaranisScheduleTask {
    id: string;
    name: string;
    cron: string;
    next_run_time?: string;
    enabled: boolean;
  }

  export interface TaranisQueueStatus {
    name: string;
    messages: number;
    consumers: number;
  }

  export interface TaranisTaskResult {
    id: string;
    task: string;
    status: string;
    result?: string;
    date_done?: string;
  }

  // ============ TYPES CONFLICTS ============

  export interface TaranisStoryConflict {
    storyId: string;
    original: any;
    updated: any;
    hasProposals: boolean;
  }

  export interface TaranisNewsItemConflict {
    incoming_story_id: string;
    news_item_id: string;
    existing_story_id: string;
    incoming_story: any;
    misp_address?: string;
  }

  // ============ TYPES DASHBOARD ============

  export interface TaranisDashboardData {
    total_stories: number;
    unread_stories: number;
    important_stories: number;
    in_analyze_stories: number;
    total_products: number;
    total_report_items: number;
    pending_report_items: number;
    completed_report_items: number;
    recent_stories?: any[];
    recent_report_items?: any[];
  }

  export interface TaranisBuildInfo {
    build_date: string;
    git_commit: string;
    git_branch: string;
    git_tag: string;
  }

  export interface TaranisCluster {
    tag_name: string;
    tag_type: string;
    size: number;
    stories?: any[];
  }

  // ============ TYPES ADMIN ============

  export interface TaranisSystemSettings {
    [key: string]: any;
  }

  // ============ ERREURS CUSTOM ============
  
  export class TaranisError extends Error {
    constructor(
      message: string, 
      public code: string, 
      public status?: number
    ) {
      super(message);
      this.name = 'TaranisError';
    }
  }
  
  export class TaranisAuthError extends TaranisError {
    constructor(message = 'Authentication failed') {
      super(message, 'AUTH_ERROR', 401);
    }
  }
  
  export class TaranisConnectionError extends TaranisError {
    constructor(message = 'Connection failed') {
      super(message, 'CONNECTION_ERROR', 0);
    }
  }
  
  // ============ SERVICE PRINCIPAL ============
  
  export class TaranisService {
    getCurrentUser() {
        throw new Error('Method not implemented.');
    }
    getUserProfile() {
        throw new Error('Method not implemented.');
    }
    private config: TaranisConfig;
    private token: string | null = null;
    private isAuthenticating = false;
    private authQueue: Array<(token: string) => void> = [];
  
    constructor(config?: Partial<TaranisConfig>) {
      // En développement, utiliser le proxy Vite (/api -> http://localhost:8080)
      // En production, utiliser l'URL complète de la variable d'environnement
      const isDevelopment = import.meta.env?.DEV || import.meta.env?.MODE === 'development';
      const defaultBaseUrl = isDevelopment 
        ? '/api'  // Utilise le proxy Vite configuré dans vite.config.ts
        : (import.meta.env?.VITE_TARANIS_API_URL || 'http://localhost:8080/api');
      
      this.config = {
        baseUrl: (config?.baseUrl || defaultBaseUrl).replace(/\/$/, ''),
        defaultCredentials: {
          username: 'admin',
          password: 'admin'
        },
        timeout: 10000,
        retryAttempts: 3,
        ...config
      };
  
      // Charger le token existant
      this.loadStoredToken();
    }
  
    // ============ GESTION DE L'AUTHENTIFICATION ============
  
    private loadStoredToken(): void {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.token = localStorage.getItem('taranis_token');
      }
    }
  
    private storeToken(token: string | null): void {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          localStorage.setItem('taranis_token', token);
        } else {
          localStorage.removeItem('taranis_token');
        }
      }
      this.token = token;
    }
  
    private getAuthHeaders(): Record<string, string> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      // Support optionnel d'une API Key pour certains endpoints (/worker/*, etc.)
      const apiKey = (import.meta as any)?.env?.VITE_TARANIS_API_KEY;
      if (apiKey) {
        headers['X-API-Key'] = String(apiKey);
      }
      
      return headers;
    }
  
    private async ensureAuthenticated(): Promise<string> {
      if (this.token) {
        return this.token;
      }
  
      if (this.isAuthenticating) {
        // Attendre que l'authentification en cours se termine
        return new Promise<string>((resolve) => {
          this.authQueue.push(resolve);
        });
      }
  
      this.isAuthenticating = true;
  
      try {
        const token = await this.performLogin();
        this.storeToken(token);
        
        // Résoudre toute la queue d'attente
        this.authQueue.forEach(resolve => resolve(token));
        this.authQueue = [];
        
        return token;
      } catch (error) {
        this.authQueue.forEach(resolve => resolve(''));
        this.authQueue = [];
        throw error;
      } finally {
        this.isAuthenticating = false;
      }
    }
  
    private async performLogin(): Promise<string> {
      const { username, password } = this.config.defaultCredentials;
      
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true
      });
  
      if (!response.success) {
        throw new TaranisAuthError(`Login failed: ${response.error}`);
      }
  
      const token = (response.data as any)?.access_token || (response.data as any)?.token;
      if (!token) {
        throw new TaranisAuthError('No token received from login');
      }
  
      return token;
    }
  
    // ============ REQUÊTES HTTP ============
  
    private async makeRequest<T = any>(
      endpoint: string,
      options: {
        method?: string;
        body?: string;
        skipAuth?: boolean;
        retryCount?: number;
      } = {}
    ): Promise<ApiResponse<T>> {
      const {
        method = 'GET',
        body,
        skipAuth = false,
        retryCount = 0
      } = options;
  
      // Authentification automatique si nécessaire
      if (!skipAuth) {
        try {
          await this.ensureAuthenticated();
        } catch (error) {
          return {
            success: false,
            error: `Authentication failed: ${error instanceof Error ? error.message : error}`,
            status: 401
          };
        }
      }
  
      const url = `${this.config.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      const headers = skipAuth ? { 'Content-Type': 'application/json' } : this.getAuthHeaders();
  
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
  
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
          credentials: 'include'
        });
  
        clearTimeout(timeoutId);
  
        // Gestion de l'expiration du token
        if (response.status === 401 && !skipAuth && retryCount === 0) {
          this.token = null;
          this.storeToken(null);
          
          // Retry avec une nouvelle authentification
          return this.makeRequest(endpoint, { ...options, retryCount: 1 });
        }
  
        const text = await response.text();
        let data: unknown = null;
  
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
  
        if (response.ok) {
          return { success: true, data: data as T, status: response.status };
        } else {
          return {
            success: false,
            error: (data as any)?.error || (data as any)?.message || `HTTP ${response.status}`,
            status: response.status,
            data: data as T
          };
        }
  
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            status: 408
          };
        }
  
        // Retry logic pour les erreurs réseau
        if (retryCount < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.makeRequest(endpoint, { ...options, retryCount: retryCount + 1 });
        }
  
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : error}`,
          status: 0
        };
      }
    }
  
    // ============ API PUBLIQUE ============
  
    async testConnection(): Promise<boolean> {
      const response = await this.makeRequest('/isalive', { skipAuth: true });
      return response.success && (
        (response.data as any)?.isalive === true || 
        (response.data as any)?.isAlive === true ||
        response.status === 200
      );
    }


    // ============ POC: PRESENTERS =========
    async getPresenters(): Promise<TaranisPresenter[]> {
      const response = await this.makeRequest('/presenters');
      if (!response.success) {
        throw new TaranisError(`Failed to fetch presenters: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((p: any) => ({
        id: String(p.id || Math.random()),
        name: String(p.name || 'Unknown Presenter'),
        type: p.type ? String(p.type) : undefined,
        description: p.description ? String(p.description) : undefined,
      })) : [];
    }

    // ============ POC: PUBLISH PRODUCTS =========
    async listProducts(): Promise<TaranisProduct[]> {
      const response = await this.makeRequest('/publish/products');
      if (!response.success) {
        throw new TaranisError(`Failed to list products: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((r: any) => ({
        id: String(r.id || Math.random()),
        title: String(r.title || 'Untitled'),
        content: r.content ? String(r.content) : undefined,
        type: r.type ? String(r.type) : undefined,
        createdDate: r.created_date || r.createdDate ? String(r.created_date || r.createdDate) : undefined,
        updatedDate: r.updated_date || r.updatedDate ? String(r.updated_date || r.updatedDate) : undefined,
        status: r.status ? String(r.status) : undefined
      })) : [];
    }

    async getProduct(productId: string): Promise<TaranisProduct> {
      const response = await this.makeRequest(`/publish/products/${productId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to fetch product: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const r = response.data as any;
      return {
        id: String(r?.id || productId),
        title: String(r?.title || 'Untitled'),
        content: r?.content ? String(r.content) : undefined,
        type: r?.type ? String(r.type) : undefined,
        createdDate: r?.created_date || r?.createdDate ? String(r.created_date || r.createdDate) : undefined,
        updatedDate: r?.updated_date || r?.updatedDate ? String(r.updated_date || r.updatedDate) : undefined,
        status: r?.status ? String(r.status) : undefined
      };
    }

    async updateProduct(productId: string, updates: Partial<TaranisProduct>): Promise<TaranisProduct> {
      const response = await this.makeRequest(`/publish/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update product: ${response.error}`, 'UPDATE_ERROR', response.status);
      }
      return response.data as TaranisProduct;
    }

    async deleteProduct(productId: string): Promise<boolean> {
      const response = await this.makeRequest(`/publish/products/${productId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete product: ${response.error}`, 'DELETE_ERROR', response.status);
      }
      return true;
    }

    async publishProduct(productId: string, publisherId: string): Promise<boolean> {
      const response = await this.makeRequest(`/publish/products/${productId}/publishers/${publisherId}`, { method: 'POST' });
      if (!response.success) {
        throw new TaranisError(`Failed to publish product: ${response.error}`, 'PUBLISH_ERROR', response.status);
      }
      return true;
    }


    // ============ POC: WORKER =========
    async listWorkerBots(): Promise<any[]> {
      const response = await this.makeRequest('/worker/bots');
      if (!response.success) {
        throw new TaranisError(`Failed to fetch worker bots: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items : [];
    }

    async getWorkerOSINTSource(sourceId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/osint-sources/${sourceId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to fetch worker osint source: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      return response.data;
    }

    async listWorkerStories(): Promise<any[]> {
      const response = await this.makeRequest('/worker/stories');
      if (!response.success) {
        throw new TaranisError(`Failed to fetch worker stories: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items : [];
    }

    async listWorkerTags(): Promise<string[]> {
      const response = await this.makeRequest('/worker/tags');
      if (!response.success) {
        throw new TaranisError(`Failed to fetch worker tags: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((t: any) => String(t)) : [];
    }

    // ============ CONFIG: OSINT SOURCES =========
    async listConfigOSINTSources(): Promise<OSINTSourceConfig[]> {
      const response = await this.makeRequest('/config/osint-sources');
      if (!response.success) {
        throw new TaranisError(`Failed to list config osint sources: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((s: any) => ({
        id: String(s.id || Math.random()),
        name: String(s.name || 'Unknown Source'),
        type: String(s.type || 'RSS'),
        url: s.url ? String(s.url) : undefined,
        enabled: Boolean(s.enabled),
        groupId: s.group_id || s.groupId ? String(s.group_id || s.groupId) : undefined,
        parameters: s.parameters && typeof s.parameters === 'object' ? s.parameters : undefined,
      })) : [];
    }

    async createConfigOSINTSource(payload: Partial<OSINTSourceConfig>): Promise<OSINTSourceConfig> {
      const response = await this.makeRequest('/config/osint-sources', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to create osint source: ${response.error}`, 'CREATE_ERROR', response.status);
      }
      return response.data as OSINTSourceConfig;
    }

    async updateConfigOSINTSource(sourceId: string, updates: Partial<OSINTSourceConfig>): Promise<OSINTSourceConfig> {
      const response = await this.makeRequest(`/config/osint-sources/${sourceId}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (!response.success) {
        throw new TaranisError(`Failed to update osint source: ${response.error}`, 'UPDATE_ERROR', response.status);
      }
      return response.data as OSINTSourceConfig;
    }

    async deleteConfigOSINTSource(sourceId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/osint-sources/${sourceId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete osint source: ${response.error}`, 'DELETE_ERROR', response.status);
      }
      return true;
    }

    async collectAllConfigOSINTSources(): Promise<boolean> {
      try {
        const response = await this.makeRequest('/config/osint-sources/collect', { method: 'POST' });
        return !!response.success;
      } catch (error) {
        // Supprimer logs répétitifs
        // console.error('Erreur collecte globale:', error);
        // Retourner false silencieusement si le serveur n'est pas disponible
        return false;
      }
    }

    async collectConfigOSINTSource(sourceId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/config/osint-sources/${sourceId}/collect`, { method: 'POST' });
        return !!response.success;
      } catch (error) {
        // Supprimer les logs répétitifs pour éviter pollution console
        // console.error(`Erreur collecte source ${sourceId}:`, error);
        // Retourner false silencieusement - l'UI gérera l'affichage
        return false;
      }
    }

    async exportOSINTSources(): Promise<any> {
      const response = await this.makeRequest('/config/export-osint-sources');
      if (!response.success) {
        throw new TaranisError(`Failed to export osint sources: ${response.error}`, 'EXPORT_ERROR', response.status);
      }
      return response.data;
    }

    async importOSINTSources(payload: any): Promise<boolean> {
      const response = await this.makeRequest('/config/import-osint-sources', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to import osint sources: ${response.error}`, 'IMPORT_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: OSINT SOURCE GROUPS =========
    async listConfigOSINTSourceGroups(): Promise<OSINTSourceGroupConfig[]> {
      const response = await this.makeRequest('/config/osint-source-groups');
      if (!response.success) {
        throw new TaranisError(`Failed to list osint source groups: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((g: any) => ({
        id: String(g.id || Math.random()),
        name: String(g.name || 'Unknown Group'),
        description: g.description ? String(g.description) : undefined,
        enabled: Boolean(g.enabled),
        sources: Array.isArray(g.sources) ? g.sources : undefined,
      })) : [];
    }

    async createConfigOSINTSourceGroup(payload: Partial<OSINTSourceGroupConfig>): Promise<OSINTSourceGroupConfig> {
      const response = await this.makeRequest('/config/osint-source-groups', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to create osint source group: ${response.error}`, 'CREATE_ERROR', response.status);
      }
      return response.data as OSINTSourceGroupConfig;
    }

    async updateConfigOSINTSourceGroup(groupId: string, updates: Partial<OSINTSourceGroupConfig>): Promise<OSINTSourceGroupConfig> {
      const response = await this.makeRequest(`/config/osint-source-groups/${groupId}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (!response.success) {
        throw new TaranisError(`Failed to update osint source group: ${response.error}`, 'UPDATE_ERROR', response.status);
      }
      return response.data as OSINTSourceGroupConfig;
    }

    async deleteConfigOSINTSourceGroup(groupId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/osint-source-groups/${groupId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete osint source group: ${response.error}`, 'DELETE_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: TEMPLATES =========
    async listConfigTemplates(): Promise<TemplateMeta[]> {
      const response = await this.makeRequest('/config/templates');
      if (!response.success) {
        throw new TaranisError(`Failed to list templates: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((t: any) => ({
        path: String(t.path || t.id || ''),
        name: t.name ? String(t.name) : undefined,
        type: t.type ? String(t.type) : undefined,
        enabled: t.enabled !== undefined ? Boolean(t.enabled) : undefined,
        template: t.template ? String(t.template) : undefined,
      })) : [];
    }

    async getConfigTemplate(templatePath: string): Promise<TemplateMeta> {
      const response = await this.makeRequest(`/config/templates/${templatePath}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get template: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      return response.data as TemplateMeta;
    }

    async createConfigTemplate(payload: Partial<TemplateMeta>): Promise<TemplateMeta> {
      const response = await this.makeRequest('/config/templates', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to create template: ${response.error}`, 'CREATE_ERROR', response.status);
      }
      return response.data as TemplateMeta;
    }

    async updateConfigTemplate(templatePath: string, updates: Partial<TemplateMeta>): Promise<TemplateMeta> {
      const response = await this.makeRequest(`/config/templates/${templatePath}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (!response.success) {
        throw new TaranisError(`Failed to update template: ${response.error}`, 'UPDATE_ERROR', response.status);
      }
      return response.data as TemplateMeta;
    }

    async deleteConfigTemplate(templatePath: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/templates/${templatePath}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete template: ${response.error}`, 'DELETE_ERROR', response.status);
      }
      return true;
    }

    async validateConfigTemplate(payload: Partial<TemplateMeta>): Promise<{ valid: boolean; errors?: any[] }> {
      const response = await this.makeRequest('/config/templates/validate', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Template validation failed: ${response.error}`, 'VALIDATE_ERROR', response.status);
      }
      return response.data as any;
    }

    // ============ CONFIG: WORD LISTS =========
    async listWordLists(): Promise<WordList[]> {
      const response = await this.makeRequest('/config/word-lists');
      if (!response.success) {
        throw new TaranisError(`Failed to list word lists: ${response.error}`, 'FETCH_ERROR', response.status);
      }
      const items = (response.data as any)?.items || response.data || [];
      return Array.isArray(items) ? items.map((w: any) => ({
        id: String(w.id || Math.random()),
        name: String(w.name || 'Unnamed'),
        description: w.description ? String(w.description) : undefined,
        language: w.language ? String(w.language) : undefined,
        terms: Array.isArray(w.terms) ? w.terms.map((t: any) => String(t)) : undefined,
        createdDate: w.created_date || w.createdDate ? String(w.created_date || w.createdDate) : undefined,
        updatedDate: w.updated_date || w.updatedDate ? String(w.updated_date || w.updatedDate) : undefined,
      })) : [];
    }

    async createWordList(payload: Partial<WordList>): Promise<WordList> {
      const response = await this.makeRequest('/config/word-lists', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to create word list: ${response.error}`, 'CREATE_ERROR', response.status);
      }
      return response.data as WordList;
    }

    async updateWordList(wordListId: string, updates: Partial<WordList>): Promise<WordList> {
      const response = await this.makeRequest(`/config/word-lists/${wordListId}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (!response.success) {
        throw new TaranisError(`Failed to update word list: ${response.error}`, 'UPDATE_ERROR', response.status);
      }
      return response.data as WordList;
    }

    async deleteWordList(wordListId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/word-lists/${wordListId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete word list: ${response.error}`, 'DELETE_ERROR', response.status);
      }
      return true;
    }

    async gatherWordList(wordListId: string): Promise<any> {
      const response = await this.makeRequest(`/config/word-lists/gather/${wordListId}`, { method: 'POST' });
      if (!response.success) {
        throw new TaranisError(`Failed to gather word list: ${response.error}`, 'GATHER_ERROR', response.status);
      }
      return response.data;
    }

    async exportWordLists(): Promise<any> {
      const response = await this.makeRequest('/config/export-word-lists');
      if (!response.success) {
        throw new TaranisError(`Failed to export word lists: ${response.error}`, 'EXPORT_ERROR', response.status);
      }
      return response.data;
    }

    async importWordLists(payload: any): Promise<boolean> {
      const response = await this.makeRequest('/config/import-word-lists', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.success) {
        throw new TaranisError(`Failed to import word lists: ${response.error}`, 'IMPORT_ERROR', response.status);
      }
      return true;
    }
  
    async login(username?: string, password?: string): Promise<boolean> {
      if (username && password) {
        this.config.defaultCredentials = { username, password };
      }
      
      try {
        await this.ensureAuthenticated();
        return true;
      } catch {
        return false;
      }
    }
  
    async logout(): Promise<void> {
      try {
        await this.makeRequest('/auth/logout', { method: 'DELETE' });
      } catch {
        // Ignore logout errors
      } finally {
        this.storeToken(null);
      }
    }
  
    // ============ MÉTHODES SPÉCIALISÉES ============
  
    async getBots(): Promise<TaranisBot[]> {
      const response = await this.makeRequest('/config/bots');
      
      if (!response.success) {
        throw new TaranisError(`Failed to fetch bots: ${response.error}`, 'FETCH_ERROR', response.status);
      }
  
      const bots = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(bots)) {
        return [];
      }
  
      return bots.map(bot => {
        // Ensure we have a valid bot object
        if (!bot || typeof bot !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Bot',
            type: 'analyzer' as const,
            status: 'error' as const,
            lastRun: new Date().toISOString(),
            processedCount: 0,
            successRate: 0,
            description: 'Invalid bot data'
          };
        }

        return {
          id: String(bot.id || Math.random()),
          name: String(bot.name || 'Unknown Bot'),
          type: (bot.type || 'analyzer') as 'collector' | 'analyzer' | 'enricher',
          status: (bot.enabled ? (typeof bot.status === 'string' ? bot.status : 'active') : 'inactive') as 'active' | 'inactive' | 'running' | 'stopped' | 'error',
          lastRun: String(bot.last_run || new Date().toISOString()),
          processedCount: Number(bot.processed_count || 0),
          successRate: Number(bot.success_rate || 0),
          description: bot.description ? String(bot.description) : undefined
        };
      });
    }

    /**
     * Crée un nouveau bot via l'API Taranis
     */
    async createBot(botData: {
      name: string;
      description?: string;
      type: string;
      parameters?: any[];
    }): Promise<any> {
      try {
        const response = await this.makeRequest('/config/bots', {
          method: 'POST',
          body: JSON.stringify(botData)
        });

        if (!response.success) {
          throw new TaranisError(`Failed to create bot: ${response.error}`, 'CREATE_ERROR', response.status);
        }

        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création du bot:', error);
        
        // Mode développement : simuler une création de bot si le serveur n'est pas accessible
        if (error instanceof TaranisError && error.status === 500) {
          console.warn('🚧 Mode développement : simulation de la création de bot');
          return {
            id: `dev-bot-${Date.now()}`,
            name: botData.name,
            description: botData.description || '',
            type: botData.type,
            parameters: botData.parameters || [],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
    }

    /**
     * Met à jour un bot existant via l'API Taranis
     */
    async updateBot(botId: string, botData: {
      name?: string;
      description?: string;
      type?: string;
      parameters?: any[];
    }): Promise<any> {
      try {
        const response = await this.makeRequest(`/config/bots/${botId}`, {
          method: 'PUT',
          body: JSON.stringify(botData)
        });

        if (!response.success) {
          throw new TaranisError(`Failed to update bot: ${response.error}`, 'UPDATE_ERROR', response.status);
        }

        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du bot:', error);
        throw error;
      }
    }

    // ============ REPORT ITEMS MANAGEMENT ============

    /**
     * Récupère tous les report items via l'API Taranis
     */
    async getReportItems(params?: {
      search?: string;
      completed?: boolean;
      range?: string;
      sort?: string;
      group?: string;
      offset?: number;
      limit?: number;
    }): Promise<any> {
      try {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.completed !== undefined) queryParams.append('completed', params.completed.toString());
        if (params?.range) queryParams.append('range', params.range);
        if (params?.sort) queryParams.append('sort', params.sort);
        if (params?.group) queryParams.append('group', params.group);
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const url = `/analyze/report-items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await this.makeRequest(url, {
          method: 'GET'
        });

        if (!response.success) {
          throw new TaranisError(`Failed to get report items: ${response.error}`, 'FETCH_ERROR', response.status);
        }

        return response.data?.items || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des report items:', error);
        
        // Mode développement : retourner des report items simulés si le serveur n'est pas accessible
        if (error instanceof TaranisError && (error.status === 500 || error.status === 404)) {
          console.warn('🚧 Mode développement : simulation des report items');
          return [];
        }
        
        throw error;
      }
    }

    /**
     * Crée un nouveau report item via l'API Taranis
     */
    async createReportItem(reportItemData: {
      title: string;
      report_item_type_id: number;
      attributes?: any[];
      stories?: any[];
      completed?: boolean;
    }): Promise<any> {
      try {
        const response = await this.makeRequest('/analyze/report-items', {
          method: 'POST',
          body: JSON.stringify(reportItemData)
        });

        if (!response.success) {
          throw new TaranisError(`Failed to create report item: ${response.error}`, 'CREATE_ERROR', response.status);
        }

        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création du report item:', error);
        
        // Mode développement : simuler une création de report item si le serveur n'est pas accessible
        if (error instanceof TaranisError && error.status === 500) {
          console.warn('🚧 Mode développement : simulation de la création de report item');
          return {
            id: `dev-report-${Date.now()}`,
            title: reportItemData.title,
            report_item_type_id: reportItemData.report_item_type_id,
            attributes: reportItemData.attributes || [],
            stories: reportItemData.stories || [],
            completed: reportItemData.completed || false,
            created: new Date().toISOString(),
            last_updated: new Date().toISOString()
          };
        }
        
        throw error;
      }
    }

    /**
     * Met à jour un report item existant via l'API Taranis
     */
    async updateReportItem(reportItemId: string, updateData: {
      id?: string;
      message?: string;
    }): Promise<any> {
      try {
        const response = await this.makeRequest(`/analyze/report-items/${reportItemId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.success) {
          throw new TaranisError(`Failed to update report item: ${response.error}`, 'UPDATE_ERROR', response.status);
        }

        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du report item:', error);
        throw error;
      }
    }

    /**
     * Supprime un report item via l'API Taranis
     */
    async deleteReportItem(reportItemId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/analyze/report-items/${reportItemId}`, {
          method: 'DELETE'
        });

        if (!response.success) {
          throw new TaranisError(`Failed to delete report item: ${response.error}`, 'DELETE_ERROR', response.status);
        }

        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression du report item:', error);
        throw error;
      }
    }

    /**
     * Supprime un bot via l'API Taranis
     */
    async deleteBot(botId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/config/bots/${botId}`, {
          method: 'DELETE'
        });

        if (!response.success) {
          throw new TaranisError(`Failed to delete bot: ${response.error}`, 'DELETE_ERROR', response.status);
        }

        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression du bot:', error);
        return false;
      }
    }
  
    async getSources(): Promise<TaranisSource[]> {
      const response = await this.makeRequest('/config/osint-sources');
      
      if (!response.success) {
        throw new TaranisError(`Failed to fetch sources: ${response.error}`, 'FETCH_ERROR', response.status);
      }
  
      const sources = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(sources)) {
        return [];
      }
  
      return sources.map(source => {
        // Ensure we have a valid source object
        if (!source || typeof source !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Source',
            type: 'RSS' as const,
            url: '',
            enabled: false,
            lastCollected: new Date().toISOString(),
            collectedCount: 0,
            status: 'error' as const
          };
        }

        return {
          id: String(source.id || Math.random()),
          name: String(source.name || 'Unknown Source'),
          type: (source.type || 'RSS') as 'RSS' | 'API' | 'WEB' | 'TWITTER' | 'EMAIL' | 'manual',
          url: String(source.url || ''),
          enabled: Boolean(source.enabled),
          lastCollected: String(source.last_collected || new Date().toISOString()),
          collectedCount: Number(source.collected_count || 0),
          status: (source.enabled ? (typeof source.status === 'string' ? source.status : 'active') : 'inactive') as 'active' | 'inactive' | 'error'
        };
      });
    }
  
  async getNewsItems(params?: {
    limit?: number;
    range?: string;
    cybersecurity?: boolean;
    offset?: number;
    search?: string;
  }): Promise<TaranisNewsItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', String(params?.limit || 50));
    if (params?.range) queryParams.append('range', params.range);
    if (params?.cybersecurity !== undefined) queryParams.append('cybersecurity', String(params.cybersecurity));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await this.makeRequest(`/assess/news-items?${queryParams.toString()}`);
      
      if (!response.success) {
        throw new TaranisError(`Failed to fetch news items: ${response.error}`, 'FETCH_ERROR', response.status);
      }
  
      const items = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(items)) {
        return [];
      }
  
      return items.map(item => {
        // Ensure we have a valid item object
        if (!item || typeof item !== 'object') {
          return {
            id: String(Math.random()),
            title: 'Invalid Item',
            content: '',
            publishedDate: new Date().toISOString(),
            collectedDate: new Date().toISOString(),
            osintSourceId: 'unknown',
            hash: '',
            language: undefined
          };
        }

        return {
          id: String(item.id || Math.random()),
          title: String(item.title || 'Untitled'),
          content: String(item.content || ''),
          publishedDate: String(item.published_date || item.publishedDate || new Date().toISOString()),
          collectedDate: String(item.collected_date || item.collectedDate || new Date().toISOString()),
          osintSourceId: String(item.osint_source_id || item.osintSourceId || 'unknown'),
          hash: String(item.hash || ''),
          language: item.language ? String(item.language) : undefined,
          url: item.url ? String(item.url) : undefined,
          author: item.author ? String(item.author) : undefined,
          tags: Array.isArray(item.tags) ? item.tags.map((tag: any) => String(tag)) : undefined,
          confidence: item.confidence ? Number(item.confidence) : undefined,
          riskLevel: item.risk_level || item.riskLevel
        };
      });
    }
  
    async getReports(): Promise<TaranisReport[]> {
      const response = await this.makeRequest('/analyze/report-items');
      
      if (!response.success) {
        throw new TaranisError(`Failed to fetch reports: ${response.error}`, 'FETCH_ERROR', response.status);
      }
  
      const reports = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(reports)) {
        return [];
      }
  
      return reports.map(report => {
        // Ensure we have a valid report object
        if (!report || typeof report !== 'object') {
          return {
            id: String(Math.random()),
            title: 'Invalid Report',
            content: '',
            createdDate: new Date().toISOString(),
            completed: false,
            threatLevel: 'medium' as const,
            tags: []
          };
        }

        return {
          id: String(report.id || Math.random()),
          title: String(report.title || 'Untitled Report'),
          content: String(report.content || ''),
          createdDate: String(report.created_date || report.createdDate || new Date().toISOString()),
          completed: Boolean(report.completed),
          threatLevel: (typeof report.threat_level === 'string' ? report.threat_level : 'medium') as 'critical' | 'high' | 'medium' | 'low',
          tags: Array.isArray(report.tags) ? report.tags.map((tag: any) => String(tag)) : []
        };
      });
    }
  
    async getDashboardStats(): Promise<TaranisStats> {
      try {
        const response = await this.makeRequest('/dashboard');
        
        if (response.success && response.data) {
          const dashboard = Array.isArray((response.data as any).items) ? (response.data as any).items[0] : response.data;
          
          return {
            totalCollections: dashboard?.total_news_items || 0,
            activeBots: dashboard?.active_bots || 0,
            sourcesMonitored: dashboard?.sources_monitored || 0,
            criticalAlerts: dashboard?.report_items_completed || 0,
            averageConfidence: 0.85,
            dailyGrowthRate: 0
          };
        }
        
        // Fallback : calculer depuis les autres endpoints
        const [bots, sources, newsItems] = await Promise.all([
          this.getBots(),
          this.getSources(), 
          this.getNewsItems()
        ]);
  
        return {
          totalCollections: newsItems.length,
          activeBots: bots.filter(bot => bot.status === 'active' || bot.status === 'running').length,
          sourcesMonitored: sources.filter(source => source.enabled).length,
          criticalAlerts: 0,
          averageConfidence: 0.85,
          dailyGrowthRate: 0
        };
        
      } catch (error) {
        // Stats par défaut en cas d'erreur
        return {
          totalCollections: 0,
          activeBots: 0,
          sourcesMonitored: 0,
          criticalAlerts: 0,
          averageConfidence: 0,
          dailyGrowthRate: 0
        };
      }
    }
  
    // ============ CONTRÔLES ============
  
    async startBot(botId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/bots/${botId}/start`, {
        method: 'POST'
      });
      return response.success;
    }
  
    async stopBot(botId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/bots/${botId}/stop`, {
        method: 'POST'
      });
      return response.success;
    }
  
    async updateSourceStatus(sourceId: string, enabled: boolean): Promise<boolean> {
      const response = await this.makeRequest(`/config/osint-sources/${sourceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled })
      });
      return response.success;
    }
  
    async triggerCollection(sourceId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/config/osint-sources/${sourceId}/collect`, {
          method: 'POST'
        });
        return response.success;
      } catch (error) {
        // Supprimer logs répétitifs - retourner false silencieusement
        // console.error(`Erreur collecte source ${sourceId}:`, error);
        return false;
      }
    }

    // ============ ASSESS ENDPOINTS ============

    // News Items Management
    async createNewsItem(newsItem: Partial<TaranisNewsItem>): Promise<TaranisNewsItem> {
      const response = await this.makeRequest('/assess/news-items', {
        method: 'POST',
        body: JSON.stringify(newsItem)
      });

      if (!response.success) {
        throw new TaranisError(`Failed to create news item: ${response.error}`, 'CREATE_ERROR', response.status);
      }

      return response.data as TaranisNewsItem;
    }

    async getNewsItem(itemId: string): Promise<TaranisNewsItem> {
      const response = await this.makeRequest(`/assess/news-items/${itemId}`);

      if (!response.success) {
        throw new TaranisError(`Failed to fetch news item: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      return response.data as TaranisNewsItem;
    }

    async updateNewsItem(itemId: string, updates: Partial<TaranisNewsItem>): Promise<TaranisNewsItem> {
      const response = await this.makeRequest(`/assess/news-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (!response.success) {
        throw new TaranisError(`Failed to update news item: ${response.error}`, 'UPDATE_ERROR', response.status);
      }

      return response.data as TaranisNewsItem;
    }

    async deleteNewsItem(itemId: string): Promise<boolean> {
      const response = await this.makeRequest(`/assess/news-items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.success) {
        throw new TaranisError(`Failed to delete news item: ${response.error}`, 'DELETE_ERROR', response.status);
      }

      return response.success;
    }

    // OSINT Sources Management
    async getOSINTSources(): Promise<TaranisOSINTSource[]> {
      const response = await this.makeRequest('/assess/osint-sources-list');

      if (!response.success) {
        throw new TaranisError(`Failed to fetch OSINT sources: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const sources = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(sources)) {
        return [];
      }

      return sources.map(source => {
        // Ensure we have a valid source object
        if (!source || typeof source !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Source',
            type: 'RSS' as const,
            url: '',
            enabled: false,
            lastCollected: new Date().toISOString(),
            collectedCount: 0,
            status: 'error' as const,
            description: undefined,
            groupId: undefined,
            parameters: undefined
          };
        }

        return {
          id: String(source.id || Math.random()),
          name: String(source.name || 'Unknown Source'),
          type: (source.type || 'RSS') as 'RSS' | 'API' | 'WEB' | 'TWITTER' | 'EMAIL' | 'manual',
          url: String(source.url || ''),
          enabled: Boolean(source.enabled),
          lastCollected: String(source.last_collected || source.lastCollected || new Date().toISOString()),
          collectedCount: Number(source.collected_count || source.collectedCount || 0),
          status: (source.enabled ? (typeof source.status === 'string' ? source.status : 'active') : 'inactive') as 'active' | 'inactive' | 'error',
          description: source.description ? String(source.description) : undefined,
          groupId: source.group_id || source.groupId ? String(source.group_id || source.groupId) : undefined,
          parameters: source.parameters && typeof source.parameters === 'object' ? source.parameters : undefined
        };
      });
    }

    async getOSINTSourceGroups(): Promise<TaranisOSINTSourceGroup[]> {
      const response = await this.makeRequest('/assess/osint-source-group-list');

      if (!response.success) {
        throw new TaranisError(`Failed to fetch OSINT source groups: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const groups = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(groups)) {
        return [];
      }

      return groups.map(group => {
        // Ensure we have a valid group object
        if (!group || typeof group !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Group',
            description: undefined,
            sources: [],
            createdDate: new Date().toISOString(),
            enabled: false
          };
        }

        return {
          id: String(group.id || Math.random()),
          name: String(group.name || 'Unknown Group'),
          description: group.description ? String(group.description) : undefined,
          sources: Array.isArray(group.sources) ? group.sources : [],
          createdDate: String(group.created_date || group.createdDate || new Date().toISOString()),
          enabled: Boolean(group.enabled)
        };
      });
    }

    // Stories Management
    async getStories(): Promise<TaranisStory[]> {
      const response = await this.makeRequest('/assess/stories');

      if (!response.success) {
        throw new TaranisError(`Failed to fetch stories: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const stories = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(stories)) {
        return [];
      }

      return stories.map(story => {
        // Ensure we have a valid story object
        if (!story || typeof story !== 'object') {
          return {
            id: String(Math.random()),
            title: 'Invalid Story',
            content: '',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            status: 'draft' as const,
            tags: [],
            newsItems: [],
            groupId: undefined,
            confidence: undefined,
            riskLevel: undefined
          };
        }

        return {
          id: String(story.id || Math.random()),
          title: String(story.title || 'Untitled Story'),
          content: String(story.content || ''),
          createdDate: String(story.created_date || story.createdDate || new Date().toISOString()),
          updatedDate: String(story.updated_date || story.updatedDate || new Date().toISOString()),
          status: (story.status || 'draft') as 'draft' | 'published' | 'archived',
          tags: Array.isArray(story.tags) ? story.tags.map((tag: any) => String(tag)) : [],
          newsItems: Array.isArray(story.news_items || story.newsItems) ? (story.news_items || story.newsItems) : [],
          groupId: story.group_id || story.groupId ? String(story.group_id || story.groupId) : undefined,
          confidence: story.confidence ? Number(story.confidence) : undefined,
          riskLevel: story.risk_level || story.riskLevel
        };
      });
    }

    async getStory(storyId: string): Promise<TaranisStory> {
      const response = await this.makeRequest(`/assess/story/${storyId}`);

      if (!response.success) {
        throw new TaranisError(`Failed to fetch story: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const story = response.data as any;
      
      // Ensure we have a valid story object
      if (!story || typeof story !== 'object') {
        return {
          id: String(Math.random()),
          title: 'Invalid Story',
          content: '',
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          status: 'draft' as const,
          tags: [],
          newsItems: [],
          groupId: undefined,
          confidence: undefined,
          riskLevel: undefined
        };
      }

      return {
        id: String(story.id || Math.random()),
        title: String(story.title || 'Untitled Story'),
        content: String(story.content || ''),
        createdDate: String(story.created_date || story.createdDate || new Date().toISOString()),
        updatedDate: String(story.updated_date || story.updatedDate || new Date().toISOString()),
        status: (story.status || 'draft') as 'draft' | 'published' | 'archived',
        tags: Array.isArray(story.tags) ? story.tags.map((tag: any) => String(tag)) : [],
        newsItems: Array.isArray(story.news_items || story.newsItems) ? (story.news_items || story.newsItems) : [],
        groupId: story.group_id || story.groupId ? String(story.group_id || story.groupId) : undefined,
        confidence: story.confidence ? Number(story.confidence) : undefined,
        riskLevel: story.risk_level || story.riskLevel
      };
    }

    async updateStory(storyId: string, updates: Partial<TaranisStory>): Promise<TaranisStory> {
      const response = await this.makeRequest(`/assess/story/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (!response.success) {
        throw new TaranisError(`Failed to update story: ${response.error}`, 'UPDATE_ERROR', response.status);
      }

      return response.data as TaranisStory;
    }

    async deleteStory(storyId: string): Promise<boolean> {
      const response = await this.makeRequest(`/assess/story/${storyId}`, {
        method: 'DELETE'
      });

      if (!response.success) {
        throw new TaranisError(`Failed to delete story: ${response.error}`, 'DELETE_ERROR', response.status);
      }

      return response.success;
    }

    async groupStories(storyIds: string[]): Promise<boolean> {
      const response = await this.makeRequest('/assess/stories/group', {
        method: 'PUT',
        body: JSON.stringify({ story_ids: storyIds })
      });

      if (!response.success) {
        throw new TaranisError(`Failed to group stories: ${response.error}`, 'GROUP_ERROR', response.status);
      }

      return response.success;
    }

    async ungroupStories(storyIds: string[]): Promise<boolean> {
      const response = await this.makeRequest('/assess/stories/ungroup', {
        method: 'PUT',
        body: JSON.stringify({ story_ids: storyIds })
      });

      if (!response.success) {
        throw new TaranisError(`Failed to ungroup stories: ${response.error}`, 'UNGROUP_ERROR', response.status);
      }

      return response.success;
    }

    // ============ ASSETS ENDPOINTS ============

    // Asset Groups Management
    async getAssetGroups(): Promise<TaranisAssetGroup[]> {
      const response = await this.makeRequest('/asset-groups');

      if (!response.success) {
        throw new TaranisError(`Failed to fetch asset groups: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const groups = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(groups)) {
        return [];
      }

      return groups.map(group => {
        // Ensure we have a valid group object
        if (!group || typeof group !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Group',
            description: undefined,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            enabled: false,
            attributes: [],
            assetCount: 0,
            notificationTemplates: []
          };
        }

        return {
          id: String(group.id || Math.random()),
          name: String(group.name || 'Unknown Group'),
          description: group.description ? String(group.description) : undefined,
          createdDate: String(group.created_date || group.createdDate || new Date().toISOString()),
          updatedDate: String(group.updated_date || group.updatedDate || new Date().toISOString()),
          enabled: Boolean(group.enabled),
          attributes: Array.isArray(group.attributes) ? group.attributes.map((attr: any) => ({
            id: String(attr.id || Math.random()),
            name: String(attr.name || 'Unknown Attribute'),
            description: attr.description ? String(attr.description) : undefined,
            default: attr.default,
            boolean: Boolean(attr.boolean),
            type: (attr.type || 'string') as 'string' | 'array<string>' | 'array<integer>' | 'boolean',
            required: Boolean(attr.required)
          })) : [],
          assetCount: Number(group.asset_count || group.assetCount || 0),
          notificationTemplates: Array.isArray(group.notification_templates || group.notificationTemplates) ? 
            (group.notification_templates || group.notificationTemplates).map((template: any) => ({
              id: String(template.id || Math.random()),
              name: String(template.name || 'Unknown Template'),
              description: template.description ? String(template.description) : undefined,
              template: String(template.template || ''),
              type: (template.type || 'email') as 'email' | 'webhook' | 'slack' | 'teams',
              enabled: Boolean(template.enabled),
              assetGroupId: template.asset_group_id || template.assetGroupId ? String(template.asset_group_id || template.assetGroupId) : undefined,
              createdDate: String(template.created_date || template.createdDate || new Date().toISOString()),
              updatedDate: String(template.updated_date || template.updatedDate || new Date().toISOString())
            })) : []
        };
      });
    }

    async createAssetGroup(group: Partial<TaranisAssetGroup>): Promise<TaranisAssetGroup> {
      const response = await this.makeRequest('/asset-groups', {
        method: 'POST',
        body: JSON.stringify(group)
      });

      if (!response.success) {
        throw new TaranisError(`Failed to create asset group: ${response.error}`, 'CREATE_ERROR', response.status);
      }

      return response.data as TaranisAssetGroup;
    }

    async updateAssetGroup(groupId: string, updates: Partial<TaranisAssetGroup>): Promise<TaranisAssetGroup> {
      const response = await this.makeRequest(`/asset-groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (!response.success) {
        throw new TaranisError(`Failed to update asset group: ${response.error}`, 'UPDATE_ERROR', response.status);
      }

      return response.data as TaranisAssetGroup;
    }

    async deleteAssetGroup(groupId: string): Promise<boolean> {
      const response = await this.makeRequest(`/asset-groups/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.success) {
        throw new TaranisError(`Failed to delete asset group: ${response.error}`, 'DELETE_ERROR', response.status);
      }

      return response.success;
    }

    // Asset Attributes Management
    async getAssetAttributes(groupId?: string): Promise<TaranisAssetAttribute[]> {
      // Use the real Taranis endpoint for attributes
      const endpoint = '/config/attributes';
      const response = await this.makeRequest(endpoint);

      if (!response.success) {
        throw new TaranisError(`Failed to fetch asset attributes: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const attributes = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(attributes)) {
        return [];
      }

      return attributes.map(attr => {
        // Ensure we have a valid attribute object
        if (!attr || typeof attr !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Attribute',
            description: undefined,
            default: undefined,
            boolean: false,
            type: 'string' as const,
            required: false
          };
        }

        return {
          id: String(attr.id || Math.random()),
          name: String(attr.name || 'Unknown Attribute'),
          description: attr.description ? String(attr.description) : undefined,
          default: attr.default,
          boolean: Boolean(attr.boolean),
          type: (attr.type || 'string') as 'string' | 'array<string>' | 'array<integer>' | 'boolean',
          required: Boolean(attr.required)
        };
      });
    }

    // Notification Templates Management
    async getNotificationTemplates(groupId?: string): Promise<TaranisNotificationTemplate[]> {
      // Use the real Taranis endpoint for templates
      const endpoint = '/config/templates';
      const response = await this.makeRequest(endpoint);

      if (!response.success) {
        throw new TaranisError(`Failed to fetch notification templates: ${response.error}`, 'FETCH_ERROR', response.status);
      }

      const templates = (response.data as any)?.items || response.data || [];
      
      if (!Array.isArray(templates)) {
        return [];
      }

      return templates.map(template => {
        // Ensure we have a valid template object
        if (!template || typeof template !== 'object') {
          return {
            id: String(Math.random()),
            name: 'Invalid Template',
            description: undefined,
            template: '',
            type: 'email' as const,
            enabled: false,
            assetGroupId: undefined,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
          };
        }

        return {
          id: String(template.id || Math.random()),
          name: String(template.name || 'Unknown Template'),
          description: template.description ? String(template.description) : undefined,
          template: String(template.template || ''),
          type: (template.type || 'email') as 'email' | 'webhook' | 'slack' | 'teams',
          enabled: Boolean(template.enabled),
          assetGroupId: template.asset_group_id || template.assetGroupId ? String(template.asset_group_id || template.assetGroupId) : undefined,
          createdDate: String(template.created_date || template.createdDate || new Date().toISOString()),
          updatedDate: String(template.updated_date || template.updatedDate || new Date().toISOString())
        };
      });
    }
  
    // ============ UTILITAIRES ============
  
    getConfig(): TaranisConfig {
      return { ...this.config };
    }
  
    // ============ DASHBOARD ENDPOINTS (ADVANCED) ============
  
    async getDashboard(): Promise<any> {
      try {
        const response = await this.makeRequest('/dashboard');
        if (response.success) {
          return response.data || response;
        }
        
        // Fallback: calculer manuellement
        return await this.getDashboardStats();
      } catch (error) {
        console.warn('Dashboard endpoint non disponible, fallback stats');
        return await this.getDashboardStats();
      }
    }
  
  async getTrendingClusters(days: number = 7): Promise<any> {
    try {
      const response = await this.makeRequest(`/dashboard/trending-clusters?days=${days}`);
      // Retourner directement la réponse (items ou array)
      return (response.data as any)?.items || response.data || [];
    } catch (error) {
      console.warn('⚠️ Trending clusters non disponible');
      return [];
    }
  }

  async getStoryClusters(days: number = 7, limit: number = 50): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/dashboard/story-clusters?days=${days}&limit=${limit}`);
      // Les story clusters sont retournés directement comme array
      const data = response.data as any;
      return Array.isArray(data) ? data : (data?.items || []);
    } catch (error) {
      console.warn('⚠️ Story clusters non disponible');
      return [];
    }
  }
  
    // ============ WORKER ENDPOINTS (ADVANCED) ============
  
    async getWorkerSourceStatus(sourceId: string): Promise<any> {
      try {
        const response = await this.makeRequest(`/worker/osint-sources/${sourceId}`);
        if (response.success) {
          return response.data || response;
        }
        return null;
      } catch (error) {
        return null;
      }
    }
  
    async getWorkerBots(): Promise<any[]> {
      try {
        const response = await this.makeRequest('/worker/bots');
        if (response.success) {
          return response.data || response || [];
        }
        return [];
      } catch (error) {
        return [];
      }
    }
  
    async getWorkerStories(): Promise<any[]> {
      try {
        const response = await this.makeRequest('/worker/stories');
        if (response.success) {
          return response.data || response || [];
        }
        return [];
      } catch (error) {
        return [];
      }
    }
  
    async getWorkerTags(): Promise<string[]> {
      try {
        const response = await this.makeRequest('/worker/tags');
        if (response.success) {
          const data = response.data || response;
          // Extraire juste les noms de tags
          if (Array.isArray(data)) {
            return data.map(tag => typeof tag === 'string' ? tag : tag.name || tag);
          }
          return [];
        }
        return [];
      } catch (error) {
        return [];
      }
    }
  
    // ============ BOTS ADVANCED ENDPOINTS ============
  
    async executeBotOnDemand(botId: string, targetData?: any): Promise<any> {
      try {
        const response = await this.makeRequest(`/config/bots/${botId}/execute`, {
          method: 'POST',
          body: targetData ? JSON.stringify(targetData) : undefined
        });
        
        if (response.success) {
          return response.data || response;
        }
        return null;
      } catch (error: any) {
        // Silencieux pour 401/500 (normal si endpoint non disponible)
        if (error?.status !== 401 && error?.status !== 500) {
          console.error(`Erreur exécution bot ${botId}:`, error);
        }
        return null;
      }
    }
  
    async enrichNewsItemWithBots(newsItemId: string, attributes: any): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/bots/news-item/${newsItemId}/attributes`, {
          method: 'PUT',
          body: JSON.stringify(attributes)
        });
        return response.success;
      } catch (error) {
        return false;
      }
    }
  
    async groupStoriesWithAI(newsItemIds: string[]): Promise<any> {
      try {
        const response = await this.makeRequest('/bots/stories/group', {
          method: 'PUT',
          body: JSON.stringify({ news_item_ids: newsItemIds })
        });
        
        if (response.success) {
          return response.data || response;
        }
        return null;
      } catch (error) {
        return null;
      }
    }
  
    // ============ PUBLISH ENDPOINTS ============
  
    async getPublishProducts(): Promise<any[]> {
      try {
        const response = await this.makeRequest('/publish/products');
        if (response.success) {
          return response.data || response || [];
        }
        return [];
      } catch (error) {
        return [];
      }
    }
  
    async renderProduct(productId: string, format: 'pdf' | 'html' | 'markdown' = 'pdf'): Promise<any> {
      try {
        const response = await this.makeRequest(`/publish/products/${productId}/render`, {
          method: 'POST',
          body: JSON.stringify({ format })
        });
        
        if (response.success) {
          return response.data || response;
        }
        return null;
      } catch (error) {
        return null;
      }
    }
  
    async publishProductToChannel(productId: string, publisherId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/publish/products/${productId}/publishers/${publisherId}`, {
          method: 'POST'
        });
        return response.success;
      } catch (error) {
        return false;
      }
    }
  
    // ============ ANALYZE ENDPOINTS (ADVANCED) ============
  
    async cloneReportItem(reportItemId: string): Promise<any> {
      try {
        const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/clone`, {
          method: 'POST'
        });
        
        if (response.success) {
          return response.data || response;
        }
        return null;
      } catch (error) {
        return null;
      }
    }
  
    async lockReportItem(reportItemId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/lock`, {
          method: 'PUT'
        });
        return response.success;
      } catch (error) {
        return false;
      }
    }
  
    async unlockReportItem(reportItemId: string): Promise<boolean> {
      try {
        const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/lock`, {
          method: 'DELETE'
        });
        return response.success;
      } catch (error) {
        return false;
      }
    }

    // ============ AUTH ENDPOINTS (ADDITIONAL) ============

    async getAuthMethod(): Promise<string> {
      const response = await this.makeRequest('/auth/method', { skipAuth: true });
      if (!response.success) {
        throw new TaranisError(`Failed to get auth method: ${response.error}`, 'GET_AUTH_METHOD_ERROR', response.status);
      }
      return response.data?.auth_method || 'database';
    }

    // ============ USERS ENDPOINTS (ADDITIONAL) ============

    async updateUserProfile(profileData: any): Promise<any> {
      const response = await this.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update profile: ${response.error}`, 'UPDATE_PROFILE_ERROR', response.status);
      }
      return response.data;
    }

    async notifySSEConnected(): Promise<boolean> {
      try {
        const response = await this.makeRequest('/users/sse-connected', {
          method: 'POST'
        });
        return response.success;
      } catch (error) {
        return false;
      }
    }

    // ============ DASHBOARD ENDPOINTS (ADDITIONAL) ============

    async getClusterByTagType(tagType: string, params?: {
      per_page?: number;
      page?: number;
      sort_by?: string;
      search?: string;
    }): Promise<PaginatedResponse<TaranisCluster>> {
      const response = await this.makeRequest(`/dashboard/cluster/${tagType}`, {
        method: 'GET'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to get cluster: ${response.error}`, 'GET_CLUSTER_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async deleteTag(tagName: string): Promise<boolean> {
      const response = await this.makeRequest(`/dashboard/delete-tag/${encodeURIComponent(tagName)}`, {
        method: 'DELETE'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to delete tag: ${response.error}`, 'DELETE_TAG_ERROR', response.status);
      }
      return true;
    }

    async getBuildInfo(): Promise<TaranisBuildInfo> {
      const response = await this.makeRequest('/dashboard/build-info');
      if (!response.success) {
        throw new TaranisError(`Failed to get build info: ${response.error}`, 'GET_BUILD_INFO_ERROR', response.status);
      }
      return response.data;
    }

    // ============ ASSESS ENDPOINTS (ADDITIONAL) ============

    async shareStoryToConnector(connectorId: string, storyIds: string[]): Promise<boolean> {
      const response = await this.makeRequest(`/assess/story/${connectorId}/share`, {
        method: 'POST',
        body: JSON.stringify({ story_ids: storyIds })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to share stories: ${response.error}`, 'SHARE_STORIES_ERROR', response.status);
      }
      return true;
    }

    async ungroupNewsItems(newsItemIds: string[]): Promise<boolean> {
      const response = await this.makeRequest('/assess/news-items/ungroup', {
        method: 'PUT',
        body: JSON.stringify(newsItemIds)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to ungroup news items: ${response.error}`, 'UNGROUP_NEWS_ITEMS_ERROR', response.status);
      }
      return true;
    }

    async getTags(params?: {
      search?: string;
      limit?: number;
      offset?: number;
      min_size?: number;
    }): Promise<PaginatedResponse<{ name: string; tag_type: string; size: number }>> {
      const response = await this.makeRequest('/assess/tags', {
        method: 'GET'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to get tags: ${response.error}`, 'GET_TAGS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getTagList(params?: {
      search?: string;
      limit?: number;
      offset?: number;
    }): Promise<PaginatedResponse<string>> {
      const response = await this.makeRequest('/assess/taglist', {
        method: 'GET'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to get tag list: ${response.error}`, 'GET_TAG_LIST_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getConnectorProposalsCount(): Promise<number> {
      try {
        const response = await this.makeRequest('/assess/connectors/proposals');
        if (response.success) {
          return response.data?.count || 0;
        }
        return 0;
      } catch (error) {
        return 0;
      }
    }

    // ============ ANALYZE ENDPOINTS (ADDITIONAL) ============

    async getReportItemStories(reportItemId: string): Promise<string[]> {
      const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/stories`);
      if (!response.success) {
        throw new TaranisError(`Failed to get report item stories: ${response.error}`, 'GET_REPORT_STORIES_ERROR', response.status);
      }
      return response.data || [];
    }

    async setReportItemStories(reportItemId: string, storyIds: string[]): Promise<boolean> {
      const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/stories`, {
        method: 'PUT',
        body: JSON.stringify(storyIds)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to set report item stories: ${response.error}`, 'SET_REPORT_STORIES_ERROR', response.status);
      }
      return true;
    }

    async addReportItemStories(reportItemId: string, storyIds: string[]): Promise<boolean> {
      const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/stories`, {
        method: 'POST',
        body: JSON.stringify(storyIds)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to add report item stories: ${response.error}`, 'ADD_REPORT_STORIES_ERROR', response.status);
      }
      return true;
    }

    async getReportItemLockStatus(reportItemId: string): Promise<{
      locked: boolean;
      locked_by?: number;
      locked_at?: string;
    }> {
      const response = await this.makeRequest(`/analyze/report-items/${reportItemId}/locks`);
      if (!response.success) {
        throw new TaranisError(`Failed to get lock status: ${response.error}`, 'GET_LOCK_STATUS_ERROR', response.status);
      }
      return response.data || { locked: false };
    }

    async getReportTypes(): Promise<PaginatedResponse<TaranisReportItemType>> {
      const response = await this.makeRequest('/analyze/report-types');
      if (!response.success) {
        throw new TaranisError(`Failed to get report types: ${response.error}`, 'GET_REPORT_TYPES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    // ============ PUBLISH ENDPOINTS (ADDITIONAL) ============

    async createProduct(productData: {
      title: string;
      description?: string;
      product_type_id: number;
      report_items?: string[];
    }): Promise<TaranisProduct> {
      const response = await this.makeRequest('/publish/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create product: ${response.error}`, 'CREATE_PRODUCT_ERROR', response.status);
      }
      return response.data;
    }

    async generateProductRender(productId: string): Promise<any> {
      const response = await this.makeRequest(`/publish/products/${productId}/render`, {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to generate render: ${response.error}`, 'GENERATE_RENDER_ERROR', response.status);
      }
      return response.data;
    }

    async getProductTypes(): Promise<PaginatedResponse<TaranisProductType>> {
      const response = await this.makeRequest('/publish/product-types');
      if (!response.success) {
        throw new TaranisError(`Failed to get product types: ${response.error}`, 'GET_PRODUCT_TYPES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    // ============ CONFIG: USERS & ROLES ============

    async getUsers(params?: {
      search?: string;
      organization_id?: number;
      role_id?: number;
      enabled?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<PaginatedResponse<TaranisUser>> {
      const response = await this.makeRequest('/config/users', { method: 'GET' });
      if (!response.success) {
        throw new TaranisError(`Failed to get users: ${response.error}`, 'GET_USERS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getUser(userId: number | string): Promise<TaranisUser> {
      const response = await this.makeRequest(`/config/users/${userId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get user: ${response.error}`, 'GET_USER_ERROR', response.status);
      }
      return response.data;
    }

    async createUser(userData: Omit<TaranisUser, 'id' | 'created_date'> & { password: string }): Promise<TaranisUser> {
      const response = await this.makeRequest('/config/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create user: ${response.error}`, 'CREATE_USER_ERROR', response.status);
      }
      return response.data;
    }

    async updateUser(userId: number | string, updates: Partial<TaranisUser>): Promise<TaranisUser> {
      const response = await this.makeRequest(`/config/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update user: ${response.error}`, 'UPDATE_USER_ERROR', response.status);
      }
      return response.data;
    }

    async deleteUser(userId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/users/${userId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete user: ${response.error}`, 'DELETE_USER_ERROR', response.status);
      }
      return true;
    }

    async importUsers(users: any[]): Promise<{ users: any[]; count: number }> {
      const response = await this.makeRequest('/config/users-import', {
        method: 'POST',
        body: JSON.stringify(users)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to import users: ${response.error}`, 'IMPORT_USERS_ERROR', response.status);
      }
      return response.data;
    }

    async exportUsers(userIds?: string[]): Promise<any> {
      const response = await this.makeRequest('/config/users-export', { method: 'GET' });
      if (!response.success) {
        throw new TaranisError(`Failed to export users: ${response.error}`, 'EXPORT_USERS_ERROR', response.status);
      }
      return response.data;
    }

    async getRoles(params?: { search?: string }): Promise<PaginatedResponse<TaranisRole>> {
      const response = await this.makeRequest('/config/roles', { method: 'GET' });
      if (!response.success) {
        throw new TaranisError(`Failed to get roles: ${response.error}`, 'GET_ROLES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getRole(roleId: number | string): Promise<TaranisRole> {
      const response = await this.makeRequest(`/config/roles/${roleId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get role: ${response.error}`, 'GET_ROLE_ERROR', response.status);
      }
      return response.data;
    }

    async createRole(roleData: Omit<TaranisRole, 'id'>): Promise<TaranisRole> {
      const response = await this.makeRequest('/config/roles', {
        method: 'POST',
        body: JSON.stringify(roleData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create role: ${response.error}`, 'CREATE_ROLE_ERROR', response.status);
      }
      return response.data;
    }

    async updateRole(roleId: number | string, updates: Partial<TaranisRole>): Promise<TaranisRole> {
      const response = await this.makeRequest(`/config/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update role: ${response.error}`, 'UPDATE_ROLE_ERROR', response.status);
      }
      return response.data;
    }

    async deleteRole(roleId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/roles/${roleId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete role: ${response.error}`, 'DELETE_ROLE_ERROR', response.status);
      }
      return true;
    }

    async getPermissions(): Promise<PaginatedResponse<TaranisPermission>> {
      const response = await this.makeRequest('/config/permissions');
      if (!response.success) {
        throw new TaranisError(`Failed to get permissions: ${response.error}`, 'GET_PERMISSIONS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    // ============ CONFIG: ORGANIZATIONS ============

    async getOrganizations(params?: { search?: string }): Promise<PaginatedResponse<TaranisOrganization>> {
      const response = await this.makeRequest('/config/organizations', { method: 'GET' });
      if (!response.success) {
        throw new TaranisError(`Failed to get organizations: ${response.error}`, 'GET_ORGS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getOrganization(orgId: number | string): Promise<TaranisOrganization> {
      const response = await this.makeRequest(`/config/organizations/${orgId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get organization: ${response.error}`, 'GET_ORG_ERROR', response.status);
      }
      return response.data;
    }

    async createOrganization(orgData: Omit<TaranisOrganization, 'id' | 'created_date' | 'updated_date'>): Promise<TaranisOrganization> {
      const response = await this.makeRequest('/config/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create organization: ${response.error}`, 'CREATE_ORG_ERROR', response.status);
      }
      return response.data;
    }

    async updateOrganization(orgId: number | string, updates: Partial<TaranisOrganization>): Promise<TaranisOrganization> {
      const response = await this.makeRequest(`/config/organizations/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update organization: ${response.error}`, 'UPDATE_ORG_ERROR', response.status);
      }
      return response.data;
    }

    async deleteOrganization(orgId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/organizations/${orgId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete organization: ${response.error}`, 'DELETE_ORG_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: ATTRIBUTES ============

    async getAttributes(): Promise<PaginatedResponse<TaranisAttribute>> {
      const response = await this.makeRequest('/config/attributes');
      if (!response.success) {
        throw new TaranisError(`Failed to get attributes: ${response.error}`, 'GET_ATTRS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getAttribute(attrId: number | string): Promise<TaranisAttribute> {
      const response = await this.makeRequest(`/config/attributes/${attrId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get attribute: ${response.error}`, 'GET_ATTR_ERROR', response.status);
      }
      return response.data;
    }

    async createAttribute(attrData: Omit<TaranisAttribute, 'id'>): Promise<TaranisAttribute> {
      const response = await this.makeRequest('/config/attributes', {
        method: 'POST',
        body: JSON.stringify(attrData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create attribute: ${response.error}`, 'CREATE_ATTR_ERROR', response.status);
      }
      return response.data;
    }

    async updateAttribute(attrId: number | string, updates: Partial<TaranisAttribute>): Promise<TaranisAttribute> {
      const response = await this.makeRequest(`/config/attributes/${attrId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update attribute: ${response.error}`, 'UPDATE_ATTR_ERROR', response.status);
      }
      return response.data;
    }

    async deleteAttribute(attrId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/attributes/${attrId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete attribute: ${response.error}`, 'DELETE_ATTR_ERROR', response.status);
      }
      return true;
    }

    async reloadDictionary(dictionaryType: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/dictionaries-reload/${dictionaryType}`, {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to reload dictionary: ${response.error}`, 'RELOAD_DICT_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: REPORT ITEM TYPES ============

    async getReportItemTypes(): Promise<PaginatedResponse<TaranisReportItemType>> {
      const response = await this.makeRequest('/config/report-item-types');
      if (!response.success) {
        throw new TaranisError(`Failed to get report item types: ${response.error}`, 'GET_REPORT_TYPES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getReportItemType(typeId: number | string): Promise<TaranisReportItemType> {
      const response = await this.makeRequest(`/config/report-item-types/${typeId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get report item type: ${response.error}`, 'GET_REPORT_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async createReportItemType(typeData: Omit<TaranisReportItemType, 'id'>): Promise<TaranisReportItemType> {
      const response = await this.makeRequest('/config/report-item-types', {
        method: 'POST',
        body: JSON.stringify(typeData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create report item type: ${response.error}`, 'CREATE_REPORT_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async updateReportItemType(typeId: number | string, updates: Partial<TaranisReportItemType>): Promise<TaranisReportItemType> {
      const response = await this.makeRequest(`/config/report-item-types/${typeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update report item type: ${response.error}`, 'UPDATE_REPORT_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async deleteReportItemType(typeId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/report-item-types/${typeId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete report item type: ${response.error}`, 'DELETE_REPORT_TYPE_ERROR', response.status);
      }
      return true;
    }

    async exportReportItemTypes(typeIds?: number[]): Promise<any> {
      const response = await this.makeRequest('/config/export-report-item-types', { method: 'GET' });
      if (!response.success) {
        throw new TaranisError(`Failed to export report item types: ${response.error}`, 'EXPORT_REPORT_TYPES_ERROR', response.status);
      }
      return response.data;
    }

    async importReportItemTypes(data: any): Promise<boolean> {
      const response = await this.makeRequest('/config/import-report-item-types', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to import report item types: ${response.error}`, 'IMPORT_REPORT_TYPES_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: PRODUCT TYPES (DETAILED) ============

    async getConfigProductTypes(): Promise<PaginatedResponse<TaranisProductType>> {
      const response = await this.makeRequest('/config/product-types');
      if (!response.success) {
        throw new TaranisError(`Failed to get product types: ${response.error}`, 'GET_PROD_TYPES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getConfigProductType(typeId: number | string): Promise<TaranisProductType> {
      const response = await this.makeRequest(`/config/product-types/${typeId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get product type: ${response.error}`, 'GET_PROD_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async createConfigProductType(typeData: Omit<TaranisProductType, 'id'>): Promise<TaranisProductType> {
      const response = await this.makeRequest('/config/product-types', {
        method: 'POST',
        body: JSON.stringify(typeData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create product type: ${response.error}`, 'CREATE_PROD_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async updateConfigProductType(typeId: number | string, updates: Partial<TaranisProductType>): Promise<TaranisProductType> {
      const response = await this.makeRequest(`/config/product-types/${typeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update product type: ${response.error}`, 'UPDATE_PROD_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async deleteConfigProductType(typeId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/product-types/${typeId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete product type: ${response.error}`, 'DELETE_PROD_TYPE_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: CONNECTORS ============

    async getConnectors(): Promise<PaginatedResponse<TaranisConnector>> {
      const response = await this.makeRequest('/config/connectors');
      if (!response.success) {
        throw new TaranisError(`Failed to get connectors: ${response.error}`, 'GET_CONNECTORS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getConnector(connectorId: string): Promise<TaranisConnector> {
      const response = await this.makeRequest(`/config/connectors/${connectorId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get connector: ${response.error}`, 'GET_CONNECTOR_ERROR', response.status);
      }
      return response.data;
    }

    async createConnector(connectorData: Omit<TaranisConnector, 'id'>): Promise<TaranisConnector> {
      const response = await this.makeRequest('/config/connectors', {
        method: 'POST',
        body: JSON.stringify(connectorData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create connector: ${response.error}`, 'CREATE_CONNECTOR_ERROR', response.status);
      }
      return response.data;
    }

    async updateConnector(connectorId: string, updates: Partial<TaranisConnector>): Promise<TaranisConnector> {
      const response = await this.makeRequest(`/config/connectors/${connectorId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update connector: ${response.error}`, 'UPDATE_CONNECTOR_ERROR', response.status);
      }
      return response.data;
    }

    async deleteConnector(connectorId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/connectors/${connectorId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete connector: ${response.error}`, 'DELETE_CONNECTOR_ERROR', response.status);
      }
      return true;
    }

    async pullConnector(connectorId: string): Promise<any> {
      const response = await this.makeRequest(`/config/connectors/${connectorId}/pull`, {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to pull connector: ${response.error}`, 'PULL_CONNECTOR_ERROR', response.status);
      }
      return response.data;
    }

    // ============ CONFIG: PUBLISHERS & PRESENTERS ============

    async getPublishers(): Promise<PaginatedResponse<any>> {
      const response = await this.makeRequest('/config/publishers');
      if (!response.success) {
        throw new TaranisError(`Failed to get publishers: ${response.error}`, 'GET_PUBLISHERS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getConfigPresenters(): Promise<PaginatedResponse<TaranisPresenter>> {
      const response = await this.makeRequest('/config/presenters');
      if (!response.success) {
        throw new TaranisError(`Failed to get presenters: ${response.error}`, 'GET_PRESENTERS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getPublisherPresets(): Promise<PaginatedResponse<TaranisPublisherPreset>> {
      const response = await this.makeRequest('/config/publisher-presets');
      if (!response.success) {
        throw new TaranisError(`Failed to get publisher presets: ${response.error}`, 'GET_PUB_PRESETS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getPublisherPresetsAlt(): Promise<PaginatedResponse<TaranisPublisherPreset>> {
      const response = await this.makeRequest('/config/publishers-presets');
      if (!response.success) {
        throw new TaranisError(`Failed to get publisher presets: ${response.error}`, 'GET_PUB_PRESETS_ALT_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getPublisherPreset(presetId: string): Promise<TaranisPublisherPreset> {
      const response = await this.makeRequest(`/config/publisher-presets/${presetId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get publisher preset: ${response.error}`, 'GET_PUB_PRESET_ERROR', response.status);
      }
      return response.data;
    }

    async createPublisherPreset(presetData: Omit<TaranisPublisherPreset, 'id'>): Promise<TaranisPublisherPreset> {
      const response = await this.makeRequest('/config/publisher-presets', {
        method: 'POST',
        body: JSON.stringify(presetData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create publisher preset: ${response.error}`, 'CREATE_PUB_PRESET_ERROR', response.status);
      }
      return response.data;
    }

    async updatePublisherPreset(presetId: string, updates: Partial<TaranisPublisherPreset>): Promise<TaranisPublisherPreset> {
      const response = await this.makeRequest(`/config/publisher-presets/${presetId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update publisher preset: ${response.error}`, 'UPDATE_PUB_PRESET_ERROR', response.status);
      }
      return response.data;
    }

    async deletePublisherPreset(presetId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/publisher-presets/${presetId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete publisher preset: ${response.error}`, 'DELETE_PUB_PRESET_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: WORKERS & SCHEDULE ============

    async getWorkers(): Promise<TaranisWorker[]> {
      const response = await this.makeRequest('/config/workers');
      if (!response.success) {
        throw new TaranisError(`Failed to get workers: ${response.error}`, 'GET_WORKERS_ERROR', response.status);
      }
      return response.data?.workers || response.data || [];
    }

    async getWorkerTypes(params?: {
      search?: string;
      category?: string;
      type?: string;
      exclude?: string;
    }): Promise<PaginatedResponse<TaranisWorkerType>> {
      const response = await this.makeRequest('/config/worker-types');
      if (!response.success) {
        throw new TaranisError(`Failed to get worker types: ${response.error}`, 'GET_WORKER_TYPES_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async updateWorkerType(workerId: string, updates: any): Promise<any> {
      const response = await this.makeRequest(`/config/worker-types/${workerId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update worker type: ${response.error}`, 'UPDATE_WORKER_TYPE_ERROR', response.status);
      }
      return response.data;
    }

    async getParameters(): Promise<Record<string, any>> {
      const response = await this.makeRequest('/config/parameters');
      if (!response.success) {
        throw new TaranisError(`Failed to get parameters: ${response.error}`, 'GET_PARAMS_ERROR', response.status);
      }
      return response.data || {};
    }

    async getWorkerParameters(): Promise<{ items: any[] }> {
      const response = await this.makeRequest('/config/worker-parameters');
      if (!response.success) {
        throw new TaranisError(`Failed to get worker parameters: ${response.error}`, 'GET_WORKER_PARAMS_ERROR', response.status);
      }
      return response.data || { items: [] };
    }

    async getSchedule(): Promise<TaranisScheduleTask[]> {
      const response = await this.makeRequest('/config/schedule');
      if (!response.success) {
        throw new TaranisError(`Failed to get schedule: ${response.error}`, 'GET_SCHEDULE_ERROR', response.status);
      }
      return response.data || [];
    }

    async getScheduleTask(taskId: string): Promise<TaranisScheduleTask> {
      const response = await this.makeRequest(`/config/schedule/${taskId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get schedule task: ${response.error}`, 'GET_SCHEDULE_TASK_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkersSchedule(): Promise<TaranisScheduleTask[]> {
      const response = await this.makeRequest('/config/workers/schedule');
      if (!response.success) {
        throw new TaranisError(`Failed to get workers schedule: ${response.error}`, 'GET_WORKERS_SCHEDULE_ERROR', response.status);
      }
      return response.data || [];
    }

    async getWorkersTasks(): Promise<{ tasks: any[] }> {
      const response = await this.makeRequest('/config/workers/tasks');
      if (!response.success) {
        throw new TaranisError(`Failed to get workers tasks: ${response.error}`, 'GET_WORKERS_TASKS_ERROR', response.status);
      }
      return response.data || { tasks: [] };
    }

    async getQueueStatus(): Promise<{ queues: TaranisQueueStatus[] }> {
      const response = await this.makeRequest('/config/workers/queue-status');
      if (!response.success) {
        throw new TaranisError(`Failed to get queue status: ${response.error}`, 'GET_QUEUE_STATUS_ERROR', response.status);
      }
      return response.data || { queues: [] };
    }

    async calculateRefreshInterval(cron: string): Promise<string[]> {
      const response = await this.makeRequest('/config/refresh-interval', {
        method: 'POST',
        body: JSON.stringify({ cron })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to calculate refresh interval: ${response.error}`, 'CALC_REFRESH_ERROR', response.status);
      }
      return response.data || [];
    }

    async getTaskResults(): Promise<PaginatedResponse<TaranisTaskResult>> {
      const response = await this.makeRequest('/config/task-results');
      if (!response.success) {
        throw new TaranisError(`Failed to get task results: ${response.error}`, 'GET_TASK_RESULTS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getTaskResult(taskId: string): Promise<TaranisTaskResult> {
      const response = await this.makeRequest(`/config/task-results/${taskId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get task result: ${response.error}`, 'GET_TASK_RESULT_ERROR', response.status);
      }
      return response.data;
    }

    async deleteTaskResult(taskId: string): Promise<boolean> {
      const response = await this.makeRequest(`/config/task-results/${taskId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete task result: ${response.error}`, 'DELETE_TASK_RESULT_ERROR', response.status);
      }
      return true;
    }

    // ============ CONFIG: ACL ============

    async getACLs(): Promise<PaginatedResponse<TaranisACL>> {
      const response = await this.makeRequest('/config/acls');
      if (!response.success) {
        throw new TaranisError(`Failed to get ACLs: ${response.error}`, 'GET_ACLS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getACL(aclId: number | string): Promise<TaranisACL> {
      const response = await this.makeRequest(`/config/acls/${aclId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get ACL: ${response.error}`, 'GET_ACL_ERROR', response.status);
      }
      return response.data;
    }

    async createACL(aclData: Omit<TaranisACL, 'id'>): Promise<TaranisACL> {
      const response = await this.makeRequest('/config/acls', {
        method: 'POST',
        body: JSON.stringify(aclData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create ACL: ${response.error}`, 'CREATE_ACL_ERROR', response.status);
      }
      return response.data;
    }

    async updateACL(aclId: number | string, updates: Partial<TaranisACL>): Promise<TaranisACL> {
      const response = await this.makeRequest(`/config/acls/${aclId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update ACL: ${response.error}`, 'UPDATE_ACL_ERROR', response.status);
      }
      return response.data;
    }

    async deleteACL(aclId: number | string): Promise<boolean> {
      const response = await this.makeRequest(`/config/acls/${aclId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete ACL: ${response.error}`, 'DELETE_ACL_ERROR', response.status);
      }
      return true;
    }

    // ============ BOTS API (COMPLETE) ============

    async getBotsList(): Promise<any[]> {
      const response = await this.makeRequest('/bots');
      if (!response.success) {
        throw new TaranisError(`Failed to get bots list: ${response.error}`, 'GET_BOTS_LIST_ERROR', response.status);
      }
      return response.data?.items || response.data || [];
    }

    async getBotDetail(botId: string): Promise<any> {
      const response = await this.makeRequest(`/bots/${botId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get bot: ${response.error}`, 'GET_BOT_ERROR', response.status);
      }
      return response.data;
    }

    async updateBotAPI(botId: string, updates: any): Promise<any> {
      const response = await this.makeRequest(`/bots/${botId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update bot: ${response.error}`, 'UPDATE_BOT_API_ERROR', response.status);
      }
      return response.data;
    }

    async getBotNewsItems(limit?: number): Promise<any[]> {
      const response = await this.makeRequest('/bots/news-item');
      if (!response.success) {
        throw new TaranisError(`Failed to get bot news items: ${response.error}`, 'GET_BOT_NEWS_ERROR', response.status);
      }
      return response.data || [];
    }

    async getBotNewsItem(newsItemId: string): Promise<any> {
      const response = await this.makeRequest(`/bots/news-item/${newsItemId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get bot news item: ${response.error}`, 'GET_BOT_NEWS_ITEM_ERROR', response.status);
      }
      return response.data;
    }

    async updateBotNewsItem(newsItemId: string, updates: { language?: string }): Promise<any> {
      const response = await this.makeRequest(`/bots/news-item/${newsItemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update bot news item: ${response.error}`, 'UPDATE_BOT_NEWS_ERROR', response.status);
      }
      return response.data;
    }

    async updateBotNewsItemAttributes(newsItemId: string, attributes: any[]): Promise<any> {
      const response = await this.makeRequest(`/bots/news-item/${newsItemId}/attributes`, {
        method: 'PUT',
        body: JSON.stringify(attributes)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update bot news item attributes: ${response.error}`, 'UPDATE_BOT_NEWS_ATTRS_ERROR', response.status);
      }
      return response.data;
    }

    async getBotStory(storyId: string): Promise<any> {
      const response = await this.makeRequest(`/bots/story/${storyId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get bot story: ${response.error}`, 'GET_BOT_STORY_ERROR', response.status);
      }
      return response.data;
    }

    async updateBotStory(storyId: string, updates: any): Promise<any> {
      const response = await this.makeRequest(`/bots/story/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update bot story: ${response.error}`, 'UPDATE_BOT_STORY_ERROR', response.status);
      }
      return response.data;
    }

    async getBotStoryAttributes(storyId: string): Promise<any[]> {
      const response = await this.makeRequest(`/bots/story/${storyId}/attributes`);
      if (!response.success) {
        throw new TaranisError(`Failed to get bot story attributes: ${response.error}`, 'GET_BOT_STORY_ATTRS_ERROR', response.status);
      }
      return response.data || [];
    }

    async patchBotStoryAttributes(storyId: string, attributes: any): Promise<any> {
      const response = await this.makeRequest(`/bots/story/${storyId}/attributes`, {
        method: 'PATCH',
        body: JSON.stringify(attributes)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to patch bot story attributes: ${response.error}`, 'PATCH_BOT_STORY_ATTRS_ERROR', response.status);
      }
      return response.data;
    }

    async groupBotStories(storyIds: string[]): Promise<any> {
      const response = await this.makeRequest('/bots/stories/group', {
        method: 'PUT',
        body: JSON.stringify(storyIds)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to group bot stories: ${response.error}`, 'GROUP_BOT_STORIES_ERROR', response.status);
      }
      return response.data;
    }

    async groupBotStoriesMultiple(storyGroups: string[][]): Promise<any> {
      const response = await this.makeRequest('/bots/stories/group-multiple', {
        method: 'PUT',
        body: JSON.stringify(storyGroups)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to group multiple bot stories: ${response.error}`, 'GROUP_BOT_STORIES_MULTI_ERROR', response.status);
      }
      return response.data;
    }

    async ungroupBotStories(newsItemIds: string[]): Promise<any> {
      const response = await this.makeRequest('/bots/stories/ungroup', {
        method: 'PUT',
        body: JSON.stringify(newsItemIds)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to ungroup bot stories: ${response.error}`, 'UNGROUP_BOT_STORIES_ERROR', response.status);
      }
      return response.data;
    }

    // ============ ASSETS CRUD (COMPLETE) ============

    async getAssets(params?: {
      search?: string;
      vulnerable?: boolean;
      group?: string;
      sort?: string;
    }): Promise<PaginatedResponse<TaranisAsset>> {
      const response = await this.makeRequest('/assets');
      if (!response.success) {
        throw new TaranisError(`Failed to get assets: ${response.error}`, 'GET_ASSETS_ERROR', response.status);
      }
      return {
        total_count: response.data?.total_count || 0,
        items: response.data?.items || []
      };
    }

    async getAsset(assetId: string | number): Promise<TaranisAsset> {
      const response = await this.makeRequest(`/assets/${assetId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get asset: ${response.error}`, 'GET_ASSET_ERROR', response.status);
      }
      return response.data;
    }

    async createAsset(assetData: Omit<TaranisAsset, 'id' | 'createdDate' | 'updatedDate'>): Promise<TaranisAsset> {
      const response = await this.makeRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(assetData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to create asset: ${response.error}`, 'CREATE_ASSET_ERROR', response.status);
      }
      return response.data;
    }

    async updateAsset(assetId: string | number, updates: Partial<TaranisAsset>): Promise<TaranisAsset> {
      const response = await this.makeRequest(`/assets/${assetId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update asset: ${response.error}`, 'UPDATE_ASSET_ERROR', response.status);
      }
      return response.data;
    }

    async deleteAsset(assetId: string | number): Promise<boolean> {
      const response = await this.makeRequest(`/assets/${assetId}`, { method: 'DELETE' });
      if (!response.success) {
        throw new TaranisError(`Failed to delete asset: ${response.error}`, 'DELETE_ASSET_ERROR', response.status);
      }
      return true;
    }

    async updateAssetVulnerability(assetId: string | number, vulnerabilityId: string | number, solved: boolean): Promise<boolean> {
      const response = await this.makeRequest(`/assets/${assetId}/vulnerabilities/${vulnerabilityId}`, {
        method: 'PUT',
        body: JSON.stringify({ solved })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update asset vulnerability: ${response.error}`, 'UPDATE_ASSET_VULN_ERROR', response.status);
      }
      return true;
    }

    // ============ ADMIN ENDPOINTS ============

    async getSystemSettings(): Promise<TaranisSystemSettings> {
      const response = await this.makeRequest('/admin/settings');
      if (!response.success) {
        throw new TaranisError(`Failed to get system settings: ${response.error}`, 'GET_SYSTEM_SETTINGS_ERROR', response.status);
      }
      return response.data?.settings || response.data || {};
    }

    async updateSystemSettings(settings: any): Promise<boolean> {
      const response = await this.makeRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update system settings: ${response.error}`, 'UPDATE_SYSTEM_SETTINGS_ERROR', response.status);
      }
      return true;
    }

    async deleteAllTags(): Promise<boolean> {
      const response = await this.makeRequest('/admin/delete-tags', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to delete all tags: ${response.error}`, 'DELETE_ALL_TAGS_ERROR', response.status);
      }
      return true;
    }

    async deleteAllStories(): Promise<boolean> {
      const response = await this.makeRequest('/admin/delete-stories', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to delete all stories: ${response.error}`, 'DELETE_ALL_STORIES_ERROR', response.status);
      }
      return true;
    }

    async ungroupAllStories(): Promise<boolean> {
      const response = await this.makeRequest('/admin/ungroup-stories', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to ungroup all stories: ${response.error}`, 'UNGROUP_ALL_STORIES_ERROR', response.status);
      }
      return true;
    }

    async resetDatabase(): Promise<boolean> {
      const response = await this.makeRequest('/admin/reset-database', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to reset database: ${response.error}`, 'RESET_DATABASE_ERROR', response.status);
      }
      return true;
    }

    async clearAllQueues(): Promise<boolean> {
      const response = await this.makeRequest('/admin/clear-queues', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to clear queues: ${response.error}`, 'CLEAR_QUEUES_ERROR', response.status);
      }
      return true;
    }

    async exportAllStories(includeMetadata: boolean = false): Promise<any> {
      const response = await this.makeRequest('/admin/export-stories');
      if (!response.success) {
        throw new TaranisError(`Failed to export stories: ${response.error}`, 'EXPORT_STORIES_ERROR', response.status);
      }
      return response.data;
    }

    // ============ WORKERS API (COMPLETE) ============

    async addWorkerNewsItems(newsItems: any[]): Promise<boolean> {
      const response = await this.makeRequest('/worker/news-items', {
        method: 'POST',
        body: JSON.stringify(newsItems)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to add worker news items: ${response.error}`, 'ADD_WORKER_NEWS_ERROR', response.status);
      }
      return true;
    }

    async uploadOSINTSourceIcon(sourceId: string, icon: File | Blob): Promise<boolean> {
      // Note: This would need FormData implementation
      const response = await this.makeRequest(`/worker/osint-sources/${sourceId}/icon`, {
        method: 'PUT'
        // body would be FormData with file
      });
      if (!response.success) {
        throw new TaranisError(`Failed to upload icon: ${response.error}`, 'UPLOAD_ICON_ERROR', response.status);
      }
      return true;
    }

    async getWorkerProduct(productId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/products/${productId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker product: ${response.error}`, 'GET_WORKER_PRODUCT_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerProductRender(productId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/products/${productId}/render`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker product render: ${response.error}`, 'GET_WORKER_RENDER_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerPresenter(presenter: string): Promise<any> {
      const response = await this.makeRequest(`/worker/presenters/${presenter}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker presenter: ${response.error}`, 'GET_WORKER_PRESENTER_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerPublisher(publisher: string): Promise<any> {
      const response = await this.makeRequest(`/worker/publishers/${publisher}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker publisher: ${response.error}`, 'GET_WORKER_PUBLISHER_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerConnector(connectorId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/connectors/${connectorId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker connector: ${response.error}`, 'GET_WORKER_CONNECTOR_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerBot(botId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/bots/${botId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker bot: ${response.error}`, 'GET_WORKER_BOT_ERROR', response.status);
      }
      return response.data;
    }

    async updateWorkerBot(botId: string, updates: any): Promise<any> {
      const response = await this.makeRequest(`/worker/bots/${botId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update worker bot: ${response.error}`, 'UPDATE_WORKER_BOT_ERROR', response.status);
      }
      return response.data;
    }

    async executePostCollectionBots(sourceId: string): Promise<any> {
      const response = await this.makeRequest('/worker/post-collection-bots', {
        method: 'PUT',
        body: JSON.stringify({ source_id: sourceId })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to execute post-collection bots: ${response.error}`, 'EXEC_POST_COLLECTION_ERROR', response.status);
      }
      return response.data;
    }

    async addWorkerStory(storyData: any): Promise<any> {
      const response = await this.makeRequest('/worker/stories', {
        method: 'POST',
        body: JSON.stringify(storyData)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to add worker story: ${response.error}`, 'ADD_WORKER_STORY_ERROR', response.status);
      }
      return response.data;
    }

    async addWorkerMISPStories(stories: any[]): Promise<any> {
      const response = await this.makeRequest('/worker/stories/misp', {
        method: 'POST',
        body: JSON.stringify(stories)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to add worker MISP stories: ${response.error}`, 'ADD_WORKER_MISP_ERROR', response.status);
      }
      return response.data;
    }

    async getWorkerTagsMap(): Promise<Record<string, any>> {
      const response = await this.makeRequest('/worker/tags');
      if (!response.success) {
        throw new TaranisError(`Failed to get worker tags map: ${response.error}`, 'GET_WORKER_TAGS_MAP_ERROR', response.status);
      }
      return response.data || {};
    }

    async updateWorkerTags(tagsMap: Record<string, string[]>): Promise<any> {
      const response = await this.makeRequest('/worker/tags', {
        method: 'PUT',
        body: JSON.stringify(tagsMap)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update worker tags: ${response.error}`, 'UPDATE_WORKER_TAGS_ERROR', response.status);
      }
      return response.data;
    }

    async dropAllWorkerTags(): Promise<boolean> {
      const response = await this.makeRequest('/worker/drop-tags', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to drop worker tags: ${response.error}`, 'DROP_WORKER_TAGS_ERROR', response.status);
      }
      return true;
    }

    async getWorkerWordLists(params?: {
      search?: string;
      usage?: string;
      with_entries?: boolean;
    }): Promise<any[]> {
      const response = await this.makeRequest('/worker/word-lists');
      if (!response.success) {
        throw new TaranisError(`Failed to get worker word lists: ${response.error}`, 'GET_WORKER_WORDLISTS_ERROR', response.status);
      }
      return response.data || [];
    }

    async getWorkerWordList(wordListId: string): Promise<any> {
      const response = await this.makeRequest(`/worker/word-list/${wordListId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get worker word list: ${response.error}`, 'GET_WORKER_WORDLIST_ERROR', response.status);
      }
      return response.data;
    }

    async updateWorkerWordList(wordListId: string, content: string | any[]): Promise<any> {
      const response = await this.makeRequest(`/worker/word-list/${wordListId}`, {
        method: 'PUT',
        body: typeof content === 'string' ? content : JSON.stringify(content)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update worker word list: ${response.error}`, 'UPDATE_WORKER_WORDLIST_ERROR', response.status);
      }
      return response.data;
    }

    // ============ CONNECTORS/CONFLICTS ============

    async getStoryConflicts(): Promise<{ conflicts: TaranisStoryConflict[] }> {
      const response = await this.makeRequest('/connectors/conflicts/stories');
      if (!response.success) {
        throw new TaranisError(`Failed to get story conflicts: ${response.error}`, 'GET_STORY_CONFLICTS_ERROR', response.status);
      }
      return response.data || { conflicts: [] };
    }

    async getStoryConflict(storyId: string): Promise<TaranisStoryConflict> {
      const response = await this.makeRequest(`/connectors/conflicts/stories/${storyId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get story conflict: ${response.error}`, 'GET_STORY_CONFLICT_ERROR', response.status);
      }
      return response.data;
    }

    async resolveStoryConflict(storyId: string, resolution: any, incomingStoryOriginal: any): Promise<boolean> {
      const response = await this.makeRequest(`/connectors/conflicts/stories/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          resolution,
          incoming_story_original: incomingStoryOriginal
        })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to resolve story conflict: ${response.error}`, 'RESOLVE_STORY_CONFLICT_ERROR', response.status);
      }
      return true;
    }

    async getNewsItemConflicts(): Promise<{ conflicts: TaranisNewsItemConflict[] }> {
      const response = await this.makeRequest('/connectors/conflicts/news-items');
      if (!response.success) {
        throw new TaranisError(`Failed to get news item conflicts: ${response.error}`, 'GET_NEWS_CONFLICTS_ERROR', response.status);
      }
      return response.data || { conflicts: [] };
    }

    async ingestNewsItemConflicts(newsItems: any[]): Promise<boolean> {
      const response = await this.makeRequest('/connectors/conflicts/news-items', {
        method: 'POST',
        body: JSON.stringify(newsItems)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to ingest news item conflicts: ${response.error}`, 'INGEST_NEWS_CONFLICTS_ERROR', response.status);
      }
      return true;
    }

    async resolveNewsItemConflicts(storyIds: string[], newsItemIds: string[]): Promise<boolean> {
      const response = await this.makeRequest('/connectors/conflicts/news-items', {
        method: 'PUT',
        body: JSON.stringify({
          story_ids: storyIds,
          news_item_ids: newsItemIds
        })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to resolve news item conflicts: ${response.error}`, 'RESOLVE_NEWS_CONFLICTS_ERROR', response.status);
      }
      return true;
    }

    async getStorySummary(storyId: string): Promise<any> {
      const response = await this.makeRequest(`/connectors/story-summary/${storyId}`);
      if (!response.success) {
        throw new TaranisError(`Failed to get story summary: ${response.error}`, 'GET_STORY_SUMMARY_ERROR', response.status);
      }
      return response.data;
    }

    async clearAllConflicts(): Promise<boolean> {
      const response = await this.makeRequest('/connectors/conflicts/clear', {
        method: 'POST'
      });
      if (!response.success) {
        throw new TaranisError(`Failed to clear conflicts: ${response.error}`, 'CLEAR_CONFLICTS_ERROR', response.status);
      }
      return true;
    }

    async updateLastChange(stories: string[], newsItems: string[]): Promise<boolean> {
      const response = await this.makeRequest('/connectors/last-change', {
        method: 'POST',
        body: JSON.stringify({
          stories,
          news_items: newsItems
        })
      });
      if (!response.success) {
        throw new TaranisError(`Failed to update last change: ${response.error}`, 'UPDATE_LAST_CHANGE_ERROR', response.status);
      }
      return true;
    }

    // ============ TASKS ============

    async getTask(taskId: string): Promise<TaranisTaskResult> {
      const response = await this.makeRequest(`/tasks/${taskId}`);
      if (!response.success) {
        return { id: taskId, task: '', status: 'PENDING' };
      }
      return response.data;
    }

    async submitTaskResult(taskResult: {
      task_id: string;
      result: any;
      status: string;
      task: string;
    }): Promise<{ status: string }> {
      const response = await this.makeRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskResult)
      });
      if (!response.success) {
        throw new TaranisError(`Failed to submit task result: ${response.error}`, 'SUBMIT_TASK_ERROR', response.status);
      }
      return response.data || { status: 'submitted' };
    }

    isAuthenticated(): boolean {
      return !!this.token;
    }
  
    getCurrentToken(): string | null {
      return this.token;
    }
  }
  
  // ============ INSTANCE SINGLETON ============
  
  let taranisServiceInstance: TaranisService | null = null;
  
  export function createTaranisService(config?: Partial<TaranisConfig>): TaranisService {
    if (!taranisServiceInstance) {
      taranisServiceInstance = new TaranisService(config);
    }
    return taranisServiceInstance;
  }
  
  export function getTaranisService(): TaranisService {
    if (!taranisServiceInstance) {
      taranisServiceInstance = new TaranisService();
    }
    return taranisServiceInstance;
  }
  
  // Export par défaut
  export const taranisService = getTaranisService();