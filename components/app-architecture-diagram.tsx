import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Monitor, 
  Database, 
  Shield, 
  Brain, 
  Network, 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  Globe, 
  Target, 
  Server,
  ArrowRight,
  ArrowDown,
  Bug,
  Eye,
  AlertTriangle,
  BarChart3,
  Import,
  Download
} from 'lucide-react';

// Types pour les nœuds du diagramme
interface DiagramNode {
  id: string;
  label: string;
  type: 'entry' | 'core' | 'dashboard' | 'data' | 'external';
  icon: any;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  connections?: string[];
}

interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  type: 'data' | 'navigation' | 'process';
}

export function AppArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Définition des nœuds du diagramme
  const nodes: DiagramNode[] = [
    // Point d'entrée
    {
      id: 'landing',
      label: 'Landing Page',
      type: 'entry',
      icon: Monitor,
      description: 'Point d\'entrée avec présentation de la plateforme, statistiques et démonstration des capacités',
      x: 50,
      y: 50,
      width: 140,
      height: 80,
      color: '#3b82f6',
      connections: ['app-core']
    },

    // Core de l'application
    {
      id: 'app-core',
      label: 'App Core',
      type: 'core',
      icon: Bug,
      description: 'Cœur de l\'application AntStrike avec navigation et gestion d\'état',
      x: 300,
      y: 50,
      width: 160,
      height: 80,
      color: '#000000',
      connections: ['header', 'sidebar', 'dashboards']
    },

    // Interface utilisateur
    {
      id: 'header',
      label: 'Dashboard Header',
      type: 'core',
      icon: Monitor,
      description: 'En-tête avec navigation, notifications et profil utilisateur',
      x: 550,
      y: 20,
      width: 140,
      height: 60,
      color: '#6b7280'
    },

    {
      id: 'sidebar',
      label: 'Dashboard Sidebar',
      type: 'core',
      icon: Network,
      description: 'Navigation principale vers tous les modules de la plateforme',
      x: 550,
      y: 100,
      width: 140,
      height: 60,
      color: '#6b7280'
    },

    // Dashboards principaux
    {
      id: 'overview',
      label: 'Overview',
      type: 'dashboard',
      icon: BarChart3,
      description: 'Vue d\'ensemble avec métriques clés, alertes et statut général de sécurité',
      x: 50,
      y: 200,
      width: 120,
      height: 70,
      color: '#10b981'
    },

    {
      id: 'threats',
      label: 'Threats',
      type: 'dashboard',
      icon: AlertTriangle,
      description: 'Gestion des menaces avec filtrage avancé et analyse de risques',
      x: 200,
      y: 200,
      width: 120,
      height: 70,
      color: '#ef4444'
    },

    {
      id: 'threat-tracking',
      label: 'Threat Tracking',
      type: 'dashboard',
      icon: Target,
      description: 'Attribution chain, géolocalisation, impact mapping et kill chain MITRE ATT&CK',
      x: 350,
      y: 200,
      width: 120,
      height: 70,
      color: '#f59e0b'
    },

    {
      id: 'intelligence',
      label: 'Intelligence',
      type: 'dashboard',
      icon: Brain,
      description: 'Feeds MISP/TAXII/STIX, gestion des IOCs et corrélation intelligente',
      x: 500,
      y: 200,
      width: 120,
      height: 70,
      color: '#8b5cf6'
    },

    {
      id: 'incidents',
      label: 'Incidents',
      type: 'dashboard',
      icon: Shield,
      description: 'Workflow de réponse aux incidents avec SLA tracking et escalation',
      x: 650,
      y: 200,
      width: 120,
      height: 70,
      color: '#dc2626'
    },

    {
      id: 'entities',
      label: 'Entities',
      type: 'dashboard',
      icon: Users,
      description: 'Gestion des acteurs de menaces, malware et campagnes d\'attaque',
      x: 50,
      y: 300,
      width: 120,
      height: 70,
      color: '#0ea5e9'
    },

    {
      id: 'analysis',
      label: 'Analysis',
      type: 'dashboard',
      icon: Activity,
      description: 'Analyse avancée avec corrélation automatique et scoring IA',
      x: 200,
      y: 300,
      width: 120,
      height: 70,
      color: '#06b6d4'
    },

    {
      id: 'taranis',
      label: 'Taranis AI',
      type: 'dashboard',
      icon: Brain,
      description: 'Moteur OSINT avec bots d\'enrichissement et collecte automatisée',
      x: 350,
      y: 300,
      width: 120,
      height: 70,
      color: '#7c3aed'
    },

    {
      id: 'import-export',
      label: 'Import/Export',
      type: 'dashboard',
      icon: Import,
      description: 'Gestion des formats standards : STIX, MISP, OpenIOC, YARA',
      x: 500,
      y: 300,
      width: 120,
      height: 70,
      color: '#059669'
    },

    {
      id: 'reports',
      label: 'Reports',
      type: 'dashboard',
      icon: FileText,
      description: 'Business intelligence avec démonstration ROI de 340%',
      x: 650,
      y: 300,
      width: 120,
      height: 70,
      color: '#d97706'
    },

    {
      id: 'settings',
      label: 'Settings',
      type: 'dashboard',
      icon: Settings,
      description: 'Configuration système, utilisateurs et intégrations',
      x: 350,
      y: 400,
      width: 120,
      height: 70,
      color: '#6b7280'
    },

    // Couche de données
    {
      id: 'data-layer',
      label: 'Data Layer',
      type: 'data',
      icon: Database,
      description: 'Couche de données avec KV store et gestion des IOCs',
      x: 50,
      y: 500,
      width: 200,
      height: 60,
      color: '#1f2937'
    },

    // Intégrations externes
    {
      id: 'external-feeds',
      label: 'External Feeds',
      type: 'external',
      icon: Globe,
      description: 'MISP, TAXII, STIX, OpenIOC, YARA, feeds de threat intelligence',
      x: 350,
      y: 500,
      width: 200,
      height: 60,
      color: '#374151'
    },

    {
      id: 'ai-engines',
      label: 'AI Engines',
      type: 'external',
      icon: Brain,
      description: 'Moteurs IA pour scoring, corrélation et enrichissement automatique',
      x: 600,
      y: 500,
      width: 200,
      height: 60,
      color: '#4c1d95'
    }
  ];

  // Définition des connexions
  const connections: DiagramConnection[] = [
    { from: 'landing', to: 'app-core', type: 'navigation', label: 'Enter Platform' },
    { from: 'app-core', to: 'header', type: 'navigation' },
    { from: 'app-core', to: 'sidebar', type: 'navigation' },
    
    // Connexions vers les dashboards
    { from: 'sidebar', to: 'overview', type: 'navigation' },
    { from: 'sidebar', to: 'threats', type: 'navigation' },
    { from: 'sidebar', to: 'threat-tracking', type: 'navigation' },
    { from: 'sidebar', to: 'intelligence', type: 'navigation' },
    { from: 'sidebar', to: 'incidents', type: 'navigation' },
    { from: 'sidebar', to: 'entities', type: 'navigation' },
    { from: 'sidebar', to: 'analysis', type: 'navigation' },
    { from: 'sidebar', to: 'taranis', type: 'navigation' },
    { from: 'sidebar', to: 'import-export', type: 'navigation' },
    { from: 'sidebar', to: 'reports', type: 'navigation' },
    { from: 'sidebar', to: 'settings', type: 'navigation' },

    // Flux de données
    { from: 'external-feeds', to: 'intelligence', type: 'data', label: 'IOCs & Feeds' },
    { from: 'external-feeds', to: 'taranis', type: 'data', label: 'OSINT Data' },
    { from: 'ai-engines', to: 'analysis', type: 'data', label: 'AI Analysis' },
    { from: 'ai-engines', to: 'threat-tracking', type: 'data', label: 'Scoring' },
    { from: 'data-layer', to: 'overview', type: 'data' },
    { from: 'data-layer', to: 'threats', type: 'data' },
    { from: 'data-layer', to: 'incidents', type: 'data' },
    { from: 'data-layer', to: 'entities', type: 'data' },
    { from: 'data-layer', to: 'reports', type: 'data' }
  ];

  const getConnectionPath = (from: DiagramNode, to: DiagramNode) => {
    const fromX = from.x + from.width / 2;
    const fromY = from.y + from.height / 2;
    const toX = to.x + to.width / 2;
    const toY = to.y + to.height / 2;
    
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'entry': return '#3b82f6';
      case 'core': return '#000000';
      case 'dashboard': return '#10b981';
      case 'data': return '#1f2937';
      case 'external': return '#374151';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Architecture AntStrike</h2>
          <p className="text-muted-foreground">Diagramme interactif du fonctionnement de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">11 Dashboards</Badge>
          <Badge variant="outline">Architecture 3-tiers</Badge>
          <Badge variant="outline">AI-Powered</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Diagramme principal */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Flux Architectural
            </CardTitle>
            <CardDescription>
              Cliquez sur un composant pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <svg width="100%" height="100%" viewBox="0 0 850 600">
                {/* Grid Background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                  </pattern>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                   refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Connexions */}
                {connections.map((conn, index) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const strokeColor = conn.type === 'data' ? '#3b82f6' : 
                                    conn.type === 'navigation' ? '#10b981' : '#6b7280';
                  const strokeWidth = conn.type === 'data' ? 2 : 1;
                  const strokeDasharray = conn.type === 'process' ? '5,5' : 'none';

                  return (
                    <g key={index}>
                      <path
                        d={getConnectionPath(fromNode, toNode)}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        fill="none"
                        markerEnd="url(#arrowhead)"
                        opacity={0.7}
                      />
                      {conn.label && (
                        <text
                          x={(fromNode.x + fromNode.width/2 + toNode.x + toNode.width/2) / 2}
                          y={(fromNode.y + fromNode.height/2 + toNode.y + toNode.height/2) / 2}
                          textAnchor="middle"
                          className="fill-current text-xs font-medium"
                          style={{ fontSize: '10px' }}
                        >
                          {conn.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nœuds */}
                {nodes.map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNode === node.id;
                  
                  return (
                    <g 
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer"
                    >
                      {/* Shadow */}
                      <rect
                        x={node.x + 2}
                        y={node.y + 2}
                        width={node.width}
                        height={node.height}
                        rx="8"
                        fill="rgba(0,0,0,0.1)"
                      />
                      
                      {/* Main rectangle */}
                      <rect
                        x={node.x}
                        y={node.y}
                        width={node.width}
                        height={node.height}
                        rx="8"
                        fill={isSelected || isHovered ? node.color : '#ffffff'}
                        stroke={node.color}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-200"
                      />
                      
                      {/* Icon */}
                      <foreignObject
                        x={node.x + 10}
                        y={node.y + 10}
                        width="20"
                        height="20"
                      >
                        <Icon 
                          className={`w-5 h-5 ${isSelected || isHovered ? 'text-white' : 'text-current'}`}
                          style={{ color: isSelected || isHovered ? 'white' : node.color }}
                        />
                      </foreignObject>
                      
                      {/* Label */}
                      <text
                        x={node.x + 40}
                        y={node.y + 20}
                        className={`text-sm font-medium ${isSelected || isHovered ? 'fill-white' : 'fill-current'}`}
                      >
                        {node.label}
                      </text>
                      
                      {/* Type badge */}
                      <text
                        x={node.x + 10}
                        y={node.y + node.height - 10}
                        className={`text-xs ${isSelected || isHovered ? 'fill-white' : 'fill-current'}`}
                        style={{ opacity: 0.7 }}
                      >
                        {node.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Panel de détails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Détails du Composant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedNode.color }}
                  >
                    <selectedNode.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedNode.label}</h4>
                    <Badge variant="outline" className="text-xs">
                      {selectedNode.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {selectedNode.description}
                </div>

                {selectedNode.connections && (
                  <div className="pt-2 border-t">
                    <h5 className="font-medium text-sm mb-2">Connexions</h5>
                    <div className="space-y-1 text-xs">
                      {selectedNode.connections.map((connId, idx) => {
                        const connectedNode = nodes.find(n => n.id === connId);
                        return connectedNode ? (
                          <div key={idx} className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span>{connectedNode.label}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sélectionnez un composant pour voir les détails</p>
              </div>
            )}

            {/* Légende */}
            <div className="pt-4 border-t">
              <h5 className="font-medium text-sm mb-3">Types de Composants</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Entry Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-black"></div>
                  <span>Core System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-700"></div>
                  <span>Data Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  <span>External</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-xs text-muted-foreground">Modules spécialisés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Composants UI</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40+</div>
            <p className="text-xs text-muted-foreground">ShadCN components</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Intégrations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12+</div>
            <p className="text-xs text-muted-foreground">Feeds externes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Architecture</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3-Tier</div>
            <p className="text-xs text-muted-foreground">Frontend + Server + DB</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}