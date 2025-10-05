/**
 * Source Manager - Gestionnaire des Sources CTI Existantes
 * Interface pour gérer, modifier et surveiller les sources configurées
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Eye, Edit, Trash2, RefreshCw, Settings, Play, Pause,
  Globe, Database, Rss, Mail, Link, CheckCircle, XCircle,
  AlertTriangle, Activity, Clock, BarChart3, Filter
} from 'lucide-react';

import { OSINTSourceConfig } from '../../src/services/taranis/taranis-unified-service';

interface SourceManagerProps {
  sources: OSINTSourceConfig[];
  onUpdateSource: (sourceId: string, updates: Partial<OSINTSourceConfig>) => Promise<void>;
  onDeleteSource: (sourceId: string) => Promise<void>;
  onTestSource: (source: OSINTSourceConfig) => Promise<any>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SourceStats {
  totalSources: number;
  activeSources: number;
  inactiveSources: number;
  sourcesByType: Record<string, number>;
  lastCollections: Record<string, string>;
}

export function SourceManager({ 
  sources, 
  onUpdateSource, 
  onDeleteSource, 
  onTestSource, 
  onRefresh, 
  isLoading 
}: SourceManagerProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState<Partial<OSINTSourceConfig>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Calculer les statistiques
  const stats: SourceStats = React.useMemo(() => {
    const activeSources = sources.filter(s => s.enabled).length;
    const sourcesByType = sources.reduce((acc, source) => {
      acc[source.type] = (acc[source.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSources: sources.length,
      activeSources,
      inactiveSources: sources.length - activeSources,
      sourcesByType,
      lastCollections: {} // À implémenter avec les vraies données
    };
  }, [sources]);

  // Filtrer les sources
  const filteredSources = React.useMemo(() => {
    return sources.filter(source => {
      const matchesType = filterType === 'all' || source.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && source.enabled) ||
        (filterStatus === 'inactive' && !source.enabled);
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [sources, filterType, filterStatus, searchTerm]);

  // Obtenir l'icône pour le type de source
  const getSourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rss':
        return Rss;
      case 'api':
        return Globe;
      case 'database':
        return Database;
      case 'email':
        return Mail;
      case 'web':
      case 'webhook':
        return Link;
      default:
        return Settings;
    }
  };

  // Obtenir la couleur du badge de type
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rss':
        return 'bg-orange-100 text-orange-800';
      case 'api':
        return 'bg-blue-100 text-blue-800';
      case 'database':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-purple-100 text-purple-800';
      case 'web':
      case 'webhook':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Commencer l'édition d'une source
  const startEditing = useCallback((source: OSINTSourceConfig) => {
    setEditingSource(source.id);
    setEditForm({
      name: source.name,
      url: source.url,
      enabled: source.enabled,
      groupId: source.groupId,
      parameters: source.parameters
    });
  }, []);

  // Sauvegarder les modifications
  const saveChanges = useCallback(async () => {
    if (!editingSource || !editForm.name) return;

    try {
      await onUpdateSource(editingSource, editForm);
      setEditingSource(null);
      setEditForm({});
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [editingSource, editForm, onUpdateSource]);

  // Annuler l'édition
  const cancelEditing = useCallback(() => {
    setEditingSource(null);
    setEditForm({});
  }, []);

  // Confirmer la suppression
  const confirmDelete = useCallback(async (sourceId: string) => {
    try {
      await onDeleteSource(sourceId);
      setShowDeleteConfirm(null);
      if (selectedSource === sourceId) {
        setSelectedSource(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [onDeleteSource, selectedSource]);

  // Toggle l'activation d'une source
  const toggleSource = useCallback(async (source: OSINTSourceConfig) => {
    try {
      await onUpdateSource(source.id, { enabled: !source.enabled });
    } catch (error) {
      console.error('Erreur lors du toggle:', error);
    }
  }, [onUpdateSource]);

  return (
    <div className="space-y-6">
      {/* Statistiques et filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalSources}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeSources}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactives</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactiveSources}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Types</p>
                <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.sourcesByType).length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher par nom, URL ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div>
                <Label htmlFor="filter-type">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="RSS">RSS</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="DATABASE">Database</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WEB">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-status">Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actives</SelectItem>
                    <SelectItem value="inactive">Inactives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSources.map((source) => {
          const TypeIcon = getSourceTypeIcon(source.type);
          const isEditing = editingSource === source.id;
          const isSelected = selectedSource === source.id;
          const isDeleting = showDeleteConfirm === source.id;

          return (
            <Card key={source.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>{source.type}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(source.type)}>
                      {source.type}
                    </Badge>
                    <Badge variant={source.enabled ? 'default' : 'secondary'}>
                      {source.enabled ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* URL */}
                <div>
                  <Label className="text-sm font-medium">URL/Endpoint</Label>
                  <p className="text-sm text-gray-600 break-all">
                    {source.url || 'Non configuré'}
                  </p>
                </div>

                {/* Groupe */}
                {source.groupId && (
                  <div>
                    <Label className="text-sm font-medium">Groupe</Label>
                    <p className="text-sm text-gray-600">{source.groupId}</p>
                  </div>
                )}

                {/* Paramètres */}
                {source.parameters && Object.keys(source.parameters).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Paramètres</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.keys(source.parameters).slice(0, 3).map(key => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      ))}
                      {Object.keys(source.parameters).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(source.parameters).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => toggleSource(source)}
                      disabled={isLoading}
                    />
                    <Label className="text-sm">
                      {source.enabled ? 'Activé' : 'Désactivé'}
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSource(isSelected ? null : source.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(source)}
                      disabled={isEditing}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTestSource(source)}
                    >
                      <Activity className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(isDeleting ? null : source.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Formulaire d'édition */}
                {isEditing && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor={`edit-name-${source.id}`}>Nom</Label>
                      <Input
                        id={`edit-name-${source.id}`}
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`edit-url-${source.id}`}>URL</Label>
                      <Input
                        id={`edit-url-${source.id}`}
                        value={editForm.url || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button size="sm" onClick={saveChanges}>
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {/* Confirmation de suppression */}
                {isDeleting && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Êtes-vous sûr de vouloir supprimer cette source ?</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(source.id)}>
                          Supprimer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                          Annuler
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Message si aucune source */}
      {filteredSources.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucune source trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Aucune source ne correspond aux critères de recherche.'
                : 'Créez votre première source dans l\'onglet Configuration ou Upload.'}
            </p>
            {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}>
                Effacer les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
