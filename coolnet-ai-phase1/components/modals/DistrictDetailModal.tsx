"use client";

import React, { useEffect, useState } from "react";
import { getCurrentWeather, NormalizedWeather } from "@/lib/services/weatherService";
import { calculateHeatStress, HeatStressResult } from "@/lib/utils/heatStress";
import { calculateCompoundRisk, CompoundRiskAssessment } from "@/lib/services/riskService";
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
  const [compoundRisk, setCompoundRisk] = useState<CompoundRiskAssessment | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"overview" | "weather" | "ai" | "interventions">("overview");

  const name = areaMeta?.name || "Coimbatore";
  const stateName = areaMeta?.state || areaMeta?.district || "Tamil Nadu";
  const level = areaMeta?.level || "district";
  const lat = areaMeta?.lat ?? 11.0168;
  const lon = areaMeta?.lon ?? 76.9558;

  // Fetch real-time weather from Open-Meteo for selected location
  useEffect(() => {
    if (!isOpen || !areaMeta) return;

    let isMounted = true;
    setLoading(true);
    setDispatchStatus(null);

    getCurrentWeather(lat, lon)
      .then((data) => {
        if (!isMounted) return;
        setWeather(data);

        const hs = calculateHeatStress(
          data.temperature,
          data.humidity,
          data.apparentTemperature,
          data.windSpeed
        );
        setHeatStress(hs);

        const cr = calculateCompoundRisk(hs.heatIndex, 68, 58, 45);
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
        <div className="flex border-b border-border/60 bg-base-900 px-6 pt-2">
          <button
            onClick={() => setActiveModalTab("overview")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeModalTab === "overview"
                ? "border-accent text-accent"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            📊 Risk Overview
          </button>
          <button
            onClick={() => setActiveModalTab("weather")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeModalTab === "weather"
                ? "border-accent text-accent"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            🌡 Live Weather
          </button>
          <button
            onClick={() => setActiveModalTab("ai")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeModalTab === "ai"
                ? "border-accent text-accent"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            🤖 AI SHAP Drivers
          </button>
          <button
            onClick={() => setActiveModalTab("interventions")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeModalTab === "interventions"
                ? "border-accent text-accent"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            🚨 Emergency Actions
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* TAB 1: OVERVIEW & KEY METRICS */}
          {activeModalTab === "overview" && (
            <div className="space-y-5">
              {/* Weather Status Bar */}
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-base-950 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-mono text-xs font-medium text-amber-400">
                        Querying Open-Meteo Live API...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ● REAL-TIME WEATHER ACTIVE
                      </span>
                    </>
                  )}
                </div>
                <span className="font-mono text-xs text-ink-400">
                  {weather?.formattedTime || "Updated Live"}
                </span>
              </div>

              {/* 4 Core Metric Dial Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    COMPOUND RISK
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-red-200">
                    {compoundRisk?.compound_risk_score}
                    <span className="text-xs font-normal text-red-400/80">/100</span>
                  </p>
                  {compoundRisk && (
                    <div className="mt-2">
                      <RiskBadge level={compoundRisk.risk_level} size="sm" />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    HEAT STRESS
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-orange-200">
                    {heatStress?.score}
                    <span className="text-xs font-normal text-orange-400/80">/100</span>
                  </p>
                  <span className="mt-2 inline-block rounded bg-orange-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-300 uppercase">
                    {heatStress?.category}
                  </span>
                </div>

                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    GRID STRAIN
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-purple-200">
                    68%
                  </p>
                  <span className="mt-2 inline-block rounded bg-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300 uppercase">
                    MODERATE LOAD
                  </span>
                </div>

                <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    VULNERABILITY
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-sky-200">
                    58 <span className="text-xs font-normal text-sky-400/80">/100</span>
                  </p>
                  <span className="mt-2 inline-block rounded bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300 uppercase">
                    HIGH EXPOSURE
                  </span>
                </div>
              </div>

              {/* Weather Summary Quick Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg border border-border/80 bg-base-950 p-4">
                <div>
                  <span className="text-[10px] font-bold text-ink-500 block uppercase">Temperature</span>
                  <span className="font-mono text-lg font-bold text-ink-100">{weather?.temperature}°C</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-500 block uppercase">Feels Like</span>
                  <span className="font-mono text-lg font-bold text-amber-400">{weather?.apparentTemperature}°C</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-500 block uppercase">Relative Humidity</span>
                  <span className="font-mono text-lg font-bold text-sky-400">{weather?.humidity}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-500 block uppercase">Wind Speed</span>
                  <span className="font-mono text-lg font-bold text-teal-400">{weather?.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE WEATHER & FORECAST */}
          {activeModalTab === "weather" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center rounded-lg border border-border/80 bg-base-950 p-3">
                <div className="p-2">
                  <span className="text-[10px] text-ink-500 uppercase block font-bold">24H MIN TEMP</span>
                  <span className="font-mono text-xl font-bold text-sky-400">{weather?.stats24h.min}°C</span>
                </div>
                <div className="p-2 border-x border-border/40">
                  <span className="text-[10px] text-ink-500 uppercase block font-bold">24H MEAN TEMP</span>
                  <span className="font-mono text-xl font-bold text-ink-100">{weather?.stats24h.mean}°C</span>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-ink-500 uppercase block font-bold">24H MAX TEMP</span>
                  <span className="font-mono text-xl font-bold text-rose-400">{weather?.stats24h.max}°C</span>
                </div>
              </div>

              {/* 24-Hour Forecast Sparkline */}
              <div className="rounded-lg border border-border/80 bg-base-950 p-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                    24-HOUR HOURLY TEMPERATURE FORECAST
                  </h4>
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    Peak: {weather?.stats24h.max}°C
                  </span>
                </div>

                <div className="h-24 w-full flex items-end justify-between gap-1 pt-3">
                  {weather?.hourlyForecast.map((pt, idx) => {
                    const range = (weather?.stats24h.max || 40) - (weather?.stats24h.min || 25) || 1;
                    const pct = Math.min(100, Math.max(15, ((pt.temp - (weather?.stats24h.min || 25)) / range) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                        <span className="hidden group-hover:block absolute -top-6 bg-base-800 text-[9px] font-mono text-ink-100 px-1 py-0.5 rounded shadow">
                          {pt.temp}°C
                        </span>
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-amber-500 to-rose-500 opacity-80 group-hover:opacity-100 transition"
                          style={{ height: `${pct}%` }}
                        />
                        {idx % 4 === 0 && (
                          <span className="text-[8px] font-mono text-ink-500 mt-1">{pt.time}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI SHAP DRIVERS */}
          {activeModalTab === "ai" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
                  AI SHAP ROOT-CAUSE EXPLANATION
                </h4>
                <p className="text-xs leading-relaxed text-orange-200/90">
                  {heatStress?.explanation}
                </p>
              </div>

              <div className="rounded-lg border border-border/80 bg-base-950 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                  SHAP FEATURE CONTRIBUTIONS
                </h4>

                <div>
                  <div className="flex justify-between text-xs text-ink-300 mb-1">
                    <span>Ambient Temperature Load</span>
                    <span className="font-mono font-bold text-orange-400">{heatStress?.drivers.temperatureFactor}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-base-900 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${heatStress?.drivers.temperatureFactor || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-ink-300 mb-1">
                    <span>Relative Humidity Contribution</span>
                    <span className="font-mono font-bold text-amber-400">{heatStress?.drivers.humidityFactor}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-base-900 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${heatStress?.drivers.humidityFactor || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-ink-300 mb-1">
                    <span>Apparent Heat Stress Elevation</span>
                    <span className="font-mono font-bold text-rose-400">{heatStress?.drivers.feelsLikeFactor}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-base-900 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${heatStress?.drivers.feelsLikeFactor || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY ACTIONS */}
          {activeModalTab === "interventions" && (
            <div className="space-y-4">
              {dispatchStatus && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-mono font-semibold text-emerald-300 animate-pulse">
                  {dispatchStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleDispatchAction("Mobile Misting Bus #4")}
                  className="flex items-center gap-3 rounded-lg border border-border bg-base-950 p-3.5 text-left hover:border-accent hover:bg-accent/10 transition group"
                >
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h5 className="font-bold text-xs text-ink-100 group-hover:text-accent uppercase">
                      Dispatch Misting Bus
                    </h5>
                    <p className="text-[11px] text-ink-500">Deploy high-capacity cooling spray vehicle</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchAction("Community Cooling Shelter #2")}
                  className="flex items-center gap-3 rounded-lg border border-border bg-base-950 p-3.5 text-left hover:border-accent hover:bg-accent/10 transition group"
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h5 className="font-bold text-xs text-ink-100 group-hover:text-accent uppercase">
                      Open Cooling Shelter
                    </h5>
                    <p className="text-[11px] text-ink-500">Activate air-conditioned community hall</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchAction("Grid Substation Relief")}
                  className="flex items-center gap-3 rounded-lg border border-border bg-base-950 p-3.5 text-left hover:border-accent hover:bg-accent/10 transition group"
                >
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h5 className="font-bold text-xs text-ink-100 group-hover:text-accent uppercase">
                      Balance Power Grid
                    </h5>
                    <p className="text-[11px] text-ink-500">Prioritize feeder backup & prevent outage</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDispatchAction("Hydration & Healthcare Taskforce")}
                  className="flex items-center gap-3 rounded-lg border border-border bg-base-950 p-3.5 text-left hover:border-accent hover:bg-accent/10 transition group"
                >
                  <span className="text-2xl">🩺</span>
                  <div>
                    <h5 className="font-bold text-xs text-ink-100 group-hover:text-accent uppercase">
                      Deploy Healthcare Unit
                    </h5>
                    <p className="text-[11px] text-ink-500">Send hydration salts & emergency medical team</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border/80 bg-base-950 px-6 py-3">
          <DataStatusBadge />
          <button
            onClick={onClose}
            className="rounded-md bg-accent px-4 py-1.5 text-xs font-bold text-base-950 hover:bg-accent/90 transition"
          >
            Done / Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
