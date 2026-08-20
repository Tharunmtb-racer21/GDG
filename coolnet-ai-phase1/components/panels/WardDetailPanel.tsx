"use client";

import type { RiskForecast, WardSummary } from "@/lib/types";
import { SelectedAreaPanel, SelectedAreaMeta } from "./SelectedAreaPanel";

export { SelectedAreaPanel };
export type { SelectedAreaMeta };

export function WardDetailPanel({
  ward,
  forecast,
  selectedArea,
}: {
  ward: WardSummary | null;
  forecast: RiskForecast | null;
  selectedArea?: SelectedAreaMeta | null;
}) {
  return (
    <SelectedAreaPanel
      selectedArea={selectedArea || null}
      ward={ward}
      forecast={forecast}
    />
  );
}
