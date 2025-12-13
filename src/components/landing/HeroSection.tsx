import React from 'react';
import { ArrowRight, Play, ShieldCheck, MapPin, Globe2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <div className="relative pt-20 pb-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">


                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        <span className="block text-white">La Cyber-Défense</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                            Pour l'Afrique de l'Ouest
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Protégez vos transactions Mobile Money et vos données sensibles.
                        AntStrike combine <span className="text-white font-semibold">Intelligence Artificielle</span> et
                        <span className="text-white font-semibold"> Conformité CDP</span> pour une sécurité souveraine.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:animate-shine" />
                            <span className="flex items-center gap-2">
                                Démarrer l'Essai Gratuit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 backdrop-blur-sm transition-all flex items-center gap-2">
                            <Play className="w-4 h-4 fill-current" /> Voir la Démo
                        </button>
                    </div>

                    {/* Dashboard Preview 3D */}
                    <div className="relative mx-auto max-w-5xl perspective-[2000px] group">
                        {/* Glow effect slightly behind */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-[60px] -z-10 opacity-50 transition-opacity group-hover:opacity-70" />

                        <div className="relative transform transition-all duration-700 hover:scale-[1.02] tilt-card">
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-white/10">
                                <img
                                    src="/dashboard-preview.png"
                                    alt="AntStrike CTI Dashboard"
                                    className="rounded-lg w-full h-auto shadow-2xl border border-slate-700/50"
                                />

                                {/* Overlay gradient for premium feel */}
                                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium mt-16">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <span>Conforme CDP Sénégal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span>Support Local à Dakar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe2 className="w-5 h-5 text-purple-500" />
                            <span>Zone UEMOA</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
