/**
 * 🔒 Protected Route - Require authentication and permissions
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { usePermissions, Permission } from '../hooks/use-permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'ANALYST' | 'VIEWER';
  requirePermission?: Permission;
  requireAnyPermission?: Permission[];
  requireAllPermissions?: Permission[];
}

export function ProtectedRoute({
  children,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

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

  // Check role if required (backward compatibility)
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

  // Check single permission
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Permission requise: <span className="font-bold">{requirePermission}</span>
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

  // Check any of the permissions
  if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Permissions requises (au moins une): <span className="font-bold">{requireAnyPermission.join(', ')}</span>
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

  // Check all permissions
  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Permissions requises (toutes): <span className="font-bold">{requireAllPermissions.join(', ')}</span>
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

