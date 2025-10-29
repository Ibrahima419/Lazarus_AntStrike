/**
 * 🛡️ SOC ANALYST DASHBOARD ULTIMATE V2
 * Le meilleur dashboard SOC du marché ! 🚀
 * 
 * Fonctionnalités:
 * ✅ Case Management (Investigation complète)
 * ✅ IOC Enrichment (Threat Intelligence)
 * ✅ Playbooks Automatisés (SOAR)
 * ✅ Threat Correlation (Attack Campaigns)
 * ✅ Taranis AI Bots (IOC extraction, Sentiment, NLP, Clustering)
 * ✅ Analyst Metrics (Performance tracking)
 * ✅ Real-time Alerts & Threats
 * ✅ Advanced Filtering & Search
 */

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
import { useFilteredThreats, useFilteredAlerts } from '../../../src/hooks/use-filtered-data';
import { useAuthStore } from '../../../src/store/auth.store';

// ===== COMPONENTS =====
import { StatsCard } from '../base/StatsCard';
import { FilterBar, type Filters } from '../base/FilterBar';
import { ThreatCard } from '../base/ThreatCard';
import { AlertCard } from '../base/AlertCard';
import { InvestigationPanel } from '../../../src/components/cti/soc/InvestigationPanel';
import { IOCCard } from '../../../src/components/cti/soc/IOCCard';
import { PlaybookPanel } from '../../../src/components/cti/soc/PlaybookPanel';
import { ThreatCorrelationPanel } from '../../../src/components/cti/soc/ThreatCorrelationPanel';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';

// ===== TARANIS WIDGETS =====
import { TrendingThreatsWidget } from '../../../src/components/cti/dashboard/widgets/TrendingThreatsWidget';
import { OsintSourcesWidget } from '../../../src/components/cti/dashboard/widgets/OsintSourcesWidget';
import { AIBotsWidget } from '../../../src/components/cti/dashboard/widgets/AIBotsWidget';
import { LatestStoriesWidget } from '../../../src/components/cti/dashboard/widgets/LatestStoriesWidget';
import { NewsItemsTimelineWidget } from '../../../src/components/cti/dashboard/widgets/NewsItemsTimelineWidget';
import { ReportTemplatesWidget } from '../../../src/components/cti/dashboard/widgets/ReportTemplatesWidget';
import { TaranisStatsOverviewWidget } from '../../../src/components/cti/dashboard/widgets/TaranisStatsOverviewWidget';
import { ThreatTagsWidget } from '../../../src/components/cti/dashboard/widgets/ThreatTagsWidget';
import { IOCAnalysisWidget } from '../../../src/components/cti/dashboard/widgets/IOCAnalysisWidget';

// ===== TYPES =====
type ViewMode = 'overview' | 'investigation' | 'ioc' | 'playbooks' | 'correlation' | 'metrics';

