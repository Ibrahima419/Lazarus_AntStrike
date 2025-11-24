import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Database, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardData {
  total_threats: number;
  stories_count: number;
  news_items_count: number;
  report_items_count: number;
  products_count: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const TaranisStatsOverviewWidget = () => {
  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ['taranis-dashboard-data'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      
      // Fetch dashboard endpoint for total threats and other metrics
      const [dashboardRes, storiesRes, newsRes, reportItemsRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/taranis/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/taranis/assess/stories?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/taranis/assess/news-items?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/taranis/analyze/report-items?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/taranis/publish/products?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);
      
      const dashboard = await dashboardRes.json();
      const stories = await storiesRes.json();
      const news = await newsRes.json();
      const reportItems = await reportItemsRes.json();
      const products = await productsRes.json();
      
      // Extract total threats from dashboard endpoint
      const dashboardData = dashboard.data?.items?.[0] || {};
      const totalThreats = dashboardData.total_story_items || stories.data?.total_count || 0;
      
      return {
        success: true,
        data: {
          total_threats: totalThreats,
          stories_count: stories.data?.total_count || 0,
          news_items_count: dashboardData.total_news_items || news.data?.total_count || 0,
          report_items_count: reportItems.data?.total_count || 0,
          products_count: dashboardData.total_products || products.data?.total_count || 0
        }
      };
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1
  });

  const stats = data?.data || {
    total_threats: 0,
    stories_count: 0,
    news_items_count: 0,
    report_items_count: 0,
    products_count: 0
  };

  const statCards = [
    {
      label: 'Total Menaces',
      value: stats.total_threats,
      icon: BarChart3,
      color: 'from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400',
      iconBg: 'bg-red-500/20',
      
      priority: true
    },
    {
      label: 'Stories',
      value: stats.stories_count,
      icon: Database,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-blue-500/20'
    },
    {
      label: 'News Items',
      value: stats.news_items_count,
      icon: TrendingUp,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      iconBg: 'bg-indigo-500/20'
      
    },
    {
      label: 'Report Items',
      value: stats.report_items_count,
      icon: BarChart3,
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/20',
      
    },
    {
      label: 'Products',
      value: stats.products_count,
      icon: Zap,
      color: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',
      iconBg: 'bg-orange-500/20',
      
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse bg-slate-800 rounded-lg p-4 h-24"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-sm text-red-400">Error loading Taranis stats</p>
      </div>
    );
  }

  // Prepare data for charts
  const barChartData = [
    { name: 'Menaces', value: stats.total_threats, fill: '#ef4444' },
    { name: 'Stories', value: stats.stories_count, fill: '#3b82f6' },
    { name: 'News Items', value: stats.news_items_count, fill: '#8b5cf6' },
    { name: 'Report Items', value: stats.report_items_count, fill: '#10b981' },
    { name: 'Products', value: stats.products_count, fill: '#f97316' },
  ];

  const pieChartData = [
    { name: 'Menaces', value: stats.total_threats },
    { name: 'Stories', value: stats.stories_count },
    { name: 'News Items', value: stats.news_items_count },
    { name: 'Report Items', value: stats.report_items_count },
    { name: 'Products', value: stats.products_count },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Stats Cards - KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`group relative p-4 bg-gradient-to-br ${stat.color} rounded-xl border hover:scale-105 transition-all duration-300 cursor-pointer`}
          >
            {/* Icon */}
            <div className={`${stat.iconBg} p-2 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>

            {/* Value */}
            <div className="mb-1">
              <div className="text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                ) : (
                  stat.value.toLocaleString()
                )}
              </div>
              <div className="text-xs font-medium opacity-80">
                {stat.label}
              </div>
            </div>

           

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Distribution par Type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={{ stroke: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Répartition Globale
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
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
    </div>
  );
};

