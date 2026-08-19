"use client";

import { useState } from "react";
import type { ScenarioResult, WardSummary } from "@/lib/types";
import { mlService } from "@/lib/services/mlService";
import { Slider } from "@/components/ui/Slider";
import { CardHeader } from "@/components/ui/Card";
import { DemoTag } from "@/components/ui/DemoTag";
import { RiskBadge } from "@/components/ui/RiskBadge";

export function WhatIfSimulator({ ward }: { ward: WardSummary | null }) {
  const [temperatureDelta, setTemperatureDelta] = useState(2);
  const [demandDelta, setDemandDelta] = useState(15);
  const [coolingDelta, setCoolingDelta] = useState(-10);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [running, setRunning] = useState(false);

  async function handleSimulate() {
    if (!ward) return;
    setRunning(true);
    const res = await mlService.runScenarioSimulation(ward.snapshot, {
      ward_id: ward.meta.ward_id,
      temperature_delta: temperatureDelta,
      demand_delta_pct: demandDelta,
      cooling_access_delta_pct: coolingDelta,
    });
    setResult(res);
    setRunning(false);
  }

  return (
    <div>
      <CardHeader
        title="What-If Scenario Simulator"
        subtitle={ward ? `Ward: ${ward.meta.name}` : "Select a ward to simulate"}
        right={<DemoTag />}
      />
      <div className="space-y-6 px-4 py-4">
        <div className="space-y-5">
          <Slider
            label="Temperature Change"
            value={temperatureDelta}
            min={-5}
            max={8}
            unit="°C"
            onChange={setTemperatureDelta}
          />
          <Slider
            label="Electricity Demand Change"
            value={demandDelta}
            min={-30}
            max={40}
            unit="%"
            onChange={setDemandDelta}
          />
          <Slider
            label="Cooling Access Change"
            value={coolingDelta}
            min={-40}
            max={30}
            unit="%"
            onChange={setCoolingDelta}
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={!ward || running}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-base-950 transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-base-700 disabled:text-ink-600"
        >
          {running ? "SIMULATING…" : "SIMULATE"}
        </button>

        {result && (
          <div className="space-y-3 rounded-md border border-border bg-base-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-600">Baseline</p>
                <p className="font-mono text-xl font-semibold text-ink-300">
                  {result.baseline_risk_score}
                </p>
              </div>
              <span className="text-ink-600">→</span>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-ink-600">Simulated</p>
                <p className="font-mono text-xl font-semibold text-ink-100">
                  {result.simulated_risk_score}
                </p>
              </div>
              <RiskBadge level={result.risk_level} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-ink-500">Change from baseline</span>
              <span
                className={`font-mono font-semibold ${
                  result.delta > 0 ? "text-risk-high" : result.delta < 0 ? "text-risk-low" : "text-ink-400"
                }`}
              >
                {result.delta > 0 ? "+" : ""}
                {result.delta}
              </span>
            </div>
          </div>
        )}

        <p className="rounded-md border border-border bg-base-900 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
          Scenario simulation — ML integration pending. This calculation is a
          transparent demo formula for Phase 1 UI development, not the
          output of a trained model.
        </p>
      </div>
    </div>
  );
}
