"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { RISK_COLORS } from "@/lib/utils/risk";

export type MapActiveLayer = "compound" | "temperature" | "grid" | "vulnerability";

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
        title="Reset Center"
        className="flex h-8 w-8 items-center justify-center text-xs font-medium text-ink-300 transition hover:bg-base-800 hover:text-accent border-b border-border/50"
      >
        ⌖
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

export function MapLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-base-900/90 p-3 shadow-xl backdrop-blur-md text-xs",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
          Compound Climate Risk
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
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

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md border border-border/80 bg-base-900/90 px-2.5 py-1.5 text-[11px] font-medium text-ink-300 shadow-md backdrop-blur-sm transition hover:bg-base-800 hover:text-ink-100"
      >
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        <span>Layers</span>
        <span className="text-[9px] text-ink-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg border border-border/80 bg-base-900/95 p-2 shadow-2xl backdrop-blur-md z-50 flex flex-col gap-1 text-xs">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-500">
            Map Overlay Layer
          </p>
          <button
            onClick={() => {
              onChangeLayer("compound");
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between rounded px-2 py-1.5 text-left transition",
              activeLayer === "compound"
                ? "bg-accent/15 font-semibold text-accent"
                : "text-ink-300 hover:bg-base-800"
            )}
          >
            <span>☑ Compound Risk</span>
            <span className="text-[10px] opacity-70">Active</span>
          </button>
          <button
            onClick={() => {
              onChangeLayer("temperature");
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between rounded px-2 py-1.5 text-left transition",
              activeLayer === "temperature"
                ? "bg-accent/15 font-semibold text-accent"
                : "text-ink-400 hover:bg-base-800"
            )}
          >
            <span>☐ Temperature</span>
            <span className="text-[9px] font-mono text-ink-500">Demo</span>
          </button>
          <button
            onClick={() => {
              onChangeLayer("grid");
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between rounded px-2 py-1.5 text-left transition",
              activeLayer === "grid"
                ? "bg-accent/15 font-semibold text-accent"
                : "text-ink-400 hover:bg-base-800"
            )}
          >
            <span>☐ Grid Stress</span>
            <span className="text-[9px] font-mono text-ink-500">Demo</span>
          </button>
          <button
            onClick={() => {
              onChangeLayer("vulnerability");
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between rounded px-2 py-1.5 text-left transition",
              activeLayer === "vulnerability"
                ? "bg-accent/15 font-semibold text-accent"
                : "text-ink-400 hover:bg-base-800"
            )}
          >
            <span>☐ Vulnerability</span>
            <span className="text-[9px] font-mono text-ink-500">Demo</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function HonestDataBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 backdrop-blur-md text-[10px] font-medium text-amber-300 shadow-md",
        className
      )}
    >
      <span className="font-semibold text-amber-400">Prototype Risk Prediction</span>
      <span className="mx-1 text-amber-500/60">•</span>
      <span className="text-amber-200/80">Demo GeoJSON Data</span>
    </div>
  );
}
