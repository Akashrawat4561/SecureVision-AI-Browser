import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Shield, LayoutDashboard, Globe, ScanFace, Bookmark,
  History, Download, Settings, Sparkles, ChevronLeft,
  ChevronRight, Bell, X, AlertTriangle, CheckCircle,
  Info, Zap, Activity,
} from "lucide-react";
import { useSecurity } from "../security/SecurityContext";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { to: "/browser",   label: "Browser",   icon: Globe,           badge: null },
  { to: "/deepfake",  label: "Deepfake",  icon: ScanFace,        badge: "AI" },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark,        badge: null },
  { to: "/history",   label: "History",   icon: History,         badge: null },
  { to: "/downloads", label: "Downloads", icon: Download,        badge: null },
  { to: "/settings",  label: "Settings",  icon: Settings,        badge: null },
];

function AlertIcon({ level }) {
  if (level === "danger") return <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />;
  if (level === "warning") return <Zap size={13} className="text-amber-400 shrink-0 mt-0.5" />;
  return <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />;
}

export default function AppLayout() {
  const { alerts, stats, shieldEnabled, dismissAlert, dismissAllAlerts } = useSecurity();
  const [collapsed, setCollapsed] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="glass flex flex-col shrink-0 transition-all duration-300 relative"
        style={{
          width: collapsed ? 64 : 220,
          borderRight: "1px solid rgba(34,211,238,0.1)",
          background: "linear-gradient(180deg, rgba(6,12,28,0.98) 0%, rgba(3,7,18,0.99) 100%)",
        }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-3 py-4 border-b`}
          style={{ borderColor: "rgba(34,211,238,0.1)" }}>
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(34,211,238,0.35)" }}>
              <Shield size={18} className="text-cyan-300 shield-glow" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: "var(--bg-deep)" }} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-400 leading-none">SecureVision</p>
              <p className="text-sm font-bold text-slate-100 leading-snug">AI Browser</p>
            </div>
          )}
        </div>

        {/* AI Status Badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 rounded-xl px-3 py-2 text-[11px] font-medium"
            style={{ background: shieldEnabled ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", border: `1px solid ${shieldEnabled ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}` }}>
            <div className="flex items-center gap-2">
              <span className={`pulse-dot ${shieldEnabled ? "green" : "red"}`} />
              <span className={shieldEnabled ? "text-emerald-300" : "text-rose-300"}>
                {shieldEnabled ? "Shield Active" : "Shield Paused"}
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto panel-scroll">
          {NAV_LINKS.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(139,92,246,0.25)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom stats */}
        {!collapsed && (
          <div className="px-3 pb-3 space-y-2">
            <div className="divider" />
            <div className="rounded-xl px-3 py-2 space-y-1"
              style={{ background: "rgba(8,16,40,0.6)", border: "1px solid rgba(34,211,238,0.1)" }}>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Threats blocked</span>
                <span className="text-rose-300 font-bold mono">{stats.threatsBlocked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Trackers stopped</span>
                <span className="text-cyan-300 font-bold mono">{stats.privacyTrackers.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-[10px] text-center text-slate-600">SecureVision v2.1.0 • Edge AI</div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
          style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 flex items-center justify-between px-5 py-2.5"
          style={{ borderBottom: "1px solid rgba(34,211,238,0.08)", background: "rgba(4,8,20,0.95)" }}>
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-medium">SecureVision Browser Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
              <Sparkles size={11} />
              ONNX / TFLite Ready
            </div>
            {/* Alert Bell */}
            <button onClick={() => setShowAlerts((p) => !p)}
              className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: alerts.length ? "rgba(244,63,94,0.12)" : "rgba(15,23,42,0.8)", border: `1px solid ${alerts.length ? "rgba(244,63,94,0.3)" : "rgba(100,116,139,0.25)"}` }}>
              <Bell size={14} className={alerts.length ? "text-rose-400" : "text-slate-400"} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#f43f5e", color: "white" }}>
                  {alerts.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto panel-scroll p-4 relative">
          <Outlet />
        </main>
      </div>

      {/* ── Alert Sidebar Panel ── */}
      {showAlerts && (
        <div className="w-80 shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid rgba(34,211,238,0.1)", background: "rgba(4,8,20,0.97)" }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(34,211,238,0.1)" }}>
            <p className="text-sm font-semibold text-slate-200">Security Alerts</p>
            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <button onClick={dismissAllAlerts}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={() => setShowAlerts(false)} className="text-slate-500 hover:text-slate-300">
                <X size={15} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-2">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <CheckCircle size={28} className="text-emerald-400 opacity-50" />
                <p className="text-sm text-slate-500">No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id}
                  className={`threat-alert ${alert.level} animate-fade-in`}>
                  <div className="flex items-start gap-2 mb-1">
                    <AlertIcon level={alert.level} />
                    <p className="text-xs font-semibold flex-1 leading-tight"
                      style={{ color: alert.level === "danger" ? "#fda4af" : alert.level === "warning" ? "#fcd34d" : "#6ee7b7" }}>
                      {alert.title}
                    </p>
                    <button onClick={() => dismissAlert(alert.id)}
                      className="text-slate-500 hover:text-slate-300 shrink-0">
                      <X size={11} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed ml-5">{alert.message}</p>
                  {alert.recommendations?.length > 0 && (
                    <div className="mt-2 ml-5 space-y-1">
                      {alert.recommendations.slice(0, 2).map((r, i) => (
                        <p key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                          <Info size={9} className="mt-0.5 shrink-0 text-slate-500" />
                          {r}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Toast Alerts (floating) ── */}
      <div className="fixed bottom-4 right-4 w-72 space-y-2 z-50 pointer-events-none">
        {alerts.slice(0, 1).map((a) => (
          <div key={a.id}
            className={`threat-alert ${a.level} pointer-events-auto`}
            style={{ opacity: showAlerts ? 0 : 1, transition: "opacity 0.3s" }}>
            <div className="flex items-start gap-2">
              <AlertIcon level={a.level} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight truncate"
                  style={{ color: a.level === "danger" ? "#fda4af" : a.level === "warning" ? "#fcd34d" : "#6ee7b7" }}>
                  {a.title}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed line-clamp-2">{a.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
