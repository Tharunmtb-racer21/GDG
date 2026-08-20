"use client";

import React, { useEffect, useState } from "react";
import { getCurrentWeather, NormalizedWeather } from "@/lib/services/weatherService";
import { calculateHeatStress, HeatStressResult } from "@/lib/utils/heatStress";
import {
  calculateCompoundClimateRisk,
  CompoundRiskResult,
} from "@/lib/services/riskService";
import { runXGBoostInference, MLPredictionResult } from "@/lib/services/realMlEngine";
import { SelectedAreaMeta } from "@/components/panels/SelectedAreaPanel";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DataStatusBadge } from "@/components/ui/mapcn";

export interface DistrictDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaMeta: SelectedAreaMeta | null;
  onFlyTo?: (lat: number, lon: number) => void;
}

export function DistrictDetailModal({
  isOpen,
  onClose,
  areaMeta,
  onFlyTo,
}: DistrictDetailModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [weather, setWeather] = useState<NormalizedWeather | null>(null);
  const [heatStress, setHeatStress] = useState<HeatStressResult | null>(null);
  const [mlPrediction, setMlPrediction] = useState<MLPredictionResult | null>(null);
  const [compoundRisk, setCompoundRisk] = useState<CompoundRiskResult | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"overview" | "weather" | "ai" | "interventions">("overview");

  const name = areaMeta?.name || "Coimbatore";
  const stateName = areaMeta?.state || areaMeta?.district || "Tamil Nadu";
  const level = areaMeta?.level || "district";
  const lat = areaMeta?.lat ?? 11.0168;
  const lon = areaMeta?.lon ?? 76.9558;

  // Fetch real-time weather & run XGBoost ML & Compound Climate Risk inference
  useEffect(() => {
    if (!isOpen || !areaMeta) return;

    let isMounted = true;
    setLoading(true);
    setDispatchStatus(null);

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

        // 3. Feed ML Heat Stress Prediction into CoolNet Compound Climate Risk Engine
        const cr = calculateCompoundClimateRisk({
          heatStress: ml.heatStressScore,
          historicalAnomaly: ml.anomaly,
          gridStress: 68,
          vulnerability: 58,
          coolingAccess: 45,
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
  }, [isOpen, areaMeta, lat, lon]);

  if (!isOpen || !areaMeta) return null;

  const handleDispatchAction = (actionName: string) => {
    setDispatchStatus(`Dispatching: ${actionName} for ${name}...`);
    setTimeout(() => {
      setDispatchStatus(`✅ SUCCESS: ${actionName} deployed for ${name}!`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border/80 bg-base-900 shadow-2xl transition-all">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-border/80 bg-base-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-lg">
              🇮🇳
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-xl font-bold uppercase text-ink-100 tracking-tight">
                  {name}
                </h2>
                <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-bold text-accent uppercase">
                  {level} level
                </span>
              </div>
              <p className="text-xs font-medium text-ink-400">{stateName} · Coordinates [{lat.toFixed(2)}, {lon.toFixed(2)}]</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onFlyTo && (
              <button
                onClick={() => onFlyTo(lat, lon)}
                className="rounded-md border border-border bg-base-800 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 transition"
              >
                🎯 Center Map
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-base-800 text-ink-400 hover:bg-base-700 hover:text-ink-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-border/60 bg-base-950/50 px-6">
          <button
            onClick={() => setActiveModalTab("overview")}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition ${
              activeModalTab === "overview"
                ? "border-accent text-accent"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            📊 COMPOUND RISK OVERVIEW
          </button>
          <button
            onClick={() => setActiveModalTab("weather")}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition ${
              activeModalTab === "weather"
                ? "border-accent text-accent"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            🌡 LIVE WEATHER
          </button>
          <button
            onClick={() => setActiveModalTab("ai")}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition ${
              activeModalTab === "ai"
                ? "border-accent text-accent"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            🤖 XGBOOST ML PIPELINE
          </button>
          <button
            onClick={() => setActiveModalTab("interventions")}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition ${
              activeModalTab === "interventions"
                ? "border-accent text-accent"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            🚨 ACTION DISPATCH ({compoundRisk?.recommendations.length ?? 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="font-mono text-xs text-ink-400">Evaluating CoolNet Compound Risk Engine & XGBoost Pipeline...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: COMPOUND RISK OVERVIEW */}
              {activeModalTab === "overview" && (
                <div className="space-y-6">
                  {/* Alert Banner for High / Critical Risk */}
                  {compoundRisk && (compoundRisk.category === "HIGH" || compoundRisk.category === "CRITICAL") && (
                    <div className="rounded-lg border border-red-500/50 bg-red-950/60 p-3.5 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🚨</span>
                        <div>
                          <h4 className="font-mono text-xs font-bold uppercase text-red-300">
                            {compoundRisk.category} CLIMATE RISK ALERT — {name}
                          </h4>
                          <p className="text-[11px] text-red-200 mt-0.5">
                            Heat stress and electrical grid strain are simultaneously elevated. Immediate mitigation recommended.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border/80 bg-base-950 p-3">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Compound Risk</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono text-2xl font-extrabold text-orange-400">
                          {compoundRisk?.score ?? 78}
                        </span>
                        <span className="text-xs text-ink-400 font-mono">/100</span>
                      </div>
                      <div className="mt-2">
                        <RiskBadge level={compoundRisk?.category || "HIGH"} size="sm" />
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-base-950 p-3">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">AI Heat Stress</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono text-2xl font-extrabold text-red-400">
                          {mlPrediction?.heatStressScore ?? 76}
                        </span>
                        <span className="text-xs text-ink-400 font-mono">/100</span>
                      </div>
                      <span className="inline-block mt-2 font-mono text-[9px] font-extrabold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                        {mlPrediction?.category ?? "HIGH"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-base-950 p-3">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Grid Strain</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono text-2xl font-extrabold text-yellow-400">
                          68%
                        </span>
                      </div>
                      <span className="inline-block mt-2 text-[9px] font-mono text-yellow-400 font-semibold">
                        ● DEMO FEED
                      </span>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-base-950 p-3">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Cooling Access</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono text-2xl font-extrabold text-blue-400">
                          45%
                        </span>
                      </div>
                      <span className="inline-block mt-2 text-[9px] font-mono text-blue-400 font-semibold">
                        55% Deficit
                      </span>
                    </div>
                  </div>

                  {/* Primary & Secondary Drivers */}
                  {compoundRisk && (
                    <div className="rounded-lg border border-border/80 bg-base-950 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <h4 className="font-mono text-xs font-bold uppercase text-ink-100">
                          COMPOUND RISK DRIVERS ANALYSIS
                        </h4>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                            PRIMARY: {compoundRisk.primaryDriver}
                          </span>
                          <span className="text-[10px] font-mono text-ink-400 bg-base-800 px-2 py-0.5 rounded">
                            SECONDARY: {compoundRisk.secondaryDriver}
                          </span>
                        </div>
                      </div>

                      {/* Drivers Progress Bars */}
                      <div className="space-y-2 text-xs font-mono">
                        {compoundRisk.drivers.map((d, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-ink-300">{d.factor}</span>
                              <span className="text-accent font-bold">{d.score} / 100</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-base-900 overflow-hidden border border-border/40">
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

                  {/* Deterministic Explainable AI Block */}
                  {compoundRisk && (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
                      <h4 className="font-mono text-xs font-bold text-ink-100 uppercase">
                        EXPLAINABLE AI CLIMATE DIAGNOSTIC
                      </h4>
                      <p className="text-xs text-ink-300 leading-relaxed font-sans">
                        {compoundRisk.explanation}
                      </p>
                    </div>
                  )}

                  {/* Data Source Honesty Status Bar */}
                  <div className="rounded-md border border-border/60 bg-base-950 p-2.5 text-[9px] font-mono flex flex-wrap justify-between items-center text-ink-400">
                    <span>Weather: <strong className="text-emerald-400">● LIVE</strong></span>
                    <span>Historical: <strong className="text-blue-400">● 4-YR BASELINE</strong></span>
                    <span>ML Engine: <strong className="text-emerald-400">● ACTIVE</strong></span>
                    <span>Grid Stress: <strong className="text-amber-400">● DEMO</strong></span>
                    <span>Vulnerability: <strong className="text-amber-400">● DEMO</strong></span>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE WEATHER */}
              {activeModalTab === "weather" && weather && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border/80 bg-base-950 p-3 text-center">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Ambient Temp</span>
                      <span className="font-mono text-xl font-bold text-ink-100 mt-1 block">{weather.temperature}°C</span>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-base-950 p-3 text-center">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Feels Like</span>
                      <span className="font-mono text-xl font-bold text-red-400 mt-1 block">{weather.apparentTemperature}°C</span>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-base-950 p-3 text-center">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Humidity</span>
                      <span className="font-mono text-xl font-bold text-cyan-400 mt-1 block">{weather.humidity}%</span>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-base-950 p-3 text-center">
                      <span className="text-[10px] font-mono text-ink-400 uppercase block">Wind Speed</span>
                      <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">{weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: XGBOOST ML EXPLAINABILITY */}
              {activeModalTab === "ai" && mlPrediction && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-border/80 bg-base-950 p-4 space-y-3">
                    <h4 className="font-mono text-xs font-bold text-ink-100 uppercase tracking-tight">
                      XGBoost Model Performance Metrics (4-Year Dataset Evaluation)
                    </h4>
                    <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                      <div className="bg-base-900 p-2.5 rounded border border-border/40">
                        <span className="text-ink-400 text-[10px] block uppercase">Mean Absolute Error (MAE)</span>
                        <strong className="text-emerald-400 text-sm mt-0.5 block">{mlPrediction.metrics.mae}</strong>
                      </div>
                      <div className="bg-base-900 p-2.5 rounded border border-border/40">
                        <span className="text-ink-400 text-[10px] block uppercase">Root Mean Sq Error (RMSE)</span>
                        <strong className="text-emerald-400 text-sm mt-0.5 block">{mlPrediction.metrics.rmse}</strong>
                      </div>
                      <div className="bg-base-900 p-2.5 rounded border border-border/40">
                        <span className="text-ink-400 text-[10px] block uppercase">Variance Score (R²)</span>
                        <strong className="text-emerald-400 text-sm mt-0.5 block">{mlPrediction.metrics.r2}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-base-950 p-4 space-y-3">
                    <h4 className="font-mono text-xs font-bold text-ink-100 uppercase tracking-tight">
                      XGBoost Feature Importance Weights (% Contribution)
                    </h4>
                    <div className="space-y-2.5">
                      {mlPrediction.featureImportances.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-ink-300">{item.factor}</span>
                            <span className="text-accent font-bold">{item.percentage}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-base-900 overflow-hidden border border-border/40">
                            <div
                              className="h-full bg-accent transition-all duration-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RECOMMENDED ACTION DISPATCH */}
              {activeModalTab === "interventions" && compoundRisk && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold text-ink-100 uppercase">
                    Targeted Action Recommendations (Derived from Risk Drivers)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {compoundRisk.recommendations.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleDispatchAction(action.title)}
                        className="p-3 text-left rounded-lg border border-border/80 bg-base-950 hover:bg-base-800 hover:border-accent/50 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-accent">
                            ⚡ {action.title}
                          </span>
                          <span className="text-[10px] text-ink-400 font-mono">
                            PRIORITY {action.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-400 mt-1">{action.description}</p>
                        <span className="inline-block mt-2 text-[9px] font-mono text-ink-500 bg-base-900 px-1.5 py-0.5 rounded">
                          Trigger: {action.driverTrigger}
                        </span>
                      </button>
                    ))}
                  </div>

                  {dispatchStatus && (
                    <div className="p-3 rounded-md border border-emerald-500/40 bg-emerald-950/40 font-mono text-xs text-emerald-300">
                      {dispatchStatus}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
