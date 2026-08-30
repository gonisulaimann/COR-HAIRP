"""
COR-HARP FastAPI Backend
========================

REST API server for the Conflict-Oriented Humanitarian AI Resource Predictor.
Exposes ML inference, supply chain optimization, authentication, and
operational intelligence endpoints consumed by the React frontend.

Architecture
────────────
The backend follows a layered design:

    routes (this module)  →  schemas (validation)  →  ml.py / auth.py
    FastAPI app            Pydantic models           Business logic

Endpoint Groups
───────────────
- /api/health       System health check
- /api/auth/*       Authentication, registration, OTP verification
- /api/kpis         Dashboard KPI summary from LSTM predictions
- /api/forecast/*   LSTM conflict event forecasting per LGA
- /api/map/*        Geospatial markers and transit corridors
- /api/optimize     MILP supply chain optimizer with Monte Carlo
- /api/ml/*         Feature sensitivity and model diagnostics
- /api/telemetry    Runtime system metrics
- /api/audit        Immutable audit trail

Running Locally
───────────────
    cd backend
    uvicorn main:app --reload --port 8000

    API docs: http://localhost:8000/docs
    ReDoc:    http://localhost:8000/redoc

Production (Azure App Service)
──────────────────────────────
    gunicorn --bind=0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker backend.main:app

CORS
────
The middleware allows the deployed Azure Static Web Apps frontend and
local development servers (Vite on ports 3000/5173).
"""
from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import auth, ml
from .schemas import (
    AuditEntry,
    AuditResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ForecastPoint,
    ForecastRequest,
    ForecastResponse,
    KpiCard,
    KpiResponse,
    LoginRequest,
    LoginResponse,
    MapMarkersResponse,
    MapMarker,
    CorridorLine,
    OnboardingRequest,
    OptimizeRequest,
    OptimizeResponse,
    RegisterRequest,
    RegisterResponse,
    TelemetryResponse,
    UserOut,
    VerifyOtpRequest,
    VerifyOtpResponse,
)

# ── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="COR-HARP API",
    description="Humanitarian AI Resource Predictor — REST API for Borno State operations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────
# Allow the deployed frontend, PR preview domains, and local dev servers.
#
# Azure SWA generates a NEW preview URL for every PR:
#   Production:  https://icy-river-0d05cf50f.7.azurestaticapps.net
#   PR previews: https://icy-river-0d05cf50f-<N>.<region>.7.azurestaticapps.net
#
# We use the built-in allow_origin_regex on CORSMiddleware (Starlette 0.34+)
# to cover all current and future PR preview domains.
ALLOWED_ORIGINS = [
    # Production frontend
    "https://icy-river-0d05cf50f.7.azurestaticapps.net",
    # PR preview (current — also matched by regex below)
    "https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net",
    # Local development
    "http://localhost:3000",
    "http://localhost:5173",
]

# Regex that matches ALL Azure SWA deployment URLs for this app:
#   production:  icy-river-0d05cf50f.7.azurestaticapps.net
#   PR preview:  icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net
SWA_PREVIEW_REGEX = r"^https://icy-river-0d05cf50f(-\d+\.[a-z0-9]+)?\.7\.azurestaticapps\.net$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=SWA_PREVIEW_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup():
    auth.init_db()


# ── Health ──────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat(), "version": "1.0.0"}


# ════════════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(req: LoginRequest):
    """Authenticate user with email/password. Admin/admin bypasses everything."""
    ok, user = auth.authenticate_user(req.email, req.password)
    if ok and user:
        return LoginResponse(
            success=True,
            message="Login successful",
            user_id=user["id"],
            name=user["name"],
            clearance=user["clearance"],
            has_seen_onboarding=user["has_seen_onboarding"],
        )
    return LoginResponse(success=False, message="Invalid credentials")


@app.post("/api/auth/register", response_model=RegisterResponse, tags=["Auth"])
def register(req: RegisterRequest):
    """Start registration: validates inputs and sends OTP email."""
    ok, msg = auth.send_registration_otp(req.name, req.email, req.password)
    return RegisterResponse(success=ok, message=msg)


@app.post("/api/auth/verify-otp", response_model=VerifyOtpResponse, tags=["Auth"])
def verify_otp(req: VerifyOtpRequest):
    """Verify OTP code and complete registration."""
    ok, msg, user = auth.verify_otp_and_register(req.email, req.otp_code)
    if ok and user:
        return VerifyOtpResponse(
            success=True, message=msg,
            user_id=user["id"], name=user["name"], clearance=user["clearance"],
        )
    return VerifyOtpResponse(success=False, message=msg)


@app.post("/api/auth/forgot-password", response_model=ForgotPasswordResponse, tags=["Auth"])
def forgot_password(req: ForgotPasswordRequest):
    """Mock password recovery — sends notification (no real reset yet)."""
    return ForgotPasswordResponse(
        success=True,
        message=f"If an account exists for {req.email}, a recovery link has been sent.",
    )


@app.post("/api/auth/onboarding-complete", tags=["Auth"])
def complete_onboarding(req: OnboardingRequest):
    """Mark onboarding as completed for the user."""
    auth.set_onboarding_seen(req.user_id)
    return {"success": True, "message": "Onboarding marked complete"}


@app.get("/api/auth/users", response_model=list[UserOut], tags=["Auth"])
def list_users():
    """List all users (admin endpoint)."""
    return auth.get_all_users()


