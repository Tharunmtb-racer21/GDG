"use client";

import { useEffect, useState } from "react";
import type { Intervention, WardSummary } from "@/lib/types";
import { getInterventions } from "@/lib/data/mockDataService";
import { CardHeader } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";

const CATEGORY_LABEL: Record<Intervention["category"], string> = {
  cooling: "Cooling",
  communication: "Communication",
  "grid-ops": "Grid Operations",
  "restoration-planning": "Restoration Planning",
};

export function RecommendationPanel({ ward }: { ward: WardSummary | null }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    if (!ward) {
      setInterventions([]);
      return;
    }
    getInterventions(ward.meta.ward_id, ward.compoundRisk.risk_level).then(setInterventions);
  }, [ward]);

  if (!ward) {
    return (
      <div className="px-4 py-6 text-center text-xs text-ink-600">
        Select a ward to view recommended actions.
      </div>
    );
  }

  return (
    <div>
      <CardHeader
        title="Recommended Actions"
        subtitle="Decision support — not automated control"
        right={<RiskBadge level={ward.compoundRisk.risk_level} size="sm" />}
      />
      <div className="px-4 py-4">
        <ol className="space-y-2.5">
          {interventions.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-md border border-border bg-base-900 px-3 py-2.5"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                {item.priority}
              </span>
              <div>
                <p className="text-sm text-ink-200">{item.action}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-600">
                  {CATEGORY_LABEL[item.category]}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-600">
          Recommended actions to reduce impact — CoolNet AI is a
          decision-support system and does not control the grid or
          guarantee outage prevention.
        </p>
      </div>
    </div>
  );
}
