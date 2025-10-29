/**
 * 📊 StatsCard - Carte statistique réutilisable avec sparkline
 */

import { ReactNode } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'cyan' | 'purple';
  sparkline?: number[];
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  color = 'blue',
  sparkline,
  onClick,
  loading = false
}: StatsCardProps) {
  const colorConfig = {
    red: {
      bg: 'from-red-900/50 to-red-800/30',
      border: 'border-red-500/30',
      icon: 'bg-red-600',
      text: 'text-red-200',
      trend: 'text-red-300'
    },
    orange: {
      bg: 'from-orange-900/50 to-orange-800/30',
      border: 'border-orange-500/30',
      icon: 'bg-orange-600',
      text: 'text-orange-200',
      trend: 'text-orange-300'
    },
    yellow: {
      bg: 'from-yellow-900/50 to-yellow-800/30',
      border: 'border-yellow-500/30',
      icon: 'bg-yellow-600',
      text: 'text-yellow-200',
      trend: 'text-yellow-300'
    },
    green: {
      bg: 'from-green-900/50 to-green-800/30',
      border: 'border-green-500/30',
      icon: 'bg-green-600',
      text: 'text-green-200',
      trend: 'text-green-300'
    },
    blue: {
      bg: 'from-blue-900/50 to-blue-800/30',
      border: 'border-blue-500/30',
      icon: 'bg-blue-600',
      text: 'text-blue-200',
      trend: 'text-blue-300'
    },
    cyan: {
      bg: 'from-cyan-900/50 to-cyan-800/30',
      border: 'border-cyan-500/30',
      icon: 'bg-cyan-600',
      text: 'text-cyan-200',
      trend: 'text-cyan-300'
    },
    purple: {
      bg: 'from-purple-900/50 to-purple-800/30',
      border: 'border-purple-500/30',
      icon: 'bg-purple-600',
      text: 'text-purple-200',
      trend: 'text-purple-300'
    }
  };

  const config = colorConfig[color];

  if (loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-10 w-10 bg-slate-700 rounded-lg"></div>
            <div className="h-4 bg-slate-700 rounded w-24"></div>
            <div className="h-8 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`
        bg-gradient-to-br ${config.bg} ${config.border} border
        transition-all hover:shadow-lg hover:shadow-${color}-500/20
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${config.icon} rounded-lg flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          
          {trend && (
            <Badge className={`${config.trend} bg-transparent border-0 flex items-center gap-1`}>
              {trendUp !== false ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-400 font-medium">
            {label}
          </p>
          <p className={`text-3xl font-bold ${config.text}`}>
            {value}
          </p>
        </div>

        {/* Sparkline (mini chart) */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {sparkline.map((val, idx) => {
              const max = Math.max(...sparkline);
              const height = (val / max) * 100;
              return (
                <div
                  key={idx}
                  className={`flex-1 bg-${color}-500/50 rounded-t transition-all hover:bg-${color}-500`}
                  style={{ height: `${height}%` }}
                ></div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

