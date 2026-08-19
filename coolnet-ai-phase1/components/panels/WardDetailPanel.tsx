"use client";

import type { RiskForecast, WardSummary } from "@/lib/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DemoTag } from "@/components/ui/DemoTag";
import { CardHeader } from "@/components/ui/Card";

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-base-900 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-600">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-ink-100">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-ink-500">{unit}</span>}
      </p>
    </div>
  );
}

export function WardDetailPanel({
  ward,
  forecast,
}: {
  ward: WardSummary | null;
  forecast: RiskForecast | null;
}) {
  if (!ward) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-ink-400">No ward selected</p>
        <p className="text-xs text-ink-600">
          Click a ward on the map to view its compound risk profile.
        </p>
      </div>
    );
  }

  const { meta, snapshot, compoundRisk } = ward;
  const min30 = forecast?.points.find((p) => p.label === "30 MIN")?.risk_score;
  const min60 = forecast?.points.find((p) => p.label === "60 MIN")?.risk_score;

  return (
    <div>
      <CardHeader
        title={meta.name}
        subtitle={`${meta.region} · Pop. ${meta.population.toLocaleString()}`}
        right={<DemoTag />}
      />
      <div className="space-y-5 px-4 py-4">
        <div className="flex items-center justify-between rounded-md border border-border bg-base-900 px-4 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-600">
              Compound Risk Score
            </p>
            <p className="font-mono text-3xl font-bold leading-none text-ink-100">
              {compoundRisk.compound_risk_score}
              <span className="text-base font-normal text-ink-500">/100</span>
            </p>
          </div>
          <RiskBadge level={compoundRisk.risk_level} size="lg" pulse />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Metric label="Heat Index" value={snapshot.heat_index} unit="°C" />
          <Metric label="Grid Stress" value={compoundRisk.grid_risk_score} unit="%" />
          <Metric label="Vulnerability" value={compoundRisk.vulnerability_score} unit="%" />
          <Metric label="Cooling Access" value={snapshot.cooling_access} unit="%" />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-600">
            Predicted Near-Term Risk
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric label="30 Min" value={min30 ?? "—"} />
            <Metric label="60 Min" value={min60 ?? "—"} />
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-ink-600">
          Values above are demo data for Phase 1 UI development. They do not
          reflect live sensor readings, a trained model, or a guarantee of
          any outage.
        </p>
      </div>
    </div>
  );
}
