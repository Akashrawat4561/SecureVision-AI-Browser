import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../context/WebSocketContext';

export default function Terminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const { logs } = useWebSocket();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    return (
        <>
            {/* Terminal Toggle Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-slate-900 border border-slate-700 p-3 rounded-full shadow-2xl hover:border-brand-cyan hover:shadow-[0_0_15px_#00f0ff50] transition-all group"
                >
                    <TerminalIcon className={`w-6 h-6 ${isOpen ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-brand-cyan'}`} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            width: isMaximized ? '90vw' : '500px',
                            height: isMaximized ? '80vh' : '400px',
                            right: isMaximized ? '5vw' : '24px',
                            bottom: isMaximized ? '10vh' : '84px',
                        }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="fixed z-50 glass-panel border border-slate-700 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-950/90"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                <TerminalIcon className="w-3 h-3 text-brand-cyan" />
                                <span>Neural Sentinel Terminal v2.0.0</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:text-white text-slate-500 transition-colors">
                                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:text-brand-red text-slate-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Logs Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800"
                        >
                            {logs.length === 0 && (
                                <div className="text-slate-700 animate-pulse">Initializing neural stream...</div>
                            )}
                            {logs.map((log: any, i: number) => (
                                <div key={i} className="flex space-x-3 group">
                                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                    <span className={`shrink-0 font-bold ${
                                        log.level === 'CRITICAL' ? 'text-brand-red' : 
                                        log.level === 'WARN' ? 'text-brand-orange' : 
                                        log.level === 'SUCCESS' ? 'text-green-500' : 'text-brand-cyan'
                                    }`}>
                                        {log.level || 'INFO'}
                                    </span>
                                    <span className="text-slate-300 break-all">{log.message}</span>
                                </div>
                            ))}
                            <div className="flex items-center text-brand-cyan animate-pulse">
                                <ChevronRight className="w-3 h-3 mr-1" />
                                <span className="w-2 h-4 bg-brand-cyan/50 ml-1"></span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                            <span>CONNECTED_NODES: 3</span>
                            <span className="text-brand-cyan">ENCRYPTION: AES-256-GCM</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
