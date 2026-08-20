/**
 * CoolNet AI — Compound Risk Intelligence Engine
 * Orchestrates Weather + Grid Stress + Vulnerability into unified Compound Risk Scores.
 */

import { RiskLevel } from "@/lib/types";

export interface CompoundRiskAssessment {
  region_id: string;
  compound_risk_score: number; // 0-100
  risk_level: RiskLevel;
  heat_score: number;
  grid_score: number;
  vulnerability_score: number;
  cooling_access_score: number;
  model_name: string;
  is_demo: boolean;
}

export function calculateCompoundRisk(
  heatIndex: number,
  gridStress: number,
  vulnerability: number,
  coolingAccess: number
): CompoundRiskAssessment {
  // Normalize Heat Index (assume 30°C = 0 risk, 52°C = 100 risk)
  const heatScore = Math.min(100, Math.max(0, ((heatIndex - 30) / 22) * 100));
  const coolingDeficitScore = Math.max(0, 100 - coolingAccess);

  // Weighted compound risk formulation
  const rawScore =
    heatScore * 0.40 +
    gridStress * 0.30 +
    vulnerability * 0.20 +
    coolingDeficitScore * 0.10;

  const finalScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  let risk_level: RiskLevel = "LOW";
  if (finalScore >= 80) risk_level = "CRITICAL";
  else if (finalScore >= 60) risk_level = "HIGH";
  else if (finalScore >= 30) risk_level = "MODERATE";

  return {
    region_id: "N/A",
    compound_risk_score: finalScore,
    risk_level,
    heat_score: Math.round(heatScore),
    grid_score: gridStress,
    vulnerability_score: vulnerability,
    cooling_access_score: coolingAccess,
    model_name: "XGBoost-Compound-Resilience-v1",
    is_demo: true,
  };
}
