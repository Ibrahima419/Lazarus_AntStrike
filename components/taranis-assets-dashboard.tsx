/**
 * Taranis Assets Dashboard - Gestion des groupes d'assets et attributs
 * Interface pour les endpoints /asset-groups/* de Taranis
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
  Tag, Hash, Shield, TrendingUp, Network, GitBranch, Target, Brain,
  Server, HardDrive, Cpu, Monitor, Smartphone, Laptop, Wifi, Shield as Firewall
} from 'lucide-react';

// Import du service Taranis
import { 
  getTaranisService, 
  TaranisAssetGroup, 
  TaranisAssetAttribute, 
  TaranisNotificationTemplate,
  TaranisAsset
} from '../src/services/taranis/taranis-unified-service';

// ============ TYPES ============

interface AssetsNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ============ HOOK PRINCIPAL ============

function useTaranisAssetsDashboard() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const [assetGroups, setAssetGroups] = useState<TaranisAssetGroup[]>([]);
  const [attributes, setAttributes] = useState<TaranisAssetAttribute[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<TaranisNotificationTemplate[]>([]);

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
      const [groupsData, attributesData, templatesData] = await Promise.all([
        service.getAssetGroups(),
        service.getAssetAttributes(),
        service.getNotificationTemplates()
      ]);
      setAssetGroups(groupsData);
      setAttributes(attributesData);
      setNotificationTemplates(templatesData);
      console.log('Assets data fetched successfully');
    } catch (error) {
      setHasError(true);
      console.error('Fetch assets data failed:', error);
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

  // Asset Groups Management
  const createAssetGroup = async (group: Partial<TaranisAssetGroup>): Promise<boolean> => {
    try {
      await service.createAssetGroup(group);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Create asset group failed:', error);
      return false;
    }
  };

  const updateAssetGroup = async (groupId: string, updates: Partial<TaranisAssetGroup>): Promise<boolean> => {
    try {
      await service.updateAssetGroup(groupId, updates);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Update asset group failed:', error);
      return false;
    }
  };

  const deleteAssetGroup = async (groupId: string): Promise<boolean> => {
    try {
      await service.deleteAssetGroup(groupId);
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Delete asset group failed:', error);
      return false;
    }
  };

  return {
    isConnected,
    isAuthenticated,
    isLoading,
    hasError,
    lastCheck,
    assetGroups,
    attributes,
    notificationTemplates,
    checkConnection,
    refreshAll,
    createAssetGroup,
    updateAssetGroup,
    deleteAssetGroup
  };
}

function useAssetsSearch<T extends Record<string, any>>(
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

function useAssetsNotifications() {
  const [notifications, setNotifications] = useState<AssetsNotification[]>([]);

  const addNotification = useCallback((
    type: AssetsNotification['type'],
    title: string,
    message: string
  ) => {
    const notification: AssetsNotification = {
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
    case 'enabled':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'inactive':
    case 'disabled':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'maintenance':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'retired':
      return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
    case 'enabled':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'inactive':
    case 'disabled':
      return <Badge variant="destructive">{status}</Badge>;
    case 'maintenance':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
    case 'retired':
      return <Badge variant="outline">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getAssetTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'server':
      return <Server className="w-4 h-4 text-blue-500" />;
    case 'database':
      return <Database className="w-4 h-4 text-green-500" />;
    case 'network':
      return <Network className="w-4 h-4 text-purple-500" />;
    case 'storage':
      return <HardDrive className="w-4 h-4 text-orange-500" />;
    case 'compute':
      return <Cpu className="w-4 h-4 text-red-500" />;
    case 'monitor':
      return <Monitor className="w-4 h-4 text-cyan-500" />;
    case 'mobile':
      return <Smartphone className="w-4 h-4 text-pink-500" />;
    case 'laptop':
      return <Laptop className="w-4 h-4 text-indigo-500" />;
    case 'router':
      return <Wifi className="w-4 h-4 text-teal-500" />;
    case 'firewall':
      return <Firewall className="w-4 h-4 text-red-600" />;
    default:
      return <Database className="w-4 h-4 text-gray-500" />;
  }
};

const getTemplateTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'webhook':
      return <Network className="w-4 h-4 text-green-500" />;
    case 'slack':
      return <Users className="w-4 h-4 text-purple-500" />;
    case 'teams':
      return <Users className="w-4 h-4 text-blue-600" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const getAttributeTypeBadge = (type: string) => {
  switch (type) {
    case 'string':
      return <Badge variant="outline" className="text-blue-600">String</Badge>;
    case 'array<string>':
      return <Badge variant="outline" className="text-green-600">String Array</Badge>;
    case 'array<integer>':
      return <Badge variant="outline" className="text-purple-600">Integer Array</Badge>;
    case 'boolean':
      return <Badge variant="outline" className="text-orange-600">Boolean</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

// ============ COMPOSANT PRINCIPAL ============

export function TaranisAssetsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupStatus, setSelectedGroupStatus] = useState<string>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const dashboard = useTaranisAssetsDashboard();
  const notifications = useAssetsNotifications();
  
  const groupSearch = useAssetsSearch(
    dashboard.assetGroups,
    ['name', 'description'] as const
  );

  const attributeSearch = useAssetsSearch(
    dashboard.attributes,
    ['name', 'description', 'type'] as const
  );

  const templateSearch = useAssetsSearch(
    dashboard.notificationTemplates,
    ['name', 'description', 'type'] as const
  );

  useEffect(() => {
    groupSearch.setSearchTerm(searchTerm);
  }, [searchTerm, groupSearch.setSearchTerm]);

  useEffect(() => {
    attributeSearch.setSearchTerm(searchTerm);
  }, [searchTerm, attributeSearch.setSearchTerm]);

  useEffect(() => {
    templateSearch.setSearchTerm(searchTerm);
  }, [searchTerm, templateSearch.setSearchTerm]);

  const filteredGroups = useMemo(() => {
    const searchFiltered = groupSearch.filteredItems;
    
    if (selectedGroupStatus === 'all') {
      return searchFiltered;
    }
    
    return searchFiltered.filter((group: TaranisAssetGroup) => 
      (selectedGroupStatus === 'enabled' && group.enabled) ||
      (selectedGroupStatus === 'disabled' && !group.enabled)
    );
  }, [groupSearch.filteredItems, selectedGroupStatus]);

  const handleCreateAssetGroup = useCallback(async (group: Partial<TaranisAssetGroup>) => {
    try {
      const success = await dashboard.createAssetGroup(group);
      
      if (success) {
        notifications.addNotification(
          'success',
          'Asset Group Created',
          'Asset group created successfully'
        );
        setShowCreateGroup(false);
      } else {
        notifications.addNotification(
          'error',
          'Create Failed',
          'Failed to create asset group'
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

  const handleUpdateAssetGroup = useCallback(async (groupId: string, updates: Partial<TaranisAssetGroup>) => {
    try {
      const success = await dashboard.updateAssetGroup(groupId, updates);
      
      if (success) {
        notifications.addNotification(
          'success',
          'Asset Group Updated',
          'Asset group updated successfully'
        );
      } else {
        notifications.addNotification(
          'error',
          'Update Failed',
          'Failed to update asset group'
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

  const handleDeleteAssetGroup = useCallback(async (groupId: string) => {
    try {
      const success = await dashboard.deleteAssetGroup(groupId);
      
      if (success) {
        notifications.addNotification(
          'success',
          'Asset Group Deleted',
          'Asset group deleted successfully'
        );
      } else {
        notifications.addNotification(
          'error',
          'Delete Failed',
          'Failed to delete asset group'
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
          Error loading assets data. Check console for details.
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
            <HardDrive className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Taranis Assets</h1>
              <p className="text-muted-foreground">Asset Groups & Infrastructure Management</p>
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
          {notifications.notifications.slice(0, 3).map((notification: AssetsNotification) => (
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
              <p><strong>Taranis not connected</strong> - Assets data unavailable</p>
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
            <CardTitle className="text-sm">Asset Groups</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.assetGroups.length}</div>
            <div className="text-xs text-muted-foreground">
              {dashboard.assetGroups.filter(g => g.enabled).length} enabled
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Attributes</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.attributes.length}</div>
            <div className="text-xs text-muted-foreground">
              Custom attributes defined
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Templates</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.notificationTemplates.length}</div>
            <div className="text-xs text-muted-foreground">
              Notification templates
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.assetGroups.reduce((sum, group) => sum + (group.assetCount || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              Across all groups
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups">Asset Groups ({dashboard.assetGroups.length})</TabsTrigger>
          <TabsTrigger value="attributes">Attributes ({dashboard.attributes.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({dashboard.notificationTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search asset groups..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedGroupStatus} onValueChange={setSelectedGroupStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Asset Groups</CardTitle>
              <CardDescription>
                {filteredGroups.length} groups displayed out of {dashboard.assetGroups.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8">
                  <HardDrive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.assetGroups.length === 0 
                      ? dashboard.isConnected 
                        ? "No asset groups configured in Taranis"
                        : "Connect to Taranis to see asset groups"
                      : "No groups match the filters"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredGroups.map((group: TaranisAssetGroup) => (
                    <Card key={group.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <HardDrive className="w-5 h-5 text-blue-500" />
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
                          <span className="text-muted-foreground">Assets:</span>
                          <span className="font-medium">{group.assetCount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Attributes:</span>
                          <span className="font-medium">{group.attributes.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Templates:</span>
                          <span className="font-medium">{group.notificationTemplates?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {new Date(group.createdDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3">
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
                          onClick={() => handleDeleteAssetGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search attributes..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Asset Attributes</CardTitle>
              <CardDescription>
                Custom attributes for asset classification and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attributeSearch.filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.attributes.length === 0 
                      ? dashboard.isConnected 
                        ? "No attributes configured"
                        : "Connect to Taranis to see attributes"
                      : "No attributes match the search"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributeSearch.filteredItems.map((attribute: TaranisAssetAttribute) => (
                      <TableRow key={attribute.id}>
                        <TableCell>
                          <div className="font-medium">{attribute.name}</div>
                        </TableCell>
                        <TableCell>
                          {getAttributeTypeBadge(attribute.type)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={attribute.required ? "default" : "outline"}>
                            {attribute.required ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {attribute.default !== undefined ? String(attribute.default) : 'None'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {attribute.description || 'No description'}
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

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Templates for asset-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templateSearch.filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {dashboard.notificationTemplates.length === 0 
                      ? dashboard.isConnected 
                        ? "No notification templates configured"
                        : "Connect to Taranis to see templates"
                      : "No templates match the search"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {templateSearch.filteredItems.map((template: TaranisNotificationTemplate) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTemplateTypeIcon(template.type)}
                          <div>
                            <div className="font-medium">{template.name}</div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.enabled ? "default" : "secondary"}>
                            {template.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Template:</span>
                          <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                            {template.template.substring(0, 100)}...
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {new Date(template.createdDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3">
                        <Button variant="ghost" size="sm" title="View details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Test">
                          <Play className="w-4 h-4" />
                        </Button>
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
          <span>Groups: {dashboard.assetGroups.length}</span>
          <span>Attributes: {dashboard.attributes.length}</span>
          <span>Templates: {dashboard.notificationTemplates.length}</span>
        </div>
      </div>
    </div>
  );
}
