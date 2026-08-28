<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Python 3.11][python-shield]][python-url]
[![FastAPI][fastapi-shield]][fastapi-url]
[![React][react-shield]][react-url]
[![PyTorch][pytorch-shield]][pytorch-url]
[![License: MIT][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1>🎯 COR-HARP</h1>
  <h3>Humanitarian AI Resource Predictor</h3>
  <p>
    <strong>Open-source AI for humanitarian operations in Northeast Nigeria</strong>
    <br />
    Built for aid workers, NGOs, SEMA, and NEMA operating in Borno State
  </p>

  <a href="https://cor-harp-api.azurewebsites.net/docs">API Docs</a>
  ·
  <a href="https://icy-river-0d05cf50f.7.azurestaticapps.net">Live Demo</a>
  ·
  <a href="https://github.com/gonisulaimann/COR-HAIRP/issues">Report Bug</a>
  ·
  <a href="https://github.com/gonisulaimann/COR-HAIRP/issues">Request Feature</a>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#quickstart">Quickstart</a></li>
    <li><a href="#api-reference">API Reference</a></li>
    <li><a href="#data-sources">Data Sources</a></li>
    <li><a href="#model-details">Model Details</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About The Project

**COR-HARP** (Humanitarian AI Resource Predictor) is an open-source operational intelligence platform designed for humanitarian aid workers operating in Northeast Nigeria. The platform integrates:

- **LSTM Forecasting**: A 941K-parameter deep learning model for predicting conflict events and displacement patterns
- **MILP Optimization**: Operations research solver for humanitarian supply chain optimization
- **Geospatial Intelligence**: Interactive mapping with real-time data visualization
- **Multi-Agent Simulation**: AI-powered scenario planning for humanitarian response

Built with data from [OCHA ReliefWeb](https://data.humdata.org/), [WFP VAM](https://dataviz.vam.wfp.org/), [IOM DTM](https://dtm.iom.int/), and [IPC](https://www.ipcinfo.org/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Real-time LSTM Forecasting** | 941K-parameter model predicting conflict events across 5 LGAs |
| **MILP Supply Chain Optimizer** | PuLP-based optimization with Monte Carlo simulation |
| **Interactive Geospatial Dashboard** | Leaflet.js maps with real-time markers and corridors |
| **KPI Monitoring** | Live dashboard with IDP population, food security, and risk metrics |
| **User Authentication** | Secure login with OTP email verification |
| **RESTful API** | FastAPI backend with auto-generated OpenAPI documentation |
| **Multi-Agent Copilot** | AI-powered scenario planning interface |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Recharts, React-Leaflet, Tailwind CSS |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic, SQLite |
| **ML/AI** | PyTorch (941K params), scikit-learn, NumPy |
| **Optimization** | PuLP MILP solver, Monte Carlo simulation |
| **Auth** | SHA-256 hashing, SendGrid OTP, session tokens |
| **Geospatial** | Leaflet.js, OpenStreetMap, CartoDB tiles |
| **Deployment** | Azure App Service, Azure Static Web Apps, GitHub Actions |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Architecture

```
COR-HAIRP/
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Dashboard, Map, Forecast, Optimizer
│   │   └── api/        # Axios client for backend
│   └── package.json
│
├── backend/            # FastAPI REST API
│   ├── main.py         # FastAPI app with all routes
│   ├── ml.py           # ML inference (wraps train_lstm.py)
│   ├── auth.py         # Authentication & user management
│   ├── schemas.py      # Pydantic request/response models
│   └── requirements.txt
│
├── hairp_app/          # Legacy Streamlit app (production fallback)
│   ├── app.py          # Full-stack Streamlit monolith
│   ├── train_lstm.py   # LSTM model training pipeline
│   ├── train_lstm_v2.py # V2 LSTM with attention
│   ├── optimizer.py    # MILP + Monte Carlo optimizer
│   └── models/         # Trained model weights
│
├── data/               # Humanitarian datasets
├── setup.sh            # One-command setup (Mac/Linux)
├── setup.bat           # One-command setup (Windows)
├── DATA_SOURCES.md     # Dataset provenance & licensing
└── LICENSE             # MIT License
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Quickstart

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### One-Command Setup

```bash
git clone https://github.com/gonisulaimann/COR-HAIRP.git
cd COR-HAIRP
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Python Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

#### 3. Backend

```bash
uvicorn backend.main:app --reload --port 8000
```

#### 4. Environment Variables

Copy `.env.example` to `.env` and configure your API keys:

```bash
cp hairp_app/.env.example hairp_app/.env
# Edit .env with your SendGrid, Validect API keys
```

### Running Locally

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Legacy Streamlit**: `cd hairp_app && streamlit run app.py`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/register` | Register + send OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP, complete registration |
| `GET` | `/api/kpis` | Dashboard KPI summary cards |
| `POST` | `/api/forecast/borno` | LSTM forecast for a specific LGA |
| `GET` | `/api/forecast/multi-lga` | Predictions for all LGAs |
| `GET` | `/api/map/markers` | Map markers & transit corridors |
| `POST` | `/api/optimize` | MILP + Monte Carlo optimization |
| `GET` | `/api/ml/sensitivity` | Feature importance analysis |
| `GET` | `/api/telemetry` | System telemetry & model info |
| `GET` | `/api/audit` | Audit trail |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Data Sources

COR-HARP integrates data from leading humanitarian data providers:

| Source | Dataset | License |
|--------|---------|---------|
| [OCHA ReliefWeb](https://data.humdata.org/) | Political Violence Events & Fatalities | CC BY-IGO |
| [WFP VAM](https://dataviz.vam.wfp.org/) | Food Prices Database | CC BY 4.0 |
| [IOM DTM](https://dtm.iom.int/) | Displacement Tracking Matrix | CC BY 4.0 |
| [IPC](https://www.ipcinfo.org/) | Acute Food Insecurity Data | CC BY-NC-SA 3.0 IGO |
| [IDMC](https://www.internal-displacement.org/) | Internal Displacement Data | CC BY 4.0 |

See [DATA_SOURCES.md](DATA_SOURCES.md) for complete dataset documentation including download links and licensing details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Model Details

### LSTM v2.3 (941K Parameters)

- **Architecture**: 3-layer LSTM with multi-head attention
- **Hidden Size**: 192
- **Input Features**: 23 (conflict, food prices, IDP, IPC)
- **Output**: Monthly conflict event predictions
- **Training**: 100 epochs, Adam optimizer, MSE loss

### Features Used

1. Conflict events per LGA
2. Fatalities per LGA
3. Food prices (Rice, Millet, Sorghum, Maize)
4. IPC Phase 3+ population percentages
5. IDP camp populations
6. Displacement flows

### MILP Optimizer

- **Objective**: Minimize total cost + equity penalty
- **Constraints**: Supply capacity, demand, route capacity
- **Monte Carlo**: 100+ iterations for uncertainty quantification

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code restructuring
- `docs/` — Documentation updates

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgments

- [OCHA Humanitarian Data Exchange](https://data.humdata.org/) — Open data for humanitarian response
- [WFP VAM Food Prices Database](https://dataviz.vam.wfp.org/) — Global food price monitoring
- [IOM Displacement Tracking Matrix](https://dtm.iom.int/) — Displacement data and analysis
- [IPC Global Support Unit](https://www.ipcinfo.org/) — Food insecurity classification
- [PyTorch](https://pytorch.org/) — Deep learning framework
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [React](https://react.dev/) — Frontend UI library
- [Leaflet.js](https://leafletjs.com/) — Interactive maps

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[python-shield]: https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white
[python-url]: https://www.python.org/
[fastapi-shield]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[fastapi-url]: https://fastapi.tiangolo.com/
[react-shield]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://react.dev/
[pytorch-shield]: https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white
[pytorch-url]: https://pytorch.org/
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://github.com/gonisulaimann/COR-HAIRP/blob/main/LICENSE
