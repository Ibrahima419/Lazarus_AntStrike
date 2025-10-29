import { Shield, BarChart3, Globe, AlertTriangle, Database, Settings, Users, FileText, Activity, Server, Target, Bug, Network, TestTube, Search, HardDrive, Map, MapPin, ChevronLeft, ChevronRight, Eye, Radar, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import logoIcon from '../AnStrikes.svg';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  // État de la sidebar intelligente
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: true,           // Défaut collapsed pour expert
    isHovering: false,           // Hover preview actif
    forceExpanded: false,         // Force expand pour nouvelles features
    userPreference: 'expert'     // Type d'utilisateur détecté
  });

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const forceExpandTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Nouvelles fonctionnalités qui forcent l'expand
  const newFeatures = [
    { id: 'soc-analyst', added: '2025-10-10', forceExpand: true }, // 🆕 POC Demo - SOC View
    { id: 'threat-intel-hub', added: '2025-10-10', forceExpand: true }, // 🆕 POC Demo - Intel Hub
    { id: 'executive-cti', added: '2025-10-10', forceExpand: true }, // 🆕 POC Demo - Executive
    { id: 'taranis-test-unified', added: '2025-01-08', forceExpand: true },
    { id: 'taranis', added: '2024-01-15', forceExpand: true },
    { id: 'taranis-assess', added: '2024-01-15', forceExpand: true },
    { id: 'taranis-assets', added: '2024-01-15', forceExpand: true },
    { id: 'threat-map', added: '2024-01-10', forceExpand: true },
    { id: 'source-map', added: '2024-01-05', forceExpand: true }
  ];

  // Détection utilisateur expert (simulation)
  useEffect(() => {
    const isExpertUser = localStorage.getItem('antstrike-user-type') === 'expert' || 
                         (localStorage.getItem('antstrike-sessions') && parseInt(localStorage.getItem('antstrike-sessions')!) > 10);
    
    if (isExpertUser) {
      setSidebarState(prev => ({ ...prev, userPreference: 'expert', isCollapsed: true }));
    }
  }, []);

  // Gestion du hover preview
  const handleMouseEnter = () => {
    if (sidebarState.isCollapsed && !sidebarState.forceExpanded) {
      setSidebarState(prev => ({ ...prev, isHovering: true }));
      
      hoverTimerRef.current = setTimeout(() => {
        setSidebarState(prev => ({ ...prev, isCollapsed: false }));
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    if (sidebarState.isHovering && !sidebarState.forceExpanded) {
      setSidebarState(prev => ({ ...prev, isHovering: false, isCollapsed: true }));
    }
  };

  // Force expand pour nouvelles fonctionnalités
  useEffect(() => {
    const hasNewFeature = newFeatures.some(feature => feature.id === activeTab);
    if (hasNewFeature && sidebarState.userPreference === 'expert') {
      setSidebarState(prev => ({ ...prev, forceExpanded: true, isCollapsed: false }));
      
      forceExpandTimerRef.current = setTimeout(() => {
        setSidebarState(prev => ({ ...prev, forceExpanded: false, isCollapsed: true }));
      }, 5000);
    }
  }, [activeTab]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (forceExpandTimerRef.current) clearTimeout(forceExpandTimerRef.current);
    };
  }, []);

  // Toggle manuel
  const toggleSidebar = () => {
    setSidebarState(prev => ({ 
      ...prev, 
      isCollapsed: !prev.isCollapsed,
      forceExpanded: false 
    }));
  };
  const menuItems = [
    // { id: 'overview', label: 'Overview', icon: BarChart3 },
    // { id: 'threats', label: 'Threats', icon: Shield },
    // { id: 'threat-tracking', label: 'Threat Tracking', icon: Target },
    // { id: 'threat-map', label: 'Threat Map', icon: MapPin },
    // { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    // { id: 'intelligence', label: 'Intelligence', icon: Database },
    // { id: 'entities', label: 'Entities', icon: Users },
    // { id: 'analysis', label: 'Analysis', icon: Activity },
    { id: 'cti-platform', label: 'CTI Platform', icon: Network },
    // { id: 'source-map', label: 'Source Intelligence Map', icon: Map },
    
    // === POC DEMO - CTI DASHBOARDS ===
    { id: 'soc-analyst', label: 'SOC Analyst View', icon: Eye },
    { id: 'soc-analyst-v2', label: '🆕 SOC Analyst V2 (Backend)', icon: Shield },
    { id: 'threat-intel-hub', label: 'Threat Intel Hub', icon: Radar },
    { id: 'executive-cti', label: 'Executive Dashboard', icon: TrendingUp },
    
    // === TARANIS AI INTEGRATION ===
    { id: 'taranis', label: 'Taranis AI', icon: Server },
    { id: 'taranis-assess', label: 'Taranis Assess', icon: Search },
    { id: 'taranis-assets', label: 'Taranis Assets', icon: HardDrive },
    { id: 'taranis-test-unified', label: 'Taranis Test Unified', icon: TestTube },
    { id: 'taranis-test', label: 'Taranis Test (Legacy)', icon: Bug },
    
    // { id: 'import-export', label: 'Import/Export', icon: Globe },
    // { id: 'reports', label: 'Reports', icon: FileText },
    // { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className={`bg-card border-r border-border h-full flex flex-col transition-all duration-300 ease-out ${
        sidebarState.isCollapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={logoIcon} alt="AntStrike" className="w-6 h-6" style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(94%) saturate(7500%) hue-rotate(356deg) brightness(91%) contrast(118%)' }} />
          </div>
          {!sidebarState.isCollapsed && (
            <div className="flex-1">
              <h1 className="font-semibold">AntStrike</h1>
              <p className="text-sm text-muted-foreground">Cyber Threat Intelligence</p>
          </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {sidebarState.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
                  const Icon = item.icon;
            const isNewFeature = newFeatures.some(feature => feature.id === item.id);
                  return (
                    <Button
                      key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 transition-all duration-200 ${
                  sidebarState.isCollapsed ? 'px-2' : 'px-3'
                      }`}
                      onClick={() => setActiveTab(item.id)}
                title={sidebarState.isCollapsed ? item.label : undefined}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {isNewFeature && sidebarState.forceExpanded && (
                    <span className="absolute -top-1 -right-1 text-xs bg-destructive text-destructive-foreground rounded-full w-3 h-3 flex items-center justify-center">
                      🆕
                    </span>
                  )}
                </div>
                {!sidebarState.isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!sidebarState.isCollapsed && (item.id === 'threats' || item.id === 'incidents') && (
                  <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-1">
                    {item.id === 'threats' ? '3' : '1'}
                  </span>
                      )}
                    </Button>
                  );
                })}
        </div>
      </nav>
    </div>
  );
}