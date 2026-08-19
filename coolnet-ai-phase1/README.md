# CoolNet AI — Phase 1

Compound Heat–Grid Risk Intelligence dashboard. A climate-risk
**decision-support** tool: it identifies which ward is most at risk, why,
how that risk may evolve, and what preventive action to prioritize. It
does not control the grid and does not guarantee that any outage will be
prevented.

## ⚠️ Phase 1 status: demo data only

Everything in this build — weather, grid stress, vulnerability, GIS
boundaries, forecasts, explanations, and simulation results — is
**clearly labelled demo/mock data**. No live feeds, no trained model, no
real government or utility datasets are used yet. Every panel that shows
demo output is tagged in the UI (`DEMO DATA`, `DEMO FORECAST`, etc.).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm run start   # production build
```

## Pipeline this UI is built around

```
LIVE/AVAILABLE DATA → DATA PROCESSING → GRID-STRESS/OUTAGE-RISK ML →
COMPOUND RISK ENGINE → EXPLAINABLE AI → FORECAST → WHAT-IF SIMULATION →
INTERVENTION RECOMMENDATION → LIVE GIS MAP → FEEDBACK
```

## Architecture

```
app/
  layout.tsx              Root layout, global styles
  page.tsx                Dashboard shell: tabs, layout, shared selection state
  globals.css             Dark command-center theme, Leaflet overrides

components/
  layout/TopNav.tsx        Top nav bar
  map/RiskMap.tsx          Client-only Leaflet wrapper + legend (public API)
  map/LeafletRiskMap.tsx   Actual Leaflet/react-leaflet implementation
  panels/                  WardDetailPanel, ExplainabilityPanel, ForecastPanel,
                            WhatIfSimulator, RecommendationPanel, DataHealthPanel,
                            WardListSidebar, InterventionsView
  ui/                      Card, RiskBadge, DemoTag, Slider, StatCard

lib/
  types.ts                 Shared TypeScript contracts for the whole pipeline
  dashboardTabs.ts          Tab definitions
  data/
    mockWards.ts            Generated demo ward polygons + metadata (fictional city)
    mockDataService.ts       Stands in for live weather/grid/vulnerability APIs
                              + Supabase reads. Same function signatures will be
                              used when wired to real sources.
  services/
    mlService.ts             The ML seam. `MLService` interface +
                              `DemoMLService` implementation (Phase 1).
                              Swap in a `RemoteMLService` calling FastAPI/XGBoost/
                              SHAP in Phase 2 — nothing else changes.
    simulationEngine.ts       Transparent, documented demo formulas backing the
                              compound risk score and what-if calculations.
  supabase/
    schema.sql                Target Supabase schema (wards, weather_data,
                              grid_data, vulnerability_data, risk_predictions,
                              interventions, simulation_runs, feedback).
    client.ts                  Env-var-based Supabase client factory (unused
                              in Phase 1; no keys committed).
  hooks/
    useWardSummaries.ts        Loads ward list + compound risk
    useWardInsights.ts         Loads explanation + forecast for selected ward
```

## Connecting Phase 2 (real APIs + trained XGBoost model)

1. Populate `.env.local` from `.env.example` (Supabase URL/anon key, ML
   API base URL). Never put secret keys in `NEXT_PUBLIC_*` variables or
   frontend code.
2. Implement `RemoteMLService` (same `MLService` interface in
   `lib/services/mlService.ts`) that calls a FastAPI backend running the
   trained XGBoost model and SHAP explainer. Swap the `mlService` export.
3. Replace the functions in `lib/data/mockDataService.ts` with Supabase
   queries / real provider API calls, keeping the same return types from
   `lib/types.ts`.
4. Load real ward boundaries into `wards.geojson` (Supabase) instead of
   `lib/data/mockWards.ts`.

No component in `app/` or `components/` needs to change for this swap —
they only depend on the types in `lib/types.ts` and the two service
seams (`mockDataService` / `mlService`).

## What this system explicitly does NOT do

- Does not claim any data is real-time (Phase 1 has no live feeds).
- Does not claim a model is trained (compound risk + forecast + scenario
  results all use a transparent, documented demo formula, not ML).
- Does not claim outages can be guaranteed or prevented.
- Does not invent accuracy percentages or cite real government datasets.
- Does not automatically control any grid infrastructure — every
  recommendation is explicitly a "recommended action" for a human
  operator.
