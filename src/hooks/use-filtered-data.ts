/**
 * 🔍 useFilteredData - Hook pour filtrer données (threats, alerts, etc.)
 */

import { useMemo } from 'react';
import type { Threat } from '../../components/cti/base/ThreatCard';
import type { Alert } from '../../components/cti/base/AlertCard';
import type { Filters } from '../../components/cti/base/FilterBar';

export function useFilteredThreats(threats: Threat[] | undefined | null, filters: Filters): Threat[] {
  return useMemo(() => {
    if (!threats || !Array.isArray(threats)) return [];

    let filtered = [...threats];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.summary?.toLowerCase().includes(searchLower)
      );
    }

    // Severity filter (via relevance)
    if (filters.severity) {
      filtered = filtered.filter(t => {
        if (filters.severity === 'CRITICAL') return t.relevance >= 4;
        if (filters.severity === 'HIGH') return t.relevance === 3;
        if (filters.severity === 'MEDIUM') return t.relevance === 2;
        if (filters.severity === 'LOW') return t.relevance <= 1;
        return true;
      });
    }

    return filtered;
  }, [threats, filters]);
}

export function useFilteredAlerts(alerts: Alert[] | undefined | null, filters: Filters): Alert[] {
  return useMemo(() => {
    if (!alerts || !Array.isArray(alerts)) return [];

    let filtered = [...alerts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.title.toLowerCase().includes(searchLower) ||
          a.summary.toLowerCase().includes(searchLower) ||
          a.iocs.some(ioc => ioc.toLowerCase().includes(searchLower))
      );
    }

    // Severity filter
    if (filters.severity) {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(a => a.priority === filters.priority);
    }

    return filtered;
  }, [alerts, filters]);
}

