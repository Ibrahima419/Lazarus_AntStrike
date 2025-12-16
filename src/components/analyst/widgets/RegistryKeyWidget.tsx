/**
 * 🔑 Registry Key Widget - Affiche les clés de registre Windows
 * Redesign: Technical / Terminal Style
 */

import { Key, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface RegistryKeyWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function RegistryKeyWidget({ cluster, onTagClick }: RegistryKeyWidgetProps) {
    return (
        <Card className="bg-slate-950/40 border-slate-800 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm group col-span-1 md:col-span-2">
            <CardHeader className="pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base font-medium text-slate-200 font-mono tracking-tight flex items-center gap-2">
                            REGISTRY_IOCs
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                                WIN32
                            </span>
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-2">
                {cluster.tags.map((tag, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-2 rounded bg-black/40 border border-slate-800/50 hover:border-cyan-900/50 hover:bg-slate-900/80 cursor-pointer transition-all group/item"
                        onClick={() => onTagClick?.(tag)}
                    >
                        <Key className="w-3.5 h-3.5 mt-0.5 text-slate-600 group-hover/item:text-cyan-500 transition-colors" />
                        <div className="flex-1 overflow-hidden">
                            <p className="font-mono text-[11px] text-slate-400 group-hover/item:text-cyan-100 break-all leading-relaxed transition-colors">
                                {tag.name}
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-900 text-slate-500 text-[10px] border-slate-800 shrink-0">
                            {tag.size}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
