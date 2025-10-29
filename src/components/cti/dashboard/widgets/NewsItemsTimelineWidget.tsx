import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, Link as LinkIcon, Tag } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  collected: string;
  published: string;
  osint_source: {
    name: string;
  };
  link: string;
}

interface NewsItemsResponse {
  success: boolean;
  data: {
    items: NewsItem[];
    total_count: number;
  };
}

export const NewsItemsTimelineWidget = () => {
  const { data, isLoading, error } = useQuery<NewsItemsResponse>({
    queryKey: ['news-items-timeline'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/assess/news-items?limit=15&sort=COLLECTED_DESC`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news items');
      }
      
      return response.json();
    },
    refetchInterval: 180000, // Refresh every 3 minutes
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Newspaper className="w-6 h-6 text-indigo-500" />
          <h3 className="text-xl font-bold text-white">📰 OSINT News Feed</h3>
        </div>
        <div className="space-y-3">
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
          <Newspaper className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-xl font-bold text-white">📰 OSINT News Feed</h3>
            <p className="text-sm text-red-400">Error loading news</p>
          </div>
        </div>
      </div>
    );
  }

  const newsItems = data?.data?.items || [];
  const totalCount = data?.data?.total_count || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-xl hover:border-indigo-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Newspaper className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">📰 OSINT News Feed</h3>
            <p className="text-sm text-slate-400">Latest articles • {totalCount} today</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {newsItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No news items available</p>
          </div>
        ) : (
          newsItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative flex gap-4 p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 rounded-lg transition-all duration-300"
            >
              {/* Timeline Dot */}
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                {index < newsItems.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-500/50 to-transparent mt-1"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h4>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.collected)}</span>
                  </div>
                  
                  <span className="text-slate-600">•</span>
                  
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{item.osint_source?.name || 'Unknown'}</span>
                  </div>
                </div>

                {/* Link */}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Open Source</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Real-time OSINT Collection</span>
          <span>Auto-refresh: 3 min</span>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

