import { Play, Shield, Users, Brain, Target, Award } from 'lucide-react';
import { useState } from 'react';

// ==============================================================================
// 🎥 CONFIGURATION DES VIDÉOS DE FORMATION
// ==============================================================================
// C'est ici que vous devrez mettre les liens vers vos vidéos et vos miniatures.
// Vous pouvez utiliser des fichiers locaux (dans public/) ou des liens YouTube/Vimeo.
// ==============================================================================

const TRAINING_MODULES = [
    {
        id: 1,
        title: "Masterclass Détection Phishing",
        duration: "12 min",
        level: "Débutant",
        description: "Apprenez à repérer les tentatives de phishing sophistiquées dans votre boîte mail.",
        // Mettez le chemin de votre video ici (ex: "/videos/phishing.mp4")
        videoUrl: "#",
        // Mettez le chemin de votre thumbnail ici (ex: "/images/phishing-thumb.jpg")
        thumbnail: "bg-gradient-to-br from-red-900/50 to-orange-900/50"
    },
    {
        id: 2,
        title: "Guide Survie Ingénierie Sociale",
        duration: "18 min",
        level: "Intermédiaire",
        description: "Comprenez comment les hackers manipulent la psychologie pour obtenir un accès.",
        videoUrl: "#",
        thumbnail: "bg-gradient-to-br from-blue-900/50 to-cyan-900/50"
    },
    {
        id: 3,
        title: "Habitudes Télétravail Sécurisé",
        duration: "15 min",
        level: "Avancé",
        description: "Meilleures pratiques pour sécuriser votre environnement de bureau à domicile.",
        videoUrl: "#",
        thumbnail: "bg-gradient-to-br from-purple-900/50 to-pink-900/50"
    }
];

export const HumanFirewallSection = () => {
    const [activeModule, setActiveModule] = useState<number | null>(null);

    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                        <Users className="w-4 h-4" />
                        <span>Sécurité Centrée sur l'Humain</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Construisez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pare-feu Humain</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        La technologie n'est que la moitié de la bataille. Transformez vos employés de cibles potentielles en première ligne de défense avec notre académie immersive.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            icon: Brain,
                            title: "Formation Cognitive",
                            desc: "Contenu piloté par l'IA qui s'adapte au comportement et au rythme d'apprentissage."
                        },
                        {
                            icon: Target,
                            title: "Simulations Réelles",
                            desc: "Simulations de phishing sécurisées pour tester la préparation sans risque."
                        },
                        {
                            icon: Award,
                            title: "Progression Ludifiée",
                            desc: "Gagnez des badges et certifications pour rester engagé et compétitif."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-700 text-cyan-400">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Video Academy Preview */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Play className="w-6 h-6 text-cyan-400" />
                            Modules de Formation à la Une
                        </h3>
                        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                            Voir tous les cours →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TRAINING_MODULES.map((module) => (
                            <div
                                key={module.id}
                                className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                            >
                                {/* Thumbnail Area */}
                                <div className={`aspect-video ${module.thumbnail} relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                                    {/* Play Button */}
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer shadow-xl">
                                        <Play className="w-6 h-6 text-white ml-1 fill-white" />
                                    </div>

                                    {/* Duration Badge */}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white font-medium">
                                        {module.duration}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${module.level === 'Débutant' ? 'bg-green-500/10 text-green-400' :
                                            module.level === 'Intermédiaire' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                            {module.level}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                        {module.title}
                                    </h4>
                                    <p className="text-slate-400 text-sm line-clamp-2">
                                        {module.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 flex items-center gap-2 mx-auto">
                        <Shield className="w-5 h-5 fill-current" />
                        Lancer votre Programme
                    </button>
                    <p className="text-slate-500 text-sm mt-4">
                        Disponible pour les équipes de toutes tailles. Pas de carte requise pour la démo.
                    </p>
                </div>

            </div>
        </section>
    );
};
