import { useQuery } from '@tanstack/react-query';
import { Bot, Check, X, Sparkles, Zap, Brain, Target } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AIBot {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
}

interface AIBotsResponse {
  success: boolean;
  data: {
    items: AIBot[];
    total_count: number;
  };
}

const getBotIcon = (botType: string) => {
  switch (botType) {
    case 'ioc_bot':
      return <Target className="w-4 h-4" />;
    case 'summary_bot':
      return <Sparkles className="w-4 h-4" />;
    case 'nlp_bot':
      return <Brain className="w-4 h-4" />;
    case 'story_bot':
      return <Zap className="w-4 h-4" />;
    default:
      return <Bot className="w-4 h-4" />;
  }
};

const getBotColor = (botType: string) => {
  switch (botType) {
    case 'ioc_bot':
      return 'from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400';
    case 'summary_bot':
      return 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400';
    case 'nlp_bot':
      return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400';
    case 'story_bot':
      return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-400';
    case 'sentiment_analysis_bot':
      return 'from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-400';
    case 'wordlist_bot':
      return 'from-indigo-500/10 to-violet-500/10 border-indigo-500/30 text-indigo-400';
    case 'cybersec_classifier_bot':
      return 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400';
    default:
      return 'from-slate-500/10 to-slate-600/10 border-slate-500/30 text-slate-400';
  }
};

const getBotShortName = (name: string) => {
  // Shorten long names
  if (name.length > 20) {
    return name.substring(0, 18) + '...';
  }
  return name;
};

export const AIBotsWidget = () => {
  const { data, isLoading, error } = useQuery<AIBotsResponse>({
    queryKey: ['taranis-bots'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/config/bots`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI bots');
      }
      
      return response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Bot className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Bots</h3>
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Bot className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Bots</h3>
            <p className="text-sm text-red-400">Error loading data</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const bots = data?.data?.items || [];
  const totalBots = bots.length;
  const enabledCount = bots.filter(b => b.enabled).length;
  const disabledCount = totalBots - enabledCount;

  // Prepare data for charts
  const statusPieData = [
    { name: 'Enabled', value: enabledCount, fill: '#10b981' },
    { name: 'Disabled', value: disabledCount, fill: '#6b7280' },
  ];

  // Group by type
  const typeCounts = bots.reduce((acc: Record<string, number>, bot) => {
    const type = bot.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeBarData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').substring(0, 20),
    value,
    enabled: bots.filter(b => b.type === name && b.enabled).length,
    fill: name.includes('ioc') ? '#ef4444' : name.includes('summary') ? '#8b5cf6' : name.includes('nlp') ? '#3b82f6' : '#10b981'
  }));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bot className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🤖 AI Bots</h3>
              <p className="text-sm text-slate-400">
                {enabledCount}/{totalBots} active • Auto-enrichment
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-lg border ${
              enabledCount === totalBots 
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : enabledCount > 0
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span className="text-sm font-semibold">
                {enabledCount === totalBots ? 'All Active' : enabledCount > 0 ? 'Partial' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Statut des Bots
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusPieData.map((entry, index) => (
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

        {/* Type Distribution Bar Chart */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Distribution par Type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
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
                formatter={(value: any, name: string) => {
                  if (name === 'enabled') return [`${value} enabled`, 'Enabled'];
                  return [value, 'Total'];
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Total" radius={[8, 8, 0, 0]}>
                {typeBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar dataKey="enabled" name="Enabled" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bots List (Compact) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Liste des Bots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {bots.slice(0, 8).map((bot) => (
            <div
              key={bot.id}
              className={`group relative flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r ${getBotColor(bot.type)} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${bot.enabled ? 'bg-white/10' : 'bg-slate-800/50'}`}>
                  {getBotIcon(bot.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {getBotShortName(bot.name)}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {bot.type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              {bot.enabled ? (
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
              ) : (
                <div className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded-lg">
                  <X className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

