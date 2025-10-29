/**
 * 🏗️ Layout V2 - Layout wrapper pour dashboards V2
 * Combine Header + Sidebar + Content
 */

import { ReactNode, useState } from 'react';
import { HeaderV2 } from './HeaderV2';
import { SidebarV2 } from './SidebarV2';

interface LayoutV2Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function LayoutV2({
  children,
  title,
  subtitle,
  onRefresh,
  showNotifications = true,
  notificationCount = 0,
  currentView,
  onViewChange
}: LayoutV2Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex">
      {/* Sidebar */}
      <SidebarV2
        activeView={currentView}
        onViewChange={onViewChange}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <HeaderV2
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

