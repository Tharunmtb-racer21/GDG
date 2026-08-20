"use client";

import dynamic from "next/dynamic";
import type { WardSummary } from "@/lib/types";

const MapCNRiskMap = dynamic(
  () => import("@/components/map/MapCNRiskMap").then((m) => m.MapCNRiskMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-base-950 text-sm text-ink-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
          Initializing MapCN Engine…
        </div>
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
  onSelectWard: (wardId: string, areaMeta?: any) => void;
  focusCenter?: [number, number] | null;
  className?: string;
}) {
  return (
    <div className={className ?? "relative h-full w-full"}>
      <MapCNRiskMap
        summaries={summaries}
        selectedWardId={selectedWardId}
        onSelectWard={onSelectWard}
        focusCenter={focusCenter}
      />
    </div>
  );
}
