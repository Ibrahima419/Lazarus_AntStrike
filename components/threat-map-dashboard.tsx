import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { 
  MapPin, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Globe,
  Filter,
  Download,
  RefreshCw,
  Search,
  Eye,
  Activity,
  Zap,
  Maximize,
  Minimize,
  X
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import du service de géolocalisation des menaces
import { loadGeolocatedThreats, type ThreatLocation } from './cti/services/threat-geo-service';

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Composant pour recentrer la carte automatiquement
function MapCenterController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Fonction pour obtenir la couleur selon la sévérité
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#f59e0b';
    case 'low': return '#84cc16';
    default: return '#6b7280';
  }
};

// Fonction pour formater le temps relatif
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${Math.floor(diffHours / 24)} jours`;
};

export function ThreatMapDashboard() {
  const [threatLocations, setThreatLocations] = useState<ThreatLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Charger les données depuis Taranis
  const loadThreatData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const threats = await loadGeolocatedThreats(200);
      setThreatLocations(threats);
    } catch (err) {
      console.error('Erreur chargement menaces:', err);
      setError('Impossible de charger les menaces depuis Taranis AI');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger au montage et en auto-refresh
  useEffect(() => {
    loadThreatData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadThreatData();
    }, 30000); // 30 secondes
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filtrer les menaces
  const filteredThreats = useMemo(() => {
    return threatLocations.filter(threat => {
      const severityMatch = selectedSeverity === 'all' || threat.severity === selectedSeverity;
      const statusMatch = selectedStatus === 'all' || threat.status === selectedStatus;
      const searchMatch = searchTerm === '' || 
        threat.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.threat_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      return severityMatch && statusMatch && searchMatch;
    });
  }, [threatLocations, selectedSeverity, selectedStatus, searchTerm]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = filteredThreats.length;
    const critical = filteredThreats.filter(t => t.severity === 'critical').length;
    const active = filteredThreats.filter(t => t.status === 'active').length;
    const totalIOCs = filteredThreats.reduce((sum, t) => sum + t.iocs, 0);
    const totalThreats = filteredThreats.reduce((sum, t) => sum + t.threat_count, 0);
    
    return { total, critical, active, totalIOCs, totalThreats };
  }, [filteredThreats]);

  // Fonction pour zoomer sur une menace
  const focusOnThreat = (threat: ThreatLocation) => {
    setMapCenter([threat.lat, threat.lng]);
    setMapZoom(8);
  };

  // Fonctions pour le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Gestion des événements clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher le scroll du body en plein écran
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Composant de carte en mode plein écran
  const FullscreenMap = () => (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header plein écran */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h1 className="text-2xl font-bold">Carte Mondiale des Menaces</h1>
          <p className="text-sm text-muted-foreground">
            Mode plein écran • {filteredThreats.length} menace(s) géolocalisée(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
            Auto-Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exitFullscreen}
            title="Quitter le plein écran (Escape)"
          >
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </div>

      {/* Carte plein écran */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapCenterController center={mapCenter} zoom={mapZoom} />
            
            {/* Fond de carte */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marqueurs de menaces */}
            {filteredThreats.map((threat) => (
              <CircleMarker
                key={threat.id}
                center={[threat.lat, threat.lng]}
                radius={Math.min(8 + (threat.threat_count / 100), 25)}
                fillColor={getSeverityColor(threat.severity)}
                color="#fff"
                weight={2}
                opacity={0.9}
                fillOpacity={0.7}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-2 p-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{threat.city}</h3>
                      <Badge 
                        variant={threat.severity === 'critical' ? 'destructive' : 'default'}
                        className="ml-2"
                      >
                        {threat.severity}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Pays:</strong> {threat.country}</p>
                      <p><strong>Type:</strong> {threat.threat_type}</p>
                      <p><strong>Menaces:</strong> {threat.threat_count}</p>
                      <p><strong>IOCs:</strong> {threat.iocs}</p>
                      <p><strong>Statut:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {threat.status}
                        </Badge>
                      </p>
                      <p><strong>Dernière détection:</strong> {getRelativeTime(threat.last_detected)}</p>
                    </div>

                    {threat.campaigns.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">Campagnes:</p>
                        <div className="flex flex-wrap gap-1">
                          {threat.campaigns.map((campaign, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {campaign}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {threat.target_sectors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">Secteurs ciblés:</p>
                        <div className="flex flex-wrap gap-1">
                          {threat.target_sectors.map((sector, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Légende plein écran */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Élevée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moyenne</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Faible</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Appuyez sur <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> pour quitter
        </p>
      </div>
    </div>
  );

  // Si en mode plein écran, afficher le composant plein écran
  if (isFullscreen) {
    return <FullscreenMap />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Carte Mondiale des Menaces</h1>
          <p className="text-muted-foreground">
            Géolocalisation en temps réel des cybermenaces actives • Powered by Taranis AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={autoRefresh ? "default" : "outline"} 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
            Auto-Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Agrandir la carte"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
            {isFullscreen ? "Réduire" : "Plein écran"}
          </Button>
        </div>
      </div>

      {/* Affichage erreur */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menaces Actives</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.total} localisations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IOCs Détectés</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIOCs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Indicateurs de compromission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Totaux</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThreats.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Détections cumulées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Couverture</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              Pays surveillés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher ville, pays, type..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sévérités</SelectItem>
                <SelectItem value="critical">🔴 Critique</SelectItem>
                <SelectItem value="high">🟠 Élevée</SelectItem>
                <SelectItem value="medium">🟡 Moyenne</SelectItem>
                <SelectItem value="low">🟢 Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">En investigation</SelectItem>
                <SelectItem value="mitigated">Mitigée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Carte + Liste des menaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte interactive */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Carte Interactive
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement depuis Taranis AI...' : `${filteredThreats.length} menace(s) géolocalisée(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '600px', width: '100%' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <MapCenterController center={mapCenter} zoom={mapZoom} />
                  
                  {/* Fond de carte */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Marqueurs de menaces */}
                  {filteredThreats.map((threat) => (
                    <CircleMarker
                      key={threat.id}
                      center={[threat.lat, threat.lng]}
                      radius={Math.min(8 + (threat.threat_count / 100), 25)}
                      fillColor={getSeverityColor(threat.severity)}
                      color="#fff"
                      weight={2}
                      opacity={0.9}
                      fillOpacity={0.7}
                    >
                      <Popup maxWidth={300}>
                        <div className="space-y-2 p-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{threat.city}</h3>
                            <Badge 
                              variant={threat.severity === 'critical' ? 'destructive' : 'default'}
                              className="ml-2"
                            >
                              {threat.severity}
                            </Badge>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p><strong>Pays:</strong> {threat.country}</p>
                            <p><strong>Type:</strong> {threat.threat_type}</p>
                            <p><strong>Menaces:</strong> {threat.threat_count}</p>
                            <p><strong>IOCs:</strong> {threat.iocs}</p>
                            <p><strong>Statut:</strong> 
                              <Badge variant="outline" className="ml-2">
                                {threat.status}
                              </Badge>
                            </p>
                            <p><strong>Dernière détection:</strong> {getRelativeTime(threat.last_detected)}</p>
                          </div>

                          {threat.campaigns.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold">Campagnes:</p>
                              <div className="flex flex-wrap gap-1">
                                {threat.campaigns.map((campaign, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {campaign}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {threat.target_sectors.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold">Secteurs ciblés:</p>
                              <div className="flex flex-wrap gap-1">
                                {threat.target_sectors.map((sector, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {sector}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des menaces */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Menaces Détaillées
            </CardTitle>
            <CardDescription>
              Cliquez pour localiser sur la carte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredThreats
              .sort((a, b) => b.threat_count - a.threat_count)
              .map((threat) => (
                <div
                  key={threat.id}
                  className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => focusOnThreat(threat)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{threat.city}</h4>
                      <p className="text-xs text-muted-foreground">{threat.country}</p>
                    </div>
                    <Badge 
                      variant={threat.severity === 'critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {threat.severity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{threat.threat_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Menaces:</span>
                      <span className="font-bold" style={{ color: getSeverityColor(threat.severity) }}>
                        {threat.threat_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IOCs:</span>
                      <span>{threat.iocs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {threat.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(threat.last_detected)}
                    </p>
                  </div>
                </div>
              ))}
              
            {filteredThreats.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune menace trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Légende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getSeverityColor('critical') }}></div>
              <span className="text-sm">Critique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getSeverityColor('high') }}></div>
              <span className="text-sm">Élevée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getSeverityColor('medium') }}></div>
              <span className="text-sm">Moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getSeverityColor('low') }}></div>
              <span className="text-sm">Faible</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            💡 La taille des cercles représente le nombre de menaces détectées. Données extraites en temps réel depuis Taranis AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
