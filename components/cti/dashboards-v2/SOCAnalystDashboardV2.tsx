

import { useState, useEffect } from 'react';
import { 
  Shield,
  Activity,
  Bell,
  AlertTriangle,
  Zap,
  FileText,
  Network,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

// ===== HOOKS =====
import { useThreats } from '../../../src/hooks/use-threats';
import { useAlerts, useCreateAlert, useAcknowledgeAlert, useResolveAlert } from '../../../src/hooks/use-alerts';
import { useCases, useCreateCase, useCaseStats } from '../../../src/hooks/use-cases';
import { useEnrichedIOCs } from '../../../src/hooks/use-ioc';
import { usePlaybooks } from '../../../src/hooks/use-playbooks';
import { useCorrelationStats, useThreatCampaigns } from '../../../src/hooks/use-correlation';
import { useAggregatedMetrics } from '../../../src/hooks/use-metrics';
import { useThreatStats } from '../../../src/hooks/use-threat-stats';
import { useAuthStore } from '../../../src/store/auth.store';

// ===== COMPONENTS =====
import { InvestigationPanel } from '../../../src/components/cti/soc/InvestigationPanel';
import { IOCCard } from '../../../src/components/cti/soc/IOCCard';
import { PlaybookPanel } from '../../../src/components/cti/soc/PlaybookPanel';
import { ThreatCorrelationPanel } from '../../../src/components/cti/soc/ThreatCorrelationPanel';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';

// ===== TARANIS WIDGETS =====
import { TrendingThreatsWidget } from '../../../src/components/cti/dashboard/widgets/TrendingThreatsWidget';
import { TaranisStatsOverviewWidget } from '../../../src/components/cti/dashboard/widgets/TaranisStatsOverviewWidget';

// ===== TYPES =====
type ViewMode = 'overview' | 'investigation' | 'ioc' | 'playbooks' | 'correlation' | 'metrics';

export function SOCAnalystDashboardV2() {
  const { user } = useAuthStore();
  
  // ===== STATE =====
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // ===== DATA FETCHING =====
  const { data: threatsData, isLoading: threatsLoading, refetch: refetchThreats } = useThreats({ limit: 100 });
  const { data: alertsDataRaw, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts();
  const { data: casesData, isLoading: casesLoading } = useCases();
  const { data: caseStatsData } = useCaseStats();
  const { data: iocsData } = useEnrichedIOCs({ limit: 50 });
  const { data: playbooksData } = usePlaybooks(true);
  const { data: correlationStatsData } = useCorrelationStats();
  const { data: campaignsData } = useThreatCampaigns(3);
  const { data: metricsData } = useAggregatedMetrics(user?.id || '', undefined);

  // ===== MUTATIONS =====
  const createAlert = useCreateAlert();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();
  const createCase = useCreateCase();

  // ===== COMPUTED DATA =====
  const threats = threatsData?.items || [];
  const totalThreats = threatsData?.counts?.total_count || 0;
  const alerts = Array.isArray(alertsDataRaw) ? alertsDataRaw : [];
  const cases = casesData?.data || [];
  const caseStats = caseStatsData?.data || {};
  const iocs = iocsData?.data || [];
  const playbooks = playbooksData?.data || [];
  const correlationStats = correlationStatsData?.data || {};
  const campaigns = campaignsData?.data || [];
  const metrics = metricsData?.data || {};

  const stats = useThreatStats(threats);
  
  const newAlertsCount = alerts.filter((a: any) => a.status === 'NEW').length;
  const activeAlertsCount = alerts.filter((a: any) => a.status !== 'RESOLVED').length;
  const openCasesCount = cases?.filter((c: any) => c.status !== 'CLOSED').length || 0;
  const activePlaybooksCount = playbooks?.filter((p: any) => p.enabled).length || 0;

  // ===== HANDLERS =====
  const handleCreateAlert = async (threat: any) => {
    try {
      const result = await createAlert.mutateAsync({
        storyId: threat.id,
        severity: threat.relevance >= 4 ? 'CRITICAL' : threat.relevance >= 3 ? 'HIGH' : 'MEDIUM',
        priority: threat.relevance >= 4 ? 'P0' : 'P1',
        category: 'OTHER',
        title: threat.title,
        summary: threat.summary || threat.description || 'Threat importée depuis Taranis',
        iocs: []
      });
      
      toast.success('Alerte créée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'alerte');
    }
  };

  const handleCreateCase = async (threat: any) => {
    try {
      const result = await createCase.mutateAsync({
        title: threat.title,
        description: threat.description || threat.summary || 'Case créé depuis une menace Taranis',
        severity: threat.relevance >= 4 ? 'CRITICAL' : threat.relevance >= 3 ? 'HIGH' : 'MEDIUM',
        priority: threat.relevance >= 4 ? 'P0' : 'P1',
        threatIds: [threat.id],
      });

      setSelectedCaseId(result.data.id);
      setViewMode('investigation');
      toast.success('Case d\'investigation créé !');
    } catch (error) {
      toast.error('Erreur lors de la création du case');
    }
  };

  const handleRefreshAll = () => {
    refetchThreats();
    refetchAlerts();
    toast.info('Données actualisées');
  };

  // ===== VIEW MODES =====
  const viewModes = [
    { id: 'overview' as ViewMode, label: 'Vue d\'ensemble', icon: Activity },
    { id: 'investigation' as ViewMode, label: 'Investigations', icon: FileText, badge: openCasesCount },
    { id: 'ioc' as ViewMode, label: ' IOC Analysis', icon: Target, badge: iocs.length },
    { id: 'playbooks' as ViewMode, label: 'Playbooks', icon: Zap, badge: activePlaybooksCount },
    { id: 'correlation' as ViewMode, label: 'Corrélations', icon: Network, badge: campaigns.length },
    { id: 'metrics' as ViewMode, label: 'Métriques', icon: TrendingUp },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* ===== CONTENT AREA ===== */}
      <div className="p-6">
        {/* OVERVIEW MODE */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* ===== 🌐 TARANIS INTELLIGENCE SECTION (ENRICHED!) ===== */}
            <section className="space-y-8">
              {/* Header simplifié */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Antstrike Intelligence Platform
                </h1>
              </div>
              
              {/* Section 1: KPI Principaux */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Indicateurs Clés de Performance
                </h2>
                <TaranisStatsOverviewWidget />
              </div>
              
              {/* Section 2: Analyse des Menaces */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Analyse des Menaces
                </h2>
                <TrendingThreatsWidget />
              </div>

            </section>

          </div>
        )}

        

      </div>
    </div>
  );
}
