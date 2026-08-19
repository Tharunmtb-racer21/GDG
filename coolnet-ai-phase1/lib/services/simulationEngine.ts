import type { RiskLevel, WardFeatureSnapshot } from "@/lib/types";

/**
 * Simulation Engine (Phase 1 — transparent demo calculation)
 * -----------------------------------------------------------------------
 * This module is intentionally simple and fully transparent. It is NOT
 * the eventual ML model. In Phase 2, `predictGridRisk` and
 * `runScenarioSimulation` in `mlService.ts` will call a trained XGBoost
 * model served via FastAPI, and this file becomes a fallback / sanity
 * baseline rather than the source of truth.
 *
 * Weights below are illustrative only — not derived from real data.
 */
export const DEMO_WEIGHTS = {
  heatStress: 0.3,
  gridStress: 0.3,
  vulnerability: 0.25,
  coolingAccess: 0.15, // inverted: lower access = higher risk
};

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Converts raw temperature + humidity into a simplified 0-100 heat stress score. */
export function heatStressScore(heatIndexC: number): number {
  // Demo mapping: 25°C -> ~10, 45°C -> ~100
  return clamp(((heatIndexC - 25) / 20) * 100);
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 40) return "MODERATE";
  return "LOW";
}

export interface CompoundRiskInputs {
  heat_index: number;
  grid_stress: number;
  vulnerability_score: number;
  cooling_access: number;
}

export interface CompoundRiskBreakdown {
  score: number;
  heatStress: number;
  gridStress: number;
  vulnerability: number;
  coolingAccessPenalty: number;
}

/**
 * Transparent demo weighted-sum calculation.
 * Real methodology (Phase 2) = trained ML grid-risk output blended with
 * heat + vulnerability + cooling-access factors via the compound risk
 * engine — not hard-coded in the UI layer.
 */
export function computeCompoundRisk(inputs: CompoundRiskInputs): CompoundRiskBreakdown {
  const heat = heatStressScore(inputs.heat_index);
  const grid = clamp(inputs.grid_stress);
  const vuln = clamp(inputs.vulnerability_score);
  const coolingPenalty = clamp(100 - inputs.cooling_access);

  const score = clamp(
    heat * DEMO_WEIGHTS.heatStress +
      grid * DEMO_WEIGHTS.gridStress +
      vuln * DEMO_WEIGHTS.vulnerability +
      coolingPenalty * DEMO_WEIGHTS.coolingAccess
  );

  return {
    score: Math.round(score),
    heatStress: Math.round(heat),
    gridStress: Math.round(grid),
    vulnerability: Math.round(vuln),
    coolingAccessPenalty: Math.round(coolingPenalty),
  };
}

export interface ScenarioDeltas {
  temperature_delta: number;
  demand_delta_pct: number;
  cooling_access_delta_pct: number;
}

/** Applies what-if deltas to a baseline snapshot and returns adjusted features. */
export function applyScenarioDeltas(
  baseline: WardFeatureSnapshot,
  deltas: ScenarioDeltas
): CompoundRiskInputs {
  const adjustedHeatIndex = baseline.heat_index + deltas.temperature_delta * 1.6; // demo sensitivity factor
  const adjustedGridStress = clamp(
    baseline.grid_stress + deltas.demand_delta_pct * 0.8
  );
  const adjustedCoolingAccess = clamp(
    baseline.cooling_access + deltas.cooling_access_delta_pct
  );

  return {
    heat_index: adjustedHeatIndex,
    grid_stress: adjustedGridStress,
    vulnerability_score: baseline.vulnerability_score,
    cooling_access: adjustedCoolingAccess,
  };
}
