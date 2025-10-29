import { useQuery } from '@tanstack/react-query';
import { FileText, ExternalLink, Tag, Clock } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  created: string;
  relevance: number;
  read: boolean;
  important: boolean;
  in_reports_count: number;
}

interface StoriesResponse {
  success: boolean;
  data: {
    items: Story[];
    total_count: number;
  };
}

export const LatestStoriesWidget = () => {
  const { data, isLoading, error } = useQuery<StoriesResponse>({
    queryKey: ['latest-stories'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/assess/stories?limit=10&sort=DATE_DESC`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      return response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-blue-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-white">📖 Latest Threats</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-xl font-bold text-white">📖 Latest Threats</h3>
            <p className="text-sm text-red-400">Error loading stories</p>
          </div>
        </div>
      </div>
    );
  }

  const stories = data?.data?.items || [];
  const totalCount = data?.data?.total_count || 0;

  const getSeverityColor = (relevance: number) => {
    if (relevance >= 4) return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (relevance >= 3) return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    if (relevance >= 2) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-blue-500/30 p-6 shadow-xl hover:border-blue-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">📖 Latest Threats</h3>
            <p className="text-sm text-slate-400">From OSINT Sources • {totalCount} total</p>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {stories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No stories available</p>
          </div>
        ) : (
          stories.map((story) => (
            <div
              key={story.id}
              className="group p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all duration-300 cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                  {story.title}
                </h4>
                
                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {story.important && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">
                      IMPORTANT
                    </span>
                  )}
                  
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getSeverityColor(story.relevance)}`}>
                    R{story.relevance}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(story.created)}</span>
                </div>
                
                {story.in_reports_count > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{story.in_reports_count} reports</span>
                  </div>
                )}
                
                {!story.read && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                    NEW
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  View Details
                </button>
                <span className="text-slate-600">•</span>
                <button className="text-xs text-green-400 hover:text-green-300 transition-colors">
                  Create Case
                </button>
                <span className="text-slate-600">•</span>
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Enrich with AI
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Taranis AI • OSINT Aggregation</span>
          <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
            View All ({totalCount}) →
          </button>
        </div>
      </div>
    </div>
  );
};

