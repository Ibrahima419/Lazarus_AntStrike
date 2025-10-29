/**
 * 🎯 CVE Intelligence Widget - CVE search, stats et enrichissement
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState } from 'react';
import { 
  Search, 
  Download, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useCVEStats, useCVESearch, useImportRecentCVEs, useEnrichCVE } from '../../../../hooks/use-cve';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { StatsCard } from '../../../../../components/cti/base/StatsCard';
import { toast } from 'sonner';

interface CVEIntelligenceWidgetProps {
  className?: string;
}

export function CVEIntelligenceWidget({ className = '' }: CVEIntelligenceWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  
  const { data: stats, isLoading: statsLoading } = useCVEStats();
  const { data: searchResults, isLoading: searchLoading } = useCVESearch(
    searchQuery ? { query: searchQuery, severity: selectedSeverity as any } : undefined
  );
  const importRecentCVEs = useImportRecentCVEs();
  const enrichCVE = useEnrichCVE();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.warning('⚠️ Veuillez saisir un terme de recherche');
      return;
    }
    // Search is triggered automatically by the hook
  };

  const handleImportRecent = async () => {
    try {
      await importRecentCVEs.mutateAsync(50);
      toast.success('✅ Import récent réussi', {
        description: '50 CVEs récents importés'
      });
    } catch (error: any) {
      toast.error('❌ Import échoué', {
        description: error.response?.data?.error?.message || 'Une erreur est survenue'
      });
    }
  };

  const handleEnrichCVE = async (cveId: string) => {
    try {
      await enrichCVE.mutateAsync(cveId);
      toast.success('✅ CVE enrichi', {
        description: `CVE ${cveId} enrichi avec succès`
      });
    } catch (error: any) {
      toast.error('❌ Enrichissement échoué', {
        description: error.response?.data?.error?.message || 'Une erreur est survenue'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-600/20';
      case 'HIGH': return 'text-orange-400 bg-orange-600/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-600/20';
      case 'LOW': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH': return <Shield className="w-4 h-4" />;
      case 'MEDIUM': return <TrendingUp className="w-4 h-4" />;
      case 'LOW': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">CVE Intelligence</h3>
            <p className="text-sm text-slate-400">
              {stats?.data?.totalCVEs || 0} CVEs • {stats?.data?.enrichmentRate || 0}% enrichis
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleImportRecent}
          disabled={importRecentCVEs.isPending}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          {importRecentCVEs.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="ml-2">Import 50 récents</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Total CVEs"
          value={stats?.data?.totalCVEs?.toLocaleString() || '0'}
          trend={`+${stats?.data?.cvesLast24h || 0}`}
          color="orange"
          loading={statsLoading}
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="24h"
          value={stats?.data?.cvesLast24h?.toLocaleString() || '0'}
          trend={`+${stats?.data?.cvesLast7d || 0}`}
          color="red"
          loading={statsLoading}
        />
        <StatsCard
          icon={<Shield className="w-5 h-5" />}
          label="7 jours"
          value={stats?.data?.cvesLast7d?.toLocaleString() || '0'}
          trend={`+${stats?.data?.cvesLast30d || 0}`}
          color="yellow"
          loading={statsLoading}
        />
        <StatsCard
          icon={<Zap className="w-5 h-5" />}
          label="Enrichis"
          value={stats?.data?.enrichedCVEs?.toLocaleString() || '0'}
          trend={`${stats?.data?.enrichmentRate || 0}%`}
          color="green"
          loading={statsLoading}
        />
      </div>

      {/* Search Section */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Recherche CVE</h4>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par CVE ID, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm"
          >
            <option value="">Toutes sévérités</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          
          <Button
            onClick={handleSearch}
            disabled={searchLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {searchLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                {searchResults.data.total_count} résultats trouvés
              </span>
              <Badge className="bg-blue-600 text-white">
                Page {searchResults.data.page}
              </Badge>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.data.cves.slice(0, 10).map((cve) => (
                <div
                  key={cve.id}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSeverityColor(cve.severity)} border-0`}>
                        {getSeverityIcon(cve.severity)}
                        <span className="ml-1">{cve.severity}</span>
                      </Badge>
                      <span className="font-mono text-sm text-blue-400">{cve.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!cve.enriched && (
                        <Button
                          onClick={() => handleEnrichCVE(cve.id)}
                          disabled={enrichCVE.isPending}
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Enrichir
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-400 hover:bg-slate-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {cve.summary}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>CVSS: {cve.cvss}</span>
                    <span>{new Date(cve.published).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Severity Distribution */}
      {stats?.data?.cvesBySeverity && (
        <div className="bg-slate-800/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4">Distribution par Sévérité</h4>
          
          <div className="grid grid-cols-4 gap-4">
            {stats.data.cvesBySeverity.map((item) => (
              <div key={item.severity} className="text-center">
                <div className={`text-2xl font-bold mb-1 ${getSeverityColor(item.severity).split(' ')[0]}`}>
                  {item.count.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 capitalize">{item.severity}</div>
                <div className="text-xs text-slate-500">
                  {Math.round((item.count / stats.data.totalCVEs) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Import Info */}
      {stats?.data?.lastImport && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Dernier import:</span>
            <span className="text-white">{new Date(stats.data.lastImport).toLocaleString()}</span>
          </div>
          {stats.data.lastEnrichment && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-400">Dernier enrichissement:</span>
              <span className="text-orange-400">{new Date(stats.data.lastEnrichment).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