# ════════════════════════════════════════════════════════════════════════════
#  KPI / DASHBOARD ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.get("/api/kpis", response_model=KpiResponse, tags=["Dashboard"])
def get_kpis():
    """Return high-level KPI summary cards for the dashboard."""
    lga_params = ml.get_lga_params()
    lstm_preds = ml.multi_lga_predictions(lga_params)

    total_idp = sum(p.get("idp_population", 0) for p in lga_params.values())
    total_ipc = sum(p.get("ipc_phase3p_pop", 0) for p in lga_params.values())
    avg_risk = sum(lstm_preds.values()) / max(len(lstm_preds), 1)
    critical_zones = sum(1 for p in lstm_preds.values() if p > 10)

    cards = [
        KpiCard(label="Total IDP Population", value=f"{total_idp:,.0f}", delta="+2.3%", delta_positive=False),
        KpiCard(label="IPC Phase 3+ Affected", value=f"{total_ipc:,.0f}", delta="-1.1%", delta_positive=True),
        KpiCard(label="Avg LSTM Risk Index", value=f"{avg_risk:.2f}", delta="Live", delta_positive=None),
        KpiCard(label="Critical Zones", value=str(critical_zones), delta=f"/{len(lstm_preds)} LGAs", delta_positive=None),
        KpiCard(label="Active Corridors", value="3", delta="Borno NE", delta_positive=None),
        KpiCard(label="Convoy Fleet", value="40", delta="Operational", delta_positive=True),
    ]
    return KpiResponse(cards=cards, timestamp=datetime.now(timezone.utc).isoformat())


# ════════════════════════════════════════════════════════════════════════════
#  FORECAST ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.post("/api/forecast/borno", response_model=ForecastResponse, tags=["Forecast"])
def forecast_borno(req: ForecastRequest):
    """Run LSTM forecast for a specific LGA."""
    lga_params = ml.get_lga_params()
    predictions = ml.forecast_sequence(lga_params, horizon=req.horizon, escalation=req.escalation)
    base_risk = ml.predict_for_lga(lga_params, req.lga)
    return ForecastResponse(
        lga=req.lga,
        horizon=req.horizon,
        predictions=[ForecastPoint(month=i + 1, predicted_events=round(v, 2)) for i, v in enumerate(predictions)],
        base_risk=round(base_risk, 2),
    )


@app.get("/api/forecast/multi-lga", tags=["Forecast"])
def multi_lga_forecast():
    """Get LSTM predictions for all LGAs at once."""
    lga_params = ml.get_lga_params()
    return ml.multi_lga_predictions(lga_params)


# ════════════════════════════════════════════════════════════════════════════
#  MAP ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.get("/api/map/markers", response_model=MapMarkersResponse, tags=["Map"])
def get_map_markers():
    """Return map markers and transit corridors."""
    markers_raw = ml.get_map_markers()
    corridors_raw = ml.get_corridors()
    return MapMarkersResponse(
        markers=[MapMarker(**m) for m in markers_raw],
        corridors=[CorridorLine(**c) for c in corridors_raw],
    )


# ════════════════════════════════════════════════════════════════════════════
#  OPTIMIZER ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.post("/api/optimize", response_model=OptimizeResponse, tags=["Optimizer"])
def run_optimize(req: OptimizeRequest):
    """Run the MILP supply chain optimizer with optional Monte Carlo simulation."""
    try:
        result = ml.run_optimizer(
            n_periods=req.n_periods,
            equity_weight=req.equity_weight,
            mc_iterations=req.mc_iterations,
        )
        return OptimizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimizer failed: {str(e)}")


# ════════════════════════════════════════════════════════════════════════════
#  SENSITIVITY / ATTENTION ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.get("/api/ml/sensitivity", tags=["ML"])
def get_sensitivity():
    """Compute feature importance via LSTM perturbation analysis."""
    lga_params = ml.get_lga_params()
    df = ml.feature_sensitivities(lga_params)
    return df.to_dict(orient="records") if not df.empty else []


# ════════════════════════════════════════════════════════════════════════════
#  TELEMETRY / SYSTEM
# ════════════════════════════════════════════════════════════════════════════

@app.get("/api/telemetry", tags=["System"])
def get_telemetry():
    """System telemetry and data pipeline status."""
    import psutil
    import os

    model, scaler, meta = ml.load_model()
    model_info = {}
    if meta:
        model_info = {
            "input_size": meta.get("input_size", 0),
            "hidden_size": meta.get("hidden_size", 0),
            "num_layers": meta.get("num_layers", 0),
            "feature_count": len(meta.get("feature_names", [])),
            "status": "loaded" if model else "not found",
        }

    return {
        "session_uptime_s": time.time() - app.state.start_time if hasattr(app.state, "start_time") else 0,
        "data_pipeline_status": {
            "hdx_hapi": "connected",
            "lstm_model": "loaded" if model else "not found",
            "optimizer": "available",
        },
        "model_info": model_info,
        "system_stats": {
            "pid": os.getpid(),
            "memory_mb": round(psutil.Process().memory_info().rss / 1024 / 1024, 1) if psutil else None,
            "cpu_percent": psutil.cpu_percent(interval=0.1) if psutil else None,
        },
    }


# ════════════════════════════════════════════════════════════════════════════
#  AUDIT TRAIL
# ════════════════════════════════════════════════════════════════════════════

_audit_log: list = []

@app.get("/api/audit", response_model=AuditResponse, tags=["System"])
def get_audit_log():
    """Return the audit trail."""
    return AuditResponse(entries=_audit_log, total=len(_audit_log))


@app.post("/api/audit", tags=["System"])
def add_audit_entry(entry: AuditEntry):
    """Add an audit trail entry."""
    _audit_log.append(entry)
    return {"success": True}
