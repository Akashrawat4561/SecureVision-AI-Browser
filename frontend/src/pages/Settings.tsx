import { Key, ShieldCheck, Mail, Server, SlidersHorizontal, User } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase">System Details & Configuration</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* API Key Management */}
                <div className="glass-panel p-6 h-full border-t-2 border-t-brand-cyan">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center tracking-wider">
                        <Key className="w-5 h-5 text-brand-cyan mr-3" />
                        API Key Management
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-300">Production Secret Key</span>
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                            </div>
                            <div className="h-10 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-slate-500 p-2 flex items-center cursor-not-allowed">
                                sk_live_********************************
                            </div>
                            <button className="mt-3 text-xs text-brand-cyan hover:text-white transition-colors font-medium">Rotate Key...</button>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-300">Edge Node Webhook Access</span>
                            </div>
                            <div className="h-10 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-slate-500 p-2 flex items-center cursor-not-allowed">
                                whsec_******************************
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Controls */}
                <div className="glass-panel p-6 h-full border-t-2 border-t-brand-orange">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center tracking-wider">
                        <SlidersHorizontal className="w-5 h-5 text-brand-orange mr-3" />
                        Threat Thresholds
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-300">Phishing Score Auto-Block Level</label>
                                <span className="text-xs text-brand-orange font-mono">85%</span>
                            </div>
                            <input type="range" className="w-full accent-brand-orange" min="0" max="100" defaultValue="85" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-300">Network Anomaly Sensitivity</label>
                                <span className="text-xs text-brand-orange font-mono">Aggressive</span>
                            </div>
                            <input type="range" className="w-full accent-brand-orange" min="0" max="100" defaultValue="75" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-slate-300 block mb-0.5">Automated IP Blacklisting</span>
                                    <span className="text-xs text-slate-500">Enable zero-interaction containment.</span>
                                </div>
                                <div className="w-12 h-6 bg-brand-cyan/20 rounded-full flex items-center justify-end p-1 border border-brand-cyan/50 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                    <div className="w-4 h-4 bg-brand-cyan rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Account List */}
                <div className="glass-panel p-6 h-full">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center tracking-wider">
                        <User className="w-5 h-5 text-slate-400 mr-3" />
                        SOC Analyst Accounts
                    </h2>

                    <div className="space-y-3">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between group hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 font-bold text-xs text-brand-cyan border border-brand-cyan/30">JA</div>
                                <div>
                                    <p className="text-sm font-bold text-white">John Analyst</p>
                                    <p className="text-xs text-slate-400">admin@securevision.ai</p>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">SuperAdmin</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between group hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 font-bold text-xs text-brand-orange border border-brand-orange/30">MS</div>
                                <div>
                                    <p className="text-sm font-bold text-white">Maria SOC L2</p>
                                    <p className="text-xs text-slate-400">maria.soc@securevision.ai</p>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Analyst</span>
                        </div>
                        <button className="w-full mt-2 py-2 border-2 border-dashed border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                            + Add Analyst Account
                        </button>
                    </div>
                </div>

                {/* Server & Node Status summary */}
                <div className="glass-panel p-6 h-full">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center tracking-wider">
                        <Server className="w-5 h-5 text-slate-400 mr-3" />
                        System Integration Check
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ShieldCheck className="w-4 h-4 text-green-500 mr-3" />
                                <span className="text-sm text-slate-300">FastAPI Backend Gateway</span>
                            </div>
                            <span className="text-xs font-mono text-green-500">ONLINE</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 text-green-500 mr-3" />
                                <span className="text-sm text-slate-300">DistilBERT Inference Engine</span>
                            </div>
                            <span className="text-xs font-mono text-green-500">LOADED</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Server className="w-4 h-4 text-brand-orange mr-3" />
                                <span className="text-sm text-slate-300">IsolationForest Model State</span>
                            </div>
                            <span className="text-xs font-mono text-brand-orange">WARN: Retraining Req.</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <span className="text-xs text-slate-500">Last System Update: {new Date().toLocaleTimeString()}</span>
                            <button className="text-xs text-brand-cyan hover:text-white transition-colors">Run Diagnostics</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
