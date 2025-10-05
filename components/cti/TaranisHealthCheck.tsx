/**
 * Taranis Health Check - Diagnostic du serveur Taranis
 * Aide à identifier les problèmes de connexion API
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Database,
  Network,
  Clock
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface HealthStatus {
  connection: 'ok' | 'error' | 'testing';
  endpoints: EndpointStatus[];
  lastCheck: Date | null;
  serverVersion?: string;
}

interface EndpointStatus {
  name: string;
  endpoint: string;
  status: 'ok' | 'error' | 'testing';
  responseTime?: number;
  errorMessage?: string;
}

export function TaranisHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    connection: 'testing',
    endpoints: [],
    lastCheck: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const service = getTaranisService();

  const runHealthCheck = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    const endpoints: EndpointStatus[] = [
      { name: 'Connection', endpoint: '/api/test', status: 'testing' },
      { name: 'OSINT Sources', endpoint: '/api/config/osint-sources', status: 'testing' },
      { name: 'News Items', endpoint: '/api/assess/news-items', status: 'testing' },
      { name: 'Stories', endpoint: '/api/assess/stories', status: 'testing' },
      { name: 'Reports', endpoint: '/api/assess/reports', status: 'testing' },
      { name: 'Bots', endpoint: '/api/bots', status: 'testing' },
      { name: 'Collection', endpoint: '/api/config/osint-sources/collect', status: 'testing' }
    ];

    setHealth(prev => ({ ...prev, endpoints, connection: 'testing' }));

    let overallStatus: 'ok' | 'error' = 'ok';

    // Test 1: Connection générale
    try {
      const startConn = Date.now();
      const connected = await service.testConnection();
      const connTime = Date.now() - startConn;
      
      endpoints[0] = {
        ...endpoints[0],
        status: connected ? 'ok' : 'error',
        responseTime: connTime,
        errorMessage: connected ? undefined : 'Impossible de se connecter'
      };
    } catch (error) {
      endpoints[0] = {
        ...endpoints[0],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur connexion'
      };
      overallStatus = 'error';
    }

    // Test 2: OSINT Sources
    try {
      const startSources = Date.now();
      await service.getOSINTSources();
      const sourcesTime = Date.now() - startSources;
      
      endpoints[1] = {
        ...endpoints[1],
        status: 'ok',
        responseTime: sourcesTime
      };
    } catch (error) {
      endpoints[1] = {
        ...endpoints[1],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur OSINT sources'
      };
    }

    // Test 3: News Items
    try {
      const startNews = Date.now();
      await service.getNewsItems(10);
      const newsTime = Date.now() - startNews;
      
      endpoints[2] = {
        ...endpoints[2],
        status: 'ok',
        responseTime: newsTime
      };
    } catch (error) {
      endpoints[2] = {
        ...endpoints[2],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur news items'
      };
    }

    // Test 4: Stories
    try {
      const startStories = Date.now();
      await service.getStories();
      const storiesTime = Date.now() - startStories;
      
      endpoints[3] = {
        ...endpoints[3],
        status: 'ok',
        responseTime: storiesTime
      };
    } catch (error) {
      endpoints[3] = {
        ...endpoints[3],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur stories'
      };
    }

    // Test 5: Reports
    try {
      const startReports = Date.now();
      await service.getReports();
      const reportsTime = Date.now() - startReports;
      
      endpoints[4] = {
        ...endpoints[4],
        status: 'ok',
        responseTime: reportsTime
      };
    } catch (error) {
      endpoints[4] = {
        ...endpoints[4],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur reports'
      };
    }

    // Test 6: Bots
    try {
      const startBots = Date.now();
      await service.getBots();
      const botsTime = Date.now() - startBots;
      
      endpoints[5] = {
        ...endpoints[5],
        status: 'ok',
        responseTime: botsTime
      };
    } catch (error) {
      endpoints[5] = {
        ...endpoints[5],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur bots'
      };
    }

    // Test 7: Collection (problématique)
    try {
      const sources = await service.getOSINTSources();
      const testSource = sources.find(s => s.enabled);
      
      if (testSource) {
        const startCollection = Date.now();
        await service.triggerCollection(testSource.id);
        const collectionTime = Date.now() - startCollection;
        
        endpoints[6] = {
          ...endpoints[6],
          status: 'ok',
          responseTime: collectionTime
        };
      } else {
        endpoints[6] = {
          ...endpoints[6],
          status: 'error',
          errorMessage: 'Aucune source active pour tester'
        };
      }
    } catch (error) {
      endpoints[6] = {
        ...endpoints[6],
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur collection - Serveur non disponible'
      };
    }

    // Déterminer status global
    const errorCount = endpoints.filter(e => e.status === 'error').length;
    if (errorCount > 3) overallStatus = 'error';

    setHealth({
      connection: overallStatus,
      endpoints,
      lastCheck: new Date()
    });
    
    setIsChecking(false);
  };

  const getStatusIcon = (status: 'ok' | 'error' | 'testing') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'ok' | 'error' | 'testing') => {
    switch (status) {
      case 'ok':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'testing':
        return 'text-blue-500';
    }
  };

  const healthScore = health.endpoints.length > 0 ? 
    (health.endpoints.filter(e => e.status === 'ok').length / health.endpoints.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnostic Taranis</h2>
          <p className="text-muted-foreground">
            État de santé du serveur Taranis AI
          </p>
        </div>
        <Button onClick={runHealthCheck} disabled={isChecking}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Test en cours...' : 'Tester'}
        </Button>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Health Score</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${getStatusColor(health.connection)}`}>
                  {Math.round(healthScore)}%
                </span>
                <Badge variant={health.connection === 'ok' ? 'default' : 'destructive'}>
                  {health.connection === 'ok' ? 'Sain' : health.connection === 'error' ? 'Problème' : 'Test...'}
                </Badge>
              </div>
              <Progress value={healthScore} className="mt-3 h-2" />
            </div>
            <Server className={`w-16 h-16 ${getStatusColor(health.connection)} opacity-20`} />
          </div>
        </CardContent>
      </Card>

      {/* Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle>État des Endpoints</CardTitle>
          <CardDescription>
            {health.lastCheck && `Dernière vérification : ${health.lastCheck.toLocaleTimeString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {health.endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <p className="font-medium">{endpoint.name}</p>
                    <p className="text-xs text-muted-foreground">{endpoint.endpoint}</p>
                  </div>
                </div>
                <div className="text-right">
                  {endpoint.status === 'ok' && endpoint.responseTime && (
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {endpoint.responseTime}ms
                      </Badge>
                    </div>
                  )}
                  {endpoint.status === 'error' && endpoint.errorMessage && (
                    <div>
                      <Badge variant="destructive" className="text-xs max-w-48 truncate">
                        {endpoint.errorMessage}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {health.connection === 'error' && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Problèmes Détectés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Actions Recommandées :</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Vérifiez que le serveur Taranis est démarré sur localhost:3001</li>
                <li>• Vérifiez votre configuration réseau et firewall</li>
                <li>• Consultez les logs du serveur Taranis</li>
                <li>• Vérifiez les credentials d'authentification</li>
              </ul>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Command de démarrage Taranis :</strong>
              </p>
              <code className="text-xs block mt-1">
                cd taranis && docker-compose up -d
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Ou consultez la documentation Taranis pour votre installation
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Actuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">URL de Base :</span>
              <p className="font-mono">http://localhost:3001</p>
            </div>
            <div>
              <span className="text-muted-foreground">Timeout :</span>
              <p className="font-mono">30000ms</p>
            </div>
            <div>
              <span className="text-muted-foreground">API Version :</span>
              <p className="font-mono">v1</p>
            </div>
            <div>
              <span className="text-muted-foreground">Auth Method :</span>
              <p className="font-mono">Token Bearer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