export function SOCAnalystDashboardV2() {
  const { user } = useAuthStore();
  
  // ===== STATE =====
  const [filters, setFilters] = useState<Filters>({});
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
  const alerts = alertsDataRaw || [];
  const cases = casesData?.data || [];
  const caseStats = caseStatsData?.data || {};
  const iocs = iocsData?.data || [];
  const playbooks = playbooksData?.data || [];
  const correlationStats = correlationStatsData?.data || {};
  const campaigns = campaignsData?.data || [];
  const metrics = metricsData?.data || {};

  const stats = useThreatStats(threats);
  const filteredThreats = useFilteredThreats(threats, filters);
  const filteredAlerts = useFilteredAlerts(alerts, filters);
  
  const newAlertsCount = filteredAlerts?.filter(a => a.status === 'NEW').length || 0;
  const activeAlertsCount = filteredAlerts?.filter(a => a.status !== 'RESOLVED').length || 0;
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
      
      toast.success('✅ Alerte créée avec succès !');
    } catch (error) {
      toast.error('❌ Erreur lors de la création de l\'alerte');
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
      toast.success('✅ Case d\'investigation créé !');
    } catch (error) {
      toast.error('❌ Erreur lors de la création du case');
    }
  };

  const handleRefreshAll = () => {
    refetchThreats();
    refetchAlerts();
    toast.info('🔄 Données actualisées');
  };

  // ===== VIEW MODES =====
  const viewModes = [
    { id: 'overview' as ViewMode, label: '📊 Vue d\'ensemble', icon: Activity },
    { id: 'investigation' as ViewMode, label: '🔍 Investigations', icon: FileText, badge: openCasesCount },
    { id: 'ioc' as ViewMode, label: '🎯 IOC Analysis', icon: Target, badge: iocs.length },
    { id: 'playbooks' as ViewMode, label: '🤖 Playbooks', icon: Zap, badge: activePlaybooksCount },
    { id: 'correlation' as ViewMode, label: '🕸️ Corrélations', icon: Network, badge: campaigns.length },
    { id: 'metrics' as ViewMode, label: '📈 Métriques', icon: TrendingUp },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* ===== TOP STATS ===== */}
      <div className="p-6 border-b border-white/10 bg-slate-900/30">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatsCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Critiques"
            value={stats.critical}
            trend="+12%"
            color="red"
            loading={threatsLoading}
          />
          <StatsCard
            icon={<Shield className="w-6 h-6" />}
            label="Élevées"
            value={stats.high}
            trend="+8%"
            color="orange"
            loading={threatsLoading}
          />
          <StatsCard
            icon={<Bell className="w-6 h-6" />}
            label="Alertes Actives"
            value={activeAlertsCount}
            trend="+5%"
            color="blue"
            loading={alertsLoading}
          />
          <StatsCard
            icon={<FileText className="w-6 h-6" />}
            label="Cases Ouverts"
            value={openCasesCount}
            color="cyan"
            loading={casesLoading}
          />
          <StatsCard
            icon={<Network className="w-6 h-6" />}
            label="Campagnes"
            value={campaigns.length}
            color="purple"
          />
          <StatsCard
            icon={<Zap className="w-6 h-6" />}
            label="Playbooks Actifs"
            value={activePlaybooksCount}
            color="green"
          />
        </div>
      </div>

      {/* ===== VIEW MODE SELECTOR ===== */}
      <div className="p-6 border-b border-white/10 bg-slate-900/20">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
              {mode.badge !== undefined && mode.badge > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{mode.badge}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="p-6">
        {/* OVERVIEW MODE */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* ===== 🌐 TARANIS INTELLIGENCE SECTION (ENRICHED!) ===== */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  🌐 Taranis Intelligence Platform
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              </div>
              
              {/* Taranis Stats Overview */}
              <div>
                <TaranisStatsOverviewWidget />
              </div>
              
              {/* OSINT Sources Status */}
              <div>
                <OsintSourcesWidget />
              </div>
              
              {/* Trending Threats + AI Bots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendingThreatsWidget />
                <AIBotsWidget />
              </div>

              {/* Latest Stories + News Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LatestStoriesWidget />
                <NewsItemsTimelineWidget />
              </div>

              {/* Threat Tags + Report Templates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreatTagsWidget />
                <ReportTemplatesWidget />
              </div>

              {/* IOC Analysis Widget */}
              <div>
                <IOCAnalysisWidget />
              </div>
            </section>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8"></div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onChange={setFilters}
              showSeverity={true}
              showStatus={true}
              showPriority={true}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Threats List - 60% */}
              <div className="col-span-12 lg:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    🎯 Menaces Actives ({filteredThreats.length})
                  </h2>
                </div>

                {threatsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {filteredThreats.map((threat: any) => (
                      <div
                        key={threat.id}
                        onClick={() => setSelectedThreat(threat)}
                        className={selectedThreat?.id === threat.id ? 'ring-2 ring-cyan-500 rounded-lg' : ''}
                      >
                        <ThreatCard
                          threat={threat}
                          onCreateAlert={handleCreateAlert}
                        />
                      </div>
                    ))}
                    {filteredThreats.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        Aucune menace trouvée
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Alerts Sidebar - 40% */}
              <div className="col-span-12 lg:col-span-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                    🚨 Alertes ({filteredAlerts?.length || 0})
                  </h2>
                </div>

                {alertsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {filteredAlerts?.map((alert: any) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={() => acknowledgeAlert.mutate(alert.id)}
                        onResolve={() => resolveAlert.mutate(alert.id)}
                      />
                    ))}
                    {(filteredAlerts?.length || 0) === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        Aucune alerte
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INVESTIGATION MODE */}
        {viewMode === 'investigation' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Cases List */}
            <div className="col-span-12 lg:col-span-4">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">📁 Cases ({cases.length})</h2>
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {cases.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCaseId === c.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-cyan-500/20 bg-gray-900/50 hover:border-cyan-500/50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-200 mb-2">{c.title}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        c.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-400' :
                        c.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-gray-400">{c.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investigation Panel */}
            <div className="col-span-12 lg:col-span-8">
              {selectedCaseId ? (
                <InvestigationPanel 
                  caseId={selectedCaseId}
                  onClose={() => setSelectedCaseId(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Sélectionnez un case pour commencer l'investigation
                </div>
              )}
            </div>
          </div>
        )}

        {/* IOC MODE */}
        {viewMode === 'ioc' && (
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-6">
              🎯 IOC Analysis & Enrichment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {iocs.map((ioc: any) => (
                <IOCCard key={ioc.id} ioc={ioc} />
              ))}
              {iocs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Aucun IOC enrichi disponible
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLAYBOOKS MODE */}
        {viewMode === 'playbooks' && (
          <PlaybookPanel />
        )}

        {/* CORRELATION MODE */}
        {viewMode === 'correlation' && (
          <ThreatCorrelationPanel selectedThreatId={selectedThreat?.id} />
        )}

        {/* METRICS MODE */}
        {viewMode === 'metrics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              📈 Analyst Performance Metrics
            </h2>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Cases Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Closed:</span>
                    <span className="font-bold text-green-400">{metrics.cases?.closed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg/Day:</span>
                    <span className="font-bold text-green-400">{metrics.cases?.avgPerDay?.toFixed(1) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">In Progress:</span>
                    <span className="font-bold text-blue-400">{metrics.cases?.inProgress || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg MTTR:</span>
                    <span className="font-bold text-blue-400">{metrics.performance?.avgMTTR || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg MTTD:</span>
                    <span className="font-bold text-cyan-400">{metrics.performance?.avgMTTD || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Productivity:</span>
                    <span className="font-bold text-cyan-400">{metrics.performance?.productivity || 0}/100</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Alert Handling</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Triaged:</span>
                    <span className="font-bold text-purple-400">{metrics.alerts?.triaged || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg/Day:</span>
                    <span className="font-bold text-purple-400">{metrics.alerts?.avgPerDay?.toFixed(1) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Alerts:</span>
                    <span className="font-bold text-pink-400">{metrics.alerts?.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
