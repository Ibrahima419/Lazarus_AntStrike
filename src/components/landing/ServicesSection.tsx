import React from 'react';
import { Database, ShieldAlert, FileSearch, Users } from 'lucide-react';

const SERVICES = [
    {
        title: 'Threat Intelligence Feeds',
        description: 'Curated, high-fidelity feeds integrated directly into your SIEM/SOAR. STIX/TAXII compatible.',
        icon: Database,
        color: 'blue'
    },
    {
        title: 'Managed SOC & Monitoring',
        description: '24/7 surveillance by our expert analysts. We handle the noise, you focus on the signal.',
        icon: ShieldAlert,
        color: 'red'
    },
    {
        title: 'Digital Forensics',
        description: 'Deep dive investigations into incidents. Root cause analysis and evidence collection.',
        icon: FileSearch,
        color: 'purple'
    },
    {
        title: 'Brand Protection',
        description: 'Defend your reputation. Takedown phishing sites and fake social media profiles instantly.',
        icon: Users,
        color: 'green'
    }
];

export const ServicesSection: React.FC = () => {
    return (
        <section id="services" className="py-24 bg-slate-900/30 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Our <span className="text-purple-500">Services</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Comprehensive security solutions tailored to your organization's needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SERVICES.map((service, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-2xl bg-slate-950 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-${service.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <service.icon className={`w-7 h-7 text-${service.color}-500`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {service.description}
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-white hover:text-blue-400 transition-colors">
                                Learn more <span className="text-lg">→</span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
