/**
 * client.ts — Axios HTTP client for the COR-HARP backend API.
 *
 * Environment-Based URL Resolution
 * ────────────────────────────────
 * The API base URL is determined by the VITE_API_URL environment variable:
 *
 *   Production (Azure):
 *     VITE_API_URL=https://cor-harp-api.azurewebsites.net/api
 *     (set in GitHub Actions workflow during build)
 *
 *   Local Development:
 *     VITE_API_URL is not set, so it falls back to http://localhost:8000/api
 *     Vite's dev server proxy (vite.config.ts) forwards /api → localhost:8000
 *
 *   To override locally, create a .env file in frontend/:
 *     VITE_API_URL=http://localhost:8000/api
 *
 * Request Configuration
 * ─────────────────────
 * - Timeout: 30 seconds (ML endpoints may be slow on first request)
 * - Content-Type: application/json (all endpoints accept JSON)
 * - Response interceptor unwraps axios .data layer and normalizes errors
 */
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/** Shared Axios instance configured for the COR-HARP backend. */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Response interceptor:
 *  - Success: unwraps `response.data` so callers receive the payload directly
 *  - Error: extracts the detail message from FastAPI error responses and
 *    rejects with a normalized Error for consistent handling in components
 */
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.detail || err.message || "Unknown API error";
    return Promise.reject(new Error(message));
  },
);

export default client;
