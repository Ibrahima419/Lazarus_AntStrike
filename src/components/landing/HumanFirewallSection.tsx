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
        title: "Phishing Detection Masterclass",
        duration: "12 min",
        level: "Beginner",
        description: "Learn to spot sophisticated phishing attempts in your inbox.",
        // Mettez le chemin de votre video ici (ex: "/videos/phishing.mp4")
        videoUrl: "#",
        // Mettez le chemin de votre thumbnail ici (ex: "/images/phishing-thumb.jpg")
        thumbnail: "bg-gradient-to-br from-red-900/50 to-orange-900/50"
    },
    {
        id: 2,
        title: "Social Engineering Survival Guide",
        duration: "18 min",
        level: "Intermediate",
        description: "Understand how hackers manipulate psychology to gain access.",
        videoUrl: "#",
        thumbnail: "bg-gradient-to-br from-blue-900/50 to-cyan-900/50"
    },
    {
        id: 3,
        title: "Secure Remote Work Habits",
        duration: "15 min",
        level: "Advanced",
        description: "Best practices for securing your home office environment.",
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
                        <span>Human-Centric Security</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Human Firewall</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Technology is only half the battle. Transform your employees from targets into your organization's strongest line of defense with our immersive training academy.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            icon: Brain,
                            title: "Cognitive Training",
                            desc: "AI-driven content that adapts to user behavior and learning pace."
                        },
                        {
                            icon: Target,
                            title: "Real-world Simulations",
                            desc: "Safe phishing simulations to test readiness without the risk."
                        },
                        {
                            icon: Award,
                            title: "Gamified Progress",
                            desc: "Earn badges and certifications to compete and stay engaged."
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
                            Featured Training Modules
                        </h3>
                        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                            View All Courses →
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
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${module.level === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                                                module.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
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
                        Start Your Awareness Program
                    </button>
                    <p className="text-slate-500 text-sm mt-4">
                        Available for teams of all sizes. No credit card required for demo.
                    </p>
                </div>

            </div>
        </section>
    );
};
