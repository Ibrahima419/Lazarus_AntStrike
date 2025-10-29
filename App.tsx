/**
 * 🚀 App V2 - Application principale (Architecture V2)
 * Clean, moderne, aligné backend
 * Layout géré ici (Header + Sidebar une seule fois)
 */

import { useState } from 'react';
import { useThreats } from './src/hooks/use-threats';
import { useAlerts, useCreateAlert, useAcknowledgeAlert, useResolveAlert } from './src/hooks/use-alerts';
import { useThreatStats } from './src/hooks/use-threat-stats';
import { useFilteredThreats, useFilteredAlerts } from './src/hooks/use-filtered-data';

// Layout V2
import { HeaderV2 } from './components/cti/layout/HeaderV2';
import { SidebarV2 } from './components/cti/layout/SidebarV2';

// Dashboards
import { SOCAnalystDashboardV2 } from './components/cti/dashboards-v2/SOCAnalystDashboardV2';

// Pages
import { ReportsPage } from './src/pages/Reports';
import { CollectionHub } from './src/pages/CollectionHub';

// Composants de base
import { ThreatCard } from './components/cti/base/ThreatCard';
import { AlertCard } from './components/cti/base/AlertCard';
import { StatsCard } from './components/cti/base/StatsCard';
import { FilterBar, type Filters } from './components/cti/base/FilterBar';

// UI
import { Badge } from './components/ui/badge';
import { AlertTriangle, Shield, Activity, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function App() {
  const [activeView, setActiveView] = useState('soc-analyst');
  const [filters, setFilters] = useState<Filters>({});
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Data from backend via React Query
  const { data: threatsData, isLoading: threatsLoading, refetch: refetchThreats } = useThreats({ limit: 100 });
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts();

  // Mutations
  const createAlert = useCreateAlert();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  // Computed data
  const threats = threatsData?.items || [];
  const totalThreats = threatsData?.counts?.total_count || 0;
  const stats = useThreatStats(threats);
  const filteredThreats = useFilteredThreats(threats, filters);
  const filteredAlerts = useFilteredAlerts(alerts, filters);
  const newAlertsCount = filteredAlerts?.filter(a => a.status === 'NEW').length || 0;

  // Handlers
  const handleCreateAlert = async (threat: any) => {
    const loadingToast = toast.loading('Création de l\'alerte...');
    
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
      
      toast.success('Alert créée avec succès !', {
        id: loadingToast,
        description: `Priority: ${threat.relevance >= 4 ? 'P0' : 'P1'} • SLA: ${threat.relevance >= 4 ? '1h' : '4h'}`,
      });
    } catch (error: any) {
      toast.error('Erreur lors de la création', {
        id: loadingToast,
        description: error.response?.data?.error?.message || 'Une erreur est survenue'
      });
    }
  };

  const handleRefreshAll = () => {
    refetchThreats();
    refetchAlerts();
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'soc-analyst': return '🛡️ SOC Analyst Dashboard Ultimate';
      case 'collection': return '🚀 Collection Hub';
      case 'threat-intel': return 'Threat Intelligence Hub';
      case 'executive': return 'Executive Dashboard';
      case 'analytics': return 'Analytics Dashboard';
      case 'alerts': return 'Alerts Management';
      case 'reports': return 'Reports Center';
      case 'team': return 'Team Management';
      case 'assets': return 'Assets Management';
      default: return 'Dashboard';
    }
  };

  const getViewSubtitle = () => {
    if (activeView === 'soc-analyst') {
      const activeAlerts = filteredAlerts?.filter(a => a.status !== 'RESOLVED').length || 0;
      return `${totalThreats} menaces • ${activeAlerts} alertes actives • Données temps réel`;
    }
    return `${totalThreats} menaces • ${newAlertsCount} alertes nouvelles`;
  };

  const renderContent = () => {
    // Route vers page Reports
    if (activeView === 'reports') {
      return <ReportsPage />;
    }

    // Collection Hub - Service de Collecte & Agrégation
    if (activeView === 'collection') {
      return <CollectionHub />;
    }

    // SOC Analyst Dashboard V2 - ULTIMATE avec toutes les features SOC !
    if (activeView === 'soc-analyst') {
      return <SOCAnalystDashboardV2 />;
    }

    // Pour les autres vues (en développement), afficher dashboard SOC Analyst basique
    return (
      <>
        {/* Stats Cards */}
        <div className="p-6 border-b border-white/10 bg-slate-900/30">
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              icon={<AlertTriangle className="w-6 h-6" />}
              label="Menaces Critiques"
              value={stats.critical}
              trend="+12%"
              color="red"
              loading={threatsLoading}
            />
            <StatsCard
              icon={<Shield className="w-6 h-6" />}
              label="Menaces Élevées"
              value={stats.high}
              trend="+8%"
              color="orange"
              loading={threatsLoading}
            />
            <StatsCard
              icon={<Activity className="w-6 h-6" />}
              label="Alertes Actives"
              value={filteredAlerts?.filter(a => a.status !== 'RESOLVED').length || 0}
              trend="+5%"
              color="blue"
              loading={alertsLoading}
            />
            <StatsCard
              icon={<Bell className="w-6 h-6" />}
              label="Non Lues"
              value={stats.unread}
              color="cyan"
              loading={threatsLoading}
            />
          </div>

          <div className="mt-4">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              showSeverity={true}
              showStatus={true}
              showPriority={true}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Threats List */}
            <div className="col-span-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Menaces ({filteredThreats.length})
                </h2>
                <Badge className="bg-cyan-600 text-white">
                  Total: {totalThreats}
                </Badge>
              </div>

              {threatsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-slate-800 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredThreats.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucune menace trouvée</p>
                  <p className="text-sm">Ajustez vos filtres</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {filteredThreats.slice(0, 50).map((threat) => (
                    <ThreatCard
                      key={threat.id}
                      threat={threat}
                      onCreateAlert={handleCreateAlert}
                      onSelect={setSelectedThreat}
                      selected={selectedThreat?.id === threat.id}
                      expandable={true}
                      variant="full"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Alerts Panel */}
            <div className="col-span-4">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alertes ({filteredAlerts?.length || 0})
                  </h2>
                  <Badge className="bg-red-600 text-white">
                    {newAlertsCount} nouvelles
                  </Badge>
                </div>

                {alertsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-40 bg-slate-800 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : !filteredAlerts || filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune alerte</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {filteredAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={(id) => acknowledgeAlert.mutate(id)}
                        onResolve={(id) => resolveAlert.mutate(id)}
                        compact={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Sidebar V2 - Une seule fois */}
      <SidebarV2
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={true}
      />

      {/* Main Content avec Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header V2 */}
        <HeaderV2
          title={getViewTitle()}
          subtitle={getViewSubtitle()}
          onRefresh={handleRefreshAll}
          showNotifications={true}
          notificationCount={newAlertsCount}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
