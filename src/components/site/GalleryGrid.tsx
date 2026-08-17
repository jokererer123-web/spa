"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { GALLERY } from "@/lib/demo-data";
import type { GalleryItem } from "@/lib/types";

const ALL = "Tümü";

/** Filterable masonry gallery with an animated lightbox. */
export default function GalleryGrid() {
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(GALLERY.map((g) => g.category)))],
    [],
  );
  const [active, setActive] = useState(ALL);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const items = useMemo(
    () => (active === ALL ? GALLERY : GALLERY.filter((g) => g.category === active)),
    [active],
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              active === category
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {active === category && (
              <motion.span
                layoutId="gallery-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{category}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              layout
              type="button"
              onClick={() => setLightbox(item)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/8 ${
                i % 5 === 0 ? "sm:row-span-2 sm:aspect-[3/4]" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={item.src}
                alt={item.title_tr}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-left">
                <span className="text-[0.62rem] uppercase tracking-[0.22em] text-crimson-500">
                  {item.category}
                </span>
                <h3 className="mt-1.5 font-display text-xl text-white">{item.title_tr}</h3>
              </div>
              {item.type === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-ink-950/50 backdrop-blur-sm">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </span>
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/92 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-crimson-500 hover:text-white"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.figure
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.title_tr}
                width={1376}
                height={768}
                className="h-auto w-full object-contain"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 to-transparent p-6">
                <span className="text-[0.62rem] uppercase tracking-[0.22em] text-crimson-500">
                  {lightbox.category}
                </span>
                <p className="mt-1 font-display text-2xl text-white">{lightbox.title_tr}</p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
