/**
 * 🔐 Auth Provider - Load user on app startup
 */

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Optional: Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

