"use client";

import { useMemo, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import type { DashboardTab } from "@/lib/dashboardTabs";
import { DASHBOARD_TABS } from "@/lib/dashboardTabs";
import { RiskMap } from "@/components/map/RiskMap";
import { WardDetailPanel } from "@/components/panels/WardDetailPanel";
import { ExplainabilityPanel } from "@/components/panels/ExplainabilityPanel";
import { ForecastPanel } from "@/components/panels/ForecastPanel";
import { WhatIfSimulator } from "@/components/panels/WhatIfSimulator";
import { RecommendationPanel } from "@/components/panels/RecommendationPanel";
import { DataHealthPanel } from "@/components/panels/DataHealthPanel";
import { WardListSidebar } from "@/components/panels/WardListSidebar";
import { InterventionsView } from "@/components/panels/InterventionsView";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { useWardSummaries } from "@/lib/hooks/useWardSummaries";
import { useWardInsights } from "@/lib/hooks/useWardInsights";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { summaries, loading } = useWardSummaries();
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  const selectedWard = useMemo(
    () => summaries.find((s) => s.meta.ward_id === selectedWardId) ?? null,
    [summaries, selectedWardId]
  );
  const { explanation, forecast } = useWardInsights(selectedWard);

  // Auto-select the highest-risk ward once data loads, for a populated first view.
  useMemo(() => {
    if (!selectedWardId && summaries.length > 0) {
      const worst = [...summaries].sort(
        (a, b) => b.compoundRisk.compound_risk_score - a.compoundRisk.compound_risk_score
      )[0];
      setSelectedWardId(worst.meta.ward_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaries]);

  const cityStats = useMemo(() => {
    const critical = summaries.filter((s) => s.compoundRisk.risk_level === "CRITICAL").length;
    const high = summaries.filter((s) => s.compoundRisk.risk_level === "HIGH").length;
    const avg =
      summaries.length > 0
        ? Math.round(
            summaries.reduce((sum, s) => sum + s.compoundRisk.compound_risk_score, 0) /
              summaries.length
          )
        : 0;
    const avgCooling =
      summaries.length > 0
        ? Math.round(summaries.reduce((sum, s) => sum + s.snapshot.cooling_access, 0) / summaries.length)
        : 0;
    return { critical, high, avg, avgCooling };
  }, [summaries]);

  const focusCenter = selectedWard ? selectedWard.meta.centroid : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base-950">
      <TopNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Mobile tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-base-900 px-2 py-2 md:hidden">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium",
              activeTab === tab.id
                ? "bg-accent/10 text-accent"
                : "text-ink-500 hover:bg-base-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-ink-500">Loading demo data…</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {activeTab === "overview" && (
            <div className="flex h-full flex-col overflow-y-auto lg:overflow-hidden">
              <div className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 lg:grid-cols-4 lg:px-6">
                <StatCard
                  label="Critical Wards"
                  value={cityStats.critical}
                  tone={cityStats.critical > 0 ? "critical" : "default"}
                  hint="Compound risk ≥ 85"
                />
                <StatCard
                  label="High Risk Wards"
                  value={cityStats.high}
                  tone={cityStats.high > 0 ? "high" : "default"}
                  hint="Compound risk 65–84"
                />
                <StatCard label="City Avg Risk" value={cityStats.avg} unit="/100" hint="Across all wards" />
                <StatCard
                  label="Avg Cooling Access"
                  value={cityStats.avgCooling}
                  unit="%"
                  tone="accent"
                  hint="Reliable cooling access"
                />
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[240px_1fr_360px] lg:p-4">
                <Card className="hidden overflow-hidden lg:block">
                  <WardListSidebar
                    summaries={summaries}
                    selectedWardId={selectedWardId}
                    onSelectWard={setSelectedWardId}
                  />
                </Card>

                <Card className="min-h-[400px] overflow-hidden">
                  <RiskMap
                    summaries={summaries}
                    selectedWardId={selectedWardId}
                    onSelectWard={setSelectedWardId}
                    focusCenter={focusCenter}
                  />
                </Card>

                <div className="flex flex-col gap-3 overflow-y-auto lg:max-h-full">
                  <Card>
                    <WardDetailPanel ward={selectedWard} forecast={forecast} />
                  </Card>
                  <Card>
                    <ExplainabilityPanel explanation={explanation} />
                  </Card>
                  <Card>
                    <RecommendationPanel ward={selectedWard} />
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="grid h-full grid-cols-1 gap-3 p-3 lg:grid-cols-[260px_1fr_320px] lg:p-4">
              <Card className="hidden overflow-hidden lg:block">
                <WardListSidebar
                  summaries={summaries}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                />
              </Card>
              <Card className="min-h-[400px] overflow-hidden">
                <RiskMap
                  summaries={summaries}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                  focusCenter={focusCenter}
                />
              </Card>
              <Card className="overflow-y-auto">
                <WardDetailPanel ward={selectedWard} forecast={forecast} />
              </Card>
            </div>
          )}

          {activeTab === "forecast" && (
            <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[260px_1fr] lg:overflow-hidden lg:p-4">
              <Card className="overflow-hidden">
                <WardListSidebar
                  summaries={summaries}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                />
              </Card>
              <div className="flex flex-col gap-3 overflow-y-auto">
                <Card>
                  <ForecastPanel forecast={forecast} />
                </Card>
                <Card>
                  <ExplainabilityPanel explanation={explanation} />
                </Card>
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[260px_460px_1fr] lg:overflow-hidden lg:p-4">
              <Card className="overflow-hidden">
                <WardListSidebar
                  summaries={summaries}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                />
              </Card>
              <Card className="overflow-y-auto">
                <WhatIfSimulator ward={selectedWard} />
              </Card>
              <Card className="hidden overflow-hidden lg:block">
                <RiskMap
                  summaries={summaries}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                  focusCenter={focusCenter}
                />
              </Card>
            </div>
          )}

          {activeTab === "interventions" && (
            <div className="h-full overflow-y-auto">
              <InterventionsView summaries={summaries} />
            </div>
          )}

          {activeTab === "data-health" && (
            <div className="mx-auto h-full max-w-2xl overflow-y-auto px-4 py-6 lg:px-8">
              <Card>
                <DataHealthPanel />
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
