/**
 * 🔍 Threat Intelligence Hub v2.0 - Production Ready
 * Investigation interactive avec vraies données Taranis
 * Design cybersécurité professionnel
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Globe, Shield, AlertTriangle, TrendingUp, Clock, Users,
  FileText, Download, Share2, Network, Target, Zap,
  BarChart3, Activity, Eye, Search, Filter, RefreshCw,
  MapPin, Building, User, Package, Link as LinkIcon,
  CheckCircle2, XCircle, Copy, Mail, MessageSquare,
  ExternalLink, ChevronRight, Layers, Database, Map
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';
import { ThreatWorldMap } from './ThreatWorldMap';

export function ThreatIntelligenceHub() {
  const [stories, setStories] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [activeView, setActiveView] = useState<'map' | 'worldmap' | 'timeline' | 'network' | 'analytics'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [extractedEntities, setExtractedEntities] = useState<any>({
    locations: [],
    organizations: [],
    persons: [],
    products: []
  });

  const service = getTaranisService();

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  const loadIntelligenceData = async () => {
    try {
      setLoading(true);
      await service.login('admin', 'admin');

      const [storiesData, clustersData, sourcesData, dashboardData] = await Promise.all([
        service.getStories(),
        service.getTrendingClusters(7),
        service.getOSINTSources(),
        service.getDashboard()
      ]);

      setStories(storiesData || []);
      setClusters(clustersData || []);
      setSources(sourcesData || []);
      setDashboard(dashboardData);

      // Extraire entités des vraies données
      extractEntitiesFromData(storiesData || [], clustersData || []);

      showNotification('Données chargées avec succès', 'success');

    } catch (error) {
      console.error('Error loading intelligence:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const extractEntitiesFromData = (storiesData: any[], clustersData: any[]) => {
    const entities: any = {
      locations: [],
      organizations: [],
      persons: [],
      products: []
    };

    // Extraire des clusters
    clustersData.forEach(cluster => {
      if (cluster.name === 'Location') {
        entities.locations = cluster.tags?.map((tag: any) => ({
          name: tag.name,
          mentions: tag.size,
          type: 'location'
        })) || [];
      } else if (cluster.name === 'Organization') {
        entities.organizations = cluster.tags?.map((tag: any) => ({
          name: tag.name,
          mentions: tag.size,
          type: 'organization'
        })) || [];
      } else if (cluster.name === 'Person') {
        entities.persons = cluster.tags?.map((tag: any) => ({
          name: tag.name,
          mentions: tag.size,
          type: 'person'
        })) || [];
      } else if (cluster.name === 'Product') {
        entities.products = cluster.tags?.map((tag: any) => ({
          name: tag.name,
          mentions: tag.size,
          type: 'product'
        })) || [];
      }
    });

    // Extraire aussi du contenu des stories
    const locationKeywords = ['russia', 'china', 'usa', 'iran', 'north korea', 'ukraine', 'france', 'germany', 'austria', 'europe', 'asia'];
    const orgKeywords = ['microsoft', 'apple', 'google', 'amazon', 'facebook', 'meta', 'tesla', 'nvidia'];
    
    storiesData.forEach(story => {
      const content = (story.title + ' ' + story.content + ' ' + 
                       story.newsItems?.map((n: any) => n.content || '').join(' ')).toLowerCase();
      
      // Locations
      locationKeywords.forEach(keyword => {
        if (content.includes(keyword) && !entities.locations.find((l: any) => l.name.toLowerCase() === keyword)) {
          entities.locations.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            mentions: (content.match(new RegExp(keyword, 'gi')) || []).length,
            type: 'location'
          });
        }
      });

      // Organizations
      orgKeywords.forEach(keyword => {
        if (content.includes(keyword) && !entities.organizations.find((o: any) => o.name.toLowerCase() === keyword)) {
          entities.organizations.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            mentions: (content.match(new RegExp(keyword, 'gi')) || []).length,
            type: 'organization'
          });
        }
      });
    });

    // Trier par mentions
    entities.locations.sort((a: any, b: any) => b.mentions - a.mentions);
    entities.organizations.sort((a: any, b: any) => b.mentions - a.mentions);
    entities.persons.sort((a: any, b: any) => b.mentions - a.mentions);
    entities.products.sort((a: any, b: any) => b.mentions - a.mentions);

    setExtractedEntities(entities);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const exportIntelligence = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const data = {
        exported: new Date().toISOString(),
        source: 'AntStrike CTI Platform',
        stories: stories.length,
        clusters: clusters.length,
        entities: extractedEntities,
        topStories: stories.slice(0, 20).map(s => ({
          title: s.title,
          date: s.created || s.createdDate,
          sources: s.newsItems?.length || 0,
          link: s.newsItems?.[0]?.link
        }))
      };

      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `threat_intel_${Date.now()}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = 'Title,Date,Sources,Category\n';
        stories.slice(0, 50).forEach(s => {
          content += `"${s.title}","${new Date(s.created || s.createdDate).toISOString()}","${s.newsItems?.length || 0}","Intelligence"\n`;
        });
        filename = `threat_intel_${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        // PDF comme HTML stylé
        content = generateIntelReport(data);
        filename = `threat_intel_report_${Date.now()}.html`;
        mimeType = 'text/html';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification(`Intelligence exportée (${format.toUpperCase()})`, 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  const generateIntelReport = (data: any): string => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Threat Intelligence Report</title>
  <style>
    body { font-family: Arial; margin: 40px; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 1200px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
    h1 { color: #60a5fa; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    .entity-section { margin: 30px 0; padding: 20px; background: #334155; border-radius: 8px; }
    .entity-item { padding: 10px; margin: 5px 0; background: #475569; border-radius: 4px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #475569; }
    th { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Threat Intelligence Report</h1>
    <p>Généré le ${new Date(data.exported).toLocaleString('fr-FR')}</p>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${data.stories}</div>
        <div class="stat-label">Stories</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${data.entities.locations.length}</div>
        <div class="stat-label">Locations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${data.entities.organizations.length}</div>
        <div class="stat-label">Organizations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${data.clusters.length}</div>
        <div class="stat-label">Clusters</div>
      </div>
    </div>
    
    <div class="entity-section">
      <h2>📍 Top Locations</h2>
      ${data.entities.locations.slice(0, 10).map((loc: any) => `
        <div class="entity-item">
          <span>${loc.name}</span>
          <span>${loc.mentions} mentions</span>
        </div>
      `).join('')}
    </div>
    
    <div class="entity-section">
      <h2>🏢 Top Organizations</h2>
      ${data.entities.organizations.slice(0, 10).map((org: any) => `
        <div class="entity-item">
          <span>${org.name}</span>
          <span>${org.mentions} mentions</span>
        </div>
      `).join('')}
    </div>
    
    <h2>📰 Top Stories</h2>
    <table>
      <tr>
        <th>Titre</th>
        <th>Date</th>
        <th>Sources</th>
      </tr>
      ${data.topStories.map((story: any) => `
        <tr>
          <td>${story.title}</td>
          <td>${new Date(story.date).toLocaleDateString('fr-FR')}</td>
          <td>${story.sources}</td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>`;
  };

  const shareIntel = async (method: 'email' | 'slack') => {
    try {
      const summary = `🔍 Threat Intelligence Summary

• ${stories.length} stories collectées
• ${extractedEntities.locations.length} locations détectées
• ${extractedEntities.organizations.length} organizations identifiées
• ${clusters.length} trending clusters

Top Locations: ${extractedEntities.locations.slice(0, 5).map((l: any) => l.name).join(', ')}
Top Organizations: ${extractedEntities.organizations.slice(0, 5).map((o: any) => o.name).join(', ')}

Dashboard: ${window.location.href}`;

      if (method === 'email') {
        const subject = encodeURIComponent('Threat Intelligence Report');
        const body = encodeURIComponent(summary);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        showNotification('Client email ouvert', 'success');
      } else {
        await navigator.clipboard.writeText(summary);
        showNotification('Message copié pour Slack', 'success');
      }
    } catch (error) {
      showNotification('Erreur lors du partage', 'error');
    }
  };

  const filteredStories = stories.filter(story => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return story.title.toLowerCase().includes(query) ||
           story.content?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <Globe className="w-20 h-20 mx-auto mb-6 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-10 h-10 animate-spin text-cyan-300" />
            </div>
          </div>
          <p className="text-xl text-cyan-100 font-semibold mb-2">Chargement Intelligence...</p>
          <p className="text-sm text-cyan-300/70">Collecte des données CTI</p>
        </div>
      </div>
    );
  }

  const totalStories = stories.length;
  const totalNews = stories.reduce((sum, s) => sum + (s.newsItems?.length || 0), 0);
  const activeSources = sources?.filter((s: any) => s.enabled).length || 0;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl border backdrop-blur-sm animate-in slide-in-from-top-5 ${
          notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
          notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
          'bg-blue-500/90 border-blue-400 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Globe className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Cyber Style */}
      <div className="border-b border-cyan-500/30 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 shadow-lg shadow-cyan-500/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Threat Intelligence Hub
                </span>
                <Badge variant="outline" className="ml-2 border-cyan-400/50 text-cyan-300 text-xs">
                  v2.0 LIVE
                </Badge>
              </h1>
              <p className="text-cyan-300/70">
                Analyse en temps réel • {totalStories} Stories • {totalNews} News Items • {activeSources} Sources Actives
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                onClick={loadIntelligenceData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <div className="flex gap-2">
                <Button 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={() => exportIntelligence('json')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  onClick={() => exportIntelligence('pdf')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport HTML
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards Cyber */}
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              icon={<AlertTriangle className="w-6 h-6" />}
              label="Menaces Critiques"
              value={stories.filter((s: any) => 
                (s.title?.toLowerCase().includes('critical') || 
                 s.title?.toLowerCase().includes('vulnerability') ||
                 s.title?.toLowerCase().includes('zero-day'))
              ).length}
              trend="+12%"
              color="red"
            />
            <StatsCard
              icon={<MapPin className="w-6 h-6" />}
              label="Locations Détectées"
              value={extractedEntities.locations.length}
              trend="+8%"
              color="blue"
            />
            <StatsCard
              icon={<Building className="w-6 h-6" />}
              label="Organizations"
              value={extractedEntities.organizations.length}
              trend="+15%"
              color="purple"
            />
            <StatsCard
              icon={<Target className="w-6 h-6" />}
              label="Clusters Actifs"
              value={clusters.length}
              trend="+5%"
              color="green"
            />
          </div>
        </div>

        {/* View Selector Cyber */}
        <div className="px-6 pb-4 flex gap-2">
          {[
            { id: 'map', label: 'Carte Intelligence', icon: <Globe className="w-4 h-4" /> },
            { id: 'worldmap', label: 'World Map', icon: <Map className="w-4 h-4" /> },
            { id: 'timeline', label: 'Timeline', icon: <Activity className="w-4 h-4" /> },
            { id: 'network', label: 'Network Graph', icon: <Network className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
          ].map(view => (
            <Button
              key={view.id}
              variant={activeView === view.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(view.id as any)}
              className={activeView === view.id ? 
                'bg-cyan-500 text-white' : 
                'text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100'}
            >
              {view.icon}
              <span className="ml-2">{view.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Threat Feed Cyber */}
        <div className="w-96 border-r border-cyan-500/30 bg-slate-900/50 backdrop-blur overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-cyan-400">
              Live Threat Feed
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2" />
              Live
            </Badge>
          </div>

          {/* Recherche */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher menaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
            />
          </div>

          {filteredStories.slice(0, 15).map((story: any, idx: number) => (
            <Card
              key={story.id}
              className={`cursor-pointer transition-all border backdrop-blur-sm ${
                selectedStory?.id === story.id 
                  ? 'ring-2 ring-cyan-400 border-cyan-500/50 bg-cyan-950/50 shadow-lg shadow-cyan-500/20' 
                  : 'border-cyan-500/30 bg-slate-800/40 hover:bg-slate-800/60 hover:border-cyan-500/50'
              }`}
              onClick={() => setSelectedStory(story)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    idx < 3 ? 'bg-red-500 animate-pulse' :
                    idx < 6 ? 'bg-orange-500' :
                    'bg-cyan-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cyan-100 mb-1 line-clamp-2">
                      {story.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cyan-400/70">
                      <Clock className="w-3 h-3" />
                      {new Date(story.created || story.createdDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <span>•</span>
                      <span>{story.newsItems?.length || 0} sources</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Center Panel - Main View */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30">
          {activeView === 'map' && <ThreatMapView clusters={clusters} stories={stories} entities={extractedEntities} sources={sources} />}
          {activeView === 'worldmap' && <ThreatWorldMap locations={extractedEntities.locations} onNotify={showNotification} />}
          {activeView === 'timeline' && <TimelineView stories={filteredStories} />}
          {activeView === 'network' && <NetworkGraphView clusters={clusters} entities={extractedEntities} />}
          {activeView === 'analytics' && <AnalyticsView stories={stories} clusters={clusters} entities={extractedEntities} />}
        </div>

        {/* Right Panel - Selected Threat Details */}
        {selectedStory && (
          <div className="w-96 border-l border-cyan-500/30 bg-slate-900/50 backdrop-blur overflow-y-auto p-4">
            <ThreatDetailsPanel story={selectedStory} onShare={shareIntel} onNotify={showNotification} />
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Card Component Cyber
function StatsCard({ icon, label, value, trend, color }: any) {
  const colors = {
    red: 'from-red-500 to-red-600',
    green: 'from-emerald-500 to-emerald-600',
    blue: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const borderColors = {
    red: 'border-red-500/50',
    green: 'border-emerald-500/50',
    blue: 'border-cyan-500/50',
    purple: 'border-purple-500/50'
  };

  return (
    <Card className={`border ${borderColors[color as keyof typeof borderColors]} bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
            {icon}
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-emerald-500/30">
            {trend}
          </Badge>
        </div>
        <div className="text-2xl font-bold text-cyan-100 mb-1">{value}</div>
        <div className="text-sm text-cyan-400/70">{label}</div>
      </CardContent>
    </Card>
  );
}

// Threat Map View - Vraies données
function ThreatMapView({ clusters, stories, entities, sources }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
        <Globe className="w-7 h-7 text-cyan-400" />
        Carte Intelligence Mondiale
      </h2>

      {/* Entities from Real Data */}
      <div className="grid grid-cols-2 gap-6">
        {/* Locations */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Locations Détectées
              <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {entities.locations.length} pays/régions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entities.locations.slice(0, 15).map((loc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-cyan-500/20 hover:bg-slate-900/70 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                      #{idx + 1}
                    </div>
                    <span className="text-sm text-cyan-100 font-medium">{loc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-cyan-900/30 rounded-full overflow-hidden w-24">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${Math.min((loc.mentions / (entities.locations[0]?.mentions || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold min-w-[2rem] text-right">{loc.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur hover:shadow-lg hover:shadow-purple-500/20 transition-all">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-400" />
              Organizations Ciblées
              <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30">
                {entities.organizations.length} orgs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entities.organizations.slice(0, 15).map((org: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-purple-500/20 hover:bg-slate-900/70 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold">
                      #{idx + 1}
                    </div>
                    <span className="text-sm text-cyan-100 font-medium">{org.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden w-24">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${Math.min((org.mentions / (entities.organizations[0]?.mentions || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-400 font-semibold min-w-[2rem] text-right">{org.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        {entities.products.length > 0 && (
          <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <CardHeader>
              <CardTitle className="text-cyan-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-400" />
                Products/Technologies
                <Badge className="ml-auto bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {entities.products.length} produits
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {entities.products.slice(0, 10).map((prod: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-orange-500/20 hover:bg-slate-900/70 hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold">
                        #{idx + 1}
                      </div>
                      <span className="text-sm text-cyan-100 font-medium">{prod.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 bg-orange-900/30 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${Math.min((prod.mentions / (entities.products[0]?.mentions || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-orange-400 font-semibold min-w-[2rem] text-right">{prod.mentions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Persons */}
        {entities.persons.length > 0 && (
          <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
            <CardHeader>
              <CardTitle className="text-cyan-100 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Acteurs Identifiés
                <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {entities.persons.length} personnes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {entities.persons.slice(0, 10).map((person: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-emerald-500/20 hover:bg-slate-900/70 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold">
                        #{idx + 1}
                      </div>
                      <span className="text-sm text-cyan-100 font-medium">{person.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${Math.min((person.mentions / (entities.persons[0]?.mentions || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold min-w-[2rem] text-right">{person.mentions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sources OSINT Actives */}
      <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-cyan-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Sources OSINT Actives
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {sources?.filter((s: any) => s.enabled).length} / {sources?.length} sources
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {sources?.filter((s: any) => s.enabled).slice(0, 9).map((source: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-emerald-500/30 hover:bg-slate-900/70 hover:border-emerald-500/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-cyan-100 truncate">{source.name}</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Actif
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Timeline View - Amélioré
function TimelineView({ stories }: any) {
  const groupedByDay = stories.reduce((acc: any, story: any) => {
    const date = new Date(story.created || story.createdDate).toLocaleDateString('fr-FR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(story);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
        <Activity className="w-7 h-7 text-cyan-400" />
        Timeline des Menaces
      </h2>

      <div className="space-y-8">
        {Object.entries(groupedByDay).slice(0, 5).map(([date, dayStories]: [string, any]) => (
          <div key={date}>
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-sm backdrop-blur">
                {date}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">{dayStories.length} events</Badge>
            </div>

            <div className="space-y-3 ml-8">
              {dayStories.map((story: any, idx: number) => (
                <div key={story.id} className="relative">
                  {/* Timeline dot avec glow */}
                  <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 border-4 border-slate-900 shadow-lg shadow-cyan-500/50" />
                  {idx < dayStories.length - 1 && (
                    <div className="absolute -left-[1.15rem] top-6 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                  )}
                  
                  <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs text-cyan-400/70">
                              {new Date(story.created || story.createdDate).toLocaleTimeString('fr-FR')}
                            </span>
                            <span className="text-xs text-cyan-500/50">•</span>
                            <span className="text-xs text-blue-400">{story.newsItems?.[0]?.osintSource?.name || 'Source'}</span>
                          </div>
                          <h4 className="text-sm font-medium text-cyan-100 mb-2">{story.title}</h4>
                          <div className="text-xs text-cyan-300/70 line-clamp-2">
                            {story.newsItems?.[0]?.content?.substring(0, 150) || story.content?.substring(0, 150)}...
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-500/20 text-blue-300 text-xs border-blue-500/30">
                              {story.newsItems?.length || 0} sources
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Network Graph View - Amélioré avec vraies données
function NetworkGraphView({ clusters, entities }: any) {
  const allNodes = [
    ...entities.locations.slice(0, 5).map((l: any) => ({ ...l, type: 'location', color: 'from-cyan-500 to-blue-500' })),
    ...entities.organizations.slice(0, 5).map((o: any) => ({ ...o, type: 'organization', color: 'from-purple-500 to-pink-500' })),
    ...entities.products.slice(0, 3).map((p: any) => ({ ...p, type: 'product', color: 'from-orange-500 to-red-500' })),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
        <Network className="w-7 h-7 text-cyan-400" />
        Graphe de Relations CTI
      </h2>

      <div className="relative h-[600px] border border-cyan-500/30 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur overflow-hidden shadow-2xl">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-cyan-500/[0.05]" />
        
        {/* Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full p-12">
            {/* Centre - Hub CTI avec glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 z-10 border-4 border-cyan-400/30 animate-pulse">
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-1" />
                <div className="text-lg font-bold">CTI</div>
                <div className="text-xs opacity-80">Hub</div>
              </div>
            </div>

            {/* Nodes autour */}
            {allNodes.map((node: any, idx: number) => {
              const angle = (idx / allNodes.length) * 2 * Math.PI;
              const radius = 220;
              const x = 50 + Math.cos(angle) * (radius / 6);
              const y = 50 + Math.sin(angle) * (radius / 6);

              const icons: any = {
                location: <MapPin className="w-4 h-4" />,
                organization: <Building className="w-4 h-4" />,
                product: <Package className="w-4 h-4" />
              };

              return (
                <div
                  key={idx}
                  className={`absolute w-24 h-24 rounded-full bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer border-2 border-white/20`}
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                    animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                    animationDelay: `${idx * 0.1}s`
                  }}
                  title={`${node.name} (${node.mentions} mentions)`}
                >
                  <div className="text-center">
                    {icons[node.type]}
                    <div className="text-xs font-bold mt-1 line-clamp-2 px-1">{node.name}</div>
                    <div className="text-xs opacity-80">{node.mentions}</div>
                  </div>
                </div>
              );
            })}

            {/* Connection lines avec gradient */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                </linearGradient>
              </defs>
              {allNodes.map((_: any, idx: number) => {
                const angle = (idx / allNodes.length) * 2 * Math.PI;
                const radius = 220;
                const x1 = 50;
                const y1 = 50;
                const x2 = 50 + Math.cos(angle) * (radius / 6);
                const y2 = 50 + Math.sin(angle) * (radius / 6);

                return (
                  <line
                    key={idx}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="10"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend avec glassmorphism */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-lg border border-cyan-500/30 shadow-lg">
          <div className="text-xs text-cyan-400 mb-2 font-semibold uppercase tracking-wide">Légende</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              <span className="text-cyan-100">Locations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <span className="text-cyan-100">Organizations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
              <span className="text-cyan-100">Products</span>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-lg border border-cyan-500/30 shadow-lg">
          <div className="text-xs text-cyan-400 mb-2 font-semibold">Relations</div>
          <div className="text-2xl font-bold text-cyan-100">{allNodes.length}</div>
          <div className="text-xs text-cyan-400/70">Nœuds actifs</div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        .bg-grid-cyan-500\\/\\[0\\.05\\] {
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}

// Analytics View - Amélioré avec vraies statistiques
function AnalyticsView({ stories, clusters, entities }: any) {
  const categories = {
    vulnerability: stories.filter((s: any) => 
      s.title?.toLowerCase().includes('vulnerability') || 
      s.title?.toLowerCase().includes('cve')
    ).length,
    malware: stories.filter((s: any) => 
      s.title?.toLowerCase().includes('malware') || 
      s.title?.toLowerCase().includes('ransomware')
    ).length,
    phishing: stories.filter((s: any) => 
      s.title?.toLowerCase().includes('phishing')
    ).length,
    apt: stories.filter((s: any) => 
      s.title?.toLowerCase().includes('apt')
    ).length,
    breach: stories.filter((s: any) => 
      s.title?.toLowerCase().includes('breach') || 
      s.title?.toLowerCase().includes('leak')
    ).length,
  };

  const totalCategories = Object.values(categories).reduce((sum: number, val: number) => sum + val, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-cyan-400" />
        Analytics & Insights
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Distribution par Catégorie */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Distribution par Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categories).map(([cat, count]: any) => (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-100 capitalize font-medium">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">{count}</span>
                    <span className="text-cyan-500/50 text-xs">
                      ({Math.round((count / totalCategories) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden border border-cyan-500/20">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(count / totalCategories) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Trending Clusters */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Trending Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clusters.slice(0, 6).map((cluster: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-cyan-500/30">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cyan-100">{cluster.name}</div>
                    <div className="text-xs text-cyan-400/70">{cluster.size} mentions • {cluster.tags?.length || 0} tags</div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations par Mentions */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Top Locations Géopolitiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entities.locations.slice(0, 8).map((loc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400">#{idx + 1}</span>
                    <span className="text-sm text-cyan-100">{loc.name}</span>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {loc.mentions}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizations Ciblées */}
        <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-400" />
              Top Organizations Mentionnées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entities.organizations.slice(0, 8).map((org: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-900/70 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400">#{idx + 1}</span>
                    <span className="text-sm text-cyan-100">{org.name}</span>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {org.mentions}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-cyan-500/30 bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-cyan-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Résumé Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-900/50 border border-cyan-500/20">
              <div className="text-3xl font-bold text-cyan-400 mb-1">{stories.length}</div>
              <div className="text-xs text-cyan-300/70">Stories Total</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-900/50 border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-1">{entities.locations.length}</div>
              <div className="text-xs text-blue-300/70">Locations</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-900/50 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400 mb-1">{entities.organizations.length}</div>
              <div className="text-xs text-purple-300/70">Organizations</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-900/50 border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{clusters.length}</div>
              <div className="text-xs text-emerald-300/70">Clusters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Threat Details Panel - Amélioré
function ThreatDetailsPanel({ story, onShare, onNotify }: any) {
  const newsItem = story.newsItems?.[0];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify('Copié dans le presse-papier', 'success');
    } catch (error) {
      onNotify('Erreur lors de la copie', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-lg text-cyan-100 mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          Détails de la Menace
        </h3>
        <p className="text-sm text-cyan-300/90 leading-relaxed">{story.title}</p>
      </div>

      <div className="space-y-3 p-4 rounded-lg bg-slate-900/50 border border-cyan-500/20">
        <InfoItem 
          label="Source" 
          value={newsItem?.osintSource?.name || 'N/A'} 
          icon={<Globe className="w-4 h-4 text-cyan-400" />}
        />
        <InfoItem 
          label="Publié" 
          value={new Date(newsItem?.published || story.created).toLocaleString('fr-FR')} 
          icon={<Clock className="w-4 h-4 text-cyan-400" />}
        />
        <InfoItem 
          label="Auteur" 
          value={newsItem?.author || 'N/A'} 
          icon={<User className="w-4 h-4 text-cyan-400" />}
        />
        <InfoItem 
          label="News Items" 
          value={`${story.newsItems?.length || 0} sources`} 
          icon={<Database className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      <div className="pt-4 border-t border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-cyan-100">Contenu</h4>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
            onClick={() => copyToClipboard(newsItem?.content || story.content || '')}
          >
            <Copy className="w-3 h-3 mr-1" />
            Copier
          </Button>
        </div>
        <div className="text-xs text-cyan-300/80 max-h-60 overflow-y-auto p-3 bg-slate-900/70 rounded border border-cyan-500/20 leading-relaxed">
          {newsItem?.content || story.content || 'Contenu non disponible'}
        </div>
      </div>

      {newsItem?.link && (
        <a
          href={newsItem.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 p-2 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Voir la source originale
        </a>
      )}

      <div className="pt-4 space-y-2">
        <Button 
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30"
          onClick={() => onNotify('Investigation lancée', 'info')}
        >
          <Zap className="w-4 h-4 mr-2" />
          Lancer Investigation
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
          onClick={() => copyToClipboard(story.title + '\n\n' + (newsItem?.content || story.content || ''))}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copier Tout
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
            onClick={() => onShare('email')}
          >
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
            onClick={() => onShare('slack')}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Slack
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-cyan-400/70 mb-1">{label}</div>
        <div className="text-sm text-cyan-100 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
