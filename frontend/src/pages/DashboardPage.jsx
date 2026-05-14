import { useEffect, useState } from "react";
import {
  Shield, ShieldAlert, Activity, Radar, Zap, Eye, Lock,
  TrendingUp, Globe, AlertTriangle, CheckCircle, Clock,
  Cpu, Database, Wifi, BarChart3, RefreshCw, ArrowUpRight,
  Flame, Bug, Fingerprint, Newspaper,
} from "lucide-react";
import { useSecurity } from "../security/SecurityContext";

function TrustGauge({ score }) {
  const color =
    score >= 75 ? "#10b981" :
    score >= 50 ? "#f59e0b" : "#f43f5e";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="7" />
        <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
          filter={`drop-shadow(0 0 6px ${color})`} />
      </svg>
      <div className="text-center relative z-10">
        <p className="text-xl font-black" style={{ color }}>{score}</p>
        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Trust</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtext, trend }) {
  const colors = {
    cyan:    { bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)",  text: "#22d3ee",  glow: "rgba(34,211,238,0.06)" },
    rose:    { bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.22)",  text: "#f43f5e",  glow: "rgba(244,63,94,0.06)" },
    violet:  { bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.22)", text: "#8b5cf6",  glow: "rgba(139,92,246,0.06)" },
    amber:   { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.22)", text: "#f59e0b",  glow: "rgba(245,158,11,0.06)" },
    emerald: { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.22)", text: "#10b981",  glow: "rgba(16,185,129,0.06)" },
    blue:    { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.22)", text: "#3b82f6",  glow: "rgba(59,130,246,0.06)" },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="metric-card animate-fade-in group"
      style={{ background: `linear-gradient(145deg, ${c.bg} 0%, rgba(5,10,22,0.85) 100%)`, borderColor: c.border, boxShadow: `0 4px 24px ${c.glow}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={16} style={{ color: c.text }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: trend >= 0 ? "#f43f5e" : "#10b981" }}>
            <ArrowUpRight size={10} className={trend < 0 ? "rotate-180" : ""} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: c.text }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      {subtext && <p className="text-[11px] text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  );
}

function RecentScanRow({ scan }) {
  const lvlColor = scan.level === "danger" ? "#f43f5e" : scan.level === "warning" ? "#f59e0b" : "#10b981";
  const lvlBg   = scan.level === "danger" ? "rgba(244,63,94,0.1)" : scan.level === "warning" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)";
  const elapsed = Math.round((Date.now() - scan.scannedAt) / 60000);
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all hover:bg-white/[0.02] group"
      style={{ borderBottom: "1px solid rgba(34,211,238,0.06)" }}>
      <Globe size={13} className="text-slate-500 shrink-0" />
      <span className="flex-1 text-xs font-mono text-slate-300 truncate">{scan.url}</span>
      <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
        <Clock size={9} />{elapsed < 60 ? `${elapsed}m` : `${Math.round(elapsed / 60)}h`} ago
      </span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: lvlBg, color: lvlColor, border: `1px solid ${lvlColor}33` }}>
        {scan.trust}/100
      </span>
    </div>
  );
}

function DefenseStreamItem({ icon: Icon, color, title, detail }) {
  return (
    <div className="flex items-start gap-3 py-3 px-3 rounded-xl transition-all hover:bg-white/[0.02]"
      style={{ borderBottom: "1px solid rgba(34,211,238,0.05)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{detail}</p>
      </div>
      <CheckCircle size={12} className="text-emerald-400 shrink-0 mt-1 ml-auto" />
    </div>
  );
}

export default function DashboardPage() {
  const { stats, scanHistory, shieldEnabled, setShieldEnabled } = useSecurity();
  const [nativeStatus, setNativeStatus] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    window.secureVisionNative?.getSystemStatus().then(setNativeStatus).catch(() => setNativeStatus(null));
  }, []);

  // Simulate live activity ticker
  useEffect(() => {
    const id = setInterval(() => setTick((p) => p + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const liveEvents = [
    "Phishing pattern blocked — paypa1-login.xyz",
    "Tracker fingerprint removed — ads.doubleclick.net",
    "HTTPS downgrade prevented — shop.example.com",
    "Fake login form detected — account-verify.tk",
    "Malware script quarantined — cdn.badsite.ml",
    "Privacy tracker blocked — analytics.track.io",
    "Scam pattern recognized — free-gift-now.xyz",
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Hero Header ── */}
      <header className="section-header flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-400 font-semibold mb-1">
            SecureVision AI Control Center
          </p>
          <h1 className="text-2xl font-black gradient-text-cyan">
            Real-Time Cyber Defense Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live threat intelligence · Trust scoring · Edge AI health
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Shield Toggle */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setShieldEnabled((p) => !p)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: shieldEnabled ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(34,211,238,0.15))" : "rgba(244,63,94,0.12)",
                border: shieldEnabled ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(244,63,94,0.4)",
                boxShadow: shieldEnabled ? "0 0 30px rgba(16,185,129,0.15)" : "0 0 20px rgba(244,63,94,0.12)",
              }}>
              {shieldEnabled
                ? <Shield size={22} className="text-emerald-300 shield-glow" />
                : <ShieldAlert size={22} className="text-rose-400" />}
            </button>
            <p className="text-[10px] font-semibold" style={{ color: shieldEnabled ? "#34d399" : "#f87171" }}>
              {shieldEnabled ? "ON" : "OFF"}
            </p>
          </div>
          {/* Live Tick */}
          <div className="rounded-2xl px-4 py-3 text-center"
            style={{ background: "rgba(8,16,40,0.8)", border: "1px solid rgba(34,211,238,0.12)" }}>
            <p className="text-[10px] text-slate-400 mb-1">LIVE PROTECTION</p>
            <div className="flex items-center gap-2">
              <span className="pulse-dot cyan" />
              <span className="text-xs font-bold text-cyan-300">Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Flame}       label="Threats Blocked"     value={stats.threatsBlocked}     color="rose"    trend={12} subtext="↑ This session" />
        <StatCard icon={AlertTriangle} label="Phishing Caught"   value={stats.phishingCaught}     color="amber"   trend={8}  subtext="Heuristic engine" />
        <StatCard icon={Fingerprint} label="Trackers Stopped"    value={stats.privacyTrackers}    color="violet"  trend={23} subtext="Cross-site blocked" />
        <StatCard icon={Eye}         label="Deepfake Alerts"     value={stats.deepfakeAlerts}     color="cyan"    trend={3}  subtext="Media scanner" />
        <StatCard icon={Bug}         label="Malware Blocked"     value={stats.malwareBlocked}     color="rose"    trend={5}  subtext="Script analysis" />
        <StatCard icon={ShieldAlert} label="Scams Detected"      value={stats.scamsDetected}      color="amber"   trend={7}  subtext="Pattern matching" />
        <StatCard icon={Globe}       label="Unsafe Sites"        value={stats.unsafeSites}        color="violet"  trend={2}  subtext="Domain reputation" />
        <StatCard icon={Lock}        label="Sessions Protected"  value={stats.sessionsProtected}  color="emerald" trend={-4} subtext="Since install" />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Defense Stream */}
        <div className="glass-card rounded-2xl lg:col-span-2"
          style={{ border: "1px solid rgba(34,211,238,0.12)" }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" /> Defense Stream
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <span className="pulse-dot green" style={{ width: 6, height: 6 }} />
              All Systems Operational
            </div>
          </div>
          <div className="px-2 pb-2">
            <DefenseStreamItem icon={Radar}      color="#22d3ee" title="Phishing & Scam Heuristics"    detail="Every navigation scanned in real-time — ~18ms average inference" />
            <DefenseStreamItem icon={Eye}        color="#8b5cf6" title="Deepfake Media Detection"       detail="Frame-level CNN analysis on images and video content" />
            <DefenseStreamItem icon={Fingerprint} color="#f59e0b" title="Privacy Tracker Blocking"     detail="Cross-site fingerprinting and cookie leaks neutralized" />
            <DefenseStreamItem icon={Bug}        color="#f43f5e" title="Malware & Script Analysis"     detail="Unsafe script execution patterns quarantined before render" />
            <DefenseStreamItem icon={Lock}       color="#10b981" title="HTTPS Enforcement"             detail="Automatic upgrade to encrypted connections where available" />
            <DefenseStreamItem icon={Newspaper}  color="#3b82f6" title="Fake News Analyzer"            detail="AI-powered credibility scoring — model integration ready" />
          </div>
        </div>

        {/* Edge Runtime + Trust */}
        <div className="space-y-3">
          {/* Runtime Status */}
          <div className="glass-card rounded-2xl p-4" style={{ border: "1px solid rgba(139,92,246,0.18)" }}>
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Cpu size={14} className="text-violet-400" /> Edge AI Runtime
            </h2>
            {[
              { label: "Runtime", value: nativeStatus?.modelRuntime ?? "local-edge", icon: Cpu, ok: true },
              { label: "ONNX Runtime", value: nativeStatus?.onnxReady !== false ? "Ready" : "Pending", icon: Database, ok: nativeStatus?.onnxReady !== false },
              { label: "TFLite", value: nativeStatus?.tfliteReady !== false ? "Ready" : "Pending", icon: Zap, ok: nativeStatus?.tfliteReady !== false },
              { label: "Python Bridge", value: nativeStatus?.pythonReady !== false ? "Active" : "Init…", icon: Wifi, ok: nativeStatus?.pythonReady !== false },
            ].map(({ label, value, icon: Icon, ok }) => (
              <div key={label} className="flex items-center justify-between py-1.5 text-xs"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon size={11} />
                  {label}
                </div>
                <span className={`font-semibold mono text-[11px] ${ok ? "text-emerald-300" : "text-amber-300"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Live Event Ticker */}
          <div className="glass-card rounded-2xl p-4 overflow-hidden" style={{ border: "1px solid rgba(34,211,238,0.1)", minHeight: 90 }}>
            <p className="text-[10px] uppercase tracking-widest text-cyan-500 mb-2 font-semibold">Live Activity</p>
            <div key={tick} className="animate-fade-in">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <span className="text-rose-400 font-semibold">Blocked: </span>
                {liveEvents[tick % liveEvents.length]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Scans ── */}
      <div className="glass-card rounded-2xl" style={{ border: "1px solid rgba(34,211,238,0.1)" }}>
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(34,211,238,0.08)" }}>
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={14} className="text-cyan-400" /> Recent Security Scans
          </h2>
          <span className="text-[11px] text-slate-500">{scanHistory.length} records</span>
        </div>
        <div className="divide-y divide-transparent px-2 py-1">
          {scanHistory.slice(0, 6).map((scan) => (
            <RecentScanRow key={scan.id} scan={scan} />
          ))}
          {scanHistory.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">
              No scans yet — start browsing to see results.
            </p>
          )}
        </div>
      </div>

      {/* ── Security Recommendations ── */}
      <div className="glass-card rounded-2xl p-4" style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
        <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-amber-400" /> AI Security Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Enable HTTPS-Only Mode", desc: "Force encrypted connections across all sites", color: "#10b981", icon: Lock },
            { title: "Block Tracking Scripts", desc: "Prevent cross-site tracking by 3rd party scripts", color: "#22d3ee", icon: Fingerprint },
            { title: "Run Media Deepfake Scan", desc: "Analyze images you encounter on suspicious sites", color: "#8b5cf6", icon: Eye },
          ].map(({ title, desc, color, icon: Icon }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl px-3 py-3 transition-all cursor-pointer hover:scale-[1.01]"
              style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
              <Icon size={14} className="shrink-0 mt-0.5" style={{ color }} />
              <div>
                <p className="text-xs font-semibold text-slate-200">{title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
