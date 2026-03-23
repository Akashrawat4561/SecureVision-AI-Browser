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
import paramiko

from core.logger import logger

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

# Generate an ephemeral key for the honeypot
SSH_RSA_KEY = paramiko.RSAKey.generate(2048)

class FakeSSHServer(paramiko.ServerInterface):
    def __init__(self, addr):
        self.event = threading.Event()
        self.addr = addr

    def check_auth_password(self, username, password):
        logger.info(f"[SSH-Decoy] {self.addr[0]} auth attempt - user:{username} pass:{password}")
        return paramiko.AUTH_SUCCESSFUL

    def check_auth_publickey(self, username, key):
        return paramiko.AUTH_SUCCESSFUL

    def get_allowed_auths(self, username):
        return 'password,publickey'

    def check_channel_request(self, kind, chanid):
        if kind == 'session':
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

def _handle_ssh(client: socket.socket, addr):
    start = time.time()
    payloads = []
    try:
        transport = paramiko.Transport(client)
        transport.add_server_key(SSH_RSA_KEY)
        server = FakeSSHServer(addr)
        
        try:
            transport.start_server(server=server)
        except paramiko.SSHException:
            return

        channel = transport.accept(20)
        if channel is None:
            return

        server.event.wait(10)
        if not server.event.is_set():
            return

        channel.send("Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-101-generic x86_64)\r\n\r\n")
        channel.send(" * Documentation:  https://help.ubuntu.com\r\n")
        channel.send(" * Management:     https://landscape.canonical.com\r\n")
        channel.send(" * Support:        https://ubuntu.com/advantage\r\n\r\n")
        
        cwd = "/root"
        while True:
            channel.send(f"root@secure-node:{cwd}# ")
            command = ""
            while True:
                char = channel.recv(1).decode("utf-8", "ignore")
                if not char:
                    break
                if char == "\r":
                    channel.send("\r\n")
                    break
                elif char == "\n":
                    pass
                elif char in ('\x08', '\x7f'): # backspace
                    if len(command) > 0:
                        command = command[:-1]
                        channel.send('\x08 \x08')
                else:
                    command += char
                    channel.send(char)
            
            command = command.strip()
            if not command: continue
            
            payloads.append(command)
            logger.info(f"[SSH-Decoy] {addr[0]} ran: {command}")
            
            cmd_lower = command.lower()
            if cmd_lower in ("exit", "logout"):
                break
            elif cmd_lower.startswith("ls"):
                if cwd == "/root":
                    channel.send("snap  install.sh  miner.py  .ssh  .bash_history\r\n")
                elif cwd == "/":
                    channel.send("bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var\r\n")
                else:
                    channel.send("\r\n")
            elif cmd_lower == "whoami":
                channel.send("root\r\n")
            elif cmd_lower == "pwd":
                channel.send(f"{cwd}\r\n")
            elif cmd_lower.startswith("cd "):
                cwd = command[3:].strip()
            elif cmd_lower.startswith("cat "):
                channel.send("Permission denied\r\n")
            else:
                channel.send(f"{command.split()[0]}: command not found\r\n")
                
    except Exception as e:
        logger.error(f"[SSH-Decoy] Session error {addr[0]}: {e}")
    finally:
        client.close()

    dwell = time.time() - start
    combined = " ".join(payloads)
    atype, sev = classify_payload(combined)
    if not payloads:
        atype, sev = "SSH Port Knock", "low"

    session = _build_session(addr[0], "SSH", payloads, dwell, atype, sev)
    logger.info(f"[SSH-Decoy] Session closed: {addr[0]} | {atype} | {sev} | {round(dwell,1)}s")
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
            logger.info(f"[HTTP-Decoy] {addr[0]} → {decoded[:80]!r}")

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
    logger.info(f"[HTTP-Decoy] {addr[0]} | {atype} | {sev}")
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
            logger.info(f"[SMTP-Decoy] {addr[0]} → {decoded[:60]!r}")
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
    logger.info(f"[SMTP-Decoy] {addr[0]} | {atype} | {sev}")
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
            logger.info(f"[FTP-Decoy] {addr[0]} → {decoded[:60]!r}")
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
    logger.info(f"[FTP-Decoy] {addr[0]} | {atype} | {sev}")
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
            logger.info(f"[Honeypot] Could not bind {protocol} on port {port}: {e}")
            return
        srv.listen(20)
        logger.info(f"[Honeypot] {protocol} decoy active on port {port}")
        while True:
            try:
                client, addr = srv.accept()
                threading.Thread(
                    target=handler, args=(client, addr), daemon=True
                ).start()
            except Exception as e:
                logger.info(f"[Honeypot] {protocol} accept error: {e}")

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
    logger.info("[Honeypot] Initialising SecureVision Deception Grid v2.0 …")
    _start_decoy(ssh_port,  _handle_ssh,  "SSH")
    _start_decoy(http_port, _handle_http, "HTTP")
    _start_decoy(smtp_port, _handle_smtp, "SMTP")
    _start_decoy(ftp_port,  _handle_ftp,  "FTP")
    logger.info(
        f"[Honeypot] Grid online — SSH:{ssh_port} HTTP:{http_port} "
        f"SMTP:{smtp_port} FTP:{ftp_port}"
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
    logger.info("[Honeypot] Running. Ctrl+C to stop.")
    try:
        while True:
            time.sleep(10)
            with _log_lock:
                logger.info(f"[Honeypot] Events captured: {len(engagement_log)}")
    except KeyboardInterrupt:
        logger.info("\n[Honeypot] Grid shutdown.")
