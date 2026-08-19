"use client";

import { useEffect, useState } from "react";
import type { DataFeedHealth } from "@/lib/types";
import { getDataFeedHealth } from "@/lib/data/mockDataService";
import { CardHeader } from "@/components/ui/Card";
import { DemoTag } from "@/components/ui/DemoTag";

function StatusDot({ status }: { status: DataFeedHealth["status"] }) {
  const color =
    status === "ONLINE"
      ? "bg-risk-low"
      : status === "DEGRADED"
      ? "bg-risk-moderate"
      : status === "OFFLINE"
      ? "bg-risk-critical"
      : "bg-accent";
  return <span className={`h-2 w-2 rounded-full ${color}`} />;
}

export function DataHealthPanel({ compact = false }: { compact?: boolean }) {
  const [feeds, setFeeds] = useState<DataFeedHealth[]>([]);

  useEffect(() => {
    getDataFeedHealth().then(setFeeds);
  }, []);

  return (
    <div>
      {!compact && (
        <CardHeader
          title="Data Health"
          subtitle="Upstream feed status"
          right={<DemoTag />}
        />
      )}
      <div className={compact ? "space-y-2" : "space-y-2 px-4 py-4"}>
        {feeds.map((feed) => (
          <div
            key={feed.feed}
            className="flex items-start justify-between gap-3 rounded-md border border-border bg-base-900 px-3 py-2.5"
          >
            <div className="flex items-start gap-2.5">
              <StatusDot status={feed.status} />
              <div>
                <p className="text-sm font-medium text-ink-200">{feed.feed}</p>
                <p className="mt-0.5 text-[11px] text-ink-600">{feed.detail}</p>
              </div>
            </div>
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              {feed.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
