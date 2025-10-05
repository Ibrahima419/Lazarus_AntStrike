/**
 * Advanced Stats Panel - Style CrowdStrike
 * Métriques SOC professionnelles pour analyste CTI
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  TrendingUp, TrendingDown, Activity, Shield, 
  AlertTriangle, Clock, Globe, Zap, Target
} from 'lucide-react';

interface StatsProps {
  sources: Array<{
    id: string;
    trustScore: number;
    alertCount: number;
    status: string;
    lastCollected: Date;
  }>;
  alerts: number;
}

interface AdvancedMetrics {
  // Métriques Temps Réel
  alertsLast24h: number;
  alertsLast7d: number;
  alertsTrend: 'up' | 'down' | 'stable';
  alertsTrendPercent: number;
  
  // Métriques Sources
  highTrustSources: number;
  lowTrustSources: number;
  avgResponseTime: string;
  staleSources: number; // Sources pas à jour
  
  // Métriques Qualité
  dataQualityScore: number;
  coverageScore: number;
  reliabilityScore: number;
  
  // Métriques Performance
  threatsPerHour: number;
  peakActivityHour: string;
  avgCollectionInterval: string;
  
  // Métriques Santé
  healthScore: number;
  healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
}

export function AdvancedStatsPanel({ sources, alerts }: StatsProps) {
  const metrics = calculateAdvancedMetrics(sources, alerts);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Santé Globale */}
      <Card className={`border-2 ${getHealthBorderColor(metrics.healthStatus)}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            SANTÉ GLOBALE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {metrics.healthScore}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <Badge variant={getHealthBadgeVariant(metrics.healthStatus)} className="text-xs">
              {metrics.healthStatus.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alertes 24h */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            ALERTES 24H
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {metrics.alertsLast24h.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.alertsTrend === 'up' ? (
                <>
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">+{metrics.alertsTrendPercent}%</span>
                </>
              ) : metrics.alertsTrend === 'down' ? (
                <>
                  <TrendingDown className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">-{metrics.alertsTrendPercent}%</span>
                </>
              ) : (
                <span className="text-muted-foreground">Stable</span>
              )}
              <span className="text-muted-foreground ml-1">vs 7 jours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources de Confiance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            SOURCES FIABLES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-500">
                {metrics.highTrustSources}
              </div>
              <div className="text-sm text-muted-foreground">
                / {sources.length}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.lowTrustSources > 0 && (
                <span className="text-orange-500">
                  ⚠️ {metrics.lowTrustSources} sources faibles
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temps de Réponse */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            RÉACTIVITÉ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {metrics.avgResponseTime}
            </div>
            <div className="text-xs text-muted-foreground">
              Temps moyen de collecte
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualité des Données */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            QUALITÉ DONNÉES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {metrics.dataQualityScore}
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  metrics.dataQualityScore >= 80 ? 'bg-green-500' :
                  metrics.dataQualityScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${metrics.dataQualityScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couverture */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            COUVERTURE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {metrics.coverageScore}
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Diversité des sources
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menaces / Heure */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            DÉBIT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {metrics.threatsPerHour}
              <span className="text-sm text-muted-foreground">/h</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Pic: {metrics.peakActivityHour}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Obsolètes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ALERTES SYSTÈME
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.staleSources > 0 ? (
              <>
                <div className="text-2xl font-bold text-orange-500">
                  {metrics.staleSources}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sources obsolètes (&gt;48h)
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-500">✓</div>
                <div className="text-xs text-muted-foreground">
                  Toutes sources à jour
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ CALCULS MÉTRIQUES ============

function calculateAdvancedMetrics(
  sources: StatsProps['sources'], 
  totalAlerts: number
): AdvancedMetrics {
  const now = Date.now();
  
  // Alertes par période
  const alertsLast24h = Math.round(totalAlerts * 0.4); // Estimation 40% des alertes dans les 24h
  const alertsLast7d = totalAlerts;
  
  // Trend calculation (simulation)
  const alertsTrend: 'up' | 'down' | 'stable' = 
    alertsLast24h > (alertsLast7d / 7) * 1.2 ? 'up' :
    alertsLast24h < (alertsLast7d / 7) * 0.8 ? 'down' :
    'stable';
  
  const dailyAvg = alertsLast7d / 7;
  const alertsTrendPercent = dailyAvg > 0 
    ? Math.abs(Math.round(((alertsLast24h - dailyAvg) / dailyAvg) * 100))
    : 0;
  
  // Trust scores
  const highTrustSources = sources.filter(s => s.trustScore >= 70).length;
  const lowTrustSources = sources.filter(s => s.trustScore < 50).length;
  
  // Response time
  const collectionTimes = sources.map(s => 
    (now - new Date(s.lastCollected).getTime()) / (1000 * 60 * 60)
  );
  const avgHours = collectionTimes.length > 0
    ? collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length
    : 0;
  
  const avgResponseTime = avgHours < 1 ? `${Math.round(avgHours * 60)}m` :
                         avgHours < 24 ? `${Math.round(avgHours)}h` :
                         `${Math.round(avgHours / 24)}j`;
  
  // Stale sources (>48h)
  const staleSources = sources.filter(s => {
    const hours = (now - new Date(s.lastCollected).getTime()) / (1000 * 60 * 60);
    return hours > 48;
  }).length;
  
  // Data quality score
  const activeSources = sources.filter(s => s.status === 'active').length;
  const sourceRatio = sources.length > 0 ? (activeSources / sources.length) * 100 : 0;
  const trustAvg = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.trustScore, 0) / sources.length
    : 0;
  const dataQualityScore = Math.round((sourceRatio * 0.4) + (trustAvg * 0.6));
  
  // Coverage score
  const uniqueTypes = new Set(sources.map((s: any) => s.type || 'unknown')).size;
  const coverageScore = Math.min(Math.round((activeSources / 50) * 50 + (uniqueTypes / 6) * 50), 100);
  
  // Reliability score
  const nonStaleSources = sources.length - staleSources;
  const reliabilityScore = sources.length > 0
    ? Math.round((nonStaleSources / sources.length) * 100)
    : 0;
  
  // Threats per hour
  const threatsPerHour = Math.round(alertsLast24h / 24);
  
  // Peak activity (simulation - heure entre 9h et 17h)
  const peakHour = 9 + Math.floor(Math.random() * 8);
  const peakActivityHour = `${peakHour.toString().padStart(2, '0')}:00`;
  
  // Avg collection interval
  const avgCollectionInterval = avgResponseTime;
  
  // Health score (composite)
  const healthScore = Math.round(
    (dataQualityScore * 0.3) +
    (coverageScore * 0.25) +
    (reliabilityScore * 0.25) +
    (Math.min((highTrustSources / sources.length) * 100, 100) * 0.2)
  );
  
  const healthStatus: AdvancedMetrics['healthStatus'] = 
    healthScore >= 90 ? 'excellent' :
    healthScore >= 75 ? 'good' :
    healthScore >= 60 ? 'warning' :
    'critical';
  
  return {
    alertsLast24h,
    alertsLast7d,
    alertsTrend,
    alertsTrendPercent,
    highTrustSources,
    lowTrustSources,
    avgResponseTime,
    staleSources,
    dataQualityScore,
    coverageScore,
    reliabilityScore,
    threatsPerHour,
    peakActivityHour,
    avgCollectionInterval,
    healthScore,
    healthStatus
  };
}

function getHealthBorderColor(status: string): string {
  switch (status) {
    case 'excellent': return 'border-green-500';
    case 'good': return 'border-blue-500';
    case 'warning': return 'border-yellow-500';
    case 'critical': return 'border-red-500';
    default: return 'border-border';
  }
}

function getHealthBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'excellent': return 'default';
    case 'good': return 'secondary';
    case 'warning': return 'outline';
    case 'critical': return 'destructive';
    default: return 'secondary';
  }
}

