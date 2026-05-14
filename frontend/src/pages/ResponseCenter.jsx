import {
    ShieldAlert,
    AlertTriangle,
    ArrowRight,
    Share2,
    Activity,
    Zap,
    FileText,
    Ban,
    Loader2,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Globe,
    Layers,
    Target
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const env = import.meta.env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

export default function ResponseCenter() {
    const { alerts } = useWebSocket();
    const [selectedAlertId, setSelectedAlertId] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const selectedAlert = useMemo(
        () => alerts.find((alert) => alert.id === selectedAlertId) || alerts[0],
        [alerts, selectedAlertId]
    );

    const showFeedback = (tone, message) => {
        setFeedback({ tone, message });
        window.setTimeout(() => setFeedback(null), 3500);
    };

    const shareIntel = async (intelType, source) => {
        const response = await fetch(`${API_BASE}/intel/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hash: `SEC-${Math.random().toString(16).slice(2, 10)}`,
                type: intelType,
                source,
            }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || 'Request failed.');
    };

    const handleAlertAction = async (action, label) => {
        if (!selectedAlert) {
            showFeedback('error', 'Select an alert first.');
            return;
        }
        setPendingAction(action);
        try {
            await shareIntel(`RESPONSE_${action.toUpperCase()}`, `response-center:${selectedAlert.id}`);
            showFeedback('success', `${label} executed for event #${selectedAlert.id}.`);
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Action failed.');
        } finally {
            setPendingAction(null);
        }
    };

    const handleReportGenerate = async () => {
        setPendingAction('report');
        try {
            const reportLines = [
                'SECURE-VISION RESPONSE REPORT',
                `timestamp=${new Date().toISOString()}`,
                `selected_event=${selectedAlert?.id ?? 'none'}`,
                `selected_title=${selectedAlert?.title ?? 'none'}`,
                `selected_source=${selectedAlert?.source ?? 'none'}`,
                '--- recent alerts ---',
                ...alerts.slice(0, 20).map((a) => `${a.time ?? 'unknown'} | ${a.type ?? 'UNKNOWN'} | ${a.title ?? 'Untitled'} | ${a.source ?? 'Unknown'}`),
            ];
            const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `response_report_${Date.now()}.txt`;
            link.click();
            URL.revokeObjectURL(url);
            await shareIntel('RESPONSE_REPORT', 'response-center:report');
            showFeedback('success', 'Report generated and downloaded.');
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Report generation failed.');
        } finally {
            setPendingAction(null);
        }
    };

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-16">
            {/* Mission Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-brand-cyan mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono whitespace-nowrap">System Alerts Command</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Mitigation <span className="text-brand-cyan not-italic">Hub</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                        Review active security alerts and manage mitigation actions.
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        disabled={pendingAction === 'share'}
                        onClick={async () => {
                            setPendingAction('share');
                            try {
                                await shareIntel('DISTRIBUTED_VECTOR', 'response-center:manual-share');
                                showFeedback('success', 'Signatures distributed.');
                            } catch (error) {
                                showFeedback('error', error instanceof Error ? error.message : 'Share failed.');
                            } finally {
                                setPendingAction(null);
                            }
                        }}
                        className="bg-slate-950 text-slate-500 border border-white/5 hover:border-brand-cyan/20 hover:text-white px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md group disabled:opacity-40"
                    >
                        {pendingAction === 'share' ? (
                            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                        ) : (
                            <Share2 className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                        )}
                        Distribute Signatures
                    </button>
                    <button
                        disabled={pendingAction === 'report'}
                        onClick={handleReportGenerate}
                        className="bg-brand-cyan text-slate-950 px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,240,255,0.2)] disabled:opacity-40 flex items-center"
                    >
                        {pendingAction === 'report' ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <FileText className="w-4 h-4 mr-3" />}
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Timeline */}
                <div className="lg:col-span-2 glass-panel p-10 h-[800px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/20 to-brand-cyan/0" />
                    
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                                <Activity className="w-5.5 h-5.5 text-brand-cyan" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Alert Chronology</h2>
                        </div>
                        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-950/80 border border-white/5 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_#00f0ff]" />
                            <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 relative z-10 pb-10">
                        <div className="absolute left-7.5 top-0 bottom-0 w-px bg-white/5" />

                        <AnimatePresence mode="popLayout">
                            {alerts.length === 0 && (
                                <div className="text-center py-20">
                                    <ShieldCheck className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No Active Alerts</p>
                                </div>
                            )}

                            {alerts.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={item.id} 
                                    onClick={() => setSelectedAlertId(item.id || null)} 
                                    className="relative flex items-start group cursor-pointer"
                                >
                                    {/* Timeline Marker */}
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-[18px] border bg-slate-950 shrink-0 z-10 transition-all duration-500
                                      ${item.id === selectedAlert?.id ? 'border-brand-cyan bg-brand-cyan/10 scale-110 shadow-[0_0_25px_rgba(0,240,250,0.3)]' :
                                            item.severity === 'high' ? 'text-brand-red border-brand-red/20' :
                                                item.severity === 'medium' ? 'text-brand-orange border-brand-orange/20' : 'text-brand-cyan border-brand-cyan/20'}`}>
                                        {item.severity === 'high' ? <ShieldAlert className="w-5 h-5" /> : item.severity === 'medium' ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                    </div>

                                    {/* Alert Card */}
                                    <div className={`ml-8 flex-1 glass-panel p-8 border-white/5 transition-all duration-500 group-hover:bg-slate-900/60
                                      ${item.id === selectedAlert?.id ? 'border-brand-cyan shadow-2xl bg-slate-900/80' : 'hover:border-white/10'}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-1">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border ${item.severity === 'high' ? 'bg-brand-red/10 text-brand-red border-brand-red/20' :
                                                    item.severity === 'medium' ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' :
                                                        'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                                                }`}>{item.type}</span>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading mt-2">{item.title}</h3>
                                            </div>
                                            <time className="text-[10px] font-black font-mono text-slate-600 uppercase tracking-widest">{item.time}</time>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-6">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center">
                                                <Globe className="w-3 h-3 mr-2 opacity-40" />
                                                Source: <span className="text-slate-300 ml-2">{item.source}</span>
                                            </p>
                                            
                                            <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[9px] font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center hover:text-white transition-colors">
                                                    Analyze <ArrowRight className="w-3 h-3 ml-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mitigation Protocol Panel */}
                <div className="glass-panel p-10 flex flex-col h-[800px] sticky top-10 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="mb-10 flex items-center relative z-10">
                        <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20 mr-4">
                            <Target className="w-5.5 h-5.5 text-brand-orange" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Decision Logic</h2>
                    </div>

                    {selectedAlert ? (
                        <div className="flex flex-col flex-1 relative z-10">
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-6 rounded-2xl border p-4 text-[10px] font-black uppercase tracking-widest flex items-center shadow-xl backdrop-blur-xl ${feedback.tone === 'success' ? 'border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan' : 'border-brand-red/20 bg-brand-red/10 text-brand-red'}`}>
                                        {feedback.tone === 'success' ? <CheckCircle2 className="w-4 h-4 mr-3" /> : <XCircle className="w-4 h-4 mr-3" />}
                                        {feedback.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={`p-8 rounded-[40px] border mb-10 transition-all duration-500 relative shadow-2xl overflow-hidden
                                ${selectedAlert.severity === 'high' ? 'bg-brand-red/5 border-brand-red/20' :
                                  selectedAlert.severity === 'medium' ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-brand-cyan/5 border-brand-cyan/20'
                            }`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <ShieldAlert className="w-16 h-16" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] block mb-4 italic ${selectedAlert.severity === 'high' ? 'text-brand-red' : 'text-slate-500'}`}>
                                    SIG_ID_{selectedAlert.id?.toString().padStart(4, '0') || '0000'}
                                </span>
                                <h3 className="text-3xl font-black text-white mb-4 uppercase italic leading-none tracking-tighter font-heading">{selectedAlert.title}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Select a mitigation action below to respond.</p>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Severity</span>
                                        <span className={`text-xs font-black uppercase italic ${selectedAlert.severity === 'high' ? 'text-brand-red font-mono' : 'text-brand-orange font-mono'}`}>{selectedAlert.severity?.toUpperCase()}</span>
                                    </div>
                                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Impact</span>
                                        <span className="text-xs font-black uppercase italic text-brand-cyan font-mono">Unresolved_</span>
                                    </div>
                                </div>
                            </div>

                            {/* Playbooks */}
                            <div className="space-y-4 mb-auto">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1 mb-4 italic">Defensive Playbooks</h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'quarantine', label: 'Quarantine Node', desc: 'Isolate source VLAN segment', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
                                        { id: 'rotate', label: 'Rotate Gateway', desc: 'Invalidate session tokens', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
                                        { id: 'blacklist', label: 'Global Blacklist', desc: 'Sync firewall signatures', color: 'text-brand-red', bg: 'bg-brand-red/10' }
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            disabled={!!pendingAction}
                                            onClick={() => void handleAlertAction(action.id, action.label)}
                                            className="w-full p-5 bg-slate-950/40 border border-white/5 rounded-[28px] flex items-center group/btn hover:bg-slate-950/60 hover:border-white/10 transition-all shadow-inner disabled:opacity-40"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mr-5 transition-transform group-hover/btn:scale-110`}>
                                                {pendingAction === action.id ? <Loader2 className={`w-5 h-5 ${action.color} animate-spin`} /> : <Zap className={`w-5 h-5 ${action.color}`} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-black text-white uppercase tracking-widest">{action.label}</div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{action.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Primary Commit */}
                            <div className="pt-8 space-y-4 border-t border-white/5">
                                <button
                                    disabled={!selectedAlert || !!pendingAction}
                                    onClick={() => void handleAlertAction('resolve', 'Commit')}
                                    className="w-full bg-white text-slate-950 hover:bg-brand-cyan transition-all font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-[24px] shadow-2xl disabled:opacity-20 active:scale-[0.98]"
                                >
                                    Commit Global Resolution
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        disabled={!selectedAlert || !!pendingAction}
                                        onClick={() => void handleAlertAction('benign', 'Benign')}
                                        className="py-4 bg-slate-900 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest text-[9px] font-black rounded-2xl flex justify-center items-center disabled:opacity-20"
                                    >
                                        <Ban className="w-3.5 h-3.5 mr-2" />
                                        Silent Drop
                                    </button>
                                    <button
                                        disabled={!selectedAlert || !!pendingAction}
                                        onClick={() => void handleAlertAction('escalate', 'Escalate')}
                                        className="py-4 bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-all uppercase tracking-widest text-[9px] font-black rounded-2xl flex justify-center items-center disabled:opacity-20"
                                    >
                                        <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                        Escalate SIEM
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                            <Layers className="w-24 h-24 text-slate-700 mb-8 animate-pulse" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed italic">Select an alert to view details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
