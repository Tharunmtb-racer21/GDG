"use client";

import type { RiskExplanation } from "@/lib/types";
import { CardHeader } from "@/components/ui/Card";
import { DemoTag } from "@/components/ui/DemoTag";

const FACTOR_COLORS: Record<string, string> = {
  "Heat Stress": "#f97316",
  "Grid Stress": "#ef4444",
  "Vulnerability": "#a855f7",
  "Cooling Access": "#38bdf8",
};

export function ExplainabilityPanel({
  explanation,
}: {
  explanation: RiskExplanation | null;
}) {
  if (!explanation) {
    return (
      <div className="px-4 py-6 text-center text-xs text-ink-600">
        Select a ward to see why it is at risk.
      </div>
    );
  }

  const maxAbs = Math.max(...explanation.contributions.map((c) => Math.abs(c.contribution)), 1);

  return (
    <div>
      <CardHeader
        title="Why is this ward at risk?"
        subtitle="Feature contribution breakdown"
        right={<DemoTag />}
      />
      <div className="space-y-3 px-4 py-4">
        {explanation.contributions.map((c) => {
          const widthPct = Math.min(100, (Math.abs(c.contribution) / maxAbs) * 100);
          const color = FACTOR_COLORS[c.factor] ?? "#2dd4bf";
          return (
            <div key={c.factor}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink-300">{c.factor}</span>
                <span className="font-mono font-semibold text-ink-100">
                  {c.contribution > 0 ? "+" : ""}
                  {c.contribution}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-base-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}

        <p className="mt-4 rounded-md border border-border bg-base-900 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
          {explanation.note}
        </p>
      </div>
    </div>
  );
}
