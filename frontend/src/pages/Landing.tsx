import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Cpu, MessageSquare, Zap, Globe, Lock, Activity } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-cyan/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-brand-cyan/20 rounded-lg flex items-center justify-center border border-brand-cyan/30 group-hover:border-brand-cyan group-hover:shadow-[0_0_15px_#00f0ff50] transition-all">
                            <Shield className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">SecureVision <span className="text-brand-cyan not-italic ml-1">AI</span></span>
                    </div>
                    <div className="flex items-center space-x-8">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login</button>
                        <button onClick={() => navigate('/register')} className="bg-brand-cyan text-slate-950 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_#00f0ff80] transition-all">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Marquee Signatures */}
            <div className="fixed top-20 w-full h-8 bg-brand-cyan/5 border-b border-brand-cyan/10 z-40 overflow-hidden flex items-center">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="flex whitespace-nowrap space-x-12"
                >
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex space-x-12">
                            <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest flex items-center">
                                <Shield className="w-3 h-3 mr-2" /> SHA-256: 4893...f92a | THREAT_DETECTED: SSH_BRUTE_FORCE [NODE-EU-01]
                            </span>
                            <span className="text-[10px] font-mono text-brand-orange/60 uppercase tracking-widest flex items-center">
                                <Zap className="w-3 h-3 mr-2" /> ANOMALY_INDEX: 0.942 | TARGET: SQL_INJECTION_SCAN [GATEWAY-02]
                            </span>
                            <span className="text-[10px] font-mono text-brand-red/60 uppercase tracking-widest flex items-center">
                                <Activity className="w-3 h-3 mr-2" /> CONSENSUS_REACHED: MALICIOUS_PAYLOAD [ALL_NODES]
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
                <div className="absolute top-40 right-0 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                <div className="absolute bottom-20 left-0 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700"></div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center space-x-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full">
                            <Zap className="w-4 h-4 text-brand-orange" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">v2.0.0 Now Available: Federated Threat Intelligence</span>
                        </div>

                        <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">
                            AI-Powered <br />
                            <span className="text-brand-cyan not-italic">Edge Sentinel</span> <br />
                            Detection System
                        </h1>

                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                            Experience the next generation of cybersecurity. Real-time Phishing detection, Network anomaly identification, and Federated Deepfake analysis, all orchestrated at the Edge.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button onClick={() => navigate('/register')} className="bg-brand-cyan text-slate-950 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center group shadow-[0_0_30px_#00f0ff30]">
                                Access the Dashboard
                                <Zap className="w-4 h-4 ml-3 group-hover:translate-x-1 duration-300" />
                            </button>
                            <button className="bg-slate-900 border border-slate-800 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors">
                                View Network Topology
                            </button>
                        </div>

                        <div className="pt-8 flex items-center space-x-6 grayscale opacity-50 contrast-125">
                            {/* Dummy partner logos */}
                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-500"><Globe className="w-4 h-4 mr-2" /> Global Compliance</div>
                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-500"><Lock className="w-4 h-4 mr-2" /> End-to-End Encryption</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="relative z-10 p-4 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/10 aspect-video flex flex-col items-center justify-center p-8 group">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Visual metaphor for the dashboard map */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#00f0ff10_0%,_transparent_70%)]"></div>
                                    <Globe className="w-48 h-48 text-brand-cyan/20 animate-[spin_30s_linear_infinite]" />
                                    <Activity className="absolute inset-0 m-auto w-12 h-12 text-brand-cyan" />
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-brand-cyan/30"
                                    />
                                </div>
                                <div className="absolute bottom-10 left-10 p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-xl max-w-xs transform group-hover:-translate-y-2 transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Live Alert Detected</span>
                                        <span className="text-[10px] text-slate-500">Node-EU-01</span>
                                    </div>
                                    <p className="text-xs text-slate-200 font-bold mb-1">DDoS Pattern Observed</p>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: ['0%', '80%', '100%'] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-brand-red" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-sm font-bold text-brand-cyan uppercase tracking-[0.3em]">The Ecosystem</h2>
                    <h3 className="text-4xl font-black text-white uppercase italic leading-tight">Intelligence at the <br /><span className="text-brand-orange not-italic">Tactical Edge</span></h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={Brain} title="AI Phishing Detection" desc="NLP-driven real-time analysis for credential-harvesting threats." color="brand-cyan" />
                    <FeatureCard icon={Cpu} title="Deepfake Analysis" desc="Xception INT8 quantized models optimized for edge hardware." color="brand-orange" />
                    <FeatureCard icon={MessageSquare} title="Threat Intel P2P" desc="Consensus-driven signature sharing across distributed nodes." color="purple-500" />
                    <FeatureCard icon={Shield} title="SSH Honeypot" desc="Automatic adversary deception and logging at the perimeter." color="brand-red" />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center px-6">
                <div className="flex items-center justify-center space-x-3 mb-6 opacity-60">
                    <Shield className="w-5 h-5 text-brand-cyan" />
                    <span className="text-sm font-black tracking-tighter text-white uppercase italic">SecureVision <span className="text-brand-cyan not-italic ml-1">AI</span></span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">&copy; 2026 SecureVision AI sentinel systems. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
    <div className={`p-8 bg-slate-900/30 rounded-3xl border border-white/5 hover:border-${color}/30 transition-all group hover:-translate-y-2`}>
        <div className={`w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10 group-hover:border-${color}/50`}>
            <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

export default Landing;
