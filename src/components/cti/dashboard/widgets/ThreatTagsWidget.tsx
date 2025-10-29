import { useQuery } from '@tanstack/react-query';
import { Tags, Hash } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  tag_type: string;
  color: string | null;
}

interface TagsResponse {
  success: boolean;
  data: {
    items: Tag[];
    total_count: number;
  };
}

export const ThreatTagsWidget = () => {
  const { data, isLoading, error } = useQuery<TagsResponse>({
    queryKey: ['threat-tags'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/assess/tags?limit=30`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      return response.json();
    },
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-violet-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Tags className="w-6 h-6 text-violet-500" />
          <h3 className="text-lg font-bold text-white">🏷️ Threat Tags</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-7 w-20 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Tags className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-white">🏷️ Threat Tags</h3>
            <p className="text-sm text-red-400">Error loading</p>
          </div>
        </div>
      </div>
    );
  }

  const tags = data?.data?.items || [];
  
  // Group tags by type
  const tagsByType = tags.reduce((acc, tag) => {
    const type = tag.tag_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const getTagColor = (index: number) => {
    const colors = [
      'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
      'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20',
      'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
      'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20',
      'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20',
      'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20',
      'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
      'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-violet-500/30 p-6 shadow-xl hover:border-violet-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Tags className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🏷️ Threat Tags</h3>
            <p className="text-xs text-slate-400">{tags.length} active tags • {Object.keys(tagsByType).length} types</p>
          </div>
        </div>
      </div>

      {/* Tags by Type */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.keys(tagsByType).length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No tags available</p>
          </div>
        ) : (
          Object.entries(tagsByType).slice(0, 5).map(([type, typeTags]) => (
            <div key={type}>
              {/* Type Header */}
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  {type}
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent"></div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {typeTags.slice(0, 8).map((tag, idx) => (
                  <button
                    key={tag.id}
                    className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all duration-300 ${getTagColor(idx)}`}
                  >
                    {tag.name}
                  </button>
                ))}
                
                {typeTags.length > 8 && (
                  <span className="px-3 py-1 text-xs text-slate-500">
                    +{typeTags.length - 8} more
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>AI-Generated Tags</span>
          <button className="text-violet-400 hover:text-violet-300 transition-colors">
            View All →
          </button>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

