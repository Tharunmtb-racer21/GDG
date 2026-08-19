"use client";

import { useEffect, useState } from "react";
import type { RiskExplanation, RiskForecast, WardSummary } from "@/lib/types";
import { mlService } from "@/lib/services/mlService";

/**
 * Loads explainability + forecast output for the currently selected ward.
 * Backed by DemoMLService in Phase 1; the same hook will work unchanged
 * once mlService is swapped for a RemoteMLService calling FastAPI.
 */
export function useWardInsights(ward: WardSummary | null) {
  const [explanation, setExplanation] = useState<RiskExplanation | null>(null);
  const [forecast, setForecast] = useState<RiskForecast | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ward) {
      setExplanation(null);
      setForecast(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      mlService.getRiskExplanation(ward.snapshot),
      mlService.getForecast(ward.snapshot),
    ]).then(([exp, fc]) => {
      if (!cancelled) {
        setExplanation(exp);
        setForecast(fc);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ward]);

  return { explanation, forecast, loading };
}
