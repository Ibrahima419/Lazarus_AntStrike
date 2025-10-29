/**
 * 📊 useThreatStats - Hook pour calculer statistiques des threats
 */

import { useMemo } from 'react';
import type { Threat } from '../../components/cti/base/ThreatCard';

export interface ThreatStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unread: number;
  important: number;
  last24h: number;
}

export function useThreatStats(threats: Threat[] | undefined): ThreatStats {
  return useMemo(() => {
    if (!threats || threats.length === 0) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unread: 0,
        important: 0,
        last24h: 0
      };
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      total: threats.length,
      critical: threats.filter(t => t.relevance >= 4).length,
      high: threats.filter(t => t.relevance === 3).length,
      medium: threats.filter(t => t.relevance === 2).length,
      low: threats.filter(t => t.relevance <= 1).length,
      unread: threats.filter(t => !t.read).length,
      important: threats.filter(t => t.important).length,
      last24h: threats.filter(t => new Date(t.created) > oneDayAgo).length
    };
  }, [threats]);
}

