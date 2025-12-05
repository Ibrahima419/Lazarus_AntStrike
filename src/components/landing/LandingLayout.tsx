import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

interface LandingLayoutProps {
    children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
            {/* Background Grid Effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img
                                src="/AnStrikes.svg"
                                alt="AntStrike Logo"
                                className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                onError={(e) => {
                                    e.currentTarget.src = '/Ant1.png'; // Fallback
                                }}
                            />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                AntStrike CTI
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
                            <a href="#services" className="text-sm text-slate-400 hover:text-white transition-colors">Services</a>
                            <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">About</a>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            >
                                Sign In
                            </Link>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
                                Get Demo
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-white/5">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <a href="#features" className="block px-3 py-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md">Features</a>
                            <a href="#services" className="block px-3 py-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md">Services</a>
                            <Link to="/login" className="block px-3 py-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md">Sign In</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-slate-950 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-6 h-6 text-blue-500" />
                                <span className="text-lg font-bold text-white">AntStrike CTI</span>
                            </div>
                            <p className="text-slate-400 max-w-sm">
                                Next-generation Cyber Threat Intelligence platform powered by Taranis AI.
                                Anticipate threats before they strike.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Intelligence Feeds</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Taranis AI</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Integrations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
                        © {new Date().getFullYear()} AntStrike CTI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};
