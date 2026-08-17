"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Loader2, LogIn, Mail, ShieldAlert } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "@/components/dashboard/ui";

const ERROR_TR: Record<string, string> = {
  "Invalid login credentials": "E-posta veya şifre hatalı.",
  "Email not confirmed": "E-posta adresi henüz doğrulanmamış.",
  "Too many requests": "Çok fazla deneme yapıldı. Lütfen biraz bekleyin.",
};

export default function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "yetkisiz"
      ? "Bu hesabın panel yetkisi yok. Lütfen yönetici ile görüşün."
      : null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase bağlantısı tanımlı değil. Uygulama demo modunda çalışıyor, panellere doğrudan girebilirsiniz.",
      );
      return;
    }

    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(ERROR_TR[signInError.message] ?? "Giriş yapılamadı. Lütfen tekrar deneyin.");
      setBusy(false);
      return;
    }

    // Full navigation so the middleware re-reads the fresh auth cookie and
    // routes a receptionist away from /admin.
    router.replace(next);
    router.refresh();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="glass-panel w-full max-w-md space-y-5 rounded-3xl border border-white/10 p-7 sm:p-9"
    >
      <div className="space-y-1.5 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-rose-muted">Reina Spa</p>
        <h1 className="font-display text-3xl text-gradient-rose">Personel Girişi</h1>
        <p className="text-sm text-white/50">
          Yönetim ve resepsiyon ekranlarına erişmek için giriş yapın.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="email">
          E-posta
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@reinaspa.com"
            className={`${fieldClass} pl-10`}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="password">
          Şifre
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${fieldClass} pl-10`}
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-crimson-500/40 bg-crimson-600/10 px-3.5 py-3 text-sm text-crimson-400"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wine-700 to-crimson-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Giriş yapılıyor…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Giriş Yap
          </>
        )}
      </button>

      <p className="text-center text-xs leading-relaxed text-white/35">
        Hesabınız yoksa yöneticinizden talep edin. Şifrenizi kimseyle paylaşmayın.
      </p>
    </motion.form>
  );
}
