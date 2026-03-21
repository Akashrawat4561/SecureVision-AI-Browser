import { Layers, Network, Server, ArrowRight, ShieldCheck, Mail, AlertTriangle, Eye, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Architecture() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase leading-tight">
                    SecureVision AI Architecture <br />
                    <span className="text-base text-brand-cyan tracking-normal lowercase">System Overview & Inference Pipelines</span>
                </h1>
            </div>

            <div className="glass-panel p-8 min-h-[600px] flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl relative z-10">

                    {/* Client Tier */}
                    <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                            <Layers className="w-4 h-4 mr-2" />
                            Client UI
                        </div>
                        <div className="bg-slate-900 border-2 border-slate-700/50 rounded-xl p-6 text-center w-64 shadow-xl relative group hover:border-brand-cyan/50 transition-colors">
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 opacity-0 blur group-hover:opacity-20 transition-opacity"></div>
                            <h3 className="font-bold text-lg text-white mb-2 relative z-10">Frontend Dashboard</h3>
                            <p className="text-sm font-mono text-brand-cyan mb-4 relative z-10">React + Vite</p>
                            <div className="space-y-2 text-xs text-slate-400 text-left relative z-10">
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Styling</span> <span className="text-slate-300">TailwindCSS</span></div>
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Charts</span> <span className="text-slate-300">Recharts</span></div>
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Animations</span> <span className="text-slate-300">Framer Motion</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Middleware Connection */}
                    <div className="flex flex-col items-center opacity-60 relative group">
                        <ArrowRight className="w-8 h-8 text-slate-500 hidden md:block" />
                        <ArrowDown className="w-8 h-8 text-slate-500 md:hidden my-4" />

                        {/* Shooting Particle */}
                        <motion.div
                            animate={{ x: [0, 80], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute top-1/2 left-0 w-2 h-2 bg-brand-cyan rounded-full hidden md:block"
                        />

                        <span className="text-[10px] font-mono text-slate-500 mt-2 bg-slate-950 px-2 rounded border border-slate-800">REST API / WSS</span>
                    </div>

                    {/* Server Tier */}
                    <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                            <Server className="w-4 h-4 mr-2" />
                            Application Server
                        </div>
                        <div className="bg-slate-900 border-2 border-slate-700/50 rounded-xl p-6 text-center w-64 shadow-xl relative group hover:border-brand-orange/50 transition-colors">
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-brand-orange to-red-500 opacity-0 blur group-hover:opacity-20 transition-opacity"></div>
                            <h3 className="font-bold text-lg text-white mb-2 relative z-10">Backend Gateway</h3>
                            <p className="text-sm font-mono text-brand-orange mb-4 relative z-10">FastAPI (Python)</p>
                            <div className="space-y-2 text-xs text-slate-400 text-left relative z-10">
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Server</span> <span className="text-slate-300">Uvicorn</span></div>
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Storage</span> <span className="text-slate-300">SQLite / Redis</span></div>
                                <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex justify-between"><span>Auth</span> <span className="text-slate-300">JWT + OAuth2</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Model Connection */}
                    <div className="flex flex-col items-center opacity-60 relative">
                        <ArrowRight className="w-8 h-8 text-slate-500 hidden md:block" />
                        <ArrowDown className="w-8 h-8 text-slate-500 md:hidden my-4" />

                        {/* Shooting Particle */}
                        <motion.div
                            animate={{ x: [0, 80], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.75 }}
                            className="absolute top-1/2 left-0 w-2 h-2 bg-brand-orange rounded-full hidden md:block"
                        />

                        <span className="text-[10px] font-mono text-slate-500 mt-2 bg-slate-950 px-2 rounded border border-slate-800">Inference Request</span>
                    </div>

                    {/* AI Tier */}
                    <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                            <Network className="w-4 h-4 mr-2" />
                            AI Inference Layer
                        </div>
                        <div className="space-y-4">
                            {/* Model 1 */}
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-64 flex items-center hover:bg-slate-800 transition-colors shadow-lg">
                                <div className="w-10 h-10 rounded bg-brand-red/10 border border-brand-red/30 flex items-center justify-center mr-4">
                                    <Mail className="w-5 h-5 text-brand-red" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">DistilBERT</h4>
                                    <p className="text-xs text-slate-400 font-mono">Phishing NLP</p>
                                </div>
                            </div>
                            {/* Model 2 */}
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-64 flex items-center hover:bg-slate-800 transition-colors shadow-lg relative">
                                <div className="absolute left-0 top-1/2 -ml-8 w-8 h-[1px] bg-slate-700 hidden md:block"></div>
                                <div className="w-10 h-10 rounded bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center mr-4">
                                    <AlertTriangle className="w-5 h-5 text-brand-orange" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">IsolationForest</h4>
                                    <p className="text-xs text-slate-400 font-mono">Network Anomaly</p>
                                </div>
                            </div>
                            {/* Model 3 */}
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-64 flex items-center hover:bg-slate-800 transition-colors shadow-lg relative">
                                <div className="absolute left-0 top-1/2 -ml-8 w-8 h-[1px] bg-slate-700 hidden md:block"></div>
                                <div className="w-10 h-10 rounded bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mr-4">
                                    <Eye className="w-5 h-5 text-brand-cyan" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Xception CNN</h4>
                                    <p className="text-xs text-slate-400 font-mono">Deepfake Vision (ONNX)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Distributed Ledger Validation Footer */}
                <div className="mt-16 bg-slate-900/80 border border-slate-700 rounded-lg p-4 max-w-3xl w-full flex items-center justify-between z-10">
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-green-500 rounded-full blur-md -z-10"
                            />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
                                Federated Machine Learning
                                <span className="ml-3 px-2 py-0.5 bg-brand-cyan/20 text-brand-cyan text-[10px] rounded border border-brand-cyan/30">Active</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Global Weight Distribution Protocol (X-CENT-256)</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-mono">HASH_RATE</span>
                            <span className="text-xs text-white font-mono">42.8 TH/s</span>
                        </div>
                        <button className="text-[10px] font-bold text-slate-900 bg-brand-cyan px-4 py-2 rounded uppercase tracking-widest hover:bg-white transition-all">Consensus Log</button>
                    </div>
                </div>

            </div>
        </div>
    )
}
