/**
 * 📊 Reports Page - Gestion et génération rapports CTI
 */

import { useState } from 'react';
import { useReports, useGenerateReport } from '../hooks/use-reports';
import { HeaderV2 } from '../../components/cti/layout/HeaderV2';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import {
  FileText,
  Download,
  Calendar,
  Mail,
  Plus,
  FileJson,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import type { ReportType, ReportFormat } from '../services/api/report.service';

export function ReportsPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('HTML');
  const [period, setPeriod] = useState('24h');

  const { data: reports, isLoading, refetch } = useReports();
  const generateReport = useGenerateReport();

  const handleGenerate = async () => {
    const loadingToast = toast.loading('Génération du rapport...');

    try {
      const result = await generateReport.mutateAsync({
        type: reportType,
        format: reportFormat,
        period,
        sendEmail: false
      });

      toast.success('Rapport généré !', {
        id: loadingToast,
        description: `${result.filename}`,
        action: {
          label: 'Télécharger',
          onClick: () => {
            // Download
            const blob = new Blob([result.content], { type: result.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      });

      setShowGenerateModal(false);
    } catch (error: any) {
      toast.error('Erreur génération rapport', {
        id: loadingToast,
        description: error.response?.data?.error?.message
      });
    }
  };

  const formatTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAILY: 'Quotidien',
      WEEKLY: 'Hebdomadaire',
      MONTHLY: 'Mensuel',
      ON_DEMAND: 'À la demande',
      INCIDENT: 'Incident'
    };
    return labels[type] || type;
  };

  const formatFormatIcon = (format: string) => {
    switch (format) {
      case 'JSON': return <FileJson className="w-4 h-4" />;
      case 'CSV': return <FileSpreadsheet className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <HeaderV2
        title="Centre de Rapports"
        subtitle={`${reports?.length || 0} rapports générés`}
        onRefresh={() => refetch()}
      />

      <div className="p-6">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Rapports CTI</h2>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Générer Rapport
          </Button>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-slate-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-20 h-20 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun rapport généré
            </h3>
            <p className="text-slate-400 mb-6">
              Créez votre premier rapport pour commencer
            </p>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Générer Rapport
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {formatFormatIcon(report.format)}
                      <Badge className="bg-cyan-600 text-white">
                        {formatTypeLabel(report.type)}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {report.format}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-white mb-2">
                    {report.title}
                  </h3>

                  <div className="text-sm text-slate-400 space-y-1 mb-4">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true, locale: fr })}
                    </p>
                    <p>
                      📊 {report.storiesCount} menaces analysées
                    </p>
                    {report.sentVia === 'email' && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        Envoyé par email
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => {
                      window.open(`http://localhost:4000/api/reports/${report.id}/download`, '_blank');
                      toast.success('Téléchargement démarré');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-slate-900 border-cyan-500/30 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Générer Rapport</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Type de rapport
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setReportType(type as ReportType)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${reportType === type
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-cyan-500/50'
                          }
                        `}
                      >
                        {formatTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['HTML', 'JSON', 'CSV'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setReportFormat(fmt as ReportFormat)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${reportFormat === fmt
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-cyan-500/50'
                          }
                        `}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Période
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '24h', label: '24 heures' },
                      { value: '7d', label: '7 jours' },
                      { value: '30d', label: '30 jours' }
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${period === p.value
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-cyan-500/50'
                          }
                        `}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300"
                    onClick={() => setShowGenerateModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    onClick={handleGenerate}
                    disabled={generateReport.isPending}
                  >
                    {generateReport.isPending ? (
                      <>Génération...</>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


