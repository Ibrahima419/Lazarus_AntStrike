/**
 * CTI Sidebar - Navigation dédiée pour la Plateforme CTI
 * Sidebar spécialisée pour tous les modules de Cyber Threat Intelligence
 */

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Activity, Search, Network, Globe, Database, Brain, FileText,
  Shield, Target, Users, Zap, Eye, Settings, TrendingUp,
  ChevronRight, ChevronDown, Star, Clock, AlertTriangle
} from 'lucide-react';

interface CTISidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  activeSubModule?: string;
  setActiveSubModule?: (subModule: string) => void;
}

interface CTIModule {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  subModules?: CTISubModule[];
  isNew?: boolean;
  isBeta?: boolean;
  stats?: {
    value: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

interface CTISubModule {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  isNew?: boolean;
}

export function CTISidebar({ 
  activeModule, 
  setActiveModule, 
  activeSubModule, 
  setActiveSubModule 
}: CTISidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['overview', 'sources']));

  // Modules CTI principaux
  const ctiModules: CTIModule[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Vue d\'ensemble de la plateforme CTI',
      stats: { value: 127, trend: 'up' }
    },
    {
      id: 'investigation',
      label: 'Investigation',
      icon: Search,
      description: 'Outils d\'investigation et de corrélation',
      subModules: [
        {
          id: 'stories',
          label: 'Stories Builder',
          icon: FileText,
          description: 'Construction de scénarios de menaces'
        },
        {
          id: 'correlation',
          label: 'Correlation Engine',
          icon: Network,
          description: 'Moteur de corrélation automatique',
          isNew: true
        }
      ]
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: Network,
      description: 'Gestion des IOCs et campagnes',
      subModules: [
        {
          id: 'iocs',
          label: 'IOCs Manager',
          icon: Target,
          description: 'Gestion des indicateurs de compromission'
        },
        {
          id: 'campaigns',
          label: 'Campaigns Tracker',
          icon: Users,
          description: 'Suivi des campagnes de menaces'
        },
        {
          id: 'correlation',
          label: 'Correlation Engine',
          icon: Network,
          description: 'Analyse et corrélation des données'
        }
      ]
    },
    {
      id: 'osint',
      label: 'OSINT',
      icon: Globe,
      description: 'Collecte et analyse OSINT',
      stats: { value: 45, trend: 'up' }
    },
    {
      id: 'sources',
      label: 'Sources',
      icon: Database,
      description: 'Ingestion de sources personnalisées',
      isNew: true,
      stats: { value: 12, trend: 'stable' },
      subModules: [
        {
          id: 'upload',
          label: 'Upload Files',
          icon: FileText,
          description: 'Téléchargement de fichiers de données'
        },
        {
          id: 'configure',
          label: 'Configuration',
          icon: Settings,
          description: 'Configuration de sources personnalisées'
        },
        {
          id: 'test',
          label: 'Test & Validation',
          icon: Eye,
          description: 'Tests de connectivité et validation'
        },
        {
          id: 'manage',
          label: 'Gestion',
          icon: Database,
          description: 'Gestion des sources existantes'
        }
      ]
    },
    {
      id: 'bots',
      label: 'AI Bots',
      icon: Brain,
      description: 'Gestion des bots d\'intelligence artificielle',
      stats: { value: 8, trend: 'up' }
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Génération de rapports CTI',
      stats: { value: 23, trend: 'stable' }
    },
    {
      id: 'visualization',
      label: 'Visualization',
      icon: TrendingUp,
      description: 'Cartographie des menaces',
      isBeta: true
    }
  ];

  // Toggle l'expansion d'un module
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="w-72 bg-card border-r border-border h-full flex flex-col">
      {/* En-tête CTI */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">CTI Platform</h2>
            <p className="text-sm text-muted-foreground">Enterprise Threat Intelligence</p>
          </div>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Sources</p>
                <p className="text-lg font-bold text-blue-700">12</p>
              </div>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Active</p>
                <p className="text-lg font-bold text-green-700">8</p>
              </div>
              <Activity className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des modules */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {ctiModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            const isExpanded = expandedModules.has(module.id);
            const hasSubModules = module.subModules && module.subModules.length > 0;

            return (
              <div key={module.id}>
                {/* Module principal */}
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => {
                    setActiveModule(module.id);
                    if (hasSubModules) {
                      toggleModule(module.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{module.label}</span>
                        {module.isNew && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            New
                          </Badge>
                        )}
                        {module.isBeta && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Beta
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {module.stats && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{module.stats.value}</span>
                        {getTrendIcon(module.stats.trend)}
                      </div>
                    )}
                    {hasSubModules && (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </Button>

                {/* Sous-modules */}
                {hasSubModules && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {module.subModules?.map((subModule) => {
                      const SubIcon = subModule.icon;
                      const isSubActive = activeSubModule === subModule.id;

                      return (
                        <Button
                          key={subModule.id}
                          variant={isSubActive ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start gap-2 h-auto p-2"
                          onClick={() => {
                            setActiveSubModule?.(subModule.id);
                            setActiveModule(module.id);
                          }}
                        >
                          <SubIcon className="w-3 h-3" />
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{subModule.label}</span>
                              {subModule.isNew && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {subModule.description}
                            </p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Actions rapides */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground px-2">Actions Rapides</h4>
          
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Zap className="w-4 h-4" />
            Test Toutes Sources
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Clock className="w-4 h-4" />
            Collecte Manuelle
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertes Actives
          </Button>
        </div>
      </nav>

      {/* Footer avec statut */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>CTI Platform Online</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
