import React, { createContext, useContext, useEffect, useState } from 'react';

const WSContext = createContext({ data: null, history: [], alerts: [], logs: [], connected: false });

export const WebSocketProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let ws;
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
        setHistory(dummyHistory);

        return () => ws?.close();
    }, []);

    return (
        <WSContext.Provider value={{ data, history, alerts, logs, connected }}>
            {children}
        </WSContext.Provider>
    );
};

export const useWebSocket = () => useContext(WSContext);
