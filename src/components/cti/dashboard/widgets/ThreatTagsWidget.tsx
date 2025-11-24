import { useQuery } from '@tanstack/react-query';
import { Tags, Hash } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { taranisService } from '../../../../services/api/taranis.service';

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
      // Récupérer toutes les données en utilisant la pagination
      let allTags: Tag[] = [];
      let offset = 0;
      const limit = 100; // Limite par page
      let totalCount = 0;
      let hasMore = true;

      // Premier appel pour obtenir le total_count
      const firstResponse = await taranisService.getTags({
        limit,
        offset: 0
      });

      if (firstResponse.success && firstResponse.data?.items) {
        allTags = [...firstResponse.data.items];
        totalCount = firstResponse.data.total_count || firstResponse.data.items.length;
        
        // Si on a déjà tout récupéré, on retourne
        if (allTags.length >= totalCount || firstResponse.data.items.length < limit) {
          return {
            success: true,
            data: {
              items: allTags,
              total_count: totalCount
            }
          };
        }

        // Sinon, on continue avec la pagination
        offset = limit;
        hasMore = allTags.length < totalCount;
      } else {
        return {
          success: false,
          data: {
            items: [],
            total_count: 0
          }
        };
      }

      // Récupérer les pages suivantes
      while (hasMore) {
        const response = await taranisService.getTags({
          limit,
          offset
        });

        if (response.success && response.data?.items) {
          allTags = [...allTags, ...response.data.items];
          
          // Vérifier si on a tout récupéré
          if (allTags.length >= totalCount || response.data.items.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } else {
          hasMore = false;
        }
      }

      return {
        success: true,
        data: {
          items: allTags,
          total_count: totalCount || allTags.length
        }
      };
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

  // Prepare data for charts
  const typeBarData = Object.entries(tagsByType).map(([type, typeTags]) => ({
    name: type.length > 15 ? type.substring(0, 15) + '...' : type,
    value: typeTags.length,
    fill: type === 'Location' ? '#3b82f6' : type === 'Organization' ? '#8b5cf6' : type === 'Product' ? '#10b981' : '#f59e0b'
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-violet-500/30 p-6 shadow-xl">
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
      </div>

      {/* Charts */}
      {Object.keys(tagsByType).length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-sm text-slate-400">No tags available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-violet-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-violet-400" />
              Distribution par Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" name="Tags" radius={[8, 8, 0, 0]}>
                  {typeBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Types Pie Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tags className="w-5 h-5 text-indigo-400" />
              Top Types de Tags
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeBarData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeBarData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>AI-Generated Tags</span>
          <button className="text-violet-400 hover:text-violet-300 transition-colors">
            View All →
          </button>
        </div>
      </div>
    </div>
  );
};

