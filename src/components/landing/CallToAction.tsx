import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CallToAction: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

            <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Ready to Secure Your Future?
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                    Join the elite organizations trusting AntStrike for their cyber defense.
                    Get started today with a free threat assessment.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                        Get Started Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
                        Contact Sales
                    </button>
                </div>
            </div>
        </section>
    );
};
