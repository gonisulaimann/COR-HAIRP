/**
 * data.ts   Typed API functions for dashboard data, forecast, map, optimizer.
 *
 * the typed response. The frontend components consume these directly.
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

/** Fetch summary KPI cards for the dashboard. */
export const getKpis = (): Promise<KpiResponse> => client.get("/kpis");

/* ── Forecast ───────────────────────────────────────────────────────── */

/** Run LSTM forecast for a specific LGA. */
export const forecast = (
  lga: string,
  horizon: number = 12,
  escalation: number = 1.0,
): Promise<ForecastResponse> =>
  client.post("/forecast/borno", { lga, horizon, escalation });

/** Get LSTM predictions for all 5 LGAs simultaneously. */
export const multiLgaForecast = (): Promise<Record<string, number>> =>
  client.get("/forecast/multi-lga");

/* ── Map ────────────────────────────────────────────────────────────── */

/** Fetch map markers (regions, camps) and transit corridor lines. */
export const getMapMarkers = (): Promise<MapMarkersResponse> =>
  client.get("/map/markers");

/* ── Optimizer ──────────────────────────────────────────────────────── */

/** Run the MILP supply chain optimizer with optional Monte Carlo. */
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

/** Compute feature importance via LSTM perturbation analysis. */
export const getSensitivity = (): Promise<SensitivityRow[]> =>
  client.get("/ml/sensitivity");

/* ── System ─────────────────────────────────────────────────────────── */

/** Health check   returns status and version. */
export const getHealth = (): Promise<HealthResponse> => client.get("/health");

/** System telemetry: uptime, memory, model info, pipeline status. */
export const getTelemetry = (): Promise<TelemetryResponse> =>
  client.get("/telemetry");

/** Fetch the immutable audit trail. */
export const getAuditLog = (): Promise<AuditResponse> => client.get("/audit");
