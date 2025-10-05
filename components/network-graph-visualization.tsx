import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Network, 
  MapPin, 
  Server, 
  Globe, 
  Shield, 
  AlertTriangle,
  Zap,
  Eye,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

// Types pour le graphe réseau
interface NetworkNode {
  id: string;
  label: string;
  type: 'source' | 'destination' | 'intermediate' | 'malicious';
  country: string;
  ip: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  connections: number;
  x: number;
  y: number;
  size: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  traffic_volume: number;
  threat_score: number;
  protocol: string;
  status: 'active' | 'blocked' | 'monitored';
}

// Mock data pour le graphe réseau géolocalisé
const networkNodes: NetworkNode[] = [
  {
    id: 'node_1',
    label: 'Paris Data Center',
    type: 'source',
    country: 'France',
    ip: '192.168.1.100',
    threat_level: 'low',
    connections: 12,
    x: 300,
    y: 200,
    size: 30
  },
  {
    id: 'node_2',
    label: 'Moscow Server',
    type: 'malicious',
    country: 'Russia',
    ip: '185.220.101.42',
    threat_level: 'critical',
    connections: 8,
    x: 500,
    y: 150,
    size: 45
  },
  {
    id: 'node_3',
    label: 'Tokyo Hub',
    type: 'intermediate',
    country: 'Japan',
    ip: '203.0.113.45',
    threat_level: 'medium',
    connections: 15,
    x: 700,
    y: 180,
    size: 35
  },
  {
    id: 'node_4',
    label: 'New York Gateway',
    type: 'destination',
    country: 'USA',
    ip: '198.51.100.78',
    threat_level: 'high',
    connections: 20,
    x: 150,
    y: 300,
    size: 40
  },
  {
    id: 'node_5',
    label: 'Berlin Router',
    type: 'intermediate',
    country: 'Germany',
    ip: '192.0.2.156',
    threat_level: 'low',
    connections: 6,
    x: 350,
    y: 120,
    size: 25
  },
  {
    id: 'node_6',
    label: 'Beijing Node',
    type: 'malicious',
    country: 'China',
    ip: '203.0.113.200',
    threat_level: 'critical',
    connections: 18,
    x: 650,
    y: 250,
    size: 50
  }
];

const networkEdges: NetworkEdge[] = [
  {
    source: 'node_1',
    target: 'node_2',
    traffic_volume: 1250,
    threat_score: 8.5,
    protocol: 'HTTPS',
    status: 'monitored'
  },
  {
    source: 'node_2',
    target: 'node_3',
    traffic_volume: 850,
    threat_score: 9.2,
    protocol: 'TCP',
    status: 'blocked'
  },
  {
    source: 'node_4',
    target: 'node_1',
    traffic_volume: 2100,
    threat_score: 3.1,
    protocol: 'HTTPS',
    status: 'active'
  },
  {
    source: 'node_5',
    target: 'node_2',
    traffic_volume: 650,
    threat_score: 7.8,
    protocol: 'UDP',
    status: 'monitored'
  },
  {
    source: 'node_3',
    target: 'node_6',
    traffic_volume: 1890,
    threat_score: 9.7,
    protocol: 'IRC',
    status: 'blocked'
  },
  {
    source: 'node_6',
    target: 'node_4',
    traffic_volume: 3200,
    threat_score: 9.1,
    protocol: 'HTTP',
    status: 'active'
  }
];

// Données de géolocalisation des menaces
const geoLocationData = [
  {
    country: 'Russia',
    city: 'Moscow',
    lat: 55.7558,
    lng: 37.6176,
    threats: 23,
    severity: 'critical',
    campaigns: ['GhostShell', 'ShadowNet']
  },
  {
    country: 'China',
    city: 'Beijing',
    lat: 39.9042,
    lng: 116.4074,
    threats: 18,
    severity: 'critical',
    campaigns: ['DragonFly', 'RedEcho']
  },
  {
    country: 'USA',
    city: 'New York',
    lat: 40.7128,
    lng: -74.0060,
    threats: 12,
    severity: 'high',
    campaigns: ['ElectionStorm']
  },
  {
    country: 'France',
    city: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    threats: 8,
    severity: 'medium',
    campaigns: ['EuroThreat']
  },
  {
    country: 'Germany',
    city: 'Berlin',
    lat: 52.5200,
    lng: 13.4050,
    threats: 6,
    severity: 'medium',
    campaigns: ['NordStorm']
  },
  {
    country: 'Japan',
    city: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    threats: 15,
    severity: 'high',
    campaigns: ['PacificWave']
  }
];

