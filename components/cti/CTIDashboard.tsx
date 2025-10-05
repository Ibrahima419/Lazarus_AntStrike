/**
 * CTI Dashboard Principal - Plateforme Enterprise
 * Exploite TOUT le potentiel de Taranis AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Shield, Brain, Search, Network, Target, Users, 
  Activity, Globe, Zap, Database, FileText, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Eye, Settings
} from 'lucide-react';

// Import des modules CTI spécialisés
import { ThreatIntelligenceMap } from './ThreatIntelligenceMap';
import { StoriesBuilder } from './StoriesBuilder';
import { OSINTCollector } from './OSINTCollector';
import { BotsDashboard } from './BotsDashboard';
import { InvestigationFlow } from './InvestigationFlow';
import { CorrelationEngine } from './CorrelationEngine';
import { IOCsManager } from './IOCsManager';
import { CampaignsTracker } from './CampaignsTracker';
import { ReportsBuilder } from './ReportsBuilder';
import { ReportGeneratorDashboard } from './ReportGeneratorDashboard';
import { SourceIngestionManager } from './SourceIngestionManager';

// Import du service Taranis
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface CTIStats {
  totalThreats: number;
  activeCampaigns: number;
  iocsCollected: number;
  storiesCreated: number;
  botsActive: number;
  sourcesMonitored: number;
  criticalAlerts: number;
  avgResponseTime: number;
}

interface CTIAlert {
  id: string;
  type: 'threat' | 'campaign' | 'ioc' | 'story';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  confidence: number;
}

export function CTIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<CTIStats>({
    totalThreats: 0,
    activeCampaigns: 0,
    iocsCollected: 0,
    storiesCreated: 0,
    botsActive: 0,
    sourcesMonitored: 0,
    criticalAlerts: 0,
    avgResponseTime: 0
  });
  const [alerts, setAlerts] = useState<CTIAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const service = getTaranisService();

  useEffect(() => {
    loadCTIData();
    const interval = setInterval(loadCTIData, 30000); // Refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadCTIData = async () => {
    try {
      const connected = await service.testConnection();
      setIsConnected(connected);

      if (connected) {
        // Charger toutes les données CTI en parallèle
        const [
          bots,
          sources,
          newsItems,
          reports,
          stories,
          dashboardData
        ] = await Promise.all([
          service.getBots(),
          service.getSources(),
          service.getNewsItems(100),
          service.getReports(),
          service.getStories(),
          service.getDashboardStats()
        ]);

        // Calculer les stats CTI basées sur les vraies données
        const calculatedStats = await calculateRealCTIStats(newsItems, stories, bots, sources, reports);
        setStats(calculatedStats);

        // Générer des alertes CTI
        generateCTIAlerts(newsItems, reports, stories);
      }
    } catch (error) {
      console.error('Erreur chargement données CTI:', error);
    }
  };

  // ============ CALCUL DES VRAIES STATISTIQUES CTI ============
  
  const calculateRealCTIStats = async (
    newsItems: any[], 
    stories: any[], 
    bots: any[], 
    sources: any[], 
    reports: any[]
  ): Promise<CTIStats> => {
    try {
      // Calculer les statistiques basées sur les vraies données
      const totalThreats = newsItems.length;
      
      // Calculer les campagnes actives basées sur les stories récentes
      const activeCampaigns = stories.filter(story => {
        const storyDate = new Date(story.created || story.last_change);
        const daysSinceCreation = (Date.now() - storyDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation <= 30; // Stories créées dans les 30 derniers jours
      }).length;

      // Calculer les IOCs collectés depuis les attributs des news items
      const iocsCollected = newsItems.reduce((acc, item) => {
        if (item.attributes) {
          return acc + item.attributes.filter((attr: any) => 
            attr.key === 'ip' || attr.key === 'domain' || attr.key === 'url' || attr.key === 'hash'
          ).length;
        }
        return acc;
      }, 0);

      const storiesCreated = stories.length;
      
      // Calculer les bots actifs
      const botsActive = bots.filter(bot => 
        bot.status === 'active' || bot.status === 'running'
      ).length;

      // Calculer les sources surveillées
      const sourcesMonitored = sources.filter(source => source.enabled).length;

      // Calculer les alertes critiques
      const criticalAlerts = reports.filter(report => 
        report.threatLevel === 'critical' || report.severity === 'critical'
      ).length;

      // Calculer le temps de réponse moyen basé sur les métriques des bots
      const avgResponseTime = await calculateAverageResponseTime(bots, newsItems);

      return {
        totalThreats,
        activeCampaigns,
        iocsCollected,
        storiesCreated,
        botsActive,
        sourcesMonitored,
        criticalAlerts,
        avgResponseTime
      };
    } catch (error) {
      console.error('Erreur calcul statistiques CTI:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        totalThreats: 0,
        activeCampaigns: 0,
        iocsCollected: 0,
        storiesCreated: 0,
        botsActive: 0,
        sourcesMonitored: 0,
        criticalAlerts: 0,
        avgResponseTime: 0
      };
    }
  };

  const calculateAverageResponseTime = async (bots: any[], newsItems: any[]): Promise<number> => {
    try {
      // Calculer le temps de réponse basé sur les performances des bots
      let totalProcessingTime = 0;
      let processedItems = 0;

      bots.forEach(bot => {
        if (bot.processedCount && bot.lastRun) {
          // Estimer le temps de traitement basé sur le nombre d'items traités
          const estimatedTime = bot.processedCount * 0.5; // 0.5 seconde par item en moyenne
          totalProcessingTime += estimatedTime;
          processedItems += bot.processedCount;
        }
      });

      // Calculer aussi basé sur les news items récents
      const recentNewsItems = newsItems.filter(item => {
        const itemDate = new Date(item.collected || item.last_change);
        const daysSinceCollection = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCollection <= 7; // Items des 7 derniers jours
      });

      // Estimer le temps de traitement des news items
      recentNewsItems.forEach(item => {
        totalProcessingTime += 2; // 2 secondes par news item
        processedItems += 1;
      });

      if (processedItems > 0) {
        return Math.round(totalProcessingTime / processedItems);
      }

      // Fallback : estimation basée sur le type de bots
      const avgBotTime = bots.length > 0 
        ? bots.reduce((sum, bot) => {
            const botTypeTime: Record<string, number> = {
              'collector': 1,
              'analyzer': 3,
              'enricher': 2,
              'correlator': 5,
              'reporter': 4
            };
            return sum + (botTypeTime[bot.type] || 2);
          }, 0) / bots.length
        : 3;

      return Math.round(avgBotTime);
    } catch (error) {
      console.error('Erreur calcul temps de réponse moyen:', error);
      return 45; // Valeur par défaut
    }
  };

  const generateCTIAlerts = (newsItems: any[], reports: any[], stories: any[]) => {
    const newAlerts: CTIAlert[] = [];

    // Alertes basées sur les news items récents
    newsItems.slice(0, 5).forEach((item, index) => {
      if (item.riskLevel === 'high' || item.riskLevel === 'critical') {
        newAlerts.push({
          id: `news-${item.id}`,
          type: 'threat',
          severity: item.riskLevel as any,
          title: `Nouvelle menace détectée`,
          description: item.title,
          timestamp: new Date(item.collectedDate),
          source: item.osintSourceId,
          confidence: item.confidence || 0.8
        });
      }
    });

    // Alertes basées sur les rapports critiques
    reports.filter(r => r.threatLevel === 'critical').forEach((report, index) => {
      newAlerts.push({
        id: `report-${report.id}`,
        type: 'story',
        severity: 'critical',
        title: `Rapport critique généré`,
        description: report.title,
        timestamp: new Date(report.createdDate),
        source: 'Analyse IA',
        confidence: 0.9
      });
    });

    setAlerts(newAlerts.slice(0, 10)); // Garder seulement les 10 plus récentes
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header CTI */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              CTI Platform Enterprise
            </h1>
            <p className="text-muted-foreground mt-1">
              Cyber Threat Intelligence Platform powered by Taranis AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
              {isConnected ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button onClick={loadCTIData} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats CTI */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalThreats}</p>
                  <p className="text-xs text-muted-foreground">Threats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.iocsCollected}</p>
                  <p className="text-xs text-muted-foreground">IOCs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.storiesCreated}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.botsActive}</p>
                  <p className="text-xs text-muted-foreground">Bots Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sourcesMonitored}</p>
                  <p className="text-xs text-muted-foreground">Sources</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}m</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts CTI */}
      {alerts.length > 0 && (
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(alert.confidence * 100)}% confidence
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modules CTI */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="investigation" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Investigation
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Intelligence
                    </TabsTrigger>
                    <TabsTrigger value="osint" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      OSINT
                    </TabsTrigger>
                    <TabsTrigger value="sources" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Sources
                    </TabsTrigger>
                    <TabsTrigger value="bots" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Bots
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Reports
                    </TabsTrigger>
                  </TabsList>

          <TabsContent value="overview" className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <ThreatIntelligenceMap />
              <StoriesBuilder />
            </div>
          </TabsContent>

          <TabsContent value="investigation" className="h-full">
            <InvestigationFlow />
          </TabsContent>

          <TabsContent value="intelligence" className="h-full">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IOCsManager />
                <CampaignsTracker />
              </div>
              <CorrelationEngine />
            </div>
          </TabsContent>

                  <TabsContent value="osint" className="h-full">
                    <OSINTCollector />
                  </TabsContent>

                  <TabsContent value="sources" className="h-full">
                    <SourceIngestionManager />
                  </TabsContent>

                  <TabsContent value="bots" className="h-full">
                    <BotsDashboard />
                  </TabsContent>

          <TabsContent value="reports" className="h-full">
            <ReportGeneratorDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
