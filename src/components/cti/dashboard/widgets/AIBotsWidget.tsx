import { useQuery } from '@tanstack/react-query';
import { Bot, Check, X, Sparkles, Zap, Brain, Target } from 'lucide-react';

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
            <h3 className="text-xl font-bold text-white">🤖 AI Bots</h3>
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
            <h3 className="text-xl font-bold text-white">🤖 AI Bots</h3>
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

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-6 shadow-xl hover:border-purple-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        
        {/* Status indicator */}
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

      {/* Bots List */}
      <div className="space-y-2">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className={`group relative flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r ${getBotColor(bot.type)} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Bot Icon */}
              <div className={`p-2 rounded-lg ${bot.enabled ? 'bg-white/10' : 'bg-slate-800/50'}`}>
                {getBotIcon(bot.type)}
              </div>
              
              {/* Bot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {getBotShortName(bot.name)}
                  </h4>
                  {bot.enabled && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {bot.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              bot.enabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {bot.enabled ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  <span>Off</span>
                </>
              )}
            </div>

            {/* Hover Tooltip */}
            {bot.description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-purple-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                <p className="text-xs text-slate-300">
                  {bot.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{disabledCount}</div>
            <div className="text-xs text-slate-400">Inactive</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Taranis AI Engine</span>
          <span>Auto-refresh: 2 min</span>
        </div>
      </div>

      {/* Capabilities Note */}
      <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-slate-400">
          <span className="text-purple-400 font-semibold">💡 Capabilities:</span> IOC extraction, 
          summarization, NLP tagging, clustering, sentiment analysis, classification
        </p>
      </div>
    </div>
  );
};

