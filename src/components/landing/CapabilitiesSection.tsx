import React from 'react';
import { Network, Database, Brain, Bell, Briefcase, Workflow, FileText, CheckCircle2 } from 'lucide-react';

const CAPABILITIES = [
    {
        id: 'collection',
        title: 'Collecte Multi-Sources',
        icon: Network,
        color: 'blue',
        coverage: '100%',
        features: [
            'OSINT Feeds (Abuse.ch, PhishTank, Tor)',
            'Threat Feeds (AlienVault, MalwareBazaar)',
            'STIX/TAXII Standards Natifs',
            'MISP Sync Bidirectionnel',
            'Dark Web Monitoring (Pastebin, Telegram)',
            'Honeypots Automatiques (T-Pot)'
        ]
    },
    {
        id: 'enrichment',
        title: 'Enrichissement IOC',
        icon: Database,
        color: 'purple',
        coverage: '100%',
        features: [
            'IP Reputation & Géolocalisation',
            'Hash Analytics & YARA Rules',
            'Domain/URL Phishing Detection',
            'CVE Scoring & Exploits',
            'Extraction Auto depuis Rapports/Emails'
        ]
    },
    {
        id: 'analysis',
        title: 'Analyse & Corrélation',
        icon: Brain,
        color: 'cyan',
        coverage: '85%',
        features: [
            'Diamond Model & Kill Chain',
            'MITRE ATT&CK Mapping',
            'Graph Analytics des Campagnes',
            'Scoring Automatique des Menaces'
        ]
    },
    {
        id: 'alerting',
        title: 'Alerting & Monitoring',
        icon: Bell,
        color: 'red',
        coverage: '100%',
        features: [
            'Gestionnaire d\'Alertes Multi-Sévérité',
            'Notifications Slack/Email/Webhooks',
            'Escalade Automatique (SLA)',
            'Déduplication Intelligente'
        ]
    },
    {
        id: 'cases',
        title: 'Case Management',
        icon: Briefcase,
        color: 'orange',
        coverage: '100%',
        features: [
            'Workflows Incident (Triage -> Clôture)',
            'Collaboration Multi-Utilisateurs',
            'Timeline des Événements',
            'Gestion des Preuves & Artefacts'
        ]
    },
    {
        id: 'soar',
        title: 'Playbooks SOAR',
        icon: Workflow,
        color: 'green',
        coverage: '75%',
        features: [
            'Moteur d\'Exécution Séquentiel/Parallèle',
            'Triggers (Event, Schedule, Manuel)',
            '15+ Actions (Enrichir, Bloquer, Notifier)',
            'Workflows d\'Approbation Humaine'
        ]
    },
    {
        id: 'reporting',
        title: 'Reporting Avancé',
        icon: FileText,
        color: 'yellow',
        coverage: '100%',
        features: [
            'Rapports Quotidiens, Hebdos, Incidents',
            'Formats Multiples (HTML, JSON, CSV)',
            'Génération & Envoi Automatisés',
            'Tableaux de Bord Personnalisables'
        ]
    }
];

export const CapabilitiesSection: React.FC = () => {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Capacités de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Plateforme</span>
                    </h2>
                    <p className="text-slate-400 max-w-3xl mx-auto text-lg">
                        Une suite technologique complète conçue pour couvrir l'intégralité du cycle de vie du renseignement sur les menaces.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {CAPABILITIES.map((cap) => (
                        <div
                            key={cap.id}
                            className={`group relative p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-${cap.color}-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                        >
                            {/* Hover Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-${cap.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                            {/* Header */}
                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-${cap.color}-500/10 flex items-center justify-center text-${cap.color}-400 group-hover:scale-110 transition-transform`}>
                                    <cap.icon className="w-6 h-6" />
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold bg-${cap.color}-500/10 text-${cap.color}-400 border border-${cap.color}-500/20`}>
                                    {cap.coverage}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="relative z-10 text-xl font-bold text-white mb-4 group-hover:text-${cap.color}-400 transition-colors">
                                {cap.title}
                            </h3>

                            {/* Features List */}
                            <ul className="relative z-10 space-y-3">
                                {cap.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                        <CheckCircle2 className={`w-4 h-4 mt-0.5 text-${cap.color}-500/50 group-hover:text-${cap.color}-500 shrink-0`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
