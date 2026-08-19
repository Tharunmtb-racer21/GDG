"use client";

import dynamic from "next/dynamic";
import type { WardSummary } from "@/lib/types";
import { RISK_COLORS } from "@/lib/utils/risk";
import { DemoTag } from "@/components/ui/DemoTag";

const LeafletRiskMap = dynamic(
  () => import("@/components/map/LeafletRiskMap").then((m) => m.LeafletRiskMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-base-900 text-sm text-ink-600">
        Loading GIS layer…
      </div>
    ),
  }
);

export function RiskMap({
  summaries,
  selectedWardId,
  onSelectWard,
  focusCenter,
  className,
}: {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  focusCenter?: [number, number] | null;
  className?: string;
}) {
  return (
    <div className={className ?? "relative h-full w-full"}>
      <LeafletRiskMap
        summaries={summaries}
        selectedWardId={selectedWardId}
        onSelectWard={onSelectWard}
        focusCenter={focusCenter}
      />

      <div className="pointer-events-none absolute left-3 top-3 z-[1000] flex flex-col gap-2">
        <div className="pointer-events-auto rounded-md border border-border bg-base-900/90 px-3 py-2 backdrop-blur-sm">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Compound Risk
          </p>
          <div className="flex flex-col gap-1">
            {(["CRITICAL", "HIGH", "MODERATE", "LOW"] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: RISK_COLORS[level] }}
                />
                <span className="text-[11px] text-ink-300">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[1000]">
        <div className="pointer-events-auto">
          <DemoTag label="DEMO WARD GIS" />
        </div>
      </div>
    </div>
  );
}
