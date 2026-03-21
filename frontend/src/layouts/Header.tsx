import { Search, Bell, User, Command, Mail, ShieldCheck, LogOut, Activity, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { user, logout } = useAuth();

    return (
        <header className="h-20 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-30 sticky top-0 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-transparent to-brand-orange/5 opacity-30 pointer-events-none" />
            
            {/* Search Module */}
            <div className="flex-1 max-w-2xl relative group">
                <div className={`absolute inset-0 bg-brand-cyan/5 blur-xl transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors duration-300 ${isSearchFocused ? 'text-brand-cyan' : 'text-slate-500'}`} />
                    <input
                        type="text"
                        placeholder="Search Intelligence Hub..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-20 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan/30 focus:bg-slate-900 transition-all placeholder:text-slate-600 font-medium"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 px-2 py-1 bg-slate-950/50 border border-white/10 rounded-lg">
                        <Command className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500">K</span>
                    </div>
                </div>
            </div>

            {/* Global Threat Level Badge */}
            <div className="mx-8 hidden lg:flex items-center space-x-4 bg-slate-900/40 px-5 py-2 rounded-2xl border border-white/5 shadow-inner group cursor-help">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase mb-0.5 group-hover:text-brand-orange transition-colors">Global Threat Index</span>
                    <span className="text-xs font-mono font-black text-brand-orange">ALPHA-7 (ELEVATED)</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 relative">
                    <div className="absolute inset-0 bg-brand-orange/20 blur-md animate-pulse rounded-xl" />
                    <ShieldAlert className="w-5 h-5 text-brand-orange relative z-10" />
                </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all relative group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-red rounded-full border-2 border-slate-950 shadow-[0_0_8px_#ff2a2e] animate-pulse" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all group">
                        <Mail className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-white/5" />

                <div className="group relative">
                    <button className="flex items-center space-x-3.5 text-sm text-slate-300 hover:text-white transition-all p-1.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 group">
                        <div className="text-right hidden sm:block">
                            <div className="flex items-center justify-end space-x-1.5 leading-none mb-1">
                                <span className="text-xs font-black text-white uppercase tracking-tight font-heading">
                                    {user?.email ? user.email.split('@')[0] : 'Operator'}
                                </span>
                                <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                            </div>
                            <div className="flex items-center justify-end space-x-1">
                                <Activity className="w-2.5 h-2.5 text-brand-cyan animate-pulse" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Senior Operator</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-cyan/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-brand-cyan/30 transition-colors">
                                <User className="w-6 h-6 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                            </div>
                        </div>
                    </button>
                    
                    {/* Profile Dropdown */}
                    <div className="absolute right-0 top-full mt-3 w-64 bg-slate-950 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2.5 z-50 backdrop-blur-2xl">
                        <div className="px-4 py-4 mb-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Authenticated Identity</p>
                            <p className="text-xs text-white truncate font-bold font-heading">{user?.email || 'N/A'}</p>
                            <div className="flex items-center mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mr-2 shadow-[0_0_8px_#00f0ff]" />
                                Security Level 9
                            </div>
                        </div>
                        <div className="space-y-1">
                            <button className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all uppercase tracking-widest active:scale-[0.98]">
                                <User className="w-4 h-4" />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-all uppercase tracking-widest active:scale-[0.98]"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Access</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
