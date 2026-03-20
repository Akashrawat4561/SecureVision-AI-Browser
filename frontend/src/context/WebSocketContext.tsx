import React, { createContext, useContext, useEffect, useState } from 'react';

export type TelemetryNode = {
    id: string,
    cpu: number,
    latency: number,
    ram?: number,
    temperature?: number,
    status?: string
};

export type TelemetryData = {
    type: string;
    timestamp: string;
    traffic?: number;
    logins?: number;
    nodes?: TelemetryNode[];
    honeypot_connections?: number;
    event?: string;
    id?: number;
    time?: string;
    title?: string;
    source?: string;
    severity?: string;
    is_anomaly?: boolean;
    anomaly_score?: number;
    message?: string;
    gradcam?: string;
    intel_type?: string;
    hash?: string;
    honeypot_metrics?: {
        top_exploit: string;
        payload_count: number;
        avg_dwell_time: string;
    };
    honeypot_events?: Array<{
        id: number;
        ip: string;
        geo: {
            country: string;
            flag: string;
            coords: [number, number];
            cc: string;
        };
        attack: {
            type: string;
            severity: string;
            color: string;
        };
        timestamp: string;
    }>;
    global_threat_level?: number;
    level?: string;
}

type WSContextType = {
    data: TelemetryData | null;
    history: TelemetryData[];
    alerts: TelemetryData[];
    logs: TelemetryData[];
    connected: boolean;
};

const WSContext = createContext<WSContextType>({ data: null, history: [], alerts: [], logs: [], connected: false });

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [history, setHistory] = useState<TelemetryData[]>([]);
    const [alerts, setAlerts] = useState<TelemetryData[]>([]);
    const [logs, setLogs] = useState<TelemetryData[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let ws: WebSocket;
        const connect = () => {
            ws = new WebSocket('ws://localhost:8000/ws');
            ws.onopen = () => setConnected(true);
            ws.onclose = () => {
                setConnected(false);
                setTimeout(connect, 3000); // Reconnect logic
            };
            ws.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed.event === 'NEW_ALERT') {
                        setAlerts(prev => [parsed, ...prev].slice(0, 50));
                    } else if (parsed.type === 'TELEMETRY') {
                        setData(parsed);
                        setHistory(prev => [...prev.slice(-30), parsed]);
                    } else if (parsed.type === 'TERMINAL_LOG') {
                        setLogs(prev => [...prev.slice(-100), parsed]);
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        };
        connect();

        // Initial dummy data to prevent empty charts before first tick
        const dummyHistory = Array.from({ length: 10 }).map((_, i) => ({
            type: 'TELEMETRY', timestamp: '14:0' + i, traffic: 120 + i * 2, logins: 15
        }));
        setHistory(dummyHistory as TelemetryData[]);

        return () => ws?.close();
    }, []);

    return (
        <WSContext.Provider value={{ data, history, alerts, logs, connected }}>
            {children}
        </WSContext.Provider>
    );
};

export const useWebSocket = () => useContext(WSContext);
