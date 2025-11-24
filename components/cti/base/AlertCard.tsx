/**
 * 🚨 AlertCard - Composant pour afficher une alerte avec workflow
 * Aligné avec le backend (Severity, Priority, Category, Status)
 */

import { useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  X,
  Shield,
  Hash
} from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Alert } from '../../../src/services/api/alert.service';

export type { Alert };

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAssign?: (id: string, userId: string) => void;
  compact?: boolean;
}

export function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onDelete,
  compact = false
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          color: 'bg-red-900/30 border-red-500',
          badge: 'bg-red-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          text: 'CRITIQUE'
        };
      case 'HIGH':
        return {
          color: 'bg-orange-900/30 border-orange-500',
          badge: 'bg-orange-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          text: 'ÉLEVÉ'
        };
      case 'MEDIUM':
        return {
          color: 'bg-yellow-900/30 border-yellow-500',
          badge: 'bg-yellow-600',
          icon: <Shield className="w-5 h-5" />,
          text: 'MOYEN'
        };
      default:
        return {
          color: 'bg-blue-900/30 border-blue-500',
          badge: 'bg-blue-600',
          icon: <Shield className="w-5 h-5" />,
          text: 'INFO'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NEW':
        return { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'NOUVEAU', pulse: true };
      case 'ACKNOWLEDGED':
        return { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'RECONNU' };
      case 'INVESTIGATING':
        return { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'EN COURS' };
      case 'RESOLVED':
        return { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'RÉSOLU' };
      case 'FALSE_POSITIVE':
        return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: 'FAUX POSITIF' };
      default:
        return { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', text: status };
    }
  };

  const severityConfig = getSeverityConfig(alert.severity);
  const statusConfig = getStatusConfig(alert.status);
  
  // SLA calculation
  const slaMinutesLeft = differenceInMinutes(new Date(alert.slaDeadline), new Date());
  const slaExpired = slaMinutesLeft < 0;
  const slaCritical = slaMinutesLeft < 60 && slaMinutesLeft > 0;

  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { 
    addSuffix: true, 
    locale: fr 
  });

  return (
    <Card className={`${severityConfig.color} border-2 transition-all hover:shadow-lg`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Severity Badge */}
              <Badge className={`${severityConfig.badge} text-white border-0`}>
                {severityConfig.icon}
                <span className="ml-1">{severityConfig.text}</span>
              </Badge>

              {/* Priority Badge */}
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {alert.priority}
              </Badge>

              {/* Category */}
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                {alert.category}
              </Badge>

              {/* Status */}
              <Badge className={`${statusConfig.color} border`}>
                {statusConfig.pulse && (
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></span>
                )}
                {statusConfig.text}
              </Badge>
            </div>

            <h3 className="font-semibold text-white text-lg mb-1 leading-tight">
              {alert.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
              
              {alert.iocs && alert.iocs.length > 0 && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {alert.iocs.length} IOCs
                </span>
              )}

              {alert.assignedTo && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Assigné
                </span>
              )}
            </div>
          </div>

          {/* SLA Indicator */}
          <div className="text-right">
            <div
              className={`
                text-xs font-mono px-2 py-1 rounded
                ${slaExpired ? 'bg-red-500/20 text-red-300' : ''}
                ${slaCritical ? 'bg-yellow-500/20 text-yellow-300 animate-pulse' : ''}
                ${!slaExpired && !slaCritical ? 'bg-green-500/20 text-green-300' : ''}
              `}
            >
              SLA: {slaExpired ? 'EXPIRÉ' : slaCritical ? `${slaMinutesLeft}m` : 'OK'}
            </div>
          </div>
        </div>

        {/* Summary */}
        {!compact && (
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {alert.summary}
          </p>
        )}

        {/* IOCs */}
        {!compact && alert.iocs && alert.iocs.length > 0 && (
          <div className="mb-3 p-2 bg-slate-800/50 rounded border border-slate-700">
            <div className="text-xs font-semibold text-slate-400 mb-1">IOCs:</div>
            <div className="flex flex-wrap gap-1">
              {alert.iocs.slice(0, 3).map((ioc, idx) => (
                <code
                  key={idx}
                  className="text-xs bg-red-500/10 text-red-300 px-2 py-0.5 rounded border border-red-500/30"
                >
                  {ioc}
                </code>
              ))}
              {alert.iocs.length > 3 && (
                <span className="text-xs text-slate-500">+{alert.iocs.length - 3} plus</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!compact && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
            {alert.status === 'NEW' && onAcknowledge && (
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => onAcknowledge(alert.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Reconnaître
              </Button>
            )}

            {(alert.status === 'ACKNOWLEDGED' || alert.status === 'INVESTIGATING') && onResolve && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onResolve(alert.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Résoudre
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => setExpanded(!expanded)}
            >
              <FileText className="w-4 h-4 mr-1" />
              Détails
            </Button>

            {onDelete && alert.status === 'RESOLVED' && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 ml-auto"
                onClick={() => onDelete(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-700 space-y-3">
            {/* Recommended Actions */}
            {alert.recommendedActions && alert.recommendedActions.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  Actions Recommandées:
                </div>
                <ul className="space-y-1">
                  {alert.recommendedActions.map((action, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Créée:</span>
                <span className="text-slate-300 ml-2">
                  {new Date(alert.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              {alert.acknowledgedAt && (
                <div>
                  <span className="text-slate-500">Reconnue:</span>
                  <span className="text-slate-300 ml-2">
                    {new Date(alert.acknowledgedAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

