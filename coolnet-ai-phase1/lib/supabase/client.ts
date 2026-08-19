import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Client (Phase 2)
 * -----------------------------------------------------------------------
 * Not used by the Phase 1 dashboard (see lib/data/mockDataService.ts).
 * Provided so the data layer can be swapped in without restructuring.
 *
 * Required env vars (never commit real values):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Server-only operations (writes from trusted backend code, e.g. a
 * FastAPI service or Next.js route handler) should use a service-role
 * key stored as SUPABASE_SERVICE_ROLE_KEY, never exposed to the client.
 */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Expected in Phase 1 — no Supabase project connected yet.
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
