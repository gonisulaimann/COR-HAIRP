"""
COR-HARP API Schemas
====================

Pydantic request/response models that enforce API contract validation.
These models mirror the TypeScript interfaces in frontend/src/types/api.ts.

Design Principles
─────────────────
- Every endpoint has explicit Request/Response models for type safety
- Optional fields use None defaults to support partial responses
- Field constraints (min_length, ge, le) enforce business rules at the
  schema level before any route handler code runs
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════════════


class LoginRequest(BaseModel):
    """Credentials for email/password authentication."""

    email: str
    password: str


class LoginResponse(BaseModel):
    """Session data returned on successful login."""

    success: bool
    message: str
    user_id: Optional[int] = None
    name: Optional[str] = None
    clearance: Optional[str] = None
    has_seen_onboarding: Optional[bool] = None


class RegisterRequest(BaseModel):
    """New account details. Password must be at least 6 characters."""

    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=6)


class RegisterResponse(BaseModel):
    """Confirmation that OTP was sent to the provided email."""

    success: bool
    message: str


class VerifyOtpRequest(BaseModel):
    """6-digit OTP code received via email."""

    email: str
    otp_code: str = Field(min_length=6, max_length=6)


class VerifyOtpResponse(BaseModel):
    """Result of OTP verification. Includes user data on success."""

    success: bool
    message: str
    user_id: Optional[int] = None
    name: Optional[str] = None
    clearance: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    """Email address for password recovery."""

    email: str


class ForgotPasswordResponse(BaseModel):
    """Recovery confirmation (always returns success to prevent enumeration)."""

    success: bool
    message: str


class UserOut(BaseModel):
    """User record for the admin panel."""

    id: int
    name: str
    email: str
    created: str
    clearance: str
    onboarded: bool


class OnboardingRequest(BaseModel):
    """Mark onboarding tour as completed for a user."""

    user_id: int


# ═══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD KPIs
# ═══════════════════════════════════════════════════════════════════════════════


class KpiCard(BaseModel):
    """Single KPI metric card (IDP count, risk index, etc.)."""

    label: str
    value: Any
    delta: Optional[str] = None
    delta_positive: Optional[bool] = None


class KpiResponse(BaseModel):
    """Dashboard summary with all KPI cards and server timestamp."""

    cards: List[KpiCard]
    timestamp: str


# ═══════════════════════════════════════════════════════════════════════════════
#  LSTM FORECASTING
# ═══════════════════════════════════════════════════════════════════════════════


class ForecastRequest(BaseModel):
    """Forecast request parameters for a specific LGA."""

    lga: str = "Maiduguri"
    horizon: int = Field(default=12, ge=1, le=36)
    escalation: float = Field(default=1.0, ge=0.1, le=3.0)


class ForecastPoint(BaseModel):
    """Single month's predicted conflict events from the LSTM model."""

    month: int
    predicted_events: float


class ForecastResponse(BaseModel):
    """LSTM forecast results including monthly predictions and base risk."""

    lga: str
    horizon: int
    predictions: List[ForecastPoint]
    base_risk: float


# ═══════════════════════════════════════════════════════════════════════════════
#  GEOSPATIAL DATA
# ═══════════════════════════════════════════════════════════════════════════════


class MapMarker(BaseModel):
    """Map marker representing a region, camp, or conflict zone."""

    name: str
    lat: float
    lon: float
    marker_type: str  # "hq" | "camp" | "conflict"
    risk_level: str   # "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
    idp_population: Optional[int] = None
    lstm_prediction: Optional[float] = None


class CorridorLine(BaseModel):
    """Transit corridor connecting two geographic points."""

    name: str
    coordinates: List[List[float]]  # [[lat, lon], ...]
    distance_km: float
    risk_level: str


class MapMarkersResponse(BaseModel):
    """All map markers and transit corridors for the geospatial view."""

    markers: List[MapMarker]
    corridors: List[CorridorLine]


# ═══════════════════════════════════════════════════════════════════════════════
#  SUPPLY CHAIN OPTIMIZATION
# ═══════════════════════════════════════════════════════════════════════════════


class OptimizeRequest(BaseModel):
    """MILP optimizer request with Monte Carlo simulation parameters."""

    n_periods: int = Field(default=4, ge=1, le=12)
    equity_weight: float = Field(default=0.4, ge=0.0, le=1.0)
    mc_iterations: int = Field(default=100, ge=10, le=1000)


class OptimizeResponse(BaseModel):
    """MILP optimizer results with route assignments and cost breakdown."""

    status: str
    total_cost: float
    equity_penalty: float
    combined_objective: float
    unmet_demand: Dict[str, float]
    route_summary: Dict[str, Dict[str, float]]
    solve_time_s: float
    mc_mean_cost: Optional[float] = None
    mc_95_ci: Optional[List[float]] = None


# ═══════════════════════════════════════════════════════════════════════════════
#  SYSTEM & DIAGNOSTICS
# ═══════════════════════════════════════════════════════════════════════════════


class TelemetryResponse(BaseModel):
    """Runtime system metrics including uptime, memory, and model info."""

    session_uptime_s: float
    data_pipeline_status: Dict[str, str]
    model_info: Dict[str, Any]
    system_stats: Dict[str, Any]


class AuditEntry(BaseModel):
    """Immutable audit trail entry with integrity hash."""

    timestamp: str
    user_id: int
    user_name: str
    action: str
    detail: str
    integrity_hash: str


class AuditResponse(BaseModel):
    """Complete audit trail of user actions."""

    entries: List[AuditEntry]
    total: int
