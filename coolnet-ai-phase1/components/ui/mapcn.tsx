"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { RISK_COLORS } from "@/lib/utils/risk";

export type MapActiveLayer = "compound" | "heat" | "grid" | "vulnerability" | "temperature" | "thermodynamic";

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
        "rounded-lg border border-border/80 bg-base-900/90 p-3 shadow-xl backdrop-blur-md text-xs min-w-[190px]",
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
          {activeLayer === "thermodynamic" && "♨️ THERMODYNAMIC LST FLOW"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {activeLayer === "thermodynamic" && (
          <>
            <div className="text-[9px] font-bold uppercase text-ink-500 mb-1">
              WRI INDIA LAND SURFACE TEMP (°C)
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#7f1d1d]" />
                <span className="font-medium text-ink-200">&gt; 33°C</span>
              </div>
              <span className="font-mono text-[9px] text-red-400 font-bold">Severe Heat Core</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#dc2626]" />
                <span className="font-medium text-ink-200">30 – 33°C</span>
              </div>
              <span className="font-mono text-[9px] text-orange-400">Extreme LST</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#ea580c]" />
                <span className="font-medium text-ink-200">24 – 29°C</span>
              </div>
              <span className="font-mono text-[9px] text-amber-400">High LST</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#facc15]" />
                <span className="font-medium text-ink-200">18 – 23°C</span>
              </div>
              <span className="font-mono text-[9px] text-yellow-300">Moderate LST</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#38bdf8]" />
                <span className="font-medium text-ink-200">5 – 17°C</span>
              </div>
              <span className="font-mono text-[9px] text-sky-400">Cool Zone</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#1e3a8a]" />
                <span className="font-medium text-ink-200">&lt; 5°C</span>
              </div>
              <span className="font-mono text-[9px] text-indigo-400">Alpine Cold Sink</span>
            </div>
          </>
        )}

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
    { id: "thermodynamic", label: "THERMODYNAMIC LST FLOW", icon: "♨️" },
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
        className="flex items-center gap-2 rounded-lg border border-orange-500/50 bg-base-900/90 px-3 py-2 text-xs font-bold text-orange-400 shadow-xl backdrop-blur-md transition hover:bg-orange-950/40 hover:text-orange-200"
      >
        <span className="text-sm">♨️ THERMODYNAMIC FLOW</span>
        <span className="text-[10px] text-orange-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/80 bg-base-900/95 p-2 shadow-2xl backdrop-blur-lg z-50 flex flex-col gap-1 text-xs">
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
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-semibold transition",
                activeLayer === l.id
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "text-ink-300 hover:bg-base-800 hover:text-ink-100"
              )}
            >
              <span className="text-sm">{l.icon}</span>
              <span>{l.label}</span>
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
  onResetToLevel: (index: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border/80 bg-base-900/90 px-3 py-1.5 shadow-xl backdrop-blur-md text-xs font-mono font-semibold text-ink-300",
        className
      )}
    >
      <span className="text-[10px] text-ink-500 uppercase font-sans">IN</span>
      {breadcrumbPath.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-ink-600">/</span>}
          <button
            onClick={() => onResetToLevel(idx)}
            className="hover:text-accent transition uppercase tracking-tight"
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
  onSelectTime: (time: string) => void;
  className?: string;
}) {
  const times = ["NOW", "+6H", "+12H", "+24H", "+48H"];
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-border/80 bg-base-900/90 p-1 shadow-xl backdrop-blur-md text-xs font-mono",
        className
      )}
    >
      <span className="px-2 text-[10px] font-bold text-ink-500 uppercase font-sans">TIME:</span>
      {times.map((t) => (
        <button
          key={t}
          onClick={() => onSelectTime(t)}
          className={cn(
            "rounded px-2 py-0.5 font-bold transition text-[10px]",
            selectedTime === t
              ? "bg-accent text-base-950 shadow-sm"
              : "text-ink-400 hover:bg-base-800 hover:text-ink-200"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function DataStatusBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-base-900/90 p-2.5 shadow-xl backdrop-blur-md text-[10px] font-mono space-y-1",
        className
      )}
    >
      <div className="font-bold text-ink-500 uppercase tracking-wider mb-1">DATA STATUS</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-ink-300">
        <div>
          <span className="text-emerald-400 font-bold">● Weather:</span> LIVE
        </div>
        <div>
          <span className="text-amber-400 font-bold">● Grid:</span> DEMO
        </div>
        <div>
          <span className="text-sky-400 font-bold">● Boundaries:</span> REAL
        </div>
        <div>
          <span className="text-purple-400 font-bold">● Model:</span> PROTOTYPE
        </div>
      </div>
    </div>
  );
}
