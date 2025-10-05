import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';
import { 
  Search, 
  Filter, 
  Download, 
  MapPin, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Users, 
  Target, 
  Zap,
  Clock,
  Activity,
  Globe,
  Building,
  Network
} from 'lucide-react';
import { NetworkGraphVisualization } from './network-graph-visualization';

// Mock data pour le tracking des menaces
const attributionChainData = [
  {
    id: 'APT-2024-001',
    actor: 'Lazarus Group',
    campaign: 'Operation GhostShell',
    confidence: 92,
    victims: 47,
    iocs: 156,
    ttps: 23,
    timespan: '2024-01-15 - 2024-09-20',
    sectors: ['Finance', 'Healthcare', 'Government'],
    status: 'Active'
  },
  {
    id: 'APT-2024-002',
    actor: 'Fancy Bear',
    campaign: 'ElectionStorm',
    confidence: 87,
    victims: 23,
    iocs: 89,
    ttps: 18,
    timespan: '2024-03-10 - 2024-08-30',
    sectors: ['Government', 'Media', 'Defense'],
    status: 'Monitored'
  },
  {
    id: 'APT-2024-003',
    actor: 'Equation Group',
    campaign: 'ShadowNet',
    confidence: 95,
    victims: 12,
    iocs: 234,
    ttps: 31,
    timespan: '2024-02-01 - 2024-09-15',
    sectors: ['Energy', 'Critical Infrastructure'],
    status: 'Contained'
  }
];

const impactMappingData = [
  { country: 'USA', attacks: 45, victims: 234, severity: 'High' },
  { country: 'Germany', attacks: 23, victims: 123, severity: 'Medium' },
  { country: 'Japan', attacks: 18, victims: 89, severity: 'High' },
  { country: 'France', attacks: 15, victims: 67, severity: 'Medium' },
  { country: 'UK', attacks: 12, victims: 45, severity: 'Low' },
  { country: 'Canada', attacks: 8, victims: 34, severity: 'Low' }
];

const killChainData = [
  { stage: 'Reconnaissance', attacks: 156, mitigated: 89, success_rate: 43 },
  { stage: 'Weaponization', attacks: 134, mitigated: 78, success_rate: 42 },
  { stage: 'Delivery', attacks: 112, mitigated: 56, success_rate: 50 },
  { stage: 'Exploitation', attacks: 89, mitigated: 34, success_rate: 62 },
  { stage: 'Installation', attacks: 67, mitigated: 23, success_rate: 66 },
  { stage: 'C2', attacks: 45, mitigated: 12, success_rate: 73 },
  { stage: 'Actions', attacks: 23, mitigated: 5, success_rate: 78 }
];

const correlationData = [
  { ioc_type: 'IP Address', confidence: 95, connections: 23, threat_score: 8.7 },
  { ioc_type: 'Domain', confidence: 87, connections: 18, threat_score: 7.4 },
  { ioc_type: 'File Hash', confidence: 92, connections: 31, threat_score: 9.1 },
  { ioc_type: 'Email', confidence: 78, connections: 12, threat_score: 6.8 },
  { ioc_type: 'URL', confidence: 84, connections: 27, threat_score: 7.9 }
];

const timelineData = [
  { date: '2024-01-15', incidents: 12, severity: 'Medium', campaign: 'GhostShell' },
  { date: '2024-02-01', incidents: 18, severity: 'High', campaign: 'ShadowNet' },
  { date: '2024-03-10', incidents: 8, severity: 'Low', campaign: 'ElectionStorm' },
  { date: '2024-04-22', incidents: 23, severity: 'High', campaign: 'GhostShell' },
  { date: '2024-05-15', incidents: 15, severity: 'Medium', campaign: 'ShadowNet' },
  { date: '2024-06-30', incidents: 31, severity: 'Critical', campaign: 'GhostShell' },
  { date: '2024-07-18', incidents: 19, severity: 'High', campaign: 'ElectionStorm' },
  { date: '2024-08-09', incidents: 27, severity: 'Medium', campaign: 'ShadowNet' },
  { date: '2024-09-01', incidents: 35, severity: 'Critical', campaign: 'GhostShell' }
];

const sectorImpactData = [
  { name: 'Finance', value: 35, color: '#8884d8' },
  { name: 'Healthcare', value: 28, color: '#82ca9d' },
  { name: 'Government', value: 22, color: '#ffc658' },
  { name: 'Energy', value: 15, color: '#ff7300' }
];

