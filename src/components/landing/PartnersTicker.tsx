import React from 'react';

const PARTNERS = [
    { name: 'Tether', logo: '/logoGreen.svg', color: '#009393' },
    { name: 'MISP', color: '#e3342f' },
    { name: 'MITRE', color: '#005b94' },
    { name: 'ANSSI', color: '#003399' },
    { name: 'FIRST', color: '#f5a623' },
    { name: 'OpenCTI', color: '#4a90e2' },
    { name: 'TheHive', color: '#f8e71c' },
    { name: 'Cortex', color: '#50e3c2' },
    { name: 'AlienVault', color: '#9013fe' },
];

export const PartnersTicker: React.FC = () => {
    return (
        <div className="py-10 border-y border-white/5 bg-slate-950/50 backdrop-blur-sm overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Trusted by Security Teams Worldwide</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
                        <div
                            key={`${partner.name}-${index}`}
                            className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer grayscale hover:grayscale-0"
                        >
                            {/* Logo: Image or Placeholder */}
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-10 w-auto object-contain drop-shadow-lg"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg"
                                    style={{ backgroundColor: partner.color }}
                                >
                                    {partner.name[0]}
                                </div>
                            )}
                            <span className="text-xl font-bold text-slate-300">{partner.name}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8">
                    {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
                        <div
                            key={`${partner.name}-${index}-duplicate`}
                            className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer grayscale hover:grayscale-0"
                        >
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-10 w-auto object-contain drop-shadow-lg"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg"
                                    style={{ backgroundColor: partner.color }}
                                >
                                    {partner.name[0]}
                                </div>
                            )}
                            <span className="text-xl font-bold text-slate-300">{partner.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fade Edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        </div>
    );
};
