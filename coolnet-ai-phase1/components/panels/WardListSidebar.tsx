"use client";

import React, { useState } from "react";
import type { WardSummary } from "@/lib/types";
import { SelectedAreaMeta } from "./SelectedAreaPanel";
import { INDIAN_DISTRICTS, IndianDistrictMeta } from "@/lib/data/indianDistricts";
import { cn } from "@/lib/utils/cn";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { riskWeight } from "@/lib/utils/risk";

export function WardListSidebar({
  summaries,
  selectedWardId,
  onSelectWard,
}: {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string, areaMeta?: SelectedAreaMeta) => void;
}) {
  const [viewMode, setViewMode] = useState<"districts" | "wards">("districts");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredDistricts = INDIAN_DISTRICTS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedWards = [...summaries].filter((s) =>
    s.meta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.meta.region.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort(
    (a, b) =>
      riskWeight(b.compoundRisk.risk_level) - riskWeight(a.compoundRisk.risk_level) ||
      b.compoundRisk.compound_risk_score - a.compoundRisk.compound_risk_score
  );

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Sidebar Header & Tab Switcher */}
      <div className="border-b border-border/80 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-200">
            MONITORED REGIONS
          </h3>
          <span className="font-mono text-[10px] font-semibold text-accent">
            {viewMode === "districts" ? `${filteredDistricts.length} DISTRICTS` : `${sortedWards.length} WARDS`}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search district or state (e.g. Coimbatore, Chennai, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-base-950 px-3 py-1.5 text-xs text-ink-100 placeholder-ink-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-md bg-base-950 p-1">
          <button
            onClick={() => setViewMode("districts")}
            className={cn(
              "rounded py-1 text-[10px] font-bold uppercase tracking-wider transition",
              viewMode === "districts"
                ? "bg-accent/20 text-accent"
                : "text-ink-500 hover:text-ink-300"
            )}
          >
            🇮🇳 Districts
          </button>
          <button
            onClick={() => setViewMode("wards")}
            className={cn(
              "rounded py-1 text-[10px] font-bold uppercase tracking-wider transition",
              viewMode === "wards"
                ? "bg-accent/20 text-accent"
                : "text-ink-500 hover:text-ink-300"
            )}
          >
            🏙 City Wards
          </button>
        </div>
      </div>

      {/* List Item View */}
      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {viewMode === "districts" ? (
          filteredDistricts.map((d) => {
            const isSelected = d.id === selectedWardId;
            return (
              <button
                key={d.id}
                onClick={() =>
                  onSelectWard(d.id, {
                    id: d.id,
                    name: d.name,
                    level: "district",
                    state: d.state,
                    district: d.name,
                    lat: d.lat,
                    lon: d.lon,
                  })
                }
                className={cn(
                  "w-full rounded-md border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-accent/60 bg-accent/10"
                    : "border-border/80 bg-base-900 hover:bg-base-850"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-100 uppercase">{d.name}</span>
                  <span className="font-mono text-xs font-bold text-ink-200">{d.riskScore}/100</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-ink-500">{d.state}</span>
                  <RiskBadge level={d.riskLevel} size="sm" />
                </div>
              </button>
            );
          })
        ) : (
          sortedWards.map((s) => {
            const isSelected = s.meta.ward_id === selectedWardId;
            return (
              <button
                key={s.meta.ward_id}
                onClick={() =>
                  onSelectWard(s.meta.ward_id, {
                    id: s.meta.ward_id,
                    name: s.meta.name,
                    level: "ward",
                    state: "Delhi",
                    district: s.meta.region,
                    lat: s.meta.centroid[0],
                    lon: s.meta.centroid[1],
                  })
                }
                className={cn(
                  "w-full rounded-md border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-accent/60 bg-accent/10"
                    : "border-border/80 bg-base-900 hover:bg-base-850"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-100">{s.meta.name}</span>
                  <span className="font-mono text-xs font-bold text-ink-200">
                    {s.compoundRisk.compound_risk_score}/100
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-ink-500">{s.meta.region}</span>
                  <RiskBadge level={s.compoundRisk.risk_level} size="sm" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
