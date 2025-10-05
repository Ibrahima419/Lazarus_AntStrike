/**
 * Campaigns Tracker - Suivi des campagnes de menaces
 * Interface pour tracker et analyser les campagnes de cyberattaques
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Target, TrendingUp, AlertTriangle, Clock, Users, 
  Globe, FileText, Search, Filter, Plus, Eye, 
  BarChart3, Calendar, MapPin, Activity, Shield, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface Campaign {
  id: string;
  name: string;
  description: string;
  threatActor: string;
  status: 'active' | 'inactive' | 'dormant' | 'disrupted';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  lastActivity: Date;
  targets: string[];
  iocs: string[];
  ttp: string[];
  countries: string[];
  industries: string[];
  victimCount: number;
  attackVectors: string[];
  attribution: {
    confidence: number;
    sources: string[];
  };
}

interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalVictims: number;
  avgDuration: number;
  topThreatActor: string;
  mostTargeted: string;
}

export function CampaignsTracker() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalVictims: 0,
    avgDuration: 0,
    topThreatActor: '',
    mostTargeted: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const triggerCampaignTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎯 Déclenchement manuel du tracking des campagnes...');
      
      const { getCampaignTrackerService } = await import('./services/campaign-tracker-service');
      const campaignTracker = getCampaignTrackerService();
      
      // Exécuter le tracking
      const trackedCampaigns = await campaignTracker.trackCampaigns('30d');
      
      console.log(`✅ Tracking terminé: ${trackedCampaigns.length} campagnes détectées`);
      
      // Recharger les campagnes
      await loadCampaigns();
      
    } catch (error) {
      console.error('❌ Erreur lors du tracking manuel:', error);
      setError('Erreur lors du tracking manuel des campagnes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser le service de tracking des campagnes avancé
      const { getCampaignTrackerService } = await import('./services/campaign-tracker-service');
      const campaignTracker = getCampaignTrackerService();
      
      console.log('🎯 Tracking des campagnes depuis les stories Taranis...');
      
      // Analyser les stories et créer des campagnes
      const trackedCampaigns = await campaignTracker.trackCampaigns('30d');
      
      if (trackedCampaigns.length === 0) {
        console.log('⚠️ Aucune campagne détectée dans les stories récentes');
        setCampaigns([]);
        return;
      }

      console.log(`✅ ${trackedCampaigns.length} campagnes détectées et créées`);
      
      // Convertir vers le format attendu par le composant
      const formattedCampaigns: Campaign[] = trackedCampaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        threatActor: campaign.threatActor,
        status: campaign.status,
        severity: campaign.severity,
        startDate: campaign.startDate,
        lastActivity: campaign.lastActivity,
        targets: campaign.targets,
        iocs: campaign.iocs,
        ttp: campaign.ttp,
        countries: campaign.countries,
        industries: campaign.industries,
        victimCount: campaign.victimCount,
        attackVectors: campaign.attackVectors,
        attribution: campaign.attribution
      }));

      setCampaigns(formattedCampaigns);
      
      // Afficher les statistiques dans la console pour debug
      console.log('📈 Statistiques des campagnes:', {
        total: formattedCampaigns.length,
        active: formattedCampaigns.filter(c => c.status === 'active').length,
        dormant: formattedCampaigns.filter(c => c.status === 'dormant').length,
        terminated: formattedCampaigns.filter(c => c.status === 'terminated').length,
        bySeverity: {
          critical: formattedCampaigns.filter(c => c.severity === 'critical').length,
          high: formattedCampaigns.filter(c => c.severity === 'high').length,
          medium: formattedCampaigns.filter(c => c.severity === 'medium').length,
          low: formattedCampaigns.filter(c => c.severity === 'low').length
        }
      });

      // Calculer les métriques pour l'affichage
      calculateMetrics(formattedCampaigns);
      
      // Sélectionner la première campagne si aucune n'est sélectionnée
      if (formattedCampaigns.length > 0 && !selectedCampaign) {
        setSelectedCampaign(formattedCampaigns[0]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des campagnes:', err);
      setError('Impossible de charger les campagnes depuis Taranis. Vérifiez la connexion à l\'API.');
      
      // Pas de fallback avec des données mockées - on affiche une erreur claire
      setCampaigns([]);
      calculateMetrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (campaignsData: Campaign[]) => {
    const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
    const totalVictims = campaignsData.reduce((sum, c) => sum + c.victimCount, 0);
    
    // Calculer la durée moyenne (simplifié)
    const avgDuration = 45; // jours
    
    // Trouver le threat actor le plus actif
    const threatActorCount: Record<string, number> = {};
    campaignsData.forEach(c => {
      threatActorCount[c.threatActor] = (threatActorCount[c.threatActor] || 0) + 1;
    });
    const topThreatActor = Object.entries(threatActorCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
    
    // Trouver l'industrie la plus ciblée
    const industryCount: Record<string, number> = {};
    campaignsData.forEach(c => {
      c.industries.forEach(industry => {
        industryCount[industry] = (industryCount[industry] || 0) + 1;
      });
    });
    const mostTargeted = Object.entries(industryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    setMetrics({
      totalCampaigns: campaignsData.length,
      activeCampaigns,
      totalVictims,
      avgDuration,
      topThreatActor,
      mostTargeted
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-500 bg-red-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      case 'dormant': return 'text-yellow-500 bg-yellow-500/10';
      case 'disrupted': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDaysSinceLastActivity = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !campaign.threatActor.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && campaign.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && campaign.severity !== selectedSeverity) return false;
    return true;
  });

  // Données pour les graphiques
  const campaignActivityData = campaigns.map(campaign => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    victims: campaign.victimCount,
    severity: campaign.severity === 'critical' ? 4 : campaign.severity === 'high' ? 3 : campaign.severity === 'medium' ? 2 : 1,
    status: campaign.status
  }));

  const timelineData = campaigns.map(campaign => ({
    name: campaign.name.substring(0, 10) + '...',
    start: campaign.startDate.getTime(),
    end: campaign.lastActivity.getTime(),
    duration: Math.ceil((campaign.lastActivity.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24))
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Campaigns Tracker
          </h2>
          <p className="text-muted-foreground">
            Track and analyze threat campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="animate-pulse">
              Chargement depuis Taranis...
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="max-w-md truncate">
              {error}
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={triggerCampaignTracking}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Tracking...' : 'Track Campaigns'}
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalCampaigns}</p>
                <p className="text-xs text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalVictims}</p>
                <p className="text-xs text-muted-foreground">Total Victims</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgDuration}d</p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold">{metrics.topThreatActor.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">Top Actor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-bold">{metrics.mostTargeted}</p>
                <p className="text-xs text-muted-foreground">Most Targeted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Campaign Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="victims" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Campaign Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="disrupted">Disrupted</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des campagnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCampaign?.id === campaign.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.threatActor}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge className={getSeverityColor(campaign.severity)}>
                            {campaign.severity}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {campaign.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Victims:</span>
                          <p className="font-medium">{campaign.victimCount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Countries:</span>
                          <p className="font-medium">{campaign.countries.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">IOCs:</span>
                          <p className="font-medium">{campaign.iocs.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Activity:</span>
                          <p className="font-medium">{getDaysSinceLastActivity(campaign.lastActivity)}d ago</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {campaign.targets.slice(0, 3).map((target) => (
                          <Badge key={target} variant="outline" className="text-xs">
                            {target}
                          </Badge>
                        ))}
                        {campaign.targets.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{campaign.targets.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail de la campagne sélectionnée */}
        <div>
          {selectedCampaign ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Threat Actor</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCampaign.threatActor}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Attribution Confidence:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedCampaign.attribution.confidence * 100} className="flex-1" />
                      <span className="text-sm">{Math.round(selectedCampaign.attribution.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <Badge className={getStatusColor(selectedCampaign.status)}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Severity</h4>
                    <Badge className={getSeverityColor(selectedCampaign.severity)}>
                      {selectedCampaign.severity}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{selectedCampaign.startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity:</span>
                      <span>{selectedCampaign.lastActivity.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{getDaysSinceLastActivity(selectedCampaign.startDate)} days</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Targets</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCampaign.targets.map((target) => (
                      <Badge key={target} variant="outline" className="text-xs">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Countries</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCampaign.countries.map((country) => (
                      <Badge key={country} variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Industries</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCampaign.industries.map((industry) => (
                      <Badge key={industry} variant="outline" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Attack Vectors</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCampaign.attackVectors.map((vector) => (
                      <Badge key={vector} variant="outline" className="text-xs">
                        {vector}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">TTPs</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCampaign.ttp.map((ttp) => (
                      <Badge key={ttp} variant="outline" className="text-xs">
                        {ttp}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">IOCs</h4>
                  <div className="space-y-1">
                    {selectedCampaign.iocs.map((ioc) => (
                      <div key={ioc} className="text-xs font-mono bg-muted p-1 rounded">
                        {ioc}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Investigate
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a Campaign</p>
                  <p className="text-sm">Choose a campaign from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
