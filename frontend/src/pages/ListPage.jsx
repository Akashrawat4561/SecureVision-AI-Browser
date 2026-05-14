import { useState } from "react";
import {
  Bookmark, History, Download, Search, Trash2, ExternalLink,
  Star, Clock, CheckCircle, AlertCircle, Loader, Globe,
  X, Filter, ChevronDown, Calendar, ArrowDownUp, ShieldCheck
} from "lucide-react";
import { useBrowser } from "../browser/BrowserContext";

const MODE_CONFIG = {
  bookmarks: {
    icon: Bookmark, color: "#f59e0b", label: "Bookmarks",
    emptyIcon: Star, emptyMsg: "No bookmarks saved yet.",
    emptyHint: "Click the ★ in the address bar to save a site.",
  },
  history: {
    icon: History, color: "#22d3ee", label: "Browsing History",
    emptyIcon: Clock, emptyMsg: "No browsing history yet.",
    emptyHint: "Visit sites in the Browser tab to build history.",
  },
  downloads: {
    icon: Download, color: "#10b981", label: "Downloads",
    emptyIcon: Download, emptyMsg: "No downloads recorded.",
    emptyHint: "Downloaded files will appear here.",
  },
};

function DownloadStatusBadge({ status }) {
  const cfg = {
    Completed: { color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle },
    Scanning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Loader },
    Failed:    { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   icon: AlertCircle },
  };
  const c = cfg[status] || cfg.Completed;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      <Icon size={9} className={status === "Scanning" ? "animate-spin" : ""} />
      {status}
    </span>
  );
}

function BookmarkItem({ item, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/[0.04] group cursor-pointer"
      style={{ border: "1px solid rgba(245,158,11,0.08)", marginBottom: 4 }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <Globe size={13} className="text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{item.title || item.url}</p>
        <p className="text-[11px] text-slate-500 truncate mono">{item.url}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 mr-2">
          <ShieldCheck size={10} /> Secure
        </div>
        <button className="toolbar-btn w-7 h-7" title="Open">
          <ExternalLink size={11} />
        </button>
        <button className="toolbar-btn w-7 h-7 hover:border-rose-500/40 hover:text-rose-400" title="Remove" onClick={(e) => { e.stopPropagation(); onRemove?.(item.id); }}>
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

function HistoryItem({ item }) {
  const elapsed = item.ts ? Math.round((Date.now() - item.ts) / 60000) : null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/[0.04] group cursor-pointer"
      style={{ border: "1px solid rgba(34,211,238,0.06)", marginBottom: 4 }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)" }}>
        <History size={12} className="text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{item.title || item.url}</p>
        <p className="text-[11px] text-slate-500 mono truncate">{item.url}</p>
      </div>
      <div className="flex items-center gap-3">
        {elapsed !== null && (
          <span className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1 group-hover:text-slate-400 transition-colors">
            <Clock size={9} />
            {elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.round(elapsed / 60)}h ago` : `${Math.round(elapsed / 1440)}d ago`}
          </span>
        )}
        <button className="toolbar-btn w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity" title="Open">
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

function DownloadItem({ item }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/[0.02]"
      style={{ border: "1px solid rgba(16,185,129,0.08)", marginBottom: 4 }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <Download size={13} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{item.title || item.url}</p>
        {item.url && <p className="text-[11px] text-slate-500 mono truncate">{item.url}</p>}
      </div>
      <DownloadStatusBadge status={item.status || "Completed"} />
    </div>
  );
}

export default function ListPage({ title, mode }) {
  const { bookmarks, history, downloads, clearHistory, removeBookmark } = useBrowser();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const rawList =
    mode === "bookmarks" ? bookmarks :
    mode === "history"   ? history   :
    downloads;

  const filtered = search.trim()
    ? rawList.filter((item) =>
        (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.url  || "").toLowerCase().includes(search.toLowerCase()),
      )
    : [...rawList];

  // Sorting
  if (sortOrder === "newest") {
    filtered.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } else if (sortOrder === "oldest") {
    filtered.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  } else if (sortOrder === "alpha") {
    filtered.sort((a, b) => (a.title || a.url || "").localeCompare(b.title || b.url || ""));
  }

  // Grouping logic for History
  const groupedHistory = {};
  if (mode === "history") {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    filtered.forEach(item => {
      if (!item.ts) {
        if (!groupedHistory["Older"]) groupedHistory["Older"] = [];
        groupedHistory["Older"].push(item);
        return;
      }
      const diff = now - item.ts;
      if (diff < dayMs) {
        if (!groupedHistory["Today"]) groupedHistory["Today"] = [];
        groupedHistory["Today"].push(item);
      } else if (diff < dayMs * 2) {
        if (!groupedHistory["Yesterday"]) groupedHistory["Yesterday"] = [];
        groupedHistory["Yesterday"].push(item);
      } else if (diff < dayMs * 7) {
        if (!groupedHistory["Last 7 Days"]) groupedHistory["Last 7 Days"] = [];
        groupedHistory["Last 7 Days"].push(item);
      } else {
        if (!groupedHistory["Older"]) groupedHistory["Older"] = [];
        groupedHistory["Older"].push(item);
      }
    });
  }

  const cfg = MODE_CONFIG[mode];
  const PageIcon = cfg.icon;
  const EmptyIcon = cfg.emptyIcon;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Header ── */}
      <header className="section-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PageIcon size={14} style={{ color: cfg.color }} />
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: cfg.color }}>
              {cfg.label}
            </p>
          </div>
          <h1 className="text-2xl font-black gradient-text-cyan">{title}</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} items</p>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 address-bar" style={{ width: 260 }}>
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${mode}…`}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#e2eaff" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400">
              <X size={11} />
            </button>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="glass-card rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${cfg.color}15` }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${cfg.color}10`, background: `${cfg.color}04` }}>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: cfg.color }}>
              <Filter size={12} />
              {search ? `Showing ${filtered.length} of ${rawList.length}` : `All ${rawList.length} items`}
            </span>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => setSortOrder("newest")}>
                <Clock size={11} className={sortOrder === "newest" ? "text-cyan-400" : ""} /> Newest
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => setSortOrder("oldest")}>
                <ArrowDownUp size={11} className={sortOrder === "oldest" ? "text-cyan-400" : ""} /> Oldest
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-slate-200 transition-colors" onClick={() => setSortOrder("alpha")}>
                <Calendar size={11} className={sortOrder === "alpha" ? "text-cyan-400" : ""} /> Alphabetical
              </span>
            </div>
          </div>
          {rawList.length > 0 && (
            <button 
              onClick={() => {
                if (mode === "history") clearHistory();
              }}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-rose-400 transition-colors bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
              <Trash2 size={11} /> Clear All
            </button>
          )}
        </div>

        <div className="p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center animate-float"
                style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                <EmptyIcon size={22} style={{ color: cfg.color }} />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {search ? "No matches found" : cfg.emptyMsg}
              </p>
              <p className="text-xs text-slate-600">{search ? `Try a different search term` : cfg.emptyHint}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {mode === "history" ? (
                Object.keys(groupedHistory).map((groupName) => (
                  <div key={groupName} className="mb-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">{groupName}</h3>
                    <div className="space-y-1">
                      {groupedHistory[groupName].map(item => <HistoryItem key={item.id} item={item} />)}
                    </div>
                  </div>
                ))
              ) : (
                filtered.map((item) =>
                  mode === "bookmarks" ? <BookmarkItem key={item.id} item={item} onRemove={removeBookmark} /> :
                  <DownloadItem  key={item.id} item={item} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
