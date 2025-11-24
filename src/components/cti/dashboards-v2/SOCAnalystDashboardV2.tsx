

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Globe,
  Shield,
  TrendingUp,
  MapPin,
  Server,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Eye,
  Target,
  Zap
} from 'lucide-react';

// Recharts imports
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

// Services
import { dashboardService, type DashboardMetrics, type Story, type Asset, type AssetGroup, type ThreatCluster, type DashboardAnalytics } from '../../../services/api/dashboard.service';

// React Query
import { useQuery } from '@tanstack/react-query';

export function SOCAnalystDashboardV2() {
  const [activeTab, setActiveTab] = useState('overview');

  // Chargement des données avec React Query
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['taranis-dashboard'],
    queryFn: () => dashboardService.getDashboardMetrics(),
  });

  const { data: storiesData, isLoading: storiesLoading, error: storiesError } = useQuery({
    queryKey: ['taranis-stories'],
    queryFn: () => dashboardService.getStories(100),
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['taranis-assets'],
    queryFn: () => dashboardService.getAssets(),
  });

  const { data: assetGroupsData } = useQuery({
    queryKey: ['taranis-asset-groups'],
    queryFn: () => dashboardService.getAssetGroups(),
  });

  const { data: threatClustersData, error: threatClustersError } = useQuery({
    queryKey: ['taranis-threat-clusters'],
    queryFn: () => dashboardService.getThreatClusters(),
  });

  // Extraction des données
  const dashboardMetrics = dashboardData?.data;
  const stories = storiesData?.data?.items || [];
  const assets = assetsData?.data?.items || [];
  const assetGroups = assetGroupsData?.data?.items || [];
  const threatClusters = threatClustersData?.data?.items || [];

  const loading = dashboardLoading || storiesLoading || assetsLoading;
  const error = dashboardError?.message;

  // Analyses calculées
  const analytics = useMemo(() => {
    if (!stories.length) return null;

    // Extraction des locations depuis le contenu des stories
    const locationRegex = /\b(France|Germany|USA|China|Russia|UK|Japan|Canada|Australia|Brazil|India|Italy|Spain|Netherlands|Belgium|Switzerland|Sweden|Austria|Poland|Portugal|Ireland|Denmark|Finland|Norway|Czech|Hungary|Slovakia|Slovenia|Croatia|Bulgaria|Romania|Greece|Turkey|Israel|Saudi|UAE|Egypt|South Africa|Mexico|Argentina|Chile|Colombia|Peru|Venezuela|Ecuador|Uruguay|Paraguay|Bolivia|Panama|Cuba|Jamaica|Haiti|Dominican|Costa Rica|Nicaragua|Honduras|El Salvador|Guatemala|Belize|Barbados|Trinidad|Tobago|Guyana|Suriname|French Guiana|Algeria|Morocco|Tunisia|Libya|Egypt|Sudan|Chad|Niger|Mali|Burkina Faso|Ghana|Cote d'Ivoire|Liberia|Sierra Leone|Guinea|Guinea-Bissau|Senegal|Gambia|Cape Verde|Mauritania|Western Sahara)\b/gi;

    const locationThreats = stories.reduce((acc, story) => {
      const locations = story.content.match(locationRegex) || [];
      locations.forEach(location => {
        const key = location.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Analyse des produits affectés
    const productVulnerabilities = assets.reduce((acc, asset) => {
      if (asset.vulnerabilities) {
        asset.vulnerabilities.forEach(vuln => {
          const productType = asset.type || 'Unknown';
          if (!acc[productType]) {
            acc[productType] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
          }
          acc[productType].total++;
          const severity = vuln.severity?.toLowerCase() || 'unknown';
          if (acc[productType][severity as keyof typeof acc[typeof productType]] !== undefined) {
            acc[productType][severity as keyof typeof acc[typeof productType]]++;
          }
        });
      }
      return acc;
    }, {} as Record<string, any>);

    // Timeline des menaces
    const timelineData = stories
      .sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime())
      .map(story => ({
        date: new Date(story.published).toLocaleDateString(),
        threats: 1,
        relevance: story.relevance,
        sources: story.news_items?.length || 1
      }))
      .reduce((acc, item) => {
        const existing = acc.find(x => x.date === item.date);
        if (existing) {
          existing.threats += item.threats;
          existing.relevance = Math.max(existing.relevance, item.relevance);
          existing.sources += item.sources;
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as any[]);

    return {
      locationThreats: Object.entries(locationThreats).map(([location, count]) => ({
        location: location.charAt(0).toUpperCase() + location.slice(1),
        threats: count,
        intensity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
      })),
      productVulnerabilities: Object.entries(productVulnerabilities).map(([product, data]) => ({
        product,
        ...data
      })),
      timelineData,
      topSources: stories.reduce((acc, story) => {
        const source = story.source;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [stories]);

  // Composants de visualisation
  const OverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">News Items</p>
            <p className="text-3xl font-bold text-white">{dashboardMetrics?.total_news_items || 0}</p>
            <p className="text-xs text-blue-300 mt-1">+12% ce mois</p>
          </div>
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Stories Actives</p>
            <p className="text-3xl font-bold text-white">{dashboardMetrics?.total_story_items || 0}</p>
            <p className="text-xs text-green-300 mt-1">+8% ce mois</p>
          </div>
          <Shield className="w-8 h-8 text-green-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-400">Worker Success</p>
            <p className="text-3xl font-bold text-white">{dashboardMetrics?.worker_status?.bot_task?.success_pct || 0}%</p>
            <p className="text-xs text-purple-300 mt-1">Tâches automatisées</p>
          </div>
          <Zap className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-400">Assets Monitorés</p>
            <p className="text-3xl font-bold text-white">{assets.length}</p>
            <p className="text-xs text-orange-300 mt-1">{assetGroups.length} groupes</p>
          </div>
          <Server className="w-8 h-8 text-orange-400" />
        </div>
      </div>
    </div>
  );

  const ThreatMap = () => {
    if (!analytics?.locationThreats) return null;

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
            <Globe className="w-5 h-5" />
            Carte des Menaces par Région
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Répartition géographique des menaces détectées
          </p>
        </div>
        <div className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.locationThreats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="location"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="threats" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ProductVulnerabilitiesChart = () => {
    if (!analytics?.productVulnerabilities) return null;

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
            <Server className="w-5 h-5" />
            Vulnérabilités par Produit
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Analyse des vulnérabilités affectant vos actifs
          </p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.productVulnerabilities}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="product"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critique" />
                <Bar dataKey="high" stackId="a" fill="#f97316" name="Élevé" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Moyen" />
                <Bar dataKey="low" stackId="a" fill="#22c55e" name="Faible" />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Total"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ThreatTimeline = () => {
    if (storiesError) {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="text-center text-red-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p>Erreur chargement timeline</p>
            <p className="text-sm mt-1">{storiesError.message}</p>
          </div>
        </div>
      );
    }

    if (!analytics?.timelineData || !analytics.timelineData.length) {
      return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-center text-slate-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p>Timeline des menaces en cours de chargement...</p>
            {analytics?.timelineData && <p className="text-sm mt-2">Données: {analytics.timelineData.length} points</p>}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="w-5 h-5" />
            Évolution Temporelle des Menaces ({analytics.timelineData.length} points)
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Timeline des incidents et sources d'information
          </p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.timelineData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="threats"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Menaces"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sources"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Sources"
                />
                <Bar
                  yAxisId="left"
                  dataKey="relevance"
                  fill="#f97316"
                  opacity={0.7}
                  name="Pertinence"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ThreatClustersWidget = () => {
    if (threatClustersError) {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="text-center text-red-400">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p>Erreur chargement clusters</p>
            <p className="text-sm mt-1">{threatClustersError.message}</p>
          </div>
        </div>
      );
    }

    if (!threatClusters || !threatClusters.length) {
      return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-center text-slate-400">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p>Clusters de menaces en cours de chargement...</p>
          </div>
        </div>
      );
    }

    const clusterData = threatClusters.flatMap(cluster => {
      if (!cluster.tags || !Array.isArray(cluster.tags)) return [];
      return cluster.tags.map(tag => ({
        cluster: cluster.name,
        tag: tag.name,
        size: tag.size,
        totalSize: cluster.size
      }));
    });

    if (!clusterData.length) {
      return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-center text-slate-400">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p>Aucun cluster de menaces disponible</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
            <Target className="w-5 h-5" />
            Clusters de Menaces ({clusterData.length})
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Analyse IA des tendances et patterns de menaces
          </p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="tag"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="size" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
            <p className="text-slate-400">Chargement du Dashboard SOC Ultime...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-500" />
            Dashboard SOC Ultime
          </h1>
          <p className="text-slate-400 mt-2">
            Intelligence artificielle avancée avec visualisations Recharts - Powered by Taranis AI
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* KPIs Cards */}
      <OverviewCards />

      {/* Main Dashboard */}
      <div className="space-y-6">
        {/* Navigation Tabs Simple */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('geographic')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'geographic'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Analyse Géographique
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'assets'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Actifs & Vulnérabilités
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'intelligence'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Intelligence IA
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThreatTimeline />
              <ThreatClustersWidget />
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="space-y-6">
            <ThreatMap />
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <ProductVulnerabilitiesChart />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-white text-lg font-semibold">Intelligence Artificielle Avancée</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Analyse prédictive et corrélation automatisée des menaces
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Fonctionnalités IA avancées en développement...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
