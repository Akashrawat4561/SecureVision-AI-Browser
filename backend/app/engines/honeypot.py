"""
SecureVision AI — Honeypot Engine v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Multi-protocol deception grid:
  • SSH/TCP decoy       (port 2222) — banner + fake shell interaction
  • HTTP decoy          (port 8080) — fake admin panel lures
  • SMTP decoy          (port 2525) — fake mail relay lures
  • FTP decoy           (port 2121) — fake file server lures

Each attacker session is:
  1. Classified by command/payload patterns (SQL, brute-force, scanning, etc.)
  2. Assigned a threat severity (critical / high / medium / low)
  3. Fingerprinted via payload hash (SHA-256)
  4. Reported to the central backend via /api/intel/share
  5. Logged in a structured session record accessible via /api/honeypot/events
"""

import socket
import json
import requests
import datetime
import random
import time
import hashlib
import threading
import re
import struct
from typing import Optional

BACKEND_API = "http://localhost:8000/api"
NODE_ID     = "sv-honeypot-grid-1"

# ──────────────────────────────────────────────────────────────────────────────
# Shared in-memory event store (read by main.py via /api/honeypot/events)
# ──────────────────────────────────────────────────────────────────────────────
engagement_log: list = []          # newest first, capped at 200
_log_lock = threading.Lock()

def add_event(event: dict):
    with _log_lock:
        engagement_log.insert(0, event)
        if len(engagement_log) > 200:
            engagement_log.pop()

def get_events(limit: int = 50) -> list:
    with _log_lock:
        return engagement_log[:limit]

# ──────────────────────────────────────────────────────────────────────────────
# Attack Pattern Classifier
# ──────────────────────────────────────────────────────────────────────────────
ATTACK_SIGNATURES = [
    # (regex_pattern, attack_type, severity)
    (r"(union\s+select|drop\s+table|;--|\bor\b\s+1=1)",          "SQL Injection",      "critical"),
    (r"(wget|curl|bash|/bin/sh|/etc/passwd|chmod\s+\+x)",         "Malware Dropper",    "critical"),
    (r"(root|admin|password|passw0rd|123456|qwerty)",             "Credential Brute Force", "high"),
    (r"(HELO|EHLO|MAIL FROM|RCPT TO|DATA)",                       "SMTP Relay Abuse",   "high"),
    (r"(USER\s+\w+|PASS\s+\w+|LIST|RETR|STOR)",                   "FTP Brute Force",    "high"),
    (r"(GET\s+/admin|POST\s+/login|\.env|wp-config|phpMyAdmin)",   "Web Scanning",       "medium"),
    (r"(nmap|masscan|zmap|nikto|sqlmap|hydra)",                    "Port/Vuln Scanner",  "medium"),
    (r"(\.\.\/|path\s+traversal|%2e%2e|/etc/shadow)",             "Path Traversal",     "high"),
    (r"(<script|javascript:|onerror=|onload=|alert\()",            "XSS Attempt",        "medium"),
    (r"(\x00|\xff\xfb|\x03\x00)",                                  "Protocol Exploit",   "critical"),
]

def classify_payload(raw: str) -> tuple:
    """Returns (attack_type, severity)."""
    for pattern, atype, sev in ATTACK_SIGNATURES:
        if re.search(pattern, raw, re.IGNORECASE):
            return atype, sev
    return "Unknown Probe", "low"


# ──────────────────────────────────────────────────────────────────────────────
# Geo lookup (lightweight — IP-API free tier, no key required)
# ──────────────────────────────────────────────────────────────────────────────
GEO_CACHE: dict = {}

