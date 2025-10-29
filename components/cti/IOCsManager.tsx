/**
 * IOCs Manager - Gestionnaire d'Indicators of Compromise
 * Interface pour gérer et analyser les IOCs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, Target, AlertTriangle, Shield, Globe, 
  FileText, Download, Plus, Filter, Eye, Edit,
  Trash2, Copy, ExternalLink, Clock, CheckCircle, RefreshCw
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface IOC {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file';
  value: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
  campaigns: string[];
  verified: boolean;
}

interface IOCCategory {
  type: string;
  count: number;
  percentage: number;
}

export function IOCsManager() {
  const [iocs, setIOCs] = useState<IOC[]>([]);
  const [selectedIOC, setSelectedIOC] = useState<IOC | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [categories, setCategories] = useState<IOCCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadIOCs();
    initializeIOCExtractorBot();
  }, []);

  const initializeIOCExtractorBot = async () => {
    // NOTE: La création dynamique de bots n'est pas supportée par l'API Taranis
    // Les bots doivent être configurés côté serveur Taranis dans /api/config/bots
    // Cette fonction est désactivée pour éviter les erreurs HTTP 500
    console.log('ℹ️ IOC Extractor: Utiliser les bots configurés côté serveur Taranis');
  };

  const triggerIOCExtraction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Déclenchement manuel de l\'extraction d\'IOCs...');
      
      const { getIOCExtractorBot } = await import('./services/ioc-extractor-bot');
      const iocBot = getIOCExtractorBot();
      
      // Exécuter l'extraction
      const result = await iocBot.execute();
      
      console.log(`✅ Extraction manuelle terminée: ${result.totalExtracted} IOCs extraits`);
      
      // Recharger les IOCs
      await loadIOCs();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction manuelle:', error);
      setError('Erreur lors de l\'extraction manuelle des IOCs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIOCs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ NOUVEAU: Utiliser le mapper Taranis natif (attributs API directement)
      const { getTaranisIOCMapperService } = await import('./services/taranis-ioc-mapper');
      const iocMapper = getTaranisIOCMapperService();
      
      console.log('🔍 Extraction d\'IOCs depuis attributs Taranis natifs...');
      
      // Extraire les IOCs avec la méthode NATIVE (pas de regex, attributs Taranis)
      const extractionResult = await iocMapper.extractIOCsFromNewsItems(500, '7d');
      
      if (extractionResult.iocs.length === 0) {
        console.log('⚠️ Aucun IOC trouvé dans les news items récents');
        setIOCs([]);
        return;
      }

      console.log(`✅ ${extractionResult.totalExtracted} IOCs extraits avec succès (Méthode: ${extractionResult.extractionMethod})`);
      console.log(`📊 Répartition: ${extractionResult.byType.ip} IPs, ${extractionResult.byType.domain} domains, ${extractionResult.byType.hash} hashes, ${extractionResult.byType.url} URLs, ${extractionResult.byType.email} emails`);
      
      // Convertir vers le format attendu par le composant
      const formattedIOCs: IOC[] = extractionResult.iocs.map(ioc => ({
        id: ioc.id,
        type: ioc.type,
        value: ioc.value,
        description: ioc.description || `IOC ${ioc.type} extrait automatiquement`,
        confidence: ioc.confidence,
        severity: ioc.severity,
        source: ioc.source,
        firstSeen: ioc.firstSeen,
        lastSeen: ioc.lastSeen,
        tags: ioc.tags,
        campaigns: ioc.campaigns,
        verified: ioc.verified
      }));

      setIOCs(formattedIOCs);
      
      // Afficher les statistiques dans la console pour debug
      console.log('📈 Statistiques d\'extraction:', {
        total: extractionResult.totalExtracted,
        byType: extractionResult.byType,
        confidence: extractionResult.confidence,
        sources: extractionResult.sources.length
      });

      // Calculer les catégories pour l'affichage
      calculateCategories(formattedIOCs);
      
      // Sélectionner le premier IOC si aucun n'est sélectionné
      if (formattedIOCs.length > 0 && !selectedIOC) {
        setSelectedIOC(formattedIOCs[0]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des IOCs:', err);
      setError('Impossible de charger les IOCs depuis Taranis. Vérifiez la connexion à l\'API.');
      
      // Pas de fallback avec des données mockées - on affiche une erreur claire
      setIOCs([]);
      calculateCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategories = (iocsData: IOC[]) => {
    const typeCount: Record<string, number> = {};
    iocsData.forEach(ioc => {
      typeCount[ioc.type] = (typeCount[ioc.type] || 0) + 1;
    });

    const total = iocsData.length;
    const categoriesData: IOCCategory[] = Object.entries(typeCount).map(([type, count]) => ({
      type: type.toUpperCase(),
      count,
      percentage: Math.round((count / total) * 100)
    }));

    setCategories(categoriesData);
  };

  const getIOCIcon = (type: string) => {
    switch (type) {
      case 'ip': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'domain': return <Globe className="w-4 h-4 text-green-500" />;
      case 'url': return <ExternalLink className="w-4 h-4 text-orange-500" />;
      case 'hash': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'email': return <Target className="w-4 h-4 text-red-500" />;
      case 'file': return <FileText className="w-4 h-4 text-gray-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'bg-blue-500/10 text-blue-700';
      case 'domain': return 'bg-green-500/10 text-green-700';
      case 'url': return 'bg-orange-500/10 text-orange-700';
      case 'hash': return 'bg-purple-500/10 text-purple-700';
      case 'email': return 'bg-red-500/10 text-red-700';
      case 'file': return 'bg-gray-500/10 text-gray-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const filteredIOCs = iocs.filter(ioc => {
    if (searchTerm && !ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ioc.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && ioc.type !== selectedType) return false;
    if (selectedSeverity !== 'all' && ioc.severity !== selectedSeverity) return false;
    return true;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            IOCs Manager
          </h2>
          <p className="text-muted-foreground">
            Manage and analyze Indicators of Compromise
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="animate-pulse">
              Extraction depuis Taranis...
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="max-w-md truncate">
              {error}
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={triggerIOCExtraction}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Extracting...' : 'Extract IOCs'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add IOC
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{iocs.length}</p>
            <p className="text-sm text-muted-foreground">Total IOCs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">
              {iocs.filter(ioc => ioc.severity === 'critical').length}
            </p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {iocs.filter(ioc => ioc.severity === 'high').length}
            </p>
            <p className="text-sm text-muted-foreground">High</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {iocs.filter(ioc => ioc.verified).length}
            </p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(iocs.reduce((sum, ioc) => sum + ioc.confidence, 0) / iocs.length * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {new Set(iocs.flatMap(ioc => ioc.campaigns)).size}
            </p>
            <p className="text-sm text-muted-foreground">Campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Catégories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            IOC Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.type} className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-2xl font-bold">{category.count}</p>
                <p className="text-sm text-muted-foreground">{category.type}</p>
                <p className="text-xs text-muted-foreground">{category.percentage}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                placeholder="Search IOCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="hash">Hash</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="file">File</SelectItem>
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

      {/* Liste des IOCs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>IOCs ({filteredIOCs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredIOCs.map((ioc) => (
                  <div
                    key={ioc.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedIOC?.id === ioc.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedIOC(ioc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getIOCIcon(ioc.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {ioc.value}
                            </code>
                            <Badge className={getTypeColor(ioc.type)}>
                              {ioc.type.toUpperCase()}
                            </Badge>
                            <Badge className={getSeverityColor(ioc.severity)}>
                              {ioc.severity}
                            </Badge>
                            {ioc.verified && (
                              <Badge className="text-green-500 bg-green-500/10">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {ioc.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Source: {ioc.source}</span>
                            <span>Confidence: {Math.round(ioc.confidence * 100)}%</span>
                            <span>First seen: {ioc.firstSeen.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(ioc.value);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {ioc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {ioc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail de l'IOC sélectionné */}
        <div>
          {selectedIOC ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  IOC Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Value</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-muted p-2 rounded break-all">
                      {selectedIOC.value}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(selectedIOC.value)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIOC.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Type</h4>
                    <Badge className={getTypeColor(selectedIOC.type)}>
                      {selectedIOC.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Severity</h4>
                    <Badge className={getSeverityColor(selectedIOC.severity)}>
                      {selectedIOC.severity}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Confidence</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${selectedIOC.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{Math.round(selectedIOC.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Verified</h4>
                    <Badge className={selectedIOC.verified ? "text-green-500 bg-green-500/10" : "text-gray-500 bg-gray-500/10"}>
                      {selectedIOC.verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Source</h4>
                  <p className="text-sm text-muted-foreground">{selectedIOC.source}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">First seen:</span>
                      <span>{selectedIOC.firstSeen.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last seen:</span>
                      <span>{selectedIOC.lastSeen.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {selectedIOC.campaigns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Associated Campaigns</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedIOC.campaigns.map((campaign) => (
                        <Badge key={campaign} variant="outline" className="text-xs">
                          {campaign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedIOC.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedIOC.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Investigate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select an IOC</p>
                  <p className="text-sm">Choose an IOC from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
