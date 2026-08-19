"use client";

import { useEffect, useMemo, useState } from "react";
import type { Intervention, RiskLevel, WardSummary } from "@/lib/types";
import { getInterventions } from "@/lib/data/mockDataService";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { RISK_ORDER, riskWeight } from "@/lib/utils/risk";

const CATEGORY_LABEL: Record<Intervention["category"], string> = {
  cooling: "Cooling",
  communication: "Communication",
  "grid-ops": "Grid Operations",
  "restoration-planning": "Restoration Planning",
};

function WardInterventionCard({ ward }: { ward: WardSummary }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    getInterventions(ward.meta.ward_id, ward.compoundRisk.risk_level).then(setInterventions);
  }, [ward]);

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink-100">{ward.meta.name}</p>
          <p className="text-[11px] text-ink-600">
            {ward.meta.region} · Risk {ward.compoundRisk.compound_risk_score}/100
          </p>
        </div>
        <RiskBadge level={ward.compoundRisk.risk_level} size="sm" />
      </div>
      <ol className="space-y-2 px-4 py-3">
        {interventions.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
              {item.priority}
            </span>
            <div>
              <span className="text-ink-300">{item.action}</span>
              <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-600">
                {CATEGORY_LABEL[item.category]}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function InterventionsView({ summaries }: { summaries: WardSummary[] }) {
  const [filter, setFilter] = useState<RiskLevel | "ALL">("ALL");

  const filtered = useMemo(() => {
    const list =
      filter === "ALL" ? summaries : summaries.filter((s) => s.compoundRisk.risk_level === filter);
    return [...list].sort(
      (a, b) => riskWeight(b.compoundRisk.risk_level) - riskWeight(a.compoundRisk.risk_level)
    );
  }, [summaries, filter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-100">Recommended Interventions</h2>
          <p className="text-sm text-ink-500">
            Prioritized preventive actions by ward. Decision support only.
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["ALL", ...RISK_ORDER] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                filter === level
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-ink-500 hover:bg-base-800"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((ward) => (
          <WardInterventionCard key={ward.meta.ward_id} ward={ward} />
        ))}
      </div>
    </div>
  );
}
