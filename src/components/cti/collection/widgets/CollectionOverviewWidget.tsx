/**
 * 🚀 Collection Overview Widget - Dashboard principal
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState } from 'react';
import { 
  Database, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  RefreshCw
} from 'lucide-react';
import { useCollectionSummary, useTriggerCollection } from '../../../../hooks/use-collection';
import { StatsCard } from '../../../../../components/cti/base/StatsCard';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { toast } from 'sonner';

interface CollectionOverviewWidgetProps {
  className?: string;
}

export function CollectionOverviewWidget({ className = '' }: CollectionOverviewWidgetProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const summary = useCollectionSummary();
  const triggerCollection = useTriggerCollection();

  const handleTriggerCollection = async (sources?: string[]) => {
    setIsTriggering(true);
    try {
      await triggerCollection.mutateAsync(sources ? { sources } : undefined);
      toast.success('🚀 Collection déclenchée avec succès !', {
        description: `${summary.totalItems} items collectés au total`
      });
    } catch (error: any) {
      toast.error('❌ Erreur lors du déclenchement', {
        description: error.response?.data?.error?.message || 'Une erreur est survenue'
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertCircle className="w-4 h-4" />;
      case 'unhealthy': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Collection Hub</h3>
            <p className="text-sm text-slate-400">
              {summary.sourcesCount} sources • {summary.overallHealth} • {summary.successRate}% succès
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getHealthColor(summary.overallHealth)} bg-slate-800 border-slate-700`}>
            {getHealthIcon(summary.overallHealth)}
            <span className="ml-1 capitalize">{summary.overallHealth}</span>
          </Badge>
          
          <Button
            onClick={() => handleTriggerCollection()}
            disabled={isTriggering}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {isTriggering ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="ml-2">Collecte Complète</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={<Database className="w-5 h-5" />}
          label="Total Items"
          value={summary.totalItems.toLocaleString()}
          trend={`+${summary.itemsLast24h}`}
          color="blue"
          loading={false}
        />
        <StatsCard
          icon={<Activity className="w-5 h-5" />}
          label="24h"
          value={summary.itemsLast24h.toLocaleString()}
          trend={`+${summary.itemsLast7d}`}
          color="green"
          loading={false}
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="7 jours"
          value={summary.itemsLast7d.toLocaleString()}
          trend={`+${summary.itemsLast30d}`}
          color="purple"
          loading={false}
        />
        <StatsCard
          icon={<Clock className="w-5 h-5" />}
          label="30 jours"
          value={summary.itemsLast30d.toLocaleString()}
          trend={`${summary.successRate}%`}
          color="orange"
          loading={false}
        />
      </div>

      {/* Queue Status */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Queue Status</h4>
          <Badge className="bg-slate-700 text-slate-300">
            Temps réel
          </Badge>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.queueWaiting}</div>
            <div className="text-sm text-slate-400">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{summary.queueActive}</div>
            <div className="text-sm text-slate-400">Actif</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{summary.queueCompleted}</div>
            <div className="text-sm text-slate-400">Complété</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{summary.queueFailed}</div>
            <div className="text-sm text-slate-400">Échoué</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{summary.queueTotal}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleTriggerCollection(['taranis'])}
          disabled={isTriggering}
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
        >
          <Play className="w-4 h-4 mr-2" />
          Taranis
        </Button>
        
        <Button
          onClick={() => handleTriggerCollection(['cve'])}
          disabled={isTriggering}
          variant="outline"
          size="sm"
          className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
        >
          <Play className="w-4 h-4 mr-2" />
          CVE
        </Button>
        
        <Button
          onClick={() => handleTriggerCollection(['stix'])}
          disabled={isTriggering}
          variant="outline"
          size="sm"
          className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
        >
          <Play className="w-4 h-4 mr-2" />
          STIX
        </Button>
        
        <Button
          onClick={() => handleTriggerCollection(['darkweb'])}
          disabled={isTriggering}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-400 hover:bg-gray-600/20"
        >
          <Play className="w-4 h-4 mr-2" />
          Dark Web
        </Button>
      </div>

      {/* Last Collection Info */}
      {summary.lastCollection && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Dernière collecte:</span>
            <span className="text-white">{new Date(summary.lastCollection).toLocaleString()}</span>
          </div>
          {summary.nextScheduled && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-400">Prochaine:</span>
              <span className="text-blue-400">{new Date(summary.nextScheduled).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
