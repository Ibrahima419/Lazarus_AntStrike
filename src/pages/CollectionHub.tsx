/**
 * 🚀 Collection Hub - Page principale du service de collecte
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState } from 'react';
import { 
  Database, 
  Activity, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Settings,
  BarChart3
} from 'lucide-react';

// Widgets
import { CollectionOverviewWidget } from '../components/cti/collection/widgets/CollectionOverviewWidget';
import { SourceHealthCardsWidget } from '../components/cti/collection/widgets/SourceHealthCardsWidget';
import { QueueMonitorWidget } from '../components/cti/collection/widgets/QueueMonitorWidget';
import { CVEIntelligenceWidget } from '../components/cti/collection/widgets/CVEIntelligenceWidget';
import { STIXManagerWidget } from '../components/cti/collection/widgets/STIXManagerWidget';

// Hooks
import { useCollectionSummary } from '../hooks/use-collection';
import { useCVEStats } from '../hooks/use-cve';
import { useSTIXStats } from '../hooks/use-stix';
import { useMISPSummary } from '../hooks/use-misp';
import { useDarkWebSummary } from '../hooks/use-darkweb';
import { useHoneypotSummary } from '../hooks/use-honeypots';

// UI Components
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'sources' | 'queue' | 'stix' | 'cve' | 'misp' | 'darkweb' | 'honeypots';

export function CollectionHub() {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data hooks
  const collectionSummary = useCollectionSummary();
  const cveStats = useCVEStats();
  const stixStats = useSTIXStats();
  const mispSummary = useMISPSummary();
  const darkWebSummary = useDarkWebSummary();
  const honeypotSummary = useHoneypotSummary();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Trigger refresh for all data
      window.location.reload(); // Simple refresh for now
      toast.success('🔄 Données actualisées', {
        description: 'Toutes les données ont été mises à jour'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return '📊 Vue d\'ensemble';
      case 'sources': return '🏥 Santé des Sources';
      case 'queue': return '📋 Monitor Queue';
      case 'stix': return '📦 STIX Manager';
      case 'cve': return '🎯 CVE Intelligence';
      case 'misp': return '🔗 MISP Sync';
      case 'darkweb': return '🌑 Dark Web Monitor';
      case 'honeypots': return '🍯 Honeypots Hub';
      default: return 'Collection Hub';
    }
  };

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'overview':
        return `${collectionSummary.totalItems} items • ${collectionSummary.sourcesCount} sources • ${collectionSummary.successRate}% succès`;
      case 'sources':
        return `${collectionSummary.healthySources}/${collectionSummary.totalSources} sources actives`;
      case 'queue':
        return `${collectionSummary.queueActive} actif • ${collectionSummary.queueWaiting} en attente`;
      case 'stix':
        return `${stixStats.data?.totalBundles || 0} bundles • ${stixStats.data?.totalObjects || 0} objets`;
      case 'cve':
        return `${cveStats.data?.totalCVEs || 0} CVEs • ${cveStats.data?.enrichmentRate || 0}% enrichis`;
      case 'misp':
        return `${mispSummary.totalEvents} événements • ${mispSummary.totalIOCs} IOCs`;
      case 'darkweb':
        return `${darkWebSummary.totalMentions} mentions • ${darkWebSummary.iocsExtracted} IOCs`;
      case 'honeypots':
        return `${honeypotSummary.totalAttacks} attaques • ${honeypotSummary.iocsExtracted} IOCs`;
      default:
        return 'Service de Collecte & Agrégation';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <CollectionOverviewWidget />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SourceHealthCardsWidget />
              <QueueMonitorWidget />
            </div>
          </div>
        );
      
      case 'sources':
        return <SourceHealthCardsWidget />;
      
      case 'queue':
        return <QueueMonitorWidget />;
      
      case 'stix':
        return <STIXManagerWidget />;
      
      case 'cve':
        return <CVEIntelligenceWidget />;
      
      case 'misp':
        return (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="text-center py-12">
              <div className="p-4 bg-red-600/20 rounded-full w-16 h-16 mx-auto mb-4">
                <Database className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">MISP Sync Hub</h3>
              <p className="text-slate-400 mb-4">Configuration et synchronisation MISP</p>
              <Badge className="bg-yellow-600 text-white">En développement</Badge>
            </div>
          </div>
        );
      
      case 'darkweb':
        return (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="text-center py-12">
              <div className="p-4 bg-gray-600/20 rounded-full w-16 h-16 mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dark Web Monitor</h3>
              <p className="text-slate-400 mb-4">Surveillance du dark web et mentions</p>
              <Badge className="bg-yellow-600 text-white">En développement</Badge>
            </div>
          </div>
        );
      
      case 'honeypots':
        return (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-600/20 rounded-full w-16 h-16 mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Honeypots Hub</h3>
              <p className="text-slate-400 mb-4">Intégration et monitoring des honeypots</p>
              <Badge className="bg-yellow-600 text-white">En développement</Badge>
            </div>
          </div>
        );
      
      default:
        return <CollectionOverviewWidget />;
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Collection Hub</h2>
              <p className="text-sm text-slate-400">Service 1</p>
            </div>
          </div>
          
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Actualiser Tout</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'sources', label: 'Santé Sources', icon: Activity },
              { id: 'queue', label: 'Queue Monitor', icon: Clock },
              { id: 'stix', label: 'STIX Manager', icon: Database },
              { id: 'cve', label: 'CVE Intelligence', icon: TrendingUp },
              { id: 'misp', label: 'MISP Sync', icon: Database },
              { id: 'darkweb', label: 'Dark Web', icon: Activity },
              { id: 'honeypots', label: 'Honeypots', icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewMode)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-slate-500 text-center">
            <div>Service de Collecte & Agrégation</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{getViewTitle()}</h1>
              <p className="text-slate-400 mt-1">{getViewSubtitle()}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-white">
                <Activity className="w-3 h-3 mr-1" />
                Temps réel
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
