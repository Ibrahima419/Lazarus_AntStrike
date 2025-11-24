/**
 * 🔐 Permission Hook - Check user permissions
 */

import { useAuthStore } from '../store/auth.store';

export type Permission =
  | 'system:read'
  | 'system:configure'
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'tenant:read'
  | 'tenant:update'
  | 'threat:read'
  | 'threat:create'
  | 'threat:update'
  | 'threat:delete'
  | 'alert:read'
  | 'alert:create'
  | 'alert:update'
  | 'alert:assign'
  | 'alert:resolve'
  | 'alert:close'
  | 'case:read'
  | 'case:create'
  | 'case:update'
  | 'case:close'
  | 'ioc:read'
  | 'ioc:enrich'
  | 'ioc:update'
  | 'playbook:read'
  | 'playbook:create'
  | 'playbook:update'
  | 'playbook:execute'
  | 'osint:read'
  | 'osint:configure'
  | 'osint:collect'
  | 'taranis:assess'
  | 'taranis:analyze'
  | 'taranis:publish'
  | 'taranis:config'
  | 'report:read'
  | 'report:create'
  | 'report:export'
  | 'metrics:read'
  | 'metrics:analyze'
  | 'integration:read'
  | 'integration:configure'
  | 'stix:read'
  | 'stix:export'
  | 'taxii:read'
  | 'taxii:write'
  | 'misp:read'
  | 'misp:configure'
  | 'misp:sync'
  | 'cve:read'
  | 'cve:enrich'
  | 'darkweb:read'
  | 'darkweb:configure'
  | 'honeypot:read'
  | 'honeypot:configure'
  | 'threat_feed:read'
  | 'threat_feed:configure';

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions!.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.every(permission => user.permissions!.includes(permission));
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isAnalyst = (): boolean => {
    return user?.role === 'analyst';
  };

  const isViewer = (): boolean => {
    return user?.role === 'viewer';
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isAnalyst,
    isViewer,
  };
}