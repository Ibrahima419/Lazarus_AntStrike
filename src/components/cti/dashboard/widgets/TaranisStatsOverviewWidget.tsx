import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Database, Zap } from 'lucide-react';

interface DashboardData {
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
      
      // Fetch multiple endpoints and combine
      const [storiesRes, newsRes, reportItemsRes, productsRes] = await Promise.all([
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
      
      const stories = await storiesRes.json();
      const news = await newsRes.json();
      const reportItems = await reportItemsRes.json();
      const products = await productsRes.json();
      
      return {
        success: true,
        data: {
          stories_count: stories.data?.total_count || 0,
          news_items_count: news.data?.total_count || 0,
          report_items_count: reportItems.data?.total_count || 0,
          products_count: products.data?.total_count || 0
        }
      };
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1
  });

  const stats = data?.data || {
    stories_count: 0,
    news_items_count: 0,
    report_items_count: 0,
    products_count: 0
  };

  const statCards = [
    {
      label: 'Stories',
      value: stats.stories_count,
      icon: Database,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-blue-500/20',
      trend: '+12%'
    },
    {
      label: 'News Items',
      value: stats.news_items_count,
      icon: TrendingUp,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      iconBg: 'bg-indigo-500/20',
      trend: '+8%'
    },
    {
      label: 'Report Items',
      value: stats.report_items_count,
      icon: BarChart3,
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/20',
      trend: '+5'
    },
    {
      label: 'Products',
      value: stats.products_count,
      icon: Zap,
      color: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',
      iconBg: 'bg-orange-500/20',
      trend: 'New'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Trend */}
          <div className="text-xs font-semibold opacity-70">
            {stat.trend}
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
};

