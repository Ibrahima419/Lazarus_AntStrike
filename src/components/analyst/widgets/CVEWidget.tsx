/**
 * 🚨 CVE Widget - Affiche les vulnérabilités (CVEs) critiques
 * Redesign: Cyber Threat Style
 */

import { ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface CVEWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function CVEWidget({ cluster, onTagClick }: CVEWidgetProps) {
    const getSeverityColor = (cveName: string) => {
        const year = parseInt(cveName.split('-')[1]);
        return year >= 2025 ? '#ef4444' : year >= 2024 ? '#f59e0b' : '#64748b';
    };

    const getSeverityGlow = (cveName: string) => {
        const year = parseInt(cveName.split('-')[1]);
        return year >= 2025 ? 'shadow-[0_0_10px_rgba(239,68,68,0.2)]' : '';
    };

    return (
        <Card className="bg-slate-950/40 border-red-900/30 hover:border-red-500/30 transition-all duration-300 backdrop-blur-sm group h-full">
            <CardHeader className="pb-2 border-b border-red-900/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-950/30 border border-red-900/30 text-red-500 group-hover:text-red-400 transition-colors">
                        <ShieldAlert className="w-5 h-5 pointer-events-none" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base font-medium text-slate-200 tracking-wide flex items-center justify-between">
                            VULNERABILITIES
                            <Badge variant="destructive" className="bg-red-900/50 text-red-200 hover:bg-red-900/70 border-0 text-[10px]">
                                {cluster.size} DETECTED
                            </Badge>
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-2">
                {cluster.tags.slice(0, 5).map((tag, index) => {
                    const color = getSeverityColor(tag.name);
                    return (
                        <div
                            key={index}
                            className={`
                    flex items-center justify-between p-2.5 rounded-md 
                    bg-slate-900/50 border border-slate-800 hover:border-slate-700 
                    cursor-pointer transition-all group/item
                    ${getSeverityGlow(tag.name)}
                `}
                            style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
                            onClick={() => onTagClick?.(tag)}
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" style={{ color }} />
                                <div>
                                    <div className="font-mono text-xs font-medium text-slate-300 group-hover/item:text-white transition-colors">
                                        {tag.name}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {tag.size} hits
                                </span>
                            </div>
                        </div>
                    );
                })}

                <div className="pt-3 flex justify-end">
                    <a
                        href="https://nvd.nist.gov/vuln/search"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                        NVD Database <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
