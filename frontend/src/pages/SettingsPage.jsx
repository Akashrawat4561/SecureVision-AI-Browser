import { useState } from "react";
import {
  Shield, Eye, Fingerprint, Bug, Lock, Globe, Newspaper,
  Cpu, Zap, Bell, Trash2, Download, ChevronRight, Info,
  ShieldCheck, Volume2, Palette, Database,
} from "lucide-react";
import { useSecurity } from "../security/SecurityContext";

function ToggleRow({ icon: Icon, color, label, description, settingKey, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all hover:bg-white/[0.02] group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <label className="toggle-switch shrink-0">
        <input type="checkbox" checked={value} onChange={(e) => onChange(settingKey, e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function SettingsSection({ title, icon: Icon, color, children }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}18` }}>
      <div className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: `1px solid ${color}12`, background: `${color}06` }}>
        <Icon size={14} style={{ color }} />
        <h2 className="text-sm font-bold text-slate-200">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSetting, shieldEnabled, setShieldEnabled } = useSecurity();
  const [theme, setTheme] = useState("dark-neon");
  const [searchEngine, setSearchEngine] = useState("duckduckgo");
  const [clearConfirm, setClearConfirm] = useState(false);

  const themeOptions = ["dark-neon", "midnight-blue", "cyber-violet", "deep-space"];
  const searchEngines = [
    { value: "duckduckgo", label: "DuckDuckGo (Privacy)" },
    { value: "google",     label: "Google" },
    { value: "brave",      label: "Brave Search" },
    { value: "startpage",  label: "Startpage" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Header ── */}
      <header className="section-header">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-400 font-semibold mb-1">
          Configuration
        </p>
        <h1 className="text-2xl font-black gradient-text-cyan">SecureVision Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Customize AI protection, privacy, and browser behavior</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left Column ── */}
        <div className="space-y-4">
          {/* Master Shield */}
          <div className="glass-card rounded-2xl p-4"
            style={{ border: shieldEnabled ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(244,63,94,0.3)",
              background: shieldEnabled ? "rgba(16,185,129,0.04)" : "rgba(244,63,94,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: shieldEnabled ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.12)",
                  border: `1px solid ${shieldEnabled ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.35)"}` }}>
                <Shield size={20} style={{ color: shieldEnabled ? "#10b981" : "#f43f5e" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-200">SecureVision Shield</p>
                <p className="text-[11px] text-slate-500">Master AI protection toggle</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={shieldEnabled} onChange={(e) => setShieldEnabled(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className={`mt-3 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 ${shieldEnabled ? "text-emerald-300" : "text-rose-300"}`}
              style={{ background: shieldEnabled ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)" }}>
              <span className={`pulse-dot ${shieldEnabled ? "green" : "red"}`} style={{ width: 6, height: 6 }} />
              {shieldEnabled ? "All AI protection modules active and scanning" : "WARNING: Protection disabled — browsing unprotected"}
            </div>
          </div>

          {/* AI Protection */}
          <SettingsSection title="AI Protection Modules" icon={Shield} color="#22d3ee">
            <ToggleRow icon={Shield}      color="#22d3ee" label="Phishing Shield"
              description="Real-time heuristic scanning for phishing and fake login forms"
              settingKey="phishingShield"    value={settings.phishingShield}    onChange={updateSetting} />
            <ToggleRow icon={Eye}         color="#8b5cf6" label="Deepfake Real-Time Detection"
              description="Analyze images and videos for synthetic media artifacts"
              settingKey="deepfakeRealtime"  value={settings.deepfakeRealtime}  onChange={updateSetting} />
            <ToggleRow icon={Bug}         color="#f43f5e" label="Malware Scanner"
              description="Block dangerous script execution and drive-by downloads"
              settingKey="malwareScanner"    value={settings.malwareScanner}    onChange={updateSetting} />
            <ToggleRow icon={Newspaper}   color="#3b82f6" label="Fake News Analyzer"
              description="AI credibility scoring for news articles (model integration ready)"
              settingKey="fakeNewsAnalyzer"  value={settings.fakeNewsAnalyzer}  onChange={updateSetting} />
            <ToggleRow icon={Zap}         color="#f59e0b" label="AI Browsing Assistant"
              description="Contextual AI suggestions and site summaries"
              settingKey="aiAssistant"       value={settings.aiAssistant}       onChange={updateSetting} />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Privacy & Tracking" icon={Fingerprint} color="#8b5cf6">
            <ToggleRow icon={Fingerprint} color="#8b5cf6" label="Tracker Blocker"
              description="Block cross-site tracking cookies and analytics scripts"
              settingKey="trackerBlocker"    value={settings.trackerBlocker}    onChange={updateSetting} />
            <ToggleRow icon={Fingerprint} color="#a78bfa" label="Fingerprint Protection"
              description="Randomize browser fingerprint to prevent device identification"
              settingKey="fingerprintProtection" value={settings.fingerprintProtection} onChange={updateSetting} />
            <ToggleRow icon={Database}    color="#6366f1" label="Cookie Manager"
              description="Auto-block third-party cookies and manage site permissions"
              settingKey="cookieManager"     value={settings.cookieManager}     onChange={updateSetting} />
          </SettingsSection>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">
          {/* Security */}
          <SettingsSection title="Security Rules" icon={Lock} color="#10b981">
            <ToggleRow icon={Lock}        color="#10b981" label="HTTPS-Only Mode"
              description="Automatically enforce encrypted connections, block HTTP sites"
              settingKey="httpsOnly"         value={settings.httpsOnly}         onChange={updateSetting} />
            <ToggleRow icon={Globe}       color="#f43f5e" label="Script Blocker"
              description="Block all third-party JavaScript by default (may break some sites)"
              settingKey="scriptBlocker"     value={settings.scriptBlocker}     onChange={updateSetting} />
          </SettingsSection>

          {/* Browser Preferences */}
          <SettingsSection title="Browser Preferences" icon={Globe} color="#3b82f6">
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Default Search Engine</label>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
                className="input-field text-sm"
              >
                {searchEngines.map(({ value, label }) => (
                  <option key={value} value={value} style={{ background: "#0a1628" }}>{label}</option>
                ))}
              </select>
            </div>
            <div className="px-4 py-3">
              <label className="text-xs font-semibold text-slate-400 block mb-2">Interface Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((t) => (
                  <button key={t}
                    onClick={() => setTheme(t)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: theme === t ? "rgba(34,211,238,0.15)" : "rgba(8,16,40,0.7)",
                      border: theme === t ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(100,116,139,0.2)",
                      color: theme === t ? "#a5f3fc" : "#94a3b8",
                    }}>
                    {t.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications & Alerts" icon={Bell} color="#f59e0b">
            <div className="px-4 py-3 space-y-2">
              {[
                { label: "Threat Alerts",      desc: "Pop-up when danger is detected",      active: true },
                { label: "Scan Summaries",     desc: "Show result after each site visit",   active: false },
                { label: "Privacy Reports",    desc: "Weekly tracker & privacy digest",     active: true },
                { label: "Deepfake Warnings",  desc: "Alert when deepfake media is found",  active: true },
              ].map(({ label, desc, active: a }) => (
                <div key={label} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{label}</p>
                    <p className="text-[10px] text-slate-600">{desc}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a ? "text-emerald-300" : "text-slate-600"}`}
                    style={{ background: a ? "rgba(16,185,129,0.1)" : "rgba(30,41,59,0.5)", border: `1px solid ${a ? "rgba(16,185,129,0.25)" : "rgba(100,116,139,0.2)"}` }}>
                    {a ? "ON" : "OFF"}
                  </span>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="glass-card rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(244,63,94,0.2)" }}>
            <div className="flex items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(244,63,94,0.12)", background: "rgba(244,63,94,0.04)" }}>
              <Trash2 size={14} className="text-rose-400" />
              <h2 className="text-sm font-bold text-rose-300">Data Management</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Clear Browsing History",   icon: Trash2   },
                { label: "Clear Cached Data",        icon: Database  },
                { label: "Reset All Settings",       icon: Shield   },
                { label: "Export Threat Report",     icon: Download  },
              ].map(({ label, icon: Icon }) => (
                <button key={label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-slate-400 transition-all hover:text-rose-300 hover:bg-rose-500/5"
                  style={{ border: "1px solid rgba(100,116,139,0.15)" }}>
                  <div className="flex items-center gap-2">
                    <Icon size={13} />
                    {label}
                  </div>
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>

          {/* Version */}
          <div className="text-center py-2 space-y-1">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-500" />
              SecureVision Browser v2.1.0 · Electron 37 · Chromium 136
            </p>
            <p className="text-[10px] text-slate-700">ONNX Runtime 1.18 · TFLite 2.15 · Edge AI Module v2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
