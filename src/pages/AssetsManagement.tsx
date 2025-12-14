import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Plus, Shield, Server, Users, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { taranisService } from '../services/api/taranis.service';
import { toast } from 'sonner';

export function AssetsManagement() {
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            const response = await taranisService.getAssets({ limit: 100 });
            // API returns { items: [...], total_count: ... } or just array based on standard
            const data = Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
            setAssets(data);
        } catch (error) {
            console.error("Failed to load assets", error);
            // toast.error("Erreur chargement assets"); // Suppress if backend table is empty/missing
        } finally {
            setIsLoading(false);
        }
    };

    const getIconForType = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'identity': return Users;
            case 'system': return Server;
            case 'infrastructure': return Globe;
            default: return Database;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-8 h-8 text-teal-500" />
                        Gestion des Assets
                    </h1>
                    <p className="text-slate-400 mt-1">Inventaire des actifs, identités et infrastructures surveillés</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel Asset
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Rechercher IP, Domaine, Identité..."
                        className="bg-slate-900 border-slate-700 pl-10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => {
                    const Icon = getIconForType(asset.type || 'unknown');
                    return (
                        <Card key={asset.id} className="bg-slate-900/50 border-slate-700 border hover:border-teal-500/50 transition-colors cursor-pointer group">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-teal-500/10 transition-colors">
                                        <Icon className="w-5 h-5 text-teal-500" />
                                    </div>
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                        {asset.type || 'N/A'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg text-white mb-1 truncate" title={asset.title}>{asset.title}</CardTitle>
                                <CardDescription className="text-xs text-slate-500 line-clamp-2">
                                    {asset.description || "Aucune description"}
                                </CardDescription>

                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-600">
                                    <span>{asset.updated ? new Date(asset.updated).toLocaleDateString() : 'Récemment'}</span>
                                    <span className="flex items-center gap-1 text-teal-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                        Actif
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Empty State / Loading */}
                {!isLoading && assets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun asset trouvé</p>
                        <Button variant="link" className="text-teal-500">Créer votre premier asset</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
