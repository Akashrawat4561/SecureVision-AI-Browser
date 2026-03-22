import { useState } from 'react';
import { Key, ShieldCheck, Mail, Server, SlidersHorizontal, User, RefreshCw, Plus, ShieldAlert, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicButton from '../components/common/DynamicButton';

export default function Settings() {
    const [phishingLevel, setPhishingLevel] = useState(85);
    const [anomalySens, setAnomalySens] = useState(75);
    const [autoBlacklist, setAutoBlacklist] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle");
    const [activeTab, setActiveTab] = useState('general');

    const handleRotate = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 1500);
    };

    const handleSave = () => {
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }, 1500);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-16 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-brand-cyan mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono whitespace-nowrap">Control Matrix</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        System <span className="text-brand-cyan not-italic">Configuration</span>
                    </h1>
                </div>
                
                <div className="flex items-center space-x-4 bg-slate-900/40 backdrop-blur-2xl py-4 px-8 rounded-[28px] border border-white/5">
                    <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                        <Cpu className="w-4.5 h-4.5 text-brand-cyan" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Node Status</span>
                        <span className="text-xs font-mono text-white font-bold uppercase">All Systems Nominal</span>
                    </div>
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
                {/* Core Controls */}
                <motion.div variants={itemVariants} className="glass-panel p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-orange/10 transition-colors" />
                    
                    <h2 className="text-xl font-black text-white mb-10 flex items-center uppercase italic font-heading tracking-tighter">
                        <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20 mr-4">
                            <SlidersHorizontal className="w-5.5 h-5.5 text-brand-orange" />
                        </div>
                        Threat Thresholds
                    </h2>

                    <div className="space-y-10 relative z-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <label className="text-sm font-bold text-white uppercase tracking-tight font-heading">Phishing Auto-Block Level</label>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Sensitivity rating before rejecting emails</p>
                                </div>
                                <span className="text-2xl font-black text-brand-orange italic font-heading">{phishingLevel}%</span>
                            </div>
                            <input 
                                type="range" 
                                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-white/5" 
                                style={{ background: `linear-gradient(to right, #ff8b00 ${phishingLevel}%, #0f172a ${phishingLevel}%)` }}
                                min="0" max="100" 
                                value={phishingLevel} 
                                onChange={(e) => setPhishingLevel(parseInt(e.target.value))} 
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <label className="text-sm font-bold text-white uppercase tracking-tight font-heading">Network Anomaly Sensitivity</label>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                                        {anomalySens > 80 ? 'Hyper-Aggressive Mode' : anomalySens > 50 ? 'Standard Defense' : 'Permissive Mode'}
                                    </p>
                                </div>
                                <span className="text-2xl font-black text-brand-orange italic font-heading">{anomalySens}%</span>
                            </div>
                            <input 
                                type="range" 
                                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-white/5" 
                                style={{ background: `linear-gradient(to right, #ff8b00 ${anomalySens}%, #0f172a ${anomalySens}%)` }}
                                min="0" max="100" 
                                value={anomalySens} 
                                onChange={(e) => setAnomalySens(parseInt(e.target.value))} 
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <div>
                                    <span className="text-sm font-bold text-white uppercase tracking-tight font-heading block">Automated IP Blacklisting</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 block">Enable zero-interaction containment</span>
                                </div>
                                <button 
                                    onClick={() => setAutoBlacklist(!autoBlacklist)} 
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none flex items-center px-1 border ${
                                        autoBlacklist ? "bg-brand-cyan/20 border-brand-cyan/40" : "bg-slate-800 border-white/10"
                                    }`}
                                >
                                    <motion.div 
                                        animate={{ x: autoBlacklist ? 28 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className={`w-5 h-5 rounded-full shadow-md ${autoBlacklist ? "bg-brand-cyan shadow-[0_0_10px_#00f0ff]" : "bg-slate-500"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* API Key Management */}
                <motion.div variants={itemVariants} className="glass-panel p-10 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-64 h-64 bg-brand-cyan/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
                    
                    <h2 className="text-xl font-black text-white mb-10 flex items-center uppercase italic font-heading tracking-tighter">
                        <div className="p-2.5 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20 mr-4">
                            <Key className="w-5.5 h-5.5 text-brand-cyan" />
                        </div>
                        API Key Management
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 group/key hover:border-brand-cyan/30 transition-colors">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-white uppercase tracking-tight font-heading">Production Secret Key</span>
                                <span className="text-[9px] bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Active</span>
                            </div>
                            <div className="h-12 bg-slate-950 rounded-2xl border border-white/5 font-mono text-sm text-slate-500 p-4 flex items-center cursor-not-allowed justify-between">
                                <span>sk_live_********************************</span>
                            </div>
                            <button onClick={handleRotate} disabled={isRotating} className="mt-4 text-[10px] text-brand-cyan hover:text-white transition-colors font-black uppercase tracking-widest flex items-center p-2 rounded-lg hover:bg-brand-cyan/10">
                                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRotating ? "animate-spin text-white" : ""}`} />
                                {isRotating ? "Rotating Key..." : "Rotate Production Key"}
                            </button>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-white uppercase tracking-tight font-heading">Edge Node Webhook Access</span>
                            </div>
                            <div className="h-12 bg-slate-950 rounded-2xl border border-white/5 font-mono text-sm text-slate-500 p-4 flex items-center cursor-not-allowed">
                                whsec_******************************
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* System Integration Check */}
                <motion.div variants={itemVariants} className="glass-panel p-10 relative overflow-hidden">
                    <h2 className="text-xl font-black text-white mb-10 flex items-center uppercase italic font-heading tracking-tighter">
                        <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20 mr-4">
                            <Server className="w-5.5 h-5.5 text-green-500" />
                        </div>
                        System Integration Status
                    </h2>

                    <div className="space-y-4">
                        <StatusItem icon={ShieldCheck} label="FastAPI Backend Gateway" status="ONLINE" color="text-green-500" dotColor="bg-green-500" pulse />
                        <StatusItem icon={Mail} label="Deepfake AI Model Registry" status="LOADED" color="text-green-500" dotColor="bg-green-500" />
                        <StatusItem icon={Activity} label="Scapy Packet Ingestion" status="ACTIVE" color="text-green-500" dotColor="bg-green-500" pulse />
                        <StatusItem icon={Server} label="IsolationForest Anomaly Model" status="ONLINE" color="text-green-500" dotColor="bg-green-500" />
                        
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Last Synchronized: {new Date().toLocaleTimeString()}</span>
                            <button className="text-[10px] font-black uppercase tracking-widest text-brand-cyan hover:text-white transition-colors flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Run Diagnostics
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* User Account List */}
                <motion.div variants={itemVariants} className="glass-panel p-10 relative overflow-hidden">
                    <h2 className="text-xl font-black text-white mb-10 flex items-center uppercase italic font-heading tracking-tighter">
                        <div className="p-2.5 bg-slate-800 rounded-xl border border-white/10 mr-4">
                            <User className="w-5.5 h-5.5 text-white" />
                        </div>
                        SOC Analyst Accounts
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-cyan/30 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center mr-4 font-black text-sm text-brand-cyan border border-brand-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">JA</div>
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight font-heading">John Analyst</p>
                                    <p className="text-[10px] text-slate-500 font-mono">admin@securevision.ai</p>
                                </div>
                            </div>
                            <span className="text-[9px] uppercase font-black tracking-widest text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">SuperAdmin</span>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center mr-4 font-black text-sm text-white border border-white/10">MS</div>
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight font-heading">Maria SOC L2</p>
                                    <p className="text-[10px] text-slate-500 font-mono">maria.soc@securevision.ai</p>
                                </div>
                            </div>
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">Analyst</span>
                        </div>
                        
                        <DynamicButton 
                            variant="ghost" 
                            fullWidth 
                            className="mt-4 border border-dashed border-white/10 py-5 rounded-2xl text-slate-400 hover:text-white hover:border-white/30"
                            icon={Plus}
                        >
                            Add Operator Role
                        </DynamicButton>
                    </div>
                </motion.div>
            </motion.div>

            {/* Global Actions */}
            <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="flex justify-end pt-10 border-t border-white/5 mt-12"
            >
                <DynamicButton 
                    onClick={handleSave} 
                    isProcessing={saveStatus === 'saving'}
                    disabled={saveStatus !== 'idle'}
                    variant={saveStatus === 'saved' ? 'secondary' : 'primary'}
                    className={`px-12 py-5 rounded-full ${saveStatus === 'saved' ? 'border-green-500 text-green-500 bg-green-500/10 hover:bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : ''}`}
                    icon={saveStatus === 'saved' ? ShieldCheck : undefined}
                >
                    {saveStatus === 'idle' ? 'Apply System Configuration' : saveStatus === 'saving' ? 'Synchronizing Nodes' : 'Configuration Saved'}
                </DynamicButton>
            </motion.div>
        </div>
    );
}

const StatusItem = ({ icon: Icon, label, status, color, dotColor, pulse }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5">
        <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-slate-950 border border-white/5 mr-4 shadow-inner`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-tight font-heading">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse shadow-[0_0_8px_currentColor] text-inherit' : ''} ${color}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
        </div>
    </div>
);
