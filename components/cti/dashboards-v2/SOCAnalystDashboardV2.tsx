import { Activity, AlertTriangle } from 'lucide-react';

// ===== HOOKS =====
import { useThreats } from '../../../src/hooks/use-threats';
import { useThreatStats } from '../../../src/hooks/use-threat-stats';
import { useAuthStore } from '../../../src/store/auth.store';

// ===== TARANIS WIDGETS =====
import { TrendingThreatsWidget } from '../../../src/components/cti/dashboard/widgets/TrendingThreatsWidget';
import { TaranisStatsOverviewWidget } from '../../../src/components/cti/dashboard/widgets/TaranisStatsOverviewWidget';

export function SOCAnalystDashboardV2() {
  const { user } = useAuthStore();

  // ===== DATA FETCHING =====
  const { data: threatsData } = useThreats({ limit: 100 });

  // ===== COMPUTED DATA =====
  const threats = threatsData?.items || [];
  const stats = useThreatStats(threats);

  return (
    <div className="h-full overflow-auto">
      {/* ===== CONTENT AREA ===== */}
      <div className="p-6">
        <div className="space-y-6">
          {/* ===== 🌐 TARANIS INTELLIGENCE SECTION ===== */}
          <section className="space-y-8">

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
      </div>
    </div>
  );
}
