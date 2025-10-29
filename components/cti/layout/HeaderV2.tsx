/**
 * 🎨 Header V2 - Header moderne aligné design cybersec
 * Glassmorphism, neon borders, user info, logout
 */

import { useAuthStore } from '../../../src/store/auth.store';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Shield,
  LogOut,
  User,
  Building,
  RefreshCw,
  Bell,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface HeaderV2Props {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export function HeaderV2({
  title,
  subtitle,
  onRefresh,
  showNotifications = true,
  notificationCount = 0
}: HeaderV2Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await logout();
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return 'bg-purple-600 text-white';
      case 'BUSINESS':
        return 'bg-blue-600 text-white';
      case 'STARTER':
        return 'bg-cyan-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title & Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={onRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            )}

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 relative"
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {user?.role || 'ANALYST'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl shadow-cyan-500/10 z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user?.name}</p>
                          <p className="text-sm text-slate-400">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{user?.tenant.name}</span>
                        <Badge className={`${getPlanBadgeColor(user?.tenant.plan || 'TRIAL')} text-xs ml-auto`}>
                          {user?.tenant.plan}
                        </Badge>
                      </div>

                      {user?.tenant.status === 'TRIAL' && user?.tenant.trialEndsAt && (
                        <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-300">
                          Essai expire dans{' '}
                          {Math.ceil(
                            (new Date(user.tenant.trialEndsAt).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          jours
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-left text-slate-300">
                        <User className="w-4 h-4" />
                        Mon Profil
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-left text-slate-300">
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all text-left text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

