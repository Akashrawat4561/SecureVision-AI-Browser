import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Sphere,
    Graticule
} from "react-simple-maps";
import { motion } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ThreatMarker {
    id: number | string;
    coordinates: [number, number];
    severity: string;
    label: string;
}

interface ThreatMapProps {
    markers: ThreatMarker[];
}

const ThreatMap: React.FC<ThreatMapProps> = ({ markers }) => {
    return (
        <div className="w-full h-full relative bg-slate-950/20 rounded-lg overflow-hidden border border-slate-800/50">
            <ComposableMap
                projectionConfig={{
                    rotate: [-10, 0, 0],
                    scale: 147
                }}
                className="w-full h-full"
            >
                <Sphere stroke="#1e293b" strokeWidth={0.5} id={"sphere"} fill={"none"} />
                <Graticule stroke="#1e293b" strokeWidth={0.3} />
                <Geographies geography={geoUrl}>
                    {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#0f172a"
                                stroke="#1e293b"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#16213e", outline: "none", transition: 'all 0.3s' },
                                    pressed: { outline: "none" }
                                }}
                            />
                        ))
                    }
                </Geographies>
                {markers.map(({ id, coordinates, severity }) => (
                    <Marker key={id} coordinates={coordinates}>
                        <g>
                            <motion.circle
                                initial={{ r: 0, opacity: 0.8 }}
                                animate={{ r: 25, opacity: 0 }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                                fill={severity === "high" ? "rgba(239, 68, 68, 0.4)" : "rgba(249, 115, 22, 0.4)"}
                            />
                            <motion.circle
                                initial={{ r: 0, opacity: 1 }}
                                animate={{ r: 12, opacity: 0 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                    delay: 0.5
                                }}
                                fill={severity === "high" ? "rgba(239, 68, 68, 0.6)" : "rgba(249, 115, 22, 0.6)"}
                            />
                            <circle
                                r={3.5}
                                fill={severity === "high" ? "#ef4444" : "#f97316"}
                                stroke="#fff"
                                strokeWidth={1}
                                className="shadow-lg shadow-black"
                            />
                        </g>
                    </Marker>
                ))}
            </ComposableMap>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 bg-[length:100%_2px,3px_100%]" />
            
            {/* Pulsing Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />

            {/* Decorative Overlays */}
            <div className="absolute top-6 left-6 p-4 bg-slate-900/60 border border-brand-cyan/20 rounded-2xl text-[10px] uppercase tracking-[0.3em] text-brand-cyan font-black backdrop-blur-md shadow-2xl flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
                <span>Global Signal ingestion: 12.4ms</span>
            </div>
            
            <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-1">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Projection: Mercator // Grid: 15°</div>
                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">SECUREVISION TACTICAL MAPPING SYSTEM V4.1</div>
            </div>
        </div>
    );
};

export default ThreatMap;
