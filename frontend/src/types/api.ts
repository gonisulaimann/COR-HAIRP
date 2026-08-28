/**
 * api.ts   TypeScript interfaces for every COR-HARP API response shape.
 *
 * backend/schemas.py. If you change a response shape on the backend,
 * update the matching interface here so the frontend stays type-safe.
 */

/* ── Auth ───────────────────────────────────────────────────────────────── */

/** POST /api/auth/login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/auth/login response */
export interface LoginResponse {
  success: boolean;
  message: string;
  user_id: number | null;
  name: string | null;
  clearance: string | null;
  has_seen_onboarding: boolean | null;
}

/** POST /api/auth/register request body */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** POST /api/auth/register response */
export interface RegisterResponse {
  success: boolean;
  message: string;
}

/** POST /api/auth/verify-otp request body */
export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

/** POST /api/auth/verify-otp response */
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user_id: number | null;
  name: string | null;
  clearance: string | null;
}

/** POST /api/auth/forgot-password request body */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /api/auth/forgot-password response */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/** POST /api/auth/onboarding-complete request body */
export interface OnboardingRequest {
  user_id: number;
}

/** GET /api/auth/users response item */
export interface UserOut {
  id: number;
  name: string;
  email: string;
  created: string;
  clearance: string;
  onboarded: boolean;
}

/* ── KPIs ───────────────────────────────────────────────────────────────── */

/** Single KPI card within the dashboard summary */
export interface KpiCard {
  label: string;
  value: string | number;
  delta?: string | null;
  delta_positive?: boolean | null;
}

/** GET /api/kpis response */
export interface KpiResponse {
  cards: KpiCard[];
  timestamp: string;
}

/* ── Forecast ───────────────────────────────────────────────────────────── */

/** POST /api/forecast/borno request body */
export interface ForecastRequest {
  lga?: string;
  horizon?: number;
  escalation?: number;
}

/** A single month's LSTM prediction */
export interface ForecastPoint {
  month: number;
  predicted_events: number;
}

/** POST /api/forecast/borno response */
export interface ForecastResponse {
  lga: string;
  horizon: number;
  predictions: ForecastPoint[];
  base_risk: number;
}

/* ── Map ────────────────────────────────────────────────────────────────── */

/** A single map marker (HQ, camp, conflict zone) */
export interface MapMarker {
  name: string;
  lat: number;
  lon: number;
  marker_type: "hq" | "camp" | "conflict";
  risk_level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  idp_population?: number | null;
  lstm_prediction?: number | null;
}

/** A transit corridor line connecting two points */
export interface CorridorLine {
  name: string;
  coordinates: [number, number][];
  distance_km: number;
  risk_level: string;
}

/** GET /api/map/markers response */
export interface MapMarkersResponse {
  markers: MapMarker[];
  corridors: CorridorLine[];
}

/* ── Optimizer ──────────────────────────────────────────────────────────── */

/** POST /api/optimize request body */
export interface OptimizeRequest {
  n_periods?: number;
  equity_weight?: number;
  mc_iterations?: number;
}

/** POST /api/optimize response */
export interface OptimizeResponse {
  status: string;
  total_cost: number;
  equity_penalty: number;
  combined_objective: number;
  unmet_demand: Record<string, number>;
  route_summary: Record<string, Record<string, number>>;
  solve_time_s: number;
  mc_mean_cost?: number | null;
  mc_95_ci?: number[] | null;
}

/* ── Telemetry ──────────────────────────────────────────────────────────── */

/** GET /api/telemetry response */
export interface TelemetryResponse {
  session_uptime_s: number;
  data_pipeline_status: Record<string, string>;
  model_info: Record<string, unknown>;
  system_stats: Record<string, unknown>;
}

/* ── Audit ──────────────────────────────────────────────────────────────── */

/** A single audit trail entry */
export interface AuditEntry {
  timestamp: string;
  user_id: number;
  user_name: string;
  action: string;
  detail: string;
  integrity_hash: string;
}

/** GET /api/audit response */
export interface AuditResponse {
  entries: AuditEntry[];
  total: number;
}

/* ── Health ─────────────────────────────────────────────────────────────── */

/** GET /api/health response */
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

/* ── Sensitivity ────────────────────────────────────────────────────────── */

/** Single feature sensitivity row from GET /api/ml/sensitivity */
export interface SensitivityRow {
  Feature: string;
  Sensitivity: number;
}
