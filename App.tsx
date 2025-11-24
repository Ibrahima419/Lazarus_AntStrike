/**
 * 🚀 App V2 - Application principale (Architecture V2)
 * Clean, moderne, aligné backend
 * Layout géré ici (Header + Sidebar une seule fois)
 */

import { useState } from 'react';
import { useAuthStore } from './src/store/auth.store';
import { useThreats } from './src/hooks/use-threats';
import { useAlerts, useCreateAlert, useAcknowledgeAlert, useResolveAlert } from './src/hooks/use-alerts';
import { useThreatStats } from './src/hooks/use-threat-stats';
import { useFilteredThreats, useFilteredAlerts } from './src/hooks/use-filtered-data';

// Layout V2
import { HeaderV2 } from './components/cti/layout/HeaderV2';
import { SidebarV2 } from './components/cti/layout/SidebarV2';
import { ProtectedRoute } from './src/components/protected-route';

// Dashboards
import { SOCAnalystDashboardV2 } from './components/cti/dashboards-v2/SOCAnalystDashboardV2';
import { TaranisDashboard } from './src/components/cti/dashboards-v2/TaranisDashboard';

// Pages
import { ReportsPage } from './src/pages/Reports';
import { CollectionHub } from './src/pages/CollectionHub';
import { OSINTSourcesManager } from './src/pages/admin/OSINTSourcesManager';

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

  // Get user from auth store
  const { user } = useAuthStore();

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
      case 'soc-analyst': return 'SOC Analyst Dashboard Ultimate';
      case 'taranis-dashboard': return 'Taranis Intelligence Dashboard';
      case 'collection': return 'Collection Hub';
      case 'threat-intel': return 'Threat Intelligence Hub';
      case 'executive': return 'Executive Dashboard';
      case 'analytics': return 'Analytics Dashboard';
      case 'alerts': return 'Alerts Management';
      case 'reports': return 'Reports Center';
      case 'administration': return 'Administration';
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

    // Administration - Gestion des sources OSINT (Admin seulement)
    if (activeView === 'administration') {
      return (
        <ProtectedRoute requirePermission="osint:configure">
          <OSINTSourcesManager />
        </ProtectedRoute>
      );
    }

    // SOC Analyst Dashboard V2 - ULTIMATE avec toutes les features SOC !
    if (activeView === 'soc-analyst') {
      return <SOCAnalystDashboardV2 />;
    }

    // Taranis Dashboard - Intelligence avancée OSINT
    if (activeView === 'taranis-dashboard') {
      return <TaranisDashboard />;
    }

    // Default fallback - ancien dashboard
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThreats.slice(0, 9).map((threat) => (
            <ThreatCard
              key={threat.id}
              threat={threat}
              onCreateAlert={handleCreateAlert}
              variant="compact"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Sidebar V2 - Une seule fois */}
      <SidebarV2
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={true}
        userRole={user?.role}
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
