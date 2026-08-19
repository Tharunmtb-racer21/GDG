import type { RiskLevel } from "@/lib/types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  LOW: "text-risk-low",
  MODERATE: "text-risk-moderate",
  HIGH: "text-risk-high",
  CRITICAL: "text-risk-critical",
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  LOW: "bg-risk-low/15 border-risk-low/40",
  MODERATE: "bg-risk-moderate/15 border-risk-moderate/40",
  HIGH: "bg-risk-high/15 border-risk-high/40",
  CRITICAL: "bg-risk-critical/15 border-risk-critical/40",
};

export const RISK_ORDER: RiskLevel[] = ["CRITICAL", "HIGH", "MODERATE", "LOW"];

export function riskWeight(level: RiskLevel): number {
  return { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 }[level];
}
