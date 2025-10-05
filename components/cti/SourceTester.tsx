/**
 * Source Tester - Test et Validation des Sources CTI
 * Interface pour tester la connectivité et la collecte des sources
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  TestTube, CheckCircle, XCircle, Clock, RefreshCw, 
  Activity, Database, Globe, AlertTriangle, Eye,
  Play, Pause, Settings, BarChart3
} from 'lucide-react';

import { OSINTSourceConfig } from '../../src/services/taranis/taranis-unified-service';

interface SourceTesterProps {
  sources: OSINTSourceConfig[];
  onTestSource: (source: OSINTSourceConfig) => Promise<any>;
  onUpdateSource: (sourceId: string, updates: Partial<OSINTSourceConfig>) => Promise<void>;
  isLoading: boolean;
}

interface TestResult {
  sourceId: string;
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface TestMetrics {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  averageResponseTime: number;
  lastTestDate: Date | null;
}

export function SourceTester({ sources, onTestSource, onUpdateSource, isLoading }: SourceTesterProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [testMetrics, setTestMetrics] = useState<TestMetrics>({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    averageResponseTime: 0,
    lastTestDate: null
  });

  // Tester une source individuelle
  const testSingleSource = useCallback(async (source: OSINTSourceConfig) => {
    const sourceId = source.id;
    
    // Marquer comme en cours
    setRunningTests(prev => new Set([...prev, sourceId]));
    setTestResults(prev => [
      ...prev.filter(r => r.sourceId !== sourceId),
      {
        sourceId,
        success: false,
        message: 'Test en cours...',
        status: 'running',
        timestamp: new Date()
      }
    ]);

    try {
      const result = await onTestSource(source);
      
      const testResult: TestResult = {
        sourceId,
        success: result.success,
        message: result.message,
        responseTime: result.responseTime,
        data: result.data,
        error: result.error,
        timestamp: new Date(),
        status: result.success ? 'completed' : 'failed'
      };

      setTestResults(prev => [
        ...prev.filter(r => r.sourceId !== sourceId),
        testResult
      ]);

      // Mettre à jour les métriques
      updateTestMetrics(testResult);

    } catch (error) {
      const testResult: TestResult = {
        sourceId,
        success: false,
        message: 'Erreur lors du test',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        status: 'failed'
      };

      setTestResults(prev => [
        ...prev.filter(r => r.sourceId !== sourceId),
        testResult
      ]);

      updateTestMetrics(testResult);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
    }
  }, [onTestSource]);

  // Tester toutes les sources
  const testAllSources = useCallback(async () => {
    const enabledSources = sources.filter(s => s.enabled);
    
    for (const source of enabledSources) {
      await testSingleSource(source);
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [sources, testSingleSource]);

  // Mettre à jour les métriques
  const updateTestMetrics = useCallback((result: TestResult) => {
    setTestMetrics(prev => {
      const newMetrics = { ...prev };
      newMetrics.totalTests += 1;
      
      if (result.success) {
        newMetrics.successfulTests += 1;
      } else {
        newMetrics.failedTests += 1;
      }
      
      if (result.responseTime) {
        const totalTime = (prev.averageResponseTime * (prev.totalTests - 1)) + result.responseTime;
        newMetrics.averageResponseTime = totalTime / newMetrics.totalTests;
      }
      
      newMetrics.lastTestDate = result.timestamp;
      
      return newMetrics;
    });
  }, []);

  // Obtenir le résultat d'une source
  const getSourceTestResult = (sourceId: string): TestResult | undefined => {
    return testResults.find(r => r.sourceId === sourceId);
  };

  // Obtenir le statut d'une source
  const getSourceStatus = (source: OSINTSourceConfig) => {
    const result = getSourceTestResult(source.id);
    const isRunning = runningTests.has(source.id);
    
    if (isRunning) return 'running';
    if (!result) return 'untested';
    return result.success ? 'success' : 'error';
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métriques de test */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Total</p>
                <p className="text-2xl font-bold">{testMetrics.totalTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Succès</p>
                <p className="text-2xl font-bold text-green-600">{testMetrics.successfulTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Échecs</p>
                <p className="text-2xl font-bold text-red-600">{testMetrics.failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps Moyen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {testMetrics.averageResponseTime.toFixed(0)}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Tests de Connectivité
          </CardTitle>
          <CardDescription>
            Testez la connectivité et la collecte de vos sources CTI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={testAllSources}
              disabled={isLoading || sources.filter(s => s.enabled).length === 0}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Tester Toutes les Sources
            </Button>
            
            <div className="text-sm text-gray-500">
              {sources.filter(s => s.enabled).length} sources actives disponibles
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des sources avec résultats de test */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats des Tests</CardTitle>
          <CardDescription>
            Statut et résultats des tests pour chaque source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => {
              const status = getSourceStatus(source);
              const result = getSourceTestResult(source.id);
              const isRunning = runningTests.has(source.id);
              
              return (
                <div key={source.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <div>
                          <h4 className="font-medium">{source.name}</h4>
                          <p className="text-sm text-gray-500">{source.type}</p>
                        </div>
                      </div>
                      
                      <Badge className={getStatusBadgeColor(status)}>
                        {status === 'running' && 'En cours'}
                        {status === 'success' && 'Succès'}
                        {status === 'error' && 'Échec'}
                        {status === 'untested' && 'Non testé'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSingleSource(source)}
                        disabled={isRunning}
                      >
                        {isRunning ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        {isRunning ? 'Test...' : 'Tester'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSource(
                          selectedSource === source.id ? null : source.id
                        )}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Détails du résultat */}
                  {result && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Message:</span>
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.message}
                        </span>
                      </div>
                      
                      {result.responseTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Temps de réponse:</span>
                          <span>{result.responseTime}ms</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Testé le:</span>
                        <span>{result.timestamp.toLocaleString()}</span>
                      </div>
                      
                      {result.error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Détails étendus */}
                  {selectedSource === source.id && (
                    <div className="border-t pt-3 space-y-2">
                      <h5 className="font-medium text-sm">Configuration de la source:</h5>
                      <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                        <div><strong>URL:</strong> {source.url || 'N/A'}</div>
                        <div><strong>Activée:</strong> {source.enabled ? 'Oui' : 'Non'}</div>
                        <div><strong>Groupe:</strong> {source.groupId || 'Aucun'}</div>
                        {source.parameters && Object.keys(source.parameters).length > 0 && (
                          <div>
                            <strong>Paramètres:</strong>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border">
                              {JSON.stringify(source.parameters, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {sources.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune source configurée</p>
                <p className="text-sm">Créez des sources dans l'onglet Configuration pour les tester</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations et alertes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.filter(r => !r.success).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {testResults.filter(r => !r.success).length} source(s) ont échoué au test. 
                  Vérifiez la configuration et la connectivité.
                </AlertDescription>
              </Alert>
            )}
            
            {testMetrics.successfulTests > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {testMetrics.successfulTests} source(s) fonctionnent correctement. 
                  Vous pouvez activer la collecte automatique.
                </AlertDescription>
              </Alert>
            )}
            
            {testMetrics.averageResponseTime > 5000 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Temps de réponse moyen élevé ({testMetrics.averageResponseTime.toFixed(0)}ms). 
                  Considérez optimiser vos sources ou augmenter les timeouts.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
