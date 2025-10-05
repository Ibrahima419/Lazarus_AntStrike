/**
 * 📊 Source Performance Panel
 * Panel latéral affichant les métriques de performance des sources
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, Zap, Target, XCircle 
} from 'lucide-react';

interface SourceNode {
  id: string;
  name: string;
  type: string;
  url?: string;
  alertCount: number;
  trustScore: number;
  status: 'active' | 'inactive' | 'error';
  lastCollected: Date;
}

interface SourcePerformancePanelProps {
  sources: SourceNode[];
  selectedSource: SourceNode | null;
  onSourceSelect: (source: SourceNode | null) => void;
}

export function SourcePerformancePanel({ 
  sources, 
  selectedSource, 
  onSourceSelect 
}: SourcePerformancePanelProps) {
  
  // Sort sources by trust score
  const topPerformers = sources
    .filter(s => s.status === 'active')
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 5);

  const underPerformers = sources
    .filter(s => s.status === 'active')
    .sort((a, b) => a.trustScore - b.trustScore)
    .slice(0, 3);

  const getTrustColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrustVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getTimeSinceCollection = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {/* Selected Source Details */}
      {selectedSource ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Source Details</CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onSourceSelect(null)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{selectedSource.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{selectedSource.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={selectedSource.status === 'active' ? 'default' : 'secondary'}>
                    {selectedSource.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alerts (24h)</span>
                  <Badge variant="destructive">{selectedSource.alertCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Collected</span>
                  <span className="text-xs">{getTimeSinceCollection(selectedSource.lastCollected)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Trust Score</span>
                <span className={`text-sm font-bold ${getTrustColor(selectedSource.trustScore)}`}>
                  {selectedSource.trustScore}/100
                </span>
              </div>
              <Progress value={selectedSource.trustScore} className="h-2" />
            </div>

            {selectedSource.url && (
              <div>
                <span className="text-xs text-muted-foreground">URL</span>
                <div className="text-xs font-mono mt-1 p-2 bg-muted rounded break-all">
                  {selectedSource.url}
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button size="sm" className="flex-1">
                <Zap className="w-4 h-4 mr-1" />
                Collect Now
              </Button>
              <Button size="sm" variant="outline">
                <Target className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Overview when no source selected */
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Active</span>
              </div>
              <span className="font-bold">{sources.filter(s => s.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Inactive</span>
              </div>
              <span className="font-bold">{sources.filter(s => s.status === 'inactive').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm">Error</span>
              </div>
              <span className="font-bold">{sources.filter(s => s.status === 'error').length}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPerformers.map((source, index) => (
            <div 
              key={source.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onSourceSelect(source)}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{source.name}</div>
                <div className="text-xs text-muted-foreground">{source.alertCount} alerts</div>
              </div>
              <Badge variant={getTrustVariant(source.trustScore)} className="shrink-0">
                {source.trustScore}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Under Performers */}
      {underPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {underPerformers.map((source) => (
              <div 
                key={source.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onSourceSelect(source)}
              >
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{source.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Trust: {source.trustScore}/100
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Fix
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-medium">Review Inactive Sources</div>
              <div className="text-xs text-muted-foreground">
                {sources.filter(s => s.status === 'inactive').length} sources haven't collected in 24h
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-medium">Tune Thresholds</div>
              <div className="text-xs text-muted-foreground">
                Optimize {underPerformers.length} low-scoring sources
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-medium">Add Coverage</div>
              <div className="text-xs text-muted-foreground">
                Consider adding Dark Web sources
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

