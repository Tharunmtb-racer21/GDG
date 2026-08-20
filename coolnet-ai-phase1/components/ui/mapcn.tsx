"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { RISK_COLORS } from "@/lib/utils/risk";

export type MapActiveLayer = "compound" | "heat" | "grid" | "vulnerability" | "temperature";

export interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onToggleFullscreen?: () => void;
  className?: string;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  className,
}: MapControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border/80 bg-base-900/90 shadow-xl backdrop-blur-md overflow-hidden",
        className
      )}
    >
      <button
        onClick={onZoomIn}
        title="Zoom In"
        className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-ink-300 transition hover:bg-base-800 hover:text-ink-100 border-b border-border/50"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-ink-300 transition hover:bg-base-800 hover:text-ink-100 border-b border-border/50"
      >
        −
      </button>
      <button
        onClick={onResetView}
        title="Reset National India View"
        className="flex h-8 w-8 items-center justify-center text-xs font-medium text-ink-300 transition hover:bg-base-800 hover:text-accent border-b border-border/50"
      >
        🇮🇳
      </button>
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="flex h-8 w-8 items-center justify-center text-xs text-ink-300 transition hover:bg-base-800 hover:text-ink-100"
        >
          ⤢
        </button>
      )}
    </div>
  );
}

