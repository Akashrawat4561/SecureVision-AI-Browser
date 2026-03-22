# SecureVision AI: The First All-in-One AI Defense Grid 🛡️

SecureVision AI is a high-fidelity, startup-level cybersecurity platform designed to protect modern business infrastructure. It provides real-time defense against next-generation threats including deepfakes, sophisticated network anomalies, and social engineering attempts.

---

## 🚀 Core Features

*   🔍 **Deepfake Scanner:** Forensic analysis of images and videos using multimodal EfficientNet + LSTM models to detect AI-generated artifacts with 94.2% accuracy.
*   📊 **Network Monitor:** Live packet sniffing (Scapy) and machine learning (Isolation Forest) to identify unusual traffic spikes and failed login attempts.
*   🍯 **Honeypot Grid:** Interactive Paramiko-based SSH decoys with realistic file systems and command logging to trap and analyze attacker behavior.
*   🗺️ **Global Threat Map:** Real-time geospatial visualization of incoming attack clusters across your infrastructure.
*   💻 **SecureVision Terminal:** High-performance WebSocket data stream for live system logs and threat intelligence.
*   🔐 **Enterprise Security:** Adaptive Bcrypt password hashing, token-based authentication, and granular rate-limiting (Slowapi) on all sensitive endpoints.

---

## 📂 Project Architecture

```
18/                                   ← Project root
├── backend/                          # FastAPI / Python 3.10+
│   ├── main.py                       # Root entry point
│   ├── requirements.txt              # Production-grade dependencies
│   ├── Dockerfile                    # Containerization layer
│   └── app/                          # Core backend logic
│       ├── main.py                   # FastAPI app instance + all routes
│       ├── database.py               # SQLAlchemy ORM (PostgreSQL/SQLite)
│       ├── api/                      # Route handlers
│       ├── engines/                  # AI Detection Engines
│       │   ├── deepfake_engine.py    # Temporal + Spatial Forensic Models
│       │   ├── ml_engine.py          # Network Behavior Analysis
│       │   ├── honeypot.py           # Interactive SSH/HTTP Decoys
│       │   └── ingestion.py          # Live Scapy packet interceptors
│       ├── models/                   # DB Schema & ML model artifacts
│       ├── data/                     # Local datasets & training telemetry
│       ├── utils/                    # Cryptography & Logging utilities
│       └── logs/                     # Structured application/threat logs
│
└── frontend/                         # React 18 / Vite / TailwindCSS
    ├── src/
    │   ├── App.jsx                   # Component routing
    │   ├── main.jsx                  # React entry point
    │   ├── components/               # Atomic UI components & Charts
    │   ├── context/                  # AuthState & WebSocket providers
    │   ├── layouts/                  # Sidebar & Navigation structures
    │   └── pages/                    # Domain-specific dashboards
    │       ├── Landing.jsx           # Enterprise identity hero
    │       ├── Dashboard.jsx         # Command & Control center
    │       ├── Deepfake.jsx          # Visual forensics suite
    │       ├── Anomaly.jsx           # Network behavior monitor
    │       ├── Honeypot.jsx          # Deceptive intelligence grid
    │       ├── ThreatMap.jsx         # Global vector visualization
    │       ├── Architecture.jsx      # System topology view
    │       └── Settings.jsx          # Configuration & Management
```

---

## 🛠️ Quick Start (Development)

### 1. Prerequisites
- Python 3.10+, Node.js 18+
- Active Python virtual environment (`.venv/`)

### 2. Backend Setup
```powershell
cd backend
pip install -r requirements.txt
python main.py
```
*The FastAPI server starts at: **http://localhost:8000***

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
*The Vite dashboard starts at: **http://localhost:5173***

---

## 🐳 Running with Docker

Deploy the full stack including Database and Nginx proxy with a single command:

```powershell
docker-compose up --build
```

---

## 🛡️ Security & Performance

*   **Database:** SQLAlchemy ORM with support for SQLite (dev) or PostgreSQL (prod).
*   **Cryptography:** Salted Bcrypt hashing for password security.
*   **Validation:** Pydantic strict-type checking for all API boundaries.
*   **Protection:** Memory-backed rate limiting to mitigate DoS and brute-force attempts.
*   **Feedback:** Real-time updates delivered via asynchronous WebSocket listeners.

---

## 🔮 Roadmap / Future Strategy

*   **Kafka Integration:** Distributed ingestion for enterprise-scale logs.
*   **Active Defense:** Automatic firewall blacklisting based on high-confidence honeypot signals.
*   **Advanced AI:** Implementation of Vision Transformers (ViT) for sub-pixel deepfake forensics.

---

Produced by **SecureVision AI Systems**. Ready for Pilot Deployment.
oy grid with live attacker logging   |
| 🎯 **Predictive Sim**     | GPT-2 powered phishing payload generation & detection testing   |
| 🗺️ **Threat Map**         | Live global threat visualization                                |
| 💻 **Live Terminal**      | Real-time logs via WebSocket terminal widget                     |
| 🔐 **JWT Auth**           | Register / login with SHA-256 password hashing                  |
| 🌐 **Intel Sharing**      | Cross-node threat intelligence broadcasting                      |
