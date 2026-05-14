import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, House, Lock, Plus, RefreshCw,
  Search, ShieldAlert, ShieldCheck, Star, X, Globe,
  AlertTriangle, CheckCircle, Zap, ChevronDown,
  ExternalLink, Copy, Wifi, WifiOff, Eye, Bookmark,
} from "lucide-react";
import { useBrowser } from "../browser/BrowserContext";
import { useSecurity } from "../security/SecurityContext";

function TrustScoreBar({ score }) {
  if (score === null || score === undefined) return null;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="scan-bar w-16">
        <div className="scan-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold mono shrink-0" style={{ color }}>{score}</span>
    </div>
  );
}

function TabItem({ tab, isActive, onActivate, onClose, canClose }) {
  const isSafe = tab.secure;
  return (
    <button
      onClick={onActivate}
      className={`tab-item ${isActive ? "tab-active" : ""}`}
      title={tab.title}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${isSafe ? "bg-emerald-400" : "bg-amber-400"}`} />
      <span className="flex-1 text-left truncate text-xs">{tab.title || "New Tab"}</span>
      {canClose && (
        <span
          className="opacity-40 hover:opacity-100 hover:text-rose-400 transition-all shrink-0 p-0.5 rounded"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X size={10} />
        </span>
      )}
    </button>
  );
}

function SecurityBadge({ scan }) {
  if (!scan) return (
    <div className="security-chip warning">
      <Zap size={11} />
      <span>Scanning…</span>
    </div>
  );
  if (scan.level === "danger") return (
    <div className="security-chip risky animate-threat">
      <ShieldAlert size={11} />
      <span>Blocked</span>
    </div>
  );
  if (scan.level === "warning") return (
    <div className="security-chip warning">
      <AlertTriangle size={11} />
      <span>Risky</span>
    </div>
  );
  return (
    <div className="security-chip secure">
      <Lock size={11} />
      <span>Secure</span>
    </div>
  );
}

function BrowserHomePage() {
  const { navigate, bookmarks } = useBrowser();
  const { registerThreat, stats, shieldEnabled } = useSecurity();
  const [searchValue, setSearchValue] = useState("");

  const quickLinks = [
    { label: "Google",    url: "https://google.com",    icon: "🔍" },
    { label: "GitHub",    url: "https://github.com",    icon: "💻" },
    { label: "Wikipedia", url: "https://wikipedia.org", icon: "📚" },
    { label: "YouTube",   url: "https://youtube.com",   icon: "▶️" },
    { label: "Reddit",    url: "https://reddit.com",    icon: "🔴" },
    { label: "LinkedIn",  url: "https://linkedin.com",  icon: "💼" },
  ];

  const handleSearch = async (url) => {
    const scan = await navigate(url || searchValue);
    registerThreat(scan);
  };

  return (
    <div className="flex flex-col items-center h-full gap-8 py-12 px-6 overflow-y-auto panel-scroll">
      {/* Hero / Search Section */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 animate-slide-up">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center animate-float"
            style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(34,211,238,0.3)", boxShadow: "0 0 50px rgba(34,211,238,0.12)" }}>
            <ShieldCheck size={28} className="text-cyan-300 shield-glow" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black gradient-text-cyan tracking-tight">SecureVision Browser</h2>
          </div>
        </div>

        <div className="w-full relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-12 pr-16 py-4 rounded-3xl text-sm outline-none transition-all focus:scale-[1.01]"
            placeholder="Search securely or type a URL…"
            style={{
              background: "rgba(8,16,40,0.6)",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              color: "#e2eaff",
              backdropFilter: "blur(12px)"
            }}
          />
          <button onClick={() => handleSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 rounded-2xl text-xs font-bold">
            Go
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        
        {/* Quick Links Widget */}
        <div className="glass-card rounded-3xl p-5 md:col-span-2" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
          <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Star size={14} className="text-violet-400" /> Quick Launch
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map(({ label, url, icon }) => (
              <button key={label}
                onClick={() => handleSearch(url)}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-sm transition-all hover:scale-[1.05] hover:bg-white/[0.05]"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", color: "#cbd5e1" }}>
                <span className="text-2xl">{icon}</span>
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security Shield Status Widget */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden" 
             style={{ border: shieldEnabled ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(244,63,94,0.3)" }}>
          <div className="absolute -right-6 -top-6 opacity-10">
            {shieldEnabled ? <ShieldCheck size={120} /> : <ShieldAlert size={120} />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-2 uppercase tracking-wider">
              <Zap size={14} className={shieldEnabled ? "text-emerald-400" : "text-rose-400"} /> 
              Edge Defense
            </h3>
            <p className="text-[10px] text-slate-500">Real-time AI scanning</p>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black mb-1" style={{ color: shieldEnabled ? "#34d399" : "#f87171" }}>
              {shieldEnabled ? "ACTIVE" : "PAUSED"}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold mt-2 px-3 py-1.5 rounded-xl w-fit"
                 style={{ background: shieldEnabled ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)", color: shieldEnabled ? "#a7f3d0" : "#fecdd3" }}>
              <span className={`pulse-dot ${shieldEnabled ? "green" : "red"}`} />
              {shieldEnabled ? "Zero-Trust ON" : "Protection Disabled"}
            </div>
          </div>
        </div>

        {/* Privacy Metrics Widget */}
        <div className="glass-card rounded-3xl p-5" style={{ border: "1px solid rgba(34,211,238,0.2)" }}>
          <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Eye size={14} className="text-cyan-400" /> Privacy Insights
          </h3>
          <div className="flex items-end gap-3 mb-3">
            <p className="text-4xl font-black text-cyan-300 leading-none">{stats.privacyTrackers}</p>
            <p className="text-[10px] text-slate-400 font-medium pb-1">Trackers Blocked</p>
          </div>
          <div className="scan-bar w-full h-1.5 mt-4">
            <div className="scan-bar-fill" style={{ width: "76%", background: "linear-gradient(90deg, #0891b2, #22d3ee)" }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-right">Top offender: doubleclick.net</p>
        </div>

        {/* Recent Bookmarks Widget */}
        <div className="glass-card rounded-3xl p-5 md:col-span-2" style={{ border: "1px solid rgba(245,158,11,0.2)" }}>
          <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Bookmark size={14} className="text-amber-400" /> Recent Bookmarks
          </h3>
          <div className="flex flex-col gap-2">
            {bookmarks.slice(0, 3).map((bm) => (
              <div key={bm.id} onClick={() => handleSearch(bm.url)}
                   className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors"
                   style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)", color: "#fcd34d" }}>
                  <Globe size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{bm.title || bm.url}</p>
                  <p className="text-[10px] text-slate-500 truncate">{bm.url}</p>
                </div>
              </div>
            ))}
            {bookmarks.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No bookmarks yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BrowserPage() {
  const { tabs, activeTab, activeTabId, activateTab, newTab, closeTab, navigate, goBack, goForward, reload, goHome, addBookmark } = useBrowser();
  const { registerThreat, currentScan } = useSecurity();
  const viewContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState(activeTab?.url ?? "");
  const [scanning, setScanning] = useState(false);
  const [showThreatDetails, setShowThreatDetails] = useState(false);

  const isHome = activeTab?.url === "securevision://home" || !activeTab?.url;

  // Sync address bar with active tab
  useEffect(() => {
    if (activeTab?.url) setValue(activeTab.url);
  }, [activeTab?.url, activeTabId]);

  // BrowserView bounds management
  useEffect(() => {
    const node = viewContainerRef.current;
    if (!node || !window.secureVisionNative?.browser || isHome) return;

    const updateBounds = () => {
      const rect = node.getBoundingClientRect();
      window.secureVisionNative.browser.setBounds({
        x: Math.round(rect.left), y: Math.round(rect.top),
        width: Math.round(rect.width), height: Math.round(rect.height), visible: true,
      });
    };
    updateBounds();
    const ro = new ResizeObserver(updateBounds);
    ro.observe(node);
    window.addEventListener("resize", updateBounds);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.secureVisionNative.browser.setBounds({ x: 0, y: 0, width: 100, height: 100, visible: false });
    };
  }, [isHome, activeTabId]);

  const handleNavigate = async (url) => {
    const target = url ?? value;
    if (!target.trim()) return;
    setScanning(true);
    try {
      const scan = await navigate(target);
      registerThreat(scan);
    } finally {
      setScanning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNavigate();
    if (e.key === "Escape" && inputRef.current) {
      inputRef.current.blur();
      setValue(activeTab?.url ?? "");
    }
  };

  const copyUrl = () => { navigator.clipboard?.writeText(activeTab?.url || ""); };

  return (
    <div className="flex flex-col gap-3 h-full animate-fade-in">
      {/* ── Tab Strip ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onActivate={() => activateTab(tab.id)}
            onClose={() => closeTab(tab.id)}
            canClose={tabs.length > 1}
          />
        ))}
        <button onClick={newTab}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all hover:text-cyan-300"
          style={{ background: "rgba(8,16,40,0.7)", border: "1px solid rgba(34,211,238,0.15)", color: "#64748b" }}>
          <Plus size={13} />
        </button>
      </div>

      {/* ── Chrome / Toolbar ── */}
      <div className="glass-card rounded-2xl px-3 py-2.5 neon-cyan">
        <div className="flex items-center gap-2">
          {/* Nav Buttons */}
          <button onClick={goBack} className="toolbar-btn"><ArrowLeft size={14} /></button>
          <button onClick={goForward} className="toolbar-btn"><ArrowRight size={14} /></button>
          <button onClick={reload} className="toolbar-btn">
            <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
          </button>
          <button onClick={async () => { const s = await goHome(); registerThreat(s); }} className="toolbar-btn">
            <House size={14} />
          </button>

          {/* Security Badge */}
          <SecurityBadge scan={currentScan} />

          {/* Address Bar */}
          <div className="address-bar flex-1">
            {activeTab?.secure
              ? <Lock size={12} className="text-emerald-400 shrink-0" />
              : <WifiOff size={12} className="text-amber-400 shrink-0" />
            }
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.target.select()}
              placeholder="Search or enter URL…"
              spellCheck={false}
            />
            {scanning && (
              <div className="w-3 h-3 rounded-full border border-cyan-400 border-t-transparent animate-spin shrink-0" />
            )}
          </div>

          {/* Right Actions */}
          <button onClick={copyUrl} className="toolbar-btn" title="Copy URL"><Copy size={13} /></button>
          <button onClick={addBookmark} className="toolbar-btn" title="Bookmark">
            <Star size={13} className="text-amber-400" />
          </button>
          <button onClick={() => setShowThreatDetails((p) => !p)} className="toolbar-btn" title="Trust Details">
            <ChevronDown size={13} className={`transition-transform ${showThreatDetails ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* ── Threat Detail Drawer ── */}
        {showThreatDetails && currentScan && (
          <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: "1px solid rgba(34,211,238,0.1)" }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Trust Score",   value: `${currentScan.trust}/100`,    color: currentScan.trust >= 75 ? "#10b981" : currentScan.trust >= 50 ? "#f59e0b" : "#f43f5e" },
                { label: "Phishing Risk", value: `${currentScan.phishing}%`,    color: currentScan.phishing > 50 ? "#f43f5e" : "#10b981" },
                { label: "Malware Risk",  value: `${currentScan.malware}%`,     color: currentScan.malware > 50 ? "#f43f5e" : "#10b981" },
                { label: "Trackers",      value: `${currentScan.privacyTrackers} found`, color: "#f59e0b" },
              ].map(({ label, value: v, color }) => (
                <div key={label} className="rounded-xl px-3 py-2"
                  style={{ background: "rgba(4,8,20,0.8)", border: `1px solid ${color}25` }}>
                  <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-bold mono" style={{ color }}>{v}</p>
                </div>
              ))}
            </div>
            {currentScan.recommendations?.length > 0 && (
              <div className="mt-2 space-y-1">
                {currentScan.recommendations.map((r, i) => (
                  <p key={i} className="text-[11px] text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                    {r}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Browser Viewport ── */}
      <div className="flex-1 glass-card rounded-2xl overflow-hidden relative browser-frame"
        style={{ minHeight: 480, border: "1px solid rgba(34,211,238,0.1)" }}>

        {/* AI Shield indicator */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", backdropFilter: "blur(10px)" }}>
          <ShieldCheck size={10} />
          SecureVision Shield Active
        </div>

        {/* Scan progress line */}
        {scanning && <div className="scan-line" />}

        {/* Home Page / BrowserView slot */}
        {isHome
          ? <BrowserHomePage />
          : (
            <div ref={viewContainerRef} className="absolute inset-0"
              style={{ background: "rgba(3,5,12,0.6)" }}>
              {/* BrowserView renders here via Electron - this div acts as a transparent placeholder */}
              <div className="browser-frame-placeholder">
                <Globe size={36} className="text-slate-700 animate-float" />
                <p className="text-sm text-slate-600">Loading page…</p>
                <p className="text-xs text-slate-700 mono">{activeTab?.url}</p>
              </div>
            </div>
          )
        }
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-2 text-[10px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <Globe size={9} />
          {activeTab?.url ? new URL(activeTab.url.startsWith("http") ? activeTab.url : "https://home").hostname : "SecureVision Home"}
        </span>
        <span className="flex items-center gap-1.5">
          {currentScan ? (
            <>
              <CheckCircle size={9} className="text-emerald-500" />
              AI scan complete · {currentScan.inferenceMs}ms
            </>
          ) : (
            <><Zap size={9} className="text-cyan-600" /> Ready</>
          )}
        </span>
      </div>
    </div>
  );
}
