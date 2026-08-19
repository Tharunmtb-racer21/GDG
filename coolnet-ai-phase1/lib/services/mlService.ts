import type {
  CompoundRiskResult,
  FeatureContribution,
  GridRiskPrediction,
  RiskExplanation,
  RiskForecast,
  ScenarioInput,
  ScenarioResult,
  WardFeatureSnapshot,
} from "@/lib/types";
import {
  applyScenarioDeltas,
  computeCompoundRisk,
  riskLevelFromScore,
} from "@/lib/services/simulationEngine";

/**
 * ML Service Interface
 * -----------------------------------------------------------------------
 * This is the single seam between the frontend and the risk-modeling
 * backend. In Phase 1, `DemoMLService` implements it with transparent,
 * clearly-labelled demo calculations (see simulationEngine.ts).
 *
 * In Phase 2, replace `DemoMLService` with `RemoteMLService`, which calls
 * a FastAPI backend that:
 *   - runs a trained XGBoost model for `predictGridRisk`
 *   - runs the compound risk engine for `calculateCompoundRisk`
 *   - runs SHAP for `getRiskExplanation`
 *   - re-scores scenarios for `runScenarioSimulation`
 *
 * No component outside this file (and RemoteMLService, once built) should
 * know whether it's talking to demo logic or a real model.
 */
export interface MLService {
  predictGridRisk(features: WardFeatureSnapshot): Promise<GridRiskPrediction>;
  calculateCompoundRisk(features: WardFeatureSnapshot): Promise<CompoundRiskResult>;
  getRiskExplanation(features: WardFeatureSnapshot): Promise<RiskExplanation>;
  getForecast(features: WardFeatureSnapshot): Promise<RiskForecast>;
  runScenarioSimulation(
    baseline: WardFeatureSnapshot,
    input: ScenarioInput
  ): Promise<ScenarioResult>;
}

const MODEL_VERSION = "demo-v0";

class DemoMLService implements MLService {
  async predictGridRisk(features: WardFeatureSnapshot): Promise<GridRiskPrediction> {
    // DEMO: real implementation will call XGBoost via FastAPI.
    const { gridStress } = computeCompoundRisk({
      heat_index: features.heat_index,
      grid_stress: features.grid_stress,
      vulnerability_score: features.vulnerability_score,
      cooling_access: features.cooling_access,
    });

    return {
      ward_id: features.ward_id,
      timestamp: features.timestamp,
      grid_risk_score: gridStress,
      model_version: MODEL_VERSION,
      is_demo: true,
    };
  }

  async calculateCompoundRisk(features: WardFeatureSnapshot): Promise<CompoundRiskResult> {
    const breakdown = computeCompoundRisk({
      heat_index: features.heat_index,
      grid_stress: features.grid_stress,
      vulnerability_score: features.vulnerability_score,
      cooling_access: features.cooling_access,
    });

    return {
      ward_id: features.ward_id,
      timestamp: features.timestamp,
      compound_risk_score: breakdown.score,
      risk_level: riskLevelFromScore(breakdown.score),
      grid_risk_score: breakdown.gridStress,
      heat_stress_score: breakdown.heatStress,
      vulnerability_score: breakdown.vulnerability,
      cooling_access_score: features.cooling_access,
      is_demo: true,
    };
  }

  async getRiskExplanation(features: WardFeatureSnapshot): Promise<RiskExplanation> {
    // DEMO: proportional contribution breakdown, NOT real SHAP values.
    const breakdown = computeCompoundRisk({
      heat_index: features.heat_index,
      grid_stress: features.grid_stress,
      vulnerability_score: features.vulnerability_score,
      cooling_access: features.cooling_access,
    });

    const contributions: FeatureContribution[] = [
      { factor: "Heat Stress", contribution: Math.round(breakdown.heatStress * 0.3) },
      { factor: "Grid Stress", contribution: Math.round(breakdown.gridStress * 0.3) },
      { factor: "Vulnerability", contribution: Math.round(breakdown.vulnerability * 0.25) },
      {
        factor: "Cooling Access",
        contribution: Math.round(breakdown.coolingAccessPenalty * 0.15),
      },
    ];
    contributions.sort((a, b) => b.contribution - a.contribution);

    return {
      ward_id: features.ward_id,
      timestamp: features.timestamp,
      contributions,
      method: "demo-heuristic",
      note: "These values represent demo feature contributions. Real SHAP explanations will be connected in the ML phase.",
      is_demo: true,
    };
  }

  async getForecast(features: WardFeatureSnapshot): Promise<RiskForecast> {
    // DEMO: simple upward trend extrapolation, NOT a trained time-series model.
    const current = computeCompoundRisk({
      heat_index: features.heat_index,
      grid_stress: features.grid_stress,
      vulnerability_score: features.vulnerability_score,
      cooling_access: features.cooling_access,
    }).score;

    const drift30 = Math.round(features.grid_stress * 0.06 + features.heat_index * 0.12);
    const drift60 = Math.round(drift30 * 1.6);

    const points = [
      { label: "NOW" as const, minutes_ahead: 0, risk_score: current },
      {
        label: "30 MIN" as const,
        minutes_ahead: 30,
        risk_score: Math.min(100, current + drift30),
      },
      {
        label: "60 MIN" as const,
        minutes_ahead: 60,
        risk_score: Math.min(100, current + drift60),
      },
    ];

    return {
      ward_id: features.ward_id,
      generated_at: new Date().toISOString(),
      points,
      is_demo: true,
    };
  }

  async runScenarioSimulation(
    baseline: WardFeatureSnapshot,
    input: ScenarioInput
  ): Promise<ScenarioResult> {
    // DEMO: transparent recalculation using adjusted inputs.
    // Phase 2: send `input` to the FastAPI /simulate endpoint, which
    // re-runs the trained model on the perturbed feature vector.
    const baselineBreakdown = computeCompoundRisk({
      heat_index: baseline.heat_index,
      grid_stress: baseline.grid_stress,
      vulnerability_score: baseline.vulnerability_score,
      cooling_access: baseline.cooling_access,
    });

    const adjusted = applyScenarioDeltas(baseline, {
      temperature_delta: input.temperature_delta,
      demand_delta_pct: input.demand_delta_pct,
      cooling_access_delta_pct: input.cooling_access_delta_pct,
    });

    const simulatedBreakdown = computeCompoundRisk(adjusted);

    return {
      ward_id: baseline.ward_id,
      input,
      baseline_risk_score: baselineBreakdown.score,
      simulated_risk_score: simulatedBreakdown.score,
      delta: simulatedBreakdown.score - baselineBreakdown.score,
      risk_level: riskLevelFromScore(simulatedBreakdown.score),
      method: "demo-transparent-calc",
      is_demo: true,
    };
  }
}

/**
 * Singleton export. Swap this line to point at a `RemoteMLService`
 * (calling FastAPI) once the trained model is ready — no other file
 * needs to change.
 */
export const mlService: MLService = new DemoMLService();
