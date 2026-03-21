import { useState } from 'react';
import { MailWarning, ShieldCheck, ShieldAlert, Zap, Search, Activity, Target, ArrowRight, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Phishing() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{ score: number, classification: string, flagged: string[] } | null>(null);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject && !body) return;

        setAnalyzing(true);
        setResult(null);

        fetch('http://localhost:8000/api/phishing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body })
        })
            .then(res => res.json())
            .then(data => {
                setResult(data);
                setAnalyzing(false);
            })
            .catch(err => {
                console.error(err);
                setAnalyzing(false);
            });
    };

    const getHighlightText = (text: string) => {
        if (!result || result.flagged.length === 0) return text;

        let highlightedText = text;
        result.flagged.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="bg-brand-red/20 text-brand-red font-bold px-1 rounded border border-brand-red/30">$1</span>');
        });

        return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    };

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-16">
            {/* Mission Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-brand-cyan mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono whitespace-nowrap">Intelligence Stream // Email</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Email <span className="text-brand-cyan not-italic">Integrity</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                        Tactical NLP assessment of electronic communications for sophisticated social engineering vectors.
                    </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-900/40 backdrop-blur-2xl py-4 px-8 rounded-[28px] border border-white/5">
                    <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                        <MailWarning className="w-4.5 h-4.5 text-brand-cyan" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Model</span>
                        <span className="text-xs font-mono text-white font-bold uppercase">DistilBERT-V2.4</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Input Protocol Container */}
                <div className="glass-panel p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
                    
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="p-2.5 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                            <Search className="w-5.5 h-5.5 text-brand-cyan" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Ingress Protocol</h2>
                    </div>

                    <form onSubmit={handleAnalyze} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="E.g. Urgent System Notification: Identity Check"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan/40 focus:bg-slate-900/50 transition-all placeholder:text-slate-700 font-medium"
                                disabled={analyzing}
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={10}
                                placeholder="Paste the exact transmission payload here..."
                                className="w-full bg-slate-950 border border-white/5 rounded-[32px] px-6 py-5 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan/40 focus:bg-slate-900/50 transition-all placeholder:text-slate-700 font-medium resize-none custom-scrollbar min-h-[300px]"
                                disabled={analyzing}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={analyzing || (!subject && !body)}
                            className="w-full py-5 bg-white text-slate-950 hover:bg-brand-cyan transition-all text-xs font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl flex items-center justify-center group disabled:opacity-50 relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center">
                                {analyzing ? (
                                    <>
                                        <Activity className="w-4 h-4 mr-3 animate-pulse text-brand-cyan" />
                                        Syncing Neural Patterns...
                                    </>
                                ) : (
                                    <>
                                        Run Integrity Scan
                                        <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            {analyzing && <div className="absolute inset-0 bg-slate-900 animate-pulse pointer-events-none" />}
                        </button>
                    </form>
                </div>

                {/* Tactical Assessment Module */}
                <div className="glass-panel p-10 flex flex-col relative overflow-hidden group">
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20 shadow-[0_0_15px_rgba(255,139,0,0.1)]">
                                <Target className="w-5.5 h-5.5 text-brand-orange" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter font-heading">Forensic Output</h3>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col space-y-10 relative z-10"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-[40px] border border-white/5 relative overflow-hidden group/gauge shadow-inner">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-cyan/20 overflow-hidden">
                                            <motion.div 
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '100%' }}
                                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                                                className="w-full h-full bg-brand-cyan shadow-[0_0_15px_#00f0ff]"
                                            />
                                        </div>
                                        <div className="relative mb-4">
                                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="2" />
                                                <motion.circle
                                                    cx="18" cy="18" r="16" fill="none"
                                                    className={result.classification === 'UNSAFE' ? 'stroke-brand-red' : 'stroke-brand-cyan'}
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeDasharray="100, 100"
                                                    initial={{ strokeDashoffset: 100 }}
                                                    animate={{ strokeDashoffset: 100 - result.score }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-black text-white tracking-tighter font-heading">{result.score}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Neural Confidence</span>
                                    </div>

                                    <div className={`p-8 rounded-[40px] border flex flex-col items-center justify-center text-center relative overflow-hidden
                                        ${result.classification === 'UNSAFE' 
                                            ? 'bg-brand-red/5 border-brand-red/30 shadow-[0_0_30px_rgba(255,42,42,0.1)]' 
                                            : 'bg-brand-cyan/5 border-brand-cyan/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]'}`}
                                    >
                                        <div className={`absolute top-0 right-0 p-3 rounded-bl-3xl border-l border-b ${result.classification === 'UNSAFE' ? 'border-brand-red/20 text-brand-red' : 'border-brand-cyan/20 text-brand-cyan'}`}>
                                            {result.classification === 'UNSAFE' ? <ShieldAlert className="w-5 h-5 shadow-inner" /> : <ShieldCheck className="w-5 h-5" />}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest whitespace-nowrap">Assessment Rank</span>
                                        <div className={`text-4xl font-black uppercase italic tracking-tighter font-heading ${result.classification === 'UNSAFE' ? 'text-brand-red' : 'text-brand-cyan'}`}>
                                            {result.classification}
                                        </div>
                                        <div className="mt-4 px-4 py-1.5 bg-slate-950/60 rounded-full border border-white/5">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Verified Sequence</span>
                                        </div>
                                    </div>
                                </div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-slate-950/80 border border-white/5 rounded-[40px] p-8 space-y-8 overflow-y-auto custom-scrollbar shadow-inner">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                                        <Zap className="w-3 h-3 text-brand-orange mr-2" /> Pattern Decomposition
                                    </h4>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Subject Vector Analysis</p>
                                            <div className="text-sm text-slate-300 leading-relaxed font-bold bg-slate-900/60 p-5 rounded-2xl border border-white/5 font-heading">
                                                {getHighlightText(subject)}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Payload Body Examination ({result.flagged.length} anomalies)</p>
                                            <div className="text-sm text-slate-400 leading-relaxed font-bold bg-slate-900/60 p-6 rounded-[28px] border border-white/5 h-48 overflow-y-auto custom-scrollbar font-heading">
                                                {getHighlightText(body)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2.5 pt-4">
                                        {result.flagged.map((word, i) => (
                                            <span key={i} className="text-[10px] font-mono font-black bg-brand-red/10 text-brand-red px-3 py-1.5 rounded-xl border border-brand-red/20 shadow-lg">
                                                #{word.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                                <div className="relative mb-10">
                                    <div className="absolute inset-0 bg-brand-orange blur-[80px] opacity-20" />
                                    <Radar className="w-32 h-32 text-slate-500 animate-pulse" />
                                </div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter font-heading mb-3">Initializing Feed</h4>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest text-center max-w-xs leading-relaxed">
                                    Awaiting cryptographically signed Ingress Data stream for neural forensic verification.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
