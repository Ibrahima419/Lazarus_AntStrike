// Service d'intégration Taranis AI pour AntStrike CTI
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface TaranisConfig {
  baseURL: string;
  apiKey?: string;
  jwt?: string;
  refreshToken?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author?: string;
  published_date: string;
  collected_date: string;
  web_url?: string;
  osint_source_id: string;
  language?: string;
  hash: string;
  attributes?: any[];
}

export interface ReportItem {
  id?: string;
  title: string;
  content: string;
  report_item_type_id: string;
  created_date?: string;
  completed?: boolean;
  attributes?: any[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

export interface PaginatedResponse<T> {
  total_count: number;
  items: T[];
}

class TaranisAPIService {
  private client: AxiosInstance;
  private config: TaranisConfig;
  private isRefreshing = false;
  private refreshQueue: Array<() => void> = [];

  constructor(config: TaranisConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour l'authentification
    this.client.interceptors.request.use((config) => {
      if (this.config.apiKey) {
        config.headers['X-API-Key'] = this.config.apiKey;
      }
      if (this.config.jwt) {
        config.headers['Authorization'] = `Bearer ${this.config.jwt}`;
      }
      return config;
    });

    // Intercepteur pour les erreurs avec refresh automatique
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error?.config || {};

        if (status === 401 && !originalRequest._retry && this.config.refreshToken) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            await new Promise<void>((resolve) => this.refreshQueue.push(resolve));
          } else {
            this.isRefreshing = true;
            try {
              const refreshed = await this.refreshToken();
              this.setJWT(refreshed.access_token);
              this.setRefreshToken(refreshed.refresh_token);
              // vider la file
              this.refreshQueue.forEach((resolve) => resolve());
              this.refreshQueue = [];
            } catch (refreshErr) {
              this.clearTokens();
              try {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('taranis:unauthorized'));
                }
              } catch {}
              this.refreshQueue.forEach((resolve) => resolve());
              this.refreshQueue = [];
              this.isRefreshing = false;
              throw refreshErr;
            }
            this.isRefreshing = false;
          }

