import requests
import random
import time
import hashlib
import datetime

BACKEND_API = "http://localhost:8000/api"
NODE_ID = "test-node"

def send_test_hit():
    payload_hash = hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]
    attack_types = ["SSH Brute Force", "SQL Injection", "Ransomware Drop", "Port Scan", "Credential Stuffing"]
    chosen_type = random.choice(attack_types)
    
    intel_payload = {
        "hash": payload_hash,
        "type": chosen_type,
        "source": f"pi-honeypot-test ({random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)})"
    }
    
    print(f"Sending hit: {chosen_type}...")
    try:
        r = requests.post(f"{BACKEND_API}/intel/share", json=intel_payload)
        print(f"Response: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    for i in range(5):
        send_test_hit()
        time.sleep(1)
