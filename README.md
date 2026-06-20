# GridLock Command Center

GridLock is an event-driven congestion pipeline for the Bengaluru Traffic Police. It ingests historical and hypothetical traffic events, processes them through a multi-stage machine learning pipeline (closure triage, duration prediction, spatial conflict detection, and network routing), and surfaces actionable advisories via a React/Vite dashboard.

This repository is divided into two primary standalone systems:

1. **`backend/`** — A FastAPI REST API containing the ML models, spatial logic, and Pydantic schemas.
2. **`frontend/`** — A React 18 Single Page Application (SPA) built with Vite and TypeScript, employing a custom dark mode UI.

## Getting Started

Convenience scripts are provided in the root directory to easily set up and boot the frontend and backend servers concurrently for both Windows and Linux/macOS.

### Prerequisites

- Python 3.12+
- Node.js (v18+) & NPM

### Setup (First time only)

**For Windows:**
Double-click `setup.bat` or run it in your terminal:
```cmd
setup.bat
```

**For Linux / macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Run the Application

**For Windows:**
Double-click `run.bat` or run it in your terminal:
```cmd
run.bat
```

**For Linux / macOS:**
```bash
chmod +x run.sh
./run.sh
```

This will automatically start both servers concurrently:
- **Backend API:** `http://localhost:8000` (Access the Swagger UI at `/docs`)
- **Frontend UI:** `http://localhost:5173`

> **Note:** The backend loads ~18MB of ML artifacts and spatial graphs into memory on boot. It may take 10-25 seconds before the endpoints become responsive.
