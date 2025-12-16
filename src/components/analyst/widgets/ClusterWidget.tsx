/**
 * 📊 Cluster Widget - Composant générique pour afficher un cluster de tags
 * Design: Cyber / Dark Mode / Premium
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { TagCluster, TagItem } from '../../../types/taranis.types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface ClusterWidgetProps {
    cluster: TagCluster;
    icon: React.ReactNode;
    color: string;
    maxTags?: number;
    onTagClick?: (tag: TagItem) => void;
}

export function ClusterWidget({
    cluster,
    icon,
    color,
    maxTags = 10,
    onTagClick
}: ClusterWidgetProps) {
    const topTags = cluster.tags.slice(0, maxTags);
    const chartData = topTags.map(tag => ({
        name: tag.name.length > 15 ? tag.name.substring(0, 15) + '...' : tag.name,
        value: tag.size,
        fullName: tag.name
    }));

    // Calcul du total pour les pourcentages visualisés
    const maxVal = Math.max(...chartData.map(d => d.value));

    return (
        <Card className="bg-slate-950/40 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/10 backdrop-blur-sm group">
            <CardHeader className="pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg bg-slate-900/80 border border-white/10 group-hover:border-opacity-50 transition-colors"
                        style={{ color }}
                    >
                        {icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-base font-medium text-slate-200 tracking-wide uppercase flex items-center gap-2">
                            {cluster.name}
                            <span className="text-xs font-normal text-slate-500 normal-case ml-auto">
                                {cluster.size} items
                            </span>
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
                {/* Chart */}
                <div className="h-[180px] w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" barSize={8} margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ payload }) => {
                                    if (payload && payload[0]) {
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl">
                                                <p className="font-medium text-slate-200 text-xs">{payload[0].payload.fullName}</p>
                                                <p className="text-xs text-slate-400">
                                                    Count: <span style={{ color }}>{payload[0].value}</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={color}
                                        opacity={0.6 + (entry.value / maxVal) * 0.4}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tags List (Top 5 only to save space) */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {topTags.slice(0, 6).map((tag, index) => (
                        <div
                            key={index}
                            onClick={() => onTagClick?.(tag)}
                            className="px-2 py-1 rounded bg-slate-900/50 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                            <span className="truncate max-w-[80px]">{tag.name}</span>
                            <span className="text-slate-600 font-mono">|</span>
                            <span style={{ color }}>{tag.size}</span>
                        </div>
                    ))}
                    {cluster.tags.length > 6 && (
                        <div className="px-2 py-1 text-[10px] text-slate-500">
                            +{cluster.tags.length - 6} more
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