def geo_lookup(ip: str) -> dict:
    """Returns {country, city, isp, flag, coords} for a given IP."""
    if ip in GEO_CACHE:
        return GEO_CACHE[ip]
    # Loopback / private → mock
    if ip in ("127.0.0.1", "::1") or ip.startswith(("192.168.", "10.", "172.")):
        geo = {"country": "Local Network", "city": "localhost", "isp": "Internal",
               "flag": "🖥", "coords": [0, 0], "cc": "LO"}
    else:
        try:
            r = requests.get(f"http://ip-api.com/json/{ip}?fields=country,city,isp,lat,lon,countryCode",
                             timeout=3)
            d = r.json()
            flag = _country_to_flag(d.get("countryCode", "XX"))
            geo  = {
                "country": d.get("country", "Unknown"),
                "city":    d.get("city",    "Unknown"),
                "isp":     d.get("isp",     "Unknown"),
                "flag":    flag,
                "coords":  [d.get("lon", 0), d.get("lat", 0)],
                "cc":      d.get("countryCode", "XX"),
            }
        except Exception:
            geo = {"country": "Unknown", "city": "Unknown", "isp": "Unknown",
                   "flag": "🌐", "coords": [0, 0], "cc": "XX"}
    GEO_CACHE[ip] = geo
    return geo

def _country_to_flag(cc: str) -> str:
    try:
        return "".join(chr(0x1F1E6 + ord(c) - ord("A")) for c in cc.upper()[:2])
    except Exception:
        return "🌐"


# ──────────────────────────────────────────────────────────────────────────────
# Backend reporter
# ──────────────────────────────────────────────────────────────────────────────
def report_engagement(session: dict):
    """Sends the engagement to the backend and adds it to the local log."""
    add_event(session)

    # Heartbeat
    try:
        requests.post(f"{BACKEND_API}/edge/heartbeat", json={
            "node_id":     NODE_ID,
            "cpu_usage":   round(random.uniform(5, 18), 1),
            "ram_usage":   round(random.uniform(15, 35), 1),
            "temperature": round(random.uniform(42, 60), 1),
            "status":      "online",
        }, timeout=3)
    except Exception:
        pass

    # Intel share
    try:
        requests.post(f"{BACKEND_API}/intel/share", json={
            "hash":   session["payload_hash"],
            "type":   session["attack_type"],
            "source": f"{NODE_ID} ({session['ip']}) [{session['protocol']}]",
        }, timeout=3)
    except Exception:
        pass

    # Honeypot session tracking
    try:
        requests.post(f"{BACKEND_API}/honeypot/session", json={
            "action":     "end",
            "dwell_time": session["dwell_time"],
        }, timeout=3)
    except Exception:
        pass


# ──────────────────────────────────────────────────────────────────────────────
# Protocol Handlers
# ──────────────────────────────────────────────────────────────────────────────

def _build_session(ip: str, protocol: str, payloads: list,
                   dwell: float, attack_type: str, severity: str) -> dict:
    raw_all = " ".join(payloads)
    phash   = hashlib.sha256(raw_all.encode()).hexdigest()[:16]
    geo     = geo_lookup(ip)
    return {
        "id":           int(time.time() * 1000),
        "ip":           ip,
        "protocol":     protocol,
        "attack_type":  attack_type,
        "severity":     severity,
        "geo":          geo,
        "payload_hash": phash,
        "dwell_time":   round(dwell, 2),
        "payload_count":len(payloads),
        "logs":         payloads[:20],
        "timestamp":    datetime.datetime.now().isoformat(),
    }


# ── SSH Decoy (TCP/2222) ──────────────────────────────────────────────────────
SSH_BANNER   = b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.3\r\n"
SSH_FAKEAUTH = b"Authentication failed.\r\nPermission denied (publickey,password).\r\n"

