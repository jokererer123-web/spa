"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/demo-data";

/** Persistent call-to-action; appears once the visitor scrolls past the hero. */
export default function FloatingCall() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={BUSINESS.phoneHref}
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="fixed bottom-6 right-5 z-40 flex items-center gap-3 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 py-4 pl-4 pr-5 text-sm font-semibold text-white shadow-[0_18px_50px_-12px_rgba(229,9,20,0.85)] sm:bottom-8 sm:right-8"
          aria-label={`Telefon: ${BUSINESS.phone}`}
        >
          <span className="relative grid h-6 w-6 place-items-center">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-pulse-ring" />
            <Phone className="relative h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Randevu Al</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
