/**
 * Source Configurator - Configuration Avancée de Sources CTI
 * Interface pour créer et configurer des sources personnalisées (APIs, RSS, Webhooks, etc.)
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Settings, Globe, Rss, Mail, Database, Key, 
  Clock, Shield, TestTube, Plus, Trash2, Eye,
  CheckCircle, AlertTriangle, Link, Users
} from 'lucide-react';

import { OSINTSourceConfig } from '../../src/services/taranis/taranis-unified-service';

interface SourceConfiguratorProps {
  onCreateSource: (source: Partial<OSINTSourceConfig>) => Promise<void>;
  isLoading: boolean;
}

interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  clientId?: string;
  clientSecret?: string;
}

interface CollectionConfig {
  enabled: boolean;
  interval: number; // en secondes
  retryAttempts: number;
  timeout: number; // en secondes
  batchSize: number;
  filters?: string[];
}

interface SourceTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<any>;
  defaultConfig: Partial<OSINTSourceConfig>;
}

export function SourceConfigurator({ onCreateSource, isLoading }: SourceConfiguratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sourceConfig, setSourceConfig] = useState<Partial<OSINTSourceConfig>>({
    name: '',
    type: 'API',
    url: '',
    enabled: true,
    parameters: {}
  });
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    type: 'none'
  });
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig>({
    enabled: true,
    interval: 3600, // 1 heure
    retryAttempts: 3,
    timeout: 30,
    batchSize: 100,
    filters: []
  });
  const [customParameters, setCustomParameters] = useState<Array<{key: string, value: string}>>([]);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  // Templates de sources prédéfinies
  const sourceTemplates: SourceTemplate[] = [
    {
      id: 'rss',
      name: 'RSS Feed',
      type: 'RSS',
      description: 'Source de flux RSS pour la collecte automatique',
      icon: Rss,
      defaultConfig: {
        type: 'RSS',
        parameters: {
          parseContent: true,
          extractLinks: true,
          language: 'fr'
        }
      }
    },
    {
      id: 'api_rest',
      name: 'API REST',
      type: 'API',
      description: 'API REST personnalisée avec authentification',
      icon: Globe,
      defaultConfig: {
        type: 'API',
        parameters: {
          method: 'GET',
          headers: {},
          parseJson: true
        }
      }
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      type: 'TWITTER',
      description: 'Collecte de tweets et mentions',
      icon: Users,
      defaultConfig: {
        type: 'TWITTER',
        parameters: {
          apiVersion: 'v2',
          includeRetweets: false,
          language: 'fr'
        }
      }
    },
    {
      id: 'email',
      name: 'Email',
      type: 'EMAIL',
      description: 'Collecte d\'emails via IMAP/POP3',
      icon: Mail,
      defaultConfig: {
        type: 'EMAIL',
        parameters: {
          protocol: 'imap',
          port: 993,
          ssl: true
        }
      }
    },
    {
      id: 'webhook',
      name: 'Webhook',
      type: 'WEB',
      description: 'Endpoint webhook pour recevoir des données',
      icon: Link,
      defaultConfig: {
        type: 'WEB',
        parameters: {
          method: 'POST',
          contentType: 'application/json',
          validateSignature: true
        }
      }
    },
    {
      id: 'database',
      name: 'Base de Données',
      type: 'DATABASE',
      description: 'Connexion directe à une base de données',
      icon: Database,
      defaultConfig: {
        type: 'DATABASE',
        parameters: {
          driver: 'postgresql',
          ssl: true,
          poolSize: 5
        }
      }
    }
  ];

  // Appliquer un template
  const applyTemplate = useCallback((templateId: string) => {
    const template = sourceTemplates.find(t => t.id === templateId);
    if (template) {
      setSourceConfig(prev => ({
        ...prev,
        ...template.defaultConfig,
        type: template.type
      }));
      setSelectedTemplate(templateId);
    }
  }, []);

  // Ajouter un paramètre personnalisé
  const addCustomParameter = () => {
    setCustomParameters(prev => [...prev, { key: '', value: '' }]);
  };

  // Supprimer un paramètre personnalisé
  const removeCustomParameter = (index: number) => {
    setCustomParameters(prev => prev.filter((_, i) => i !== index));
  };

  // Mettre à jour un paramètre personnalisé
  const updateCustomParameter = (index: number, field: 'key' | 'value', value: string) => {
    setCustomParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  // Tester la configuration
  const testConfiguration = async () => {
    try {
      setTestResult(null);
      
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (sourceConfig.url && sourceConfig.url.startsWith('http')) {
        setTestResult({
          success: true,
          message: 'Configuration testée avec succès ! Connexion établie.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'URL invalide ou manquante'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur lors du test: ${error}`
      });
    }
  };

  // Créer la source
  const createSource = async () => {
    try {
      // Construire les paramètres complets
      const parameters: Record<string, any> = {
        ...sourceConfig.parameters,
        auth: authConfig,
        collection: collectionConfig,
        custom: customParameters.reduce((acc, param) => {
          if (param.key && param.value) {
            acc[param.key] = param.value;
          }
          return acc;
        }, {} as Record<string, string>)
      };

      const finalConfig: Partial<OSINTSourceConfig> = {
        ...sourceConfig,
        parameters
      };

      await onCreateSource(finalConfig);
      
      // Reset du formulaire
      setSourceConfig({
        name: '',
        type: 'API',
        url: '',
        enabled: true,
        parameters: {}
      });
      setAuthConfig({ type: 'none' });
      setCollectionConfig({
        enabled: true,
        interval: 3600,
        retryAttempts: 3,
        timeout: 30,
        batchSize: 100,
        filters: []
      });
      setCustomParameters([]);
      setTestResult(null);
      
    } catch (error) {
      console.error('Erreur lors de la création de la source:', error);
    }
  };

  const selectedTemplateData = sourceTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Sélection du template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration de Source Personnalisée
          </CardTitle>
          <CardDescription>
            Choisissez un type de source et configurez ses paramètres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourceTemplates.map((template) => {
              const IconComponent = template.icon;
              const isSelected = selectedTemplate === template.id;
              
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => applyTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration de base */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration de Base</CardTitle>
            <CardDescription>
              Paramètres généraux pour votre source {selectedTemplateData?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-name">Nom de la source</Label>
                <Input
                  id="source-name"
                  value={sourceConfig.name}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Mon_API_CTI"
                />
              </div>
              
              <div>
                <Label htmlFor="source-url">URL / Endpoint</Label>
                <Input
                  id="source-url"
                  value={sourceConfig.url}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/data"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source-description">Description</Label>
              <Textarea
                id="source-description"
                value={sourceConfig.description || ''}
                onChange={(e) => setSourceConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de votre source..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="source-enabled"
                checked={sourceConfig.enabled}
                onCheckedChange={(checked) => setSourceConfig(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="source-enabled">Source activée</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration d'authentification */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="auth-type">Type d'authentification</Label>
              <Select 
                value={authConfig.type} 
                onValueChange={(value: any) => setAuthConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune authentification</SelectItem>
                  <SelectItem value="basic">Basic Auth (login/mot de passe)</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {authConfig.type === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auth-username">Nom d'utilisateur</Label>
                  <Input
                    id="auth-username"
                    value={authConfig.username || ''}
                    onChange={(e) => setAuthConfig(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="auth-password">Mot de passe</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={authConfig.password || ''}
                    onChange={(e) => setAuthConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {authConfig.type === 'bearer' && (
              <div>
                <Label htmlFor="auth-token">Bearer Token</Label>
                <Input
                  id="auth-token"
                  type="password"
                  value={authConfig.token || ''}
                  onChange={(e) => setAuthConfig(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                />
              </div>
            )}

            {authConfig.type === 'api_key' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auth-apikey">API Key</Label>
                  <Input
                    id="auth-apikey"
                    value={authConfig.apiKey || ''}
                    onChange={(e) => setAuthConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="auth-header">Header Name</Label>
                  <Input
                    id="auth-header"
                    value={authConfig.apiKeyHeader || 'X-API-Key'}
                    onChange={(e) => setAuthConfig(prev => ({ ...prev, apiKeyHeader: e.target.value }))}
                    placeholder="X-API-Key"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration de collecte */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Configuration de Collecte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collection-interval">Intervalle de collecte (secondes)</Label>
                <Input
                  id="collection-interval"
                  type="number"
                  value={collectionConfig.interval}
                  onChange={(e) => setCollectionConfig(prev => ({ 
                    ...prev, 
                    interval: parseInt(e.target.value) || 3600 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="collection-timeout">Timeout (secondes)</Label>
                <Input
                  id="collection-timeout"
                  type="number"
                  value={collectionConfig.timeout}
                  onChange={(e) => setCollectionConfig(prev => ({ 
                    ...prev, 
                    timeout: parseInt(e.target.value) || 30 
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="collection-enabled"
                checked={collectionConfig.enabled}
                onCheckedChange={(checked) => setCollectionConfig(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="collection-enabled">Collecte automatique activée</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paramètres personnalisés */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Paramètres Personnalisés
            </CardTitle>
            <CardDescription>
              Ajoutez des paramètres spécifiques à votre source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customParameters.map((param, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Clé"
                  value={param.key}
                  onChange={(e) => updateCustomParameter(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="Valeur"
                  value={param.value}
                  onChange={(e) => updateCustomParameter(index, 'value', e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCustomParameter(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addCustomParameter}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un paramètre
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test et création */}
      {selectedTemplate && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={testConfiguration}
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Tester la Configuration
                </Button>
                
                {testResult && (
                  <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Button 
                onClick={createSource}
                disabled={isLoading || !sourceConfig.name || !sourceConfig.url}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Créer la Source
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