export function ThreatTrackingDashboard() {
  const [selectedAttribution, setSelectedAttribution] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Threat Tracking & Attribution</h1>
          <p className="text-muted-foreground">
            Suivi avancé des menaces, attribution d'attaques et analyse d'impact
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Campagnes Actives</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 nouvelles cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Organisations Impactées</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">
              Across 67 countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Score Attribution</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.2%</div>
            <p className="text-xs text-muted-foreground">
              Confiance moyenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Corrélations IOCs</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +87 automatiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="attribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attribution">Attribution Chain</TabsTrigger>
          <TabsTrigger value="geolocation">Géolocalisation</TabsTrigger>
          <TabsTrigger value="impact">Impact Mapping</TabsTrigger>
          <TabsTrigger value="killchain">Kill Chain</TabsTrigger>
          <TabsTrigger value="correlation">Corrélation</TabsTrigger>
        </TabsList>

        {/* Attribution Chain Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une campagne ou un acteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAttribution} onValueChange={setSelectedAttribution}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="monitored">Surveillé</SelectItem>
                <SelectItem value="contained">Contenu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attribution Cards */}
            <div className="space-y-4">
              {attributionChainData.map((chain) => (
                <Card key={chain.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{chain.campaign}</CardTitle>
                      <Badge variant={
                        chain.status === 'Active' ? 'destructive' :
                        chain.status === 'Monitored' ? 'secondary' : 'default'
                      }>
                        {chain.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Attribué à <strong>{chain.actor}</strong> • {chain.timespan}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score de confiance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={chain.confidence} className="w-20" />
                        <span className="text-sm">{chain.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{chain.victims}</div>
                        <div className="text-muted-foreground">Victimes</div>
                      </div>
                      <div>
                        <div className="font-medium">{chain.iocs}</div>
                        <div className="text-muted-foreground">IOCs</div>
                      </div>
                      <div>
                        <div className="font-medium">{chain.ttps}</div>
                        <div className="text-muted-foreground">TTPs</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Secteurs impactés</div>
                      <div className="flex gap-1 flex-wrap">
                        {chain.sectors.map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline des Incidents</CardTitle>
                <CardDescription>
                  Évolution temporelle des campagnes d'attaque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="incidents" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geolocation Tab */}
        <TabsContent value="geolocation" className="space-y-6">
          <NetworkGraphVisualization />
        </TabsContent>

        {/* Impact Mapping Tab */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Impact Géographique</CardTitle>
                <CardDescription>
                  Distribution des attaques par pays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={impactMappingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attacks" fill="#8884d8" />
                    <Bar dataKey="victims" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Impact par Secteur</CardTitle>
                <CardDescription>
                  Répartition des attaques par industrie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorImpactData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {sectorImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Impact Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Détails d'Impact par Pays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Pays</th>
                      <th className="text-left p-2">Attaques</th>
                      <th className="text-left p-2">Victimes</th>
                      <th className="text-left p-2">Sévérité</th>
                      <th className="text-left p-2">Tendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impactMappingData.map((country) => (
                      <tr key={country.country} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {country.country}
                        </td>
                        <td className="p-2">{country.attacks}</td>
                        <td className="p-2">{country.victims}</td>
                        <td className="p-2">
                          <Badge variant={
                            country.severity === 'High' ? 'destructive' :
                            country.severity === 'Medium' ? 'secondary' : 'default'
                          }>
                            {country.severity}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kill Chain Tab */}
        <TabsContent value="killchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Kill Chain - MITRE ATT&CK</CardTitle>
              <CardDescription>
                Progression des attaques à travers les étapes de la kill chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={killChainData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attacks" fill="#8884d8" name="Attaques détectées" />
                  <Bar dataKey="mitigated" fill="#82ca9d" name="Attaques mitigées" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {killChainData.map((stage) => (
              <Card key={stage.stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{stage.stage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attaques</span>
                      <span>{stage.attacks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mitigées</span>
                      <span>{stage.mitigated}</span>
                    </div>
                    <Progress value={stage.success_rate} className="mt-2" />
                    <div className="text-xs text-muted-foreground">
                      {stage.success_rate}% de succès
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Correlation Tab */}
        <TabsContent value="correlation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Matrice de Corrélation IOCs</CardTitle>
                <CardDescription>
                  Analyse des connexions entre indicateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="confidence" name="Confiance" />
                    <YAxis dataKey="threat_score" name="Score Menace" />
                    <Tooltip />
                    <Scatter name="IOCs" dataKey="connections" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Correlation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails des Corrélations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correlationData.map((item, index) => (
                    <div key={index} className="border-l-4 border-l-primary pl-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{item.ioc_type}</h4>
                        <Badge variant="secondary">{item.connections} liens</Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Confiance</span>
                          <span>{item.confidence}%</span>
                        </div>
                        <Progress value={item.confidence} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Score de menace</span>
                          <span>{item.threat_score}/10</span>
                        </div>
                        <Progress value={item.threat_score * 10} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations IA</CardTitle>
              <CardDescription>
                Corrélations automatiques et suggestions d'investigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-l-yellow-500 pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Nouvelle corrélation détectée</span>
                    <Badge variant="secondary">Confiance: 94%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les domaines malveillants de la campagne GhostShell montrent des similarités avec l'infrastructure APT29. Investigation recommandée.
                  </p>
                </div>
                
                <div className="border-l-4 border-l-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Pattern d'attaque similaire</span>
                    <Badge variant="secondary">Confiance: 87%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les TTPs utilisés dans l'incident INC-2024-092 correspondent à 78% aux techniques du groupe Lazarus.
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Attribution high-confidence</span>
                    <Badge variant="destructive">Confiance: 96%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    L'analyse des métadonnées de malware confirme l'attribution à FIN7 avec très haute confiance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}