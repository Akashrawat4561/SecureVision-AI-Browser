import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Activity, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Authentication failed');

            // On success, mock token and login
            login(email, data.access_token || 'mock_token');
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-brand-cyan/20 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-orange/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-panel p-8 md:p-10 border border-white/5 shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div onClick={() => navigate('/landing')} className="w-16 h-16 bg-slate-900 border border-brand-cyan/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_#00f0ff20] cursor-pointer">
                            <Shield className="w-8 h-8 text-brand-cyan" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                            {mode === 'login' ? 'System Access' : 'Create Operator Profile'}
                        </h1>
                        <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-mono mt-2 flex items-center">
                            <Activity className="w-3 h-3 mr-2 text-brand-cyan" /> Sentinel Authenticator v2
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@securevision.ai"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Keyphrase (Password)</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-brand-orange transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-brand-red/10 border border-brand-red/30 p-3 rounded-lg flex items-center text-xs text-brand-red">
                                <Shield className="w-3 h-3 mr-2 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-100 text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-cyan transition-all flex items-center justify-center group disabled:opacity-50 mt-8"
                        >
                            {loading ? 'Initializing...' : (mode === 'login' ? 'Authorize Identity' : 'Register Operator')}
                            {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            to={mode === 'login' ? '/register' : '/login'}
                            className="text-xs font-bold text-slate-400 hover:text-brand-cyan transition-colors uppercase tracking-widest"
                        >
                            {mode === 'login' ? 'Request New Deployment ->' : 'Existing System Access ->'}
                        </Link>
                    </div>
                </div>

                {/* Forensic Footer */}
                <div className="mt-8 flex items-center justify-center space-x-6 opacity-30 grayscale pointer-events-none">
                    <div className="flex items-center text-[10px] text-slate-400 font-mono"><Cpu className="w-3 h-3 mr-1" /> Hardware Isolated</div>
                    <div className="flex items-center text-[10px] text-slate-400 font-mono"><Shield className="w-3 h-3 mr-1" /> Threat Verified</div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