def _handle_ssh(client: socket.socket, addr):
    start = time.time()
    payloads = []
    try:
        # Signal session start
        try:
            requests.post(f"{BACKEND_API}/honeypot/session", json={"action": "start"}, timeout=2)
        except Exception:
            pass

        client.settimeout(8.0)
        client.send(SSH_BANNER)

        while len(payloads) < 12:
            data = client.recv(1024)
            if not data:
                break
            decoded = data.decode("utf-8", errors="replace").strip()
            payloads.append(decoded)
            print(f"[SSH-Decoy] {addr[0]} → {decoded[:64]!r}", flush=True)

            # Respond with auth failure after every attempt
            if any(k in decoded.lower() for k in ("pass", "user", "auth")):
                client.send(SSH_FAKEAUTH)
            time.sleep(0.3)  # throttle attacker
    except Exception:
        pass
    finally:
        client.close()

    dwell = time.time() - start
    combined = " ".join(payloads)
    atype, sev = classify_payload(combined)
    if not payloads:
        atype, sev = "SSH Port Knock", "low"

    session = _build_session(addr[0], "SSH", payloads, dwell, atype, sev)
    print(f"[SSH-Decoy] Session closed: {addr[0]} | {atype} | {sev} | {round(dwell,1)}s", flush=True)
    report_engagement(session)


# ── HTTP Decoy (TCP/8080) ─────────────────────────────────────────────────────
HTTP_RESPONSES = {
    "/admin":      b"HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm=\"Admin\"\r\n\r\n",
    "/login":      b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<form>Invalid credentials</form>",
    "/.env":       b"HTTP/1.1 403 Forbidden\r\n\r\n",
    "/wp-login":   b"HTTP/1.1 200 OK\r\n\r\nWordPress login",
    "default":     b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<html><title>Admin Panel</title></html>",
}

def _handle_http(client: socket.socket, addr):
    start = time.time()
    payloads = []
    try:
        client.settimeout(6.0)
        data = client.recv(4096)
        if data:
            decoded = data.decode("utf-8", errors="replace")
            payloads.append(decoded[:512])
            print(f"[HTTP-Decoy] {addr[0]} → {decoded[:80]!r}", flush=True)

            # Pick matching response
            resp = HTTP_RESPONSES["default"]
            for path, r in HTTP_RESPONSES.items():
                if path != "default" and path in decoded:
                    resp = r
                    break
            client.send(resp)
    except Exception:
        pass
    finally:
        client.close()

    combined = " ".join(payloads)
    atype, sev = classify_payload(combined) if payloads else ("HTTP Probe", "low")
    session = _build_session(addr[0], "HTTP", payloads, time.time() - start, atype, sev)
    print(f"[HTTP-Decoy] {addr[0]} | {atype} | {sev}", flush=True)
    report_engagement(session)


# ── SMTP Decoy (TCP/2525) ─────────────────────────────────────────────────────
SMTP_BANNER = b"220 mail.securevision.ai ESMTP\r\n"
SMTP_OK     = b"250 OK\r\n"
SMTP_READY  = b"354 Start mail input; end with <CRLF>.<CRLF>\r\n"
SMTP_BYE    = b"221 Bye\r\n"

def _handle_smtp(client: socket.socket, addr):
    start, payloads = time.time(), []
    try:
        client.settimeout(8.0)
        client.send(SMTP_BANNER)
        for _ in range(20):
            data = client.recv(1024)
            if not data: break
            decoded = data.decode("utf-8", errors="replace").strip()
            payloads.append(decoded)
            print(f"[SMTP-Decoy] {addr[0]} → {decoded[:60]!r}", flush=True)
            # Fake positive responses to lure attacker further
            if decoded.upper().startswith("DATA"):
                client.send(SMTP_READY)
            elif decoded.strip() == ".":
                client.send(SMTP_OK); client.send(SMTP_BYE); break
            elif decoded.upper().startswith("QUIT"):
                client.send(SMTP_BYE); break
            else:
                client.send(SMTP_OK)
    except Exception:
        pass
    finally:
        client.close()

    combined = " ".join(payloads)
    atype, sev = classify_payload(combined) if payloads else ("SMTP Probe", "low")
    session = _build_session(addr[0], "SMTP", payloads, time.time() - start, atype, sev)
    print(f"[SMTP-Decoy] {addr[0]} | {atype} | {sev}", flush=True)
    report_engagement(session)


