-- =========================================================================
-- CoolNet AI — Supabase Schema (Phase 2 target)
-- =========================================================================
-- This schema is prepared ahead of live integration. Phase 1 does NOT
-- read/write to Supabase — the dashboard runs entirely on
-- lib/data/mockDataService.ts. This file documents the intended shape so
-- the frontend types (lib/types.ts) and this schema stay in sync.
-- =========================================================================

create extension if not exists "uuid-ossp";

-- Ward boundaries & static metadata
create table if not exists wards (
  ward_id text primary key,
  name text not null,
  region text not null,
  population integer not null,
  centroid_lat double precision not null,
  centroid_lng double precision not null,
  geojson jsonb not null,
  created_at timestamptz not null default now()
);

-- Raw weather observations per ward
create table if not exists weather_data (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  temperature double precision not null,
  humidity double precision not null,
  heat_index double precision not null,
  source text not null default 'unassigned', -- e.g. provider name once connected
  recorded_at timestamptz not null default now()
);

-- Grid telemetry per ward
create table if not exists grid_data (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  electricity_demand double precision not null, -- % of local capacity
  grid_stress double precision not null,          -- 0-100 composite score
  historical_outage_frequency integer not null default 0,
  source text not null default 'unassigned',
  recorded_at timestamptz not null default now()
);

-- Social vulnerability / cooling access per ward
create table if not exists vulnerability_data (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  population_density double precision not null,
  vulnerability_score double precision not null, -- 0-100
  cooling_access double precision not null,       -- 0-100
  source text not null default 'unassigned',
  recorded_at timestamptz not null default now()
);

-- Output of the ML pipeline (grid risk + compound risk + explanation)
create table if not exists risk_predictions (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  grid_risk_score double precision not null,
  compound_risk_score double precision not null,
  risk_level text not null check (risk_level in ('LOW','MODERATE','HIGH','CRITICAL')),
  heat_stress_score double precision not null,
  vulnerability_score double precision not null,
  cooling_access_score double precision not null,
  explanation jsonb, -- SHAP-style contribution breakdown
  forecast jsonb,     -- { now, plus_30, plus_60 }
  model_version text not null,
  is_demo boolean not null default true,
  predicted_at timestamptz not null default now()
);

-- Recommended interventions surfaced to operators
create table if not exists interventions (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  risk_level text not null check (risk_level in ('LOW','MODERATE','HIGH','CRITICAL')),
  priority integer not null,
  action text not null,
  category text not null check (
    category in ('cooling','communication','grid-ops','restoration-planning')
  ),
  created_at timestamptz not null default now()
);

-- What-if simulator run history
create table if not exists simulation_runs (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  temperature_delta double precision not null,
  demand_delta_pct double precision not null,
  cooling_access_delta_pct double precision not null,
  baseline_risk_score double precision not null,
  simulated_risk_score double precision not null,
  method text not null default 'demo-transparent-calc',
  run_by text, -- optional operator identifier
  created_at timestamptz not null default now()
);

-- Operator feedback loop (closes: ... → FEEDBACK)
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  ward_id text not null references wards(ward_id),
  related_to text not null check (related_to in ('prediction','intervention')),
  rating text not null check (rating in ('helpful','not-helpful')),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_weather_ward on weather_data(ward_id, recorded_at desc);
create index if not exists idx_grid_ward on grid_data(ward_id, recorded_at desc);
create index if not exists idx_vulnerability_ward on vulnerability_data(ward_id, recorded_at desc);
create index if not exists idx_predictions_ward on risk_predictions(ward_id, predicted_at desc);
create index if not exists idx_simulation_ward on simulation_runs(ward_id, created_at desc);
