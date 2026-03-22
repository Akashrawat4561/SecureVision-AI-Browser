import { useState, useEffect, useRef } from 'react';
import {
    ComposableMap, Geographies, Geography, Marker, Sphere, Graticule
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, AlertTriangle, Activity, Shield, TrendingUp, Zap,
    RefreshCw, Filter, ChevronDown, WifiOff, Wifi, Eye, MapPin
} from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────────── */
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const SEVERITY_COLOR = {
    critical: '#ff2a2a',
    high:     '#ef4444',
    medium:   '#f97316',
    low:      '#eab308',
};

const SEVERITY_BADGE = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    high:     'bg-red-400/10 text-red-300 border-red-400/20',
    medium:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
    low:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};
const ATTACK_TYPES = [
    'Phishing','Ransomware','DDoS','Malware','Credential Harvest','Zero-Day','Spear Phishing','Botnet'
];
const GEO_POOL = [
    { city: 'Beijing',       country: 'China',           coords: [116.4,  39.9]  },
    { city: 'Moscow',        country: 'Russia',           coords: [37.6,   55.75] },
    { city: 'Seoul',         country: 'South Korea',      coords: [126.9,  37.6]  },
    { city: 'Tehran',        country: 'Iran',             coords: [51.4,   35.7]  },
    { city: 'Lagos',         country: 'Nigeria',          coords: [3.4,    6.5]   },
    { city: 'Bucharest',     country: 'Romania',          coords: [26.1,   44.4]  },
    { city: 'São Paulo',     country: 'Brazil',           coords: [-46.6, -23.5]  },
    { city: 'Jakarta',       country: 'Indonesia',        coords: [106.8,  -6.2]  },
    { city: 'Karachi',       country: 'Pakistan',         coords: [67.0,   24.9]  },
    { city: 'Kyiv',          country: 'Ukraine',          coords: [30.5,   50.4]  },
    { city: 'Bogotá',        country: 'Colombia',         coords: [-74.1,   4.7]  },
    { city: 'Cairo',         country: 'Egypt',            coords: [31.2,   30.1]  },
    { city: 'Mumbai',        country: 'India',            coords: [72.9,   19.1]  },
    { city: 'Dallas',        country: 'USA',              coords: [-96.8,  32.8]  },
    { city: 'Amsterdam',     country: 'Netherlands',      coords: [4.9,    52.4]  },
    { city: 'Johannesburg',  country: 'South Africa',     coords: [28.0,  -26.2]  },
    { city: 'Toronto',       country: 'Canada',           coords: [-79.4,  43.7]  },
    { city: 'Kuala Lumpur',  country: 'Malaysia',         coords: [101.7,   3.1]  },
];

let _nextId = 1;
function makeEvent() {
    const geo  = GEO_POOL[Math.floor(Math.random() * GEO_POOL.length)];
    const sevs = ['critical','high','high','medium','medium','medium','low','low'];
    return {
        id:          _nextId++,
        coordinates: geo.coords,
        severity:    sevs[Math.floor(Math.random() * sevs.length)],
        type:        ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
        country:     geo.country,
        city:        geo.city,
        ip:          `${rand(1,254)}.${rand(1,254)}.${rand(1,254)}.${rand(1,254)}`,
        timestamp:   new Date(),
        blocked:     Math.random() > 0.3,
        packets:     rand(100, 99999),
    };
}
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function timeAgo(d) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60)  return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
}

