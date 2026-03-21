# SecureVision AI 🛡️

An advanced AI-powered cybersecurity platform with real-time threat detection, deepfake analysis, anomaly detection, honeypot monitoring, and predictive simulation.

---

## Project Structure

```
18/
├── .env                        # Environment variables (API keys, DB config, etc.)
├── .venv/                      # Python virtual environment (shared)
├── docker-compose.yml          # Docker orchestration for full stack
├── README.md                   # This file
│
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # Root entry point
│   ├── app/                    # Core application logic
│   │   ├── main.py             # FastAPI App instance
│   │   ├── api/                # API routes
│   │   ├── engines/            # AI & Simulation engines
│   │   │   ├── deepfake_engine.py
│   │   │   ├── ml_engine.py
│   │   │   ├── honeypot.py
│   │   │   └── predictive_sim.py
│   │   ├── models/             # Local data & models
│   │   │   ├── users.json
│   │   │   └── anomaly_model.pkl
│   │   ├── data/               # Datasets
│   │   ├── utils/              # Shared utilities
│   │   └── logs/               # Application logs
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/                   # React + Vite + TypeScript frontend
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── components/         # Reusable UI components
        │   ├── Header.tsx
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── Sidebar.tsx
        │   ├── Terminal.tsx
        │   └── ThreatMap.tsx
        ├── context/            # React context providers
        │   ├── AuthContext.tsx
        │   └── WebSocketContext.tsx
        └── pages/              # Route-level page components
            ├── Landing.tsx
            ├── AuthPage.tsx
            ├── Dashboard.tsx
            ├── Anomaly.tsx
            ├── Deepfake.tsx
            ├── Honeypot.tsx
            ├── Phishing.tsx
            ├── Predictive.tsx
            ├── EdgeStatus.tsx
            ├── Architecture.tsx
            ├── IntelSharing.tsx
            ├── ResponseCenter.tsx
            └── Settings.tsx
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

### Backend Setup

```bash
# Activate virtual environment
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

---

## Environment Variables

Copy `.env` and fill in your values:

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT secret key |
| `DATABASE_URL` | Database connection string |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) |

---

## Features

- 🔍 **Deepfake Detection** — Analyze images, videos, and URLs for AI-generated content
- 📊 **Anomaly Detection** — Real-time network traffic anomaly detection via ML
- 🍯 **Honeypot Monitoring** — Monitor and log attacker interactions
- 🎯 **Predictive Simulation** — Simulate and predict threat scenarios
- 🗺️ **Threat Map** — Live global threat visualization
- 💻 **Live Terminal** — Real-time command output via WebSocket
- 🔐 **Authentication** — JWT-based secure auth system
