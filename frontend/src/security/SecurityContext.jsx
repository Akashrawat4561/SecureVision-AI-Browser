import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { generateTrustReport, simulateThreatScan, runThreatScan, fetchSecurityStats } from "../services/aiService";

const SecurityContext = createContext(null);

const INITIAL_STATS = {
  threatsBlocked: 1749,
  phishingCaught: 312,
  unsafeSites: 89,
  privacyTrackers: 4317,
  deepfakeAlerts: 15,
  malwareBlocked: 203,
  scamsDetected: 58,
  sessionsProtected: 2841,
};

const INITIAL_HISTORY = [
  { id: "h1", url: "https://google.com", trust: 97, level: "safe", scannedAt: Date.now() - 120000 },
  { id: "h2", url: "https://github.com", trust: 96, level: "safe", scannedAt: Date.now() - 300000 },
  { id: "h3", url: "http://free-download-now.xyz", trust: 8, level: "danger", scannedAt: Date.now() - 600000 },
  { id: "h4", url: "https://wikipedia.org", trust: 95, level: "safe", scannedAt: Date.now() - 900000 },
  { id: "h5", url: "http://paypa1-secure-login.tk", trust: 5, level: "danger", scannedAt: Date.now() - 1200000 },
];

export function SecurityProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [scanHistory, setScanHistory] = useState(INITIAL_HISTORY);
  const [currentScan, setCurrentScan] = useState(null);
  const [shieldEnabled, setShieldEnabled] = useState(true);
  const [settings, setSettings] = useState({
    phishingShield: true,
    deepfakeRealtime: true,
    trackerBlocker: true,
    fakeNewsAnalyzer: false,
    malwareScanner: true,
    httpsOnly: false,
    aiAssistant: true,
    scriptBlocker: false,
    fingerprintProtection: true,
    cookieManager: true,
  });

  // Pull "Real" initial stats from backend telemetry
  useEffect(() => {
    fetchSecurityStats().then(realStats => {
      if (realStats) setStats(realStats);
    });
  }, []);

  const registerThreat = useCallback((scan) => {
    if (!scan) return;
    const report = generateTrustReport(scan);
    setCurrentScan(report);

    // Build alert
    const alertTitle =
      scan.level === "danger" ? "⚠ High-Risk Threat Blocked" :
      scan.level === "warning" ? "⚡ Security Warning" :
      "✓ Site Scanned — Clean";

    const alertMsg =
      scan.level === "danger"
        ? `Phishing or malware detected on ${scan.domain}. Trust score: ${scan.trust}/100.`
        : scan.level === "warning"
        ? `Potential risk on ${scan.domain}. Verify before interacting.`
        : `${scan.domain} passed SecureVision AI scan. Trust: ${scan.trust}/100.`;

    setAlerts((prev) =>
      [
        {
          id: crypto.randomUUID(),
          title: alertTitle,
          message: alertMsg,
          level: scan.level,
          trust: scan.trust,
          url: scan.url,
          recommendations: scan.recommendations,
          createdAt: Date.now(),
        },
        ...prev,
      ].slice(0, 5),
    );

    // Update stats
    if (scan.level === "danger") {
      setStats((prev) => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + 1,
        unsafeSites: prev.unsafeSites + 1,
        ...(scan.phishing > 60 && { phishingCaught: prev.phishingCaught + 1 }),
        ...(scan.malware > 60 && { malwareBlocked: prev.malwareBlocked + 1 }),
      }));
    }
    if (scan.privacyTrackers > 0) {
      setStats((prev) => ({
        ...prev,
        privacyTrackers: prev.privacyTrackers + scan.privacyTrackers,
      }));
    }

    setScanHistory((prev) =>
      [{ id: scan.id, url: scan.url, trust: scan.trust, level: scan.level, scannedAt: scan.scannedAt }, ...prev].slice(0, 50),
    );

    return report;
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAllAlerts = useCallback(() => setAlerts([]), []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runManualScan = useCallback(async (url) => {
    const scan = await runThreatScan(url);
    return registerThreat(scan);
  }, [registerThreat]);

  const value = useMemo(
    () => ({
      alerts,
      stats,
      scanHistory,
      currentScan,
      shieldEnabled,
      settings,
      registerThreat,
      dismissAlert,
      dismissAllAlerts,
      setShieldEnabled,
      updateSetting,
      runManualScan,
    }),
    [alerts, stats, scanHistory, currentScan, shieldEnabled, settings, registerThreat, dismissAlert, dismissAllAlerts, updateSetting, runManualScan],
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  const c = useContext(SecurityContext);
  if (!c) throw new Error("useSecurity must be used within SecurityProvider");
  return c;
}
