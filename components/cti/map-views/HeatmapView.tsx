/**
 * 🔥 Heatmap View - Temporal Activity Heatmap
 * Visualisation de l'activité des sources sur le temps
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface SourceNode {
  id: string;
  name: string;
  alertCount: number;
  trustScore: number;
  status: 'active' | 'inactive' | 'error';
}

interface SourceCluster {
  id: string;
  name: string;
  sources: SourceNode[];
}

interface HeatmapViewProps {
  sources: SourceNode[];
  clusters: SourceCluster[];
  onSourceSelect: (source: SourceNode | null) => void;
  selectedSource: SourceNode | null;
}

export function HeatmapView({ sources, onSourceSelect }: HeatmapViewProps) {
  // Generate mock time series data (dernières 24h, par heure)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const topSources = sources
    .sort((a, b) => b.alertCount - a.alertCount)
    .slice(0, 15);

  const getIntensityColor = (value: number): string => {
    if (value === 0) return '#1e293b';
    if (value < 5) return '#3b82f6';
    if (value < 10) return '#f59e0b';
    if (value < 20) return '#ef4444';
    return '#dc2626';
  };

  const getIntensityValue = (source: SourceNode, hour: number): number => {
    // Mock data generation basée sur source metrics
    const base = source.alertCount / 24;
    const variance = Math.random() * base * 0.5;
    return Math.round(base + variance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Source Activity Heatmap (Last 24h)</span>
          <div className="flex items-center gap-2 text-xs font-normal">
            <span className="text-muted-foreground">Intensity:</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e293b' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Time labels */}
            <div className="flex mb-2">
              <div className="w-40" /> {/* Spacer for source names */}
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="flex-1 min-w-[30px] text-center text-xs text-muted-foreground"
                >
                  {hour}h
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {topSources.map(source => {
              const hourlyData = hours.map(hour => ({
                hour,
                value: getIntensityValue(source, hour)
              }));

              return (
                <div 
                  key={source.id} 
                  className="flex items-center mb-1 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                  onClick={() => onSourceSelect(source)}
                >
                  {/* Source name */}
                  <div className="w-40 pr-2 text-sm truncate">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          source.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                        }`} 
                      />
                      <span>{source.name.substring(0, 18)}</span>
                    </div>
                  </div>

                  {/* Heatmap cells */}
                  {hourlyData.map(({ hour, value }) => (
                    <div 
                      key={hour}
                      className="flex-1 min-w-[30px] h-8 mx-0.5 rounded transition-all hover:scale-110 hover:shadow-lg"
                      style={{ 
                        backgroundColor: getIntensityColor(value),
                        boxShadow: value > 15 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                      }}
                      title={`${source.name} @ ${hour}h: ${value} alerts`}
                    />
                  ))}

                  {/* Total count */}
                  <div className="w-16 text-right text-sm font-semibold ml-2">
                    <Badge variant={source.alertCount > 50 ? 'destructive' : 'secondary'}>
                      {source.alertCount}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {sources.filter(s => s.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {sources.reduce((sum, s) => sum + s.alertCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(sources.reduce((sum, s) => sum + s.alertCount, 0) / 24)}
            </div>
            <div className="text-xs text-muted-foreground">Avg/Hour</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.max(...sources.map(s => s.alertCount))}
            </div>
            <div className="text-xs text-muted-foreground">Peak Source</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

