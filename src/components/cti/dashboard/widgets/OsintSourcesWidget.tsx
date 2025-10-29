import { useQuery } from '@tanstack/react-query';
import { Globe, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface OsintSource {
  id: string;
  name: string;
  state: string;
  last_collected: string | null;
  last_error_message: string | null;
}

interface OsintSourcesResponse {
  success: boolean;
  data: {
    items: OsintSource[];
    total_count: number;
  };
}

export const OsintSourcesWidget = () => {
  const { data, isLoading, error } = useQuery<OsintSourcesResponse>({
    queryKey: ['osint-sources-list'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/assess/osint-sources-list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch OSINT sources');
      }
      
      return response.json();
    },
    refetchInterval: 60000, // Refresh every 1 minute
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 shadow-xl"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              <div className="h-8 bg-slate-700 rounded w-1/3"></div>
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h4 className="text-white font-semibold">Error loading OSINT sources</h4>
            <p className="text-sm text-red-400">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sources = data?.data?.items || [];
  const totalSources = sources.length;
  const activeCount = sources.filter(s => s.state === 'enabled').length;
  const errorCount = sources.filter(s => s.last_error_message && s.last_error_message.trim() !== '').length;
  const healthyCount = sources.filter(s => s.state === 'enabled' && (!s.last_error_message || s.last_error_message.trim() === '')).length;

  // Calculate uptime percentage
  const uptimePercent = totalSources > 0 ? Math.round((healthyCount / totalSources) * 100) : 0;

  // Get last collection time
  const lastCollectionTimes = sources
    .filter(s => s.last_collected)
    .map(s => new Date(s.last_collected!).getTime());
  const mostRecentCollection = lastCollectionTimes.length > 0
    ? new Date(Math.max(...lastCollectionTimes))
    : null;

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Sources Card */}
      <div className="group bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl hover:border-cyan-400/50 hover:shadow-cyan-500/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{totalSources}</p>
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Total Sources</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Globe className="w-4 h-4" />
          <span>OSINT Data Feeds</span>
        </div>
        
        {mostRecentCollection && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Last: {formatTimeSince(mostRecentCollection)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Sources Card */}
      <div className="group bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-green-500/30 p-6 shadow-xl hover:border-green-400/50 hover:shadow-green-500/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-white">{activeCount}</p>
              <p className="text-lg text-slate-400">/{totalSources}</p>
            </div>
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Active</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Uptime</span>
          <span className={`font-bold ${uptimePercent >= 90 ? 'text-green-400' : uptimePercent >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
            {uptimePercent}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              uptimePercent >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
              uptimePercent >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
              'bg-gradient-to-r from-red-500 to-orange-400'
            }`}
            style={{ width: `${uptimePercent}%` }}
          ></div>
        </div>
      </div>

      {/* Errors Card */}
      <div className="group bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl hover:border-red-400/50 hover:shadow-red-500/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
            {errorCount === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{errorCount}</p>
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Errors</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {errorCount === 0 ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">All Healthy</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold">Check Logs</span>
            </>
          )}
        </div>
        
        {errorCount > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View Error Details →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

