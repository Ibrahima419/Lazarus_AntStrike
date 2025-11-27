import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { taranisDashboardNativeService, TrendingCluster } from '../../../../services/api/taranis-dashboard-native.service';

interface TrendingTag {
  name: string;
  size: number;
}

interface TagTypeCluster {
  name: string; // tag_type
  size: number;
  tags: TrendingTag[];
}

export const TrendingThreatsWidget = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending-clusters'],
    queryFn: async () => {
      return await taranisDashboardNativeService.getTrendingClusters({ days: 30 });
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
            <h3 className="text-xl font-bold text-white">Trending Threats</h3>
            <p className="text-sm text-red-400">Error loading data</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const tagTypes = (data?.data as any)?.items || (Array.isArray(data?.data) ? data.data : []);

  // Prepare data for charts
  const topTags = tagTypes
    .flatMap((type: TagTypeCluster) => (type.tags || []).map((tag: TrendingTag) => ({ ...tag, category: type.name })))
    .sort((a: { size: number }, b: { size: number }) => b.size - a.size)
    .slice(0, 10);

  const categoryBarData = tagTypes.map((type: TagTypeCluster) => ({
    name: type.name,
    value: type.size,
    tagsCount: type.tags?.length || 0,
    fill: type.name === 'cves' ? '#ef4444' : type.name === 'Location' ? '#3b82f6' : type.name === 'Organization' ? '#8b5cf6' : '#10b981'
  }));

  const topTagsBarData = topTags.map((tag: TrendingTag & { category: string }, idx: number) => ({
    name: tag.name.length > 15 ? tag.name.substring(0, 15) + '...' : tag.name,
    value: tag.size,
    category: tag.category,
    fill: idx % 2 === 0 ? '#ef4444' : '#f59e0b'
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4'];

  return (
    <div className="space-y-6">
      

      {/* Charts Grid */}
        {tagTypes.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-slate-400 text-lg">No trending threats in the last 30 days</p>
            <p className="text-sm text-slate-500 mt-2">This is a good sign! 🎉</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400" />
              Distribution par Catégorie
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9ca3af"
                  fontSize={11}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'tagsCount') return [`${value} tags`, 'Tags'];
                    return [value, 'Total'];
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Total Stories" radius={[0, 8, 8, 0]}>
                  {categoryBarData.map((entry: { fill: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
              </div>
              
          {/* Top Tags Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Top 10 Menaces
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTagsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, payload: any) => [
                    `${value} stories`,
                    payload?.[0]?.payload?.category || 'Unknown'
                  ]}
                />
                <Bar dataKey="value" name="Stories" radius={[8, 8, 0, 0]}>
                  {topTagsBarData.map((entry: { fill: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
              </div>
            </div>
        )}

      
    </div>
  );
};

