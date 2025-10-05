/**
 * Bots Dashboard Advanced - Gestionnaire Enterprise des Bots IA
 * Interface complète pour l'orchestration, monitoring et gestion des bots d'intelligence artificielle
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Bot, Brain, Activity, Play, Pause, Settings, 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Zap, Target, Database, RefreshCw, Plus,
  Eye, Edit, Trash2, Copy, Filter, Search, Memory,
  Cpu, HardDrive, Network, Gauge, Users, FileText,
  Workflow, Monitor, Bell, History
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { getBotService } from './services/bot-service';
import { allBotTemplates, getTemplatesByType } from './data/bot-templates';
import { Bot as BotType, BotStatistics, BotTemplate, BotPipeline } from './types/bot-types';

export function BotsDashboardAdvanced() {
  const [activeTab, setActiveTab] = useState('overview');
  const [bots, setBots] = useState<BotType[]>([]);
  const [statistics, setStatistics] = useState<BotStatistics | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const botService = getBotService();

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [botsData, statsData] = await Promise.all([
        botService.getBots(),
        botService.getBotStatistics()
      ]);
      
      setBots(botsData);
      setStatistics(statsData);
    } catch (err) {
      setError(`Erreur lors du chargement: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [botService]);

  // Actions sur les bots
  const handleBotAction = useCallback(async (botId: string, action: string) => {
    try {
      setIsLoading(true);
      let success = false;

      switch (action) {
        case 'start':
          success = await botService.startBot(botId);
          break;
        case 'stop':
          success = await botService.stopBot(botId);
          break;
        case 'restart':
          success = await botService.restartBot(botId);
          break;
        case 'clone':
          await botService.cloneBot(botId);
          success = true;
          break;
        case 'delete':
          success = await botService.deleteBot(botId);
          break;
      }

      if (success) {
        await loadData();
      }
    } catch (err) {
      setError(`Erreur lors de l'action ${action}: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [botService, loadData]);

  // Créer un bot à partir d'un template
  const createBotFromTemplate = useCallback(async (template: BotTemplate) => {
    try {
      setIsLoading(true);
      
      const botData: Partial<BotType> = {
        name: template.name,
        type: template.type,
        description: template.description,
        config: {
          enabled: true,
          schedule: template.defaultConfig.schedule || '0 */8 * * *',
          timeout: template.defaultConfig.timeout || 3600,
          retryAttempts: template.defaultConfig.retryAttempts || 3,
          retryDelay: template.defaultConfig.retryDelay || 60,
          resources: template.defaultConfig.resources || {
            cpuLimit: 2,
            memoryLimit: 1024,
            diskSpace: 100
          },
          parameters: template.defaultParameters || {},
          triggers: template.defaultConfig.triggers || {
            timeBased: true,
            eventBased: false,
            dataBased: false,
            runAfterCollector: false,
            runAfterAnalyzer: false
          },
          notifications: template.defaultConfig.notifications || {
            onSuccess: false,
            onError: true,
            onWarning: true,
            recipients: []
          }
        },
        priority: 'medium',
        tags: template.tags
      };

      await botService.createBot(botData);
      await loadData();
      setShowTemplates(false);
    } catch (err) {
      setError(`Erreur lors de la création du bot: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [botService, loadData]);

  // Filtrer les bots
  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || bot.type === filterType;
    const matchesStatus = filterStatus === 'all' || bot.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Obtenir l'icône pour le type de bot
  const getBotTypeIcon = (type: string) => {
    switch (type) {
      case 'collector': return Database;
      case 'analyzer': return Brain;
      case 'enricher': return Zap;
      case 'correlator': return Network;
      case 'reporter': return FileText;
      default: return Bot;
    }
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur du badge de type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'collector': return 'bg-blue-100 text-blue-800';
      case 'analyzer': return 'bg-purple-100 text-purple-800';
      case 'enricher': return 'bg-green-100 text-green-800';
      case 'correlator': return 'bg-orange-100 text-orange-800';
      case 'reporter': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bots</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalBots}</p>
                </div>
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bots Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.overview.activeBots}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.overview.runningBots}</p>
                </div>
                <Play className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux de Succès</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.overview.avgSuccessRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Interface principale avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="bots">Gestion des Bots</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Bot
            </Button>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistiques par type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Bots par Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && Object.entries(statistics.byType).map(([type, data]) => {
                  const IconComponent = getBotTypeIcon(type);
                  return (
                    <div key={type} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {data.count} bots
                        </span>
                        <span className="text-sm font-medium">
                          {data.successRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Par Débit</h4>
                    {statistics?.topPerformers.byThroughput.slice(0, 3).map((bot, index) => (
                      <div key={bot.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{bot.name}</span>
                        <span className="text-sm font-medium">
                          {bot.metrics.performance.throughput.toFixed(1)}/min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métriques de performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Métriques de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="throughput" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des bots */}
        <TabsContent value="bots" className="space-y-6">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un bot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="collector">Collector</SelectItem>
                    <SelectItem value="analyzer">Analyzer</SelectItem>
                    <SelectItem value="enricher">Enricher</SelectItem>
                    <SelectItem value="correlator">Correlator</SelectItem>
                    <SelectItem value="reporter">Reporter</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="running">En cours</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des bots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBots.map((bot) => {
              const TypeIcon = getBotTypeIcon(bot.type);
              
              return (
                <Card key={bot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="w-6 h-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{bot.name}</CardTitle>
                          <CardDescription>{bot.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeBadgeColor(bot.type)}>
                          {bot.type}
                        </Badge>
                        <Badge className={getStatusBadgeColor(bot.status)}>
                          {bot.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Métriques */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{bot.metrics.performance.totalRuns}</p>
                        <p className="text-xs text-muted-foreground">Exécutions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{bot.metrics.operational.successRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Succès</p>
                      </div>
                    </div>

                    {/* Dernière exécution */}
                    <div className="text-sm text-muted-foreground">
                      Dernière exécution: {new Date(bot.metrics.performance.lastRun).toLocaleString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bot.status === 'running' || bot.status === 'active'}
                          onCheckedChange={(checked) => {
                            const action = checked ? 'start' : 'stop';
                            handleBotAction(bot.id, action);
                          }}
                          disabled={isLoading}
                        />
                        <span className="text-sm">
                          {bot.status === 'running' || bot.status === 'active' ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {/* Boutons Start/Stop explicites */}
                        {bot.status === 'running' || bot.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBotAction(bot.id, 'stop')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBotAction(bot.id, 'start')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBot(bot)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBotAction(bot.id, 'clone')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBotAction(bot.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredBots.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucun bot trouvé</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Aucun bot ne correspond aux critères de recherche.'
                    : 'Créez votre premier bot en utilisant un template.'}
                </p>
                <Button onClick={() => setShowTemplates(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un Bot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBotTemplates.map((template) => {
              const TypeIcon = getBotTypeIcon(template.type);
              
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => createBotFromTemplate(template)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getTypeBadgeColor(template.type)}>
                        {template.type}
                      </Badge>
                      <Badge variant="outline">
                        {template.difficulty}
                      </Badge>
                      {template.isOfficial && (
                        <Badge variant="secondary">Officiel</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Catégorie:</span> {template.category}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Version:</span> {template.version}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Auteur:</span> {template.author}
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Utiliser ce Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Pipelines */}
        <TabsContent value="pipelines" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <Workflow className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Pipelines de Bots</h3>
              <p className="text-gray-500 mb-4">
                Fonctionnalité en cours de développement. Orchestrez vos bots en pipelines automatisés.
              </p>
              <Button disabled>
                <Workflow className="w-4 h-4 mr-2" />
                Créer un Pipeline
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Analytics Avancées</h3>
              <p className="text-gray-500 mb-4">
                Analysez les performances de vos bots avec des métriques détaillées et des insights.
              </p>
              <Button disabled>
                <TrendingUp className="w-4 h-4 mr-2" />
                Voir les Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détails du bot */}
      <Dialog open={!!selectedBot} onOpenChange={() => setSelectedBot(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {selectedBot?.name}
            </DialogTitle>
            <DialogDescription>
              Gestion détaillée et contrôle du bot {selectedBot?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedBot && (
            <div className="space-y-6">
              {/* En-tête avec statut et actions */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedBot.status === 'running' ? 'bg-green-500' :
                      selectedBot.status === 'active' ? 'bg-blue-500' :
                      selectedBot.status === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="font-medium capitalize">{selectedBot.status}</span>
                  </div>
                  <Badge variant="outline">{selectedBot.type}</Badge>
                  <Badge variant="outline">{selectedBot.priority}</Badge>
                </div>

                {/* Boutons de contrôle principaux */}
                <div className="flex items-center gap-2">
                  {selectedBot.status === 'running' || selectedBot.status === 'active' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleBotAction(selectedBot.id, 'stop')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Arrêter
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBotAction(selectedBot.id, 'restart')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Redémarrer
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleBotAction(selectedBot.id, 'start')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Démarrer
                    </Button>
                  )}
                </div>
              </div>

              {/* Métriques en temps réel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Traitements</p>
                        <p className="text-2xl font-bold">{selectedBot.metrics.totalProcessed}</p>
                      </div>
                      <Database className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taux de succès</p>
                        <p className="text-2xl font-bold">{selectedBot.metrics.successRate}%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Débit</p>
                        <p className="text-2xl font-bold">{selectedBot.metrics.throughput}/h</p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Disponibilité</p>
                        <p className="text-2xl font-bold">{selectedBot.metrics.availability}%</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Planification</label>
                      <p className="text-sm text-muted-foreground">{selectedBot.config.schedule}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Timeout</label>
                      <p className="text-sm text-muted-foreground">{selectedBot.config.timeout}s</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Limite CPU</label>
                      <p className="text-sm text-muted-foreground">{selectedBot.config.resources.cpuLimit} cores</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Limite Mémoire</label>
                      <p className="text-sm text-muted-foreground">{selectedBot.config.resources.memoryLimit} MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historique récent */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historique Récent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedBot.history.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.status === 'success' ? 'bg-green-500' :
                            entry.status === 'error' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <span className="text-sm">{entry.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions supplémentaires */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleBotAction(selectedBot.id, 'clone')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Cloner
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBot(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
