/**
 * Supabase is optional at runtime. When the environment variables are absent
 * (local preview, a fresh clone, or a Netlify deploy before the keys are set)
 * the app transparently falls back to the in-memory demo store in
 * `src/lib/demo-store.ts`, so every screen stays fully explorable.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
