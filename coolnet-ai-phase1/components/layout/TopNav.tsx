"use client";

import { cn } from "@/lib/utils/cn";
import type { DashboardTab } from "@/lib/dashboardTabs";
import { DASHBOARD_TABS } from "@/lib/dashboardTabs";

export function TopNav({
  activeTab,
  onChangeTab,
}: {
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-base-900 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-accent/10 border border-accent/30">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide text-ink-100">
              COOLNET AI
            </span>
            <span className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-600 sm:inline">
              PHASE 1 · DEMO
            </span>
          </div>
          <p className="text-[11px] text-ink-500">
            Compound Heat–Grid Risk Intelligence
          </p>
        </div>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              activeTab === tab.id
                ? "bg-accent/10 text-accent"
                : "text-ink-500 hover:bg-base-800 hover:text-ink-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded border border-border px-2 py-1 text-[11px] text-ink-500 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Demo session active
        </span>
      </div>
    </header>
  );
}
