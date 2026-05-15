import { Shield, LayoutDashboard, MailWarning, Activity, Image as ImageIcon, Cpu, BellRing, Network, Settings, Bug, Share2, Radar } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
    { group: 'Intelligence', items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Threat Map', path: '/threatmap', icon: Radar },
        { label: 'Phishing', path: '/phishing', icon: MailWarning },
        { label: 'Deepfake', path: '/deepfake', icon: ImageIcon },
    ]},
    { group: 'Analysis', items: [
        { label: 'Network Monitor', path: '/anomaly', icon: Activity },
        { label: 'Decoys', path: '/honeypot', icon: Bug },
    ]},
    { group: 'Infrastructure', items: [
        { label: 'Servers', path: '/edge', icon: Cpu, badge: 'LIVE' },
        { label: 'Response', path: '/response', icon: BellRing, badge: '3', badgeColor: 'brand-red' },
        { label: 'System Map', path: '/architecture', icon: Network },
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'About', path: '/about', icon: Shield },
    ]}
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className="w-80 h-screen bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 flex flex-col shrink-0 z-40 relative">
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
            
            {/* Logo Section */}
            <div className="h-20 flex items-center px-8 border-b border-white/5 bg-slate-900/10 mb-6 shrink-0">
                <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-brand-cyan/50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                        <Shield className="w-5 h-5 text-brand-cyan" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white font-heading uppercase group-hover:text-brand-cyan transition-colors">
                        Secure<span className="text-brand-cyan">Vision</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-10 custom-scrollbar">
                {navItems.map((group) => (
                    <div key={group.group} className="space-y-4">
                        <div className="px-4 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.group}</h3>
                            <div className="w-8 h-[1px] bg-white/5" />
                        </div>
                        <nav className="space-y-1.5 font-medium">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group relative overflow-hidden ${
                                            isActive 
                                            ? 'bg-brand-cyan/10 text-brand-cyan shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3.5">
                                            <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-brand-cyan' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            <span className="tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-nav"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-cyan rounded-r-full shadow-[0_0_10px_#00f0ff]" 
                                            />
                                        )}
                                        {item.badge && (
                                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-widest ${
                                                item.badgeColor === 'brand-red' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-cyan/10 text-brand-cyan'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Platform Status */}
            <div className="p-6 shrink-0 relative">
                <div className="glass-card p-5 relative overflow-hidden group border-brand-cyan/20">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-cyan/20 blur-[30px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">SYSTEM: ONLINE</span>
                        </div>
                        <Activity className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px]">
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-bold uppercase tracking-tight text-[8px] mb-0.5">Connection</span>
                                <span className="text-brand-cyan font-mono font-black italic">99.9% UPTIME</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-slate-500 font-bold uppercase tracking-tight text-[8px] mb-0.5">Latency</span>
                                <span className="text-slate-300 font-mono font-black">12ms</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                            <motion.div 
                                animate={{ width: ['40%', '85%', '65%', '95%', '70%'] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                                className="h-full bg-gradient-to-r from-brand-cyan/50 via-brand-cyan to-brand-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.4)] rounded-full" 
                            />
                        </div>
                        <button className="w-full py-3 bg-slate-900/50 hover:bg-brand-cyan/10 text-slate-400 hover:text-brand-cyan border border-white/5 hover:border-brand-cyan/20 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all group/btn">
                            <span className="flex items-center justify-center">
                                <Bug className="w-3 h-3 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                Run System Diagnostics
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
