import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Cpu, Zap } from 'lucide-react';
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

            login(email, data.access_token || 'mock_token');
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="glass-panel p-10 md:p-12 border border-white/10 shadow-3xl relative overflow-hidden bg-slate-950/40 backdrop-blur-2xl rounded-[40px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-12">
                        <div onClick={() => navigate('/landing')} className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-2xl cursor-pointer hover:border-brand-cyan/50 transition-colors group">
                            <Shield className="w-7 h-7 text-brand-cyan group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter font-heading text-center">
                            {mode === 'login' ? 'System Access' : 'New Deployment'}
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mt-3 flex items-center">
                            <Zap className="w-3 h-3 mr-2 text-brand-orange" /> Forensic Vault v2.4.1
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Identifier</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-cyan transition-colors" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@securevision.ai"
                                    className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-200 focus:border-brand-cyan/40 focus:bg-slate-950 transition-all placeholder:text-slate-700 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Keyphrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-orange transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-200 focus:border-brand-orange/40 focus:bg-slate-950 transition-all placeholder:text-slate-700 font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-brand-red/5 border border-brand-red/20 p-4 rounded-2xl flex items-center text-[11px] text-brand-red font-bold">
                                <Shield className="w-3.5 h-3.5 mr-2 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-slate-950 py-4.5 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-brand-cyan transition-all flex items-center justify-center group disabled:opacity-50 mt-10 shadow-2xl relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center">
                                {loading ? 'Initializing...' : (mode === 'login' ? 'Authorize Identity' : 'Register Operator')}
                                {!loading && <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1.5 duration-300 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link
                            to={mode === 'login' ? '/register' : '/login'}
                            className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                            {mode === 'login' ? 'Request Authorization Keys' : 'Existing System Profile Found'}
                        </Link>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center space-x-10 opacity-30 grayscale filter invert brightness-200 pointer-events-none">
                    <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest"><Cpu className="w-3 h-3 mr-2" /> Isolated_HW</div>
                    <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest"><Shield className="w-3 h-3 mr-2" /> Tier_1_SEC</div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