export function NetworkGraphVisualization() {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'network' | 'geo'>('network');
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = (node: NetworkNode) => {
    switch (node.threat_level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (edge: NetworkEdge) => {
    switch (edge.status) {
      case 'blocked': return '#dc2626';
      case 'monitored': return '#ea580c';
      case 'active': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getEdgeWidth = (edge: NetworkEdge) => {
    return Math.max(1, (edge.traffic_volume / 1000) * 3);
  };

  const filteredNodes = networkNodes.filter(node => {
    if (filterType === 'all') return true;
    return node.type === filterType;
  });

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
  };

  const resetView = () => {
    setZoomLevel(1);
    setSelectedNode(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'network' | 'geo') => setViewMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Vue Réseau</SelectItem>
              <SelectItem value="geo">Vue Géographique</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les nœuds</SelectItem>
              <SelectItem value="source">Sources</SelectItem>
              <SelectItem value="destination">Destinations</SelectItem>
              <SelectItem value="malicious">Malveillants</SelectItem>
              <SelectItem value="intermediate">Intermédiaires</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network Graph */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {viewMode === 'network' ? <Network className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
              {viewMode === 'network' ? 'Graphe Réseau des Menaces' : 'Géolocalisation des Menaces'}
            </CardTitle>
            <CardDescription>
              {viewMode === 'network' 
                ? 'Visualisation des connexions et flux de trafic malveillant'
                : 'Distribution géographique des sources de menaces'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              {viewMode === 'network' ? (
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height="100%"
                  viewBox={`0 0 800 500`}
                  className="cursor-move"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Grid Background */}
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Edges */}
                  {networkEdges.map((edge, index) => {
                    const sourceNode = networkNodes.find(n => n.id === edge.source);
                    const targetNode = networkNodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    return (
                      <g key={index}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={getEdgeColor(edge)}
                          strokeWidth={getEdgeWidth(edge)}
                          strokeDasharray={edge.status === 'blocked' ? '5,5' : 'none'}
                          opacity={0.7}
                        />
                        {/* Traffic Flow Animation */}
                        <circle r="3" fill={getEdgeColor(edge)}>
                          <animateMotion
                            dur="3s"
                            repeatCount="indefinite"
                            path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
                          />
                        </circle>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {filteredNodes.map((node) => (
                    <g key={node.id} onClick={() => handleNodeClick(node)} className="cursor-pointer">
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size}
                        fill={getNodeColor(node)}
                        stroke="#ffffff"
                        strokeWidth="3"
                        opacity={selectedNode === node ? 1 : 0.8}
                        className="transition-all duration-200 hover:stroke-width-4"
                      />
                      <text
                        x={node.x}
                        y={node.y + node.size + 15}
                        textAnchor="middle"
                        className="fill-current text-xs font-medium"
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + node.size + 28}
                        textAnchor="middle"
                        className="fill-current text-xs text-muted-foreground"
                      >
                        {node.ip}
                      </text>
                    </g>
                  ))}
                </svg>
              ) : (
                /* Geographic View */
                <div className="relative w-full h-full bg-blue-50 dark:bg-blue-950 rounded-lg overflow-hidden">
                  {/* World Map Background (simplified) */}
                  <svg width="100%" height="100%" viewBox="0 0 800 500">
                    {/* Simplified world map paths */}
                    <path
                      d="M150,200 L250,150 L350,180 L450,160 L550,170 L650,150 L650,300 L550,320 L450,310 L350,330 L250,300 L150,280 Z"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  </svg>

                  {/* Threat Locations */}
                  {geoLocationData.map((location, index) => {
                    const x = (location.lng + 180) * (800 / 360);
                    const y = (90 - location.lat) * (500 / 180);
                    
                    return (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: x, top: y }}
                        onClick={() => console.log(`Clicked ${location.city}`)}
                      >
                        <div className={`
                          w-6 h-6 rounded-full border-2 border-white shadow-lg
                          ${location.severity === 'critical' ? 'bg-red-500' :
                            location.severity === 'high' ? 'bg-orange-500' :
                            location.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                        `}>
                          {/* Pulse animation for critical threats */}
                          {location.severity === 'critical' && (
                            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                          )}
                        </div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-white dark:bg-slate-800 px-2 py-1 rounded shadow">
                          {location.city}
                          <br />
                          <span className="text-muted-foreground">{location.threats} menaces</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                    {geoLocationData.slice(0, -1).map((location, index) => {
                      const nextLocation = geoLocationData[index + 1];
                      const x1 = (location.lng + 180) * (800 / 360);
                      const y1 = (90 - location.lat) * (500 / 180);
                      const x2 = (nextLocation.lng + 180) * (800 / 360);
                      const y2 = (90 - nextLocation.lat) * (500 / 180);

                      return (
                        <line
                          key={index}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.6"
                        />
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Détails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedNode.label}</h4>
                  <p className="text-sm text-muted-foreground">{selectedNode.country}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{selectedNode.type}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IP:</span>
                    <code className="text-xs">{selectedNode.ip}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connexions:</span>
                    <span>{selectedNode.connections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Niveau menace:</span>
                    <Badge variant={
                      selectedNode.threat_level === 'critical' ? 'destructive' :
                      selectedNode.threat_level === 'high' ? 'secondary' : 'default'
                    }>
                      {selectedNode.threat_level}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h5 className="font-medium text-sm mb-2">Connexions actives</h5>
                  <div className="space-y-1 text-xs">
                    {networkEdges
                      .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
                      .map((edge, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{edge.protocol}</span>
                          <Badge variant={edge.status === 'blocked' ? 'destructive' : 'default'} className="text-xs">
                            {edge.status}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Cliquez sur un nœud pour voir les détails</p>
              </div>
            )}

            {/* Legend */}
            <div className="pt-4 border-t">
              <h5 className="font-medium text-sm mb-3">Légende</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Critique</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Élevé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Moyen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Faible</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Nœuds Actifs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkNodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {networkNodes.filter(n => n.threat_level === 'critical').length} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Connexions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkEdges.length}</div>
            <p className="text-xs text-muted-foreground">
              {networkEdges.filter(e => e.status === 'blocked').length} bloquées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Trafic Total</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(networkEdges.reduce((acc, edge) => acc + edge.traffic_volume, 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Paquets/sec</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Score Moyen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(networkEdges.reduce((acc, edge) => acc + edge.threat_score, 0) / networkEdges.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Menace/10</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}