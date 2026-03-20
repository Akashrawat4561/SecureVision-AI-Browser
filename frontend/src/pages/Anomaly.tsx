import { useState, useMemo, useRef } from 'react';
import { Activity, Upload, CheckCircle2, ShieldAlert, Database, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '../context/WebSocketContext';
import { motion } from 'framer-motion';

export default function Anomaly() {
    const { history, connected } = useWebSocket();
    const [viewMode, setViewMode] = useState<'live' | 'batch'>('live');
    const [uploading, setUploading] = useState(false);
    const [batchResults, setBatchResults] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Live status based on WebSocket feed
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Network Anomaly Inspection</h1>
                    <p className="text-slate-400 text-sm">Powered by IsolationForest on Real-world Traffic Distributions</p>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('live')}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'live' ? 'bg-brand-cyan text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4 mr-2" /> Live Stream
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'batch' ? 'bg-brand-orange text-slate-950 shadow-[0_0_15px_rgba(255,139,0,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Batch Dataset
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".csv"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {viewMode === 'live' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 h-[500px] flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center tracking-wider">
                                <span className="w-1.5 h-6 bg-brand-cyan rounded-full mr-3"></span>
                                LIVE INGESTION TELEMETRY
                            </h2>
                            <div className="flex items-center space-x-4">
                                <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded flex items-center shadow-inner">
                                    <span className="text-xs font-mono text-slate-400 mr-2">NODES:</span>
                                    <span className="text-xs font-bold text-brand-cyan">3</span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${connected ? 'border-green-500/50 text-green-500 bg-green-500/10' : 'border-red-500/50 text-red-500 bg-red-500/10'}`}>
                                    {connected ? 'REAL-TIME' : 'OFFLINE'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative">
                            {liveStatus.isAnomaly && (
                                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 bg-brand-red rounded-full px-4 py-1.5 text-xs font-bold font-mono shadow-[0_0_20px_#ff2a2a] text-white animate-pulse flex items-center space-x-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>ACTIVE ANOMALY DETECTED</span>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="timestamp" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} yAxisId="left" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                                        itemStyle={{ fontSize: '12px' }}
                                        isAnimationActive={false}
                                    />
                                    <Line yAxisId="left" type="monotone" dataKey="traffic" name="Traffic" stroke="#00f0ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line yAxisId="left" type="monotone" dataKey="logins" name="Logins" stroke="#ff8b00" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center tracking-wider">
                                <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
                                BATCH DATASET ANALYSIS
                            </h2>
                            {batchResults && (
                                <span className="text-xs font-mono text-slate-400">
                                    Scanned: <span className="text-white font-bold">{batchResults.total}</span> |
                                    Anomalies: <span className="text-brand-red font-bold">{batchResults.anomalies.length}</span>
                                </span>
                            )}
                        </div>

                        {!batchResults && !uploading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                <Database className="w-16 h-16 mb-4 opacity-20" />
                                <p>Upload a network log CSV to perform batch IsolationForest inspection</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                                >
                                    Browse Files
                                </button>
                            </div>
                        )}

                        {uploading && (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
                                <p className="text-slate-400 animate-pulse">Running IsolationForest multi-feature analysis...</p>
                            </div>
                        )}

                        {batchResults && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
                                            <th className="py-3 px-4">Row</th>
                                            <th className="py-3 px-4">Src Bytes</th>
                                            <th className="py-3 px-4">Dst Bytes</th>
                                            <th className="py-3 px-4">Count</th>
                                            <th className="py-3 px-4">Score</th>
                                            <th className="py-3 px-4 text-right">Diagnosis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {batchResults.results.slice(0, 15).map((row: any, i: number) => (
                                            <tr key={i} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${row.is_anomaly ? 'bg-brand-red/5' : ''}`}>
                                                <td className="py-3 px-4 font-mono text-slate-500">#{row.index}</td>
                                                <td className="py-3 px-4 text-slate-300">{row.src_bytes.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-slate-300">{row.dst_bytes.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-slate-300">{row.count}</td>
                                                <td className="py-3 px-4">
                                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden w-24">
                                                        <div className={`h-full ${row.is_anomaly ? 'bg-brand-red' : 'bg-brand-cyan'}`} style={{ width: `${row.anomaly_score * 100}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.is_anomaly ? 'text-brand-red bg-brand-red/10 border border-brand-red/20' : 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20'}`}>
                                                        {row.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {batchResults.results.length > 15 && (
                                    <p className="text-center text-xs text-slate-500 mt-4 italic">Showing first 15 of {batchResults.total} results...</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Live Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`glass-panel p-6 border-l-4 ${liveStatus.isAnomaly ? 'border-l-brand-red' : 'border-l-brand-cyan'} bg-slate-900`}>
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Status</h3>
                        <div className="text-xl font-bold flex items-center">
                            {liveStatus.isAnomaly ? <ShieldAlert className="w-5 h-5 mr-2 text-brand-red" /> : <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />}
                            {liveStatus.isAnomaly ? 'MALICIOUS' : 'OPTIMAL'}
                        </div>
                    </div>
                    <div className="glass-panel p-6 border-l-4 border-l-slate-700 bg-slate-900">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Inference Scale</h3>
                        <div className="text-xl font-bold text-brand-cyan font-mono">{liveStatus.score.toFixed(3)}</div>
                    </div>
                    <div className="glass-panel p-6 border-l-4 border-l-slate-700 bg-slate-900">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Ingestion Flow</h3>
                        <div className="text-xl font-bold text-slate-200">
                            {history[history.length - 1]?.traffic?.toLocaleString() || 0} <span className="text-xs text-slate-500">B/s</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 border-l-4 border-l-slate-700 bg-slate-900">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Model Precision</h3>
                        <div className="text-xl font-bold text-slate-200">94.2%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
