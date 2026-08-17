"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client, or null when the project is not configured yet.
 * Callers must handle null and fall back to the demo store.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
