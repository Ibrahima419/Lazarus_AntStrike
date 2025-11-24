import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, Link as LinkIcon, Tag } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  // Prepare data for charts
  const sourceCounts = newsItems.reduce((acc: Record<string, number>, item) => {
    const source = item.osint_source?.name || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const sourceBarData = Object.entries(sourceCounts)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value,
      fill: '#6366f1'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Time series data (last 24 hours by hour)
  const now = Date.now();
  const hoursAgo = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now - i * 60 * 60 * 1000);
    return hour.toISOString().split('T')[0] + 'T' + String(hour.getHours()).padStart(2, '0');
  }).reverse();

  const timeSeriesData = hoursAgo.map(hourStr => {
    const hour = new Date(hourStr);
    const count = newsItems.filter(item => {
      const itemDate = new Date(item.collected);
      return itemDate.getHours() === hour.getHours() && 
             itemDate.toDateString() === hour.toDateString();
    }).length;
    return {
      time: hour.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      count
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
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
      </div>

      {/* Charts Grid */}
      {newsItems.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-slate-400">No news items available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Series Line Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Activité (24 dernières heures)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={10}
                  interval="preserveStartEnd"
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
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  name="News Items"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Source Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-cyan-400" />
              Top Sources OSINT
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9ca3af"
                  fontSize={10}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" name="Articles" radius={[0, 8, 8, 0]} fill="#06b6d4">
                  {sourceBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Real-time OSINT Collection</span>
          <span>Auto-refresh: 3 min</span>
        </div>
      </div>
    </div>
  );
};

