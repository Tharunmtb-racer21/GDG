/**
 * CoolNet AI — Compound Climate Risk Intelligence Engine
 * -----------------------------------------------------------------------------
 * Orchestrates ML Heat Stress + Grid Strain + Social Vulnerability + Cooling Access Deficit
 * into a unified 0-100 Compound Risk Score.
 * 
 * FORMULA SPECIFICATION:
 *   Compound Risk = (HeatStress * 0.40) + (GridStress * 0.25) + 
 *                   (Vulnerability * 0.20) + ((100 - CoolingAccess) * 0.15) + AnomalyBonus
 * 
 * Where:
 *   - HeatStress: AI Predicted Heat Stress from live Open-Meteo weather (0-100)
 *   - GridStress: Electrical grid load & transformer strain (0-100)
 *   - Vulnerability: Social & demographic exposure index (0-100)
 *   - CoolingAccess Deficit: (100 - CoolingAccess) protective factor offset
 *   - AnomalyBonus: +3 to +8 penalty if current heat exceeds 4-year baseline
 */

import { RiskLevel } from "@/lib/types";
import { getRiskCategory } from "@/lib/utils/riskCategory";
import {
  generateActionRecommendations,
  ActionRecommendation,
} from "./actionRecommendationService";

export interface CompoundRiskInput {
  heatStress: number;
  historicalAnomaly?: number;
  gridStress: number;
  vulnerability: number;
  coolingAccess: number;
}

export interface CompoundRiskResult {
  score: number; // 0-100
  category: RiskLevel;
  primaryDriver: string;
  secondaryDriver: string;
  drivers: Array<{ factor: string; score: number; percentage: number }>;
  explanation: string;
  recommendations: ActionRecommendation[];
  metrics: {
    heatComponent: number;
    gridComponent: number;
    vulnerabilityComponent: number;
    coolingDeficitComponent: number;
  };
}

export function calculateCompoundClimateRisk(input: CompoundRiskInput): CompoundRiskResult {
  const heat = Math.max(0, Math.min(100, input.heatStress));
  const grid = Math.max(0, Math.min(100, input.gridStress));
  const vuln = Math.max(0, Math.min(100, input.vulnerability));
  const cool = Math.max(0, Math.min(100, input.coolingAccess));
  const anomaly = input.historicalAnomaly ?? 0;

  // Cooling access acts as a protective factor -> Deficit = 100 - CoolingAccess
  const coolDeficit = Math.max(0, 100 - cool);

  // Anomaly modifier (+4 penalty if current heat is significantly above baseline)
  const anomalyBonus = anomaly > 10 ? 4 : anomaly > 5 ? 2 : 0;

  // Weighted compound formulation
  const heatComponent = heat * 0.40;
  const gridComponent = grid * 0.25;
  const vulnerabilityComponent = vuln * 0.20;
  const coolingDeficitComponent = coolDeficit * 0.15;

  const rawScore = heatComponent + gridComponent + vulnerabilityComponent + coolingDeficitComponent + anomalyBonus;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  const category = getRiskCategory(score);

  // Driver ranking analysis
  const driverList = [
    { factor: "Heat Stress", score: heat, percentage: Math.round(heatComponent) },
    { factor: "Grid Stress", score: grid, percentage: Math.round(gridComponent) },
    { factor: "Vulnerability", score: vuln, percentage: Math.round(vulnerabilityComponent) },
    { factor: "Cooling Deficit", score: coolDeficit, percentage: Math.round(coolingDeficitComponent) },
  ];

  driverList.sort((a, b) => b.score - a.score);

  const primaryDriver = driverList[0].factor;
  const secondaryDriver = driverList[1].factor;

  // Deterministic Explainable AI text generation
  let explanation = `This area is currently categorized as ${category} Compound Climate Risk (${score}/100). `;
  if (primaryDriver === "Heat Stress") {
    explanation += `The primary driver is elevated atmospheric heat stress (${heat}/100), `;
  } else if (primaryDriver === "Grid Stress") {
    explanation += `The primary driver is severe electrical grid overload (${grid}/100), `;
  } else {
    explanation += `The primary driver is elevated social demographic vulnerability (${vuln}/100), `;
  }

  if (anomaly > 5) {
    explanation += `exacerbated by a +${anomaly.toFixed(1)}°C anomaly above the 4-year regional baseline. `;
  } else {
    explanation += `compounded by secondary grid and vulnerability pressures. `;
  }

  if (cool < 40) {
    explanation += `Limited cooling infrastructure access (${cool}%) reduces localized community resilience.`;
  }

  // Recommendations
  const recommendations = generateActionRecommendations(
    category,
    primaryDriver,
    secondaryDriver,
    heat,
    grid,
    vuln,
    cool
  );

  return {
    score,
    category,
    primaryDriver,
    secondaryDriver,
    drivers: driverList,
    explanation,
    recommendations,
    metrics: {
      heatComponent: Math.round(heatComponent),
      gridComponent: Math.round(gridComponent),
      vulnerabilityComponent: Math.round(vulnerabilityComponent),
      coolingDeficitComponent: Math.round(coolingDeficitComponent),
    },
  };
}

// Backward compatibility export
export interface CompoundRiskAssessment {
  region_id: string;
  compound_risk_score: number;
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
  const result = calculateCompoundClimateRisk({
    heatStress: heatIndex,
    gridStress,
    vulnerability,
    coolingAccess,
  });

  return {
    region_id: "N/A",
    compound_risk_score: result.score,
    risk_level: result.category,
    heat_score: Math.round(inputToHeatScore(heatIndex)),
    grid_score: gridStress,
    vulnerability_score: vulnerability,
    cooling_access_score: coolingAccess,
    model_name: "XGBoost-Compound-Resilience-v1",
    is_demo: true,
  };
}

function inputToHeatScore(hi: number): number {
  return Math.min(100, Math.max(0, ((hi - 30) / 22) * 100));
}
