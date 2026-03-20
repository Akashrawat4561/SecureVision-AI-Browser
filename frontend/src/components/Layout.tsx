import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Terminal from './Terminal';

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
                <Terminal />
            </div>
        </div>
    );
}
