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
  
  export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
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
      this.config = {
        baseUrl: (import.meta.env?.VITE_TARANIS_API_URL || '/api').replace(/\/$/, ''),
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
  
    private async makeRequest<T = unknown>(
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
          body: JSON.stringify(botData),
          headers: {
            'Content-Type': 'application/json'
          }
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
          body: JSON.stringify(botData),
          headers: {
            'Content-Type': 'application/json'
          }
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
          body: JSON.stringify(reportItemData),
          headers: {
            'Content-Type': 'application/json'
          }
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
          body: JSON.stringify(updateData),
          headers: {
            'Content-Type': 'application/json'
          }
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
  
    async getNewsItems(limit = 50): Promise<TaranisNewsItem[]> {
      const response = await this.makeRequest(`/assess/news-items?limit=${limit}`);
      
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
  
    async getTrendingClusters(): Promise<any[]> {
      try {
        const response = await this.makeRequest('/dashboard/trending-clusters');
        if (response.success) {
          return response.data || response || [];
        }
        return [];
      } catch (error) {
        console.warn('Trending clusters non disponible');
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