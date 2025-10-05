import { useState, useEffect } from 'react';
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
import { 
  Activity, Bot, Database, Globe, Cpu, Zap, Brain, Target, 
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Play, Pause,
  Eye, Settings, Search, Filter, Download, ExternalLink,
  Rss, Github, Shield, Bug, Newspaper, Users, TrendingUp, Server, 
  Wifi, WifiOff, FileText, Calendar, Timer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Cell } from 'recharts';
// import { taranisApi } from '../utils/taranis/api';
// import { TaranisSource, TaranisBot, TaranisReport, TaranisStats } from '../utils/taranis/config';
import { env, debugLog, errorLog } from '../utils/env';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'stopped':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'disabled':
      return <Clock className="w-4 h-4 text-gray-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'stopped':
      return <Badge variant="destructive">{status}</Badge>;
    case 'error':
      return <Badge variant="destructive">{status}</Badge>;
    case 'disabled':
      return <Badge variant="secondary">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getThreatLevelBadge = (level: string) => {
  switch (level) {
    case 'critical':
      return <Badge variant="destructive">{level}</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{level}</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{level}</Badge>;
    case 'low':
      return <Badge className="bg-blue-500 hover:bg-blue-600">{level}</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
};

const getBotIcon = (type: string) => {
  switch (type) {
    case 'collector':
      return <Database className="w-5 h-5 text-blue-500" />;
    case 'analyzer':
      return <Brain className="w-5 h-5 text-purple-500" />;
    case 'enricher':
      return <Zap className="w-5 h-5 text-yellow-500" />;
    default:
      return <Bot className="w-5 h-5 text-gray-500" />;
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
      return <Server className="w-4 h-4 text-purple-500" />;
    default:
      return <Database className="w-4 h-4 text-gray-500" />;
  }
};

export function TaranisDashboard() {
  const [sources, setSources] = useState<TaranisSource[]>([]);
  const [bots, setBots] = useState<TaranisBot[]>([]);
  const [reports, setReports] = useState<TaranisReport[]>([]);
  const [stats, setStats] = useState<TaranisStats>({
    totalCollections: 0,
    activeBots: 0,
    averageConfidence: 0,
    criticalAlerts: 0,
    sourcesMonitored: 0,
    dailyGrowthRate: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');

  // Test de connexion et chargement initial
  useEffect(() => {
    loadTaranisData();
    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(loadTaranisData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTaranisData = async () => {
    setLoading(true);
    try {
      // Test de connexion
      const connected = await taranisApi.testConnection();
      setIsConnected(connected);

      if (connected) {
        // Charger les données en parallèle
        const [sourcesData, botsData, reportsData, statsData] = await Promise.all([
          taranisApi.getSources(),
          taranisApi.getBots(),
          taranisApi.getReports({ limit: 50 }),
          taranisApi.getStats()
        ]);

        setSources(sourcesData);
        setBots(botsData);
        setReports(reportsData);
        setStats(statsData);
      } else {
        // Utiliser des données de démonstration si pas connecté
        setSources([
          {
            id: 'demo-1',
            name: 'CISA Advisories',
            type: 'RSS',
            url: 'https://www.cisa.gov/cybersecurity-advisories/rss.xml',
            enabled: true,
            last_collected: new Date().toISOString(),
            collected_count: 47,
            status: 'active'
          },
          {
            id: 'demo-2',
            name: 'GitHub Security',
            type: 'API',
            url: 'https://api.github.com/advisories',
            enabled: true,
            last_collected: new Date().toISOString(),
            collected_count: 23,
            status: 'active'
          }
        ]);
setBots([
          {
            id: 'demo-bot-1',
            name: 'NLP Analyzer',
            type: 'analyzer',
            status: 'running',
            lastRun: new Date().toISOString(),
            last_run: new Date().toISOString(),
            collectionsToday: 156,
            processed_count: 156,
            success_rate: 94.5,
            errorRate: 0.05,
            uptime: 99.2
          }
        ]);
        setReports([]);
        setStats({
          totalCollections: 0,
          activeBots: 1,
          averageConfidence: 85.2,
          criticalAlerts: 0,
          sourcesMonitored: 2,
          dailyGrowthRate: 5.4
        });
      }
    } catch (error) {
      errorLog(error as Error, 'Failed to load Taranis data');
      setIsConnected(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const handleRefresh = () => {
    loadTaranisData();
  };

  const handleBotAction = async (botId: string, action: 'start' | 'stop') => {
    try {
      const success = action === 'start' 
        ? await taranisApi.startBot(botId)
        : await taranisApi.stopBot(botId);

      if (success) {
        // Recharger les bots
        const botsData = await taranisApi.getBots();
        setBots(botsData);
      }
    } catch (error) {
      console.error(`Failed to ${action} bot:`, error);
    }
  };

  const handleSourceToggle = async (sourceId: string, enabled: boolean) => {
    try {
      const success = await taranisApi.updateSourceStatus(sourceId, enabled);
      if (success) {
        // Recharger les sources
        const sourcesData = await taranisApi.getSources();
        setSources(sourcesData);
      }
    } catch (error) {
      console.error('Failed to update source:', error);
    }
  };

  // Filtrage des sources
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedSourceType === 'all' || source.type === selectedSourceType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Taranis AI Engine</h1>
              <p className="text-muted-foreground">OSINT Collection & Intelligence Enrichment Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-green-500" />
              Connected to Local Instance
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Demo Mode (No Connection)
            </Badge>
          )}
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {stats.activeBots} Bots Actifs
          </Badge>
          <Button size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert de connexion */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Impossible de se connecter à Taranis. Mode démonstration activé.</p>
              <p className="text-sm">
                <strong>Pour connecter votre instance locale :</strong><br/>
                1. Démarrez Taranis sur <code>{env.taranis.baseUrl}</code><br/>
                2. Configurez votre clé API dans les variables d'environnement<br/>
                3. Rafraîchissez cette page
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sources Actives</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sourcesMonitored}</div>
            <div className="text-xs text-muted-foreground">
              sources surveillées
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Bots Actifs</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBots}</div>
            <div className="text-xs text-muted-foreground">
              Enrichissement en cours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rapports Aujourd'hui</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
            <div className="text-xs text-muted-foreground">
              {stats.totalCollections} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Temps de Traitement Moyen</CardTitle>
            <Timer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Par élément traité
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Sources OSINT</TabsTrigger>
          <TabsTrigger value="bots">Bots d'Enrichissement</TabsTrigger>
          <TabsTrigger value="reports">Rapports Générés</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher des sources OSINT..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type de source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="RSS">RSS/Atom</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="WEB">Web Scraping</SelectItem>
                <SelectItem value="TWITTER">Twitter</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sources de Collecte OSINT</CardTitle>
              <CardDescription>
                Collection automatisée de threat intelligence depuis des sources ouvertes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Collectés</TableHead>
                    <TableHead>Dernière Collecte</TableHead>
                    <TableHead>Activé</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getSourceTypeIcon(source.type)}
                          <div>
                            <div className="font-medium">{source.name}</div>
                            <div className="text-sm text-muted-foreground font-mono text-xs">
                              {source.url}
                            </div>
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
                          {source.collected_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(source.last_collected).toLocaleString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={(enabled) => handleSourceToggle(source.id, enabled)}
                          disabled={!isConnected}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" disabled={!isConnected}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bots d'Enrichissement IA</CardTitle>
              <CardDescription>
                Bots alimentés par IA pour l'analyse et l'enrichissement automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <Card key={bot.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getBotIcon(bot.type)}
                        <div>
                          <div className="font-medium">{bot.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{bot.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(bot.status)}
                        {isConnected && (
                          <div className="flex gap-1">
                            {bot.status === 'running' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBotAction(bot.id, 'stop')}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBotAction(bot.id, 'start')}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Éléments traités:</span>
                        <span className="font-medium">{bot.processed_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taux de succès:</span>
                        <span className="font-medium">{bot.success_rate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dernière exécution:</span>
                        <span className="font-medium">
                          {new Date(bot.last_run).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <Progress value={bot.success_rate} className="mt-2" />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports Générés</CardTitle>
              <CardDescription>
                Rapports d'intelligence générés automatiquement par Taranis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isConnected 
                      ? "Aucun rapport généré pour le moment"
                      : "Connectez-vous à Taranis pour voir les rapports"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Niveau de Menace</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Date de Création</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.tags.join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getThreatLevelBadge(report.threat_level)}
                        </TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.enriched ? "default" : "secondary"}>
                            {report.enriched ? "Analysé" : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collecte au Fil du Temps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { time: '00:00', collected: 45 },
                      { time: '04:00', collected: 67 },
                      { time: '08:00', collected: 123 },
                      { time: '12:00', collected: 234 },
                      { time: '16:00', collected: 189 },
                      { time: '20:00', collected: 156 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance des Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bots.map(bot => ({
                      name: bot.name,
                      success_rate: bot.success_rate,
                      processed: bot.processed_count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="success_rate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center">
        Dernière mise à jour: {lastRefresh.toLocaleString('fr-FR')} • 
        Statut: {isConnected ? 'Connecté à Taranis Local' : 'Mode Démonstration'}
      </div>
    </div>
  );
}