import { PrismaClient } from '@prisma/client';
type CaseStatus = 'new' | 'triage' | 'investigating' | 'contained' | 'remediation' | 'closed';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface MetricsPeriod {
  startDate: Date;
  endDate: Date;
}

export class AnalystMetricsService {
  /**
   * Récupérer les métriques d'un analyste pour une période
   */
  static async getAnalystMetrics(
    userId: string,
    period: MetricsPeriod = this.getDefaultPeriod()
  ) {
    try {
      // TODO: Créer modèle analystMetric ou utiliser un modèle existant
      const metrics: any[] = [];

      return metrics;
    } catch (error) {
      logger.error('Erreur récupération métriques analyste:', error);
      throw error;
    }
  }

  /**
   * Calculer les métriques agrégées d'un analyste
   */
  static async calculateAggregatedMetrics(
    userId: string,
    period: MetricsPeriod = this.getDefaultPeriod()
  ) {
    try {
      const [cases, alerts, metrics] = await Promise.all([
        this.getCaseMetrics(userId, period),
        this.getAlertMetrics(userId, period),
        this.getAnalystMetrics(userId, period),
      ]);

      // Calculer les moyennes
      const totalDays = metrics.length || 1;
      const avgCasesPerDay = cases.totalClosed / totalDays;
      const avgAlertsPerDay = alerts.totalTriaged / totalDays;

      // Calculer MTTR moyen
      const avgMTTR =
        metrics.reduce((sum: number, m: any) => sum + m.avgMTTR, 0) / totalDays;

      // Calculer MTTD moyen (Mean Time To Detect)
      const avgMTTD = await this.calculateAvgMTTD(userId, period);

      // Productivité
      const productivity = this.calculateProductivityScore({
        casesPerDay: avgCasesPerDay,
        alertsPerDay: avgAlertsPerDay,
        mttr: avgMTTR,
        mttd: avgMTTD,
      });

      return {
        period: {
          start: period.startDate,
          end: period.endDate,
          days: totalDays,
        },
        cases: {
          total: cases.total,
          closed: cases.totalClosed,
          open: cases.totalOpen,
          inProgress: cases.totalInProgress,
          avgPerDay: avgCasesPerDay,
          bySeverity: cases.bySeverity,
        },
        alerts: {
          total: alerts.total,
          triaged: alerts.totalTriaged,
          avgPerDay: avgAlertsPerDay,
          bySeverity: alerts.bySeverity,
        },
        performance: {
          avgMTTR: Math.round(avgMTTR),
          avgMTTD: Math.round(avgMTTD),
          productivity: Math.round(productivity),
        },
        trends: this.calculateTrends(metrics),
      };
    } catch (error) {
      logger.error('Erreur calcul métriques agrégées:', error);
      throw error;
    }
  }

  /**
   * Comparer les performances entre analystes
   */
  static async compareAnalysts(tenantId: string, period: MetricsPeriod = this.getDefaultPeriod()) {
    try {
      // Récupérer tous les analystes du tenant
      const users = await prisma.user.findMany({
        where: { tenantId, role: 'ANALYST' },
        select: { id: true, name: true, email: true },
      });

      // Calculer les métriques pour chaque analyste
      const comparisons = await Promise.all(
        users.map(async (user) => {
          const metrics = await this.calculateAggregatedMetrics(user.id, period);
          return {
            userId: user.id,
            name: user.name,
            email: user.email,
            metrics,
          };
        })
      );

      // Trier par productivité
      comparisons.sort((a, b) => b.metrics.performance.productivity - a.metrics.performance.productivity);

      return comparisons;
    } catch (error) {
      logger.error('Erreur comparaison analystes:', error);
      throw error;
    }
  }

