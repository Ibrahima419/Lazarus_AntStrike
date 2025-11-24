/**
 * 🔧 OSINT Sources Manager - Admin interface for managing OSINT feeds & groups
 * Interface complète pour gérer les groupes et sources OSINT Taranis
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import {
  Settings,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Database,
  Globe,
  Shield,
  Activity,
  FolderPlus,
  Rss,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Folder,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { usePermissions } from '../../hooks/use-permissions';
import { osintService, type OSINTFeed, type OSINTFeedStats } from '../../services/api/osint.service';
import { taranisService, type OSINTSourceGroup, type OSINTSource } from '../../services/api/taranis.service';
import { toast } from 'sonner';

interface SourceStats {
  totalSources: number;
  activeSources: number;
  lastSync: string;
  totalItems: number;
}

export function OSINTSourcesManager() {
  const { hasPermission } = usePermissions();

  // États pour les groupes OSINT
  const [groups, setGroups] = useState<OSINTSourceGroup[]>([]);
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const [stats, setStats] = useState<SourceStats>({
    totalSources: 0,
    activeSources: 0,
    lastSync: new Date().toISOString(),
    totalItems: 0
  });

  // États UI
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour les modales
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateSource, setShowCreateSource] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OSINTSourceGroup | null>(null);
  const [editingSource, setEditingSource] = useState<OSINTSource | null>(null);

  // États pour les formulaires
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    osint_sources: [] as string[],
    word_lists: [] as any[]
  });

  const [sourceForm, setSourceForm] = useState({
    name: '',
    description: '',
    type: '',
    parameters: {}
  });

  // Check permissions
  if (!hasPermission('osint:configure')) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions pour gérer les sources OSINT.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadGroups(),
        loadSources(),
        loadStats()
      ]);
    } catch (err: any) {
      setError('Erreur lors du chargement des données');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await taranisService.getSourceGroups();
      setGroups(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (err: any) {
      console.error('Load groups error:', err);
      setGroups([]);
    }
  };

  const loadSources = async () => {
    try {
      const response = await taranisService.getSources();
      setSources(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (err: any) {
      console.error('Load sources error:', err);
      setSources([]);
    }
  };

  const loadStats = async () => {
    try {
      // Utiliser les vraies APIs Taranis pour les stats
      const sourcesResponse = await taranisService.getSources();
      const sourcesData = sourcesResponse.data?.items || [];

      setStats({
        totalSources: sourcesData.length,
        activeSources: sourcesData.filter(s => s.enabled).length,
        lastSync: new Date().toISOString(),
        totalItems: 0 // TODO: Implémenter le comptage des IOCs depuis Taranis
      });
    } catch (err: any) {
      console.error('Erreur chargement stats:', err);
      setStats({
        totalSources: 0,
        activeSources: 0,
        lastSync: new Date().toISOString(),
        totalItems: 0
      });
    }
  };

  // Gestion des groupes
  const handleCreateGroup = async () => {
    try {
      const loadingToast = toast.loading('Création du groupe...');
      await taranisService.createSourceGroup(groupForm);

      toast.success('Groupe créé avec succès !', { id: loadingToast });
      setShowCreateGroup(false);
      setGroupForm({ name: '', description: '', osint_sources: [], word_lists: [] });
      loadGroups();
    } catch (err: any) {
      toast.error('Erreur lors de la création du groupe', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    try {
      const loadingToast = toast.loading('Modification du groupe...');
      await taranisService.updateSourceGroup(editingGroup.id, groupForm);

      toast.success('Groupe modifié avec succès !', { id: loadingToast });
      setEditingGroup(null);
      setGroupForm({ name: '', description: '', osint_sources: [], word_lists: [] });
      loadGroups();
    } catch (err: any) {
      toast.error('Erreur lors de la modification', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;

    try {
      const loadingToast = toast.loading('Suppression du groupe...');
      await taranisService.deleteSourceGroup(groupId);

      toast.success('Groupe supprimé avec succès !', { id: loadingToast });
      loadGroups();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  // Gestion des sources
  const handleCreateSource = async () => {
    try {
      const loadingToast = toast.loading('Création de la source...');
      await taranisService.createSource(sourceForm);

      toast.success('Source créée avec succès !', { id: loadingToast });
      setShowCreateSource(false);
      setSourceForm({ name: '', description: '', type: '', parameters: {} });
      loadSources();
    } catch (err: any) {
      toast.error('Erreur lors de la création de la source', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;

    try {
      const loadingToast = toast.loading('Modification de la source...');
      await taranisService.updateSource(editingSource.id, sourceForm);

      toast.success('Source modifiée avec succès !', { id: loadingToast });
      setEditingSource(null);
      setSourceForm({ name: '', description: '', type: '', parameters: {} });
      loadSources();
    } catch (err: any) {
      toast.error('Erreur lors de la modification', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) return;

    try {
      const loadingToast = toast.loading('Suppression de la source...');
      await taranisService.deleteSource(sourceId);

      toast.success('Source supprimée avec succès !', { id: loadingToast });
      loadSources();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      await taranisService.toggleSource(sourceId, enabled);
      toast.success(`Source ${enabled ? 'activée' : 'désactivée'}`);
      loadSources();
    } catch (err: any) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleCollectSource = async (sourceId: string) => {
    try {
      const loadingToast = toast.loading('Collecte en cours...');
      await taranisService.collectSource(sourceId);

      toast.success('Collecte terminée avec succès', { id: loadingToast });
      loadSources();
    } catch (err: any) {
      toast.error('Erreur lors de la collecte', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const [lastCollectResults, setLastCollectResults] = useState<any[] | null>(null);

  const handleCollectAll = async () => {
    try {
      setSyncing(true);
      const loadingToast = toast.loading('Collecte globale en cours...');

      const result = await taranisService.collectAllSources();
      const resultsArray = result.data?.results || [];
      setLastCollectResults(resultsArray);

      toast.success(result.message, { id: loadingToast });
      loadSources();
      loadStats();
    } catch (err: any) {
      toast.error('Erreur lors de la collecte globale', {
        description: err.response?.data?.error || err.message
      });
    } finally {
      setSyncing(false);
    }
  };

  // Gestion des modales
  const openEditGroup = (group: OSINTSourceGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      osint_sources: group.osint_sources,
      word_lists: group.word_lists
    });
  };

  const openEditSource = (source: OSINTSource) => {
    setEditingSource(source);
    setSourceForm({
      name: source.name,
      description: source.description || '',
      type: source.type,
      parameters: source.parameters || {}
    });
  };

  const resetForms = () => {
    setGroupForm({ name: '', description: '', osint_sources: [], word_lists: [] });
    setSourceForm({ name: '', description: '', type: '', parameters: {} });
    setEditingGroup(null);
    setEditingSource(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
            <p className="text-slate-400">Chargement des sources OSINT...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Gestion OSINT Taranis
          </h1>
          <p className="text-slate-400 mt-1">
            Administration complète des groupes et sources de renseignement
          </p>
        </div>
        <Button
          onClick={handleCollectAll}
          disabled={syncing}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {syncing ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {syncing ? 'Collecte...' : 'Collecte Globale'}
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="text-sm text-slate-400">Sources Totales</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSources}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-slate-400">Sources Actives</p>
                  <p className="text-2xl font-bold text-white">{stats.activeSources}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-slate-400">Items Collectés</p>
                  <p className="text-2xl font-bold text-white">{stats.totalItems.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-400">Dernière Sync</p>
                  <p className="text-sm font-bold text-white">
                    {new Date(stats.lastSync).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dernière collecte globale (visualisation) */}
      {lastCollectResults && lastCollectResults.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Résultats de la dernière collecte globale</h2>
            </div>
            <p className="text-xs text-slate-400">
              {lastCollectResults.length} sources traitées
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lastCollectResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="sourceName" stroke="#9ca3af" hide={lastCollectResults.length > 8} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    border: '1px solid #1f2937',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="collected" fill="#22c55e" name="Collectés" />
                <Bar dataKey="errors" fill="#ef4444" name="Erreurs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Groupes OSINT ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Rss className="w-4 h-4" />
            Sources OSINT ({sources.length})
          </TabsTrigger>
        </TabsList>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Groupes de Sources</h2>
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Nouveau Groupe
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Créer un Groupe OSINT</DialogTitle>
                  <DialogDescription>
                    Organisez vos sources OSINT par groupes pour une meilleure gestion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name" className="text-slate-300">Nom du groupe</Label>
                    <Input
                      id="group-name"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Ex: Sources Publiques, Sources Privées..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-desc" className="text-slate-300">Description</Label>
                    <Textarea
                      id="group-desc"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Description du groupe..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateGroup} className="bg-cyan-600 hover:bg-cyan-700">
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Folder className="w-5 h-5 text-cyan-500" />
                      {group.name}
                    </CardTitle>
                    {group.default && (
                      <Badge className="bg-green-600">Par défaut</Badge>
                    )}
                  </div>
                  <CardDescription className="text-slate-400">
                    {group.description || 'Aucune description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                    <span>{group.osint_sources.length} sources</span>
                    <span>{group.word_lists.length} listes</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditGroup(group)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={group.default}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Sources OSINT</h2>
            <Dialog open={showCreateSource} onOpenChange={setShowCreateSource}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Source
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Créer une Source OSINT</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle source de renseignement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-name" className="text-slate-300">Nom de la source</Label>
                    <Input
                      id="source-name"
                      value={sourceForm.name}
                      onChange={(e) => setSourceForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Ex: Mon RSS Feed, API Twitter..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="source-type" className="text-slate-300">Type</Label>
                    <Select value={sourceForm.type} onValueChange={(value) => setSourceForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="rss_collector">RSS Collector</SelectItem>
                        <SelectItem value="api_collector">API Collector</SelectItem>
                        <SelectItem value="web_scraper">Web Scraper</SelectItem>
                        <SelectItem value="twitter_monitor">Twitter Monitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source-desc" className="text-slate-300">Description</Label>
                    <Textarea
                      id="source-desc"
                      value={sourceForm.description}
                      onChange={(e) => setSourceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Description de la source..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateSource(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSource} className="bg-cyan-600 hover:bg-cyan-700">
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {sources.map((source) => (
              <Card key={source.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Rss className="w-4 h-4 text-cyan-500" />
                          {source.name}
                        </h3>
                        <Badge variant={source.enabled ? "default" : "secondary"}>
                          {source.enabled ? 'Activé' : 'Désactivé'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{source.description}</p>

                      {source.status && (
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                          <span>Dernière collecte: {source.status.last_run ? new Date(source.status.last_run).toLocaleString() : 'Jamais'}</span>
                          <span>Statut: {source.status.status}</span>
                          <span>Résultat: {source.status.result}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCollectSource(source.id)}
                        disabled={!source.enabled}
                        title="Collecter maintenant"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditSource(source)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Switch
                        checked={source.enabled}
                        onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                        title={source.enabled ? 'Désactiver' : 'Activer'}
                      />

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSource(source.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le Groupe</DialogTitle>
            <DialogDescription>
              Modifiez les informations du groupe OSINT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-group-name" className="text-slate-300">Nom du groupe</Label>
              <Input
                id="edit-group-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-group-desc" className="text-slate-300">Description</Label>
              <Textarea
                id="edit-group-desc"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingGroup(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateGroup} className="bg-cyan-600 hover:bg-cyan-700">
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog open={!!editingSource} onOpenChange={() => setEditingSource(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier la Source</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de la source OSINT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-source-name" className="text-slate-300">Nom de la source</Label>
              <Input
                id="edit-source-name"
                value={sourceForm.name}
                onChange={(e) => setSourceForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-source-type" className="text-slate-300">Type</Label>
              <Select value={sourceForm.type} onValueChange={(value) => setSourceForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="rss_collector">RSS Collector</SelectItem>
                  <SelectItem value="api_collector">API Collector</SelectItem>
                  <SelectItem value="web_scraper">Web Scraper</SelectItem>
                  <SelectItem value="twitter_monitor">Twitter Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-source-desc" className="text-slate-300">Description</Label>
              <Textarea
                id="edit-source-desc"
                value={sourceForm.description}
                onChange={(e) => setSourceForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingSource(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateSource} className="bg-cyan-600 hover:bg-cyan-700">
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}