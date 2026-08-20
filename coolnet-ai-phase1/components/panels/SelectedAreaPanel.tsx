"use client";

import React, { useEffect, useState } from "react";
import type { RiskForecast, WardSummary } from "@/lib/types";
import { getCurrentWeather, NormalizedWeather } from "@/lib/services/weatherService";
import { calculateHeatStress, HeatStressResult } from "@/lib/utils/heatStress";
import { calculateCompoundRisk, CompoundRiskAssessment } from "@/lib/services/riskService";
import { runXGBoostInference, MLPredictionResult } from "@/lib/services/realMlEngine";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DataStatusBadge } from "@/components/ui/mapcn";

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
  const [compoundRisk, setCompoundRisk] = useState<CompoundRiskAssessment | null>(null);

  // Effective coordinates & name
  const areaName = selectedArea?.name || ward?.meta.name || "Delhi Metro";
  const stateRegion = selectedArea?.state || selectedArea?.district || ward?.meta.region || "Delhi NCR";
  const lat = selectedArea?.lat ?? (ward ? ward.meta.centroid[0] : 28.6139);
  const lon = selectedArea?.lon ?? (ward ? ward.meta.centroid[1] : 77.2090);

  // Fetch real-time weather & run XGBoost ML inference
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

        // 3. Feed ML Heat Stress Prediction into Compound Risk Engine
        const gridVal = ward ? ward.snapshot.grid_stress : 68;
        const vulnVal = ward ? ward.snapshot.vulnerability_score : 58;
        const coolVal = ward ? ward.snapshot.cooling_access : 45;
        const cr = calculateCompoundRisk(ml.heatStressScore, gridVal, vulnVal, coolVal);
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
          Click any State, District, or Ward on the map to run real-time XGBoost heat stress predictions.
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

      {/* Weather Status Indicator */}
      <div className="flex items-center justify-between rounded-lg border border-border/80 bg-base-900/90 px-3 py-2">
        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-mono text-[11px] font-medium text-amber-400">
                EVALUATING XGBOOST ML PIPELINE...
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] font-medium text-emerald-400">
                XGBOOST ML PREDICTION ACTIVE
              </span>
            </>
          )}
        </div>
        <DataStatusBadge />
      </div>

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

          <div className="rounded-md border border-border/80 bg-base-950 p-2.5">
            <span className="text-[10px] text-ink-400 uppercase font-mono block">Humidity</span>
            <span className="font-mono text-lg font-bold text-cyan-400 mt-0.5 block">{weather.humidity}%</span>
          </div>

          <div className="rounded-md border border-border/80 bg-base-950 p-2.5">
            <span className="text-[10px] text-ink-400 uppercase font-mono block">Wind Speed</span>
            <span className="font-mono text-lg font-bold text-emerald-400 mt-0.5 block">{weather.windSpeed} km/h</span>
          </div>
        </div>
      )}

      {/* AI Heat Stress & Baseline Anomaly Card */}
      {mlPrediction && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-accent text-sm">🤖</span>
              <h4 className="font-mono text-xs font-bold uppercase text-ink-100">
                AI HEAT STRESS PREDICTION
              </h4>
            </div>
            <span className="font-mono text-[10px] font-extrabold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
              {mlPrediction.category}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-border/40 pt-2">
            <div>
              <span className="text-[10px] font-mono text-ink-400 uppercase block">Predicted Score</span>
              <span className="font-mono text-2xl font-extrabold text-red-400">
                {mlPrediction.heatStressScore} <span className="text-xs text-ink-400 font-normal">/100</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-ink-400 uppercase block">4-Yr Baseline</span>
              <span className="font-mono text-sm font-bold text-ink-200">
                {mlPrediction.historicalBaseline} <span className="text-orange-400 text-xs font-semibold">(+{mlPrediction.anomaly})</span>
              </span>
            </div>
          </div>

          {/* Model Status Note */}
          <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[10px] font-mono text-ink-400">
            <span>MODEL: {mlPrediction.model}</span>
            <span className="text-emerald-400 font-bold">● {mlPrediction.status}</span>
          </div>
        </div>
      )}

      {/* Compound Risk Card */}
      {compoundRisk && (
        <div className="rounded-lg border border-border/80 bg-base-900 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-ink-100 uppercase">
              Compound Risk Score
            </span>
            <RiskBadge level={compoundRisk.risk_level} />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-extrabold text-orange-400">
              {compoundRisk.compound_risk_score}
            </span>
            <span className="font-mono text-xs text-ink-400">/100</span>
          </div>

          {/* Sub-Risk Bar Breakdown */}
          <div className="space-y-1.5 border-t border-border/40 pt-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-ink-400">AI Heat Stress (40%)</span>
              <span className="font-mono font-bold text-red-400">{compoundRisk.heat_score}</span>
            </div>

            <div className="flex justify-between text-[10px]">
              <span className="text-ink-400">Grid Strain (30%)</span>
              <span className="font-mono font-bold text-yellow-400">{compoundRisk.grid_score}</span>
            </div>

            <div className="flex justify-between text-[10px]">
              <span className="text-ink-400">Vulnerability (20%)</span>
              <span className="font-mono font-bold text-blue-400">{compoundRisk.vulnerability_score}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
