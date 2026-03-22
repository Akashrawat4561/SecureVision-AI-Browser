import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Cpu, Zap, Globe, Lock, Activity, ArrowRight } from 'lucide-react';
import DynamicButton from '../components/common/DynamicButton';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen mesh-gradient text-slate-200 selection:bg-brand-cyan/30 overflow-x-hidden relative">
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
            
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-9 h-9 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/20 group-hover:border-brand-cyan/50 transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                            <Shield className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-white font-heading uppercase group-hover:text-brand-cyan transition-colors">
                            Secure<span className="text-brand-cyan">Vision</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <DynamicButton 
                            variant="ghost" 
                            fullWidth={false} 
                            className="px-6 py-2 normal-case tracking-normal"
                            onClick={() => navigate('/login')}
                        >
                            Log In
                        </DynamicButton>
                        <DynamicButton 
                            variant="primary" 
                            fullWidth={false} 
                            className="px-8 py-3 rounded-2xl"
                            onClick={() => navigate('/register')}
                        >
                            Deploy System
                        </DynamicButton>
                    </div>
                </div>
            </nav>

            {/* Marquee Intelligence Stream */}
            <div className="fixed top-20 w-full h-10 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 overflow-hidden flex items-center">
                <motion.div
                    animate={{ x: [0, -2000] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="flex whitespace-nowrap space-x-24"
                >
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex space-x-24 items-center">
                            <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest flex items-center">
                                <Shield className="w-3 h-3 mr-2" /> Server: 4893...f92a | Alert: Multiple failed logins detected
                            </span>
                            <span className="text-[10px] font-mono text-brand-orange/60 uppercase tracking-widest flex items-center">
                                <Zap className="w-3 h-3 mr-2" /> Risk Score: 0.984 | Alert: Unusual network traffic spike
                            </span>
                            <span className="text-[10px] font-mono text-brand-red/60 uppercase tracking-widest flex items-center">
                                <Activity className="w-3 h-3 mr-2" /> Blocked: Malicious file download prevented
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-56 pb-32 px-8 max-w-7xl mx-auto overflow-hidden">
                <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 blur-[150px] rounded-full -z-10 animate-pulse-slow"></div>
                
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center space-x-3 bg-brand-cyan/10 border border-brand-cyan/20 px-5 py-2.5 rounded-2xl backdrop-blur-sm shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_#00f0ff]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Version 2.0 Available Now</span>
                        </div>

                        <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic font-heading">
                            The First <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-500 not-italic">All-in-One</span> <br />
                            <span className="text-slate-500">AI Security Platform</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                            Designed for modern businesses. Protecting against deepfakes, network attacks, and phishing with advanced AI.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <DynamicButton 
                                variant="primary" 
                                fullWidth={false} 
                                className="px-12 py-5 rounded-[32px]"
                                icon={ArrowRight}
                                onClick={() => navigate('/register')}
                            >
                                Get Started
                            </DynamicButton>
                            <DynamicButton 
                                variant="secondary" 
                                fullWidth={false} 
                                className="px-12 py-5 rounded-[32px] border-white/10"
                            >
                                How It Works
                            </DynamicButton>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="relative z-10 p-6 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-md shadow-3xl">
                            <div className="bg-slate-950 rounded-[30px] overflow-hidden border border-white/10 aspect-square flex flex-col items-center justify-center p-12 group">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#00f0ff08_0%,_transparent_70%)]"></div>
                                    <Globe className="w-64 h-64 text-brand-cyan/10 animate-[spin_60s_linear_infinite]" />
                                    <Activity className="absolute inset-0 m-auto w-16 h-16 text-brand-cyan opacity-40" />
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 6 }}
                                        className="absolute inset-0 m-auto w-48 h-48 rounded-full border border-brand-cyan/20"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 8, delay: 1 }}
                                        className="absolute inset-0 m-auto w-48 h-48 rounded-full border border-brand-orange/10"
                                    />
                                </div>
                                <div className="absolute bottom-12 right-12 p-6 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-[200px] transform group-hover:-translate-y-3 group-hover:border-brand-red/30 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-brand-red uppercase tracking-[0.2em]">System Alert</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
                                    </div>
                                    <p className="text-[11px] text-white font-bold mb-3 font-heading uppercase tracking-tight">Suspicious Activity Detected</p>
                                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: ['20%', '95%', '100%'] }} transition={{ repeat: Infinity, duration: 3 }} className="h-full bg-brand-red shadow-[0_0_8px_#ff2a2a]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="py-32 px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">The Architecture</h2>
                        <h3 className="text-5xl font-black text-white uppercase italic leading-[0.9] font-heading">
                            Smart Security <br />
                            <span className="text-brand-orange not-italic">Protection</span>
                        </h3>
                    </div>
                    <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">Fast and reliable security built to protect your most important assets seamlessly.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={Cpu} title="Deepfake Detection" desc="Analyzes videos and images to quickly catch AI-generated fakes with high accuracy." color="brand-cyan" />
                    <FeatureCard icon={Lock} title="Decoy Servers" desc="Traps hackers in fake servers to monitor their activity and block them." color="brand-orange" />
                    <FeatureCard icon={Activity} title="Network Monitoring" desc="Scans your live internet traffic to detect and alert on unusual or malicious behavior." color="brand-red" />
                    <FeatureCard icon={Shield} title="Strong Security Base" desc="Built with industry-standard encryption and strict access controls to keep your data safe." color="brand-cyan" />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 text-center px-8 relative bg-black/20">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <div className="w-8 h-8 bg-brand-cyan/10 rounded-lg flex items-center justify-center border border-brand-cyan/20">
                        <Shield className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white font-heading uppercase italic">SecureVision <span className="text-brand-cyan not-italic">AI</span></span>
                </div>
                <div className="flex justify-center space-x-12 mb-10">
                    {['Product', 'Network', 'Compliance', 'Terminal'].map(item => (
                        <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">{item}</a>
                    ))}
                </div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">&copy; 2026 SecureVision AI Systems. Professional AI Protection</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="p-10 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-2 relative overflow-hidden backdrop-blur-sm">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className={`w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-all border border-white/10 group-hover:border-brand-cyan/50 shadow-lg`}>
            <Icon className={`w-7 h-7 text-white group-hover:text-brand-cyan transition-colors`} />
        </div>
        <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight font-heading group-hover:text-brand-cyan transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default Landing;
