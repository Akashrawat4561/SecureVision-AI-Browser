import { Share2, Network, ShieldCheck, Globe, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useEffect, useState } from 'react';

export default function IntelSharing() {
    const { data, alerts } = useWebSocket();
    const [syncedSignatures, setSyncedSignatures] = useState<any[]>([]);

    // Load initial sync data (Feature 10: AI Threat Intel Sync)
    useEffect(() => {
        const fetchInitialSync = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/intel/sync');
                const result = await response.json();
                if (Array.isArray(result)) {
                    setSyncedSignatures(result.map(itm => ({
                        hash: itm.hash,
                        type: itm.type,
                        source: itm.source,
                        time: itm.timestamp || 'Synced'
                    })));
                }
            } catch (err) {
                console.error("Failed to sync intel signatures:", err);
            }
        };
        fetchInitialSync();
    }, []);

    // Nodes from telemetry (Feature 5, 12: Distributed Edge Analytics)
    const connectedNodes = data?.nodes?.map(node => ({
        id: node.id,
        status: node.status || 'Active',
        latency: node.latency,
        trust: 90 + (node.id.length % 10) // Mock trust derived from semi-stable ID
    })) || [
            { id: 'Node-US-East', status: 'Active', latency: 12, trust: 99 },
            { id: 'Gov-Feed-Link', status: 'Standby', latency: 8, trust: 100 },
        ];

    // Combine synced with live WebSocket consensus alerts
    const liveSignatures = alerts
        .filter(a => a.type === 'INTEL_CONSENSUS')
        .map(a => ({
            hash: a.hash,
            type: a.intel_type || a.title || 'Threat Signature',
            source: a.source,
            time: a.time || 'JUST NOW'
        }));

    const allSignatures = [...liveSignatures, ...syncedSignatures].slice(0, 15);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase flex items-center">
                    <Share2 className="text-brand-cyan mr-3 w-8 h-8" />
                    AI Threat Intelligence Sharing
                </h1>
                <div className="flex items-center space-x-2 bg-brand-cyan/10 py-1.5 px-3 rounded-full border border-brand-cyan/30">
                    <span className="text-xs text-brand-cyan animate-pulse font-bold tracking-wider flex items-center">
                        <Globe className="w-4 h-4 mr-2" /> Global Consensus Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* P2P Network Map Visualization */}
                <div className="glass-panel p-6 h-[500px] flex flex-col relative overflow-hidden">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Peer-to-Peer AI Node Network</h2>
                    <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 relative flex items-center justify-center">
                        <Network className="absolute inset-0 w-full h-full p-20 opacity-10 text-brand-cyan stroke-[0.5]" />

                        {/* Simple visual of nodes transmitting */}
                        <div className="relative w-full h-full">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-brand-cyan/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-brand-orange/20 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                                <ShieldCheck className="w-10 h-10 text-brand-cyan drop-shadow-[0_0_10px_#00f0ff]" />
                            </div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[20%] left-[30%]">
                                <div className="w-4 h-4 rounded-full bg-brand-cyan shadow-[0_0_15px_#00f0ff] animate-pulse"></div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[70%] left-[80%]">
                                <div className="w-4 h-4 rounded-full bg-brand-orange shadow-[0_0_15px_#ff8b00] animate-pulse"></div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[80%] left-[20%]">
                                <div className="w-4 h-4 rounded-full bg-brand-cyan shadow-[0_0_15px_#00f0ff] animate-pulse"></div>
                            </motion.div>
                        </div>

                        <div className="absolute bottom-4 left-4 bg-slate-950 px-3 py-2 rounded text-xs font-mono border border-slate-800 text-slate-400 shadow-xl">
                            Distributing federated gradients...
                        </div>
                    </div>
                </div>

                {/* Sync Status & Signatures */}
                <div className="glass-panel p-6 flex flex-col space-y-6 overflow-hidden max-h-[500px]">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Connected Federated Nodes</h2>
                        <div className="space-y-3">
                            {connectedNodes.map(node => (
                                <div key={node.id} className="bg-slate-900 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-2 h-2 rounded-full ${node.status === 'Syncing' ? 'bg-brand-orange animate-ping' : 'bg-brand-cyan'}`}></span>
                                        <span className="text-sm text-slate-200 font-bold">{node.id}</span>
                                    </div>
                                    <div className="flex space-x-4 text-xs font-mono text-slate-400">
                                        <span>Tr: {node.trust}%</span>
                                        <span>{node.latency}ms</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Latest Distributed Signatures</h2>
                            <Database className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                            <AnimatePresence initial={false}>
                                {allSignatures.map((sig: any) => (
                                    <motion.div
                                        key={sig.hash + sig.time}
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg hover:border-brand-cyan/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] bg-slate-800 text-brand-cyan px-2 py-0.5 rounded font-bold uppercase tracking-widest">{sig.type}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{sig.time}</span>
                                        </div>
                                        <p className="font-mono text-[11px] text-slate-300 truncate mb-1">{sig.hash}</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Consensus Node: {sig.source}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {allSignatures.length === 0 && (
                                <div className="text-center py-10 text-slate-600 text-xs uppercase tracking-tighter">
                                    Awaiting Network Synchrony...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
