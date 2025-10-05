/**
 * Hooks React optimisés pour l'intégration Taranis AI
 * Utilise le service unifié avec gestion d'état intelligente
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTaranisService,
  TaranisBot, 
  TaranisSource, 
  TaranisNewsItem, 
  TaranisReport, 
  TaranisStats,
  TaranisError 
} from './taranis-unified-service';

// ============ TYPES UTILITAIRES ============

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AsyncStateWithActions<T> extends AsyncState<T> {
  refresh: () => Promise<void>;
  reset: () => void;
}

interface UseAsyncOptions {
  immediate?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// ============ HOOK GÉNÉRIQUE ASYNC ============

function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
): AsyncStateWithActions<T> {
  const { 
    immediate = true, 
    refreshInterval, 
    onSuccess, 
    onError 
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorMessage = error instanceof TaranisError 
          ? error.message 
          : error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue';

        setState({ data: null, loading: false, error: errorMessage });
        onError?.(errorMessage);
      }
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [...deps, execute, immediate]);

  // Refresh automatique
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(execute, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [execute, refreshInterval]);

  return {
    ...state,
    refresh: execute,
    reset
  };
}

// ============ HOOK DE CONNEXION ============

export function useTaranisConnection() {
  const service = getTaranisService();
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const connected = await service.testConnection();
      setIsConnected(connected);
      setIsAuthenticated(service.isAuthenticated());
      setLastCheck(new Date());
      return connected;
    } catch {
      setIsConnected(false);
      setIsAuthenticated(false);
      setLastCheck(new Date());
      return false;
    }
  }, [service]);

  const login = useCallback(async (username?: string, password?: string) => {
    try {
      const success = await service.login(username, password);
      setIsAuthenticated(success);
      return success;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, [service]);

  const logout = useCallback(async () => {
    await service.logout();
    setIsAuthenticated(false);
  }, [service]);

  // Vérification initiale et périodique
  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 30000); // Toutes les 30s
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    isAuthenticated,
    lastCheck,
    checkConnection,
    login,
    logout
  };
}

// ============ HOOK POUR LES BOTS ============

export function useTaranisBots(options?: UseAsyncOptions) {
  const service = getTaranisService();
  
  const botsState = useAsync(
    () => service.getBots(),
    [],
    options
  );

  const startBot = useCallback(async (botId: string) => {
    try {
      const success = await service.startBot(botId);
      if (success) {
        await botsState.refresh();
      }
      return success;
    } catch (error) {
      console.error('Failed to start bot:', error);
      return false;
    }
  }, [service, botsState.refresh]);

  const stopBot = useCallback(async (botId: string) => {
    try {
      const success = await service.stopBot(botId);
      if (success) {
        await botsState.refresh();
      }
      return success;
    } catch (error) {
      console.error('Failed to stop bot:', error);
      return false;
    }
  }, [service, botsState.refresh]);

  const getActiveBotsCount = useCallback(() => {
    return botsState.data?.filter(bot => 
      bot.status === 'active' || bot.status === 'running'
    ).length || 0;
  }, [botsState.data]);

  return {
    ...botsState,
    bots: botsState.data || [],
    startBot,
    stopBot,
    activeCount: getActiveBotsCount()
  };
}

// ============ HOOK POUR LES SOURCES ============

export function useTaranisSources(options?: UseAsyncOptions) {
  const service = getTaranisService();
  
  const sourcesState = useAsync(
    () => service.getSources(),
    [],
    options
  );

  const updateSourceStatus = useCallback(async (sourceId: string, enabled: boolean) => {
    try {
      const success = await service.updateSourceStatus(sourceId, enabled);
      if (success) {
        await sourcesState.refresh();
      }
      return success;
    } catch (error) {
      console.error('Failed to update source:', error);
      return false;
    }
  }, [service, sourcesState.refresh]);

  const triggerCollection = useCallback(async (sourceId: string) => {
    try {
      const success = await service.triggerCollection(sourceId);
      if (success) {
        // Refresh après un délai pour laisser le temps à la collection
        setTimeout(() => sourcesState.refresh(), 2000);
      }
      return success;
    } catch (error) {
      console.error('Failed to trigger collection:', error);
      return false;
    }
  }, [service, sourcesState.refresh]);

  const getEnabledSourcesCount = useCallback(() => {
    return sourcesState.data?.filter(source => source.enabled).length || 0;
  }, [sourcesState.data]);

  const getSourcesByType = useCallback((type: string) => {
    return sourcesState.data?.filter(source => source.type === type) || [];
  }, [sourcesState.data]);

  return {
    ...sourcesState,
    sources: sourcesState.data || [],
    updateSourceStatus,
    triggerCollection,
    enabledCount: getEnabledSourcesCount(),
    getSourcesByType
  };
}

// ============ HOOK POUR LES NEWS ITEMS ============

export function useTaranisNewsItems(limit = 50, options?: UseAsyncOptions) {
  const service = getTaranisService();
  
  const newsState = useAsync(
    () => service.getNewsItems(limit),
    [limit],
    options
  );

  const getItemsBySource = useCallback((sourceId: string) => {
    return newsState.data?.filter(item => item.osintSourceId === sourceId) || [];
  }, [newsState.data]);

  const getRecentItems = useCallback((hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return newsState.data?.filter(item => 
      new Date(item.collectedDate) > cutoff
    ) || [];
  }, [newsState.data]);

  return {
    ...newsState,
    newsItems: newsState.data || [],
    totalCount: newsState.data?.length || 0,
    getItemsBySource,
    getRecentItems
  };
}

// ============ HOOK POUR LES RAPPORTS ============

export function useTaranisReports(options?: UseAsyncOptions) {
  const service = getTaranisService();
  
  const reportsState = useAsync(
    () => service.getReports(),
    [],
    options
  );

  const getReportsByThreatLevel = useCallback((threatLevel: string) => {
    return reportsState.data?.filter(report => report.threatLevel === threatLevel) || [];
  }, [reportsState.data]);

  const getCompletedReports = useCallback(() => {
    return reportsState.data?.filter(report => report.completed) || [];
  }, [reportsState.data]);

  const getCriticalReports = useCallback(() => {
    return getReportsByThreatLevel('critical');
  }, [getReportsByThreatLevel]);

  return {
    ...reportsState,
    reports: reportsState.data || [],
    totalCount: reportsState.data?.length || 0,
    completedCount: getCompletedReports().length,
    criticalCount: getCriticalReports().length,
    getReportsByThreatLevel,
    getCompletedReports,
    getCriticalReports
  };
}

// ============ HOOK POUR LES STATISTIQUES ============

export function useTaranisStats(options?: UseAsyncOptions) {
  const service = getTaranisService();
  
  const statsState = useAsync(
    () => service.getDashboardStats(),
    [],
    {
      refreshInterval: 30000, // Refresh toutes les 30s
      ...options
    }
  );

  return {
    ...statsState,
    stats: statsState.data || {
      totalCollections: 0,
      activeBots: 0,
      sourcesMonitored: 0,
      criticalAlerts: 0,
      averageConfidence: 0,
      dailyGrowthRate: 0
    }
  };
}

// ============ HOOK PRINCIPAL DASHBOARD ============

export function useTaranisDashboard(refreshInterval = 30000) {
  const connection = useTaranisConnection();
  
  const bots = useTaranisBots({ 
    immediate: connection.isConnected === true,
    refreshInterval: connection.isConnected ? refreshInterval : 0
  });
  
  const sources = useTaranisSources({ 
    immediate: connection.isConnected === true,
    refreshInterval: connection.isConnected ? refreshInterval : 0
  });
  
  const newsItems = useTaranisNewsItems(50, { 
    immediate: connection.isConnected === true,
    refreshInterval: connection.isConnected ? refreshInterval * 2 : 0 // Moins fréquent
  });
  
  const reports = useTaranisReports({ 
    immediate: connection.isConnected === true,
    refreshInterval: connection.isConnected ? refreshInterval * 2 : 0 // Moins fréquent
  });
  
  const stats = useTaranisStats({ 
    immediate: connection.isConnected === true,
    refreshInterval: connection.isConnected ? refreshInterval : 0
  });

  const refreshAll = useCallback(async () => {
    if (connection.isConnected) {
      await Promise.all([
        bots.refresh(),
        sources.refresh(),
        newsItems.refresh(),
        reports.refresh(),
        stats.refresh()
      ]);
    }
  }, [connection.isConnected, bots.refresh, sources.refresh, newsItems.refresh, reports.refresh, stats.refresh]);

  const isLoading = bots.loading || sources.loading || newsItems.loading || reports.loading || stats.loading;
  const hasError = !!(bots.error || sources.error || newsItems.error || reports.error || stats.error);

  return {
    // État de connexion
    ...connection,
    
    // Données
    bots: bots.bots,
    sources: sources.sources,
    newsItems: newsItems.newsItems,
    reports: reports.reports,
    stats: stats.stats,
    
    // États de chargement
    isLoading,
    hasError,
    
    // Actions individuelles
    startBot: bots.startBot,
    stopBot: bots.stopBot,
    updateSourceStatus: sources.updateSourceStatus,
    triggerCollection: sources.triggerCollection,
    
    // Actions globales
    refreshAll,
    
    // États détaillés (pour debugging)
    detailed: {
      bots: { ...bots },
      sources: { ...sources },
      newsItems: { ...newsItems },
      reports: { ...reports },
      stats: { ...stats }
    }
  };
}

// ============ HOOK POUR RECHERCHE ET FILTRAGE ============

export function useTaranisSearch<T extends Record<string, unknown>>(
  items: T[],
  searchFields: (keyof T)[]
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        return value && 
               typeof value === 'string' && 
               value.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );

    setFilteredItems(filtered);
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
}

// ============ HOOK POUR NOTIFICATIONS ============

export interface TaranisNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useTaranisNotifications() {
  const [notifications, setNotifications] = useState<TaranisNotification[]>([]);

  const addNotification = useCallback((
    type: TaranisNotification['type'],
    title: string,
    message: string
  ) => {
    const notification: TaranisNotification = {
      id: String(Date.now()),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove après 5 secondes pour les notifications info/success
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll
  };
}