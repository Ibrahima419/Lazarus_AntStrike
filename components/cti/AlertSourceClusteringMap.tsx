/**
 * 🗺️ Alert Source Clustering Map - Vue Intelligence des Sources
 * Combinaison Leaflet + D3.js + Mapbox pour visualisation épique
 * 
 * Features:
 * - Galaxy View (D3.js force simulation)
 * - Geographic View (Leaflet + Mapbox)
 * - Network Graph (D3.js hierarchy)
 * - Heatmap View (D3.js heatmap)
 * - Real-time updates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Globe, Network, BarChart3, Zap, Settings, Filter, 
  Activity, TrendingUp, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';
import { findGeoLocation, extractLocationsFromText, COUNTRIES_GEO } from './utils/geolocations-db';

// Import des vues spécialisées
import { GalaxyView } from './map-views/GalaxyView';
import { GeographicView } from './map-views/GeographicView';
import { NetworkGraphView } from './map-views/NetworkGraphView';
import { HeatmapView } from './map-views/HeatmapView';
import { SourcePerformancePanel } from './map-views/SourcePerformancePanel';
import { AdvancedStatsPanel } from './map-views/AdvancedStatsPanel';
import type { SourceNode, SourceCluster } from './map-views/map-types';

interface MapStats {
  totalSources: number;
  activeSources: number;
  totalAlerts: number;
  avgTrustScore: number;
  clustersDetected: number;
  coverageScore: number;
}

export function AlertSourceClusteringMap() {
  const [activeView, setActiveView] = useState<'galaxy' | 'geographic' | 'network' | 'heatmap'>('galaxy');
  const [sources, setSources] = useState<SourceNode[]>([]);
  const [clusters, setClusters] = useState<SourceCluster[]>([]);
  const [stats, setStats] = useState<MapStats>({
    totalSources: 0,
    activeSources: 0,
    totalAlerts: 0,
    avgTrustScore: 0,
    clustersDetected: 0,
    coverageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<SourceNode | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const service = getTaranisService();

  useEffect(() => {
    loadMapData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMapData, 30000); // Refresh toutes les 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMapData = async () => {
    try {
      setIsLoading(true);

      // Charger les données depuis Taranis
      const [osintSources, osintSourceGroups, newsItems] = await Promise.all([
        service.getOSINTSources(),
        service.getOSINTSourceGroups(),
        service.getNewsItems(100)
      ]);

      // Transformer en SourceNodes avec géolocalisation asynchrone
      const sourceNodesPromises = osintSources.map(async (source) => {
        // Calculer le trust score basé sur les métriques
        const trustScore = calculateTrustScore(source, newsItems);
        
        // Compter les alertes par source
        const alertCount = newsItems.filter(
          item => item.osintSourceId === source.id
        ).length;

        // Assigner des coordonnées géographiques via le service de géolocalisation
        const coordinates = await assignCoordinates(source);

        // Couleur basée sur le type
        const color = getSourceColor(source.type);

        return {
          id: source.id,
          name: source.name,
          type: source.type,
          url: source.url,
          enabled: source.enabled,
          alertCount,
          trustScore,
          lastCollected: new Date(source.lastCollected),
          status: source.status,
          coordinates,
          color
        };
      });

      // Attendre que toutes les géolocalisations soient terminées
      const sourceNodes = await Promise.all(sourceNodesPromises);

      setSources(sourceNodes);

      // Créer les clusters intelligents
      const detectedClusters = clusterSources(sourceNodes, osintSourceGroups);
      setClusters(detectedClusters);

      // Calculer les stats globales
      const calculatedStats: MapStats = {
        totalSources: sourceNodes.length,
        activeSources: sourceNodes.filter(s => s.status === 'active').length,
        totalAlerts: newsItems.length,
        avgTrustScore: Math.round(
          sourceNodes.reduce((sum, s) => sum + s.trustScore, 0) / sourceNodes.length
        ),
        clustersDetected: detectedClusters.length,
        coverageScore: calculateCoverageScore(sourceNodes)
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer le trust score d'une source (méthode SOC professionnelle)
  const calculateTrustScore = (source: any, newsItems: any[]): number => {
    const sourceItems = newsItems.filter(item => item.osintSourceId === source.id);
    
    if (sourceItems.length === 0) return 45; // Score par défaut

    // ===== FACTEURS DE SCORING PROFESSIONNEL =====
    
    // 1. Volume et Activité (0-25 points)
    const volumeScore = Math.min((sourceItems.length / 20) * 25, 25);
    
    // 2. Récence des données (0-20 points)
    const lastCollected = new Date(source.lastCollected);
    const hoursSinceCollection = (Date.now() - lastCollected.getTime()) / (1000 * 60 * 60);
    let recencyScore = 20;
    if (hoursSinceCollection > 168) recencyScore = 5;  // >1 semaine
    else if (hoursSinceCollection > 48) recencyScore = 10; // >2 jours
    else if (hoursSinceCollection > 24) recencyScore = 15; // >1 jour
    else recencyScore = 20; // <24h
    
    // 3. Fiabilité du type de source (0-25 points)
    const typeReliabilityScores: Record<string, number> = {
      'API': 25,        // APIs officielles (MISP, VirusTotal, etc.)
      'RSS': 20,        // Feeds RSS vérifiés
      'TWITTER': 15,    // Social media (moins fiable)
      'WEB': 18,        // Web scraping
      'EMAIL': 20,      // Alertes email
      'manual': 10,     // Entrées manuelles
      'THREAT_INTEL': 25 // Threat Intel feeds
    };
    const typeScore = typeReliabilityScores[source.type] || 15;
    
    // 4. Taux de qualité des items (0-15 points)
    const itemsWithContent = sourceItems.filter(item => 
      item.content && item.content.length > 100
    ).length;
    const qualityRatio = sourceItems.length > 0 ? itemsWithContent / sourceItems.length : 0;
    const qualityScore = qualityRatio * 15;
    
    // 5. Disponibilité (0-15 points)
    const availabilityScore = source.enabled ? 15 : 5;
    
    // Score total (0-100)
    const totalScore = Math.round(
      volumeScore + recencyScore + typeScore + qualityScore + availabilityScore
    );
    
    return Math.max(0, Math.min(100, totalScore)); // Clamp 0-100
  };

  const getTypeScore = (type: string): number => {
    const scores: Record<string, number> = {
      'API': 30,
      'RSS': 25,
      'THREAT_INTEL': 30,
      'WEB': 20,
      'TWITTER': 18,
      'EMAIL': 25,
      'manual': 10
    };
    return scores[type] || 15;
  };

  // Assigner des coordonnées géographiques RÉELLES via le service de géolocalisation
  const assignCoordinates = async (source: any): Promise<[number, number]> => {
    try {
      // Utiliser le service de géolocalisation avancé
      const { getGeoLocationService } = await import('./services/geolocation-service');
      const geoService = getGeoLocationService();
      
      // Extraire l'IP depuis l'URL si possible
      const ip = extractIPFromURL(source.url);
      
      if (ip) {
        // Enrichir avec l'IP
        const result = await geoService.enrichIP(ip);
        if (result.location) {
          // Ajouter légère variance pour éviter superposition
          const variance = () => (Math.random() - 0.5) * 2;
          return [
            result.location.longitude + variance(),
            result.location.latitude + variance()
          ];
        }
      }
      
      // Fallback: utiliser les données TLD et mots-clés
      return await getFallbackCoordinates(source);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'assignation des coordonnées:', error);
      // Fallback vers les coordonnées par défaut
      return getDefaultCoordinates(source);
    }
  };

  // Extraire l'IP depuis une URL
  const extractIPFromURL = (url: string): string | null => {
    if (!url) return null;
    
    // Regex pour détecter les IPs dans les URLs
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    const match = url.match(ipRegex);
    return match ? match[0] : null;
  };

  // Fallback avec données TLD et mots-clés
  const getFallbackCoordinates = async (source: any): Promise<[number, number]> => {
    if (source.url) {
      const urlLower = source.url.toLowerCase();
      
      // Détecter le domaine country code (.fr, .uk, .de, etc.)
      const tldMatch = urlLower.match(/\.([a-z]{2})(?:\/|$)/);
      if (tldMatch) {
        const tld = tldMatch[1].toUpperCase();
        const countryCodesMap: Record<string, [number, number]> = {
          'FR': [2.3522, 48.8566],        // Paris, France
          'UK': [-0.1278, 51.5074],       // London, UK
          'DE': [13.4050, 52.5200],       // Berlin, Germany
          'ES': [-3.7038, 40.4168],       // Madrid, Spain
          'IT': [12.4964, 41.9028],       // Rome, Italy
          'NL': [4.9041, 52.3676],        // Amsterdam, Netherlands
          'BE': [4.3517, 50.8503],        // Brussels, Belgium
          'CH': [7.4474, 46.9481],        // Bern, Switzerland
          'AT': [16.3738, 48.2082],       // Vienna, Austria
          'SE': [18.0686, 59.3293],       // Stockholm, Sweden
          'NO': [10.7522, 59.9139],       // Oslo, Norway
          'DK': [12.5683, 55.6761],       // Copenhagen, Denmark
          'FI': [24.9384, 60.1699],       // Helsinki, Finland
          'PL': [21.0122, 52.2297],       // Warsaw, Poland
          'CZ': [14.4378, 50.0755],       // Prague, Czech Republic
          'RU': [37.6176, 55.7558],       // Moscow, Russia
          'UA': [30.5234, 50.4501],       // Kyiv, Ukraine
          'CN': [116.4074, 39.9042],      // Beijing, China
          'JP': [139.6917, 35.6895],      // Tokyo, Japan
          'KR': [126.9780, 37.5665],      // Seoul, South Korea
          'IN': [77.2090, 28.6139],       // New Delhi, India
          'AU': [151.2093, -33.8688],     // Sydney, Australia
          'NZ': [174.7633, -41.2865],     // Wellington, New Zealand
          'BR': [-43.1729, -22.9068],     // Rio de Janeiro, Brazil
          'MX': [-99.1332, 19.4326],      // Mexico City, Mexico
          'AR': [-58.3816, -34.6037],     // Buenos Aires, Argentina
          'CA': [-79.3832, 43.6532]       // Toronto, Canada
        };
        
        const coords = countryCodesMap[tld];
        if (coords) {
          // Ajouter légère variance pour éviter superposition
          const variance = () => (Math.random() - 0.5) * 2;
          return [coords[0] + variance(), coords[1] + variance()];
        }
      }
      
      // Détecter mots-clés de pays dans l'URL
      const keywordCountryMap: Record<string, [number, number]> = {
        'cisa': [-77.0369, 38.9072],      // Washington DC, USA
        'ncsc': [-0.1278, 51.5074],       // London, UK
        'anssi': [2.3522, 48.8566],       // Paris, France
        'cert-fr': [2.3522, 48.8566],     // Paris, France
        'bsi': [13.4050, 52.5200],        // Berlin, Germany
        'gov': [-77.0369, 38.9072],       // Washington DC, USA
        'mil': [-77.0369, 38.9072]        // Washington DC, USA
      };
      
      for (const [keyword, coords] of Object.entries(keywordCountryMap)) {
        if (urlLower.includes(keyword)) {
          const variance = () => (Math.random() - 0.5) * 2;
          return [coords[0] + variance(), coords[1] + variance()];
        }
      }
    }
    
    return getDefaultCoordinates(source);
  };

  // Coordonnées par défaut basées sur le type
  const getDefaultCoordinates = (source: any): [number, number] => {
    const defaultCoordsByType: Record<string, [number, number]> = {
      'RSS': [-74.0060, 40.7128],           // New York (média)
      'API': [-122.4194, 37.7749],          // San Francisco (tech)
      'WEB': [2.3522, 48.8566],             // Paris (web)
      'TWITTER': [-122.4194, 37.7749],      // San Francisco (social)
      'EMAIL': [-0.1278, 51.5074],          // London (business)
      'THREAT_INTEL': [-77.0369, 38.9072],  // Washington DC (gov)
      'manual': [0, 0]                      // Global
    };
    
    const base = defaultCoordsByType[source.type] || [0, 0];
    
    // Ajouter variance aléatoire significative pour distribution
    return [
      base[0] + (Math.random() - 0.5) * 10,
      base[1] + (Math.random() - 0.5) * 10
    ];
  };

  const getSourceColor = (type: string): string => {
    const colors: Record<string, string> = {
      'RSS': '#3b82f6',      // blue
      'API': '#10b981',      // green
      'WEB': '#f59e0b',      // orange
      'TWITTER': '#06b6d4',  // cyan
      'EMAIL': '#8b5cf6',    // purple
      'manual': '#6b7280'    // gray
    };
    return colors[type] || '#3b82f6';
  };

  const clusterSources = (sources: SourceNode[], groups: any[]): SourceCluster[] => {
    // Utiliser les groupes Taranis existants
    const clusters: SourceCluster[] = groups.map(group => {
      const groupSources = sources.filter(s => 
        group.sources?.some((gs: any) => gs.id === s.id)
      );

      const totalAlerts = groupSources.reduce((sum, s) => sum + s.alertCount, 0);
      const avgConfidence = groupSources.reduce((sum, s) => sum + s.trustScore, 0) / 
                           (groupSources.length || 1);

      return {
        id: group.id,
        name: group.name,
        type: determineClusterType(groupSources),
        sources: groupSources,
        alertCount: totalAlerts,
        confidence: Math.round(avgConfidence),
        lastUpdate: new Date()
      };
    });

    // Ajouter un cluster "uncategorized" pour sources sans groupe
    const uncategorized = sources.filter(s => 
      !groups.some(g => g.sources?.some((gs: any) => gs.id === s.id))
    );

    if (uncategorized.length > 0) {
      clusters.push({
        id: 'uncategorized',
        name: 'Uncategorized Sources',
        type: 'technical',
        sources: uncategorized,
        alertCount: uncategorized.reduce((sum, s) => sum + s.alertCount, 0),
        confidence: Math.round(uncategorized.reduce((sum, s) => sum + s.trustScore, 0) / uncategorized.length),
        lastUpdate: new Date()
      });
    }

    return clusters;
  };

  const determineClusterType = (sources: SourceNode[]): SourceCluster['type'] => {
    // Logique pour déterminer le type dominant
    const types = sources.map(s => s.type);
    const typeCount: Record<string, number> = {};
    
    types.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const dominantType = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Map vers nos catégories
    const mapping: Record<string, SourceCluster['type']> = {
      'RSS': 'news',
      'API': 'threat-intel',
      'WEB': 'news',
      'TWITTER': 'social',
      'EMAIL': 'technical',
      'manual': 'technical'
    };

    return mapping[dominantType] || 'technical';
  };

  const calculateCoverageScore = (sources: SourceNode[]): number => {
    // Score basé sur la diversité des types et nombre de sources actives
    const activeCount = sources.filter(s => s.status === 'active').length;
    const uniqueTypes = new Set(sources.map(s => s.type)).size;
    
    const volumeScore = Math.min((activeCount / 50) * 50, 50); // Max 50
    const diversityScore = Math.min((uniqueTypes / 6) * 50, 50); // Max 50
    
    return Math.round(volumeScore + diversityScore);
  };

  const handleRefresh = () => {
    loadMapData();
  };

  const handleGeoEnrichment = async () => {
    try {
      setIsLoading(true);
      console.log('🌍 Déclenchement de l\'enrichissement géographique...');
      
      // Extraire toutes les IPs des sources
      const ips: string[] = [];
      sources.forEach(source => {
        const ip = extractIPFromURL(source.url);
        if (ip) {
          ips.push(ip);
        }
      });

      if (ips.length === 0) {
        console.log('⚠️ Aucune IP trouvée dans les sources pour l\'enrichissement');
        return;
      }

      // Utiliser le service de géolocalisation
      const { getGeoLocationService } = await import('./services/geolocation-service');
      const geoService = getGeoLocationService();
      
      const results = await geoService.enrichIPs(ips);
      const enrichedCount = results.filter(r => r.enriched).length;
      
      console.log(`✅ Enrichissement terminé: ${enrichedCount}/${results.length} IPs enrichies`);
      
      // Recharger les données de la carte
      await loadMapData();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enrichissement géographique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = (source: SourceNode | null) => {
    setSelectedSource(source);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Source Intelligence Map
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time OSINT source clustering and performance analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3 animate-pulse" />
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Disable' : 'Enable'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGeoEnrichment}
            disabled={isLoading}
          >
            <Globe className={`w-4 h-4 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
            Enrich Geo
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards - Advanced Metrics Style CrowdStrike */}
      <AdvancedStatsPanel 
        sources={sources}
        alerts={stats.totalAlerts}
      />

      {/* Main Map Area avec Tabs */}
      <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="galaxy" className="gap-2">
            <Network className="w-4 h-4" />
            Galaxy View
          </TabsTrigger>
          <TabsTrigger value="geographic" className="gap-2">
            <Globe className="w-4 h-4" />
            Geographic
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Activity className="w-4 h-4" />
            Network Graph
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Heatmap
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main visualization area (3/4) */}
          <div className="lg:col-span-3">
            <TabsContent value="galaxy" className="mt-0">
              <GalaxyView 
                sources={sources}
                clusters={clusters}
                onSourceSelect={handleSourceSelect}
                selectedSource={selectedSource}
              />
            </TabsContent>

            <TabsContent value="geographic" className="mt-0">
              <GeographicView 
                sources={sources}
                clusters={clusters}
                onSourceSelect={handleSourceSelect}
                selectedSource={selectedSource}
              />
            </TabsContent>

            <TabsContent value="network" className="mt-0">
              <NetworkGraphView 
                sources={sources}
                clusters={clusters}
                onSourceSelect={handleSourceSelect}
                selectedSource={selectedSource}
              />
            </TabsContent>

            <TabsContent value="heatmap" className="mt-0">
              <HeatmapView 
                sources={sources}
                clusters={clusters}
                onSourceSelect={handleSourceSelect}
                selectedSource={selectedSource}
              />
            </TabsContent>
          </div>

          {/* Side panel (1/4) */}
          <div className="lg:col-span-1">
            <SourcePerformancePanel 
              sources={sources}
              selectedSource={selectedSource}
              onSourceSelect={handleSourceSelect}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}

