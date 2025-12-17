import React from 'react';
import { Database, ShieldAlert, Users, FileSearch, FlaskConical, Send, ArrowDown } from 'lucide-react';

const WORKFLOW_STEPS = [
    {
        id: 1,
        title: 'Configuration & Collecte (Admin)',
        description: 'L\'administrateur se connecte pour configurer les sources de renseignement et les flux de données. Il paramètre les connecteurs (STIX/TAXII, OSINT) pour alimenter la plateforme.',
        icon: Database,
        color: 'blue'
    },
    {
        id: 2,
        title: 'Visualisation SOC (Dashboard)',
        description: 'Les menaces collectées sont visualisées en temps réel sur le Dashboard SOC global. Le SOC a une vue d\'ensemble des clusters de menaces et des tendances actuelles.',
        icon: ShieldAlert,
        color: 'red'
    },
    {
        id: 3,
        title: 'Orchestration & Collaboration',
        description: 'Depuis l\'espace de travail collaboratif, le Chef SOC ou l\'Admin assigne les incidents aux analystes. Il gère l\'équipe et distribue la charge de travail via la gestion des utilisateurs.',
        icon: Users,
        color: 'purple'
    },
    {
        id: 4,
        title: 'Investigation & Qualification (Analyste)',
        description: 'Les analystes accèdent au module "Assess". Ils visualisent les détails, vérifient l\'authenticité des tags, enrichissent les données et qualifient la menace.',
        icon: FileSearch,
        color: 'orange'
    },
    {
        id: 5,
        title: 'Analyse Approfondie (Labs)',
        description: 'Une fois qualifiée, la menace passe en "Analyse". L\'analyste crée un rapport de laboratoire (Lab Report) détaillé contenant les preuves techniques et les IOCs validés.',
        icon: FlaskConical,
        color: 'cyan'
    },
    {
        id: 6,
        title: 'Rapport Stratégique & Diffusion (Global)',
        description: 'Le SOC Manager consolide les rapports individuels en un Rapport CTI Global. Il valide et publie le renseignement final aux décideurs et aux parties prenantes.',
        icon: Send,
        color: 'green'
    }
];

export const ServicesSection: React.FC = () => {
    return (
        <section id="services" className="py-24 bg-slate-900/30 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden md:block" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Workflow <span className="text-blue-500">Operationnel Unifié</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        De l'ingestion de la donnée brute à la diffusion du renseignement stratégique.
                        Une chaîne de valeur fluide pour votre équipe SOC.
                    </p>
                </div>

                <div className="relative">
                    {WORKFLOW_STEPS.map((step, index) => (
                        <div key={step.id} className="relative mb-16 last:mb-0 group">
                            <div className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                                {/* Content Card */}
                                <div className="flex-1 w-full">
                                    <div className={`p-8 rounded-2xl bg-slate-950 border border-white/5 hover:border-${step.color}-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:-translate-y-1 relative overflow-hidden`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br from-${step.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10">
                                            <div className={`inline-flex p-3 rounded-lg bg-${step.color}-500/10 text-${step.color}-500 mb-4 md:hidden`}>
                                                <step.icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                                <span className={`hidden md:inline-flex p-2 rounded-lg bg-${step.color}-500/10 text-${step.color}-500 text-sm`}>
                                                    0{step.id}
                                                </span>
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Node (Desktop) */}
                                <div className="hidden md:flex flex-col items-center justify-center w-12 relative">
                                    <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 border-${step.color}-500 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300`}>
                                        <step.icon className={`w-5 h-5 text-${step.color}-500`} />
                                    </div>
                                </div>

                                {/* Empty Space for Alignment */}
                                <div className="flex-1 hidden md:block" />
                            </div>

                            {/* Connecting Line Arrow (Mobile) */}
                            {index !== WORKFLOW_STEPS.length - 1 && (
                                <div className="flex justify-center md:hidden mt-4 text-slate-700">
                                    <ArrowDown className="w-6 h-6 animate-bounce" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
