/**
 * 🎨 Sidebar V2 - Navigation moderne design cybersec
 * Minimaliste, icônes, tooltips, collapsible
 */

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Shield,
  Eye,
  Radar,
  TrendingUp,
  BarChart3,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Database
} from 'lucide-react';

interface SidebarV2Props {
  activeView?: string;
  onViewChange?: (view: string) => void;
  collapsed?: boolean;
}

export function SidebarV2({
  activeView = 'soc-analyst',
  onViewChange,
  collapsed: controlledCollapsed
}: SidebarV2Props) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setCollapsed = controlledCollapsed !== undefined ? () => {} : setLocalCollapsed;

  const menuItems = [
    {
      id: 'soc-analyst',
      label: 'SOC Analyst',
      icon: Eye,
      badge: null,
      color: 'cyan'
    },
    {
      id: 'collection',
      label: 'Collection Hub',
      icon: Database,
      badge: null,
      color: 'blue'
    },
    {
      id: 'threat-intel',
      label: 'Threat Intel',
      icon: Radar,
      badge: null,
      color: 'purple'
    },
    {
      id: 'executive',
      label: 'Executive',
      icon: TrendingUp,
      badge: null,
      color: 'green'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      color: 'orange'
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: Bell,
      badge: '12',
      color: 'red'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: FileText,
      badge: null,
      color: 'yellow'
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: Users,
      badge: null,
      color: 'indigo'
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: Database,
      badge: null,
      color: 'teal'
    }
  ];

  return (
    <div
      className={`
        bg-slate-900/50 backdrop-blur-xl border-r border-white/10
        transition-all duration-300 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-white text-lg">AntStrike</h2>
              <p className="text-xs text-slate-400">CTI Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onViewChange?.(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-all relative overflow-hidden
                  ${isActive
                    ? `bg-gradient-to-r from-${item.color}-600/20 to-${item.color}-500/10 border border-${item.color}-500/50 text-white shadow-lg shadow-${item.color}-500/20`
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                {/* Glow effect for active */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-${item.color}-500/10 to-transparent animate-pulse`}></div>
                )}

                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon className={`w-5 h-5 ${isActive ? `text-${item.color}-400` : ''}`} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-red-600 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-${item.color}-500 to-${item.color}-600 rounded-r`}></div>
                )}
              </button>

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  <p className="text-sm text-white font-medium">{item.label}</p>
                  {item.badge && (
                    <Badge className="mt-1 bg-red-600 text-white text-xs">
                      {item.badge} nouvelles
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-white/10">
        <button
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Paramètres</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/20 text-white hover:bg-white/10"
          onClick={() => setCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Réduire
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