export function MapLegend({
  activeLayer,
  className,
}: {
  activeLayer: MapActiveLayer;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-base-900/90 p-3 shadow-xl backdrop-blur-md text-xs min-w-[170px]",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between border-b border-border/40 pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
          {activeLayer === "compound" && "🚨 COMPOUND CLIMATE RISK"}
          {activeLayer === "heat" && "🔥 HEAT STRESS INDEX"}
          {activeLayer === "grid" && "⚡ ELECTRICAL GRID STRESS"}
          {activeLayer === "vulnerability" && "👥 SOCIAL VULNERABILITY"}
          {activeLayer === "temperature" && "🌡 AMBIENT TEMPERATURE"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {activeLayer === "compound" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS.CRITICAL }} />
                <span className="font-medium text-ink-200">CRITICAL</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">80 – 100</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS.HIGH }} />
                <span className="font-medium text-ink-200">HIGH</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">60 – 79</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS.MODERATE }} />
                <span className="font-medium text-ink-200">MODERATE</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">30 – 59</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS.LOW }} />
                <span className="font-medium text-ink-200">LOW</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">0 – 29</span>
            </div>
          </>
        )}

        {activeLayer === "heat" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-600" />
                <span className="font-medium text-ink-200">EXTREME</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">&gt; 48°C</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                <span className="font-medium text-ink-200">HIGH</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">42 – 48°C</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500" />
                <span className="font-medium text-ink-200">MODERATE</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">35 – 41°C</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="font-medium text-ink-200">LOW</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">&lt; 35°C</span>
            </div>
          </>
        )}

        {activeLayer === "grid" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-purple-600" />
                <span className="font-medium text-ink-200">CRITICAL</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">80 – 100%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                <span className="font-medium text-ink-200">HIGH</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">65 – 79%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <span className="font-medium text-ink-200">MODERATE</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">40 – 64%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
                <span className="font-medium text-ink-200">LOW</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">0 – 39%</span>
            </div>
          </>
        )}

        {activeLayer === "vulnerability" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
                <span className="font-medium text-ink-200">SEVERE</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">80 – 100</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                <span className="font-medium text-ink-200">HIGH</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">60 – 79</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                <span className="font-medium text-ink-200">MODERATE</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">40 – 59</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
                <span className="font-medium text-ink-200">LOW</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">0 – 39</span>
            </div>
          </>
        )}

        {activeLayer === "temperature" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-600" />
                <span className="font-medium text-ink-200">&gt; 42°C</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">Extreme</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                <span className="font-medium text-ink-200">38 – 42°C</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">Hot</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500" />
                <span className="font-medium text-ink-200">32 – 37°C</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">Warm</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="font-medium text-ink-200">&lt; 32°C</span>
              </div>
              <span className="font-mono text-[10px] text-ink-500">Mild</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MapLayerSwitcher({
  activeLayer,
  onChangeLayer,
  className,
}: {
  activeLayer: MapActiveLayer;
  onChangeLayer: (layer: MapActiveLayer) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const layersList: { id: MapActiveLayer; label: string; icon: string }[] = [
    { id: "compound", label: "COMPOUND RISK", icon: "🚨" },
    { id: "heat", label: "HEAT INDEX", icon: "🔥" },
    { id: "grid", label: "GRID STRESS", icon: "⚡" },
    { id: "vulnerability", label: "VULNERABILITY", icon: "👥" },
    { id: "temperature", label: "TEMPERATURE", icon: "🌡" },
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border/80 bg-base-900/90 px-3 py-2 text-xs font-semibold text-ink-200 shadow-xl backdrop-blur-md transition hover:bg-base-800 hover:text-ink-100"
      >
        <span className="text-sm">MAP LAYERS</span>
        <span className="text-[10px] text-ink-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/80 bg-base-900/95 p-2 shadow-2xl backdrop-blur-lg z-50 flex flex-col gap-1 text-xs">
          <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-500">
            Active Intelligence Layer
          </p>
          {layersList.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                onChangeLayer(l.id);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-left font-medium transition",
                activeLayer === l.id
                  ? "bg-accent/20 text-accent font-semibold border border-accent/40"
                  : "text-ink-300 hover:bg-base-800 hover:text-ink-100"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </div>
              {activeLayer === l.id && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MapBreadcrumb({
  breadcrumbPath,
  onResetToLevel,
  className,
}: {
  breadcrumbPath: string[];
  onResetToLevel: (levelIndex: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border/80 bg-base-900/90 px-3 py-1.5 text-xs font-semibold text-ink-200 shadow-xl backdrop-blur-md",
        className
      )}
    >
      <span className="text-accent">🇮🇳</span>
      {breadcrumbPath.map((item, idx) => (
        <React.Fragment key={item + idx}>
          {idx > 0 && <span className="text-ink-600 font-normal">/</span>}
          <button
            onClick={() => onResetToLevel(idx)}
            className={cn(
              "uppercase tracking-wide transition hover:text-accent",
              idx === breadcrumbPath.length - 1
                ? "text-ink-100 font-bold"
                : "text-ink-400 font-medium"
            )}
          >
            {item}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export function TimeControlBar({
  selectedTime,
  onSelectTime,
  className,
}: {
  selectedTime: string;
  onSelectTime: (t: string) => void;
  className?: string;
}) {
  const options = ["NOW", "+6H", "+12H", "+24H", "+48H"];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-border/80 bg-base-900/90 p-1 shadow-xl backdrop-blur-md text-[11px]",
        className
      )}
    >
      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
        TIME:
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelectTime(opt)}
          className={cn(
            "rounded px-2 py-0.5 font-mono font-medium transition",
            selectedTime === opt
              ? "bg-accent/20 text-accent font-semibold border border-accent/30"
              : "text-ink-400 hover:bg-base-800 hover:text-ink-200"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function DataStatusBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-base-900/90 p-2.5 shadow-xl backdrop-blur-md text-[10px] font-medium text-ink-300",
        className
      )}
    >
      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ink-500 border-b border-border/40 pb-1">
        DATA STATUS
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-ink-400">Weather:</span>
          <span className="font-semibold text-emerald-400">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-ink-400">Grid:</span>
          <span className="font-semibold text-amber-400">DEMO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          <span className="text-ink-400">Boundaries:</span>
          <span className="font-semibold text-sky-400">REAL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          <span className="text-ink-400">Model:</span>
          <span className="font-semibold text-purple-400">PROTOTYPE</span>
        </div>
      </div>
    </div>
  );
}
