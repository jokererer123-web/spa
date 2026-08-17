"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

export default function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-ink-800/70 p-7 transition-colors hover:border-wine-700/70"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.5),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      {service.is_featured && (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-gold-soft/30 bg-gold-soft/10 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-gold-soft">
          <Sparkles className="h-3 w-3" />
          Öne Çıkan
        </span>
      )}

      <div className="relative">
        <h3 className="font-display text-2xl text-white transition-colors group-hover:text-rose-soft">
          {service.title_tr}
        </h3>
        <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-white/50">
          {service.description_tr}
        </p>

        <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Clock className="h-3.5 w-3.5 text-wine-700" />
            {service.duration_min} dakika
          </span>
          <span className="font-display text-2xl text-gradient-wine">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
