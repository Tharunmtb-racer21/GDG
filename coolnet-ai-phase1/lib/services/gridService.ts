/**
 * CoolNet AI — Electrical Grid Stress & Outage Risk Service
 * Manages feeder strain, demand peak loads, and probability of tripping.
 */

export interface GridStressMetric {
  region_id: string;
  grid_stress_score: number; // 0-100
  demand_capacity_pct: number; // %
  outage_risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  feeder_status: "STABLE" | "HIGH_DEMAND" | "OVERLOAD_WARNING" | "TRIPPED";
  is_live: boolean;
}

export function getGridRiskCategory(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score < 40) return "LOW";
  if (score < 65) return "MODERATE";
  if (score < 80) return "HIGH";
  return "CRITICAL";
}
