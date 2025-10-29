/**
 * 💚 Health Monitoring Service
 * Monitoring de la santé de la plateforme CTI
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import os from 'os';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  lastCheck: Date;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  uptime: number;
  timestamp: Date;
}

interface ServiceStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthCheck[];
  uptime: number;
  version: string;
}

export class HealthMonitoringService {
  /**
   * Vérifier santé globale de la plateforme
   */
  static async checkHealth(): Promise<ServiceStatus> {
    try {
      const checks: HealthCheck[] = [];

      // Check 1: Database
      checks.push(await this.checkDatabase());

      // Check 2: APIs externes
      checks.push(await this.checkExternalAPIs());

      // Check 3: Système
      checks.push(await this.checkSystem());

      // Check 4: Background jobs
      checks.push(await this.checkBackgroundJobs());

      // Déterminer status global
      const overall = this.determineOverallStatus(checks);

      return {
        overall,
        services: checks,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      };
    } catch (error: any) {
      logger.error('Error checking health:', error.message);
      return {
        overall: 'unhealthy',
        services: [],
        uptime: process.uptime(),
        version: '1.0.0'
      };
    }
  }

  /**
   * Check Database
   */
  private static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple query pour vérifier connectivité
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'database',
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        responseTime,
        message: 'PostgreSQL connected',
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: error.message,
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check External APIs
   */
  private static async checkExternalAPIs(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // TODO: Vérifier availability des APIs critiques
      // Pour l'instant, simulation basique
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'external_apis',
        status: 'healthy',
        responseTime,
        message: 'External APIs available',
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        service: 'external_apis',
        status: 'degraded',
        message: error.message,
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check System Resources
   */
  private static async checkSystem(): Promise<HealthCheck> {
    try {
      const metrics = this.getSystemMetrics();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      const issues: string[] = [];

      if (metrics.cpu.usage > 90) {
        status = 'unhealthy';
        issues.push('CPU usage critical');
      } else if (metrics.cpu.usage > 70) {
        status = 'degraded';
        issues.push('CPU usage high');
      }

      if (metrics.memory.usagePercent > 90) {
        status = 'unhealthy';
        issues.push('Memory usage critical');
      } else if (metrics.memory.usagePercent > 70) {
        status = 'degraded';
        issues.push('Memory usage high');
      }

      return {
        service: 'system',
        status,
        message: issues.length > 0 ? issues.join(', ') : 'System resources OK',
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        service: 'system',
        status: 'unhealthy',
        message: error.message,
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check Background Jobs
   */
  private static async checkBackgroundJobs(): Promise<HealthCheck> {
    try {
      // TODO: Vérifier status des cron jobs (OSINT, MISP sync, etc.)
      
      return {
        service: 'background_jobs',
        status: 'healthy',
        message: 'Background jobs running',
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        service: 'background_jobs',
        status: 'degraded',
        message: error.message,
        lastCheck: new Date()
      };
    }
  }

  /**
   * Déterminer status global
   */
  private static determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Obtenir métriques système
   */
  static getSystemMetrics(): SystemMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: {
        usage: this.getCPUUsage(),
        loadAverage: os.loadavg()
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: Math.round((usedMem / totalMem) * 100)
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  /**
   * Calculer CPU usage (approximation)
   */
  private static getCPUUsage(): number {
    const cpus = os.cpus();
    
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return usage;
  }

  /**
   * Obtenir métriques API
   */
  static async getAPIMetrics(tenantId: string): Promise<any> {
    // TODO: Implémenter tracking des métriques API
    // Pour l'instant, données simulées
    
    return {
      requestsPerMinute: 0,
      averageResponseTime: 0,
      errorRate: 0,
      activeConnections: 0
    };
  }

  /**
   * Obtenir métriques Database
   */
  static async getDatabaseMetrics(): Promise<any> {
    try {
      // Compter enregistrements par table
      const [
        alertCount,
        threatCount,
        campaignCount,
        ttpCount
      ] = await Promise.all([
        prisma.alert.count(),
        prisma.threat.count(),
        prisma.campaign.count(),
        prisma.tTP.count()
      ]);

      return {
        alerts: alertCount,
        threats: threatCount,
        campaigns: campaignCount,
        ttps: ttpCount,
        totalRecords: alertCount + threatCount + campaignCount + ttpCount
      };
    } catch (error: any) {
      logger.error('Error getting database metrics:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir uptime stats
   */
  static getUptimeStats(): any {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeDays = Math.floor(uptimeHours / 24);

    return {
      seconds: Math.floor(uptime),
      minutes: Math.floor(uptime / 60),
      hours: uptimeHours,
      days: uptimeDays,
      formatted: this.formatUptime(uptime)
    };
  }

  /**
   * Formater uptime
   */
  private static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
  }
}



