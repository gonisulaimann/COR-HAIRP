/**
 * Dashboard Data API Module
 * ═════════════════════════
 *
 * Typed API functions for all COR-HARP data endpoints.
 * Each function maps directly to a FastAPI route and returns
 * the typed response matching backend/schemas.py.
 *
 * Endpoint Mapping
 * ────────────────
 * getKpis()            GET  /api/kpis              Dashboard KPI cards
 * forecast()           POST /api/forecast/borno    LSTM forecast for one LGA
 * multiLgaForecast()   GET  /api/forecast/multi-lga Predictions for all LGAs
 * getMapMarkers()      GET  /api/map/markers       Map markers + corridors
 * optimize()           POST /api/optimize          MILP + Monte Carlo solver
 * getSensitivity()     GET  /api/ml/sensitivity    Feature importance
 * getHealth()          GET  /api/health            Health check
 * getTelemetry()       GET  /api/telemetry         System metrics
 * getAuditLog()        GET  /api/audit             Audit trail
 */
import type {
  AuditResponse,
  ForecastResponse,
  HealthResponse,
  KpiResponse,
  MapMarkersResponse,
  OptimizeResponse,
  SensitivityRow,
  TelemetryResponse,
} from "@/types";
import client from "./client";

/* ── Dashboard KPIs ─────────────────────────────────────────────────── */

/**
 * Fetch summary KPI cards for the executive dashboard.
 *
 * Returns aggregated metrics including total IDP population,
 * IPC Phase 3+ affected persons, average LSTM risk index,
 * and critical zone count across all five monitored LGAs.
 */
export const getKpis = (): Promise<KpiResponse> => client.get("/kpis");

/* ── Forecast ───────────────────────────────────────────────────────── */

/**
 * Run LSTM conflict event forecast for a specific LGA.
 *
 * @param lga - Local Government Area name (e.g., "Maiduguri")
 * @param horizon - Number of months to forecast (1-36, default 12)
 * @param escalation - Conflict escalation multiplier (0.1-3.0, default 1.0)
 * @returns Monthly predicted conflict events and base risk score
 */
export const forecast = (
  lga: string,
  horizon: number = 12,
  escalation: number = 1.0,
): Promise<ForecastResponse> =>
  client.post("/forecast/borno", { lga, horizon, escalation });

/**
 * Get LSTM predictions for all five monitored LGAs simultaneously.
 *
 * Returns a mapping of LGA name to predicted monthly conflict events.
 * Uses cached model state for consistent results across requests.
 */
export const multiLgaForecast = (): Promise<Record<string, number>> =>
  client.get("/forecast/multi-lga");

/* ── Map ────────────────────────────────────────────────────────────── */

/**
 * Fetch map markers (HQ, camps, conflict zones) and transit corridors.
 *
 * Markers include IDP population counts and LSTM risk predictions.
 * Corridors include distance and risk classification for each route.
 */
export const getMapMarkers = (): Promise<MapMarkersResponse> =>
  client.get("/map/markers");

/* ── Optimizer ──────────────────────────────────────────────────────── */

/**
 * Run the MILP supply chain optimizer with optional Monte Carlo simulation.
 *
 * @param nPeriods - Planning periods to optimize (1-12, default 4)
 * @param equityWeight - Weight for equity penalty in bi-objective (0-1, default 0.4)
 * @param mcIterations - Monte Carlo iterations for stochastic analysis (10-1000)
 * @returns Optimal routes, costs, unmet demand, and confidence intervals
 */
export const optimize = (
  nPeriods: number = 4,
  equityWeight: number = 0.4,
  mcIterations: number = 100,
): Promise<OptimizeResponse> =>
  client.post("/optimize", {
    n_periods: nPeriods,
    equity_weight: equityWeight,
    mc_iterations: mcIterations,
  });

/* ── ML Sensitivity ─────────────────────────────────────────────────── */

/**
 * Compute feature importance via LSTM perturbation analysis.
 *
 * For each of the 23 input features, measures the change in
 * predicted conflict events when the feature is perturbed by 10%.
 * Returns features sorted by descending sensitivity.
 */
export const getSensitivity = (): Promise<SensitivityRow[]> =>
  client.get("/ml/sensitivity");

/* ── System ─────────────────────────────────────────────────────────── */

/**
 * Health check — returns status and version.
 * Used by CI/CD pipelines and monitoring to verify service availability.
 */
export const getHealth = (): Promise<HealthResponse> => client.get("/health");

/**
 * System telemetry: uptime, memory usage, model info, and pipeline status.
 * Useful for monitoring and diagnostics in production.
 */
export const getTelemetry = (): Promise<TelemetryResponse> =>
  client.get("/telemetry");

/**
 * Fetch the immutable audit trail of user actions.
 * Each entry includes timestamp, user info, action, and integrity hash.
 */
export const getAuditLog = (): Promise<AuditResponse> => client.get("/audit");
