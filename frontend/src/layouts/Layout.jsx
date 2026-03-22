import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Terminal from '../components/dashboard/Terminal';

export default function Layout() {
    return (
        <div className="flex h-screen mesh-gradient text-slate-300 font-sans overflow-hidden relative">
            {/* Ambient Background Layers */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />

            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
                <Terminal />
            </div>
        </div>
    );
}
