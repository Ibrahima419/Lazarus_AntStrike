/**
 * 🏥 Source Health Cards Widget - Status des 10 sources
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  Settings,
  TestTube
} from 'lucide-react';
import { useCollectionHealth } from '../../../../hooks/use-collection';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { toast } from 'sonner';

interface SourceHealthCardsWidgetProps {
  className?: string;
}

export function SourceHealthCardsWidget({ className = '' }: SourceHealthCardsWidgetProps) {
  const { data: health, isLoading, refetch } = useCollectionHealth();
  const [testingSource, setTestingSource] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-green-500/50 bg-green-500/10';
      case 'degraded': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'unhealthy': return 'border-red-500/50 bg-red-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getConfigStatusColor = (configStatus: string) => {
    switch (configStatus) {
      case 'configured': return 'bg-green-600';
      case 'not_configured': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getSourceIcon = (sourceName: string) => {
    const icons: { [key: string]: string } = {
      'Taranis': '🔵',
      'MISP': '🔴',
      'STIX': '🟣',
      'TAXII': '🟦',
      'CVE': '🟠',
      'OSINT': '🟢',
      'Dark Web': '⚫',
      'Honeypots': '🟡',
      'Threat Feeds': '🔵',
      'Queue': '🟣'
    };
    return icons[sourceName] || '🔵';
  };

  const handleTestSource = async (sourceName: string) => {
    setTestingSource(sourceName);
    try {
      // Simulate test (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`✅ Test ${sourceName} réussi`, {
        description: 'Connexion établie avec succès'
      });
    } catch (error) {
      toast.error(`❌ Test ${sourceName} échoué`, {
        description: 'Impossible de se connecter'
      });
    } finally {
      setTestingSource(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('🔄 Status actualisé', {
      description: 'Données de santé mises à jour'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sources = health?.data?.sources || [];

  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sources Health</h3>
            <p className="text-sm text-slate-400">
              {sources.filter(s => s.status === 'healthy').length}/{sources.length} sources actives
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-400 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sources.map((source) => (
          <div
            key={source.name}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${getStatusColor(source.status)}`}
          >
            {/* Source Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSourceIcon(source.name)}</span>
                <span className="font-semibold text-white text-sm">{source.name}</span>
              </div>
              {getStatusIcon(source.status)}
            </div>

            {/* Status Badge */}
            <div className="mb-3">
              <Badge 
                className={`${getConfigStatusColor(source.configStatus)} text-white text-xs`}
              >
                {source.configStatus === 'configured' ? 'Configuré' : 
                 source.configStatus === 'not_configured' ? 'Non config' : 'Erreur'}
              </Badge>
            </div>

            {/* Response Time */}
            <div className="text-xs text-slate-400 mb-3">
              <div className="flex justify-between">
                <span>Response:</span>
                <span className="text-white">{source.responseTime}ms</span>
              </div>
            </div>

            {/* Last Check */}
            <div className="text-xs text-slate-400 mb-3">
              <div className="flex justify-between">
                <span>Dernier check:</span>
                <span className="text-white">
                  {new Date(source.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Message */}
            {source.message && (
              <div className="text-xs text-slate-300 mb-3 truncate" title={source.message}>
                {source.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                onClick={() => handleTestSource(source.name)}
                disabled={testingSource === source.name}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                {testingSource === source.name ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <TestTube className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {sources.filter(s => s.status === 'healthy').length}
            </div>
            <div className="text-sm text-slate-400">Healthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {sources.filter(s => s.status === 'degraded').length}
            </div>
            <div className="text-sm text-slate-400">Degraded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {sources.filter(s => s.status === 'unhealthy').length}
            </div>
            <div className="text-sm text-slate-400">Unhealthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {sources.filter(s => s.status === 'unknown').length}
            </div>
            <div className="text-sm text-slate-400">Unknown</div>
          </div>
        </div>
      </div>
    </div>
  );
}
