/**
 * 🔐 RBAC Permissions System for AntStrike CTI
 * Role-Based Access Control with granular permissions
 */

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export enum Permission {
  // Core System
  SYSTEM_READ = 'system:read',
  SYSTEM_CONFIGURE = 'system:configure',

  // User Management
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Tenant Management
  TENANT_READ = 'tenant:read',
  TENANT_UPDATE = 'tenant:update',

  // Threat Intelligence
  THREAT_READ = 'threat:read',
  THREAT_CREATE = 'threat:create',
  THREAT_UPDATE = 'threat:update',
  THREAT_DELETE = 'threat:delete',

  // Alert Management
  ALERT_READ = 'alert:read',
  ALERT_CREATE = 'alert:create',
  ALERT_UPDATE = 'alert:update',
  ALERT_ASSIGN = 'alert:assign',
  ALERT_RESOLVE = 'alert:resolve',
  ALERT_CLOSE = 'alert:close',

  // Case Management
  CASE_READ = 'case:read',
  CASE_CREATE = 'case:create',
  CASE_UPDATE = 'case:update',
  CASE_CLOSE = 'case:close',

  // IOC Management
  IOC_READ = 'ioc:read',
  IOC_ENRICH = 'ioc:enrich',
  IOC_UPDATE = 'ioc:update',

  // Playbook Management
  PLAYBOOK_READ = 'playbook:read',
  PLAYBOOK_CREATE = 'playbook:create',
  PLAYbook_UPDATE = 'playbook:update',
  PLAYBOOK_EXECUTE = 'playbook:execute',

  // OSINT & Taranis
  OSINT_READ = 'osint:read',
  OSINT_CONFIGURE = 'osint:configure',
  OSINT_COLLECT = 'osint:collect',
  TARANIS_ASSESS = 'taranis:assess',
  TARANIS_ANALYZE = 'taranis:analyze',
  TARANIS_PUBLISH = 'taranis:publish',
  TARANIS_CONFIG = 'taranis:config',

  // Reporting
  REPORT_READ = 'report:read',
  REPORT_CREATE = 'report:create',
  REPORT_EXPORT = 'report:export',

  // Metrics & Analytics
  METRICS_READ = 'metrics:read',
  METRICS_ANALYZE = 'metrics:analyze',

  // Integration Management
  INTEGRATION_READ = 'integration:read',
  INTEGRATION_CONFIGURE = 'integration:configure',

  // STIX/TAXII
  STIX_READ = 'stix:read',
  STIX_EXPORT = 'stix:export',
  TAXII_READ = 'taxii:read',
  TAXII_WRITE = 'taxii:write',

  // MISP Integration
  MISP_READ = 'misp:read',
  MISP_CONFIGURE = 'misp:configure',
  MISP_SYNC = 'misp:sync',

  // CVE Management
  CVE_READ = 'cve:read',
  CVE_ENRICH = 'cve:enrich',

  // Dark Web Monitoring
  DARKWEB_READ = 'darkweb:read',
  DARKWEB_CONFIGURE = 'darkweb:configure',

  // Honeypot Management
  HONEYPOT_READ = 'honeypot:read',
  HONEYPOT_CONFIGURE = 'honeypot:configure',

  // Threat Feeds
  THREAT_FEED_READ = 'threat_feed:read',
  THREAT_FEED_CONFIGURE = 'threat_feed:configure'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    Permission.SYSTEM_READ,
    Permission.SYSTEM_CONFIGURE,

    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    Permission.TENANT_READ,
    Permission.TENANT_UPDATE,

    Permission.THREAT_READ,
    Permission.THREAT_CREATE,
    Permission.THREAT_UPDATE,
    Permission.THREAT_DELETE,

    Permission.ALERT_READ,
    Permission.ALERT_CREATE,
    Permission.ALERT_UPDATE,
    Permission.ALERT_ASSIGN,
    Permission.ALERT_RESOLVE,
    Permission.ALERT_CLOSE,

    Permission.CASE_READ,
    Permission.CASE_CREATE,
    Permission.CASE_UPDATE,
    Permission.CASE_CLOSE,

    Permission.IOC_READ,
    Permission.IOC_ENRICH,
    Permission.IOC_UPDATE,

    Permission.PLAYBOOK_READ,
    Permission.PLAYBOOK_CREATE,
    Permission.PLAYbook_UPDATE,
    Permission.PLAYBOOK_EXECUTE,

    Permission.OSINT_READ,
    Permission.OSINT_CONFIGURE,
    Permission.OSINT_COLLECT,
    Permission.TARANIS_ASSESS,
    Permission.TARANIS_ANALYZE,
    Permission.TARANIS_PUBLISH,
    Permission.TARANIS_CONFIG,

    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_EXPORT,

    Permission.METRICS_READ,
    Permission.METRICS_ANALYZE,

    Permission.INTEGRATION_READ,
    Permission.INTEGRATION_CONFIGURE,

    Permission.STIX_READ,
    Permission.STIX_EXPORT,
    Permission.TAXII_READ,
    Permission.TAXII_WRITE,

    Permission.MISP_READ,
    Permission.MISP_CONFIGURE,
    Permission.MISP_SYNC,

    Permission.CVE_READ,
    Permission.CVE_ENRICH,

    Permission.DARKWEB_READ,
    Permission.DARKWEB_CONFIGURE,

    Permission.HONEYPOT_READ,
    Permission.HONEYPOT_CONFIGURE,

    Permission.THREAT_FEED_READ,
    Permission.THREAT_FEED_CONFIGURE
  ],

  [UserRole.ANALYST]: [
    // Read access to most features
    Permission.SYSTEM_READ,

    Permission.USER_READ,

    Permission.TENANT_READ,

    Permission.THREAT_READ,
    Permission.THREAT_CREATE,
    Permission.THREAT_UPDATE,

    Permission.ALERT_READ,
    Permission.ALERT_UPDATE,
    Permission.ALERT_ASSIGN,
    Permission.ALERT_RESOLVE,
    Permission.ALERT_CLOSE,

    Permission.CASE_READ,
    Permission.CASE_CREATE,
    Permission.CASE_UPDATE,
    Permission.CASE_CLOSE,

    Permission.IOC_READ,
    Permission.IOC_ENRICH,
    Permission.IOC_UPDATE,

    Permission.PLAYBOOK_READ,
    Permission.PLAYBOOK_EXECUTE,

    Permission.OSINT_READ,
    Permission.TARANIS_ASSESS,
    Permission.TARANIS_ANALYZE,
    Permission.TARANIS_PUBLISH,

    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_EXPORT,

    Permission.METRICS_READ,
    Permission.METRICS_ANALYZE,

    Permission.INTEGRATION_READ,

    Permission.STIX_READ,
    Permission.STIX_EXPORT,
    Permission.TAXII_READ,

    Permission.MISP_READ,

    Permission.CVE_READ,
    Permission.CVE_ENRICH,

    Permission.DARKWEB_READ,

    Permission.HONEYPOT_READ,

    Permission.THREAT_FEED_READ
  ],

  [UserRole.VIEWER]: [
    // Read-only access
    Permission.SYSTEM_READ,

    Permission.USER_READ,

    Permission.TENANT_READ,

    Permission.THREAT_READ,

    Permission.ALERT_READ,

    Permission.CASE_READ,

    Permission.IOC_READ,

    Permission.PLAYBOOK_READ,

    Permission.OSINT_READ,

    Permission.REPORT_READ,

    Permission.METRICS_READ,

    Permission.INTEGRATION_READ,

    Permission.STIX_READ,
    Permission.TAXII_READ,

    Permission.MISP_READ,

    Permission.CVE_READ,

    Permission.DARKWEB_READ,

    Permission.HONEYPOT_READ,

    Permission.THREAT_FEED_READ
  ]
};

export interface PermissionCheck {
  resource: string;
  action: string;
  tenantId?: string;
}

export interface UserContext {
  id: string;
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
}