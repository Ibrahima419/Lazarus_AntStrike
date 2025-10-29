import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp } from 'lucide-react';

interface TrendingTag {
  name: string;
  size: number;
}

interface TagTypeCluster {
  name: string; // tag_type
  size: number;
  tags: TrendingTag[];
}

interface TrendingClustersResponse {
  success: boolean;
  data: {
    items: TagTypeCluster[];
  };
}

export const TrendingThreatsWidget = () => {
  const { data, isLoading, error } = useQuery<TrendingClustersResponse>({
    queryKey: ['trending-clusters'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/dashboard/trending-clusters?days=30`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending clusters');
      }
      
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">🔥 Trending Threats</h3>
            <p className="text-sm text-slate-400">Last 30 days</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="flex gap-2 flex-wrap">
              <div className="h-8 bg-slate-700 rounded w-20"></div>
              <div className="h-8 bg-slate-700 rounded w-24"></div>
              <div className="h-8 bg-slate-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">🔥 Trending Threats</h3>
            <p className="text-sm text-red-400">Error loading data</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const tagTypes = data?.data?.items || [];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl hover:border-cyan-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">🔥 Trending Threats</h3>
            <p className="text-sm text-slate-400">Last 30 days • AI-Detected</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400 font-semibold">
            {tagTypes.reduce((acc, type) => acc + (type.tags?.length || 0), 0)} trends
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {tagTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No trending threats in the last 30 days</p>
            <p className="text-sm text-slate-500 mt-2">This is a good sign! 🎉</p>
          </div>
        ) : (
          tagTypes.map((tagType) => (
            <div key={tagType.name}>
              {/* Tag Type Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  {tagType.name}
                </h4>
                <span className="text-xs text-slate-500">({tagType.size} total)</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tagType.tags?.slice(0, 10).map((tag, idx) => (
                  <div
                    key={`${tag.name}-${idx}`}
                    className="group relative px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {tag.name}
                      </span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                        {tag.size}
                      </span>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-cyan-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <p className="text-xs text-slate-300">
                        {tag.size} stories mentioning "{tag.name}"
                      </p>
                    </div>
                  </div>
                ))}
                
                {tagType.tags && tagType.tags.length > 10 && (
                  <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-400">
                      +{tagType.tags.length - 10} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Powered by Taranis AI • Story Clustering</span>
          <span>Auto-refresh: 5 min</span>
        </div>
      </div>
    </div>
  );
};

