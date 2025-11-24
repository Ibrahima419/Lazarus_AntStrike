import { useQuery } from '@tanstack/react-query';
import { FileText, ExternalLink, Tag, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  // Prepare data for charts
  const relevanceDistribution = stories.reduce((acc: Record<number, number>, story) => {
    const rel = story.relevance || 0;
    acc[rel] = (acc[rel] || 0) + 1;
    return acc;
  }, {});

  const relevanceBarData = Object.entries(relevanceDistribution).map(([relevance, count]) => ({
    name: `R${relevance}`,
    value: count,
    fill: parseInt(relevance) >= 4 ? '#ef4444' : parseInt(relevance) >= 3 ? '#f59e0b' : parseInt(relevance) >= 2 ? '#eab308' : '#3b82f6'
  }));

  // Time series data (last 7 days)
  const now = Date.now();
  const daysAgo = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }).reverse();

  const timeSeriesData = daysAgo.map(date => {
    const count = stories.filter(s => {
      const storyDate = new Date(s.created).toISOString().split('T')[0];
      return storyDate === date;
    }).length;
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      stories: count,
      important: stories.filter(s => {
        const storyDate = new Date(s.created).toISOString().split('T')[0];
        return storyDate === date && s.important;
      }).length
    };
  });

  const statusData = [
    { name: 'Read', value: stories.filter(s => s.read).length, fill: '#10b981' },
    { name: 'Unread', value: stories.filter(s => !s.read).length, fill: '#3b82f6' },
    { name: 'Important', value: stories.filter(s => s.important).length, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-blue-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
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
      </div>

      {/* Charts Grid */}
      {stories.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-slate-400">No stories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Series Area Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-blue-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Évolution (7 derniers jours)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorImportant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={10}
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
                <Area type="monotone" dataKey="stories" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStories)" name="Stories" />
                <Area type="monotone" dataKey="important" stroke="#ef4444" fillOpacity={1} fill="url(#colorImportant)" name="Important" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Relevance Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-400" />
              Distribution par Pertinence
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={relevanceBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
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
                <Bar dataKey="value" name="Stories" radius={[8, 8, 0, 0]}>
                  {relevanceBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status Pie Chart */}
      {stories.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-green-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Statut des Stories
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
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
      )}

      {/* Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4">
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