# ── FTP Decoy (TCP/2121) ──────────────────────────────────────────────────────
FTP_BANNER   = b"220 SecureVision FTP server ready.\r\n"
FTP_USER_OK  = b"331 Password required\r\n"
FTP_PASS_FAIL= b"530 Login incorrect.\r\n"
FTP_BYE      = b"221 Goodbye.\r\n"

def _handle_ftp(client: socket.socket, addr):
    start, payloads = time.time(), []
    try:
        client.settimeout(8.0)
        client.send(FTP_BANNER)
        for _ in range(20):
            data = client.recv(1024)
            if not data: break
            decoded = data.decode("utf-8", errors="replace").strip()
            payloads.append(decoded)
            print(f"[FTP-Decoy] {addr[0]} → {decoded[:60]!r}", flush=True)
            upper = decoded.upper()
            if upper.startswith("USER"):
                client.send(FTP_USER_OK)
            elif upper.startswith("PASS"):
                client.send(FTP_PASS_FAIL)
                time.sleep(1)   # slow-down brute force
            elif upper.startswith("QUIT"):
                client.send(FTP_BYE); break
            else:
                client.send(b"502 Command not implemented\r\n")
    except Exception:
        pass
    finally:
        client.close()

    combined = " ".join(payloads)
    atype, sev = classify_payload(combined) if payloads else ("FTP Probe", "low")
    session = _build_session(addr[0], "FTP", payloads, time.time() - start, atype, sev)
    print(f"[FTP-Decoy] {addr[0]} | {atype} | {sev}", flush=True)
    report_engagement(session)


# ──────────────────────────────────────────────────────────────────────────────
# Decoy Server Factory
# ──────────────────────────────────────────────────────────────────────────────
def _start_decoy(port: int, handler, protocol: str):
    """Launches a TCP listener on `port` dispatching to `handler` per-connection."""
    def _serve():
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            srv.bind(("0.0.0.0", port))
        except OSError as e:
            print(f"[Honeypot] Could not bind {protocol} on port {port}: {e}")
            return
        srv.listen(20)
        print(f"[Honeypot] {protocol} decoy active on port {port}", flush=True)
        while True:
            try:
                client, addr = srv.accept()
                threading.Thread(
                    target=handler, args=(client, addr), daemon=True
                ).start()
            except Exception as e:
                print(f"[Honeypot] {protocol} accept error: {e}")

    threading.Thread(target=_serve, daemon=True, name=f"honeypot-{protocol}").start()


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────
def start_honeypot_grid(
    ssh_port:  int = 2222,
    http_port: int = 8080,
    smtp_port: int = 2525,
    ftp_port:  int = 2121,
):
    """
    Starts all four decoy servers in daemon threads.
    Call this once from main.py startup event.
    """
    print("[Honeypot] Initialising SecureVision Deception Grid v2.0 …", flush=True)
    _start_decoy(ssh_port,  _handle_ssh,  "SSH")
    _start_decoy(http_port, _handle_http, "HTTP")
    _start_decoy(smtp_port, _handle_smtp, "SMTP")
    _start_decoy(ftp_port,  _handle_ftp,  "FTP")
    print(
        f"[Honeypot] Grid online — SSH:{ssh_port} HTTP:{http_port} "
        f"SMTP:{smtp_port} FTP:{ftp_port}",
        flush=True
    )


# ──────────────────────────────────────────────────────────────────────────────
# Standalone mode (python honeypot.py [ssh_port])
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    ssh  = int(sys.argv[1]) if len(sys.argv) > 1 else 2222
    http = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
    smtp = int(sys.argv[3]) if len(sys.argv) > 3 else 2525
    ftp  = int(sys.argv[4]) if len(sys.argv) > 4 else 2121
    start_honeypot_grid(ssh, http, smtp, ftp)

    # Keep alive
    print("[Honeypot] Running. Ctrl+C to stop.", flush=True)
    try:
        while True:
            time.sleep(10)
            with _log_lock:
                print(f"[Honeypot] Events captured: {len(engagement_log)}", flush=True)
    except KeyboardInterrupt:
        print("\n[Honeypot] Grid shutdown.")
