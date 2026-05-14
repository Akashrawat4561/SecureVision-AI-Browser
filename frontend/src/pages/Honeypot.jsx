import {
    Bug, Target, Activity, CodeSquare, Hexagon, Share2,
    ShieldAlert, Loader2, CheckCircle2, XCircle, FileText,
    Globe, Wifi, Server, Zap, Shield, Terminal, AlertTriangle,
    Lock, Radio, Database, Map as MapIcon, MousePointer2, ExternalLink, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useState, useEffect, useRef } from 'react';
import DynamicButton from '../components/common/DynamicButton';

const PROTOCOL_DECOYS = [
    { proto: 'SSH',  port: 2222, icon: Terminal, color: 'cyan'   },
    { proto: 'HTTP', port: 8081, icon: Globe,    color: 'orange' },
    { proto: 'SMTP', port: 2525, icon: Radio,    color: 'purple' },
    { proto: 'FTP',  port: 2121, icon: Database, color: 'green'  },
];

const SEV_CONFIG = {
    critical: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-500'   },
    high:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400'},
    medium:   { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400'},
    low:      { bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-500/30',  dot: 'bg-slate-400' },
};

const PROTO_COLORS = {
    SSH:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    HTTP: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    SMTP: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    FTP:  'text-green-400 bg-green-500/10 border-green-500/20',
};

const env     = import.meta.env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

// ─── Attack type → icon mapping ──────────────────────────────────────────────
function attackIcon(type) {
    if (!type) return Bug;
    const t = type.toLowerCase();
    if (t.includes('sql') || t.includes('injection'))      return Database;
    if (t.includes('malware') || t.includes('dropper'))    return Zap;
    if (t.includes('brute'))                               return Lock;
    if (t.includes('scan'))                                return Activity;
    if (t.includes('smtp') || t.includes('relay'))         return Radio;
    if (t.includes('ftp'))                                 return Server;
    if (t.includes('xss') || t.includes('web'))           return Globe;
    if (t.includes('path') || t.includes('traversal'))    return Shield;
    if (t.includes('protocol') || t.includes('exploit'))  return ShieldAlert;
    return Bug;
}

export default function Honeypot() {
    const { data, connected } = useWebSocket();
    const [encounters, setEncounters]   = useState([]);
    const [pendingAction, setPendingAction] = useState(null);
    const [feedback, setFeedback]       = useState(null);
    const [protoFilter, setProtoFilter] = useState('ALL');
    const [terminalLog, setTerminalLog] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [viewMode, setViewMode] = useState('FEED');
    const [intelligence, setIntelligence] = useState([]);
    const terminalRef = useRef(null);

    // ── Ingest encounters from WebSocket ─────────────────────────────────────
    useEffect(() => {
        if (!connected || !data?.honeypot_events) return;
        if (data.honeypot_events.length > 0) {
            setEncounters(prev => {
                const newIds = new Set(data.honeypot_events.map((e) => e.id));
                const filtered = prev.filter(e => !newIds.has(e.id));
                return [...data.honeypot_events, ...filtered].slice(0, 100);
            });
            // Append terminal-style lines
            data.honeypot_events.forEach((e) => {
                const ts   = new Date().toISOString().split('T')[1].split('.')[0];
                // Support both flat fields (backend) and nested attack object
                const attackType = e.attack?.type ?? e.attack_type ?? 'probe';
                const attackSev  = e.attack?.severity ?? e.severity ?? 'low';
                const line = `[${ts}] ${e.ip ?? '?.?.?.?'} → ${attackType} | ${attackSev.toUpperCase()} | ${e.geo?.country ?? '?'}`;
                setTerminalLog(p => [line, ...p].slice(0, 100));
            });
        }
    }, [data?.honeypot_events, connected]);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = 0;
    }, [terminalLog]);

    const fetchIntelligence = async () => {
        try {
            const res = await fetch(`${API_BASE}/honeypot/intelligence`);
            const data = await res.json();
            if (data.clusters) setIntelligence(data.clusters);
        } catch (e) {
            console.error("Failed to fetch intelligence", e);
        }
    };

    useEffect(() => {
        if (viewMode === 'INTEL') fetchIntelligence();
    }, [viewMode]);

    const activeConnCount = data?.honeypot_connections || 0;
    const metrics = data?.honeypot_metrics || {
        top_exploit: 'SSH Brute Force',
        payload_count: 0,
        avg_dwell_time: '0s',
    };

    const filtered = protoFilter === 'ALL'
        ? encounters
        : encounters.filter(e => (e.protocol ?? 'SSH') === protoFilter);

    // ── Severity breakdown counts ─────────────────────────────────────────────
    const sevCounts = ['critical', 'high', 'medium', 'low'].reduce(
        (acc, s) => ({ ...acc, [s]: encounters.filter(e => (e.attack?.severity ?? e.severity ?? 'low') === s).length }),
        {}
    );

    // ── Attack type top-5 ─────────────────────────────────────────────────────
    const attackBreakdown = Object.entries(
        encounters.reduce((acc, e) => {
            const t = e.attack?.type ?? e.attack_type ?? 'Unknown';
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const showFeedback = (tone, message) => {
        setFeedback({ tone, message });
        window.setTimeout(() => setFeedback(null), 3500);
    };

    const shareIntel = async (mode, intelType, source, successMessage) => {
        setPendingAction(mode);
        try {
            // Simulated propagation delay for dynamic effect
            await new Promise(r => setTimeout(r, 2400));
            
            const res = await fetch(`${API_BASE}/intel/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    hash: `HP-${Math.random().toString(16).slice(2, 10)}`, 
                    type: intelType, 
                    source,
                    timestamp: new Date().toISOString(),
                    priority: 'CRITICAL'
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.detail || 'Failed');
            showFeedback('success', successMessage);
        } catch (err) {
            showFeedback('error', err instanceof Error ? err.message : 'Intel share failed.');
        } finally {
            setPendingAction(null);
        }
    };

    const generateReport = async () => {
        setPendingAction('report');
        try {
            const lines = [
                '═══════════════════════════════════════════',
                '  SECUREVISION HONEYPOT ENGAGEMENT REPORT  ',
                '═══════════════════════════════════════════',
                `Generated : ${new Date().toISOString()}`,
                `Node      : sv-honeypot-grid-v2.0`,
                `Active    : ${activeConnCount} sessions`,
                `Top Vector: ${metrics.top_exploit}`,
                `Payloads  : ${metrics.payload_count}`,
                `Avg Dwell : ${metrics.avg_dwell_time}`,
                '-------------------------------------------',
                'SEVERITY BREAKDOWN:',
                ...Object.entries(sevCounts).map(([s, n]) => `  ${s.toUpperCase().padEnd(10)} ${n}`),
                '-------------------------------------------',
                'LATEST ENGAGEMENTS:',
                ...encounters.slice(0, 100).map(e =>
                    `${e.timestamp ?? '-'} | ${e.ip ?? '?'} | ${e.protocol ?? 'SSH'} | ${e.attack?.type ?? e.attack_type ?? '?'} | ${e.attack?.severity ?? e.severity ?? '?'} | ${e.geo?.country ?? '?'}`
                ),
            ];
            const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `honeypot_report_${Date.now()}.txt`;
            link.click(); URL.revokeObjectURL(url);
            showFeedback('success', 'Tactical Forensic Report Dumped.');
        } catch (err) {
            showFeedback('error', err instanceof Error ? err.message : 'Report failed.');
        } finally {
            setPendingAction(null);
        }
    };

    return (
        <div className="space-y-8 max-w-[1700px] mx-auto pb-16">

            {/* Honeypot Grid Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-brand-orange">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_#ff8b00] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">
                            Multi-Protocol Deception // Active
                        </span>
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Honeypot <span className="text-brand-orange not-italic">Grid</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xl">
                        Identify hackers exploring your network using fake servers.
                    </p>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network Status</span>
                         <span className="text-xs font-mono font-black text-green-400">SECURE</span>
                    </div>
                    <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-3xl px-8 py-5 rounded-[32px] border border-white/5 shadow-2xl">
                        <div className="w-3 h-3 rounded-full bg-brand-orange animate-ping shadow-[0_0_10px_#ff8b00]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Engagements</span>
                            <span className="text-3xl font-black text-white font-mono leading-none">
                                {activeConnCount.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decoy Protocol Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {PROTOCOL_DECOYS.map(({ proto, port, icon: Icon, color }) => {
                    const count = encounters.filter(e => (e.protocol ?? 'SSH') === proto).length;
                    const isActive = connected;
                    return (
                        <motion.div
                            key={proto}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`glass-panel p-6 flex items-center space-x-5 cursor-pointer group transition-all duration-300
                                ${protoFilter === proto ? `bg-${color}-500/10 border-${color}-500/40 ring-1 ring-${color}-500/20 shadow-[0_0_30px_rgba(255,160,0,0.1)]` : 'hover:bg-white/5 hover:border-white/10'}`}
                            onClick={() => setProtoFilter(p => p === proto ? 'ALL' : proto)}
                        >
                            <div className={`p-4 rounded-2xl border transition-all duration-300
                                ${protoFilter === proto ? `bg-${color}-500/20 border-${color}-500/40 shadow-[0_0_15px_rgba(255,160,0,0.2)]` : `bg-${color}-500/10 border-${color}-500/20`}`}>
                                <Icon className={`w-6 h-6 text-${color}-400 group-hover:rotate-12 transition-transform`} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className="text-sm font-black text-white uppercase tracking-tighter italic font-heading">{proto} Server</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase border font-mono ${PROTO_COLORS[proto]}`}>:{port}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{count} Attacks Captured</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* 3-Column Tactical Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Engagement Feed (7 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-panel p-8 flex flex-col h-[650px] relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-brand-orange/10 transition-colors duration-1000" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-brand-orange/10 rounded-2xl border border-brand-orange/20 shadow-inner">
                                    <Activity className="w-6 h-6 text-brand-orange" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Captured Hacker Activity</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Live feed of what hackers are doing</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                                    {['FEED', 'INTEL'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setViewMode(v)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                                ${viewMode === v
                                                    ? 'bg-brand-cyan text-slate-950 border-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                                    : 'bg-transparent text-slate-500 border-white/0 hover:bg-white/5 hover:text-slate-300'}`}
                                        >
                                            {v === 'FEED' ? 'Live Stream' : 'IP Clustering'}
                                        </button>
                                    ))}
                                </div>
                                {viewMode === 'FEED' && (
                                    <div className="flex items-center space-x-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                                        {['ALL', 'SSH', 'HTTP', 'SMTP', 'FTP'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setProtoFilter(p)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                                    ${protoFilter === p
                                                        ? 'bg-brand-orange text-slate-950 border-brand-orange shadow-[0_0_15px_rgba(255,139,0,0.3)]'
                                                        : 'bg-transparent text-slate-500 border-white/0 hover:bg-white/5 hover:text-slate-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {viewMode === 'INTEL' ? (
                                    intelligence.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-cyan mb-2" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gathering IP Addresses</span>
                                        </div>
                                    ) : (
                                        intelligence.map(cluster => (
                                            <motion.div
                                                key={cluster.ip}
                                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                                className="p-5 rounded-[28px] border-2 bg-slate-900/80 border-brand-cyan/20 flex flex-col gap-4 shadow-lg mb-4 hover:border-brand-cyan/50 hover:bg-slate-900 transition-all cursor-crosshair group/cluster"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-3 bg-brand-cyan/10 rounded-2xl border border-brand-cyan/30 group-hover/cluster:scale-110 transition-transform shadow-inner">
                                                            <Network className="w-5 h-5 text-brand-cyan" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xl font-black text-white font-mono tracking-tighter leading-none mb-1">{cluster.ip}</span>
                                                            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                                <span className="text-sm">{cluster.geo.flag}</span>
                                                                <span>{cluster.geo.country}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex flex-col text-right text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                            <div>First Seen: <span className="text-slate-300 font-mono italic">{cluster.first_seen?.split('T')[1]?.split('.')[0] || 'Unknown'}</span></div>
                                                            <div>Last Seen: <span className="text-slate-300 font-mono italic">{cluster.last_seen?.split('T')[1]?.split('.')[0] || 'Unknown'}</span></div>
                                                        </div>
                                                        <div className="h-8 w-[1px] bg-white/10" />
                                                        <div className="bg-brand-red/10 border border-brand-red/20 px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-inner">
                                                            <Activity className="w-3.5 h-3.5 text-brand-red animate-pulse" />
                                                            <span className="text-brand-red font-black text-xs">{cluster.total_sessions} Sessions</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-white/5 shadow-inner mt-2">
                                                    <div className="flex flex-col min-w-[80px]">
                                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center space-x-1"><Activity className="w-3 h-3"/><span>Total Time Trapped</span></span>
                                                        <span className="text-sm font-black text-brand-orange font-mono">{cluster.total_dwell.toFixed(1)}s</span>
                                                    </div>
                                                    <div className="w-[1px] h-8 bg-white/5" />
                                                    <div className="flex flex-col min-w-[80px]">
                                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center space-x-1"><CodeSquare className="w-3 h-3"/><span>Payloads</span></span>
                                                        <span className="text-sm font-black text-white font-mono">{cluster.payload_count}</span>
                                                    </div>
                                                    <div className="w-[1px] h-8 bg-white/5" />
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Observed Attacks</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cluster.attack_types.map(at => <span key={at} className="text-[9px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-md uppercase font-bold tracking-widest border border-white/5 flex items-center space-x-1"><Bug className="w-2.5 h-2.5"/><span>{at}</span></span>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-brand-orange blur-[60px] opacity-10" />
                                            <Hexagon className="w-20 h-20 opacity-20 animate-[spin_20s_linear_infinite]" />
                                            <Radar className="w-10 h-10 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-40" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-black uppercase tracking-[0.4em] block mb-2">Network Status: Safe</span>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">No active hacker attempts detected</span>
                                        </div>
                                    </div>
                                ) : filtered.map(e => {
                                    const sev  = e.attack?.severity ?? e.severity ?? 'low';
                                    const type = e.attack?.type ?? e.attack_type ?? 'Unknown Probe';
                                    const proto = e.protocol ?? 'SSH';
                                    const sevC = SEV_CONFIG[sev] ?? SEV_CONFIG.low;
                                    const Icon = attackIcon(type);
                                    const isSelected = selectedIncident?.id === e.id;

                                    return (
                                        <motion.div
                                            key={e.id}
                                            layout
                                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0,   scale: 1 }}
                                            exit={{   opacity: 0, scale: 0.95 }}
                                            onClick={() => setSelectedIncident(e)}
                                            className={`p-5 rounded-[28px] border-2 flex items-center gap-6 cursor-pointer group transition-all duration-300 relative overflow-hidden
                                                ${isSelected ? 'bg-slate-900 border-brand-orange shadow-2xl' : `${sevC.bg} ${sevC.border} hover:scale-[1.01] hover:brightness-110 shadow-lg`}`}
                                        >
                                            {/* Severity Pillar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sevC.dot} opacity-60`} />

                                            {/* Icon */}
                                            <div className={`p-3.5 rounded-2xl ${sevC.bg} border-2 ${sevC.border} shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-5 h-5 ${sevC.text}`} />
                                            </div>

                                            {/* IP + Geo */}
                                            <div className="flex flex-col min-w-[140px]">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-black text-white font-mono tracking-tighter leading-none mb-1">
                                                        {e.ip ?? '?.?.?.?'}
                                                    </span>
                                                    {isSelected && <MousePointer2 className="w-3 h-3 text-brand-orange" />}
                                                </div>
                                                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                    <span className="opacity-80">{e.geo?.flag ?? '🌐'}</span>
                                                    <span>{e.geo?.city ?? 'UNKNOWN'}, {e.geo?.country ?? 'LOCAL'}</span>
                                                </div>
                                            </div>

                                            <div className="h-10 w-[1px] bg-white/5 shrink-0" />

                                            {/* Protocol + Attack type */}
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${PROTO_COLORS[proto]}`}>
                                                        {proto}
                                                    </span>
                                                    <span className="text-[9px] text-slate-600 font-mono italic">{e.timestamp?.split('T')[1]?.split('.')[0] || e.timestamp?.split(' ')[1] || '00:00:00'}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-200 tracking-tight uppercase leading-none">{type}</span>
                                            </div>

                                            {/* Severity + dwell */}
                                            <div className="flex flex-col items-end shrink-0 gap-2">
                                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-2xl border-2 shadow-inner ${sevC.bg} ${sevC.border}`}>
                                                    <div className={`w-2 h-2 rounded-full ${sevC.dot} ${sev === 'critical' ? 'animate-pulse shadow-[0_0_8px_#ff0000]' : ''}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${sevC.text}`}>{sev}</span>
                                                </div>
                                                {e.dwell_time != null && (
                                                    <div className="flex items-center space-x-1.5 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-white/5">
                                                        <Activity className="w-2.5 h-2.5 text-slate-500" />
                                                        <span className="text-[9px] text-slate-400 font-black font-mono leading-none tracking-tighter">{e.dwell_time}s trapped</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Tactical Log Terminal - Refined */}
                    <div className="glass-panel p-6 relative overflow-hidden rounded-[32px]">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20 shadow-inner">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                </div>
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono italic">Live Hacker Commands</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v2.0 STABLE</span>
                                {connected
                                    ? <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" /><span className="text-[10px] font-black tracking-widest">ACTIVE</span></div>
                                    : <div className="flex items-center space-x-2 text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /><span className="text-[10px] font-black tracking-widest">OFFLINE</span></div>
                                }
                            </div>
                        </div>
                        <div
                            ref={terminalRef}
                            className="h-32 overflow-y-auto font-mono text-[10px] bg-slate-950/90 rounded-[20px] p-5 border border-white/5 space-y-1 custom-scrollbar shadow-inner"
                        >
                            {terminalLog.length === 0
                                ? <span className="text-slate-800 animate-pulse font-bold">{'>'} Network Secure. Awaiting incoming attacks…</span>
                                : terminalLog.map((line, i) => {
                                    const isCrit = line.toLowerCase().includes('critical');
                                    const isHigh = line.toLowerCase().includes('high');
                                    return (
                                        <div key={i} className={`flex space-x-3 transition-opacity duration-300 ${i > 5 ? 'opacity-40' : (i > 2 ? 'opacity-70' : 'opacity-100')}`}>
                                            <span className="text-slate-700 shrink-0 select-none">#</span>
                                            <span className={isCrit ? 'text-red-400 font-bold' : isHigh ? 'text-orange-400 font-bold' : 'text-green-400 font-medium'}>
                                                {line}
                                            </span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>

                {/* Tactical Operations Sidebar (5 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Incident Detailed Inspector */}
                    <AnimatePresence mode="wait">
                        {selectedIncident ? (
                            <motion.div
                                key="inspector"
                                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                                className="glass-panel p-8 relative overflow-hidden rounded-[40px] shadow-2xl border-brand-orange/20"
                            >
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-orange/5 blur-3xl opacity-50" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading">Hacker Details</h3>
                                    <button onClick={() => setSelectedIncident(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                        <XCircle className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-slate-950/80 rounded-[32px] border border-white/10 shadow-inner">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Hacker Commands Used</p>
                                        <div className="bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-slate-300 break-all leading-relaxed h-28 overflow-y-auto custom-scrollbar border border-white/5">
                                            {selectedIncident.attack?.payload || selectedIncident.payload || 'No commands captured from this hacker.'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Factor</p>
                                            <p className={`text-xl font-black italic font-heading ${SEV_CONFIG[selectedIncident.attack?.severity ?? selectedIncident.severity ?? 'low'].text}`}>
                                                {((selectedIncident.attack?.severity ?? selectedIncident.severity) || 'LOW').toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Interaction</p>
                                            <p className="text-xl font-black text-white italic font-heading">
                                                {selectedIncident.protocol || 'SSH'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Analysis</p>
                                        <TacticRow label="Attack Method" value={selectedIncident.protocol === 'SSH' ? 'Password Brute' : 'Method Probing'} />
                                        <TacticRow label="OS Fingerprint" value={selectedIncident.os || 'Linux Kernel 5.x'} />
                                        <TacticRow label="Browser Identity" value={selectedIncident.user_agent ? (selectedIncident.user_agent.slice(0, 20) + '...') : 'Go-http-client/v1'} />
                                        <TacticRow label="Geo Confidence" value="High (v4-Tier)" />
                                    </div>

                                    <DynamicButton 
                                        variant="danger"
                                        icon={ShieldAlert}
                                        label="Block Hacker"
                                        sublabel={`ISOLATING ${selectedIncident.ip}`}
                                        successMessage="Hacker Blocked"
                                        isProcessing={pendingAction === 'block'}
                                        onClick={() => void shareIntel('block', 'IP_BLOCK', selectedIncident.ip, 'Global block propagated.')}
                                    >
                                        Block IP Address
                                    </DynamicButton>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-panel p-8 rounded-[40px] flex flex-col items-center justify-center h-[400px] border-dashed border-white/10 opacity-30 group-hover:opacity-40 transition-opacity">
                                <Target className="w-16 h-16 text-slate-500 mb-6 animate-[spin_8s_linear_infinite]" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-6 leading-relaxed">
                                    Select an event from the map or list to view detailed attacker characteristics.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Threat Intelligence / Metrics Panel */}
                    <div className="glass-panel p-8 space-y-8 rounded-[40px]">
                        <div className="flex items-center space-x-3 mb-2">
                             <Shield className="w-5 h-5 text-brand-orange" />
                             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading">Threat Intelligence</h3>
                        </div>

                        {/* Top Vectors List */}
                        <div className="space-y-4">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Top Attack Types</p>
                             {attackBreakdown.map(([type, count]) => {
                                 const Icon = attackIcon(type);
                                 return (
                                     <div key={type} className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-white/5 shadow-inner">
                                         <div className="flex items-center space-x-3">
                                             <div className="p-1.5 bg-brand-orange/10 rounded-lg">
                                                 <Icon className="w-4 h-4 text-brand-orange" />
                                             </div>
                                             <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{type}</span>
                                         </div>
                                         <span className="text-[11px] font-mono text-brand-orange font-black bg-brand-orange/10 px-2 py-0.5 rounded-md">{count}×</span>
                                     </div>
                                 );
                             })}
                        </div>
                        
                        <div className="space-y-4">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Stats</p>
                             <IntelRow label="Top Attack Type"   value={metrics.top_exploit}     icon={Zap}    />
                             <IntelRow label="Total Commands Captured"   value={`${metrics.payload_count}`} icon={CodeSquare} />
                             <IntelRow label="Avg Time Trapped"  value={metrics.avg_dwell_time}  icon={Activity}       />
                             <IntelRow label="Total Attacks"   value={`${encounters.length}`}  icon={Targets}    />
                        </div>

                        {/* Action Stack */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                             <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                        className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg mb-4
                                            ${feedback.tone === 'success' ? 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan' : 'border-brand-red/40 bg-brand-red/10 text-brand-red'}`}
                                    >
                                        {feedback.tone === 'success' ? <CheckCircle2 className="w-4 h-4 mr-3" /> : <XCircle className="w-4 h-4 mr-3" />}
                                        {feedback.message}
                                    </motion.div>
                                )}
                             </AnimatePresence>

                             <DynamicButton
                                onClick={() => void shareIntel('publish', 'GRID_SIGNATURE', 'SecureVision-Hub', 'Grid signature synced to Global Hub.')}
                                isProcessing={pendingAction === 'publish'}
                                icon={Share2}
                                label="Syncing Threat Data"
                                successMessage="Threat Data Synced"
                                className="shadow-2xl"
                             >
                                Sync Threat Data
                             </DynamicButton>

                             <div className="grid grid-cols-2 gap-4">
                                <DynamicButton
                                    variant="secondary"
                                    onClick={generateReport}
                                    isProcessing={pendingAction === 'report'}
                                    icon={FileText}
                                    label="Download Report"
                                    successMessage="Report Ready"
                                >
                                    Download Report
                                </DynamicButton>
                                <DynamicButton
                                    variant="ghost-accent"
                                    icon={MapIcon}
                                >
                                    View System Map
                                </DynamicButton>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TacticRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 px-1">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-black text-slate-300 font-mono italic">{value}</span>
    </div>
);

const IntelRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all rounded-xl px-2 -mx-2">
        <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4 text-brand-orange opacity-40" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xs font-black text-white font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/5">{value}</span>
    </div>
);

const Targets = ({ className }) => (
    <Activity className={className} />
);

const Radar = ({ className }) => (
    <Globe className={className} />
);
