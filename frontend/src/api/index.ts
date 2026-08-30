/**
 * API Module — Barrel Export
 * ══════════════════════════
 *
 * Centralized exports for all API functions and the HTTP client.
 * Import from '@/api' in components for type-safe backend communication.
 *
 * Usage:
 *   import { login, getKpis, forecast } from '@/api';
 *   import { client } from '@/api';  // raw Axios instance if needed
 */
export * from "./auth";
export * from "./data";
export { default as client } from "./client";
