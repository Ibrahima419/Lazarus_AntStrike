/**
 * 📦 STIX Manager Widget - Import/Export STIX bundles
 * Design moderne aligné avec SOCAnalystDashboardV2
 */

import { useState, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useSTIXStats, useSTIXBundles, useImportSTIX, useExportSTIX, useValidateSTIX } from '../../../../hooks/use-stix';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { StatsCard } from '../../../../../components/cti/base/StatsCard';
import { toast } from 'sonner';

interface STIXManagerWidgetProps {
  className?: string;
}

export function STIXManagerWidget({ className = '' }: STIXManagerWidgetProps) {
  const [dragActive, setDragActive] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useSTIXStats();
  const { data: bundles, isLoading: bundlesLoading } = useSTIXBundles(10, 0);
  const importSTIX = useImportSTIX();
  const exportSTIX = useExportSTIX();
  const validateSTIX = useValidateSTIX();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await file.text();
      const bundle = JSON.parse(text);
      
      // Validate first
      const validation = await validateSTIX.mutateAsync(bundle);
      
      if (validation.data.isValid) {
        // Import if valid
        await importSTIX.mutateAsync(bundle);
        toast.success('✅ Bundle STIX importé', {
          description: `${validation.data.objectsCount} objets importés`
        });
      } else {
        toast.error('❌ Bundle STIX invalide', {
          description: validation.data.errors.join(', ')
        });
      }
    } catch (error: any) {
      toast.error('❌ Erreur d\'import', {
        description: error.message || 'Format de fichier invalide'
      });
    }
  }, [importSTIX, validateSTIX]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleExport = async () => {
    try {
      const result = await exportSTIX.refetch();
      if (result.data) {
        // Create download link
        const blob = new Blob([JSON.stringify(result.data.data.bundle, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stix-bundle-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('✅ Bundle STIX exporté', {
          description: `${result.data.data.objectsCount} objets exportés`
        });
      }
    } catch (error: any) {
      toast.error('❌ Export échoué', {
        description: error.response?.data?.error?.message || 'Une erreur est survenue'
      });
    }
  };

  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">STIX Manager</h3>
            <p className="text-sm text-slate-400">
              {stats?.data?.totalBundles || 0} bundles • {stats?.data?.totalObjects || 0} objets
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleExport}
          disabled={exportSTIX.isFetching}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          {exportSTIX.isFetching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="ml-2">Export Bundle</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={<FileText className="w-5 h-5" />}
          label="Bundles"
          value={stats?.data?.totalBundles?.toLocaleString() || '0'}
          trend={`+${stats?.data?.indicatorsCount || 0}`}
          color="purple"
          loading={statsLoading}
        />
        <StatsCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Indicators"
          value={stats?.data?.indicatorsCount?.toLocaleString() || '0'}
          trend={`+${stats?.data?.malwareCount || 0}`}
          color="blue"
          loading={statsLoading}
        />
        <StatsCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Malware"
          value={stats?.data?.malwareCount?.toLocaleString() || '0'}
          trend={`+${stats?.data?.threatActorsCount || 0}`}
          color="red"
          loading={statsLoading}
        />
        <StatsCard
          icon={<Eye className="w-5 h-5" />}
          label="Threat Actors"
          value={stats?.data?.threatActorsCount?.toLocaleString() || '0'}
          trend={`+${stats?.data?.campaignsCount || 0}`}
          color="green"
          loading={statsLoading}
        />
      </div>

      {/* Import Section */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Import Bundle STIX</h4>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive || dragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-slate-600 hover:border-purple-500 hover:bg-purple-500/5'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-full">
              <Upload className="w-8 h-8 text-purple-400" />
            </div>
            
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre bundle STIX'}
              </p>
              <p className="text-sm text-slate-400">
                ou cliquez pour sélectionner un fichier JSON
              </p>
            </div>
            
            <div className="text-xs text-slate-500">
              Formats acceptés: .json (STIX 2.1 Bundle)
            </div>
          </div>
        </div>
        
        {importSTIX.isPending && (
          <div className="mt-4 p-3 bg-blue-600/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Import en cours...</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bundles */}
      <div className="bg-slate-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Bundles Récents</h4>
          <Badge className="bg-purple-600 text-white">
            {bundles?.data?.length || 0} bundles
          </Badge>
        </div>
        
        {bundlesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : bundles?.data?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun bundle importé</p>
            <p className="text-sm">Importez votre premier bundle STIX</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {bundles?.data?.slice(0, 5).map((bundle: any) => (
              <div
                key={bundle.id}
                className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-purple-400">{bundle.id}</span>
                    <Badge className="bg-green-600 text-white text-xs">
                      {bundle.objects?.length || 0} objets
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500">
                  Importé le {new Date(bundle.created_at || Date.now()).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Activity */}
      {stats?.data?.lastImport && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Dernier import:</span>
            <span className="text-white">{new Date(stats.data.lastImport).toLocaleString()}</span>
          </div>
          {stats.data.lastExport && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-400">Dernier export:</span>
              <span className="text-purple-400">{new Date(stats.data.lastExport).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
