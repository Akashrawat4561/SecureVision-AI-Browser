from transformers import pipeline, set_seed
import requests
import json
import random
import time

# --- Predictive Attack Simulation (Feature 11) ---
# Use an SLM (GPT-2) to generate 'synthetic' phishing payloads.
# This tests Feature 1 (Phishing Detection) by creating nuanced variations.

SLM_MODEL = "gpt2" # Using standard GPT-2 as aSmall Language Model
generator = pipeline('text-generation', model=SLM_MODEL)
set_seed(42)

def generate_phishing_payload(prompt):
    """Generates a subtle phishing email body using the SLM"""
    print(f"[*] SLM generating variant for prompt: '{prompt}'...")
    response = generator(prompt, max_length=100, num_return_sequences=1, truncation=True)
    return response[0]['generated_text']

def simulate_predictive_attack():
    """Run an automated 'Predictive Simulation' and log detection rate"""
    print("\n--- SECUREVISION PREDICTIVE ATTACK SIMULATION ---")
    
    # 1. Base phishing seeds
    phishing_seeds = [
        "From IT Department: Please verify your password because of unusual activity.",
        "URGENT: Your account will be suspended in 24 hours unless you login here.",
        "Internal Bank Alert: A large transaction was detected on your account.",
        "Your crypto wallet has a sync error. Click to re-sync now."
    ]
    
    passed = 0
    detected = 0
    
    for i, seed in enumerate(phishing_seeds):
        # 2. SLM expands the seed into a full synthetic email body
        synthetic_email = generate_phishing_payload(seed)
        print(f"[#] Synthetic Payload {i+1}:\n\"{synthetic_email}\"")
        
        # 3. 'Attack' the main SecureVision Phishing AI (Feature 1)
        try:
            res = requests.post("http://localhost:8000/api/phishing", json={
                "subject": f"Synthetic Test {i+1}",
                "body": synthetic_email
            })
            
            result = res.json()
            score = result.get('score', 0)
            classification = result.get('classification', 'UNKNOWN')
            
            print(f"[*] SecureVision Result: {classification} (Risk Score: {score}%)")
            
            if classification == "UNSAFE":
                detected += 1
            else:
                passed += 1
                print("[!] BYPASS DETECTED: The synthetic payload evaded simple detection.")
                
        except Exception as e:
            print(f"[ERROR] Connection to SecureVision API failed: {e}")
            
    # 4. Final summary for Predictive Simulation metrics
    total = len(phishing_seeds)
    accuracy = (detected / total) * 100
    print(f"\n--- SIMULATION SUMMARY ---")
    print(f"Total Synthetic Attacks: {total}")
    print(f"Detected: {detected}")
    print(f"Bypassed: {passed}")
    print(f"SecureVision Detection Accuracy: {accuracy}%")
    
    # 5. Report back to Central Dashboard (Feature 11 Integration)
    try:
        requests.post("http://localhost:8000/api/predictive/run", json={
            "total": total,
            "detected": detected,
            "bypassed": passed,
            "accuracy": accuracy
        })
        print("[*] Predictive Simulation results synced to Central Dashboard.")
    except Exception as e:
        print(f"[ERROR] Sync failure: {e}")
    
if __name__ == "__main__":
    simulate_predictive_attack()