  /**
   * Obtenir les métriques d'équipe
   */
  static async getTeamMetrics(tenantId: string, period: MetricsPeriod = this.getDefaultPeriod()) {
    try {
      const analysts = await this.compareAnalysts(tenantId, period);

      const totalCases = analysts.reduce((sum, a) => sum + a.metrics.cases.closed, 0);
      const totalAlerts = analysts.reduce((sum, a) => sum + a.metrics.alerts.triaged, 0);
      const avgMTTR =
        analysts.reduce((sum, a) => sum + a.metrics.performance.avgMTTR, 0) /
        analysts.length;
      const avgMTTD =
        analysts.reduce((sum, a) => sum + a.metrics.performance.avgMTTD, 0) /
        analysts.length;

      return {
        teamSize: analysts.length,
        period: {
          start: period.startDate,
          end: period.endDate,
        },
        totals: {
          casesClosed: totalCases,
          alertsTriaged: totalAlerts,
        },
        averages: {
          mttr: Math.round(avgMTTR),
          mttd: Math.round(avgMTTD),
          casesPerAnalyst: Math.round(totalCases / analysts.length),
          alertsPerAnalyst: Math.round(totalAlerts / analysts.length),
        },
        topPerformers: analysts.slice(0, 3),
        allAnalysts: analysts,
      };
    } catch (error) {
      logger.error('Erreur métriques équipe:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les métriques quotidiennes d'un analyste
   */
  static async updateDailyMetrics(userId: string, date: Date = new Date()) {
    try {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Compter les cases fermés
      const casesClosed = await prisma.case.count({
        where: {
          investigator: userId,
          status: 'closed',
          closedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      // Compter les alertes traitées
      const alertsTriaged = await prisma.alert.count({
        where: {
          assignee: userId,
          acknowledgedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      // Compter les menaces analysées
      const threatsAnalyzed = await prisma.case.count({
        where: {
          assignee: userId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });

      // Calculer MTTR moyen du jour
      const closedCases = await prisma.case.findMany({
        where: {
          assignee: userId,
          status: 'closed',
          closedAt: { gte: dayStart, lte: dayEnd },
        },
        select: { createdAt: true, closedAt: true },
      });

      let avgMTTR = 0;
      if (closedCases.length > 0) {
        const totalTime = closedCases.reduce((sum, c) => {
          const diff = c.closedAt!.getTime() - c.createdAt.getTime();
          return sum + diff;
        }, 0);
        avgMTTR = Math.round(totalTime / closedCases.length / 1000 / 60); // en minutes
      }

      // TODO: Créer table analystMetric dans schema.prisma
      // Pour l'instant, on log seulement
      logger.info('Analyst metrics recorded', {
        userId,
        casesClosed,
        alertsTriaged,
        threatsAnalyzed,
        avgMTTR
      });

      logger.info(`Métriques quotidiennes mises à jour pour user ${userId}`);
      return { casesClosed, alertsTriaged, threatsAnalyzed, avgMTTR };
    } catch (error) {
      logger.error('Erreur mise à jour métriques quotidiennes:', error);
      throw error;
    }
  }

  // ========== Méthodes privées ==========

  private static getDefaultPeriod(): MetricsPeriod {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 derniers jours

    endDate.setHours(23, 59, 59, 999);
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
  }

  private static async getCaseMetrics(userId: string, period: MetricsPeriod) {
    const where = {
      assignee: userId,
      createdAt: { gte: period.startDate, lte: period.endDate },
    };

    const [total, totalClosed, totalOpen, totalInProgress, bySeverity] = await Promise.all([
      prisma.case.count({ where }),
      prisma.case.count({ where: { ...where, status: 'closed' } }),
      prisma.case.count({ where: { ...where, status: 'new' } }),
      prisma.case.count({ where: { ...where, status: 'investigating' } }),
      this.getCaseBySeverity(userId, period),
    ]);

    return { total, totalClosed, totalOpen, totalInProgress, bySeverity };
  }

  private static async getAlertMetrics(userId: string, period: MetricsPeriod) {
    const where = {
      assignee: userId,
      createdAt: { gte: period.startDate, lte: period.endDate },
    };

    const [total, totalTriaged, bySeverity] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.count({ where: { ...where, acknowledgedAt: { not: null } } }),
      this.getAlertBySeverity(userId, period),
    ]);

    return { total, totalTriaged, bySeverity };
  }

  private static async getCaseBySeverity(userId: string, period: MetricsPeriod) {
    const where = {
      assignee: userId,
      createdAt: { gte: period.startDate, lte: period.endDate },
    };

    const [critical, high, medium, low] = await Promise.all([
      prisma.case.count({ where: { ...where, severity: 'CRITICAL' } }),
      prisma.case.count({ where: { ...where, severity: 'HIGH' } }),
      prisma.case.count({ where: { ...where, severity: 'MEDIUM' } }),
      prisma.case.count({ where: { ...where, severity: 'LOW' } }),
    ]);

    return { critical, high, medium, low };
  }

  private static async getAlertBySeverity(userId: string, period: MetricsPeriod) {
    const where = {
      assignee: userId,
      createdAt: { gte: period.startDate, lte: period.endDate },
    };

    const [critical, high, medium, low] = await Promise.all([
      prisma.alert.count({ where: { ...where, severity: 'CRITICAL' } }),
      prisma.alert.count({ where: { ...where, severity: 'HIGH' } }),
      prisma.alert.count({ where: { ...where, severity: 'MEDIUM' } }),
      prisma.alert.count({ where: { ...where, severity: 'LOW' } }),
    ]);

    return { critical, high, medium, low };
  }

  private static async calculateAvgMTTD(userId: string, period: MetricsPeriod): Promise<number> {
    // MTTD (Mean Time To Detect) = Temps entre la création d'une alerte et son acknowledgement
    const alerts = await prisma.alert.findMany({
      where: {
        assignee: userId,
        createdAt: { gte: period.startDate, lte: period.endDate },
        acknowledgedAt: { not: null },
      },
      select: { createdAt: true, acknowledgedAt: true },
    });

    if (alerts.length === 0) return 0;

    const totalTime = alerts.reduce((sum, a) => {
      const diff = a.acknowledgedAt!.getTime() - a.createdAt.getTime();
      return sum + diff;
    }, 0);

    return totalTime / alerts.length / 1000 / 60; // en minutes
  }

  private static calculateProductivityScore(data: {
    casesPerDay: number;
    alertsPerDay: number;
    mttr: number;
    mttd: number;
  }): number {
    // Score de productivité (0-100)
    // Formule: (casesPerDay * 10 + alertsPerDay * 5) - (mttr / 10) - (mttd / 10)

    const casesScore = Math.min(data.casesPerDay * 10, 30); // Max 30 points
    const alertsScore = Math.min(data.alertsPerDay * 5, 30); // Max 30 points
    const mttrPenalty = Math.min(data.mttr / 10, 20); // Max -20 points
    const mttdPenalty = Math.min(data.mttd / 10, 20); // Max -20 points

    const score = casesScore + alertsScore - mttrPenalty - mttdPenalty;
    return Math.max(0, Math.min(100, score));
  }

  private static calculateTrends(metrics: any[]) {
    if (metrics.length < 2) {
      return { cases: 0, alerts: 0, mttr: 0 };
    }

    const recent = metrics.slice(0, Math.ceil(metrics.length / 2));
    const older = metrics.slice(Math.ceil(metrics.length / 2));

    const recentAvg = {
      cases: recent.reduce((sum, m) => sum + m.casesClosed, 0) / recent.length,
      alerts: recent.reduce((sum, m) => sum + m.alertsTriaged, 0) / recent.length,
      mttr: recent.reduce((sum, m) => sum + m.avgMTTR, 0) / recent.length,
    };

    const olderAvg = {
      cases: older.reduce((sum, m) => sum + m.casesClosed, 0) / older.length,
      alerts: older.reduce((sum, m) => sum + m.alertsTriaged, 0) / older.length,
      mttr: older.reduce((sum, m) => sum + m.avgMTTR, 0) / older.length,
    };

    return {
      cases: olderAvg.cases > 0 ? ((recentAvg.cases - olderAvg.cases) / olderAvg.cases) * 100 : 0,
      alerts:
        olderAvg.alerts > 0 ? ((recentAvg.alerts - olderAvg.alerts) / olderAvg.alerts) * 100 : 0,
      mttr: olderAvg.mttr > 0 ? ((recentAvg.mttr - olderAvg.mttr) / olderAvg.mttr) * 100 : 0,
    };
  }
}

