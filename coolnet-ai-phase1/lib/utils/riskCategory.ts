import { RiskLevel } from "@/lib/types";

export function getRiskCategory(score: number): RiskLevel {
  const norm = Math.max(0, Math.min(100, score));
  if (norm >= 80) return "CRITICAL";
  if (norm >= 60) return "HIGH";
  if (norm >= 30) return "MODERATE";
  return "LOW";
}

export function getRiskCategoryColor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL":
      return "#dc2626"; // Blood Crimson Red
    case "HIGH":
      return "#f97316"; // Bright Orange
    case "MODERATE":
      return "#eab308"; // Amber Yellow
    case "LOW":
      return "#10b981"; // Emerald Green
    default:
      return "#3b82f6";
  }
}
