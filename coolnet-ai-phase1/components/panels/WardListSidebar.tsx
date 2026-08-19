"use client";

import type { WardSummary } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RISK_ORDER, riskWeight } from "@/lib/utils/risk";

export function WardListSidebar({
  summaries,
  selectedWardId,
  onSelectWard,
}: {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
}) {
  const sorted = [...summaries].sort(
    (a, b) =>
      riskWeight(b.compoundRisk.risk_level) - riskWeight(a.compoundRisk.risk_level) ||
      b.compoundRisk.compound_risk_score - a.compoundRisk.compound_risk_score
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-300">
          Wards by Risk
        </h3>
        <p className="mt-0.5 text-xs text-ink-600">{summaries.length} wards monitored</p>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-2.5">
        {sorted.map((s) => (
          <button
            key={s.meta.ward_id}
            onClick={() => onSelectWard(s.meta.ward_id)}
            className={cn(
              "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
              s.meta.ward_id === selectedWardId
                ? "border-accent/40 bg-accent/10"
                : "border-border bg-base-900 hover:bg-base-800"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-200">{s.meta.name}</span>
              <span className="font-mono text-sm font-semibold text-ink-100">
                {s.compoundRisk.compound_risk_score}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-ink-600">{s.meta.region}</span>
              <RiskBadge level={s.compoundRisk.risk_level} size="sm" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
