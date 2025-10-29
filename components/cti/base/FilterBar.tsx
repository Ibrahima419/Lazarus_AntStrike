/**
 * 🔍 FilterBar - Barre de filtres réutilisable
 */

import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Search,
  Filter,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export interface Filters {
  search?: string;
  severity?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showSeverity?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  showDateRange?: boolean;
}

export function FilterBar({
  filters,
  onChange,
  showSeverity = true,
  showStatus = true,
  showPriority = true,
  showDateRange = false
}: FilterBarProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    onChange({});
  };

  const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
  const statusOptions = ['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'];
  const priorityOptions = ['P0', 'P1', 'P2', 'P3'];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher par titre, IOC, CVE..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Severity Filter */}
        {showSeverity && (
          <div className="flex gap-1">
            {severityOptions.map((sev) => (
              <Badge
                key={sev}
                variant={filters.severity === sev ? 'default' : 'outline'}
                className={`
                  cursor-pointer transition-all
                  ${filters.severity === sev 
                    ? 'bg-cyan-600 text-white' 
                    : 'border-slate-600 text-slate-400 hover:border-cyan-500/50'
                  }
                `}
                onClick={() =>
                  onChange({
                    ...filters,
                    severity: filters.severity === sev ? undefined : sev
                  })
                }
              >
                {sev}
              </Badge>
            ))}
          </div>
        )}

        {/* Status Filter */}
        {showStatus && (
          <div className="flex gap-1">
            {statusOptions.map((stat) => (
              <Badge
                key={stat}
                variant={filters.status === stat ? 'default' : 'outline'}
                className={`
                  cursor-pointer transition-all
                  ${filters.status === stat 
                    ? 'bg-cyan-600 text-white' 
                    : 'border-slate-600 text-slate-400 hover:border-cyan-500/50'
                  }
                `}
                onClick={() =>
                  onChange({
                    ...filters,
                    status: filters.status === stat ? undefined : stat
                  })
                }
              >
                {stat}
              </Badge>
            ))}
          </div>
        )}

        {/* Priority Filter */}
        {showPriority && (
          <div className="flex gap-1">
            {priorityOptions.map((pri) => (
              <Badge
                key={pri}
                variant={filters.priority === pri ? 'default' : 'outline'}
                className={`
                  cursor-pointer transition-all
                  ${filters.priority === pri 
                    ? 'bg-cyan-600 text-white' 
                    : 'border-slate-600 text-slate-400 hover:border-cyan-500/50'
                  }
                `}
                onClick={() =>
                  onChange({
                    ...filters,
                    priority: filters.priority === pri ? undefined : pri
                  })
                }
              >
                {pri}
              </Badge>
            ))}
          </div>
        )}

        {/* Clear All */}
        {activeFiltersCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-1" />
            Effacer ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
}

