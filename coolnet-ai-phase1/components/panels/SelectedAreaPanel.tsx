"use client";

import React, { useEffect, useState } from "react";
import type { RiskForecast, WardSummary } from "@/lib/types";
import { getCurrentWeather, NormalizedWeather } from "@/lib/services/weatherService";
import { calculateHeatStress, HeatStressResult } from "@/lib/utils/heatStress";
import { calculateCompoundRisk, CompoundRiskAssessment } from "@/lib/services/riskService";
import { getFeatureCentroid } from "@/lib/utils/geo";
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
  const [compoundRisk, setCompoundRisk] = useState<CompoundRiskAssessment | null>(null);

  // Effective coordinates & name
  const areaName = selectedArea?.name || ward?.meta.name || "Delhi Metro";
  const stateRegion = selectedArea?.state || selectedArea?.district || ward?.meta.region || "Delhi NCR";
  const lat = selectedArea?.lat ?? (ward ? ward.meta.centroid[0] : 28.6139);
  const lon = selectedArea?.lon ?? (ward ? ward.meta.centroid[1] : 77.2090);

  // Fetch real-time weather from Open-Meteo when selected location changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCurrentWeather(lat, lon)
      .then((data) => {
        if (!isMounted) return;
        setWeather(data);

        // Derive Heat Stress score & breakdown
        const hs = calculateHeatStress(
          data.temperature,
          data.humidity,
          data.apparentTemperature,
          data.windSpeed
        );
        setHeatStress(hs);

        // Derive Compound Risk (Heat + Grid + Vulnerability)
        const gridVal = ward ? ward.snapshot.grid_stress : 65;
        const vulnVal = ward ? ward.snapshot.vulnerability_score : 55;
        const coolVal = ward ? ward.snapshot.cooling_access : 45;
        const cr = calculateCompoundRisk(hs.heatIndex, gridVal, vulnVal, coolVal);
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
          Click any State, District, or Ward on the map to retrieve live real-time climate intelligence.
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
                FETCHING LIVE WEATHER...
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold text-emerald-400">
                ● WEATHER LIVE
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-[10px] text-ink-500">
          {weather?.formattedTime || "Updated 2m ago"}
        </span>
      </div>

      {/* Live Weather Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/80 bg-base-900/90 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            TEMPERATURE
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-ink-100">
            {loading ? "..." : `${weather?.temperature}°C`}
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-base-900/90 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            FEELS LIKE
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-amber-300">
            {loading ? "..." : `${weather?.apparentTemperature}°C`}
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-base-900/90 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            HUMIDITY
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-sky-300">
            {loading ? "..." : `${weather?.humidity}%`}
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-base-900/90 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            WIND SPEED
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-teal-300">
            {loading ? "..." : `${weather?.windSpeed} km/h`}
          </p>
        </div>
      </div>

      {/* Heat Stress Card */}
      <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-3 shadow-md">
        <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              HEAT STRESS SCORE
            </p>
            <p className="font-mono text-2xl font-bold text-orange-200">
              {heatStress?.score} <span className="text-xs font-normal text-orange-400/80">/100</span>
            </p>
          </div>
          {heatStress && (
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-extrabold uppercase ${
                heatStress.category === "EXTREME"
                  ? "bg-red-600 text-white"
                  : heatStress.category === "HIGH"
                  ? "bg-orange-500 text-slate-950"
                  : heatStress.category === "MODERATE"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-emerald-500 text-slate-950"
              }`}
            >
              {heatStress.category}
            </span>
          )}
        </div>

        <p className="mt-2 text-[11px] leading-snug text-orange-200/90">
          {heatStress?.explanation}
        </p>

        {/* Heat Stress Drivers Breakdown Bars */}
        <div className="mt-3 space-y-1.5 border-t border-orange-500/20 pt-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-orange-400">
            HEAT STRESS DRIVERS
          </p>

          <div>
            <div className="flex justify-between text-[10px] text-ink-300">
              <span>Temperature Impact</span>
              <span className="font-mono font-semibold">{heatStress?.drivers.temperatureFactor}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full rounded-full bg-base-950 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${heatStress?.drivers.temperatureFactor || 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-ink-300">
              <span>Humidity Load</span>
              <span className="font-mono font-semibold">{heatStress?.drivers.humidityFactor}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full rounded-full bg-base-950 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${heatStress?.drivers.humidityFactor || 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-ink-300">
              <span>Feels Like Elevation</span>
              <span className="font-mono font-semibold">{heatStress?.drivers.feelsLikeFactor}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full rounded-full bg-base-950 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${heatStress?.drivers.feelsLikeFactor || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 24H Weather Statistics */}
      <div className="rounded-lg border border-border/80 bg-base-900/90 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400 border-b border-border/40 pb-1">
          24H TEMPERATURE STATISTICS
        </p>
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="rounded bg-base-950 p-1.5">
            <span className="text-[9px] text-ink-500 block uppercase">24H MIN</span>
            <span className="text-sm font-bold text-sky-400">{weather?.stats24h.min}°C</span>
          </div>
          <div className="rounded bg-base-950 p-1.5">
            <span className="text-[9px] text-ink-500 block uppercase">24H MEAN</span>
            <span className="text-sm font-bold text-ink-200">{weather?.stats24h.mean}°C</span>
          </div>
          <div className="rounded bg-base-950 p-1.5">
            <span className="text-[9px] text-ink-500 block uppercase">24H MAX</span>
            <span className="text-sm font-bold text-rose-400">{weather?.stats24h.max}°C</span>
          </div>
        </div>
      </div>

      {/* Mini Temperature Forecast Sparkline / Chart */}
      {weather?.hourlyForecast && weather.hourlyForecast.length > 0 && (
        <div className="rounded-lg border border-border/80 bg-base-900/90 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400 border-b border-border/40 pb-1 flex justify-between items-center">
            <span>TEMPERATURE — NEXT 24 HOURS</span>
            <span className="font-mono text-accent">{weather.stats24h.max}° Max</span>
          </p>

          <div className="h-16 w-full flex items-end justify-between gap-1 pt-2">
            {weather.hourlyForecast.map((pt, i) => {
              const range = weather.stats24h.max - weather.stats24h.min || 1;
              const pct = Math.min(100, Math.max(15, ((pt.temp - weather.stats24h.min) / range) * 100));
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-amber-500 to-rose-500 opacity-80 group-hover:opacity-100 transition"
                    style={{ height: `${pct}%` }}
                  />
                  {i % 4 === 0 && (
                    <span className="text-[7px] font-mono text-ink-500 mt-1">{pt.time}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compound Risk Section */}
      <div className="rounded-lg border border-border/80 bg-base-900/90 p-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              COMPOUND RISK SCORE
            </p>
            <p className="font-mono text-2xl font-bold text-ink-100">
              {compoundRisk?.compound_risk_score}
              <span className="text-xs font-normal text-ink-500">/100</span>
            </p>
          </div>
          {compoundRisk && <RiskBadge level={compoundRisk.risk_level} size="md" pulse />}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex justify-between rounded bg-base-950 p-2">
            <span className="text-ink-400">Grid Stress:</span>
            <span className="font-mono font-bold text-amber-400">
              {ward ? ward.snapshot.grid_stress : 65}%
            </span>
          </div>
          <div className="flex justify-between rounded bg-base-950 p-2">
            <span className="text-ink-400">Vulnerability:</span>
            <span className="font-mono font-bold text-purple-400">
              {ward ? ward.snapshot.vulnerability_score : 55}
            </span>
          </div>
        </div>
      </div>

      {/* Data Status Badge */}
      <DataStatusBadge />
    </div>
  );
}
