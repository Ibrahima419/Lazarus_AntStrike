/**
 * Types partagés pour les composants de carte
 */

export interface SourceNode {
  id: string;
  name: string;
  type: string;
  url?: string;
  enabled: boolean;
  alertCount: number;
  trustScore: number;
  lastCollected: Date;
  status: 'active' | 'inactive' | 'error';
  coordinates?: [number, number];
  color?: string;
}

export interface SourceCluster {
  id: string;
  name: string;
  type: 'threat-intel' | 'social' | 'dark-web' | 'news' | 'technical';
  sources: SourceNode[];
  alertCount: number;
  confidence: number;
  lastUpdate: Date;
}

