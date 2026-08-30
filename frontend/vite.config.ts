/**
 * Vite Configuration — COR-HARP Frontend
 * ═══════════════════════════════════════
 *
 * Development Server
 * ──────────────────
 * - Port: 3000
 * - API Proxy: /api/* → http://localhost:8000 (FastAPI backend)
 * - This means frontend code can call /api/kpis and it transparently
 *   proxies to the local backend without CORS issues.
 *
 * Production Build
 * ────────────────
 * - Output: frontend/dist/
 * - VITE_API_URL is set in the GitHub Actions workflow to point at Azure
 * - Azure Static Web Apps serves the built files with CDN caching
 *
 * Path Aliases
 * ────────────
 * - @/ → frontend/src/ (enables clean imports like '@/api/auth')
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the local FastAPI backend during development.
      // In production, the built JS bundle hits the real API via VITE_API_URL.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
