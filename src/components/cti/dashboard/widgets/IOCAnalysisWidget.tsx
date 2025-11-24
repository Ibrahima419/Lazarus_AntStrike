import { useQuery } from '@tanstack/react-query';
import { Shield, Search, AlertTriangle, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface IOC {
  id: string;
  iocValue: string;
  iocType: string;
  source: string;
  confidence: number;
  threatLevel: string;
  createdAt: string;
  enrichedData?: {
    reputation?: string;
    country?: string;
    asn?: string;
    malware?: string[];
  };
}

interface IOCsResponse {
  success: boolean;
  data: IOC[];
}

export const IOCAnalysisWidget = () => {
  const { data, isLoading, error } = useQuery<IOCsResponse>({
    queryKey: ['enriched-iocs'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/iocs?limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch IOCs');
      }
      
      return response.json();
    },
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
        </div>
        <div className="space-y-2">
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
          <Shield className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
            <p className="text-sm text-red-400">Error loading IOCs</p>
          </div>
        </div>
      </div>
    );
  }

  const iocs = data?.data || [];

  const getIOCIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ip': return '🌐';
      case 'domain': return '🔗';
      case 'url': return '🔗';
      case 'hash': return '🔐';
      case 'email': return '📧';
      default: return '🎯';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Prepare data for charts
  const typeCounts = iocs.reduce((acc: Record<string, number>, ioc) => {
    const type = ioc.iocType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typePieData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    fill: name.includes('ip') ? '#3b82f6' : name.includes('domain') ? '#8b5cf6' : name.includes('hash') ? '#ef4444' : '#10b981'
  }));

  const threatLevelCounts = iocs.reduce((acc: Record<string, number>, ioc) => {
    const level = ioc.threatLevel || 'unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const threatBarData = Object.entries(threatLevelCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    fill: name === 'high' ? '#ef4444' : name === 'medium' ? '#f59e0b' : '#10b981'
  }));

  const topIOCs = iocs
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 10)
    .map(ioc => ({
      name: ioc.iocValue.length > 20 ? ioc.iocValue.substring(0, 20) + '...' : ioc.iocValue,
      confidence: ioc.confidence || 0,
      type: ioc.iocType
    }));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">🎯 IOC Analysis</h3>
              <p className="text-xs text-slate-400">{iocs.length} enriched IOCs</p>
            </div>
          </div>
          <button className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-colors">
            <Search className="w-4 h-4 text-orange-400" />
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      {iocs.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No IOCs enriched yet</p>
          <p className="text-xs text-slate-500 mt-1">IOCs will appear here after enrichment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type Distribution Pie Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-400" />
              Distribution par Type
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typePieData.map((entry, index) => (
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

          {/* Threat Level Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Niveau de Menace
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={threatBarData}>
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
                <Bar dataKey="value" name="IOCs" radius={[8, 8, 0, 0]}>
                  {threatBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top IOCs Confidence Chart */}
      {iocs.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Top 10 IOCs par Confiance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topIOCs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
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
                formatter={(value: any) => [`${value}%`, 'Confidence']}
              />
              <Bar dataKey="confidence" name="Confidence %" radius={[0, 8, 8, 0]} fill="#06b6d4">
                {topIOCs.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.confidence >= 80 ? '#10b981' : entry.confidence >= 50 ? '#f59e0b' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Threat Intelligence</span>
          <button className="text-orange-400 hover:text-orange-300 transition-colors">
            Enrich IOC →
          </button>
        </div>
      </div>
    </div>
  );
};
