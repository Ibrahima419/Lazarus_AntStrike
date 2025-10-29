import { useQuery } from '@tanstack/react-query';
import { Shield, Search, AlertTriangle, ExternalLink } from 'lucide-react';

interface IOC {
  id: string;
  iocValue: string;
  iocType: string;
  source: string;
  confidence: number;
  threatLevel: string;
  createdAt: string;
  enrichedData?: {
    reputation?: string;
    country?: string;
    asn?: string;
    malware?: string[];
  };
}

interface IOCsResponse {
  success: boolean;
  data: IOC[];
}

export const IOCAnalysisWidget = () => {
  const { data, isLoading, error } = useQuery<IOCsResponse>({
    queryKey: ['enriched-iocs'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/iocs?limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch IOCs');
      }
      
      return response.json();
    },
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-16 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
            <p className="text-sm text-red-400">Error loading IOCs</p>
          </div>
        </div>
      </div>
    );
  }

  const iocs = data?.data || [];

  const getIOCIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ip': return '🌐';
      case 'domain': return '🔗';
      case 'url': return '🔗';
      case 'hash': return '🔐';
      case 'email': return '📧';
      default: return '🎯';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl hover:border-orange-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
            <p className="text-xs text-slate-400">{iocs.length} enriched IOCs</p>
          </div>
        </div>
        <button className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-colors">
          <Search className="w-4 h-4 text-orange-400" />
        </button>
      </div>

      {/* IOCs List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {iocs.length === 0 ? (
          <div className="text-center py-6">
            <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No IOCs enriched yet</p>
            <p className="text-xs text-slate-500 mt-1">IOCs will appear here after enrichment</p>
          </div>
        ) : (
          iocs.map((ioc) => (
            <div
              key={ioc.id}
              className="group p-3 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* IOC Icon */}
                <div className="text-xl mt-0.5">{getIOCIcon(ioc.iocType)}</div>
                
                {/* IOC Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                      {ioc.iocValue}
                    </h4>
                    {ioc.threatLevel && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getThreatLevelColor(ioc.threatLevel)}`}>
                        {ioc.threatLevel}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="uppercase font-medium">{ioc.iocType}</span>
                    {ioc.confidence !== undefined && (
                      <>
                        <span>•</span>
                        <span>Confidence: {ioc.confidence}%</span>
                      </>
                    )}
                    {ioc.source && (
                      <>
                        <span>•</span>
                        <span>{ioc.source}</span>
                      </>
                    )}
                  </div>

                  {/* Enriched Data */}
                  {ioc.enrichedData && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ioc.enrichedData.country && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {ioc.enrichedData.country}
                        </span>
                      )}
                      {ioc.enrichedData.asn && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          AS{ioc.enrichedData.asn}
                        </span>
                      )}
                      {ioc.enrichedData.malware && ioc.enrichedData.malware.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                          {ioc.enrichedData.malware.length} malware
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Threat Intelligence</span>
          <button className="text-orange-400 hover:text-orange-300 transition-colors">
            Enrich IOC →
          </button>
        </div>
      </div>
    </div>
  );
};
