import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import AnimatedBackground from "@/components/AnimatedBackground";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { BUSINESS } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Personel Girişi",
  description: "Reina Spa yönetim ve resepsiyon paneli girişi.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  // Only allow same-origin relative targets, never an external redirect.
  const raw = params.next ?? "";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/reception";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <AnimatedBackground />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <LoginForm next={next} initialError={params.error} />

        {!isSupabaseConfigured && (
          <p className="max-w-md rounded-xl border border-gold-soft/25 bg-gold-soft/5 px-4 py-3 text-center text-xs leading-relaxed text-gold-soft/80">
            Şu anda demo modundasınız: Supabase anahtarları tanımlı olmadığı için
            paneller şifresiz açılır ve veriler yalnızca bu cihazda saklanır.
          </p>
        )}

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-rose-soft"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {BUSINESS.name} ana sayfasına dön
        </Link>
      </div>
    </main>
  );
}
