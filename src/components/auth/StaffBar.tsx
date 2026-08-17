"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface StaffBarUser {
  full_name: string;
  email: string | null;
  role: "admin" | "receptionist";
}

const ROLE_LABEL: Record<StaffBarUser["role"], string> = {
  admin: "Yönetici",
  receptionist: "Resepsiyon",
};

/**
 * Signed-in badge plus sign-out. Renders nothing in demo mode so the
 * dashboards stay uncluttered when there is no session to show.
 */
export default function StaffBar({ user }: { user: StaffBarUser | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/giris");
    router.refresh();
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/70 px-3.5 py-1.5 text-xs text-white/70"
        title={user.email ?? undefined}
      >
        {isAdmin ? (
          <ShieldCheck className="h-3.5 w-3.5 text-gold-soft" />
        ) : (
          <UserRound className="h-3.5 w-3.5 text-rose-soft" />
        )}
        <span className="max-w-[10rem] truncate">{user.full_name}</span>
        <span className="text-white/30">·</span>
        <span className={isAdmin ? "text-gold-soft" : "text-rose-muted"}>
          {ROLE_LABEL[user.role]}
        </span>
      </span>

      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-white/55 transition hover:border-crimson-500/50 hover:text-crimson-400 disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        {busy ? "Çıkılıyor…" : "Çıkış"}
      </button>
    </div>
  );
}
