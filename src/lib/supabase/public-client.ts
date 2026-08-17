import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let cached: ReturnType<typeof createClient> | null = null;

/**
 * Anonymous, cookie-free Supabase client for the public marketing pages.
 *
 * Deliberately NOT the cookie-bound server client: reading cookies would opt
 * every public page out of static rendering. The marketing tables are
 * world-readable under RLS, so no session is needed and the pages can stay
 * prerendered and revalidated on a timer.
 */
export function getSupabasePublicClient() {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
