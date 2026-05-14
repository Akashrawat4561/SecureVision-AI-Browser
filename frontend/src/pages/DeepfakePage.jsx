import { useRef, useState } from "react";
import {
  Camera, ScanSearch, Upload, Eye, AlertTriangle, CheckCircle,
  Cpu, Zap, BarChart3, Play, Trash2, Clock, Film, Image,
  ShieldAlert, Activity, Brain, ChevronDown,
} from "lucide-react";
import { useDeepfake } from "../deepfake/DeepfakeContext";

function HeatmapGrid({ data, active }) {
  if (!data || data.length === 0) return (
    <div className="h-20 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
      <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Waiting for Scan Data</span>
    </div>
  );
  return (
    <div className="grid grid-cols-8 gap-1 p-1 bg-black/50 rounded-xl border border-slate-800/50">
      {data.map((intensity, i) => {
        const r = Math.round(intensity * 244);
        const g = Math.round((1 - intensity) * 185);
        const b = Math.round((1 - intensity) * 129);
        const alpha = 0.1 + intensity * 0.9;
        return (
          <div
            key={i}
            className="aspect-square rounded-sm transition-all duration-500"
            style={{
              background: intensity > 0.1 ? `rgba(${r},${g},${b},${alpha})` : "rgba(255,255,255,0.02)",
              boxShadow: intensity > 0.7 ? `0 0 8px rgba(${r},${g},${b},0.4)` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function VerdictDecision({ verdict, probability }) {
  const isFake = verdict === "DEEPFAKE" || probability > 0.6;
  const color = isFake ? "#f43f5e" : "#10b981";
  const bg = isFake ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)";
  const Icon = isFake ? ShieldAlert : CheckCircle;

  return (
    <div className="flex flex-col items-center justify-center py-8 px-6 rounded-3xl animate-scale-up"
      style={{ background: bg, border: `2px solid ${color}40`, boxShadow: `0 0 40px ${color}15` }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
        <Icon size={40} style={{ color }} className={isFake ? "animate-pulse" : ""} />
      </div>
      <h2 className="text-4xl font-black tracking-tighter mb-2" style={{ color }}>
        {isFake ? "FAKE" : "REAL"}
      </h2>
      <p className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color }}>
        {isFake ? "Manipulation Detected" : "Authentic Media Verified"}
      </p>
      <div className="mt-6 flex items-center gap-4 w-full">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase font-bold">
            <span>Probability</span>
            <span>{Math.round(probability * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000" 
                 style={{ width: `${probability * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanResultCard({ scan, isLatest }) {
  const [expanded, setExpanded] = useState(isLatest);
  const elapsed = Math.round((Date.now() - scan.analyzedAt) / 60000);
  const isFake = scan.verdict === "DEEPFAKE" || scan.deepfakeProbability > 0.6;
  const probColor = isFake ? "#f43f5e" : "#10b981";
  
  return (
    <div className="glass-card rounded-3xl overflow-hidden animate-fade-in relative"
      style={{ border: `1px solid ${probColor}30`, background: "rgba(8,16,40,0.4)" }}>
      
      {/* Top Banner */}
      <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${probColor}15`, border: `1px solid ${probColor}30` }}>
            {scan.type === "video" ? <Film size={18} style={{ color: probColor }} /> : <Image size={18} style={{ color: probColor }} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{scan.filename}</h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Analyzed {elapsed < 60 ? `${elapsed}m ago` : `${Math.round(elapsed / 60)}h ago`} · {scan.inferenceMs}ms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-black leading-none" style={{ color: probColor }}>
              {isFake ? "FAKE" : "REAL"}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">Verdict</p>
          </div>
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VerdictDecision verdict={scan.verdict} probability={scan.deepfakeProbability} />
            
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 bg-black/40 border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={12} className="text-violet-400" /> Forensic Indicators
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Temporal Artifacts", val: scan.blinkAnomalies > 0 ? "Detected" : "Clean", color: scan.blinkAnomalies > 0 ? "#f43f5e" : "#10b981" },
                    { label: "Lip Sync Alignment", val: `${Math.round(scan.lipSyncScore * 100)}%`, color: scan.lipSyncScore < 0.6 ? "#f43f5e" : "#10b981" },
                    { label: "Skin Texture Noise", val: isFake ? "High" : "Low", color: isFake ? "#f43f5e" : "#10b981" },
                    { label: "Face Boundary Scan", val: scan.faceRegionsAnalyzed > 0 ? "Verified" : "None", color: "#8b5cf6" },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="font-bold mono" style={{ color: stat.color }}>{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 bg-black/40 border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Eye size={12} className="text-cyan-400" /> Spatial Anomaly Map
                </h4>
                <HeatmapGrid data={scan.heatmapData} active={true} />
                <p className="text-[9px] text-slate-600 mt-2 text-center italic">
                  Grad-CAM visualization of manipulated regions detected by the CNN backbone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeepfakePage() {
  const { scans, scanning, progress, stats, analyze, clearScans } = useDeepfake();
  const [fileName, setFileName] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const runScan = async (name) => {
    const targetName = name || fileName;
    if (!targetName) return;
    await analyze(targetName, fileObj);
  };

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setFileObj(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Header ── */}
      <header className="section-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-violet-400 font-semibold mb-1">
              Deepfake Detection Lab
            </p>
            <h1 className="text-2xl font-black gradient-text-violet">On-Device Media Scanner</h1>
            <p className="text-sm text-slate-400 mt-1">
              Frame-level CNN forensics · Edge inference · Zero data upload
            </p>
          </div>
          {/* Summary Stats */}
          <div className="flex gap-3">
            {[
              { label: "Scanned",    value: stats.totalScanned,      color: "#22d3ee" },
              { label: "Deepfakes",  value: stats.deepfakesFound,    color: "#f43f5e" },
              { label: "Authentic",  value: stats.authenticConfirmed, color: "#10b981" },
              { label: "Avg. Conf.", value: `${Math.round(stats.avgConfidence * 100)}%`, color: "#8b5cf6" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center px-3 py-2 rounded-xl"
                style={{ background: "rgba(8,16,40,0.8)", border: `1px solid ${color}20` }}>
                <p className="text-lg font-black mono" style={{ color }}>{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Upload Panel ── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Drop Zone */}
          <div className="glass-card rounded-2xl p-4" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Upload size={14} className="text-violet-400" /> Upload Media
            </h2>
            <div
              className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.25)",
                background: dragOver ? "rgba(139,92,246,0.08)" : "rgba(4,8,20,0.5)",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Upload size={18} className="text-violet-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Drop image or video here</p>
              <p className="text-xs text-slate-600 mt-1">JPG, PNG, MP4, MOV, WebP supported</p>
              {fileName && (
                <div className="mt-4 animate-scale-up">
                  {fileObj && fileObj.type.startsWith("image/") ? (
                    <div className="relative rounded-xl overflow-hidden border border-violet-500/30 mx-auto max-w-[240px] aspect-square">
                      <img src={URL.createObjectURL(fileObj)} className="w-full h-full object-cover" alt="Preview" />
                      {scanning && (
                        <div className="absolute inset-0 bg-violet-500/20 backdrop-blur-[2px] flex items-center justify-center">
                           <div className="w-full h-0.5 bg-violet-400 absolute top-0 animate-scan-y shadow-[0_0_15px_#a78bfa]" />
                           <ScanSearch size={40} className="text-white animate-pulse" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-xs"
                      style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}>
                      <Film size={11} />{fileName}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => runScan()}
                disabled={!fileName || scanning}
                className="btn-violet flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scanning
                  ? <><div className="w-3 h-3 rounded-full border border-violet-400 border-t-transparent animate-spin" />Scanning…</>
                  : <><ScanSearch size={14} />Run Deepfake Scan</>
                }
              </button>
            </div>
            <button
              onClick={() => runScan("webcam_capture_live_stream.mp4")}
              disabled={scanning}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-40"
            >
              <Camera size={14} />Simulate Webcam Scan
            </button>
          </div>

          {/* Scan Progress */}
          {scanning && (
            <div className="glass-card rounded-2xl p-4 animate-fade-in neon-violet"
              style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-violet-400 animate-pulse" />
                <p className="text-xs font-bold text-violet-300">Edge AI Processing…</p>
                <span className="ml-auto text-xs font-bold mono text-violet-300">{progress}%</span>
              </div>
              <div className="scan-bar mb-2">
                <div className="scan-bar-fill"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6d28d9, #8b5cf6, #a78bfa)" }} />
              </div>
              <p className="text-[11px] text-slate-500">
                {progress < 20 ? "Loading model weights…" :
                 progress < 40 ? "Extracting face regions…" :
                 progress < 65 ? "Running CNN inference…" :
                 progress < 85 ? "Analyzing temporal artifacts…" :
                 "Generating anomaly heatmap…"}
              </p>
            </div>
          )}

          {/* Architecture Info */}
          <div className="glass-card rounded-2xl p-4" style={{ border: "1px solid rgba(34,211,238,0.1)" }}>
            <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Cpu size={12} className="text-cyan-400" /> Detection Architecture
            </h3>
            {[
              { label: "Model",      value: "EfficientNet-B4 + LSTM",     color: "#22d3ee" },
              { label: "Runtime",    value: "ONNX Runtime (edge)",         color: "#8b5cf6" },
              { label: "Analysis",   value: "Frame-level + Temporal",      color: "#10b981" },
              { label: "Inference",  value: "On-device (no upload)",       color: "#f59e0b" },
              { label: "Heatmap",    value: "Grad-CAM visualization",      color: "#f43f5e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between py-1.5 text-[11px]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Results Panel ── */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity size={14} className="text-violet-400" />
              Scan Results
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                {scans.length}
              </span>
            </h2>
            {scans.length > 0 && (
              <button onClick={clearScans}
                className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-rose-400 transition-colors">
                <Trash2 size={11} />Clear All
              </button>
            )}
          </div>

          {scans.length === 0 && !scanning ? (
            <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 gap-3"
              style={{ border: "1px solid rgba(139,92,246,0.1)" }}>
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center animate-float"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <ScanSearch size={24} className="text-violet-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No scans yet</p>
              <p className="text-xs text-slate-600">Upload media or run a webcam simulation</p>
            </div>
          ) : (
            <div className="space-y-3 panel-scroll" style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
              {scans.map((scan, i) => (
                <ScanResultCard key={scan.id} scan={scan} isLatest={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
