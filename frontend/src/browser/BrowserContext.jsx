import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { simulateThreatScan, runThreatScan } from "../services/aiService";
const BrowserContext = createContext(null);
const seedTabs = [{ id: crypto.randomUUID(), title: "SecureVision Home", url: "securevision://home", secure: true }];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export function BrowserProvider({ children }) {
  const [tabs, setTabs] = useState(seedTabs);
  const [activeTabId, setActiveTabId] = useState(seedTabs[0].id);
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [downloads] = useState([{ id: "d1", title: "Threat_Report_Q2.pdf", status: "Completed" }, { id: "d2", title: "IOC_bundle.zip", status: "Scanning" }]);
  const initializedRef = useRef(false);
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Fetch initial history and bookmarks from SQLite backend
  useEffect(() => {
    fetch(`${API_BASE}/api/history`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to load history from SQLite backend:", err);
        setHistory([]);
      });

    fetch(`${API_BASE}/api/bookmarks`)
      .then(res => res.json())
      .then(data => setBookmarks(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to load bookmarks from SQLite backend:", err);
        setBookmarks([]);
      });
  }, []);

  useEffect(() => {
    if (!window.secureVisionNative?.browser || initializedRef.current) return;
    initializedRef.current = true;
    seedTabs.forEach((tab) => {
      window.secureVisionNative.browser.createTab({ tabId: tab.id, url: tab.url });
    });
    const unsubscribe = window.secureVisionNative.browser.onTabUpdated((payload) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === payload.tabId ? { ...tab, ...payload } : tab)),
      );
    });
    return unsubscribe;
  }, []);

  function newTab() {
    const t = { id: crypto.randomUUID(), title: "New Tab", url: "securevision://home", secure: true };
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
    window.secureVisionNative?.browser?.createTab({ tabId: t.id, url: t.url });
  }

  function closeTab(id) {
    setTabs((p) => {
      if (p.length <= 1) return p;
      const next = p.filter((t) => t.id !== id);
      if (id === activeTabId && next[0]) {
        setActiveTabId(next[0].id);
        window.secureVisionNative?.browser?.activateTab({ tabId: next[0].id });
      }
      return next;
    });
    window.secureVisionNative?.browser?.closeTab({ tabId: id });
  }

  function activateTab(id) {
    setActiveTabId(id);
    window.secureVisionNative?.browser?.activateTab({ tabId: id });
  }

  async function navigate(url) {
    const normalized = url.startsWith("http") || url.startsWith("securevision://") || url.startsWith("data:") ? url : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    const secure = normalized.startsWith("https://") || normalized.startsWith("securevision://");
    const electronResult = await window.secureVisionNative?.browser?.navigateTab({ tabId: activeTabId, url: normalized });
    const nextUrl = electronResult?.url || normalized;
    const nextTitle = electronResult?.title || (nextUrl.startsWith("http") ? new URL(nextUrl).hostname : "SecureVision Home");
    const nextSecure = electronResult?.secure ?? secure;
    setTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, url: nextUrl, secure: nextSecure, title: nextTitle } : t));
    
    // Save to SQLite backend
    const newHistoryItem = { id: crypto.randomUUID(), title: nextTitle, url: nextUrl, ts: Date.now() };
    setHistory((prev) => [newHistoryItem, ...prev].slice(0, 100));
    fetch(`${API_BASE}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHistoryItem)
    }).catch(err => console.error("Failed to save history to SQLite:", err));

    return runThreatScan(nextUrl);
  }

  async function goBack() {
    const result = await window.secureVisionNative?.browser?.goBack({ tabId: activeTabId });
    if (!result?.url) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: result.url, title: result.title || t.title, secure: result.url.startsWith("https://") } : t)),
    );
  }

  async function goForward() {
    const result = await window.secureVisionNative?.browser?.goForward({ tabId: activeTabId });
    if (!result?.url) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: result.url, title: result.title || t.title, secure: result.url.startsWith("https://") } : t)),
    );
  }

  function reload() {
    window.secureVisionNative?.browser?.reload({ tabId: activeTabId });
  }

  function goHome() {
    return navigate("securevision://home");
  }
  function addBookmark() { 
    if (activeTab) {
      const newBookmark = { id: crypto.randomUUID(), title: activeTab.title, url: activeTab.url };
      setBookmarks((p) => [newBookmark, ...p]);
      fetch(`${API_BASE}/api/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBookmark)
      }).catch(err => console.error("Failed to save bookmark to SQLite:", err));
    }
  }

  function removeBookmark(id) {
    setBookmarks((p) => p.filter(bm => bm.id !== id));
    fetch(`${API_BASE}/api/bookmarks/${id}`, { method: "DELETE" })
      .catch(err => console.error("Failed to delete bookmark from SQLite:", err));
  }

  function clearHistory() {
    setHistory([]);
    fetch(`${API_BASE}/api/history`, { method: "DELETE" })
      .catch(err => console.error("Failed to clear SQLite history:", err));
  }

  const value = useMemo(() => ({ tabs, activeTab, activeTabId, activateTab, newTab, closeTab, navigate, goBack, goForward, reload, goHome, addBookmark, removeBookmark, clearHistory, history, bookmarks, downloads }), [tabs, activeTab, activeTabId, history, bookmarks, downloads]);
  return <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>;
}
export function useBrowser() { const c = useContext(BrowserContext); if (!c) throw new Error("useBrowser must be used within BrowserProvider"); return c; }
