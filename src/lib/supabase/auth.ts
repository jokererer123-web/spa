import { getSupabaseServerClient } from "./server";

export type StaffRole = "admin" | "receptionist";

export interface StaffSession {
  id: string;
  email: string | null;
  full_name: string;
  role: StaffRole;
}

/**
 * Reads the signed-in staff member for a Server Component.
 *
 * Returns null in demo mode (no Supabase credentials) — the middleware already
 * blocks unauthenticated access when credentials *are* present, so a null here
 * means "no auth configured", not "not allowed".
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as StaffRole | undefined;
  if (role !== "admin" && role !== "receptionist") return null;

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: (profile?.full_name as string | undefined) ?? user.email ?? "Personel",
    role,
  };
}

export const ROLE_LABEL_TR: Record<StaffRole, string> = {
  admin: "Yönetici",
  receptionist: "Resepsiyon",
};
