import socket
import time

def simulate_attack():
    print("Simulating attack on Honeypot (SSH port 2222)...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect(("localhost", 2222))
        
        # Read banner
        banner = s.recv(1024)
        print(f"Banner received: {banner.decode().strip()}")
        
        # Send SSH-style identification
        s.send(b"SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1\r\n")
        
        # Send some "malicious" commands if it were a shell, 
        # but paramiko handles auth first. 
        # Just connecting and sending some data will trigger an event.
        time.sleep(1)
        s.send(b"root\n")
        time.sleep(1)
        s.send(b"123456\n")
        
        s.close()
        print("Simulation complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    simulate_attack()
