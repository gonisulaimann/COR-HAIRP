<!-- PROJECT SHIELDS -->
[![GitHub Release](https://img.shields.io/github/release/gonisulaimann/COR-HAIRP.svg?style=for-the-badge)](https://github.com/gonisulaimann/COR-HAIRP/releases)
[![GitHub Stars](https://img.shields.io/github/stars/gonisulaimann/COR-HAIRP.svg?style=for-the-badge)](https://github.com/gonisulaimann/COR-HAIRP/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/gonisulaimann/COR-HAIRP.svg?style=for-the-badge)](https://github.com/gonisulaimann/COR-HAIRP/network/members)
[![License](https://img.shields.io/badge/license-hippocratic-orange.svg?style=for-the-badge)](https://github.com/gonisulaimann/COR-HAIRP/blob/main/LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C.svg?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/gonisulaimann/COR-HAIRP">
    <img src="frontend/assets/HAIRP.png" alt="COR-HARP Logo" width="150" height="150">
  </a>

  <h1>COR-HARP</h1>
  <h3>Humanitarian AI Resource Predictor</h3>

  <p>
    <strong>Open-source AI for aid workers in Northeast Nigeria</strong>
  </p>

  <p>
    Real-time conflict forecasting • Supply chain optimization • Geospatial intelligence
  </p>

  <br />

  <a href="https://icy-river-0d05cf50f.7.azurestaticapps.net">🚀 Live Demo</a>
  ·
  <a href="https://cor-harp-api.azurewebsites.net/docs">📚 API Docs</a>
  ·
  <a href="https://github.com/gonisulaimann/COR-HAIRP/issues">🐛 Report Bug</a>
  ·
  <a href="https://github.com/gonisulaimann/COR-HAIRP/blob/main/CONTRIBUTING.md">🤝 Contributing</a>
</div>

---

<!-- ABOUT THE PROJECT -->
## 🎯 About

**COR-HARP** (Humanitarian AI Resource Predictor) is an open-source operational intelligence platform built specifically for humanitarian aid workers operating in Borno State, Northeast Nigeria.

> *"Technology should serve those who serve others."*

### Why COR-HARP?

Humanitarian workers in Northeast Nigeria face unprecedented challenges:
- **1.36M+** internally displaced persons (IDPs)
- **5** critically monitored Local Government Areas (LGAs)
- Complex supply chain logistics across conflict-affected zones
- Limited connectivity and infrastructure

COR-HARP provides **AI-powered decision support** to help aid workers:
- 📊 **Predict** conflict events before they happen
- 🚚 **Optimize** supply chain routes and resource allocation
- 🗺️ **Visualize** real-time humanitarian data on interactive maps
- 📈 **Monitor** key performance indicators across operations

### Built With Data From

| Source | Description | License |
|--------|-------------|---------|
| [OCHA ReliefWeb](https://data.humdata.org/) | Political Violence Events | CC BY-IGO |
| [WFP VAM](https://dataviz.vam.wfp.org/) | Food Prices Database | CC BY 4.0 |
| [IOM DTM](https://dtm.iom.int/) | Displacement Tracking | CC BY 4.0 |
| [IPC](https://www.ipcinfo.org/) | Food Insecurity Data | CC BY-NC-SA 3.0 |

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="33%">
      <h3>🧠 LSTM Forecasting</h3>
      <p>941K-parameter deep learning model predicting conflict events across 5 LGAs with 12-month horizons</p>
    </td>
    <td align="center" width="33%">
      <h3>🚚 MILP Optimization</h3>
      <p>Operations research solver optimizing humanitarian supply chains with Monte Carlo simulation</p>
    </td>
    <td align="center" width="33%">
      <h3>🗺️ Geospatial Intelligence</h3>
      <p>Interactive Leaflet.js maps with real-time markers, corridors, and risk visualization</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <h3>📊 KPI Dashboard</h3>
      <p>Live monitoring of IDP populations, food security phases, and operational metrics</p>
    </td>
    <td align="center">
      <h3>🔐 Secure Authentication</h3>
      <p>OTP email verification, role-based access, and audit logging</p>
    </td>
    <td align="center">
      <h3>🤖 Multi-Agent Copilot</h3>
      <p>AI-powered scenario planning for humanitarian response strategies</p>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

### One-Command Setup

```bash
git clone https://github.com/gonisulaimann/COR-HAIRP.git
cd COR-HAIRP
chmod +x setup.sh
./setup.sh
```

### Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/gonisulaimann/COR-HAIRP.git
cd COR-HAIRP

# 2. Setup Python environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Setup frontend
cd frontend
npm install
cd ..

# 4. Configure environment
cp hairp_app/.env.example hairp_app/.env
# Edit .env with your API keys

# 5. Start the servers
# Terminal 1 - Backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React dashboard |
| **Backend API** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | OpenAPI documentation |
| **Legacy UI** | http://localhost:8501 | Streamlit fallback |

---

## 📊 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/register` | Register + send OTP |
| `GET` | `/api/kpis` | Dashboard KPI summary |
| `POST` | `/api/forecast/borno` | LSTM forecast for LGA |
| `GET` | `/api/forecast/multi-lga` | All LGA predictions |
| `GET` | `/api/map/markers` | Map markers & corridors |
| `POST` | `/api/optimize` | MILP + Monte Carlo |
| `GET` | `/api/ml/sensitivity` | Feature importance |

---

## 🧠 Model Details

### LSTM v2.3 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    COR-HARP LSTM v2.3                   │
├─────────────────────────────────────────────────────────┤
│  Parameters:     941,441                                │
│  Architecture:   3-layer LSTM + Multi-Head Attention    │
│  Hidden Size:    192                                    │
│  Input Features: 23 (conflict, food, IDP, IPC)         │
│  Output:         Monthly conflict event predictions     │
│  Training:       100 epochs, Adam optimizer             │
└─────────────────────────────────────────────────────────┘
```

### Input Features

| Category | Features |
|----------|----------|
| **Conflict** | Events, fatalities, event types |
| **Food Security** | Rice, millet, sorghum, maize prices |
| **Displacement** | IDP camp populations, flows |
| **Nutrition** | IPC Phase 3+ percentages |

---

## 🏗️ Architecture

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
│   ├── ml.py           # ML inference engine
│   ├── auth.py         # Authentication & user management
│   └── schemas.py      # Pydantic models
│
├── hairp_app/          # Legacy Streamlit app
│   ├── app.py          # Full-stack monolith
│   ├── train_lstm.py   # LSTM training pipeline
│   └── optimizer.py    # MILP optimizer
│
├── data/               # Humanitarian datasets
├── docs/               # Documentation
└── setup.sh            # One-click setup
```

---

## 🤝 Contributing

We welcome contributions from the humanitarian and tech communities!

### Ways to Contribute

- 🐛 **Report bugs** — Help us fix issues
- 💡 **Suggest features** — Share your ideas
- 📝 **Improve docs** — Make information clearer
- 🧪 **Write tests** — Ensure reliability
- 🌍 **Translate** — Help aid workers worldwide
- 💬 **Support others** — Answer questions

### Quick Start

1. Read our [Contributing Guidelines](CONTRIBUTING.md)
2. Check [open issues](https://github.com/gonisulaimann/COR-HAIRP/issues)
3. Fork the repository
4. Create a feature branch
5. Submit a pull request

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

## 📜 License

This project is licensed under the **Hippocratic License 3.0** — see the [LICENSE](LICENSE) file for details.

**Documentation** is licensed under [CC BY 4.0](docs/LICENSE).

### What This Means

✅ **You can:**
- Use the software for humanitarian purposes
- Modify and distribute the code
- Create derivative works

❌ **You cannot:**
- Use the software for surveillance or oppression
- Use it to violate human rights
- Use it for weapons development

---

## 🙏 Acknowledgments

- [OCHA](https://www.unocha.org/) — Humanitarian data and coordination
- [WFP](https://www.wfp.org/) — Food security data
- [IOM](https://www.iom.int/) — Displacement tracking
- [IPC](https://www.ipcinfo.org/) — Food insecurity classification
- [PyTorch](https://pytorch.org/) — Deep learning framework
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python APIs
- [React](https://react.dev/) — Frontend framework
- [Leaflet](https://leafletjs.com/) — Interactive maps

---

<div align="center">

**Built with ❤️ for humanitarian aid workers**

*"In a world where you can be anything, be kind."*

<br />

[⬆ Back to Top](#-cor-harp)

</div>
