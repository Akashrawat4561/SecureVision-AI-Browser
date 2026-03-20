import { Radar, Crosshair, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo } from 'react';

export default function Predictive() {
    const { history, connected } = useWebSocket();

    // Simulate risk score based on recent traffic volume
    const currentRisk = useMemo(() => {
        if (!history || history.length === 0) return 15;
        const avgTraffic = history.reduce((sum, d) => sum + (d.traffic || 0), 0) / history.length;
        return Math.min(Math.round((avgTraffic / 400) * 100), 100);
    }, [history]);

    const predictions = [
        { target: 'Auth Perimeter', type: 'Credential Stuffing', prob: currentRisk > 50 ? 88 : 12, timeframe: 'Next 2 hours' },
        { target: 'Internal DB Server', type: 'SQLi Attempt', prob: 34, timeframe: 'Next 12 hours' },
        { target: 'Edge Nodes (EU)', type: 'DDoS Amplification', prob: currentRisk > 80 ? 95 : 22, timeframe: 'Next 30 mins' },
        { target: 'Mail Gateway', type: 'Spear Phishing Burst', prob: 67, timeframe: 'Next 24 hours' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase flex items-center">
                    <Radar className="text-brand-orange mr-3 w-8 h-8" />
                    Predictive Attack Simulation
                </h1>
                <div className="flex items-center space-x-2 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
                    <span className={`text-xs ${connected ? 'text-brand-orange animate-pulse' : 'text-slate-500'} font-bold tracking-wider uppercase`}>
                        {connected ? 'Live Forecasting Active' : 'Forecasting Paused'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Risk Forecaster */}
                <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-orange to-slate-900 pointer-events-none"></div>

                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 absolute top-6 left-6">Aggregated Attack Risk</h2>

                    <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            {/* Background Ring */}
                            <circle cx="96" cy="96" r="80" fill="none" stroke="#1e293b" strokeWidth="12" />
                            {/* Progress Ring */}
                            <circle cx="96" cy="96" r="80" fill="none" stroke={currentRisk > 75 ? '#ff2a2a' : currentRisk > 40 ? '#ff8b00' : '#00f0ff'} strokeWidth="12" strokeDasharray={`${(currentRisk / 100) * 502} 502`} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="flex flex-col items-center">
                            <span className={`text-5xl font-bold font-mono ${currentRisk > 75 ? 'text-brand-red' : currentRisk > 40 ? 'text-brand-orange' : 'text-brand-cyan'}`}>{currentRisk}%</span>
                            <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Probability</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between w-full text-xs font-mono text-slate-500">
                        <span className="flex items-center"><TrendingDown className="w-3 h-3 mr-1 text-green-500" /> Low Risk (0-40)</span>
                        <span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1 text-brand-red" /> High Risk (75+)</span>
                    </div>
                </div>

                {/* Forecast Feed */}
                <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Simulation Output Matrix</h2>
                        <button className="text-xs font-bold text-white bg-brand-orange/20 border border-brand-orange/40 hover:bg-brand-orange/30 px-3 py-1.5 rounded transition-colors hidden md:block">
                            Run Manual Simulation
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {predictions.map((sim, i) => (
                            <div key={i} className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden group hover:border-slate-500 transition-colors">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${sim.prob > 80 ? 'bg-brand-red' : sim.prob > 40 ? 'bg-brand-orange' : 'bg-brand-cyan'}`}></div>

                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                        <Crosshair className={`w-4 h-4 mr-2 ${sim.prob > 80 ? 'text-brand-red' : 'text-slate-400'}`} />
                                        <span className="text-sm font-bold text-white">{sim.target}</span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 rounded border border-slate-800">{sim.timeframe}</span>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Predicted Vector</span>
                                        <span className="text-xs font-mono text-slate-300">{sim.type}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Confidence</span>
                                        <span className={`text-xl font-bold font-mono ${sim.prob > 80 ? 'text-brand-red' : sim.prob > 40 ? 'text-brand-orange' : 'text-brand-cyan'}`}>
                                            {sim.prob}%
                                        </span>
                                    </div>
                                </div>

                                {sim.prob > 80 && (
                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-brand-red font-bold animate-pulse flex items-center">
                                            <AlertOctagon className="w-3 h-3 mr-1" /> Critical Target Profile
                                        </span>
                                        <button className="text-brand-cyan hover:text-white transition-colors">Deploy Countermeasures</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
