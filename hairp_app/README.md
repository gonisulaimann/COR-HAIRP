# COR-HARP: Humanitarian AI Resource Predictor

**Borno State Operations Dashboard — UN OCHA Partnership**

An advanced operational intelligence platform engineered for NGOs operating in Maiduguri, Nigeria. COR-HARP integrates a 221,057-parameter PyTorch LSTM forecasting engine, a PuLP MILP operations research optimizer, and an interactive geospatial command center — all running 100% offline.

---

## Quick Start

### 1. Clone the repository

```bash
git clone git@github.com:gonisulaimann/COR-HAIRP.git
cd COR-HAIRP
```

### 2. Set up Python environment

```bash
python3 -m venv venv
source venv/bin/activate    # macOS/Linux
# or: venv\Scripts\activate  # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Add data files

The `data/` folder is excluded from Git (files are >100MB each). You need these files locally:

| File | Source |
|------|--------|
| `data/nigeria_hrp_political_violence_events_and_fatalities_by_month-year_as-of_13aug2026.xlsx` | ACLED |
| `data/wfp_food_prices_nga.csv` | WFP VAM |
| `data/ipc_nga_area_wide.csv` | IPC |
| `data/hdx_dtm_nigeria_r43_master_list_idp.xlsx` | HDX / IOM DTM |
| `data/grid3_nga_operational_wards_v3_0.gpkg` | Grid3 Nigeria |

Place them in a `data/` folder at the project root (sibling to `hairp_app/`).

### 5. Train the LSTM model

```bash
cd hairp_app
python train_lstm.py
```

This scans `../data/`, trains the LSTM, and saves weights to `hairp_app/models/`.

### 6. Launch the dashboard

```bash
streamlit run app.py
```

Opens at `http://localhost:8501`.

---

## Project Structure

```
COR-HAIRP/
├── LICENSE
├── README.md
├── requirements.txt
├── data/                          # Large datasets (not in Git)
│   ├── *.xlsx                     # Conflict, IDP, IPC data
│   ├── *.csv                      # Food prices
│   └── *.gpkg                     # Grid3 geospatial data
└── hairp_app/
    ├── app.py                     # Main Streamlit application (~4,400 lines)
    ├── train_lstm.py              # PyTorch LSTM training pipeline
    ├── optimizer.py               # PuLP MILP + Monte Carlo optimizer
    ├── users.json                 # User accounts database
    ├── models/
    │   ├── borno_lstm.pth         # Trained LSTM weights
    │   ├── borno_scaler.json      # Feature scaler parameters
    │   └── feature_names.json     # 23-feature schema
    └── media/
        ├── OCHA.png               # UN OCHA logo
        └── login flower.png       # Login background
```

---

## Architecture

### Core ML Pipeline

- **LSTM Forecasting Engine** — 221,057-parameter PyTorch LSTM (2-layer, hidden=128) trained on 23 humanitarian features across 103 monthly sequences
- **XGBoost Classification** — Subnational risk probability models for conflict surge prediction
- **MILP Optimizer** — PuLP bi-objective supply-chain solver with GRASP tabu-search and Monte Carlo stochastic simulation

### Dashboard Modules (20 Pages)

**Tier I — Tactical Command & Spatial Ops**
1. Master Spatial Command Map (Folium + CartoDB Dark Matter)
2. Autonomous Multi-Agent Copilot
3. Threat & Emergency Broadcast Center
4. Executive Situation Report
5. Real-Time Logistics Dispatch Board
6. Camp Vulnerability & Displacement Matrix
7. Access & Corridor Viability Analyzer
8. Inter-Agency Liaison Directory

**Tier II — Neural Network & Predictive Analytics**
9. Data Ingestion Inspector
10. Deep Learning Inference Engine
11. Conflict Surge Classification Hub
12. Neural Counterfactual Simulator
13. Temporal Trend Extrapolator
14. Feature Importance & Attention Matrix

**Tier III — Mathematical Optimization & Diagnostics**
15. MILP Supply Chain Optimizer
16. Stochastic Monte Carlo Risk Assessor
17. Resource Allocation & Equity Engine
18. User Management (Admin Only)
19. System Telemetry
20. Audit Trail & Session Logs

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Streamlit, Plotly, Folium, CSS (glassmorphism) |
| ML/AI | PyTorch LSTM, Scikit-learn |
| Optimization | PuLP (MILP), Monte Carlo simulation |
| Data | Pandas, NumPy, GeoPandas |
| Auth | SHA-256 password hashing, SQLite/JSON persistence |
| External | HDX HAPI v2, SendGrid OTP, Folium/Leaflet maps |

---

## Contributing

### Branch Naming

```
feature/short-description    # New features
fix/short-description        # Bug fixes
ui/short-description         # UI/UX changes
```

### Workflow

1. Create a branch from `main`
2. Make your changes
3. Test locally with `streamlit run app.py`
4. Commit with a descriptive message
5. Push and open a Pull Request for review

### Code Style

- Python: PEP 8 compatible
- CSS: Use existing design tokens (`--corharp-blue`, `--glass-bg`, etc.)
- Components: Follow existing patterns in `app.py`

---

## License

MIT License — see [LICENSE](LICENSE)

---

## Contact

**COR-HARP Engineering** — Partnership with UN OCHA

For questions about this repository, open an issue or reach out to the maintainers.
