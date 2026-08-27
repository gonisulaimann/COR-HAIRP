"""
schemas.py — Pydantic request/response models for the COR-HARP API.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[int] = None
    name: Optional[str] = None
    clearance: Optional[str] = None
    has_seen_onboarding: Optional[bool] = None

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=6)

class RegisterResponse(BaseModel):
    success: bool
    message: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str = Field(min_length=6, max_length=6)

class VerifyOtpResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[int] = None
    name: Optional[str] = None
    clearance: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ForgotPasswordResponse(BaseModel):
    success: bool
    message: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created: str
    clearance: str
    onboarded: bool

class OnboardingRequest(BaseModel):
    user_id: int


# ── KPIs ────────────────────────────────────────────────────────────────────

class KpiCard(BaseModel):
    label: str
    value: Any
    delta: Optional[str] = None
    delta_positive: Optional[bool] = None

class KpiResponse(BaseModel):
    cards: List[KpiCard]
    timestamp: str


# ── Forecast ────────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    lga: str = "Maiduguri"
    horizon: int = Field(default=12, ge=1, le=36)
    escalation: float = Field(default=1.0, ge=0.1, le=3.0)

class ForecastPoint(BaseModel):
    month: int
    predicted_events: float

class ForecastResponse(BaseModel):
    lga: str
    horizon: int
    predictions: List[ForecastPoint]
    base_risk: float


# ── Map ─────────────────────────────────────────────────────────────────────

class MapMarker(BaseModel):
    name: str
    lat: float
    lon: float
    marker_type: str  # "hq" | "camp" | "conflict"
    risk_level: str   # "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
    idp_population: Optional[int] = None
    lstm_prediction: Optional[float] = None

class CorridorLine(BaseModel):
    name: str
    coordinates: List[List[float]]  # [[lat, lon], ...]
    distance_km: float
    risk_level: str

class MapMarkersResponse(BaseModel):
    markers: List[MapMarker]
    corridors: List[CorridorLine]


# ── Optimizer ───────────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    n_periods: int = Field(default=4, ge=1, le=12)
    equity_weight: float = Field(default=0.4, ge=0.0, le=1.0)
    mc_iterations: int = Field(default=100, ge=10, le=1000)

class OptimizeResponse(BaseModel):
    status: str
    total_cost: float
    equity_penalty: float
    combined_objective: float
    unmet_demand: Dict[str, float]
    route_summary: Dict[str, Dict[str, float]]
    solve_time_s: float
    mc_mean_cost: Optional[float] = None
    mc_95_ci: Optional[List[float]] = None


# ── Telemetry ───────────────────────────────────────────────────────────────

class TelemetryResponse(BaseModel):
    session_uptime_s: float
    data_pipeline_status: Dict[str, str]
    model_info: Dict[str, Any]
    system_stats: Dict[str, Any]


# ── Audit ───────────────────────────────────────────────────────────────────

class AuditEntry(BaseModel):
    timestamp: str
    user_id: int
    user_name: str
    action: str
    detail: str
    integrity_hash: str

class AuditResponse(BaseModel):
    entries: List[AuditEntry]
    total: int
