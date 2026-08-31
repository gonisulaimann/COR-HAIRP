# COR-HARP — Project Progress

> Last updated: August 31, 2026

---

## Current State

| Component | Status | URL |
|-----------|--------|-----|
| Backend (FastAPI) | ✅ Healthy | https://cor-harp-api.azurewebsites.net |
| Frontend (React/Vite) | ✅ Deployed | https://icy-river-0d05cf50f.7.azurestaticapps.net |
| PR #1 Preview | ✅ Live | https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net |
| App Service Plan | ✅ Standard S1 | RG-COR-HARP / cor-harp-api |

---

## Backend Verification (August 31, 2026)

**Health checks — 5/5 pass:**

| Test | HTTP | TTFB |
|------|------|------|
| 1 | 200 | 2.25s |
| 2 | 200 | 1.11s |
| 3 | 200 | 1.42s |
| 4 | 200 | 0.91s |
| 5 | 200 | 1.43s |

**CORS verification:**

| Origin | Result |
|--------|--------|
| Production (`icy-river-0d05cf50f.7.azurestaticapps.net`) | ✅ Allowed |
| PR Preview (`icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net`) | ✅ Allowed |
| Localhost:3000 | ✅ Allowed |
| Localhost:5173 | ✅ Allowed |
| Evil site (`evil-site.com`) | ✅ Blocked (400) |

---

## Root Cause — Backend 503 Crashes (FIXED)

**Problem:** Backend intermittently returned 503 "Connection failed — is the backend running?"

**Root cause:** `startup.sh` contained `source antenv/bin/activate` which does not exist in Oryx-managed Azure App Service venvs. When this failed silently (no `set -e`), gunicorn started without the virtualenv activated, causing `ModuleNotFoundError: No module named 'starlette'` → container crash → 503.

**Contributing factor:** `DO_CLEAN_DEPLOYMENT` was not set, so stale files (`.git/`, `frontend/`, `antenv.tar.gz` ~2.2GB, `output.tar.zst` ~2.7GB) accumulated across deployments, making the deployment artifact ~3.4GB instead of ~20MB.

**Fix:**
1. `startup.sh` — removed `source antenv/bin/activate`. Oryx's auto-generated startup wrapper already handles PYTHONPATH and venv activation.
2. `DO_CLEAN_DEPLOYMENT=true` — set in App Service settings to force fresh builds.
3. Stale artifacts cleaned via Kudu VFS API (~5GB freed).

---

## CORS Fix — PR Preview Domains (FIXED)

**Problem:** PR preview deployments at `icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net` were blocked by CORS because only the production domain was in the allow_origins list.

**Fix:** Added `allow_origin_regex` to CORSMiddleware matching all Azure SWA preview URLs:
```python
SWA_PREVIEW_REGEX = r"^https://icy-river-0d05cf50f(-\d+\.[a-z0-9]+)?\.7\.azurestaticapps\.net$"
```
Also added the custom `RegexCORSMiddleware` in `backend/cors.py` as a fallback if the built-in regex doesn't work.

---

## Deployment Architecture

```
GitHub Actions (main_cor-harp-api.yml)
    → checkout (minimal: backend/, data/, models/, requirements.txt, startup.sh)
    → create ~20MB zip (no .git/, no frontend/, no venv/)
    → azure/webapps-deploy@v3
    → Azure App Service (cor-harp-api)
    → Oryx builds Python from requirements.txt
    → startup.sh → gunicorn (UvicornWorker)
```

**Key settings:**
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- `ENABLE_ORYX_BUILD=true`
- `DO_CLEAN_DEPLOYMENT=true`
- App Service Plan: Standard S1
- Startup: `startup.sh` (no venv activation — Oryx handles this)

---

## PR #1 — Role-Based Platform (OPEN, awaiting review)

**Branch:** `feature/role-based-platform`
**Preview URL:** https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net

**Features deployed:**
- Role-based signup (4 roles: Aid Worker, NGO, Student, Individual)
- Role-specific onboarding flows
- Centralized `navigationConfig.ts` for role × mode permission model
- Expanded menu system per role
- In-app Copilot UI shell (not yet connected to backend)
- Preview Mode bypass for non-production builds (PR previews only)

**Preview Mode:** A "⚡ Skip Login" button appears ONLY on PR preview builds (controlled by `VITE_PREVIEW_MODE` env var set via `app_build_command` in SWA workflow). Never present in production builds.

---

## Files Changed (Recent)

| File | Change |
|------|--------|
| `startup.sh` | Removed broken `source antenv/bin/activate` |
| `backend/main.py` | CORSMiddleware with `allow_origin_regex` for SWA previews |
| `backend/cors.py` | Custom RegexCORSMiddleware fallback |
| `.github/workflows/main_cor-harp-api.yml` | `DO_CLEAN_DEPLOYMENT=true`, health check script fix |
| `.github/workflows/azure-static-web-apps-*.yml` | `VITE_PREVIEW_MODE` for PR builds |
| `frontend/src/pages/LoginPage/LoginPage.tsx` | Preview Mode bypass button |
| `frontend/.env.development` | Enables Preview Mode for local dev |

---

## Known Issues

1. **Health check script still reports "failure" in GitHub Actions** — the fix (`-o /dev/null -s -w "%{http_code}"`) is committed but the latest deploy failed due to network timeout (curl exit code 28), not the script bug itself. Next deploy should show correct status.

2. **`data/` directory not in GitHub** — the `data/` directory is ~102MB and not tracked by Git. Data-dependent endpoints will fail on production until data files are committed or served from another source.

3. **Oryx rebuild time** — each deploy takes ~5-10 minutes because Oryx rebuilds the Python environment (including PyTorch). This is inherent to the current architecture.

4. **Backend TTFB** — first request after cold start takes 2-3s (PyTorch import). Subsequent requests are ~1s.

---

## Next Steps

1. Review PR #1 at the preview URL
2. Commit `data/` directory to Git (or set up Azure Blob Storage)
3. Upgrade App Service tier if cold-start latency becomes an issue
4. Connect Copilot to actual LLM backend
5. Backend auth enforcement for role-based access
