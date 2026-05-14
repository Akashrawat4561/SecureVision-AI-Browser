import { ShieldAlert, Activity, MailWarning, TrendingUp, Globe, Cpu, Target, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo } from 'react';
import DynamicButton from '../components/common/DynamicButton';
import ThreatMap from '../components/dashboard/ThreatMap';

export default function Dashboard() {
    const { data, alerts, connected } = useWebSocket();

    const stats = useMemo(() => {
        let emailThreats = 0;
        let anomalyCount = 0;
        alerts.forEach(a => {
            if (a.type?.includes('PHISHING')) emailThreats++;
            if (a.type?.includes('ANOMALY')) anomalyCount++;
        });

        return [
            { name: 'Active Threats', value: emailThreats.toString(), alert: emailThreats > 0, icon: ShieldAlert, color: 'brand-red', trend: '+12%', desc: 'Current major threats' },
            { name: 'System Activity', value: anomalyCount.toString(), alert: anomalyCount > 0, icon: Activity, color: 'brand-cyan', trend: '98.4%', desc: 'Connection efficiency' },
            { name: 'Data Flow', value: (data?.traffic || 0).toString(), alert: false, icon: MailWarning, color: 'brand-orange', trend: '+4%', desc: 'Data amount' },
            { name: 'System Protection', value: `${data?.global_threat_level || 15}%`, alert: (data?.global_threat_level || 0) > 50, icon: Radar, color: 'brand-purple', trend: 'STABLE', desc: 'System status' },
        ];
    }, [alerts, data]);

    const mapMarkers = useMemo(() => {
        const locations = [
            [-74.006, 40.7128], [0.1278, 51.5074], [139.6503, 35.6762], [151.2093, -33.8688],
            [-43.1729, -22.9068], [18.4241, -33.9249], [77.1025, 28.7041], [-118.2437, 34.0522]
        ];
        return alerts.slice(0, 10).map((a, i) => ({
            id: a.id || i,
            coordinates: locations[(a.id || i) % locations.length],
            severity: a.severity || 'low',
            label: a.title || 'Unknown Threat'
        }));
    }, [alerts]);

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-16">
            {/* Mission Critical Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-brand-cyan mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">Live Security Dashboard</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Security <span className="text-brand-cyan not-italic">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                        Real-time threat monitoring and network intelligence across all active nodes.
                    </p>
                </div>

                <div className="flex items-center space-x-6 bg-slate-900/40 backdrop-blur-2xl py-5 px-10 rounded-[32px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">System Readiness</span>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((level) => {
                                const active = (data?.global_threat_level || 0) / 20 >= (6 - level);
                                return (
                                    <div key={level} className={`w-3.5 h-6 rounded-md border transition-all duration-500 ${active ? 'bg-brand-red border-brand-red shadow-[0_0_15px_#ff2a2e]' : 'border-white/5 bg-slate-950'}`} />
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="h-12 w-px bg-white/5 mx-2" />
                    
                    <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-2.5 mb-2">
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse' : 'bg-brand-red shadow-[0_0_8px_#ff2a2e]'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${connected ? 'text-brand-cyan' : 'text-brand-red'}`}>
                                {connected ? 'System Online' : 'Sync Failed'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold tracking-tighter uppercase">ID: SV-CORE-09-RT</span>
                    </div>
                </div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.name}
                        whileHover={{ y: -5 }}
                        className="glass-panel p-7 group cursor-pointer relative overflow-hidden shimmer-effect"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-${stat.color}/10 transition-colors duration-500`} />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 bg-slate-950 rounded-[22px] flex items-center justify-center border border-white/5 group-hover:border-${stat.color}/30 transition-all duration-300 shadow-2xl relative overflow-hidden`}>
                                <div className={`absolute inset-0 bg-${stat.color}/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <stat.icon className={`w-6.5 h-6.5 text-${stat.color} group-hover:scale-110 transition-transform relative z-10`} />
                            </div>
                            <div className="text-right">
                                <span className={`text-[11px] font-black ${stat.alert ? 'text-brand-red' : 'text-brand-cyan'} font-mono`}>{stat.trend}</span>
                                <div className="h-0.5 w-10 bg-white/5 mt-1.5 ml-auto" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.name}</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter font-heading truncate group-hover:text-brand-cyan transition-colors">
                                {stat.value}
                            </h3>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight mt-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                {stat.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Visual Intelligence Section */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="glass-panel p-10 min-h-[550px] flex flex-col relative overflow-hidden group">
                        <div className="accent-glow top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 blur-[150px]" />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-2.5 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                                    <Globe className="w-5.5 h-5.5 text-brand-cyan" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Global Threat Map</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live Global Threat Map</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2.5 bg-slate-950/80 p-2 rounded-2xl border border-white/5">
                                <DynamicButton variant="primary" fullWidth={false} className="px-4 py-2 rounded-xl text-[10px] normal-case tracking-normal">Network View</DynamicButton>
                                <DynamicButton variant="ghost" fullWidth={false} className="px-4 py-2 rounded-xl text-[10px] normal-case tracking-normal">Map View</DynamicButton>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-slate-950/50 rounded-[40px] border border-white/10 relative overflow-hidden">
                            <ThreatMap markers={mapMarkers} />
                        </div>
                    </div>

                    <div className="glass-panel p-10 relative overflow-hidden group">
                        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
                                <Cpu className="w-5.5 h-5.5 text-brand-orange" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading">Active Servers</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Active processing servers</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {(data?.nodes || [1, 2]).map((node, i) => (
                                <div key={i} className="space-y-5 group/node">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 group-hover/node:border-brand-orange/30 transition-colors">
                                                <Target className="w-5 h-5 text-slate-500 group-hover/node:text-brand-orange transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase tracking-tight">
                                                    {i === 0 ? 'Server 1' : 'Server 2'}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Online Server</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono text-brand-cyan font-black">
                                                {typeof node === 'object' && 'latency' in node ? `${node.latency}ms` : '9.45ms'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${typeof node === 'object' && 'cpu' in node ? node.cpu : (i === 0 ? 78 : 42)}%` }}
                                            className={`h-full bg-gradient-to-r ${i === 0 ? 'from-brand-orange to-brand-red' : 'from-brand-cyan to-blue-500'} shadow-[0_0_10px_rgba(255,139,0,0.3)]`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Operations Intel Feed */}
                <div className="glass-panel p-10 flex flex-col h-[850px] relative overflow-hidden group">
                    <div className="accent-glow -bottom-20 -left-20 w-[400px] h-[400px] bg-brand-red/5 blur-[120px]" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-brand-red/10 rounded-xl border border-brand-red/20 shadow-[0_0_15px_rgba(255,42,46,0.1)]">
                                <ShieldAlert className="w-5.5 h-5.5 text-brand-red" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Recent Alerts</h3>
                        </div>
                        {alerts.length > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-brand-red/10 border border-brand-red/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
                                <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">{alerts.length} NEW</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-5 pr-3 custom-scrollbar relative z-10">
                        <AnimatePresence mode="popLayout">
                            {alerts.slice(0, 15).map((alert, idx) => (
                                <motion.div
                                    key={alert.id || idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-5 bg-slate-900/40 border border-white/5 rounded-[28px] hover:border-brand-red/30 transition-all group/alert cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-red opacity-0 group-hover/alert:opacity-100 transition-opacity" />
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl bg-slate-950 border border-white/5 transition-colors ${
                                                alert.severity === 'high' ? 'text-brand-red group-hover/alert:border-brand-red/20' : 'text-brand-cyan group-hover/alert:border-brand-cyan/20'
                                            }`}>
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    alert.severity === 'high' ? 'text-brand-red' : 'text-brand-cyan'
                                                }`}>{alert.type || 'Hacker Attempt'}</span>
                                                <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">{alert.time || 'T+0:02ms'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-slate-200 font-bold leading-relaxed font-heading group-hover/alert:text-white transition-colors">
                                        {alert.title || alert.message}
                                    </p>
                                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Cpu className="w-3 h-3 text-slate-600" />
                                            <span className="text-[9px] text-slate-500 font-mono uppercase truncate max-w-[120px]">{alert.source || 'CLUSTER_01'}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 group-hover/alert:text-brand-cyan transition-colors uppercase tracking-widest">View Details</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-10 border-t border-white/5 space-y-8 relative z-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Connection Status</span>
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Establishing secure connection</span>
                                </div>
                                <span className="text-2xl font-black text-brand-cyan font-heading tracking-tighter">99.2%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                <motion.div animate={{ width: '99.2%' }} className="h-full bg-gradient-to-r from-brand-cyan to-blue-600" />
                            </div>
                        </div>

                        <DynamicButton
                            variant="primary"
                            icon={TrendingUp}
                            className="w-full py-5 rounded-[24px]"
                        >
                            Download Security Report
                        </DynamicButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
