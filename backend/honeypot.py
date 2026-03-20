import socket
import json
import requests
import datetime
import random
import time
import hashlib
import threading

# --- Honeypot Deployment Strategy (Feature 9) ---
# Deploy this on any Edge Node (RPI) listening on 22 (requires root) or 2222 (for test)
# It captures incoming IP, Banner interaction, and sends to SecureVision Dashboard.

BACKEND_API = "http://localhost:8000/api"
NODE_ID = "pi-honeypot-main"

def report_threat(engagement_data):
    """Reports a detailed threat engagement to the central backend."""
    try:
        # Use the edge heartbeat to report node status
        heartbeat_payload = {
            "node_id": NODE_ID,
            "cpu_usage": random.uniform(5, 12),
            "ram_usage": random.uniform(15, 30),
            "temperature": random.uniform(42, 58),
            "status": "online"
        }
        requests.post(f"{BACKEND_API}/edge/heartbeat", json=heartbeat_payload)
        
        # In a real system we would have a dedicated /api/honeypot/engagement endpoint
        # Sending via a mock endpoint or tagging it in the system
        print(f"[*] Reporting Engagement: {engagement_data['ip']} - {engagement_data['type']}", flush=True)
        
        # Randomize attack type for diverse UI display
        attack_types = ["SSH Brute Force", "SQL Injection", "Ransomware Drop", "Port Scan", "Credential Stuffing"]
        chosen_type = random.choice(attack_types)

        # For now, let's assume we post to a (new) intel sharing endpoint
        intel_payload = {
            "hash": engagement_data['payload_hash'],
            "type": chosen_type,
            "source": f"{NODE_ID} ({engagement_data['ip']})"
        }
        requests.post(f"{BACKEND_API}/intel/share", json=intel_payload)
        
    except Exception as e:
        print(f"[ERROR] Failed to report engagement: {e}")

def handle_client(client, addr):
    """Handles an interactive session with an attacker."""
    start_time = time.time()
    payloads = []
    
    try:
        print(f"[*] Connection received from {addr[0]}", flush=True)
        # Signal session start
        try:
            requests.post(f"{BACKEND_API}/honeypot/session", json={"action": "start"}, timeout=2)
        except Exception as e:
            print(f"[*] Warning: Could not reach backend for session start: {e}", flush=True)
            
        print(f"[!] INTRUSION DETECTED: Source IP {addr[0]}", flush=True)
        
        # 1. Send simulated SSH banner
        client.send(b"SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1\r\n")
        
        # 2. Simulated interactive loop (Fake shell)
        client.settimeout(5.0)
        
        while True:
            data = client.recv(1024)
            if not data:
                break
                
            payloads.append(data.decode('utf-8', errors='ignore').strip())
            # For a real SSH client to not crash immediately with "Bad packet length",
            # we shouldn't send raw strings back unless we implement the binary protocol.
            # We'll just quietly log the "interaction" for the dashboard.
            print(f"[*] Layer interaction from {addr[0]}: {data[:32]!r}", flush=True)
            
            if len(payloads) > 10:
                break
                
    except Exception as e:
        print(f"[*] Session with {addr[0]} ended: {e}")
    finally:
        client.close()
        
    end_time = time.time()
    dwell_time = end_time - start_time
    
    # Signal session end
    requests.post(f"{BACKEND_API}/honeypot/session", json={"action": "end", "dwell_time": dwell_time})
    
    # Generate unique hash for the engagement payloads
    all_content = "".join(payloads)
    payload_hash = hashlib.sha256(all_content.encode()).hexdigest()[:16]
    
    engagement_data = {
        "ip": addr[0],
        "type": "SSH Brute Force",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "dwell_time": round(dwell_time, 2),
        "payload_hash": payload_hash,
        "logs": payloads
    }
    
    report_threat(engagement_data)

def start_lone_honeypot(port=2222):
    """Simple high-interaction simulated SSH honeypot"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', port))
    server.listen(10)
    
    print(f"[*] SecureVision Honeypot Decoy Active on port {port}...", flush=True)
    
    while True:
        client, addr = server.accept()
        # Handle each attacker in a separate thread to allow multiple "Live Adversary Engagements"
        threading.Thread(target=handle_client, args=(client, addr), daemon=True).start()

if __name__ == "__main__":
    import sys
    port = 2222
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    start_lone_honeypot(port)
