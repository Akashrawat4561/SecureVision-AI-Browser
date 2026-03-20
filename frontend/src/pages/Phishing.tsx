import { useState } from 'react';
import { MailWarning, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

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

        // Call actual backend API
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Email Integrity & Phishing Detection</h1>
                <div className="flex items-center space-x-2 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
                    <MailWarning className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-medium text-slate-300">Model: DistilBERT V2</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input Form */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="w-1.5 h-6 bg-brand-cyan rounded-full mr-3"></span>
                        Scan Suspect Email
                    </h2>

                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Urgent: Action Required on Your Account"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
                                disabled={analyzing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={10}
                                placeholder="Paste the email content here..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors resize-none"
                                disabled={analyzing}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={analyzing || (!subject && !body)}
                            className="w-full py-3 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/50 hover:border-brand-cyan font-bold rounded-lg transition-all flex items-center justify-center uppercase tracking-wider relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mr-3"></div>
                                    Analyzing Threat Patterns...
                                </>
                            ) : (
                                'Analyze Email Sequence'
                            )}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                    </form>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
                            Risk Assessment
                        </h2>

                        {result ? (
                            <div className="flex-1 flex flex-col">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 relative overflow-hidden">
                                        {/* Gauge placeholder */}
                                        <svg className="w-32 h-32" viewBox="0 0 36 36">
                                            <path
                                                className="text-slate-800"
                                                strokeWidth="3"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                strokeDasharray="100, 100"
                                            />
                                            <motion.path
                                                className={result.classification === 'UNSAFE' ? 'text-brand-red' : 'text-brand-cyan'}
                                                strokeWidth="3"
                                                stroke="currentColor"
                                                fill="none"
                                                initial={{ strokeDasharray: '0, 100' }}
                                                animate={{ strokeDasharray: `${result.score}, 100` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-white mb-1">{result.score}%</span>
                                            <span className="text-xs text-slate-400">RISK PROBABILITY</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center space-y-4">
                                        <div className="p-4 rounded-xl border flex flex-col items-center justify-center h-full text-center
                      ${result.classification === 'UNSAFE' 
                        ? 'bg-brand-red/10 border-brand-red/50 shadow-[0_0_20px_rgba(255,42,42,0.15)]' 
                        : 'bg-brand-cyan/10 border-brand-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'}"
                                        >
                                            <span className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Classification</span>
                                            <div className={`text-2xl font-bold uppercase tracking-wider ${result.classification === 'UNSAFE' ? 'text-brand-red' : 'text-brand-cyan'}`}>
                                                {result.classification}
                                            </div>
                                            <div className="mt-2 text-xs font-medium text-slate-300">
                                                {result.classification === 'UNSAFE' ? 'Phishing signature detected' : 'Standard transmission'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {result.classification === 'UNSAFE' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex-1">
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                                            <ShieldAlert className="w-4 h-4 text-brand-red mr-2" />
                                            FLAGGED PATTERNS
                                        </h3>

                                        <div className="mb-4">
                                            <p className="text-xs text-slate-400 mb-2">Subject Signature:</p>
                                            <div className="text-sm text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 break-words">
                                                {getHighlightText(subject)}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400 mb-2">Body Anomalies ({result.flagged.length}):</p>
                                            <div className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 h-32 overflow-y-auto whitespace-pre-wrap break-words">
                                                {getHighlightText(body)}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {result.flagged.map((word, i) => (
                                                <span key={i} className="text-xs font-mono bg-brand-red/20 text-brand-red px-2 py-1 rounded border border-brand-red/30">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {result.classification === 'SAFE' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-700/50 rounded-xl border-dashed">
                                        <ShieldCheck className="w-16 h-16 text-brand-cyan/50 mb-4" />
                                        <p className="text-slate-400 font-medium text-sm">No malicious signatures detected.</p>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                <ShieldAlert className="w-24 h-24 text-slate-600 mb-4" />
                                <p className="text-slate-400 font-medium text-sm text-center max-w-xs">Awaiting input stream.<br />Enter email data to begin risk assessment protocol.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
