/**
 * 📊 Analyst Dashboard - Dashboard avec widgets de tag clusters en temps réel
 * Design: Premium Dark / Cyber Security Style
 */

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Activity, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { dashboardService } from '../services/api/dashboard.service';
import { TagCluster, TagItem } from '../types/taranis.types';
import { LocationWidget } from '../components/analyst/widgets/LocationWidget';
import { OrganizationWidget } from '../components/analyst/widgets/OrganizationWidget';
import { PersonWidget } from '../components/analyst/widgets/PersonWidget';
import { ProductWidget } from '../components/analyst/widgets/ProductWidget';
import { CVEWidget } from '../components/analyst/widgets/CVEWidget';
import { RegistryKeyWidget } from '../components/analyst/widgets/RegistryKeyWidget';
import { ClusterWidget } from '../components/analyst/widgets/ClusterWidget';
import { HelpCircle } from 'lucide-react';

export default function AnalystDashboard() {
    const [clusters, setClusters] = useState<TagCluster[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchClusters = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await dashboardService.getTrendingClusters();

            if (response.success && response.data) {
                setClusters(response.data.items);
                setLastUpdate(new Date());
            }
        } catch (err: any) {
            console.error('Error fetching clusters:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClusters();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchClusters, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTagClick = (tag: TagItem) => {
        console.log('Tag clicked:', tag);
        // TODO: Ouvrir un modal avec les détails du tag ou naviguer vers une page dédiée
    };

    const getWidgetForCluster = (cluster: TagCluster) => {
        switch (cluster.name) {
            case 'Location':
                return <LocationWidget cluster={cluster} onTagClick={handleTagClick} />;
            case 'Organization':
                return <OrganizationWidget cluster={cluster} onTagClick={handleTagClick} />;
            case 'Person':
                return <PersonWidget cluster={cluster} onTagClick={handleTagClick} />;
            case 'Product':
                return <ProductWidget cluster={cluster} onTagClick={handleTagClick} />;
            case 'cves':
                return <CVEWidget cluster={cluster} onTagClick={handleTagClick} />;
            case 'registry_key_paths':
                return <RegistryKeyWidget cluster={cluster} onTagClick={handleTagClick} />;
            default:
                return (
                    <ClusterWidget
                        cluster={cluster}
                        icon={<HelpCircle className="w-5 h-5" />}
                        color="#64748b"
                        onTagClick={handleTagClick}
                    />
                );
        }
    };

    if (loading && clusters.length === 0) {
        return (
            <div className="container mx-auto p-6 h-[80vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse"></div>
                    <RefreshCw className="relative w-16 h-16 animate-spin text-cyan-400 mb-4" />
                </div>
                <p className="text-cyan-200/70 font-mono animate-pulse">
                    Establishing secure connection to Taranis Core...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 space-y-8">
            {/* Header with Glow Effect */}
            <div className="flex items-end justify-between border-b border-slate-800 pb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-500/10 to-transparent blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        Threat Landscape
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        Real-time cluster analysis & trend detection
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    {lastUpdate && (
                        <div className="text-xs font-mono text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                            LAST_SYNC: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                    <Button
                        onClick={fetchClusters}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="border-cyan-900/50 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 hover:border-cyan-500/50 transition-all font-mono text-xs uppercase tracking-wider"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="bg-red-950/20 border-red-900/50 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Active Clusters</p>
                            <CardTitle className="text-3xl text-slate-200 font-bold mt-1">{clusters.length}</CardTitle>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Entities</p>
                            <CardTitle className="text-3xl text-slate-200 font-bold mt-1">
                                {clusters.reduce((sum, c) => sum + c.size, 0)}
                            </CardTitle>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-red-900/30 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 flex items-center gap-4 relative z-10">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-red-400/80 font-medium uppercase tracking-wider">Critical CVEs</p>
                            <CardTitle className="text-3xl text-red-400 font-bold mt-1">
                                {clusters.find(c => c.name === 'cves')?.size || 0}
                            </CardTitle>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Widgets Grid */}
            <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2 pt-4">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Deep Dive Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {clusters.map((cluster, index) => (
                    <div key={index} className="h-full">
                        {getWidgetForCluster(cluster)}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {clusters.length === 0 && !loading && (
                <Card className="bg-slate-900/20 border-dashed border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-mono">No trending data available from Taranis sensors</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
