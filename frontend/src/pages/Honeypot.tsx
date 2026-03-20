import { Bug, Target, Activity, CodeSquare, Hexagon, Share2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useState, useEffect } from 'react';
import ThreatMap from '../components/ThreatMap';

export default function Honeypot() {
    const { data, connected } = useWebSocket();
    const [encounters, setEncounters] = useState<any[]>([]);

    // Process real-time events from WebSockets
    useEffect(() => {
        if (!connected || !data?.honeypot_events) return;

        // Add new events to the log
        if (data.honeypot_events.length > 0) {
            setEncounters(prev => {
                const newIds = new Set(data.honeypot_events!.map(e => e.id));
                const filteredPrev = prev.filter(e => !newIds.has(e.id));
                return [...data.honeypot_events!, ...filteredPrev].slice(0, 20);
            });
        }
    }, [data?.honeypot_events, connected]);

    const activeConnCount = data?.honeypot_connections || 0;
    const metrics = data?.honeypot_metrics || {
        top_exploit: "SSH Brute Force",
        payload_count: 0,
        avg_dwell_time: "0s"
    };

    const mapMarkers = encounters.map(e => ({
        id: e.id,
        coordinates: e.geo.coords,
        severity: e.attack.severity === 'critical' || e.attack.severity === 'high' ? 'high' : 'medium',
        label: e.attack.type
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white uppercase flex items-center">
                        <Bug className="text-brand-orange mr-3 w-8 h-8" />
                        Honeypot Decoy Network
                    </h1>
                    <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">Global Threat Intelligence Deception Node</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
                    <span className="text-xs text-brand-orange animate-pulse font-bold tracking-wider uppercase">Active Decoys Deployed</span>
                    <span className="text-brand-orange font-mono bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">3</span>
                </div>
            </div>

            {/* LIVE WORLD ATTACK MAP */}
            <div className="glass-panel p-4 h-[400px] relative overflow-hidden group">
                <div className="absolute top-6 left-6 z-10">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                        <h2 className="text-xs font-bold text-white uppercase tracking-tighter">Live Threat Map</h2>
                    </div>
                </div>
                <ThreatMap markers={mapMarkers} />

                {/* Map Legend */}
                <div className="absolute bottom-6 left-6 p-3 bg-slate-900/80 border border-slate-800 rounded-lg backdrop-blur-md z-10">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-brand-red" />
                            <span className="text-[10px] text-slate-300 uppercase">Critical/High Severity</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-brand-orange" />
                            <span className="text-[10px] text-slate-300 uppercase">Medium Severity</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Deception Environment Tracker */}
                <div className="glass-panel p-6 h-[450px] flex flex-col relative overflow-hidden lg:col-span-2">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center justify-between">
                        <span className="flex items-center"><Activity className="mr-2 w-4 h-4 text-brand-orange" /> Live Adversary Engagements</span>
                        <span className="text-brand-orange font-mono bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">Active Sessions: {activeConnCount}</span>
                    </h2>

                    <div className="flex-1 bg-slate-950/50 rounded border border-slate-800/50 overflow-y-auto p-4 font-mono text-xs relative scrollbar-hide">
                        <div className="space-y-2 relative z-10">
                            <AnimatePresence>
                                {encounters.length === 0 && (
                                    <div className="text-slate-600 flex flex-col items-center justify-center h-full pt-20">
                                        <Hexagon className="w-12 h-12 mb-4 opacity-20 animate-spin-slow" />
                                        <span>Watching decoy perimeter... no active engagements.</span>
                                    </div>
                                )}
                                {encounters.map(e => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        key={e.id}
                                        className="p-3 border border-slate-800/50 bg-slate-900/30 rounded flex justify-between items-center group/item hover:bg-slate-800/40 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-slate-500 text-[10px]">[{e.timestamp}]</span>
                                            <div className="flex items-center space-x-2 min-w-[120px]">
                                                <span className="text-lg">{e.geo.flag}</span>
                                                <span className="text-brand-red font-bold text-sm tracking-tighter">{e.ip}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-800 ${e.attack.color}`}>
                                                    {e.attack.type}
                                                </span>
                                                <span className="text-[9px] text-slate-500 uppercase mt-0.5 pl-1 italic font-sans">{e.geo.country}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-[10px] font-bold uppercase ${e.attack.severity === 'critical' ? 'text-brand-red' :
                                                    e.attack.severity === 'high' ? 'text-orange-500' : 'text-slate-400'
                                                }`}>
                                                {e.attack.severity}
                                            </span>
                                            {e.attack.severity === 'critical' && <ShieldAlert className="w-4 h-4 text-brand-red animate-pulse" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Captured Intelligence Summary */}
                <div className="glass-panel p-6 flex flex-col space-y-6 overflow-hidden">
                    <div className="relative">
                        <div className="absolute -top-10 -right-10 opacity-5">
                            <Target className="w-40 h-40" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 relative z-10">Threat Intelligence</h2>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-cyan/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Top Targeted Exploit <Target className="w-4 h-4 text-brand-cyan" /></div>
                                <div className="text-lg text-brand-cyan font-mono font-bold leading-tight">{metrics.top_exploit}</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Most frequent vector</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-orange/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Captured Payloads <CodeSquare className="w-4 h-4 text-brand-orange" /></div>
                                <div className="text-lg text-brand-orange font-mono font-bold leading-tight">{metrics.payload_count} Unique Hashes</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Decentralized Analysis</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-red/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Attacker Dwell Time <Activity className="w-4 h-4 text-brand-red" /></div>
                                <div className="text-lg text-brand-red font-mono font-bold leading-tight">{metrics.avg_dwell_time}</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Avg lifecycle in decoy</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end">
                        <button className="group w-full py-4 bg-gradient-to-r from-brand-orange/30 to-brand-red/30 hover:from-brand-orange/40 hover:to-brand-red/40 text-white border border-brand-orange/30 transition-all uppercase tracking-[0.2em] text-[10px] font-black rounded-xl shadow-[0_0_20px_rgba(255,139,0,0.15)] flex justify-center items-center">
                            <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Publish Intelligence
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
