import React from 'react';
import { Brain, Globe, Eye, Zap, Lock, Activity } from 'lucide-react';

export const BentoGridFeatures: React.FC = () => {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Conçu pour la <span className="text-blue-500">Cyber Dominance</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Un écosystème défensif complet propulsé par notre IA propriétaire Taranis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Feature 1: Taranis AI (Large) */}
                    <div className="md:col-span-2 row-span-1 md:row-span-2 rounded-3xl bg-slate-900/50 border border-white/10 p-8 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Cœur IA Taranis</h3>
                                <p className="text-slate-400">
                                    Notre moteur cognitif traite des millions de points de données par seconde pour identifier des modèles invisibles aux analystes humains.
                                    Corrélation, attribution et recommandations de réponse automatisées.
                                </p>
                            </div>

                            {/* Abstract Visualization */}
                            <div className="h-48 w-full bg-slate-950/50 rounded-xl border border-white/5 relative overflow-hidden mt-4">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-pulse blur-xl" />
                                </div>
                                <div className="absolute inset-0 grid grid-cols-6 gap-1 opacity-20">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div key={i} className="bg-blue-400/20 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Global Sensor Network */}
                    <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Capteurs Globaux</h3>
                        <p className="text-slate-400 text-sm">
                            Télémétrie en temps réel provenant de +50 pays. Détection instantanée des anomalies.
                        </p>
                        <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Globe className="w-24 h-24 text-purple-500" />
                        </div>
                    </div>

                    {/* Feature 3: Dark Web Watch */}
                    <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-8 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 text-red-400">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Vigie Dark Web</h3>
                        <p className="text-slate-400 text-sm">
                            Infiltration des marchés souterrains. Soyez alerté dès que vos actifs sont mentionnés.
                        </p>
                    </div>

                    {/* Feature 4: Instant Response */}
                    <div className="md:col-span-2 rounded-3xl bg-slate-900/50 border border-white/10 p-8 relative overflow-hidden group hover:border-green-500/50 transition-colors flex items-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Réponse Automatisée</h3>
                            <p className="text-slate-400">
                                Exécutez des playbooks en quelques millisecondes. Bloquez les IP, isolez les hôtes et patchez les vulnérabilités automatiquement.
                            </p>
                        </div>
                        <div className="hidden md:block w-1/3 pl-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                                    <ShieldCheck className="w-3 h-3" /> Menace Bloquée
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                                    <ShieldCheck className="w-3 h-3" /> Pare-feu Mis à jour
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                                    <ShieldCheck className="w-3 h-3" /> Admin Notifié
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

function ShieldCheck(props: any) {
    return <Lock {...props} />;
}
