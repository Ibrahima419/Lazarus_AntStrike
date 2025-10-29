/**
 * 🔒 Protected Route - Require authentication
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'ANALYST' | 'VIEWER';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Rôle requis: <span className="font-bold">{requireRole}</span>
          </p>
          <p className="text-sm text-slate-500">
            Votre rôle: <span className="font-bold">{user.role}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

