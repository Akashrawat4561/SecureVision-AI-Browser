import {
    Bug, Target, Activity, CodeSquare, Hexagon, Share2,
    ShieldAlert, Loader2, CheckCircle2, XCircle, FileText,
    Globe, Wifi, Server, Zap, Shield, Terminal, AlertTriangle,
    Lock, Radio, Database, Map as MapIcon, MousePointer2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useState, useEffect, useRef } from 'react';

type ActionFeedback = { tone: 'success' | 'error'; message: string };
type Protocol       = 'SSH' | 'HTTP' | 'SMTP' | 'FTP' | 'ALL';
type Severity       = 'critical' | 'high' | 'medium' | 'low';

const PROTOCOL_DECOYS = [
    { proto: 'SSH',  port: 2222, icon: Terminal, color: 'cyan'   },
    { proto: 'HTTP', port: 8081, icon: Globe,    color: 'orange' },
    { proto: 'SMTP', port: 2525, icon: Radio,    color: 'purple' },
    { proto: 'FTP',  port: 2121, icon: Database, color: 'green'  },
];

const SEV_CONFIG: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
    critical: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-500'   },
    high:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400'},
    medium:   { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400'},
    low:      { bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-500/30',  dot: 'bg-slate-400' },
};

const PROTO_COLORS: Record<string, string> = {
    SSH:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    HTTP: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    SMTP: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    FTP:  'text-green-400 bg-green-500/10 border-green-500/20',
};

const env     = (import.meta as any).env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

// ─── Attack type → icon mapping ──────────────────────────────────────────────
function attackIcon(type: string) {
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
    const [encounters, setEncounters]   = useState<any[]>([]);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [feedback, setFeedback]       = useState<ActionFeedback | null>(null);
    const [protoFilter, setProtoFilter] = useState<Protocol>('ALL');
    const [terminalLog, setTerminalLog] = useState<string[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // ── Ingest encounters from WebSocket ─────────────────────────────────────
    useEffect(() => {
        if (!connected || !data?.honeypot_events) return;
        if (data.honeypot_events.length > 0) {
            setEncounters(prev => {
                const newIds = new Set(data.honeypot_events!.map((e: any) => e.id));
                const filtered = prev.filter(e => !newIds.has(e.id));
                return [...data.honeypot_events!, ...filtered].slice(0, 100);
            });
            // Append terminal-style lines
            data.honeypot_events.forEach((e: any) => {
                const ts   = new Date().toISOString().split('T')[1].split('.')[0];
                const line = `[${ts}] ${e.ip ?? '?.?.?.?'} → ${e.attack?.type ?? 'probe'} | ${(e.attack?.severity ?? 'low').toUpperCase()} | ${e.geo?.country ?? '?'}`;
                setTerminalLog(p => [line, ...p].slice(0, 100));
            });
        }
    }, [data?.honeypot_events, connected]);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = 0;
    }, [terminalLog]);

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
    const sevCounts = (['critical', 'high', 'medium', 'low'] as Severity[]).reduce(
        (acc, s) => ({ ...acc, [s]: encounters.filter(e => (e.attack?.severity ?? e.severity ?? 'low') === s).length }),
        {} as Record<Severity, number>
    );

    // ── Attack type top-5 ─────────────────────────────────────────────────────
    const attackBreakdown = Object.entries(
        encounters.reduce((acc, e) => {
            const t = e.attack?.type ?? e.attack_type ?? 'Unknown';
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const showFeedback = (tone: ActionFeedback['tone'], message: string) => {
        setFeedback({ tone, message });
        window.setTimeout(() => setFeedback(null), 3500);
    };

    const shareIntel = async (mode: string, intelType: string, source: string, successMessage: string) => {
        setPendingAction(mode);
        try {
            const res = await fetch(`${API_BASE}/intel/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: `HP-${Math.random().toString(16).slice(2, 10)}`, type: intelType, source }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error((json as { detail?: string }).detail || 'Failed');
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

            {/* Tactical Grid v2.0 Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-brand-orange">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_#ff8b00] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">
                            Multi-Protocol Deception v2.0 // Active
                        </span>
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Honeypot <span className="text-brand-orange not-italic">Grid</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xl">
                        Elite capture grid: SSH decoy [2222], HTTP web-trap [8081], SMTP ghost [2525], FTP sink [2121].
                    </p>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Perimeter</span>
                         <span className="text-xs font-mono font-black text-green-400">ENCRYPTED // SECURE</span>
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
                            onClick={() => setProtoFilter(p => p === proto ? 'ALL' : proto as Protocol)}
                        >
                            <div className={`p-4 rounded-2xl border transition-all duration-300
                                ${protoFilter === proto ? `bg-${color}-500/20 border-${color}-500/40 shadow-[0_0_15px_rgba(255,160,0,0.2)]` : `bg-${color}-500/10 border-${color}-500/20`}`}>
                                <Icon className={`w-6 h-6 text-${color}-400 group-hover:rotate-12 transition-transform`} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className="text-sm font-black text-white uppercase tracking-tighter italic font-heading">{proto} Artifact</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase border font-mono ${PROTO_COLORS[proto]}`}>:{port}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{count} Hits Captured</span>
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
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Captured Interactions</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Real-time adversary footprint stream</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                                {['ALL', 'SSH', 'HTTP', 'SMTP', 'FTP'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setProtoFilter(p as Protocol)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                            ${protoFilter === p
                                                ? 'bg-brand-orange text-slate-950 border-brand-orange shadow-[0_0_15px_rgba(255,139,0,0.3)]'
                                                : 'bg-transparent text-slate-500 border-white/0 hover:bg-white/5 hover:text-slate-300'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-brand-orange blur-[60px] opacity-10" />
                                            <Hexagon className="w-20 h-20 opacity-20 animate-[spin_20s_linear_infinite]" />
                                            <Radar className="w-10 h-10 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-40" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-black uppercase tracking-[0.4em] block mb-2">Grid Perimeter: Silent</span>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">No active intrusion attempts detected</span>
                                        </div>
                                    </div>
                                ) : filtered.map(e => {
                                    const sev  = (e.attack?.severity ?? e.severity ?? 'low') as Severity;
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
                                                    <span className="text-[9px] text-slate-600 font-mono italic">{e.timestamp?.split(' ')[1] || '00:00:00'}</span>
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
                                                        <span className="text-[9px] text-slate-400 font-black font-mono leading-none tracking-tighter">{e.dwell_time}s dwell</span>
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
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono italic">Grid // Intrusion.raw</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v2.0 STABLE</span>
                                {connected
                                    ? <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" /><span className="text-[10px] font-black tracking-widest">LIVE FLOW</span></div>
                                    : <div className="flex items-center space-x-2 text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /><span className="text-[10px] font-black tracking-widest">OFFLINE</span></div>
                                }
                            </div>
                        </div>
                        <div
                            ref={terminalRef}
                            className="h-32 overflow-y-auto font-mono text-[10px] bg-slate-950/90 rounded-[20px] p-5 border border-white/5 space-y-1 custom-scrollbar shadow-inner"
                        >
                            {terminalLog.length === 0
                                ? <span className="text-slate-800 animate-pulse font-bold">{'>'} [PERIMETER_SECURE] Awaiting incoming signal ingestion…</span>
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
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading">Forensic Detail</h3>
                                    <button onClick={() => setSelectedIncident(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                        <XCircle className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-slate-950/80 rounded-[32px] border border-white/10 shadow-inner">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Target Payload Signature</p>
                                        <div className="bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-slate-300 break-all leading-relaxed h-28 overflow-y-auto custom-scrollbar border border-white/5">
                                            {selectedIncident.attack?.payload || selectedIncident.payload || 'No payload sequence captured from this probe.'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Factor</p>
                                            <p className={`text-xl font-black italic font-heading ${SEV_CONFIG[selectedIncident.attack?.severity as Severity || 'low'].text}`}>
                                                {(selectedIncident.attack?.severity || 'LOW').toUpperCase()}
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
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Tactical Analysis</p>
                                        <TacticRow label="Auth Method" value={selectedIncident.protocol === 'SSH' ? 'Password Brute' : 'Method Probing'} />
                                        <TacticRow label="OS Fingerprint" value={selectedIncident.os || 'Linux Kernel 5.x'} />
                                        <TacticRow label="Agent Header" value={selectedIncident.user_agent ? (selectedIncident.user_agent.slice(0, 20) + '...') : 'Go-http-client/v1'} />
                                        <TacticRow label="Geo Confidence" value="High (v4-Tier)" />
                                    </div>

                                    <button
                                        onClick={() => void shareIntel('block', 'IP_BLOCK', selectedIncident.ip, 'Global block propagated.')}
                                        className="w-full py-5 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl border border-brand-red/40 hover:bg-brand-red/10 transition-all flex items-center justify-center group"
                                    >
                                        <ShieldAlert className="w-4 h-4 mr-3 text-brand-red group-hover:animate-pulse" />
                                        Propagate Perimeter Block
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-panel p-8 rounded-[40px] flex flex-col items-center justify-center h-[400px] border-dashed border-white/10 opacity-30 group-hover:opacity-40 transition-opacity">
                                <Target className="w-16 h-16 text-slate-500 mb-6 animate-[spin_8s_linear_infinite]" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-6 leading-relaxed">
                                    Select an engagement from the stream to initialize forensic inspection pulse.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Threat Intelligence / Metrics Panel */}
                    <div className="glass-panel p-8 space-y-8 rounded-[40px]">
                        <div className="flex items-center space-x-3 mb-2">
                             <Shield className="w-5 h-5 text-brand-orange" />
                             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading">Grid Intel</h3>
                        </div>

                        {/* Top Vectors List */}
                        <div className="space-y-4">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Adversary TTPs</p>
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
                             <IntelRow label="Master Vector"   value={metrics.top_exploit}     icon={Zap}    />
                             <IntelRow label="Payload Cache"   value={`${metrics.payload_count}`} icon={CodeSquare} />
                             <IntelRow label="Avg Dwell Time"  value={metrics.avg_dwell_time}  icon={Activity}       />
                             <IntelRow label="Total Ingress"   value={`${encounters.length}`}  icon={Targets}    />
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

                             <button
                                onClick={() => void shareIntel('publish', 'GRID_SIGNATURE', 'Sentinel-Hub', 'Grid signature synced to Global Hub.')}
                                disabled={!!pendingAction}
                                className="w-full py-5 bg-white text-slate-950 hover:bg-brand-orange font-black uppercase tracking-[0.2em] text-[10px] rounded-[24px] shadow-2xl transition-all flex items-center justify-center group"
                             >
                                <Share2 className="w-4 h-4 mr-3 group-hover:scale-125 transition-transform" />
                                Sync Grid Intelligence
                             </button>

                             <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={generateReport}
                                    disabled={!!pendingAction}
                                    className="py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center"
                                >
                                    <FileText className="w-3.5 h-3.5 mr-2" />
                                    Forensic PDF
                                </button>
                                <button
                                    className="py-4 bg-brand-orange/5 border border-brand-orange/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-orange hover:bg-brand-orange/20 transition-all flex items-center justify-center"
                                >
                                    <MapIcon className="w-3.5 h-3.5 mr-2" />
                                    View Node Map
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TacticRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-1.5 px-1">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-black text-slate-300 font-mono italic">{value}</span>
    </div>
);

const IntelRow = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all rounded-xl px-2 -mx-2">
        <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4 text-brand-orange opacity-40" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xs font-black text-white font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/5">{value}</span>
    </div>
);

const Targets = ({ className }: { className?: string }) => (
    <Activity className={className} />
);

const Radar = ({ className }: { className?: string }) => (
    <Globe className={className} />
);
