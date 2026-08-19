"use client";

import { useEffect, useState } from "react";
import type { WardSummary } from "@/lib/types";
import { getWardSummaries } from "@/lib/data/mockDataService";

/**
 * Loads ward summaries (meta + snapshot + compound risk) for the whole
 * city. Backed by the mock data service in Phase 1; swap the import for
 * a Supabase/REST hook in Phase 2 — the return shape stays the same.
 */
export function useWardSummaries() {
  const [summaries, setSummaries] = useState<WardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWardSummaries().then((data) => {
      if (!cancelled) {
        setSummaries(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { summaries, loading };
}
