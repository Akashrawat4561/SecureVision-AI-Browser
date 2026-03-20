import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex-1 flex items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search alerts, IPs, nodes..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-shadow placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                </button>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">{user?.email.split('@')[0]}</span>
                        <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-mono">Active Operator</span>
                    </div>
                    <div className="group relative">
                        <button className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-all p-1 rounded-full border border-transparent hover:border-slate-700 hover:bg-slate-800">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <User className="w-4 h-4 text-brand-cyan" />
                            </div>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors uppercase tracking-widest"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Session</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
