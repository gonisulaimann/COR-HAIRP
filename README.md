# COR-HARP: Humanitarian AI Resource Predictor

**Open-Source AI for Humanitarian Operations in Northeast Nigeria**

An open-source operational intelligence platform built for aid workers, NGOs, SEMA, and NEMA operating in Borno State, Nigeria. COR-HARP integrates a **941K-parameter LSTM forecasting engine**, a PuLP MILP operations research optimizer, and an interactive geospatial command center.

> Built with data from [OCHA ReliefWeb](https://data.humdata.org/), [WFP VAM](https://dataviz.vam.wfp.org/), [IOM DTM](https://dtm.iom.int/), and [IPC](https://www.ipcinfo.org/) — licensed under Creative Commons.

---

## Architecture

```
COR-HAIRP/
├── hairp_app/          # Original Streamlit app (production fallback)
│   ├── app.py          # Full-stack Streamlit monolith (4,400+ lines)
│   ├── train_lstm.py   # LSTM model training pipeline
│   ├── optimizer.py    # MILP + Monte Carlo optimizer
│   ├── models/         # Trained model weights & scaler
│   └── users.db        # SQLite user database
│
├── backend/            # NEW: FastAPI REST API
│   ├── main.py         # FastAPI app with all routes
│   ├── ml.py           # ML inference (wraps train_lstm.py)
│   ├── auth.py         # Authentication & user management
│   ├── schemas.py      # Pydantic request/response models
│   └── requirements.txt
│
├── frontend/           # NEW: React + Vite SPA
│   ├── src/
│   │   ├── App.jsx     # Main app with sidebar routing
│   │   ├── api.js      # API client (fetches from FastAPI)
│   │   └── pages/      # Dashboard, Map, Forecast, Optimizer
│   └── package.json
│
├── data:/              # Humanitarian datasets (NOT in Git)
├── setup.sh            # One-command setup (Mac/Linux)
├── setup.bat           # One-command setup (Windows)
└── DATA_SOURCES.md     # Dataset provenance & licensing
```

---

## Quick Start

### One-Command Setup

```bash
git clone git@github.com:gonisulaimann/COR-HAIRP.git
cd COR-HAIRP
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Python Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r hairp_app/requirements.txt
pip install -r backend/requirements.txt
```

#### 2. Add Data Files

Place the required datasets in `data:/`:
- `nigeria_hrp_political_violence_events_and_fatalities_by_month-year_as-of-13aug2026.xlsx`
- `wfp_food_prices_nga.csv`
- `ipc_nga_area_wide.csv`
- `hdx_dtm_nigeria_r43_master_list_idp.xlsx`

See [DATA_SOURCES.md](DATA_SOURCES.md) for download links and licensing.

#### 3. Train the LSTM Model

```bash
cd hairp_app
python train_lstm.py --epochs 100
```

#### 4. Configure Environment Variables

```bash
cp hairp_app/.env.example hairp_app/.env  # if available
# Edit hairp_app/.env with your API keys (SendGrid, Validect, etc.)
```

---

## Running the Application

### Option A: Original Streamlit App (Fallback)

```bash
cd hairp_app
streamlit run app.py
```

Opens at `http://localhost:8501`. This is the full monolith with 20 menu modules.

### Option B: Decoupled Architecture (Recommended)

**Terminal 1 — FastAPI Backend:**
```bash
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — React Frontend:**
```bash
cd frontend
npm install  # first time only
npm run dev
```

- **API Docs:** http://localhost:8000/docs (auto-generated OpenAPI)
- **Frontend:** http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/register` | Register + send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP, complete registration |
| GET | `/api/kpis` | Dashboard KPI summary cards |
| POST | `/api/forecast/borno` | LSTM forecast for a specific LGA |
| GET | `/api/forecast/multi-lga` | Predictions for all LGAs |
| GET | `/api/map/markers` | Map markers & transit corridors |
| POST | `/api/optimize` | MILP + Monte Carlo optimization |
| GET | `/api/ml/sensitivity` | Feature importance analysis |
| GET | `/api/telemetry` | System telemetry & model info |
| GET | `/api/audit` | Audit trail |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Recharts, React-Leaflet, Animate.css, anime.js |
| Backend | FastAPI, Uvicorn, Pydantic, CORS |
| ML/AI | PyTorch LSTM (221K params), scikit-learn MinMaxScaler |
| Optimization | PuLP MILP solver, NumPy Monte Carlo simulation |
| Auth | SHA-256 password hashing, SendGrid OTP, SQLite |
| Geospatial | Folium (Leaflet.js), CartoDB Dark Matter tiles |
| Original UI | Streamlit (production fallback) |

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes in `frontend/` (React) or `backend/` (API)
3. The original `hairp_app/app.py` should not be modified unless necessary
4. Open a Pull Request for review

### Branch Naming
- `feature/` — new features
- `fix/` — bug fixes
- `refactor/` — code restructuring

---

## Data Provenance

See [DATA_SOURCES.md](DATA_SOURCES.md) for complete dataset documentation including sources, licenses, and last-updated dates.

---

## License

See [LICENSE](LICENSE) for details.

---

**COR-HARP v2.3** | Open Source | Built for humanitarian aid workers in Northeast Nigeria
