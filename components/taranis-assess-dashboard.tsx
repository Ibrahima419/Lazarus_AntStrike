/**
 * Taranis Assess Dashboard - Gestion des sources OSINT et news items
 * Interface pour les endpoints /assess/* de Taranis
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { 
  Activity, Database, Globe, Rss, Users, FileText, Calendar, Timer,
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Play, Pause,
  Eye, Settings, Search, Filter, Download, ExternalLink, Plus, Edit, Trash2,
  Tag, Hash, Shield, TrendingUp, Network, GitBranch, Target, Brain
} from 'lucide-react';

// Import du service Taranis
import { 
  getTaranisService, 
  TaranisOSINTSource, 
  TaranisOSINTSourceGroup, 
  TaranisNewsItem, 
  TaranisStory 
} from '../src/services/taranis/taranis-unified-service';

// ============ TYPES ============

interface AssessNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ============ HOOK PRINCIPAL ============

function useTaranisAssessDashboard() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const [osintSources, setOsintSources] = useState<TaranisOSINTSource[]>([]);
  const [sourceGroups, setSourceGroups] = useState<TaranisOSINTSourceGroup[]>([]);
  const [newsItems, setNewsItems] = useState<TaranisNewsItem[]>([]);
  const [stories, setStories] = useState<TaranisStory[]>([]);

  const service = getTaranisService();

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const connected = await service.testConnection();
      setIsConnected(connected);
      setIsAuthenticated(service.isAuthenticated());
      setLastCheck(new Date());
      setHasError(false);
    } catch (error) {
      setIsConnected(false);
      setIsAuthenticated(false);
      setHasError(true);
      console.error('Connection check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const fetchAllData = useCallback(async () => {
    if (!isConnected || !isAuthenticated || isLoading) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const [sourcesData, groupsData, newsData, storiesData] = await Promise.all([
        service.getOSINTSources(),
        service.getOSINTSourceGroups(),
        service.getNewsItems(100),
        service.getStories()
      ]);
      setOsintSources(sourcesData);
      setSourceGroups(groupsData);
      setNewsItems(newsData);
      setStories(storiesData);
      console.log('Assess data fetched successfully');
    } catch (error) {
      setHasError(true);
      console.error('Fetch assess data failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isAuthenticated, isLoading, service]);

  const autoLogin = useCallback(async () => {
    if (isConnected && !isAuthenticated && !isLoading) {
      try {
        const loggedIn = await service.login('admin', 'admin');
        if (loggedIn) {
          setIsAuthenticated(true);
          console.log('Auto-login successful');
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        setHasError(true);
      }
    }
  }, [isConnected, isAuthenticated, isLoading, service]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    autoLogin();
  }, [autoLogin]);

  useEffect(() => {
    if (isConnected && isAuthenticated) {
      fetchAllData();
    }
  }, [isConnected, isAuthenticated, fetchAllData]);

  const refreshAll = async () => {
    await fetchAllData();
  };

  // News Items Management
  const createNewsItem = async (newsItem: Partial<TaranisNewsItem>): Promise<boolean> => {
    try {
      await service.createNewsItem(newsItem);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Create news item failed:', error);
      return false;
    }
  };

  const updateNewsItem = async (itemId: string, updates: Partial<TaranisNewsItem>): Promise<boolean> => {
    try {
      await service.updateNewsItem(itemId, updates);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Update news item failed:', error);
      return false;
    }
  };

  const deleteNewsItem = async (itemId: string): Promise<boolean> => {
    try {
      await service.deleteNewsItem(itemId);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Delete news item failed:', error);
      return false;
    }
  };

  // Stories Management
  const updateStory = async (storyId: string, updates: Partial<TaranisStory>): Promise<boolean> => {
    try {
      await service.updateStory(storyId, updates);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Update story failed:', error);
      return false;
    }
  };

  const deleteStory = async (storyId: string): Promise<boolean> => {
    try {
      await service.deleteStory(storyId);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Delete story failed:', error);
      return false;
    }
  };

  const groupStories = async (storyIds: string[]): Promise<boolean> => {
    try {
      await service.groupStories(storyIds);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Group stories failed:', error);
      return false;
    }
  };

  const ungroupStories = async (storyIds: string[]): Promise<boolean> => {
    try {
      await service.ungroupStories(storyIds);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Ungroup stories failed:', error);
      return false;
    }
  };

  return {
    isConnected,
    isAuthenticated,
    isLoading,
    hasError,
    lastCheck,
    osintSources,
    sourceGroups,
    newsItems,
    stories,
    checkConnection,
    refreshAll,
    createNewsItem,
    updateNewsItem,
    deleteNewsItem,
    updateStory,
    deleteStory,
    groupStories,
    ungroupStories
  };
}

function useAssessSearch<T extends Record<string, any>>(
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
    filteredItems
  };
}

function useAssessNotifications() {
  const [notifications, setNotifications] = useState<AssessNotification[]>([]);

  const addNotification = useCallback((
    type: AssessNotification['type'],
    title: string,
    message: string
  ) => {
    const notification: AssessNotification = {
      id: String(Date.now()),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]);

    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification
  };
}

// ============ UTILITAIRES UI ============

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'published':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'inactive':
    case 'draft':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
    case 'published':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'inactive':
    case 'draft':
      return <Badge variant="destructive">{status}</Badge>;
    case 'error':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getSourceTypeIcon = (type: string) => {
  switch (type) {
    case 'RSS':
      return <Rss className="w-4 h-4 text-orange-500" />;
    case 'WEB':
      return <Globe className="w-4 h-4 text-blue-500" />;
    case 'TWITTER':
      return <Users className="w-4 h-4 text-blue-400" />;
    case 'EMAIL':
      return <FileText className="w-4 h-4 text-green-500" />;
    case 'API':
      return <Database className="w-4 h-4 text-purple-500" />;
    default:
      return <Database className="w-4 h-4 text-gray-500" />;
  }
};

const getRiskLevelBadge = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>;
    case 'high':
      return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
    case 'low':
      return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// ============ COMPOSANT PRINCIPAL ============

export function TaranisAssessDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedStoryStatus, setSelectedStoryStatus] = useState<string>('all');
  const [showCreateNewsItem, setShowCreateNewsItem] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const dashboard = useTaranisAssessDashboard();
  const notifications = useAssessNotifications();
  
  const sourceSearch = useAssessSearch(
    dashboard.osintSources,
    ['name', 'url', 'description'] as const
  );

  const storySearch = useAssessSearch(
    dashboard.stories,
    ['title', 'content', 'tags'] as const
  );

  useEffect(() => {
    sourceSearch.setSearchTerm(searchTerm);
  }, [searchTerm, sourceSearch.setSearchTerm]);

  useEffect(() => {
    storySearch.setSearchTerm(searchTerm);
  }, [searchTerm, storySearch.setSearchTerm]);

  const filteredSources = useMemo(() => {
    const searchFiltered = sourceSearch.filteredItems;
    
    if (selectedSourceType === 'all') {
      return searchFiltered;
    }
    
    return searchFiltered.filter((source: TaranisOSINTSource) => source.type === selectedSourceType);
  }, [sourceSearch.filteredItems, selectedSourceType]);

  const filteredStories = useMemo(() => {
    const searchFiltered = storySearch.filteredItems;
    
    if (selectedStoryStatus === 'all') {
      return searchFiltered;
    }
    
    return searchFiltered.filter((story: TaranisStory) => story.status === selectedStoryStatus);
  }, [storySearch.filteredItems, selectedStoryStatus]);

  const handleCreateNewsItem = useCallback(async (newsItem: Partial<TaranisNewsItem>) => {
    try {
      const success = await dashboard.createNewsItem(newsItem);
      
      if (success) {
        notifications.addNotification(
          'success',
          'News Item Created',
          'News item created successfully'
        );
        setShowCreateNewsItem(false);
      } else {
        notifications.addNotification(
          'error',
          'Create Failed',
          'Failed to create news item'
        );
      }
    } catch (error) {
      notifications.addNotification(
        'error',
        'Create Error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [dashboard, notifications]);

  const handleUpdateNewsItem = useCallback(async (itemId: string, updates: Partial<TaranisNewsItem>) => {
    try {
      const success = await dashboard.updateNewsItem(itemId, updates);
      
      if (success) {
        notifications.addNotification(
          'success',
          'News Item Updated',
          'News item updated successfully'
        );
      } else {
        notifications.addNotification(
          'error',
          'Update Failed',
          'Failed to update news item'
        );
      }
    } catch (error) {
      notifications.addNotification(
        'error',
        'Update Error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [dashboard, notifications]);

  const handleDeleteNewsItem = useCallback(async (itemId: string) => {
    try {
      const success = await dashboard.deleteNewsItem(itemId);
      
      if (success) {
        notifications.addNotification(
          'success',
          'News Item Deleted',
          'News item deleted successfully'
        );
      } else {
        notifications.addNotification(
          'error',
          'Delete Failed',
          'Failed to delete news item'
        );
      }
    } catch (error) {
      notifications.addNotification(
        'error',
        'Delete Error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [dashboard, notifications]);

  if (dashboard.hasError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading assess data. Check console for details.
          <Button size="sm" onClick={dashboard.refreshAll} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Taranis Assess</h1>
              <p className="text-muted-foreground">OSINT Sources & Intelligence Assessment</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {dashboard.isConnected === null ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="h-3 w-3 animate-pulse" />
              Checking...
            </Badge>
          ) : dashboard.isConnected ? (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Not Connected
            </Badge>
          )}
          
          {dashboard.isAuthenticated && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Authenticated
            </Badge>
          )}
          
          <Button size="sm" onClick={dashboard.refreshAll} disabled={dashboard.isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboard.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {notifications.notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.notifications.slice(0, 3).map((notification: AssessNotification) => (
            <Alert key={notification.id} className={
              notification.type === 'error' ? 'border-red-500' :
              notification.type === 'success' ? 'border-green-500' :
              notification.type === 'warning' ? 'border-yellow-500' : ''
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{notification.title}:</strong> {notification.message}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 w-6 p-0"
                  onClick={() => notifications.removeNotification(notification.id)}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {!dashboard.isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Taranis not connected</strong> - Assess data unavailable</p>
              <p className="text-sm">
                Check that Taranis is running on the configured URL and use the "Taranis Test" tab to diagnose the connection.
              </p>
              <Button size="sm" onClick={dashboard.checkConnection} disabled={dashboard.isLoading}>
                <RefreshCw className={`h-3 w-3 mr-1 ${dashboard.isLoading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">OSINT Sources</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.osintSources.length}</div>
            <div className="text-xs text-muted-foreground">
              {dashboard.osintSources.filter(s => s.enabled).length} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Source Groups</CardTitle>
            <Network className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.sourceGroups.length}</div>
            <div className="text-xs text-muted-foreground">
              {dashboard.sourceGroups.filter(g => g.enabled).length} enabled
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">News Items</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.newsItems.length}</div>
            <div className="text-xs text-muted-foreground">
              Recent intelligence items
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Stories</CardTitle>
            <GitBranch className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.stories.length}</div>
            <div className="text-xs text-muted-foreground">
              {dashboard.stories.filter(s => s.status === 'published').length} published
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">OSINT Sources ({dashboard.osintSources.length})</TabsTrigger>
          <TabsTrigger value="news">News Items ({dashboard.newsItems.length})</TabsTrigger>
          <TabsTrigger value="stories">Stories ({dashboard.stories.length})</TabsTrigger>
          <TabsTrigger value="groups">Source Groups ({dashboard.sourceGroups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search sources..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="RSS">RSS</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="WEB">Web</SelectItem>
                <SelectItem value="TWITTER">Twitter</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>OSINT Sources</CardTitle>
              <CardDescription>
                {filteredSources.length} sources displayed out of {dashboard.osintSources.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSources.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.osintSources.length === 0 
                      ? dashboard.isConnected 
                        ? "No OSINT sources configured in Taranis"
                        : "Connect to Taranis to see sources"
                      : "No sources match the filters"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Last Collected</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSources.map((source: TaranisOSINTSource) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getSourceTypeIcon(source.type)}
                            <div>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-sm text-muted-foreground font-mono text-xs truncate max-w-md">
                                {source.url || 'N/A'}
                              </div>
                              {source.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {source.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{source.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(source.status)}
                            {getStatusBadge(source.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center font-medium">
                            {source.collectedCount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(source.lastCollected).toLocaleString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={source.enabled}
                            disabled={!dashboard.isConnected}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="View details">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search news items..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowCreateNewsItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create News Item
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>News Items</CardTitle>
              <CardDescription>
                Intelligence news items from OSINT sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.newsItems.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.isConnected 
                      ? "No news items available"
                      : "Connect to Taranis to see news items"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.newsItems.map((item: TaranisNewsItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.content.substring(0, 100)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {dashboard.osintSources.find(s => s.id === item.osintSourceId)?.name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRiskLevelBadge(item.riskLevel)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(item.publishedDate).toLocaleString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.tags?.slice(0, 2).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags && item.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="View details">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete"
                              onClick={() => handleDeleteNewsItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search stories..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStoryStatus} onValueChange={setSelectedStoryStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateStory(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Intelligence Stories</CardTitle>
              <CardDescription>
                Curated intelligence stories and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStories.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.stories.length === 0 
                      ? dashboard.isConnected 
                        ? "No stories available"
                        : "Connect to Taranis to see stories"
                      : "No stories match the filters"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStories.map((story: TaranisStory) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <div className="font-medium">{story.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {story.content.substring(0, 100)}...
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {story.newsItems.length} news items
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(story.status)}
                        </TableCell>
                        <TableCell>
                          {getRiskLevelBadge(story.riskLevel)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(story.createdDate).toLocaleString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 2).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {story.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{story.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="View details">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete"
                              onClick={() => handleDeleteNewsItem(story.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OSINT Source Groups</CardTitle>
              <CardDescription>
                Organized groups of OSINT sources for better management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.sourceGroups.length === 0 ? (
                <div className="text-center py-8">
                  <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.isConnected 
                      ? "No source groups configured"
                      : "Connect to Taranis to see source groups"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dashboard.sourceGroups.map((group: TaranisOSINTSourceGroup) => (
                    <Card key={group.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Network className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="font-medium">{group.name}</div>
                            {group.description && (
                              <div className="text-sm text-muted-foreground">
                                {group.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={group.enabled ? "default" : "secondary"}>
                            {group.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sources:</span>
                          <span className="font-medium">{group.sources.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {new Date(group.createdDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <div className="flex justify-between items-center">
          <span>
            Last update: {dashboard.lastCheck?.toLocaleString('fr-FR') || 'Never'}
          </span>
          <span>
            Status: {dashboard.isConnected 
              ? dashboard.isAuthenticated 
                ? 'Connected and authenticated' 
                : 'Connected but not authenticated'
              : 'Not connected'
            }
          </span>
        </div>
        
        {dashboard.hasError && (
          <div className="text-red-500">
            Errors detected - check console logs
          </div>
        )}
        
        <div className="flex gap-4">
          <span>Sources: {dashboard.osintSources.length}</span>
          <span>Groups: {dashboard.sourceGroups.length}</span>
          <span>News Items: {dashboard.newsItems.length}</span>
          <span>Stories: {dashboard.stories.length}</span>
        </div>
      </div>
    </div>
  );
}
