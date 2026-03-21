import { useState, useMemo, useRef } from 'react';
import { Activity, Upload, CheckCircle2, ShieldAlert, Database, Loader2, Zap, Target, BarChart3, Globe } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWebSocket } from '../context/WebSocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Anomaly() {
    const { history, connected } = useWebSocket();
    const [viewMode, setViewMode] = useState<'live' | 'batch'>('live');
    const [uploading, setUploading] = useState(false);
    const [batchResults, setBatchResults] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const liveStatus = useMemo(() => {
        if (!history || history.length === 0) return { isAnomaly: false, score: 0, severity: 'WAITING' };
        const latest = history[history.length - 1];
        return {
            isAnomaly: latest.is_anomaly || false,
            score: latest.anomaly_score || 0,
            severity: latest.is_anomaly ? 'HIGH' : 'LOW'
        };
    }, [history]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setViewMode('batch');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/anomaly/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setBatchResults(data);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto pb-16 relative">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Mission Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-brand-cyan mb-2">
                        <div className="flex space-x-1">
                            <div className="w-1 h-3 bg-brand-cyan/40 rounded-full" />
                            <div className="w-1 h-4 bg-brand-cyan rounded-full animate-pulse" />
                            <div className="w-1 h-3 bg-brand-cyan/40 rounded-full" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono whitespace-nowrap">Neural_Sentinel // Behavioral Decomposition</span>
                        <div className="h-[1px] w-24 bg-gradient-to-r from-brand-cyan/40 to-transparent" />
                    </div>
                    <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter font-heading leading-tight">
                        Spectral <span className="text-brand-cyan not-italic drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">Traffic</span>
                    </h1>
                    <div className="flex items-center space-x-4">
                        <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed border-l-2 border-brand-cyan/20 pl-6 py-1">
                            Unsupervised <span className="text-white font-bold">IsolationForest</span> decomposition of non-linear network behavioral distributions.
                        </p>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setViewMode('live')}
                        className={`flex items-center px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-white text-slate-950 shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-slate-950 text-slate-500 border border-white/5 hover:border-white/10 hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4 mr-3" /> Live Signal
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'batch' ? 'bg-brand-orange text-slate-950 shadow-[0_20px_40px_rgba(255,139,0,0.2)]' : 'bg-slate-950 text-slate-500 border border-white/5 hover:border-white/10 hover:text-white'}`}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Upload className="w-4 h-4 mr-3" />}
                        Batch Dataset
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {/* Main Visualization Module */}
                <motion.div layout className="glass-panel p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
                    
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                                <BarChart3 className="w-5.5 h-5.5 text-brand-cyan" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Behavioral Distribution</h2>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Nodes</span>
                                <span className="text-sm font-mono text-white font-bold uppercase">Consensus [03]</span>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center space-x-2 ${connected ? 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-brand-red/30 text-brand-red bg-brand-red/5'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-brand-cyan animate-pulse' : 'bg-brand-red'}`} />
                                <span>{connected ? 'Sync: Real-Time' : 'Sync: Terminated'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[500px] w-full relative z-10">
                        <AnimatePresence>
                            {liveStatus.isAnomaly && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-brand-red/90 backdrop-blur-xl border border-brand-red/40 rounded-[28px] px-8 py-4 shadow-[0_20px_60px_rgba(255,42,42,0.4)] flex items-center space-x-4"
                                >
                                    <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase italic tracking-tighter font-heading">Tactical Breach Warning</span>
                                        <span className="text-[10px] text-white/70 font-black uppercase tracking-widest leading-none">High-Frequency Anomaly Detected</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {viewMode === 'live' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff8b00" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#ff8b00" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="timestamp" stroke="#ffffff10" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                                    <YAxis stroke="#ffffff10" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#ffffff10', borderRadius: '24px', padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                    <Area type="monotone" dataKey="traffic" name="Signal Stream" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" isAnimationActive={false} />
                                    <Area type="monotone" dataKey="logins" name="Auth Events" stroke="#ff8b00" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                {!batchResults && !uploading && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[40px] bg-slate-950 shadow-inner group-hover:border-brand-orange/30 transition-all">
                                        <div className="p-6 bg-brand-orange/10 rounded-3xl border border-brand-orange/20 mb-8 group-hover:scale-110 transition-transform">
                                            <Database className="w-12 h-12 text-brand-orange opacity-60" />
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading mb-3">Await Dataset Ingress</h4>
                                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] text-center max-w-xs leading-relaxed">Submit CSV network telemetry logs for high-fidelity IsolationForest decomposition.</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="mt-10 px-10 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-all active:scale-[0.98]">Select Payload</button>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="relative mb-10">
                                            <div className="absolute inset-0 bg-brand-orange blur-[60px] opacity-20" />
                                            <Loader2 className="w-20 h-20 text-brand-orange animate-spin" />
                                        </div>
                                        <p className="text-xl font-black text-white uppercase italic tracking-tighter font-heading animate-pulse">Running Multi-Vector Forest Inference...</p>
                                    </div>
                                )}

                                {batchResults && (
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                                    <th className="py-6 px-6">Sequence</th>
                                                    <th className="py-6 px-6">Signal Profile</th>
                                                    <th className="py-6 px-6">Temporal Density</th>
                                                    <th className="py-6 px-6">Anomaly Vector</th>
                                                    <th className="py-6 px-6 text-right">Diagnosis</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {batchResults.results.slice(0, 15).map((row: any, i: number) => (
                                                    <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${row.is_anomaly ? 'bg-brand-red/5' : ''}`}>
                                                        <td className="py-5 px-6 font-mono text-[10px] font-black text-slate-500">TAG_{row.index.toString().padStart(4, '0')}</td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-white uppercase tracking-tight font-heading">{row.src_bytes.toLocaleString()} / {row.dst_bytes.toLocaleString()}</span>
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">In/Out Bytes</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xs font-black text-slate-300 font-mono">{row.count}</span>
                                                                <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-slate-700" style={{ width: `${Math.min(row.count / 10, 100)}%` }} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-1 max-w-[120px] bg-slate-950 border border-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${row.anomaly_score * 100}%` }} className={`h-full ${row.is_anomaly ? 'bg-brand-red shadow-[0_0_8px_#ff2a2a]' : 'bg-brand-cyan shadow-[0_0_8px_#00f0ff]'}`} />
                                                                </div>
                                                                <span className="text-[10px] font-mono font-black text-slate-500">{row.anomaly_score.toFixed(3)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 text-right">
                                                            <div className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${row.is_anomaly ? 'text-brand-red bg-brand-red/10 border-brand-red/20' : 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'}`}>
                                                                {row.is_anomaly ? 'Anomaly' : 'Operational'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {batchResults.results.length > 15 && (
                                            <div className="p-8 text-center border-t border-white/5">
                                                <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Load Extended Telemetry (+{batchResults.total - 15} vectors)</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Technical Meta Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <MetricCard 
                        label="Operational Status" 
                        value={liveStatus.isAnomaly ? 'Malicious' : 'Optimal'} 
                        icon={liveStatus.isAnomaly ? ShieldAlert : CheckCircle2}
                        color={liveStatus.isAnomaly ? 'brand-red' : 'brand-cyan'}
                    />
                    <MetricCard 
                        label="Entropy Index" 
                        value={liveStatus.score.toFixed(4)} 
                        icon={Target}
                        color="slate-400"
                        isMono
                    />
                    <MetricCard 
                        label="Throughput Velocity" 
                        value={`${(history[history.length - 1]?.traffic || 0).toLocaleString()} B/s`} 
                        icon={Zap}
                        color="brand-orange"
                    />
                    <MetricCard 
                        label="Sentinel Precision" 
                        value="99.8%" 
                        icon={Globe}
                        color="brand-cyan"
                    />
                </div>
            </div>
        </div>
    );
}

const MetricCard = ({ label, value, icon: Icon, color, isMono }: { label: string, value: string, icon: any, color: string, isMono?: boolean }) => (
    <div className={`glass-panel p-8 relative overflow-hidden group shadow-lg border-l-4 ${color === 'brand-red' ? 'border-l-brand-red' : color === 'brand-cyan' ? 'border-l-brand-cyan' : color === 'brand-orange' ? 'border-l-brand-orange' : 'border-l-slate-700'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-12 h-12 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
            <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{label}</h3>
            <div className={`text-2xl font-black uppercase italic tracking-tighter font-heading ${isMono ? 'font-mono not-italic' : ''} ${color === 'brand-red' ? 'text-brand-red' : color === 'brand-cyan' ? 'text-brand-cyan' : color === 'brand-orange' ? 'text-brand-orange' : 'text-white'}`}>
                {value}
            </div>
        </div>
    </div>
);
