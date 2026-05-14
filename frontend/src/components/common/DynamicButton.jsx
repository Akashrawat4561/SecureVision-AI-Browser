import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DynamicButton({ 
    children, 
    onClick, 
    className = '', 
    icon: Icon, 
    loadingIcon: LoadingIcon = Loader2,
    successIcon: SuccessIcon = CheckCircle2,
    isProcessing = false, 
    variant = 'primary', // primary, secondary, danger, ghost, ghost-accent
    label = '',
    sublabel = '',
    successMessage = 'Action Complete',
    fullWidth = true,
    disabled = false
}) {
    const [status, setStatus] = useState('idle'); // idle, processing, success

    useEffect(() => {
        if (isProcessing) setStatus('processing');
        else if (status === 'processing') {
            setStatus('success');
            const timer = setTimeout(() => setStatus('idle'), 3000);
            return () => clearTimeout(timer);
        }
    }, [isProcessing]);

    const variants = {
        primary: {
            idle: 'bg-white text-slate-950 hover:bg-brand-orange hover:shadow-[0_0_30px_rgba(255,139,0,0.3)]',
            processing: 'bg-slate-900 border-brand-orange text-brand-orange cursor-wait',
            success: 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]',
        },
        secondary: {
            idle: 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-white/5 hover:border-white/20',
            processing: 'bg-slate-900 border-slate-700 text-slate-500 cursor-wait',
            success: 'bg-slate-800 text-green-400 border-green-500/50',
        },
        danger: {
            idle: 'bg-black text-white border-brand-red/40 hover:bg-brand-red/10 hover:border-brand-red/60 hover:shadow-[0_0_30px_rgba(255,42,46,0.2)]',
            processing: 'bg-slate-900 border-brand-orange text-brand-orange cursor-wait',
            success: 'bg-green-500/20 text-green-400 border-green-500/60',
        },
        ghost: {
             idle: 'bg-transparent text-slate-500 hover:text-white hover:bg-white/5 border-transparent',
             processing: 'bg-white/5 border-white/10 text-white cursor-wait',
             success: 'bg-green-500/10 text-green-400 border-green-500/20',
        },
        'ghost-accent': {
             idle: 'bg-brand-orange/5 text-brand-orange hover:bg-brand-orange/20 border-brand-orange/10 hover:border-brand-orange/40 shadow-inner',
             processing: 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange cursor-wait',
             success: 'bg-green-500/10 text-green-400 border-green-500/20',
        }
    };

    const currentStyle = variants[variant] || variants.primary;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
                if (status === 'idle' && onClick) {
                    onClick(e);
                }
            }}
            disabled={status !== 'idle' || disabled}
            className={`${fullWidth ? 'w-full' : ''} relative py-5 px-6 rounded-[24px] overflow-hidden transition-all duration-500 border font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center group
                ${status === 'idle' ? currentStyle.idle : 
                  status === 'processing' ? currentStyle.processing : 
                  currentStyle.success} ${className}`}
        >
            {/* Holographic scanning effect for processing */}
            <AnimatePresence>
                {status === 'processing' && (
                    <>
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '250%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full skew-x-12 opacity-30 pointer-events-none"
                        />
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.05, 0.15, 0.05] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-current opacity-5 pointer-events-none"
                        />
                         <motion.div 
                            initial={{ y: -50 }}
                            animate={{ y: 150 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-x-0 h-[1px] bg-current opacity-30 shadow-[0_0_15px_currentColor] z-20 pointer-events-none"
                        />
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10 flex items-center justify-center space-x-3">
                {status === 'idle' && (
                    <>
                        {Icon && <Icon className="w-4 h-4 transition-transform group-hover:scale-125 group-hover:rotate-6" />}
                        <span>{children}</span>
                    </>
                )}

                {status === 'processing' && (
                    <>
                        <LoadingIcon className="w-4 h-4 animate-spin" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">{label || 'Processing...'}</span>
                            {sublabel && <span className="text-[9px] font-mono opacity-60">{sublabel}</span>}
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <SuccessIcon className="w-4 h-4" />
                        </motion.div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{successMessage}</span>
                    </>
                )}
            </div>

            {/* Bottom progress bar for processing */}
            {status === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden">
                    <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.4, ease: "linear" }}
                        className="h-full bg-current shadow-[0_0_10px_currentColor]"
                    />
                </div>
            )}
        </motion.button>
    );
}
