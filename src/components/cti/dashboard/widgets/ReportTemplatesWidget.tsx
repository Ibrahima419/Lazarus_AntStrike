import { useQuery } from '@tanstack/react-query';
import { FileType, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
          <h3 className="text-lg font-bold text-white">📋 Report Templates</h3>
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
    if (title.includes('CERT')) return '🛡️';
    if (title.includes('Vulnerability')) return '🔒';
    if (title.includes('OSINT')) return '🌐';
    if (title.includes('Disinformation')) return '📰';
    return '📋';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-emerald-500/30 p-6 shadow-xl hover:border-emerald-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <FileType className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">📋 Report Templates</h3>
            <p className="text-xs text-slate-400">{templates.length} professional templates</p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-2">
        {templates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No templates available</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="group p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl mt-0.5">{getTemplateIcon(template.title)}</div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {template.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Layers className="w-3 h-3" />
                    <span>{template.attribute_groups_count} sections</span>
                  </div>
                </div>

                {/* Use Button */}
                <button 
                  onClick={() => handleCreateReport(template)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg"
                  title={`Générer un rapport ${template.title}`}
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
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

