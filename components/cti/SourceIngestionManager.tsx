/**
 * Source Ingestion Manager - Gestionnaire d'Ingestion de Sources Personnalisées
 * Permet aux utilisateurs d'ajouter leurs propres sources de données CTI
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, Plus, Settings, Globe, Database, FileText, 
  Link, Mail, Rss, TestTube, CheckCircle, AlertTriangle,
  Activity, RefreshCw, Trash2, Eye, Edit, Save
} from 'lucide-react';

import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';
import { OSINTSourceConfig } from '../../src/services/taranis/taranis-unified-service';

// Import des sous-composants
import { SourceUploader } from './SourceUploader';
import { SourceConfigurator } from './SourceConfigurator';
import { SourceTester } from './SourceTester';
import { SourceManager } from './SourceManager';

export interface SourceIngestionStats {
  totalSources: number;
  activeSources: number;
  inactiveSources: number;
  lastCollection: string;
  totalNewsItems: number;
  successRate: number;
}

export interface SourceTestResult {
  success: boolean;
  message: string;
  data?: any;
  responseTime?: number;
  error?: string;
}

export function SourceIngestionManager() {
  const [activeTab, setActiveTab] = useState('upload');
  const [sources, setSources] = useState<OSINTSourceConfig[]>([]);
  const [stats, setStats] = useState<SourceIngestionStats>({
    totalSources: 0,
    activeSources: 0,
    inactiveSources: 0,
    lastCollection: '',
    totalNewsItems: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const taranisService = getTaranisService();

  // Charger les sources existantes
  const loadSources = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const existingSources = await taranisService.listConfigOSINTSources();
      setSources(existingSources);
      
      // Calculer les statistiques
      const activeSources = existingSources.filter(s => s.enabled).length;
      const inactiveSources = existingSources.length - activeSources;
      
      setStats({
        totalSources: existingSources.length,
        activeSources,
        inactiveSources,
        lastCollection: new Date().toISOString(),
        totalNewsItems: 0, // À récupérer via getNewsItems()
        successRate: existingSources.length > 0 ? (activeSources / existingSources.length) * 100 : 0
      });
    } catch (err) {
      setError(`Erreur lors du chargement des sources: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [taranisService]);

  // Créer une nouvelle source
  const createSource = useCallback(async (sourceData: Partial<OSINTSourceConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newSource = await taranisService.createConfigOSINTSource(sourceData);
      setSources(prev => [...prev, newSource]);
      setSuccess(`Source "${newSource.name}" créée avec succès !`);
      
      // Recharger les sources pour mettre à jour les stats
      await loadSources();
      
      return newSource;
    } catch (err) {
      setError(`Erreur lors de la création de la source: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [taranisService, loadSources]);

  // Mettre à jour une source existante
  const updateSource = useCallback(async (sourceId: string, updates: Partial<OSINTSourceConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSource = await taranisService.updateConfigOSINTSource(sourceId, updates);
      setSources(prev => prev.map(s => s.id === sourceId ? updatedSource : s));
      setSuccess(`Source "${updatedSource.name}" mise à jour avec succès !`);
      
      await loadSources();
      return updatedSource;
    } catch (err) {
      setError(`Erreur lors de la mise à jour de la source: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [taranisService, loadSources]);

  // Supprimer une source
  const deleteSource = useCallback(async (sourceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await taranisService.deleteConfigOSINTSource(sourceId);
      setSources(prev => prev.filter(s => s.id !== sourceId));
      setSuccess('Source supprimée avec succès !');
      
      await loadSources();
    } catch (err) {
      setError(`Erreur lors de la suppression de la source: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [taranisService, loadSources]);

  // Tester une source (Validation configuration seulement - pas de collecte)
  const testSource = useCallback(async (source: OSINTSourceConfig): Promise<SourceTestResult> => {
    try {
      const startTime = Date.now();
      
      // Validation de la configuration de la source (pas d'appel API collect)
      const validationErrors: string[] = [];
      
      // Vérifier les champs requis
      if (!source.name || source.name.trim() === '') {
        validationErrors.push('Nom de la source requis');
      }
      
      if (!source.type || source.type.trim() === '') {
        validationErrors.push('Type de source requis');
      }
      
      // Vérifier URL si c'est une source réseau
      if (['RSS', 'API', 'WEB'].includes(source.type)) {
        if (!source.url || source.url.trim() === '') {
          validationErrors.push('URL requise pour ce type de source');
        } else {
          // Vérifier format URL
          try {
            new URL(source.url);
          } catch (e) {
            validationErrors.push('Format URL invalide');
          }
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Configuration invalide',
          error: validationErrors.join(', '),
          responseTime
        };
      }
      
      // Configuration valide
      return {
        success: true,
        message: 'Configuration source valide',
        data: {
          name: source.name,
          type: source.type,
          enabled: source.enabled,
          url: source.url
        },
        responseTime
      };
      
    } catch (err) {
      return {
        success: false,
        message: 'Erreur validation',
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }, [taranisService]);

  // Charger les sources au montage du composant
  React.useEffect(() => {
    loadSources();
  }, [loadSources]);

  // État de connexion Taranis
  const [taranisConnected, setTaranisConnected] = React.useState(true);
  
  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = await taranisService.testConnection();
      setTaranisConnected(connected);
    };
    checkConnection();
  }, [taranisService]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Sources</h2>
          <p className="text-muted-foreground">Ajoutez et gérez vos sources de threat intelligence</p>
        </div>
        <Badge variant={taranisConnected ? "default" : "destructive"}>
          {taranisConnected ? 'Taranis Connected' : 'Taranis Offline'}
        </Badge>
      </div>

      {/* Alerte si Taranis offline */}
      {!taranisConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Le serveur Taranis (localhost:3001) n'est pas disponible. La collecte automatique et les tests de sources sont désactivés. 
            Vous pouvez toujours visualiser les sources existantes et uploader des fichiers manuellement.
          </AlertDescription>
        </Alert>
      )}

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{stats.totalSources}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sources Actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeSources}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Succès</p>
                <p className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière Collecte</p>
                <p className="text-sm font-bold">
                  {stats.lastCollection ? new Date(stats.lastCollection).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Interface principale avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload de Fichiers
          </TabsTrigger>
          <TabsTrigger value="configure" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Test & Validation
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Gestion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <SourceUploader 
            onCreateSource={createSource}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="configure" className="space-y-4">
          <SourceConfigurator 
            onCreateSource={createSource}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <SourceTester 
            sources={sources}
            onTestSource={testSource}
            onUpdateSource={updateSource}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <SourceManager 
            sources={sources}
            onUpdateSource={updateSource}
            onDeleteSource={deleteSource}
            onTestSource={testSource}
            onRefresh={loadSources}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
