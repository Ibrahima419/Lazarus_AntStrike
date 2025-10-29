/**
 * Correlation Engine - Moteur de corrélation et d'analyse
 * Interface pour analyser les corrélations entre les éléments de CTI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Network, Brain, Link, Target, AlertTriangle, 
  TrendingUp, Eye, Filter, Search, Zap, 
  BarChart3, PieChart, Activity, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  type: 'ioc' | 'temporal' | 'geographic' | 'behavioral' | 'attribution';
  confidence: number;
  status: 'active' | 'inactive' | 'testing';
  matches: number;
  falsePositives: number;
  lastRun: Date;
}

interface CorrelationResult {
  id: string;
  ruleId: string;
  elements: (string | { type: string; id: string; value: string; confidence: number })[];
  confidence: number;
  strength: number;
  type: string;
  description: string;
  timestamp: Date;
  verified: boolean;
}

interface NetworkNode {
  id: string;
  type: 'ioc' | 'campaign' | 'threat_actor' | 'victim';
  label: string;
  size: number;
  color: string;
  x: number;
  y: number;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
  type: string;
  color?: string;
}

// Fonction utilitaire pour extraire la valeur d'un élément
const getElementValue = (element: string | { type: string; id: string; value: string; confidence: number }): string => {
  return typeof element === 'string' ? element : element.value || element.id || JSON.stringify(element);
};

const getElementId = (element: string | { type: string; id: string; value: string; confidence: number }): string => {
  return typeof element === 'string' ? element : element.id || element.value || JSON.stringify(element);
};

export function CorrelationEngine() {
  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>([]);
  const [correlationResults, setCorrelationResults] = useState<CorrelationResult[]>([]);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkLinks, setNetworkLinks] = useState<NetworkLink[]>([]);
  const [selectedRule, setSelectedRule] = useState<CorrelationRule | null>(null);
  const [selectedResult, setSelectedResult] = useState<CorrelationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadCorrelationData();
  }, []);

  const triggerCorrelationAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔗 Déclenchement manuel de l\'analyse de corrélation...');
      
      const { getTaranisCorrelationMapperService } = await import('./services/taranis-correlation-mapper');
      const correlationMapper = getTaranisCorrelationMapperService();
      
      // Invalider le cache et ré-extraire
      correlationMapper.invalidateCache();
      const extraction = await correlationMapper.extractCorrelationsFromTaranis();
      
      console.log(`✅ Analyse terminée: ${extraction.totalCorrelations} corrélations détectées`);
      
      // Recharger les données
      await loadCorrelationData();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse manuelle:', error);
      setError('Erreur lors de l\'analyse manuelle des corrélations');
    } finally {
      setIsLoading(false);
    }
  };

  const createNetworkGraphFromResults = (results: CorrelationResult[]) => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    const nodeMap = new Map<string, NetworkNode>();

    // Créer des nœuds pour les éléments les plus corrélés
    results.slice(0, 20).forEach((result, idx) => {
      result.elements.forEach((element, elemIdx) => {
        const elementKey = getElementId(element);
        if (!nodeMap.has(elementKey)) {
          const elementValue = getElementValue(element);
          const node: NetworkNode = {
            id: elementKey,
            type: result.type === 'ioc_cooccurrence' ? 'ioc' : 
                  result.type === 'temporal_clustering' ? 'campaign' : 
                  result.type === 'attribution_analysis' ? 'threat_actor' : 'victim',
            label: elementValue.length > 30 ? elementValue.substring(0, 30) + '...' : elementValue,
            size: 10 + (result.strength * 50),
            color: getNodeColor(result.type),
            x: Math.random() * 800,
            y: Math.random() * 600
          };
          nodeMap.set(elementKey, node);
          nodes.push(node);
        }
      });

      // Créer des liens entre les éléments corrélés
      for (let i = 0; i < result.elements.length; i++) {
        for (let j = i + 1; j < result.elements.length; j++) {
        const sourceKey = getElementId(result.elements[i]);
        const targetKey = getElementId(result.elements[j]);
          
          if (nodeMap.has(sourceKey) && nodeMap.has(targetKey)) {
            links.push({
              source: sourceKey,
              target: targetKey,
              strength: result.strength,
              type: result.type,
            });
          }
        }
      }
    });

    setNetworkNodes(nodes);
    setNetworkLinks(links);
  };

  const loadCorrelationData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser le service de moteur de corrélation avancé
      const { getCorrelationEngineService } = await import('./services/correlation-engine-service');
      const correlationEngine = getCorrelationEngineService();
      
      console.log('🔗 Chargement des règles et résultats de corrélation...');
      
      // Récupérer les règles de corrélation
      const rules = await correlationEngine.getCorrelationRules();
      
      if (rules.length === 0) {
        console.log('⚠️ Aucune règle de corrélation trouvée');
        setCorrelationRules([]);
        setCorrelationResults([]);
        return;
      }

      console.log(`📋 ${rules.length} règles de corrélation chargées`);
      
      // Exécuter l'analyse de corrélation
      const results = await correlationEngine.runCorrelationAnalysis();
      
      console.log(`✅ ${results.length} résultats de corrélation générés`);
      
      // Convertir vers le format attendu par le composant
      const formattedRules: CorrelationRule[] = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        confidence: rule.confidence,
        status: rule.status,
        matches: rule.matches,
        falsePositives: rule.falsePositives,
        lastRun: rule.lastRun
      }));

      const formattedResults: CorrelationResult[] = results.map(result => ({
        id: result.id,
        ruleId: result.ruleId,
        elements: result.elements,
        confidence: result.confidence,
        strength: result.strength,
        type: result.type,
        description: result.description,
        timestamp: result.timestamp,
        verified: result.verified
      }));

      setCorrelationRules(formattedRules);
      setCorrelationResults(formattedResults);
      
      // Afficher les statistiques dans la console pour debug
      const stats = await correlationEngine.getCorrelationStatistics();
      console.log('📈 Statistiques de corrélation:', {
        totalRules: stats.totalRules,
        activeRules: stats.activeRules,
        totalResults: stats.totalResults,
        verifiedResults: stats.verifiedResults,
        falsePositiveRate: stats.falsePositiveRate,
        avgConfidence: stats.avgConfidence,
        byType: stats.byType,
        byStatus: stats.byStatus
      });

      // Créer le graphe de réseau basé sur les résultats réels
      createNetworkGraphFromResults(formattedResults);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement des corrélations:', err);
      setError('Impossible de charger les corrélations depuis Taranis. Vérifiez la connexion à l\'API.');
      
      // Pas de fallback avec des données mockées - on affiche une erreur claire
      setCorrelationRules([]);
      setCorrelationResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Créer le graphe de réseau basé sur les corrélations
  const createNetworkGraph = (newsItems: any[], results: CorrelationResult[]) => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    const nodeMap = new Map<string, NetworkNode>();

    // Créer des nœuds pour les éléments les plus corrélés
    results.slice(0, 20).forEach((result, idx) => {
      result.elements.forEach((element, elemIdx) => {
        const elementId = getElementId(element);
        const elementLabel = getElementValue(element);
        
        if (!nodeMap.has(elementId)) {
          const node: NetworkNode = {
            id: elementId,
            type: result.type === 'ioc' ? 'ioc' : 
                  result.type === 'temporal' ? 'campaign' : 
                  result.type === 'attribution' ? 'threat_actor' : 'victim',
            label: elementLabel.length > 30 ? elementLabel.substring(0, 30) + '...' : elementLabel,
            size: 10 + (result.strength * 50),
            color: getNodeColor(result.type),
            x: Math.random() * 800,
            y: Math.random() * 600
          };
          nodeMap.set(elementId, node);
          nodes.push(node);
        }
      });

      // Créer des liens entre les éléments du même résultat
      for (let i = 0; i < result.elements.length - 1; i++) {
        for (let j = i + 1; j < result.elements.length; j++) {
          const sourceId = getElementId(result.elements[i]);
          const targetId = getElementId(result.elements[j]);
          
          links.push({
            source: sourceId,
            target: targetId,
            strength: result.strength,
            type: result.type
          });
        }
      }
    });

    setNetworkNodes(nodes.slice(0, 50)); // Limiter à 50 nœuds
    setNetworkLinks(links.slice(0, 100)); // Limiter à 100 liens
  };

  const generateCorrelationNetwork = (results: CorrelationResult[]) => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Créer des nœuds pour chaque élément unique
    const elementMap = new Map<string, { type: string; count: number }>();
    
    results.forEach(result => {
      result.elements.forEach(element => {
        const elementId = getElementId(element);
        const existing = elementMap.get(elementId);
        if (existing) {
          existing.count++;
        } else {
          elementMap.set(elementId, { 
            type: result.type, 
            count: 1 
          });
        }
      });
    });

    let nodeId = 0;
    elementMap.forEach((data, elementId) => {
      const node: NetworkNode = {
        id: `node-${nodeId++}`,
        type: data.type as any,
        label: elementId,
        size: Math.min(Math.max(data.count * 10, 20), 100),
        color: getNodeColor(data.type),
        x: Math.random() * 800,
        y: Math.random() * 600
      };
      nodes.push(node);
    });

    // Créer des liens basés sur les corrélations
    results.forEach(result => {
      for (let i = 0; i < result.elements.length; i++) {
        for (let j = i + 1; j < result.elements.length; j++) {
          const elementI = getElementValue(result.elements[i]);
          const elementJ = getElementValue(result.elements[j]);
          
          const sourceNode = nodes.find(n => n.label === elementI);
          const targetNode = nodes.find(n => n.label === elementJ);
          
          if (sourceNode && targetNode) {
            links.push({
              source: sourceNode.id,
              target: targetNode.id,
              strength: result.strength,
              type: result.type
            });
          }
        }
      }
    });

    setNetworkNodes(nodes);
    setNetworkLinks(links);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ioc': return '#3b82f6';
      case 'temporal': return '#10b981';
      case 'geographic': return '#f59e0b';
      case 'behavioral': return '#8b5cf6';
      case 'attribution': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'ioc': return 'bg-blue-500/10 text-blue-700';
      case 'temporal': return 'bg-green-500/10 text-green-700';
      case 'geographic': return 'bg-yellow-500/10 text-yellow-700';
      case 'behavioral': return 'bg-purple-500/10 text-purple-700';
      case 'attribution': return 'bg-red-500/10 text-red-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      case 'testing': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };


  const calculateAccuracy = (rule: CorrelationRule) => {
    const total = rule.matches + rule.falsePositives;
    return total > 0 ? ((rule.matches - rule.falsePositives) / total * 100).toFixed(1) : '0';
  };

  // Données pour les graphiques
  const rulePerformanceData = correlationRules.map(rule => ({
    name: rule.name.substring(0, 12) + '...',
    matches: rule.matches,
    accuracy: parseFloat(calculateAccuracy(rule)),
    confidence: rule.confidence * 100
  }));

  const correlationTrendData = correlationResults.map(result => ({
    time: result.timestamp.toLocaleTimeString(),
    confidence: result.confidence * 100,
    strength: result.strength * 100,
    type: result.type
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Correlation Engine
          </h2>
          <p className="text-muted-foreground">
            Advanced correlation analysis and pattern detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="animate-pulse">
              Analyse des corrélations...
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="max-w-md truncate">
              {error}
            </Badge>
          )}
          <Button
            onClick={triggerCorrelationAnalysis}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{correlationRules.length}</p>
            <p className="text-sm text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{correlationResults.length}</p>
            <p className="text-sm text-muted-foreground">Correlations Found</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {correlationResults.filter(r => r.verified).length}
            </p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(correlationResults.reduce((sum, r) => sum + r.confidence, 0) / correlationResults.length * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Rule Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rulePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="matches" fill="#3b82f6" />
                <Bar dataKey="accuracy" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Correlation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={correlationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="strength" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Règles de corrélation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Correlation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlationRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRule?.id === rule.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge className={getRuleTypeColor(rule.type)}>
                        {rule.type}
                      </Badge>
                      <Badge className={getStatusColor(rule.status)}>
                        {rule.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rule.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Matches:</span>
                        <p className="font-medium">{rule.matches}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">False Positives:</span>
                        <p className="font-medium">{rule.falsePositives}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <p className="font-medium">{calculateAccuracy(rule)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{Math.round(rule.confidence * 100)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Last run: {rule.lastRun.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résultats de corrélation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Correlation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedResult?.id === result.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedResult(result)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{result.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRuleTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                          {result.verified && (
                            <Badge className="text-green-500 bg-green-500/10">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={result.confidence * 100} className="flex-1" />
                            <span className="text-sm">{Math.round(result.confidence * 100)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Strength:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={result.strength * 100} className="flex-1" />
                            <span className="text-sm">{Math.round(result.strength * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Elements:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.elements.map((element, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getElementValue(element)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail du résultat sélectionné */}
        <div>
          {selectedResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Correlation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedResult.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Confidence</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedResult.confidence * 100} className="flex-1" />
                      <span className="text-sm">{Math.round(selectedResult.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Strength</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedResult.strength * 100} className="flex-1" />
                      <span className="text-sm">{Math.round(selectedResult.strength * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <Badge className={getRuleTypeColor(selectedResult.type)}>
                    {selectedResult.type}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Verified</h4>
                  <Badge className={selectedResult.verified ? "text-green-500 bg-green-500/10" : "text-gray-500 bg-gray-500/10"}>
                    {selectedResult.verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Timestamp</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedResult.timestamp.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Correlated Elements</h4>
                  <div className="space-y-2">
                    {selectedResult.elements.map((element, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        {getElementValue(element)}
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
                    <Target className="w-4 h-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Link className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a Correlation</p>
                  <p className="text-sm">Choose a correlation result to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Visualisation du réseau */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Correlation Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted/10 rounded-lg p-6 min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Interactive Correlation Network</p>
                <p className="text-sm">Visual representation of correlated elements</p>
              </div>
            </div>

            {/* Nœuds du réseau (simulés) */}
            {networkNodes.slice(0, 8).map((node, index) => (
              <div
                key={node.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${30 + Math.floor(index / 4) * 30}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: node.color }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background border rounded-lg px-2 py-1 text-xs whitespace-nowrap">
                    {node.label}
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
