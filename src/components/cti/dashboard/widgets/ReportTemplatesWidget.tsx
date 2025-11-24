import { useQuery } from '@tanstack/react-query';
import { FileType, Layers, Plus, Shield, Lock, Globe, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ReportType {
  id: number;
  title: string;
  description: string;
  attribute_groups_count: number;
}

interface ReportTypesResponse {
  success: boolean;
  data: {
    items: ReportType[];
    total_count: number;
  };
}

export const ReportTemplatesWidget = () => {
  const { data, isLoading, error } = useQuery<ReportTypesResponse>({
    queryKey: ['report-types'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/taranis/analyze/report-types`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch report types');
      }
      
      return response.json();
    },
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-emerald-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FileType className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-bold text-white">Report Templates</h3>
        </div>
        <div className="space-y-2">
          {[1, 2].map(i => (
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
          <FileType className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-white">📋 Report Templates</h3>
            <p className="text-sm text-red-400">Error loading</p>
          </div>
        </div>
      </div>
    );
  }

  const templates = data?.data?.items || [];

  // Prepare data for charts
  const templatesBarData = templates.map(template => ({
    name: template.title.length > 20 ? template.title.substring(0, 20) + '...' : template.title,
    sections: template.attribute_groups_count || 0,
    fill: template.title.includes('CERT') ? '#ef4444' : 
          template.title.includes('Vulnerability') ? '#f59e0b' : 
          template.title.includes('OSINT') ? '#3b82f6' : 
          template.title.includes('Disinformation') ? '#8b5cf6' : '#10b981'
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4'];

  // Fonction pour créer un rapport
  const handleCreateReport = async (template: ReportType) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Appel à l'API pour générer un rapport
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'ON_DEMAND',
            format: 'HTML',
            period: 'last_30_days',
            sendEmail: false
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      
      toast.success(`✅ Rapport "${template.title}" généré avec succès !`);
      
      // Ouvrir le rapport HTML dans un nouvel onglet
      if (result.content) {
        const blob = new Blob([result.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Nettoyer l'URL après un délai
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error(`❌ Erreur lors de la génération du rapport "${template.title}"`);
    }
  };

  const getTemplateIcon = (title: string) => {
    if (title.includes('CERT')) return <Shield className="w-5 h-5 text-red-400" />;
    if (title.includes('Vulnerability')) return <Lock className="w-5 h-5 text-orange-400" />;
    if (title.includes('OSINT')) return <Globe className="w-5 h-5 text-blue-400" />;
    if (title.includes('Disinformation')) return <Newspaper className="w-5 h-5 text-purple-400" />;
    return <FileType className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-emerald-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileType className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Templates</h3>
              <p className="text-xs text-slate-400">{templates.length} professional templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {templates.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-sm text-slate-400">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sections Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-emerald-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Sections par Template
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={templatesBarData} layout="vertical">
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
                <Bar dataKey="sections" name="Sections" radius={[0, 8, 8, 0]}>
                  {templatesBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Templates Distribution Pie Chart */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileType className="w-5 h-5 text-cyan-400" />
              Distribution des Templates
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={templatesBarData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const shortName = name.length > 15 ? name.substring(0, 15) + '...' : name;
                    return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sections"
                >
                  {templatesBarData.map((entry, index) => (
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
        </div>
      )}

      {/* Templates List (Compact) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Liste des Templates</h3>
        <div className="space-y-2">
          {templates.slice(0, 5).map((template) => (
            <div
              key={template.id}
              className="group p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getTemplateIcon(template.title)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Layers className="w-3 h-3" />
                    <span>{template.attribute_groups_count} sections</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCreateReport(template)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg"
                  title={`Générer un rapport ${template.title}`}
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Standardized Formats</span>
          <button 
            onClick={() => {
              if (templates.length > 0) {
                handleCreateReport(templates[0]);
              } else {
                toast.info('Aucun template disponible');
              }
            }}
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Create Report →
          </button>
        </div>
      </div>
    </div>
  );
};

