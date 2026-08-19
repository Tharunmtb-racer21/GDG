/**
 * CoolNet AI — Core Data Model
 * -----------------------------------------------------------------------
 * These types describe the conceptual inputs and outputs of the pipeline:
 *
 *   LIVE/AVAILABLE DATA → DATA PROCESSING → GRID-STRESS/OUTAGE-RISK ML →
 *   COMPOUND RISK ENGINE → EXPLAINABLE AI → FORECAST → WHAT-IF SIMULATION →
 *   INTERVENTION RECOMMENDATION → LIVE GIS MAP → FEEDBACK
 *
 * Phase 1 populates these shapes with clearly labelled demo data via
 * `lib/data/mockDataService.ts`. Phase 2 swaps the implementation for
 * Supabase + a FastAPI/XGBoost service without changing these contracts.
 */

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type DataSourceStatus = "ONLINE" | "DEGRADED" | "OFFLINE" | "DEMO";

/** Raw / near-term feature inputs for a single ward at a point in time. */
export interface WardFeatureSnapshot {
  ward_id: string;
  timestamp: string; // ISO 8601

  // Environmental
  temperature: number; // °C
  humidity: number; // %
  heat_index: number; // °C (derived from temperature + humidity)

  // Grid
  electricity_demand: number; // % of local capacity
  grid_stress: number; // 0-100 composite grid strain score
  historical_outage_frequency: number; // outages / year (rolling)

  // Vulnerability / exposure
  population_density: number; // people / km²
  vulnerability_score: number; // 0-100 (age, health, income, housing factors)
  cooling_access: number; // 0-100 (% with reliable access to cooling)
}

/** Static ward metadata (does not change frequently). */
export interface WardMeta {
  ward_id: string;
  name: string;
  region: string;
  population: number;
  centroid: [number, number]; // [lat, lng]
}

/** GeoJSON polygon boundary for a ward, used by the GIS map layer. */
export interface WardGeometry {
  ward_id: string;
  geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

/** Output of the grid-stress / outage-risk ML model (XGBoost, Phase 2). */
export interface GridRiskPrediction {
  ward_id: string;
  timestamp: string;
  grid_risk_score: number; // 0-100, model output
  model_version: string; // e.g. "demo-v0" until real model is trained
  is_demo: boolean;
}

/** Output of the compound risk engine (grid risk + heat + vulnerability). */
export interface CompoundRiskResult {
  ward_id: string;
  timestamp: string;
  compound_risk_score: number; // 0-100
  risk_level: RiskLevel;
  grid_risk_score: number;
  heat_stress_score: number;
  vulnerability_score: number;
  cooling_access_score: number;
  is_demo: boolean;
}

/** Explainability contribution for a single factor (SHAP-style, Phase 2). */
export interface FeatureContribution {
  factor: "Heat Stress" | "Grid Stress" | "Vulnerability" | "Cooling Access";
  contribution: number; // signed magnitude, demo units in Phase 1
}

export interface RiskExplanation {
  ward_id: string;
  timestamp: string;
  contributions: FeatureContribution[];
  method: "demo-heuristic" | "shap";
  note: string;
  is_demo: boolean;
}

/** A single point in a short-term risk forecast timeline. */
export interface ForecastPoint {
  label: "NOW" | "30 MIN" | "60 MIN";
  minutes_ahead: number;
  risk_score: number;
}

export interface RiskForecast {
  ward_id: string;
  generated_at: string;
  points: ForecastPoint[];
  is_demo: boolean;
}

/** Inputs for the what-if scenario simulator. */
export interface ScenarioInput {
  ward_id: string;
  temperature_delta: number; // °C, e.g. +2
  demand_delta_pct: number; // %, e.g. +15
  cooling_access_delta_pct: number; // %, e.g. -10
}

export interface ScenarioResult {
  ward_id: string;
  input: ScenarioInput;
  baseline_risk_score: number;
  simulated_risk_score: number;
  delta: number;
  risk_level: RiskLevel;
  method: "demo-transparent-calc" | "ml-model";
  is_demo: boolean;
}

/** A recommended preventive action, tied to a risk level. */
export interface Intervention {
  id: string;
  ward_id: string;
  risk_level: RiskLevel;
  priority: number; // 1 = highest priority
  action: string;
  category: "cooling" | "communication" | "grid-ops" | "restoration-planning";
}

/** Health/status of an upstream data feed. */
export interface DataFeedHealth {
  feed: "Weather Feed" | "Grid Feed" | "Vulnerability Data" | "Ward GIS";
  status: DataSourceStatus;
  last_updated: string;
  detail: string;
}

/** Aggregate view used to render a ward card / map marker at a glance. */
export interface WardSummary {
  meta: WardMeta;
  snapshot: WardFeatureSnapshot;
  compoundRisk: CompoundRiskResult;
}

/** User feedback captured on a recommendation or prediction (feedback loop). */
export interface FeedbackEntry {
  id: string;
  ward_id: string;
  related_to: "prediction" | "intervention";
  rating: "helpful" | "not-helpful";
  comment?: string;
  created_at: string;
}
