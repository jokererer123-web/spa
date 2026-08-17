"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { CRITICAL_SESSION_THRESHOLD } from "@/lib/booking-rules";
import type { CustomerPackageSummary } from "@/lib/types";
import { BalanceBadge, EmptyState } from "./ui";

/**
 * "Kritik Paket Seviyesi" — the red-flag list of guests whose remaining
 * balance has dropped to the threshold or below.
 */
export default function CriticalPackages({
  items,
  compact = false,
}: {
  items: CustomerPackageSummary[];
  compact?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-crimson-500/40 bg-gradient-to-b from-wine-900/25 to-ink-800/70">
      <header className="flex items-center justify-between gap-3 border-b border-crimson-500/25 px-5 py-4">
        <h2 className="flex items-center gap-2.5 font-display text-xl text-white">
          <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-crimson-500/15 text-crimson-500">
            <AlertTriangle className="h-4 w-4" />
          </span>
          Kritik Paket Seviyesi
        </h2>
        <span className="rounded-full bg-crimson-500 px-2.5 py-1 text-[0.66rem] font-bold text-white">
          {items.length}
        </span>
      </header>

      <p className="border-b border-white/5 px-5 py-2.5 text-[0.7rem] text-white/35">
        Kalan seansı {CRITICAL_SESSION_THRESHOLD} ve altına düşen misafirler —
        yenileme için arayın.
      </p>

      {items.length === 0 ? (
        <EmptyState>Kritik seviyede paket bulunmuyor.</EmptyState>
      ) : (
        <ul>
          {items.map((item, i) => (
            <motion.li
              key={item.customer_package_id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3.5 last:border-0"
            >
              <div className="min-w-[9rem] flex-1">
                <p className="text-sm font-semibold text-white">
                  {item.customer.full_name}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  {item.package_name}
                  {!compact && item.customer.phone ? ` · ${item.customer.phone}` : ""}
                </p>
              </div>
              <BalanceBadge remaining={item.remaining_sessions} />
              {item.customer.phone && (
                <a
                  href={`tel:${item.customer.phone.replace(/\s/g, "")}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-crimson-500 hover:text-crimson-500"
                  aria-label={`${item.customer.full_name} müşterisini ara`}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
