import { Cpu, Server, Activity, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';

export default function EdgeStatus() {
    const { data, connected } = useWebSocket();
    const nodes = data?.nodes || [];

    const getStatus = (node) => {
        if (node.status === 'offline') return 'OFFLINE';
        if (node.cpu > 85) return 'HIGH LOAD';
        if (node.cpu > 70) return 'WARNING';
        return 'ACTIVE';
    };

    const getStatusColor = (node) => {
        if (node.status === 'offline') return 'text-slate-500 border-slate-700 bg-slate-800/50';
        if (node.cpu > 85) return 'text-brand-red border-brand-red/30 bg-brand-red/10';
        if (node.cpu > 70) return 'text-brand-orange border-brand-orange/30 bg-brand-orange/10';
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    };

    const staticNodeInfo = [
        { id: 'n1', name: 'Node 1: Raspberry Pi 4', icon: Cpu, models: ['DistilBERT (Optimized)', 'IsolationForest'] },
        { id: 'n2', name: 'Node 2: NVIDIA Jetson Nano', icon: Server, models: ['Xception ONNX', 'MesoNet CNN'] },
        { id: 'n3', name: 'Node 3: Edge Server Central', icon: Activity, models: ['Global Aggregator'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase flex items-center">
                    Edge Deployment Status & Optimization
                </h1>
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 bg-slate-800/50 py-1 px-3 rounded-full border ${connected ? 'border-green-500/50' : 'border-red-500/50'}`}>
                        <span className={`text-xs font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
                            {connected ? 'Telemetry Active' : 'Offline'}
                        </span>
                    </div>
                    <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 transition-colors py-1.5 px-4 rounded-full border border-slate-700 text-sm font-medium text-slate-300">
                        <Settings2 className="w-4 h-4 mr-1" />
                        Advanced
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Topology Map */}
                <div className="lg:col-span-2 glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center tracking-wider">
                        <span className="w-1.5 h-6 bg-brand-cyan rounded-full mr-3"></span>
                        EDGE NODE TOPOLOGY
                    </h2>

                    <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

                        <svg className="absolute inset-0 w-full h-full z-0 opacity-60">
                            <path d="M 25% 40% Q 40% 30% 60% 50%" stroke="#00f0ff" strokeWidth="2" strokeDasharray="5,5" fill="transparent" className={connected ? "animate-[dash_20s_linear_infinite]" : ""} />
                            <path d="M 75% 60% Q 65% 55% 60% 50%" stroke="#00f0ff" strokeWidth="2" strokeDasharray="5,5" fill="transparent" className={connected ? "animate-[dash_15s_linear_infinite]" : ""} />
                        </svg>

                        {nodes.map((n, i) => {
                            const pos = [
                                { top: '40%', left: '25%' },
                                { top: '60%', left: '75%' },
                                { top: '50%', left: '60%' }
                            ][i % 3];
                            const Icon = staticNodeInfo[i % 3]?.icon || Activity;
                            const status = getStatus(n);
                            const isHigh = status === 'HIGH LOAD';
                            const isOffline = status === 'OFFLINE';

                            return (
                                <div key={n.id} className="absolute z-10 flex flex-col items-center group" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                                    <div className={`w-12 h-12 rounded-full bg-slate-800 border-2 flex items-center justify-center relative ${isOffline ? 'border-slate-700 grayscale' : isHigh ? 'border-brand-red shadow-[0_0_15px_#ff2a2a]' : 'border-green-500 shadow-[0_0_15px_#22c55e]'}`}>
                                        {connected && !isOffline && <div className={`absolute inset-0 rounded-full border ${isHigh ? 'border-brand-red' : 'border-green-500'} animate-ping opacity-30`}></div>}
                                        <Icon className={`w-6 h-6 ${isOffline ? 'text-slate-600' : isHigh ? 'text-brand-red' : 'text-green-500'}`} />
                                    </div>
                                    <span className="mt-2 text-xs font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-700">{staticNodeInfo[i % 3]?.name.split(' ')[2] || n.id}</span>
                                </div>
                            );
                        })}

                        {nodes.length === 0 && <span className="text-slate-500 z-10 text-sm">Awaiting Node Telemetry...</span>}
                    </div>
                </div>

                {/* Node Details List */}
                <div className="lg:col-span-1 glass-panel h-[400px] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">ACTIVE ENDPOINTS</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {nodes.map((node, i) => (
                            <div key={node.id} className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <Cpu className="w-5 h-5 mr-3 text-brand-cyan" />
                                        <span className="text-sm font-bold text-white">{staticNodeInfo[i % 3]?.name || node.id}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs mb-3">
                                    <span className={`font-mono font-bold px-2 py-0.5 rounded border ${getStatusColor(node)}`}>
                                        {getStatus(node)}
                                    </span>
                                    <span className="text-slate-400">Lat: {node.latency}ms</span>
                                </div>

                                {node.temperature !== undefined && (
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                                        <span>TEMP: <span className="text-brand-orange">{node.temperature}°C</span></span>
                                        <span>RAM: <span className="text-brand-cyan">{node.ram}%</span></span>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Active Models</span>
                                    {(staticNodeInfo[i % 3]?.models || ['Edge Optimizer']).map(m => (
                                        <div key={m} className="text-xs text-slate-300 flex items-center bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2"></span>
                                            {m}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Telemetry */}
                <div className="lg:col-span-3 glass-panel p-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">LIVE RESOURCE TELEMETRY</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {nodes.map((node, i) => (
                            <div key={`res-${node.id}`} className="flex flex-col space-y-3">
                                <span className="text-xs font-bold text-slate-300 uppercase">{staticNodeInfo[i % 3]?.name || node.id}</span>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-400"><span>CPU Usage</span> <span>{node.cpu}%</span></div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${node.cpu}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full ${node.cpu > 80 ? 'bg-brand-red' : node.cpu > 50 ? 'bg-brand-orange' : 'bg-green-500'}`}
                                        />
                                    </div>

                                    {node.ram !== undefined && (
                                        <>
                                            <div className="flex justify-between text-slate-400 mt-2"><span>RAM Usage</span> <span>{node.ram}%</span></div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={false}
                                                    animate={{ width: `${node.ram}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full bg-brand-cyan"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between text-slate-400 mt-2"><span>Inference Latency</span> <span>{node.latency}ms</span></div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${Math.min(node.latency, 100)}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full ${node.latency > 80 ? 'bg-purple-500' : 'bg-brand-cyan'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