/* ─── Stats Card ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
    return (
        <div className="glass-panel p-6 flex items-center gap-5 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className={`absolute inset-0 bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`p-3 bg-${color}/10 rounded-2xl border border-${color}/20 shrink-0 relative z-10`}>
                <Icon className={`w-5 h-5 text-${color}`} />
            </div>
            <div className="relative z-10">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-2xl font-black text-white font-heading tracking-tighter leading-none">{value}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                    {trend && <span className="text-emerald-400">{trend}</span>}
                    {sub}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ThreatMapPage() {
    const [events, setEvents]         = useState(() => Array.from({ length: 12 }, makeEvent));
    const [selected, setSelected]     = useState(null);
    const [filter, setFilter]         = useState('all');
    const [live, setLive]             = useState(true);
    const [newEventId, setNewEventId] = useState(null);
    const [blocked24h, setBlocked24h] = useState(12_847);
    const [totalEvents, setTotalEvents] = useState(events.length);
    const [showFilter, setShowFilter] = useState(false);
    const timerRef = useRef(null);

    // Live threat event generator
    useEffect(() => {
        if (!live) { if (timerRef.current) clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => {
            const ev = makeEvent();
            setNewEventId(ev.id);
            setEvents(prev => [ev, ...prev].slice(0, 40));
            setTotalEvents(n => n + 1);
            if (ev.blocked) setBlocked24h(n => n + 1);
            setTimeout(() => setNewEventId(null), 1800);
        }, 2800);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [live]);

    const filtered = filter === 'all' ? events : events.filter(e => e.severity === filter);
    const counts = {
        critical: events.filter(e => e.severity === 'critical').length,
        high:     events.filter(e => e.severity === 'high').length,
        medium:   events.filter(e => e.severity === 'medium').length,
        low:      events.filter(e => e.severity === 'low').length,
    };

    return (
        <div className="space-y-8 max-w-[1700px] mx-auto pb-16">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-brand-cyan">
                        <motion.div
                            animate={{ opacity: live ? [1, 0.3, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]"
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">
                            Global Threat Surface
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter font-heading leading-none">
                        Threat <span className="text-brand-cyan not-italic">Map</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-lg">
                        Live map showing active cyber threat events and their geographical origin.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Severity filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilter(v => !v)}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-brand-cyan/30 text-slate-300 hover:text-brand-cyan transition-all text-[10px] font-black uppercase tracking-widest backdrop-blur-xl"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            {filter === 'all' ? 'All Severity' : filter}
                            <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 mt-2 z-50 bg-slate-900 border border-white/10 rounded-2xl p-2 w-44 shadow-2xl"
                                >
                                    {['all','critical','high','medium','low'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setFilter(s); setShowFilter(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
                                                filter === s ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {s === 'all' ? '⬛ All' : s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Live toggle */}
                    <button
                        onClick={() => setLive(v => !v)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest backdrop-blur-xl ${
                            live
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {live ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        {live ? 'Live' : 'Paused'}
                    </button>

                    {/* Reset */}
                    <button
                        onClick={() => { const fresh = Array.from({ length: 12 }, makeEvent); setEvents(fresh); setTotalEvents(fresh.length); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-white/10 text-slate-500 hover:text-slate-300 transition-all text-[10px] font-black uppercase tracking-widest backdrop-blur-xl"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Reset
                    </button>
                </div>
            </div>

            {/* ── Severity Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { key: 'critical', label: 'Critical',  dot: '#ff2a2a', ring: 'ring-red-500/20'    },
                    { key: 'high',     label: 'High',      dot: '#ef4444', ring: 'ring-red-400/20'    },
                    { key: 'medium',   label: 'Medium',    dot: '#f97316', ring: 'ring-orange-500/20' },
                    { key: 'low',      label: 'Low',       dot: '#eab308', ring: 'ring-yellow-500/20' },
                ].map(s => (
                    <motion.button
                        key={s.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                        className={`glass-panel p-5 flex items-center gap-4 transition-all ring-1 ${
                            filter === s.key ? `${s.ring} bg-white/5` : 'ring-transparent'
                        }`}
                    >
                        <div className="relative shrink-0">
                            <motion.div
                                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ repeat: Infinity, duration: 2, delay: Math.random() }}
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: s.dot }}
                            />
                            <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: s.dot }} />
                        </div>
                        <div className="text-left">
                            <div className="text-xl font-black font-heading text-white leading-none">
                                {counts[s.key]}
                            </div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* ── World Map ── */}
            <div className="glass-panel overflow-hidden relative" style={{ height: '520px' }}>
                {/* Map top-bar */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                            <Globe className="w-4 h-4 text-brand-cyan" />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Global Map</div>
                            <div className="text-xs font-bold text-white font-mono">{filtered.length} active threat{filtered.length !== 1 ? 's' : ''} visible</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 border border-brand-cyan/20 rounded-xl">
                        <motion.div
                            animate={{ opacity: live ? [1, 0.2, 1] : 0.4 }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-brand-cyan"
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-cyan font-mono">
                            {live ? 'Signal Sync: ACTIVE' : 'Signal Sync: PAUSED'}
                        </span>
                    </div>
                </div>

                {/* Grid scan-line overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{ y: ['0%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                        className="w-full h-[2px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent"
                    />
                </div>

                <ComposableMap
                    projectionConfig={{ rotate: [-10, 0, 0], scale: 165 }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <Sphere stroke="#1e293b" strokeWidth={0.4} id="threat-sphere" fill="none" />
                    <Graticule stroke="#0f1f36" strokeWidth={0.3} />
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#0d1424"
                                    stroke="#1a2744"
                                    strokeWidth={0.4}
                                    style={{
                                        default: { outline: 'none' },
                                        hover:   { fill: '#162036', outline: 'none' },
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {filtered.map(ev => (
                        <Marker
                            key={ev.id}
                            coordinates={ev.coordinates}
                            onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                        >
                            <g style={{ cursor: 'pointer' }}>
                                {/* Outer pulse ring */}
                                <motion.circle
                                    initial={{ r: 3, opacity: 0.9 }}
                                    animate={{ r: ev.severity === 'critical' ? 28 : ev.severity === 'high' ? 22 : 16, opacity: 0 }}
                                    transition={{
                                        duration:  ev.severity === 'critical' ? 1.6 : 2.2,
                                        repeat:    Infinity,
                                        ease:      'easeOut',
                                        delay:     ev.id * 0.13 % 2,
                                    }}
                                    fill={SEVERITY_COLOR[ev.severity]}
                                />
                                {/* Second ring for critical/high */}
                                {(ev.severity === 'critical' || ev.severity === 'high') && (
                                    <motion.circle
                                        initial={{ r: 3, opacity: 0.5 }}
                                        animate={{ r: ev.severity === 'critical' ? 18 : 13, opacity: 0 }}
                                        transition={{
                                            duration: ev.severity === 'critical' ? 1.2 : 1.6,
                                            repeat:   Infinity,
                                            ease:     'easeOut',
                                            delay:    0.5 + (ev.id * 0.13 % 2),
                                        }}
                                        fill={SEVERITY_COLOR[ev.severity]}
                                    />
                                )}
                                {/* Core dot — flashes on new arrival */}
                                <motion.circle
                                    r={ev.severity === 'critical' ? 5.5 : ev.severity === 'high' ? 4.5 : 3.5}
                                    fill={ev.id === newEventId ? '#ffffff' : SEVERITY_COLOR[ev.severity]}
                                    stroke="#0d1424"
                                    strokeWidth={1.5}
                                    animate={ev.id === newEventId ? { scale: [1, 1.8, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                />
                            </g>
                        </Marker>
                    ))}
                </ComposableMap>

                {/* Legend */}
                <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none flex items-end justify-between">
                    <div className="flex items-center gap-6">
                        {['critical','high','medium','low'].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLOR[s] }} />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{s}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                        PROJ: Equirectangular | GRID: 15° | THREATS: {filtered.length}
                    </div>
                </div>

                {/* Click tooltip */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 10 }}
                            className="absolute top-20 right-8 z-30 bg-slate-900/98 border border-white/10 rounded-2xl p-6 w-80 shadow-2xl backdrop-blur-2xl"
                        >
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors text-xs"
                            >✕</button>

                            {/* Severity bar */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest mb-4 ${SEVERITY_BADGE[selected.severity]}`}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEVERITY_COLOR[selected.severity] }} />
                                {selected.severity}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-lg font-black text-white font-heading">{selected.city}</div>
                                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5" />{selected.country}
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Attack Type',  value: selected.type           },
                                        { label: 'Source IP',    value: selected.ip              },
                                        { label: 'Packet Load',  value: selected.packets.toLocaleString() },
                                        { label: 'Status',       value: selected.blocked ? '🛡 Blocked' : '⚠ Active' },
                                    ].map(row => (
                                        <div key={row.label}>
                                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{row.label}</div>
                                            <div className={`text-[11px] font-bold font-mono ${
                                                row.label === 'Status'
                                                    ? selected.blocked ? 'text-emerald-400' : 'text-brand-red'
                                                    : 'text-slate-200'
                                            }`}>{row.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-[9px] text-slate-600 font-mono flex items-center gap-1.5 pt-1">
                                    <Activity className="w-2.5 h-2.5" />
                                    {timeAgo(selected.timestamp)}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom: Stats + Live Feed ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* KPI cards stacked */}
                <div className="space-y-4">
                    <StatCard icon={Shield}     label="Threats Blocked"    value={blocked24h.toLocaleString()} sub="Last 24 hours"   color="brand-cyan"   trend="↑" />
                    <StatCard icon={Eye}        label="Events Captured"    value={totalEvents}                 sub="This session"    color="brand-orange" />
                    <StatCard icon={TrendingUp} label="Regions Monitored"  value="194"                        sub="Countries live"  color="brand-cyan"   />
                    <StatCard icon={Zap}        label="Avg Response Time"  value="43ms"                       sub="AI interception" color="brand-orange" trend="⚡" />
                </div>

                {/* Live event feed */}
                <div className="xl:col-span-2 glass-panel p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-brand-red/10 rounded-xl border border-brand-red/20">
                                <AlertTriangle className="w-5 h-5 text-brand-red" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase italic tracking-tighter font-heading">Live Threat Feed</h2>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Auto-refreshing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ opacity: live ? [1, 0.2, 1] : 0.3 }}
                                transition={{ repeat: Infinity, duration: 1.0 }}
                                className="w-1.5 h-1.5 rounded-full bg-brand-red"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-red font-mono">
                                {live ? 'LIVE' : 'PAUSED'}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-y-auto custom-scrollbar flex-1" style={{ maxHeight: '340px' }}>
                        <table className="w-full text-[11px]">
                            <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-white/5">
                                    {['Severity','City / Country','Attack Type','Source IP','Pkts','Status','When'].map(h => (
                                        <th key={h} className="text-left text-[8px] font-black uppercase tracking-widest text-slate-600 pb-3 pr-6 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {filtered.map((ev) => (
                                        <motion.tr
                                            key={ev.id}
                                            layout
                                            initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(0,240,255,0.08)' }}
                                            animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.4 }}
                                            onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                                            className={`border-b border-white/[0.03] cursor-pointer transition-colors group ${
                                                selected?.id === ev.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <td className="py-3 pr-6">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${SEVERITY_BADGE[ev.severity]}`}>
                                                    {ev.severity}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-6">
                                                <div className="font-bold text-white group-hover:text-brand-cyan transition-colors text-[11px]">{ev.city}</div>
                                                <div className="text-[9px] text-slate-600">{ev.country}</div>
                                            </td>
                                            <td className="py-3 pr-6 text-slate-400 font-mono text-[10px] whitespace-nowrap">{ev.type}</td>
                                            <td className="py-3 pr-6 text-slate-600 font-mono text-[10px]">{ev.ip}</td>
                                            <td className="py-3 pr-6 text-slate-500 font-mono text-[10px]">{ev.packets.toLocaleString()}</td>
                                            <td className="py-3 pr-6">
                                                <span className={`text-[8px] font-black ${ev.blocked ? 'text-emerald-400' : 'text-brand-red'}`}>
                                                    {ev.blocked ? '🛡 Blocked' : '⚠ Active'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-700 font-mono text-[9px] whitespace-nowrap">
                                                {timeAgo(ev.timestamp)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-700">
                                <Globe className="w-10 h-10 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No threats match this filter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
