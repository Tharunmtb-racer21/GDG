"use client";

import React, { useEffect, useState } from "react";
import type { RiskForecast, WardSummary } from "@/lib/types";
import { getCurrentWeather, NormalizedWeather } from "@/lib/services/weatherService";
import { calculateHeatStress, HeatStressResult } from "@/lib/utils/heatStress";
import {
  calculateCompoundClimateRisk,
  CompoundRiskResult,
} from "@/lib/services/riskService";
import { runXGBoostInference, MLPredictionResult } from "@/lib/services/realMlEngine";
import { RiskBadge } from "@/components/ui/RiskBadge";

export interface SelectedAreaMeta {
  id: string;
  name: string;
  level: "state" | "district" | "ward";
  state?: string;
  district?: string;
  lat: number;
  lon: number;
}

export function SelectedAreaPanel({
  selectedArea,
  ward,
  forecast,
}: {
  selectedArea: SelectedAreaMeta | null;
  ward: WardSummary | null;
  forecast: RiskForecast | null;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [weather, setWeather] = useState<NormalizedWeather | null>(null);
  const [heatStress, setHeatStress] = useState<HeatStressResult | null>(null);
  const [mlPrediction, setMlPrediction] = useState<MLPredictionResult | null>(null);
  const [compoundRisk, setCompoundRisk] = useState<CompoundRiskResult | null>(null);

  // Effective coordinates & name
  const areaName = selectedArea?.name || ward?.meta.name || "Delhi Metro";
  const stateRegion = selectedArea?.state || selectedArea?.district || ward?.meta.region || "Delhi NCR";
  const lat = selectedArea?.lat ?? (ward ? ward.meta.centroid[0] : 28.6139);
  const lon = selectedArea?.lon ?? (ward ? ward.meta.centroid[1] : 77.2090);

  // Fetch real-time weather & run XGBoost ML & Compound Risk inference
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCurrentWeather(lat, lon)
      .then((data) => {
        if (!isMounted) return;
        setWeather(data);

        // 1. Live Weather Heat Stress Calculation
        const hs = calculateHeatStress(
          data.temperature,
          data.humidity,
          data.apparentTemperature,
          data.windSpeed
        );
        setHeatStress(hs);

        // 2. Supervised XGBoost ML Inference Engine Call
        const ml = runXGBoostInference({
          temperature: data.temperature,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          apparentTemperature: data.apparentTemperature,
          latitude: lat,
          longitude: lon,
        });
        setMlPrediction(ml);

        // 3. CoolNet Compound Climate Risk Engine Call
        const gridVal = ward ? ward.snapshot.grid_stress : 68;
        const vulnVal = ward ? ward.snapshot.vulnerability_score : 58;
        const coolVal = ward ? ward.snapshot.cooling_access : 45;

        const cr = calculateCompoundClimateRisk({
          heatStress: ml.heatStressScore,
          historicalAnomaly: ml.anomaly,
          gridStress: gridVal,
          vulnerability: vulnVal,
          coolingAccess: coolVal,
        });
        setCompoundRisk(cr);

        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lon, ward]);

  if (!selectedArea && !ward) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="text-3xl">🇮🇳</span>
        <p className="text-sm font-semibold uppercase tracking-wider text-ink-300">
          NATIONAL VIEW
        </p>
        <p className="text-xs leading-relaxed text-ink-500 max-w-[220px]">
          Click any State, District, or Ward on the map to evaluate Compound Climate Risk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 text-xs font-sans">
      {/* Header Info */}
      <div className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            SELECTED AREA
          </span>
          <span className="rounded bg-base-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-300 uppercase">
            {selectedArea?.level || "WARD"} LEVEL
          </span>
        </div>
        <h3 className="mt-1 font-mono text-xl font-bold text-ink-100 uppercase tracking-tight">
          {areaName}
        </h3>
        <p className="text-xs font-medium text-ink-400">{stateRegion}</p>
      </div>

      {/* Alert Banner for High / Critical Risk */}
      {compoundRisk && (compoundRisk.category === "HIGH" || compoundRisk.category === "CRITICAL") && (
        <div className="rounded-md border border-red-500/50 bg-red-950/60 p-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <div>
              <h4 className="font-mono text-[11px] font-bold uppercase text-red-300">
                {compoundRisk.category} CLIMATE RISK ALERT
              </h4>
              <p className="text-[10px] text-red-200">Simultaneous Heat & Grid Overload</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Compound Risk Score Panel */}
      {compoundRisk && (
        <div className="rounded-lg border border-accent/40 bg-base-900 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-ink-100 uppercase">
              COMPOUND CLIMATE RISK
            </span>
            <RiskBadge level={compoundRisk.category} />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-extrabold text-orange-400">
                {compoundRisk.score}
              </span>
              <span className="font-mono text-xs text-ink-400">/100</span>
            </div>

            <div className="text-right font-mono text-[10px]">
              <span className="text-ink-400 block">PRIMARY DRIVER</span>
              <span className="text-accent font-bold uppercase">{compoundRisk.primaryDriver}</span>
            </div>
          </div>

          {/* Sub-Risk Driver Bars */}
          <div className="space-y-1.5 border-t border-border/40 pt-2 font-mono text-[10px]">
            {compoundRisk.drivers.map((d, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-ink-400">{d.factor}</span>
                  <span className="font-bold text-ink-200">{d.score} / 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-base-950 overflow-hidden border border-border/30">
                  <div
                    className="h-full bg-accent transition-all rounded-full"
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Explainability Diagnostic */}
      {compoundRisk && (
        <div className="rounded-lg border border-border/80 bg-base-950 p-3 space-y-1.5">
          <h4 className="font-mono text-[11px] font-bold text-ink-100 uppercase">
            WHY IS THIS AREA AT RISK?
          </h4>
          <p className="text-[11px] text-ink-300 leading-relaxed font-sans">
            {compoundRisk.explanation}
          </p>
        </div>
      )}

      {/* Real-time Weather Grid */}
      {weather && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border/80 bg-base-950 p-2.5">
            <span className="text-[10px] text-ink-400 uppercase font-mono block">Temperature</span>
            <span className="font-mono text-lg font-bold text-ink-100 mt-0.5 block">{weather.temperature}°C</span>
          </div>

          <div className="rounded-md border border-border/80 bg-base-950 p-2.5">
            <span className="text-[10px] text-ink-400 uppercase font-mono block">Feels Like</span>
            <span className="font-mono text-lg font-bold text-red-400 mt-0.5 block">{weather.apparentTemperature}°C</span>
          </div>
        </div>
      )}

      {/* Data Source Honesty Footer */}
      <div className="rounded-md border border-border/60 bg-base-950 p-2 text-[9px] font-mono flex flex-wrap justify-between text-ink-400">
        <span>Weather: <strong className="text-emerald-400">● LIVE</strong></span>
        <span>ML Engine: <strong className="text-emerald-400">● ACTIVE</strong></span>
        <span>Grid: <strong className="text-amber-400">● DEMO</strong></span>
      </div>
    </div>
  );
}
