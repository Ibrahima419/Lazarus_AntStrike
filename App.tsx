import { useState } from 'react';
import { LandingPage } from './components/landing-page';
import { DashboardSidebar } from './components/dashboard-sidebar';
import { DashboardHeader } from './components/dashboard-header';
import { OverviewDashboard } from './components/overview-dashboard';
import { ThreatsDashboard } from './components/threats-dashboard';
import { IntelligenceDashboard } from './components/intelligence-dashboard';
import { IncidentsDashboard } from './components/incidents-dashboard';
import { EntitiesDashboard } from './components/entities-dashboard';
import { AnalysisDashboard } from './components/analysis-dashboard';
import { ThreatTrackingDashboard } from './components/threat-tracking-dashboard';
import { ThreatMapDashboard } from './components/threat-map-dashboard';
import { TaranisDashboard } from './components/taranis-dashboard';
import { TaranisAssessDashboard } from './components/taranis-assess-dashboard';
import { TaranisAssetsDashboard } from './components/taranis-assets-dashboard';
import { TaranisTest } from './components/TaranisTest';
import { ImportExportDashboard } from './components/import-export-dashboard';
import { ReportsDashboard } from './components/reports-dashboard';
import { SettingsDashboard } from './components/settings-dashboard';
import { CTIDashboardContainer } from './components/cti/CTIDashboardContainer';
import { CTIDashboardOptimized } from './components/cti/CTIDashboardOptimized';
import { AlertSourceClusteringMap } from './components/cti/AlertSourceClusteringMap';
import { useEffect } from 'react';


export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('cti-platform');

  // Redirige vers Overview si non autorisé (401 / logout / expiration)
  useEffect(() => {
    function onUnauthorized() {
      setActiveTab('cti-platform');
    }
    window.addEventListener('taranis:unauthorized', onUnauthorized);
    return () => window.removeEventListener('taranis:unauthorized', onUnauthorized);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'cti-platform':
        return <CTIDashboardOptimized />;
      case 'threats':
        return <ThreatsDashboard />;
      case 'threat-tracking':
        return <ThreatTrackingDashboard />;
      case 'threat-map':
        return <ThreatMapDashboard />;
      case 'incidents':
        return <IncidentsDashboard />;
      case 'intelligence':
        return <IntelligenceDashboard />;
      case 'entities':
        return <EntitiesDashboard />;
      case 'analysis':
        return <AnalysisDashboard />;
      case 'source-map':
        return <AlertSourceClusteringMap />;
      case 'taranis':
        return <TaranisDashboard />;
      case 'taranis-assess':
        return <TaranisAssessDashboard />;
      case 'taranis-assets':
        return <TaranisAssetsDashboard />;
      case 'taranis-test':
        return <TaranisTest />;
      case 'import-export':
        return <ImportExportDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'settings':
        return <SettingsDashboard />;
      default:
        return <CTIDashboardOptimized />;
    }
  };

  const handleEnterPlatform = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingPage onEnterPlatform={handleEnterPlatform} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}