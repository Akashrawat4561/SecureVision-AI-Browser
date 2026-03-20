import { ShieldAlert, LayoutDashboard, MailWarning, Activity, Image as ImageIcon, Cpu, BellRing, Network, Settings, Bug, Share2, Radar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Phishing', path: '/phishing', icon: MailWarning },
    { name: 'Anomaly', path: '/anomaly', icon: Activity },
    { name: 'Deepfake', path: '/deepfake', icon: ImageIcon },
    { name: 'Honeypot', path: '/honeypot', icon: Bug },
    { name: 'Intel Share', path: '/intel', icon: Share2 },
    { name: 'Predictive', path: '/predictive', icon: Radar },
    { name: 'Edge Nodes', path: '/edge', icon: Cpu },
    { name: 'Response', path: '/response', icon: BellRing },
    { name: 'Architecture', path: '/architecture', icon: Network },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full z-10 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 via-transparent to-brand-orange/5 pointer-events-none" />
            
            <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0 relative">
                <div className="w-10 h-10 bg-brand-cyan/20 rounded-xl flex items-center justify-center border border-brand-cyan/30 mr-3 shadow-[0_0_15px_#00f0ff30]">
                    <ShieldAlert className="w-6 h-6 text-brand-cyan" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">SecureVision <span className="text-brand-cyan not-italic ml-0.5">AI</span></span>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border border-transparent',
                            isActive
                                ? 'text-white bg-slate-800/80 border-slate-700/50 shadow-[0_0_15px_rgba(0,240,255,0.05)] shadow-[inset_2px_0_0_0_#00f0ff]'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx(
                                    'w-5 h-5 mr-3 transition-colors shrink-0',
                                    isActive ? 'text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : 'text-slate-500 group-hover:text-slate-300'
                                )} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-cyan rounded-r-full shadow-[0_0_10px_2px_rgba(0,240,255,0.4)]"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 shrink-0">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium tracking-wider">SYSTEM STATUS</span>
                        <span className="text-sm text-green-400 font-semibold flex items-center mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
                            Optimal
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
