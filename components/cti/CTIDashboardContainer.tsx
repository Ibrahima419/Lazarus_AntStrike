/**
 * CTI Dashboard Container - Conteneur principal pour la Plateforme CTI
 * Gère la navigation entre les modules CTI avec sidebar intégrée
 */

import React, { useState } from 'react';
import { CTISidebar } from './CTISidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Activity, Search, Network, Globe, Database, Brain, FileText,
  TrendingUp, Shield, Clock, AlertTriangle
} from 'lucide-react';

// Import des modules CTI
import { ThreatIntelligenceMap } from './ThreatIntelligenceMap';
import { StoriesBuilder } from './StoriesBuilder';
import { OSINTCollector } from './OSINTCollector';
import { BotsDashboardAdvanced } from './BotsDashboardAdvanced';
import { InvestigationFlow } from './InvestigationFlow';
import { CorrelationEngine } from './CorrelationEngine';
import { IOCsManager } from './IOCsManager';
import { CampaignsTracker } from './CampaignsTracker';
import { ReportsBuilder } from './ReportsBuilder';
import { SourceIngestionManager } from './SourceIngestionManager';

interface CTIDashboardContainerProps {
  // Props pour l'intégration avec le dashboard principal si nécessaire
}

export function CTIDashboardContainer({}: CTIDashboardContainerProps) {
  const [activeModule, setActiveModule] = useState('overview');
  const [activeSubModule, setActiveSubModule] = useState<string | undefined>();

  // Rendu du contenu selon le module actif
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* En-tête Overview */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">CTI Platform Overview</h1>
                <p className="text-muted-foreground">
                  Vue d'ensemble de votre plateforme de Cyber Threat Intelligence
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Actif
                </Badge>
                <Badge variant="secondary">v2.1.0</Badge>
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sources Actives</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 depuis la semaine dernière
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IOCs Collectés</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +15% ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bots IA</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    3 en cours d'exécution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rapports Générés</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    +3 cette semaine
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Modules principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThreatIntelligenceMap />
              <StoriesBuilder />
            </div>
          </div>
        );

      case 'investigation':
        switch (activeSubModule) {
          case 'stories':
            return <StoriesBuilder />;
          case 'correlation':
            return <CorrelationEngine />;
          default:
            return <InvestigationFlow />;
        }

      case 'intelligence':
        switch (activeSubModule) {
          case 'iocs':
            return <IOCsManager />;
          case 'campaigns':
            return <CampaignsTracker />;
          case 'correlation':
            return <CorrelationEngine />;
          default:
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IOCsManager />
                  <CampaignsTracker />
                </div>
                <CorrelationEngine />
              </div>
            );
        }

      case 'osint':
        return <OSINTCollector />;

      case 'sources':
        return <SourceIngestionManager />;

      case 'bots':
        return <BotsDashboardAdvanced />;

      case 'reports':
        return <ReportsBuilder />;

      case 'visualization':
        return <ThreatIntelligenceMap />;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Module non trouvé</h3>
              <p className="text-muted-foreground">
                Le module "{activeModule}" n'est pas encore implémenté.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar CTI */}
      <CTISidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        activeSubModule={activeSubModule}
        setActiveSubModule={setActiveSubModule}
      />
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
}
