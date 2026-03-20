import { ShieldAlert, AlertTriangle, ArrowRight, Share2, CheckSquare, Activity, ShieldOff, Zap, Lock, Globe } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useState } from 'react';

export default function ResponseCenter() {
    const { alerts } = useWebSocket();
    const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

    const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Threat Response Center</h1>
                <div className="flex space-x-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white py-2 px-4 rounded-lg flex items-center transition-colors">
                        <Share2 className="w-4 h-4 mr-2 text-brand-cyan" />
                        Share Threat Signatures
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Timeline */}
                <div className="lg:col-span-2 glass-panel p-6 h-[800px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">LIVE ALERT CHRONOLOGY</h2>
                        <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-brand-cyan animate-pulse">Syncing...</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-cyan before:via-brand-orange before:to-transparent pb-10">

                        {alerts.length === 0 && <div className="text-center text-slate-500 py-10">No alerts in current session.</div>}

                        {alerts.map((item) => (
                            <div key={item.id} onClick={() => setSelectedAlertId(item.id || null)} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                {/* Timeline Icon */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#0b101e] z-10 transition-colors
                  ${item.id === selectedAlert?.id ? 'border-white text-white scale-110' :
                                        item.severity === 'high' ? 'border-brand-red text-brand-red' :
                                            item.severity === 'medium' ? 'border-brand-orange text-brand-orange' : 'border-brand-cyan text-brand-cyan'}`}>
                                    {item.severity === 'high' ? <ShieldAlert className="w-4 h-4" /> : item.severity === 'medium' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </div>

                                {/* Timeline Card */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900/80 p-5 rounded-xl border transition-colors cursor-pointer group-hover:bg-slate-800/80
                  ${item.id === selectedAlert?.id ? 'border-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-slate-700/50 hover:border-slate-500'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${item.severity === 'high' ? 'bg-brand-red/20 text-brand-red' :
                                            item.severity === 'medium' ? 'bg-brand-orange/20 text-brand-orange' :
                                                'bg-brand-cyan/20 text-brand-cyan'
                                            }`}>{item.type}</span>
                                        <time className="text-xs font-mono text-slate-500">{item.time}</time>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-200 mb-1">{item.title}</h3>
                                    <p className="text-xs text-slate-400 mb-3 block">Source: {item.source}</p>

                                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between md:hidden group-hover:flex">
                                        <button className="text-xs text-brand-cyan hover:text-white transition-colors flex items-center">
                                            Investigate <ArrowRight className="w-3 h-3 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Selected Alert Action Panel */}
                <div className="glass-panel p-6 flex flex-col h-[600px] sticky top-6">
                    <div className="mb-6 flex items-center">
                        <CheckSquare className="w-5 h-5 text-brand-cyan mr-3" />
                        <h2 className="text-lg font-semibold text-white tracking-wider">ACTION ALERT</h2>
                    </div>

                    {selectedAlert ? (
                        <div className={`border rounded-lg p-5 mb-6 transition-colors ${selectedAlert.severity === 'high' ? 'bg-brand-red/10 border-brand-red/30' :
                            selectedAlert.severity === 'medium' ? 'bg-brand-orange/10 border-brand-orange/30' : 'bg-brand-cyan/10 border-brand-cyan/30'
                            }`}>
                            <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${selectedAlert.severity === 'high' ? 'text-brand-red' : selectedAlert.severity === 'medium' ? 'text-brand-orange' : 'text-brand-cyan'
                                }`}>SELECTED EVENT #{selectedAlert.id}</span>
                            <h3 className="text-xl font-bold text-white mb-2">{selectedAlert.title}</h3>
                            <p className="text-sm text-slate-300 mb-4">Detected from {selectedAlert.source} at {selectedAlert.time}. Action context is ready for review.</p>

                            {selectedAlert.gradcam && (
                                <div className="mb-4 bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                                    <div className="bg-slate-900 py-1 px-3 border-b border-slate-800 flex justify-between items-center">
                                        <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest">Grad-CAM Forensic Evidence</span>
                                    </div>
                                    <img src={selectedAlert.gradcam} alt="Forensic Evidence" className="w-full h-auto object-contain" />
                                </div>
                            )}

                            <div className="space-y-2 mt-4 text-sm font-mono bg-slate-950 p-3 rounded">
                                <div className="flex justify-between"><span className="text-slate-500">SEVERITY:</span> <span className={selectedAlert.severity === 'high' ? 'text-brand-red' : 'text-brand-orange'}>{selectedAlert.severity?.toUpperCase()}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">SOURCE:</span> <span className="text-slate-300">{selectedAlert.source}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">STATUS:</span> <span className="text-brand-cyan">UNRESOLVED</span></div>
                            </div>

                            {/* Playbook Section */}
                            <div className="mt-8">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Suggested AI Playbook</h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center group cursor-pointer hover:border-brand-cyan transition-colors">
                                        <div className="w-8 h-8 rounded bg-brand-cyan/10 flex items-center justify-center mr-3 group-hover:bg-brand-cyan/20">
                                            <ShieldOff className="w-4 h-4 text-brand-cyan" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">Quarantine Node</div>
                                            <div className="text-[10px] text-slate-500">Isolate source from internal VLAN</div>
                                        </div>
                                        <Zap className="w-3 h-3 text-slate-700 group-hover:text-brand-cyan" />
                                    </div>
                                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center group cursor-pointer hover:border-brand-orange transition-colors">
                                        <div className="w-8 h-8 rounded bg-brand-orange/10 flex items-center justify-center mr-3 group-hover:bg-brand-orange/20">
                                            <Lock className="w-4 h-4 text-brand-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">Rotate Credentials</div>
                                            <div className="text-[10px] text-slate-500">Force password reset on all admins</div>
                                        </div>
                                        <Zap className="w-3 h-3 text-slate-700 group-hover:text-brand-orange" />
                                    </div>
                                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center group cursor-pointer hover:border-brand-red transition-colors">
                                        <div className="w-8 h-8 rounded bg-brand-red/10 flex items-center justify-center mr-3 group-hover:bg-brand-red/20">
                                            <Globe className="w-4 h-4 text-brand-red" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">Block IP Registry</div>
                                            <div className="text-[10px] text-slate-500">Update global firewall signatures</div>
                                        </div>
                                        <Zap className="w-3 h-3 text-slate-700 group-hover:text-brand-red" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <ShieldAlert className="w-16 h-16 text-slate-500 mb-4" />
                            <p className="text-sm text-slate-500 text-center">Select an alert from the timeline to view details and take action.</p>
                        </div>
                    )}

                    <div className="flex-1"></div>

                    <div className="space-y-3 mt-6">
                        <button disabled={!selectedAlert} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg border border-slate-700 transition-colors uppercase tracking-wider text-sm shadow-md disabled:opacity-50">
                            Mark as Read
                        </button>
                        <button disabled={!selectedAlert} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 font-medium py-3 rounded-lg border border-slate-800 transition-colors uppercase tracking-wider text-sm disabled:opacity-50">
                            Ignore & Adjust Baseline
                        </button>
                        <button disabled={!selectedAlert} className="w-full bg-brand-red/20 hover:bg-brand-red/30 text-brand-red font-bold py-3 rounded-lg border border-brand-red/50 transition-colors uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(255,42,42,0.15)] flex items-center justify-center disabled:opacity-50">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Report Incident
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
