/**
 * 🎯 ThreatCard - Composant atomique pour afficher une threat
 * Réutilisable, TypeScript strict, aligné backend
 */

import { useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  AlertTriangle,
  Shield,
  Clock,
  ExternalLink,
  Download,
  Bell,
  ChevronDown,
  ChevronUp,
  Hash,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface Threat {
  id: string;
  title: string;
  description?: string;
  created: string;
  updated: string;
  read: boolean;
  important: boolean;
  relevance: number;
  summary?: string;
  news_items?: any[];
  tags?: Array<{ name: string; tag_type: string }>;
  links?: string[];
}

interface ThreatCardProps {
  threat: Threat;
  onCreateAlert?: (threat: Threat) => void;
  onAddToReport?: (threat: Threat) => void;
  onExport?: (threat: Threat) => void;
  onSelect?: (threat: Threat) => void;
  selected?: boolean;
  expandable?: boolean;
  variant?: 'compact' | 'full';
}

export function ThreatCard({
  threat,
  onCreateAlert,
  onAddToReport,
  onExport,
  onSelect,
  selected = false,
  expandable = true,
  variant = 'full'
}: ThreatCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (relevance: number) => {
    if (relevance >= 4) return 'bg-red-900/30 border-red-500/50 text-red-200';
    if (relevance >= 3) return 'bg-orange-900/30 border-orange-500/50 text-orange-200';
    if (relevance >= 2) return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200';
    return 'bg-blue-900/30 border-blue-500/50 text-blue-200';
  };

  const getSeverityBadge = (relevance: number) => {
    if (relevance >= 4) return { label: 'CRITIQUE', color: 'bg-red-600' };
    if (relevance >= 3) return { label: 'ÉLEVÉ', color: 'bg-orange-600' };
    if (relevance >= 2) return { label: 'MOYEN', color: 'bg-yellow-600' };
    return { label: 'INFO', color: 'bg-blue-600' };
  };

  const severity = getSeverityBadge(threat.relevance);
  const timeAgo = formatDistanceToNow(new Date(threat.created), { 
    addSuffix: true, 
    locale: fr 
  });

  return (
    <Card
      className={`
        border-2 transition-all hover:shadow-lg
        ${getSeverityColor(threat.relevance)}
        ${selected ? 'ring-2 ring-cyan-500 shadow-cyan-500/30' : ''}
        ${onSelect ? 'cursor-pointer' : ''}
      `}
      onClick={() => onSelect?.(threat)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${severity.color} text-white border-0`}>
                {severity.label}
              </Badge>
              
              {threat.important && (
                <Badge className="bg-purple-600 text-white border-0">
                  <Shield className="w-3 h-3 mr-1" />
                  Important
                </Badge>
              )}
              
              {!threat.read && (
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                  Nouveau
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-white text-lg mb-1 leading-tight">
              {threat.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
              
              {threat.news_items && threat.news_items.length > 0 && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {threat.news_items.length} sources
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Score: {threat.relevance}
              </span>
            </div>
          </div>

          {/* Actions */}
          {variant === 'full' && (
            <div className="flex gap-2">
              {onCreateAlert && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateAlert(threat);
                  }}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              )}
              
              {onExport && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(threat);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Description / Summary */}
        {(threat.description || threat.summary) && (
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {threat.summary || threat.description}
          </p>
        )}

        {/* Tags */}
        {threat.tags && threat.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {threat.tags.slice(0, 5).map((tag, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="border-slate-600 text-slate-400 text-xs"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
            {threat.tags.length > 5 && (
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                +{threat.tags.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Expandable section */}
        {expandable && (
          <>
            {expanded && threat.news_items && threat.news_items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Sources ({threat.news_items.length})
                </h4>
                <div className="space-y-2">
                  {threat.news_items.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400 transition flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expand/Collapse button */}
            {threat.news_items && threat.news_items.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Moins de détails
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Plus de détails
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

