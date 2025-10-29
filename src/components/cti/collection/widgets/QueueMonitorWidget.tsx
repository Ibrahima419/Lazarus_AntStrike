/**
 * 📊 Queue Monitor Widget - Monitor BullMQ en temps réel
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { useQueueStatus } from '../../../../hooks/use-collection';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Progress } from '../../../../../components/ui/progress';
import { toast } from 'sonner';

interface QueueMonitorWidgetProps {
  className?: string;
}

export function QueueMonitorWidget({ className = '' }: QueueMonitorWidgetProps) {
  const { data: queue, isLoading, refetch } = useQueueStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('🔄 Queue actualisée', {
        description: 'Données mises à jour'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTotalJobs = () => {
    if (!queue?.data) return 0;
    return queue.data.waiting + queue.data.active + queue.data.completed + queue.data.failed;
  };

  const getProgressPercentage = () => {
    const total = getTotalJobs();
    if (total === 0) return 0;
    return Math.round((queue?.data?.completed / total) * 100);
  };

  const getQueueStatus = () => {
    if (!queue?.data) return 'unknown';
    if (queue.data.active > 0) return 'active';
    if (queue.data.failed > 0) return 'failed';
    if (queue.data.waiting > 0) return 'waiting';
    return 'idle';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'waiting': return 'text-yellow-400';
      case 'idle': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'idle': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded mb-4"></div>
          <div className="h-32 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const queueData = queue?.data;
  const status = getQueueStatus();
  const totalJobs = getTotalJobs();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Queue Monitor</h3>
            <p className="text-sm text-slate-400">
              BullMQ • Temps réel • {totalJobs} jobs total
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(status)} bg-slate-800 border-slate-700`}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
          
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-400 hover:bg-slate-700"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Progression globale</span>
          <span className="text-sm text-white font-semibold">{progressPercentage}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-slate-800"
        />
        <div className="text-xs text-slate-500 mt-1">
          {queueData?.completed || 0} complétés sur {totalJobs} total
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {queueData?.waiting || 0}
          </div>
          <div className="text-sm text-slate-400">En attente</div>
          <div className="text-xs text-slate-500 mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Prêt à traiter
          </div>
        </div>
        
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {queueData?.active || 0}
          </div>
          <div className="text-sm text-slate-400">Actif</div>
          <div className="text-xs text-slate-500 mt-1">
            <Activity className="w-3 h-3 inline mr-1" />
            En cours
          </div>
        </div>
        
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {queueData?.completed || 0}
          </div>
          <div className="text-sm text-slate-400">Complété</div>
          <div className="text-xs text-slate-500 mt-1">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Terminé
          </div>
        </div>
        
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {queueData?.failed || 0}
          </div>
          <div className="text-sm text-slate-400">Échoué</div>
          <div className="text-xs text-slate-500 mt-1">
            <XCircle className="w-3 h-3 inline mr-1" />
            Erreur
          </div>
        </div>
      </div>

      {/* Queue Health */}
      <div className="bg-slate-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Queue Health</h4>
          <Badge className="bg-green-600 text-white">
            {queueData?.delayed || 0} delayed
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Taux de succès</div>
            <div className="text-2xl font-bold text-green-400">
              {totalJobs > 0 ? Math.round(((queueData?.completed || 0) / totalJobs) * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Taux d'échec</div>
            <div className="text-2xl font-bold text-red-400">
              {totalJobs > 0 ? Math.round(((queueData?.failed || 0) / totalJobs) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Mise à jour automatique toutes les 5 secondes</span>
        </div>
      </div>
    </div>
  );
}
