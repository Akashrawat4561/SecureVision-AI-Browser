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
                <Graticule stroke="#1e293b" strokeWidth={0.5} />
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
                                    hover: { fill: "#1e293b", outline: "none" },
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
                                initial={{ r: 0, opacity: 1 }}
                                animate={{ r: 15, opacity: 0 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                                fill={severity === "high" ? "#ef4444" : "#f97316"}
                            />
                            <circle
                                r={4}
                                fill={severity === "high" ? "#ef4444" : "#f97316"}
                                stroke="#fff"
                                strokeWidth={1}
                            />
                        </g>
                    </Marker>
                ))}
            </ComposableMap>

            {/* Decorative Overlays */}
            <div className="absolute top-4 left-4 p-2 bg-slate-900/80 border border-brand-cyan/30 rounded text-[10px] uppercase tracking-widest text-brand-cyan font-mono backdrop-blur-sm">
                Global Signal Sync: ACTIVE
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono">
                PROJECTION: EQUirectangular | GRID: 15°
            </div>
        </div>
    );
};

export default ThreatMap;
