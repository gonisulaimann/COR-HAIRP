# COR-HARP — Project Progress

> Last updated: August 31, 2026
> Branch: `feature/role-based-platform` (PR #1 — OPEN, not merged)

---

## Current State

| Component | Status | URL |
|-----------|--------|-----|
| Backend (FastAPI) | ✅ Healthy | https://cor-harp-api.azurewebsites.net |
| Frontend (Production) | ✅ Deployed | https://icy-river-0d05cf50f.7.azurestaticapps.net |
| PR #1 Preview | ✅ Live | https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net |
| App Service Plan | ✅ Standard S1 | RG-COR-HARP / cor-harp-api |

---

## PART 0 — Bug Fix (Completed)

**Problem:** Dashboard and LoginPage showed "Connection Error — uvicorn backend.main:app --reload" — a hardcoded localhost dev instruction visible to real users.

**Root cause:** The Dashboard component's error state included a `<code>` block with a uvicorn command. The LoginPage had "Connection failed — is the backend running?" messages.

**Fix:** Replaced all dev-only error messages with professional, honest alternatives:
- Dashboard: "Service Unavailable" + "Please try again in a moment"
- LoginPage: "Unable to reach the server. Please try again."
- Removed ALL references to uvicorn, localhost, or any dev commands from user-facing error states

**Verification:** Production build confirmed zero instances of "uvicorn" or "backend running" in the built JS bundle.

---

## PART 1 — Role Differentiation (Verified)

All 4 roles show **visibly different sidebars** with correctly grouped sections:

| Role | Simple Items | Advanced Items | Sections | Unique Sections |
|------|-------------|---------------|----------|-----------------|
| Aid Worker | 16 | 18 | 5–6 | Operations, Intelligence, Logistics, Tools |
| NGO | 18 | 20 | 6–7 | + Organization (Team, Activity Log) |
| Student | 11 | 13 | 5–6 | + Learn (Methodology, Data Explorer, Insights) |
| Individual | 3 | 3 | 2 | Operations only (Overview, Map, Settings) |

---

## PART 2 — Architecture Overhaul (Completed)

### Sidebar Restructure
- **Grouped sections** with uppercase labeled headers (Bloomberg/Palantir pattern)
- Sections: OPERATIONS, INTELLIGENCE, LOGISTICS, TOOLS, ORGANIZATION, LEARN, SYSTEM, ACCOUNT
- Section visibility is role-gated (e.g., LOGISTICS only visible to Aid Worker/NGO)
- Advanced mode reveals additional items (Search, System Telemetry)

### Navigation Config
- `navigationConfig.ts` — single source of truth for all menu items
- `getGroupedNav()` — returns items organized by section
- `SECTIONS` — section definitions with role access rules
- `SECTION_ORDER` — controls display order in sidebar

---

## PART 3 — New Pages (Built)

### Pages with Real Functionality
| Page | Data Source | Status |
|------|-----------|--------|
| Overview (Dashboard) | `/api/kpis`, `/api/forecast/borno`, `/api/ml/sensitivity` | ✅ Real data from backend |
| Map | `/api/map/markers` | ✅ Real data from backend |
| Forecasts | `/api/forecast/borno`, `/api/forecast/multi-lga` | ✅ Real data from backend |
| Alerts | Mock data (8 alerts) | ⚠️ Mock — needs backend notifications API |
| Today's Briefing | `/api/kpis` + mock alerts | ⚠️ Partial — KPIs real, alerts mock |
| Trends | `/api/forecast/multi-lga` | ✅ Real data from backend |
| LGA Comparison | `/api/forecast/multi-lga` + static LGA data | ⚠️ Partial — predictions real, population data mock |
| Risk Outlook | `/api/forecast/multi-lga` | ✅ Real data from backend |
| Supply Planning (Optimizer) | `/api/optimize` | ✅ Real data from backend |
| Routes | Mock data (5 corridors) | ⚠️ Mock — needs backend route data |
| Inventory | Mock data (commodities × warehouses) | ⚠️ Mock — needs backend inventory API |
| Reports | `/api/kpis` + region/date selectors | ⚠️ Partial — KPIs real, export shell only |
| Saved Views | localStorage | ✅ Working (client-side persistence) |
| Export & Share | UI shell | ⚠️ Coming soon — format selection works, actual export Phase 2 |
| Search | Mock results | ⚠️ Mock — needs backend search API |
| Team (NGO) | Mock team members | ⚠️ Mock — needs backend team API |
| Activity Log (NGO) | Mock activities | ⚠️ Mock — needs backend activity API |
| Methodology | Static documentation content | ✅ Complete (6 sections) |
| Data Explorer | `/api/ml/sensitivity` | ✅ Real data from backend |
| Insights | Static research findings | ✅ Complete (5 insights) |
| Telemetry | `/api/telemetry` | ✅ Real data from backend |
| Settings | Local state (role, mode, notifications) | ✅ Working (toggle interactions real) |
| Copilot | Placeholder (not connected) | ⚠️ Honest "not connected" state |

---

## Files Changed (This Session)

| File | Change |
|------|--------|
| `frontend/src/pages/Dashboard/Dashboard.tsx` | Replaced "uvicorn" error with professional message |
| `frontend/src/pages/LoginPage/LoginPage.tsx` | Replaced "Connection failed" with professional message |
| `frontend/src/config/navigationConfig.ts` | Expanded to ~20 items per role with grouped sections |
| `frontend/src/components/Sidebar/Sidebar.tsx` | Renders grouped sections with labeled headers |
| `frontend/src/App.tsx` | Uses `getGroupedNav`, adds 14 new routes |
| `frontend/src/components/ComingSoon/ComingSoon.tsx` | New — reusable placeholder component |
| `frontend/src/pages/AlertsPage/AlertsPage.tsx` | New — alerts center with severity filtering |
| `frontend/src/pages/BriefingPage/BriefingPage.tsx` | New — daily briefing with KPIs + alerts |
| `frontend/src/pages/TrendsPage/TrendsPage.tsx` | New — trend analysis with LGA comparison bars |
| `frontend/src/pages/LgaComparisonPage/LgaComparisonPage.tsx` | New — side-by-side LGA comparison table |
| `frontend/src/pages/RiskOutlookPage/RiskOutlookPage.tsx` | New — risk matrix with severity levels |
| `frontend/src/pages/RoutesPage/RoutesPage.tsx` | New — transit corridor status display |
| `frontend/src/pages/InventoryPage/InventoryPage.tsx` | New — warehouse stock tracking |
| `frontend/src/pages/SavedViewsPage/SavedViewsPage.tsx` | New — bookmarked dashboard configurations |
| `frontend/src/pages/ExportPage/ExportPage.tsx` | New — export format selection and sharing |
| `frontend/src/pages/SearchPage/SearchPage.tsx` | New — full-text data search |
| `frontend/src/pages/ActivityLogPage/ActivityLogPage.tsx` | New — team activity feed |
| `frontend/src/pages/DataExplorerPage/DataExplorerPage.tsx` | New — raw data feature explorer |
| `frontend/src/pages/InsightsPage/InsightsPage.tsx` | New — research findings display |
| `frontend/src/pages/SettingsPage/SettingsPage.tsx` | New — account settings with real toggles |

---

## What's Real vs. What's Coming Soon

### ✅ Real Functionality (Working with Live Backend)
- Login / Register / OTP verification
- Role selection and onboarding
- Dashboard with real KPIs from `/api/kpis`
- Interactive map with real markers from `/api/map/markers`
- LSTM forecasting with real predictions from `/api/forecast/borno`
- Multi-LGA forecast comparison
- MILP supply chain optimizer
- Telemetry and diagnostics
- Feature sensitivity / Data Explorer
- Settings with real toggle interactions
- Saved Views (localStorage persistence)
- All 4 roles show different sidebars

### ⚠️ Partially Real (Real Data + Mock Shell)
- Today's Briefing (real KPIs, mock alerts)
- LGA Comparison (real risk scores, mock population data)
- Reports (real KPIs, export shell only)

### 🔜 Coming Soon (Honest Placeholders / Mock Data)
- Alerts & Notifications (needs backend notifications API)
- Routes (needs backend route/corridor data)
- Inventory (needs backend inventory API)
- Search (needs backend search API)
- Team Management (needs backend team API)
- Activity Log (needs backend activity API)
- Export/Share (needs file generation backend)
- Copilot (needs LLM integration)

---

## Build Status

- ✅ TypeScript compilation: PASS
- ✅ Vite build: PASS (914 KB JS, 107 KB CSS)
- ✅ No dev-only strings in production bundle
- ✅ Role differentiation verified via automated test

---

## PR #1 Status

- **Branch:** `feature/role-based-platform`
- **Status:** OPEN — awaiting review
- **Preview URL:** https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net
- **Preview Mode:** Active on preview URL (⚡ Skip Login button)
- **DO NOT MERGE** until explicit approval
