"use client";

import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { BUSINESS } from "@/lib/demo-data";
import { formatPrice } from "@/lib/format";
import type { Package } from "@/lib/types";

const PERKS: Record<string, string[]> = {
  "pkg-baslangic": ["4 seans klasik masaj", "Karşılama çayı ritüeli", "Esnek randevu saatleri"],
  "pkg-prestij": [
    "8 seans dilediğiniz masaj türü",
    "Öncelikli randevu hakkı",
    "Ücretsiz hamam kullanımı",
    "Kişiye özel yağ seçimi",
  ],
  "pkg-reina": [
    "12 seans sınırsız tür seçimi",
    "Özel terapist tahsisi",
    "VIP süit kullanımı",
    "Kişiye özel bakım programı",
    "Misafir davet hakkı",
  ],
  "pkg-cift": [
    "6 seans çift masajı",
    "İki kişilik özel süit",
    "Mum ışığı ve şampanya",
    "Romantik atmosfer hazırlığı",
  ],
};

export default function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const perSession = Math.round(pkg.price / pkg.total_sessions);
  const perks = PERKS[pkg.id] ?? [`${pkg.total_sessions} seans`, "Esnek randevu", "Uzman terapist"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
        pkg.is_featured
          ? "border border-wine-700 bg-gradient-to-b from-wine-900/45 via-ink-800 to-ink-800 shadow-[0_30px_80px_-40px_rgba(229,9,20,0.9)]"
          : "border border-white/8 bg-ink-800/70 hover:border-wine-700/60"
      }`}
    >
      {pkg.is_featured && (
        <>
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(circle,rgba(229,9,20,0.35),transparent_70%)] blur-2xl" />
          <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white">
            <Crown className="h-3 w-3" />
            En Çok Tercih Edilen
          </span>
        </>
      )}

      <div className="relative">
        <h3 className="font-display text-3xl text-white">{pkg.name_tr}</h3>
        <p className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-white/50">
          {pkg.description_tr}
        </p>

        <div className="mt-7 flex items-baseline gap-2">
          <span className="font-display text-5xl text-gradient-rose">
            {formatPrice(pkg.price)}
          </span>
        </div>
        <p className="mt-2 text-xs text-white/40">
          {pkg.total_sessions} seans · seans başı {formatPrice(perSession)}
        </p>

        <ul className="mt-7 space-y-3 border-t border-white/8 pt-6">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-white/65">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-crimson-500" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={BUSINESS.phoneHref}
        className={`relative mt-8 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
          pkg.is_featured
            ? "bg-gradient-to-r from-wine-700 to-crimson-600 text-white hover:shadow-[0_18px_45px_-14px_rgba(229,9,20,1)]"
            : "border border-white/15 text-white/85 hover:border-crimson-500 hover:text-white"
        }`}
      >
        Paketi Satın Al
      </a>
    </motion.article>
  );
}
