import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { runDeepfakeScan } from "../services/aiService";

const DeepfakeContext = createContext(null);

const INITIAL_SCANS = [
  {
    id: "df1",
    filename: "press_conference_clip.mp4",
    type: "video",
    deepfakeProbability: 0.847,
    confidence: 0.924,
    suspiciousFrames: 34,
    totalFrames: 312,
    verdict: "DEEPFAKE",
    faceRegionsAnalyzed: 2,
    blinkAnomalies: 3,
    lipSyncScore: 0.41,
    inferenceMs: 2840,
    analyzedAt: Date.now() - 3600000,
    heatmapData: Array.from({ length: 72 }, () => parseFloat((Math.random() * 0.9).toFixed(2))),
  },
  {
    id: "df2",
    filename: "profile_photo.jpg",
    type: "image",
    deepfakeProbability: 0.123,
    confidence: 0.961,
    suspiciousFrames: 0,
    totalFrames: 1,
    verdict: "AUTHENTIC",
    faceRegionsAnalyzed: 1,
    blinkAnomalies: 0,
    lipSyncScore: 0.97,
    inferenceMs: 210,
    analyzedAt: Date.now() - 7200000,
    heatmapData: Array.from({ length: 72 }, () => parseFloat((Math.random() * 0.12).toFixed(2))),
  },
];

export function DeepfakeProvider({ children }) {
  const [scans, setScans] = useState(INITIAL_SCANS);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    totalScanned: 47,
    deepfakesFound: 8,
    authenticConfirmed: 39,
    avgConfidence: 0.91,
  });

  const analyze = useCallback(async (filename, fileObj = null) => {
    setScanning(true);
    setProgress(0);

    // Simulate progressive scan with multiple stages
    const stages = [
      { label: "Loading model weights…", progress: 15, delay: 200 },
      { label: "Extracting face regions…", progress: 35, delay: 300 },
      { label: "Running CNN inference…", progress: 60, delay: 400 },
      { label: "Analyzing temporal artifacts…", progress: 80, delay: 300 },
      { label: "Generating heatmap…", progress: 95, delay: 200 },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, stage.delay));
      setProgress(stage.progress);
    }

    await new Promise((r) => setTimeout(r, 150));
    setProgress(100);

    const result = await runDeepfakeScan(filename, fileObj);
    setScans((prev) => [result, ...prev].slice(0, 20));
    setStats((prev) => ({
      totalScanned: prev.totalScanned + 1,
      deepfakesFound: prev.deepfakesFound + (result.verdict === "DEEPFAKE" ? 1 : 0),
      authenticConfirmed: prev.authenticConfirmed + (result.verdict === "AUTHENTIC" ? 1 : 0),
      avgConfidence: parseFloat(
        ((prev.avgConfidence * prev.totalScanned + result.confidence) / (prev.totalScanned + 1)).toFixed(3),
      ),
    }));

    await new Promise((r) => setTimeout(r, 300));
    setScanning(false);
    setProgress(0);
    return result;
  }, []);

  const clearScans = useCallback(() => setScans([]), []);

  const value = useMemo(
    () => ({ scans, scanning, progress, stats, analyze, clearScans }),
    [scans, scanning, progress, stats, analyze, clearScans],
  );

  return <DeepfakeContext.Provider value={value}>{children}</DeepfakeContext.Provider>;
}

export function useDeepfake() {
  const c = useContext(DeepfakeContext);
  if (!c) throw new Error("useDeepfake must be used within DeepfakeProvider");
  return c;
}