          // Rejouer la requête originale avec le nouveau token
          if (!originalRequest.headers) originalRequest.headers = {};
          if (this.config.jwt) {
            (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${this.config.jwt}`;
          }
          return this.client(originalRequest);
        }

        console.error('Erreur API Taranis:', error?.response?.data || error?.message);
        throw error;
      }
    );

    // Charger d'éventuels tokens persistés au démarrage
    const storedAccess = typeof window !== 'undefined' ? localStorage.getItem('taranis_access_token') : null;
    const storedRefresh = typeof window !== 'undefined' ? localStorage.getItem('taranis_refresh_token') : null;
    if (storedAccess) this.config.jwt = storedAccess;
    if (storedRefresh) this.config.refreshToken = storedRefresh;
  }

  // ============ AUTHENTIFICATION ============
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', {
      username,
      password,
    });
    
    const authData = response.data;
    this.config.jwt = authData.access_token;
    this.config.refreshToken = authData.refresh_token;
    this.persistTokens(authData.access_token, authData.refresh_token);
    return authData;
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      // Tentative GET (pour compatibilité si déjà supporté)
      const response = await this.client.get('/auth/refresh');
      const authData = response.data;
      this.config.jwt = authData.access_token;
      this.config.refreshToken = authData.refresh_token;
      this.persistTokens(authData.access_token, authData.refresh_token);
      return authData;
    } catch (err) {
      // Fallback standard: POST avec refresh_token
      const body: any = {};
      if (this.config.refreshToken) {
        body.refresh_token = this.config.refreshToken;
      }
      const response = await this.client.post('/auth/refresh', body);
      const authData = response.data;
      this.config.jwt = authData.access_token;
      this.config.refreshToken = authData.refresh_token ?? this.config.refreshToken;
      this.persistTokens(authData.access_token, this.config.refreshToken);
      return authData;
    }
  }

  async logout(): Promise<void> {
    await this.client.delete('/auth/logout');
    this.config.jwt = undefined;
    this.config.refreshToken = undefined;
    this.clearTokens();
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('taranis:unauthorized'));
      }
    } catch {}
  }

  // ============ HEALTH CHECK ============
  async isAlive(): Promise<boolean> {
    try {
      // Essai principal
      const response = await this.client.get('/isalive');
      const data = response?.data ?? {};
      if (typeof data === 'object') {
        if (data.isalive !== undefined) return Boolean(data.isalive);
        if (data.isAlive !== undefined) return Boolean(data.isAlive);
        if (data.status !== undefined) return String(data.status).toLowerCase() === 'ok';
      }
      // Si la réponse est vide mais 200 OK, considérer comme vivant
      if (response?.status === 200) return true;
      return false;
    } catch {
      // Fallbacks classiques d'endpoint de santé
      try {
        const alt = await this.client.get('/health');
        const altData = alt?.data ?? {};
        if (typeof altData === 'object') {
          if (altData.isalive !== undefined) return Boolean(altData.isalive);
          if (altData.isAlive !== undefined) return Boolean(altData.isAlive);
          if (altData.status !== undefined) return String(altData.status).toLowerCase() === 'ok';
        }
        if (alt?.status === 200) return true;
      } catch {}
      try {
        const alt2 = await this.client.get('/healthz');
        if (alt2?.status === 200) return true;
      } catch {}
      return false;
    }
  }

  // ============ NEWS ITEMS (OSINT DATA) ============
  async getNewsItems(params?: {
    search?: string;
    range?: string;
    sort?: string;
    offset?: number;
    limit?: number;
  }): Promise<PaginatedResponse<NewsItem>> {
    const response = await this.client.get('/assess/news-items', { params });
    return response.data;
  }

  async getNewsItem(id: string): Promise<NewsItem> {
    const response = await this.client.get(`/assess/news-items/${id}`);
    return response.data;
  }

  // ============ REPORT ITEMS (ANALYSIS) ============
  async getReportItems(params?: {
    search?: string;
    completed?: string;
    range?: string;
    sort?: string;
    group?: string;
    offset?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ReportItem>> {
    const response = await this.client.get('/analyze/report-items', { params });
    return response.data;
  }

  async getReportItem(id: string): Promise<ReportItem> {
    const response = await this.client.get(`/analyze/report-items/${id}`);
    return response.data;
  }

  async createReportItem(item: Omit<ReportItem, 'id'>): Promise<ReportItem> {
    const response = await this.client.post('/analyze/report-items', item);
    return response.data;
  }

  async updateReportItem(id: string, item: Partial<ReportItem>): Promise<ReportItem> {
    const response = await this.client.put(`/analyze/report-items/${id}`, item);
    return response.data;
  }

  async deleteReportItem(id: string): Promise<void> {
    await this.client.delete(`/analyze/report-items/${id}`);
  }

  // ============ COLLECTORS ============
  async getCollectors(): Promise<any[]> {
    const response = await this.client.get('/config/collectors');
    return response.data.items || response.data;
  }

  async getCollectorStatus(id: string): Promise<any> {
    const response = await this.client.get(`/config/collectors/${id}`);
    return response.data;
  }

  // ============ BOTS (AI SERVICES) ============
  async getBots(): Promise<any[]> {
    const response = await this.client.get('/config/bots');
    return response.data.items || response.data;
  }

  // ============ DASHBOARD DATA ============
  async getDashboardData(): Promise<any> {
    const response = await this.client.get('/dashboard');
    return response.data;
  }


  // ============ UTILITY METHODS ============
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setJWT(jwt: string): void {
    this.config.jwt = jwt;
    this.persistTokens(jwt, this.config.refreshToken);
  }

  setRefreshToken(refresh: string | undefined): void {
    this.config.refreshToken = refresh;
    this.persistTokens(this.config.jwt, refresh);
  }

  getConfig(): TaranisConfig {
    return { ...this.config };
  }

  private persistTokens(access?: string, refresh?: string): void {
    if (typeof window === 'undefined') return;
    if (access) {
      localStorage.setItem('taranis_access_token', access);
    } else {
      localStorage.removeItem('taranis_access_token');
    }
    if (refresh) {
      localStorage.setItem('taranis_refresh_token', refresh);
    } else {
      localStorage.removeItem('taranis_refresh_token');
    }
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('taranis_access_token');
    localStorage.removeItem('taranis_refresh_token');
  }
}

// Factory function pour créer le service
export function createTaranisService(config: TaranisConfig): TaranisAPIService {
  return new TaranisAPIService(config);
}

// Instance par défaut (à configurer via .env)
const defaultConfig: TaranisConfig = {
  baseURL: (import.meta as any).env?.VITE_TARANIS_API_URL || 'http://localhost:8080/frontend/open_api',
  apiKey: (import.meta as any).env?.VITE_TARANIS_API_KEY,
};

export const taranisAPI = createTaranisService(defaultConfig);

export default TaranisAPIService;