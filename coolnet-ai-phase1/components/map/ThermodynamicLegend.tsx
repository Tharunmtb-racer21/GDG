"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface ThermodynamicLegendProps {
  showSurfaceMesh: boolean;
  showStreamlines: boolean;
  onToggleMesh: (val: boolean) => void;
  onToggleStreamlines: (val: boolean) => void;
  className?: string;
}

export function ThermodynamicLegend({
  showSurfaceMesh,
  showStreamlines,
  onToggleMesh,
  onToggleStreamlines,
  className,
}: ThermodynamicLegendProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div
      className={cn(
        "rounded-xl border border-orange-500/40 bg-base-950/95 p-3.5 shadow-2xl backdrop-blur-lg text-xs w-72 text-ink-100 font-sans border-l-4 border-l-orange-500",
        className
      )}
    >
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 block">
            WRI INDIA GEO-ANALYTICS
          </span>
          <h4 className="font-mono text-xs font-bold text-ink-100 uppercase tracking-tight">
            LAND SURFACE TEMPERATURE (LST)
          </h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-ink-400 hover:text-ink-100 transition font-mono text-xs px-1"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Continuous Multi-Stop Gradient Scale Bar */}
          <div>
            <div className="flex justify-between text-[9px] font-bold text-ink-400 uppercase mb-1">
              <span>Alpine Cold (&lt;5°C)</span>
              <span>Severe Core (&gt;33°C)</span>
            </div>

            <div
              className="h-3.5 w-full rounded-md shadow-inner border border-white/10"
              style={{
                background:
                  "linear-gradient(to right, #1e3a8a, #3b82f6, #93c5fd, #fef08a, #fde047, #f97316, #ea580c, #dc2626, #7f1d1d)",
              }}
            />

            {/* Isotherm Ticks */}
            <div className="flex justify-between text-[8px] font-mono text-ink-500 mt-1 font-semibold">
              <span>&lt;5°C</span>
              <span>12°C</span>
              <span>20°C</span>
              <span>26°C</span>
              <span>30°C</span>
              <span>&gt;33°C</span>
            </div>
          </div>

          {/* Layer Toggle Checkboxes */}
          <div className="space-y-1.5 border-t border-border/40 pt-2 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer text-ink-300 hover:text-ink-100 transition">
              <input
                type="checkbox"
                checked={showSurfaceMesh}
                onChange={(e) => onToggleMesh(e.target.checked)}
                className="rounded border-border bg-base-900 text-orange-500 focus:ring-orange-500/40"
              />
              <span className="font-medium">Heat Surface Mesh (IDW WebGL)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-ink-300 hover:text-ink-100 transition">
              <input
                type="checkbox"
                checked={showStreamlines}
                onChange={(e) => onToggleStreamlines(e.target.checked)}
                className="rounded border-border bg-base-900 text-orange-500 focus:ring-orange-500/40"
              />
              <span className="font-medium">Thermodynamic Streamlines (2,000 Particles)</span>
            </label>
          </div>

          {/* Audit Data Attribution */}
          <div className="border-t border-border/40 pt-2 text-[9px] leading-tight text-ink-500 italic">
            Prepared by CoolNet AI; Data: WRI India / ECMWF Copernicus ERA5 ReAnalysis / IMD.
          </div>
        </div>
      )}
    </div>
  );
}
