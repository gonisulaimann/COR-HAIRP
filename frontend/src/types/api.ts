/**
 * API Type Definitions
 * ════════════════════
 *
 * TypeScript interfaces for every COR-HARP API response shape.
 * These must stay in sync with backend/schemas.py — if a response
 * shape changes on the backend, update the matching interface here.
 *
 * Type Convention
 * ───────────────
 * - Request interfaces:  {Name}Request  (POST body shapes)
 * - Response interfaces: {Name}Response (what the API returns)
 * - Entity interfaces:   {Name}         (individual data objects)
 *
 * Naming mirrors Pydantic model names in backend/schemas.py.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHENTICATION
   ═══════════════════════════════════════════════════════════════════════════ */

/** POST /api/auth/login — credentials for authentication */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/auth/login — session data on successful login */
export interface LoginResponse {
  success: boolean;
  message: string;
  user_id: number | null;
  name: string | null;
  clearance: string | null;
  has_seen_onboarding: boolean | null;
}

/** POST /api/auth/register — new account details */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** POST /api/auth/register — confirmation that OTP was sent */
export interface RegisterResponse {
  success: boolean;
  message: string;
}

/** POST /api/auth/verify-otp — OTP verification data */
export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

/** POST /api/auth/verify-otp — result of OTP verification */
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user_id: number | null;
  name: string | null;
  clearance: string | null;
}

/** POST /api/auth/forgot-password — password recovery request */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /api/auth/forgot-password — recovery confirmation */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/** POST /api/auth/onboarding-complete — mark tour as seen */
export interface OnboardingRequest {
  user_id: number;
}

/** GET /api/auth/users — user record for admin panel */
export interface UserOut {
  id: number;
  name: string;
  email: string;
  created: string;
  clearance: string;
  onboarded: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD KPIs
   ═══════════════════════════════════════════════════════════════════════════ */

/** Single KPI card (IDP count, risk index, etc.) */
export interface KpiCard {
  label: string;
  value: string | number;
  delta?: string | null;
  delta_positive?: boolean | null;
}

/** GET /api/kpis — dashboard summary with all KPI cards */
export interface KpiResponse {
  cards: KpiCard[];
  timestamp: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LSTM FORECASTING
   ═══════════════════════════════════════════════════════════════════════════ */

/** POST /api/forecast/borno — forecast request parameters */
export interface ForecastRequest {
  lga?: string;
  horizon?: number;
  escalation?: number;
}

/** Single month's predicted conflict events from the LSTM model */
export interface ForecastPoint {
  month: number;
  predicted_events: number;
}

/** POST /api/forecast/borno — LSTM forecast results */
export interface ForecastResponse {
  lga: string;
  horizon: number;
  predictions: ForecastPoint[];
  base_risk: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GEOSPATIAL DATA
   ═══════════════════════════════════════════════════════════════════════════ */

/** Map marker representing a region, camp, or conflict zone */
export interface MapMarker {
  name: string;
  lat: number;
  lon: number;
  marker_type: "hq" | "camp" | "conflict";
  risk_level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  idp_population?: number | null;
  lstm_prediction?: number | null;
}

/** Transit corridor connecting two geographic points */
export interface CorridorLine {
  name: string;
  coordinates: [number, number][];
  distance_km: number;
  risk_level: string;
}

/** GET /api/map/markers — all markers and corridors */
export interface MapMarkersResponse {
  markers: MapMarker[];
  corridors: CorridorLine[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUPPLY CHAIN OPTIMIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

/** POST /api/optimize — optimizer request parameters */
export interface OptimizeRequest {
  n_periods?: number;
  equity_weight?: number;
  mc_iterations?: number;
}

/** POST /api/optimize — MILP optimizer results with optional Monte Carlo */
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

/* ═══════════════════════════════════════════════════════════════════════════
   SYSTEM & DIAGNOSTICS
   ═══════════════════════════════════════════════════════════════════════════ */

/** GET /api/telemetry — runtime system metrics */
export interface TelemetryResponse {
  session_uptime_s: number;
  data_pipeline_status: Record<string, string>;
  model_info: Record<string, unknown>;
  system_stats: Record<string, unknown>;
}

/** Single audit trail entry */
export interface AuditEntry {
  timestamp: string;
  user_id: number;
  user_name: string;
  action: string;
  detail: string;
  integrity_hash: string;
}

/** GET /api/audit — complete audit trail */
export interface AuditResponse {
  entries: AuditEntry[];
  total: number;
}

/** GET /api/health — service health check response */
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

/** Single feature sensitivity row from perturbation analysis */
export interface SensitivityRow {
  Feature: string;
  Sensitivity: number;
}
