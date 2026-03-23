import time
import random
import requests
import psutil
import socket
import platform

# Configuration
# Change this to your server's IP if running on a different device
API_URL = "http://localhost:8000/api/edge/heartbeat"
NODE_ID = f"node-{platform.node().lower()}" # Unique ID for this device

def get_stats():
    """Capture real hardware stats from this device."""
    try:
        cpu = psutil.cpu_percent(interval=1)
        ram = psutil.virtual_memory().percent
        # Temperature is platform-dependent
        temp = 45.0
        if hasattr(psutil, "sensors_temperatures"):
            temps = psutil.sensors_temperatures()
            if "cpu_thermal" in temps:
                temp = temps["cpu_thermal"][0].current
            elif "coretemp" in temps:
                temp = temps["coretemp"][0].current
                
        return {
            "node_id": NODE_ID,
            "stats": {
                "cpu_usage": cpu,
                "ram_usage": ram,
                "temperature": round(temp, 1)
            }
        }
    except Exception as e:
        print(f"Error capturing stats: {e}")
        return None

def run_agent():
    print(f"--- SecureVision Edge Agent Starting ---")
    print(f"Node ID: {NODE_ID}")
    print(f"Target:  {API_URL}")
    print(f"Press Ctrl+C to stop.")
    
    while True:
        payload = get_stats()
        if payload:
            try:
                response = requests.post(API_URL, json=payload, timeout=5)
                if response.status_code == 200:
                    print(f"[{time.strftime('%H:%M:%S')}] Heartbeat sent - CPU: {payload['stats']['cpu_usage']}% | RAM: {payload['stats']['ram_usage']}%")
                else:
                    print(f"[{time.strftime('%H:%M:%S')}] Server error: {response.status_code}")
            except Exception as e:
                print(f"[{time.strftime('%H:%M:%S')}] Connection failed: {e}")
        
        time.sleep(5) # Send heartbeat every 5 seconds

if __name__ == "__main__":
    run_agent()
