import requests
import asyncio
import websockets
import json
import time

async def test_edge():
    # 1. Test Heartbeat POST
    print("Testing Heartbeat API...")
    payload = {
        "node_id": "pi-edge-007",
        "cpu_usage": 55.4,
        "ram_usage": 42.1,
        "temperature": 68.5,
        "status": "online"
    }
    res = requests.post("http://localhost:8000/api/edge/heartbeat", json=payload)
    print("Heartbeat Response:", res.json())
    
    # 2. Test Alert WebSocket
    print("Testing Alerts WebSocket...")
    try:
        async with websockets.connect("ws://localhost:8000/ws/edge/alerts") as ws:
            alert = {
                "NodeID": "pi-edge-007",
                "ThreatType": "Deepfake",
                "ConfidenceScore": 0.99,
                "Timestamp": "2026-03-07T12:00:00Z"
            }
            await ws.send(json.dumps(alert))
            print("Alert Sent successfully!")
            await asyncio.sleep(1) # wait for broadcast
    except Exception as e:
        print("WS Error:", e)

if __name__ == "__main__":
    asyncio.run(test_edge())
