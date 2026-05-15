import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Cpu, Zap, Globe, Lock } from 'lucide-react';

const stats = [
    { label: 'Detection Accuracy', value: '94.2%', icon: Target, color: 'text-brand-cyan' },
    { label: 'Response Latency', value: '< 50ms', icon: Zap, color: 'text-brand-orange' },
    { label: 'Global Nodes', value: '124', icon: Globe, color: 'text-brand-cyan' },
    { label: 'Processed Events', value: '1.2M+', icon: Cpu, color: 'text-brand-orange' },
];

export default function About() {
    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <header className="relative py-16 px-8 rounded-3xl overflow-hidden glass-card border-brand-cyan/20">
                <div className="absolute inset-0 cyber-grid opacity-10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full" />
                
                <div className="relative z-10 max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-6"
                    >
                        <Shield className="w-4 h-4 text-brand-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">SecureVision Core</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Redefining Defense in the <span className="text-brand-cyan">AI Era.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 font-medium leading-relaxed"
                    >
                        SecureVision AI is an advanced cybersecurity ecosystem designed to counter 
                        next-generation digital threats. From AI-generated deepfakes to sophisticated 
                        network anomalies, we provide the intelligence and tools to stay ahead.
                    </motion.p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="glass-card p-6 flex items-center space-x-4 border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center border border-white/5`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-black text-white flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center mr-3 border border-brand-cyan/20">
                            <Cpu className="w-4 h-4 text-brand-cyan" />
                        </span>
                        The Intelligence Layer
                    </h2>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        Our platform leverages specialized neural networks to analyze media and traffic in real-time. 
                        The Deepfake Scanner uses a combination of spatial artifact detection (EfficientNet) 
                        and temporal consistency checks (LSTM) to verify media authenticity.
                    </p>
                    <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 space-y-4">
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Technical Pillars</h4>
                        <ul className="space-y-3">
                            {[
                                'Multimodal Forensic AI',
                                'Isolation Forest Anomaly Detection',
                                'Interactive SSH/HTTP Deception Nodes',
                                'Real-time WebSocket Telemetry'
                            ].map((item) => (
                                <li key={item} className="flex items-center text-sm text-slate-400 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mr-3 shadow-[0_0_5px_#00f0ff]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-black text-white flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center mr-3 border border-brand-orange/20">
                            <Lock className="w-4 h-4 text-brand-orange" />
                        </span>
                        Active Defense Strategy
                    </h2>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        We don't just watch; we interact. SecureVision's Honeypot Grid deploys realistic decoys 
                        across your infrastructure to trap attackers and gather high-fidelity intelligence on 
                        their methods before they reach critical systems.
                    </p>
                    <div className="p-6 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10">
                        <blockquote className="text-brand-cyan italic font-medium">
                            "The best defense is an intelligent, adaptive presence that learns from every interaction."
                        </blockquote>
                        <div className="mt-4 text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.2em]">
                            — SecureVision Architecture Team
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
