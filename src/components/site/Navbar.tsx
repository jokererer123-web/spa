"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { BUSINESS } from "@/lib/demo-data";

const NAV_LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/galeri", label: "Galeri" },
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/paketler", label: "Paketler" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-panel border-b border-white/5 py-3 shadow-[0_10px_40px_-20px_rgba(139,0,0,0.8)]"
            : "py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Reina Spa ana sayfa">
            <ReinaMark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-[0.2em] text-gradient-rose">
                REINA
              </span>
              <span className="text-[0.58rem] font-light uppercase tracking-[0.42em] text-white/40">
                Spa · Istanbul
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative rounded-full px-4 py-2 text-[0.82rem] font-medium tracking-wide text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-transparent via-crimson-500 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={BUSINESS.phoneHref}
              className="group hidden items-center gap-2.5 rounded-full border border-wine-700/60 bg-gradient-to-r from-wine-800/40 to-transparent px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-crimson-500 hover:from-wine-700/60 hover:shadow-[0_0_30px_-8px_rgba(229,9,20,0.7)] sm:flex"
            >
              <Phone className="h-3.5 w-3.5 text-crimson-500 transition-transform group-hover:rotate-12" />
              {BUSINESS.phone}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/80 transition hover:border-crimson-500 hover:text-white lg:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-950/85 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col border-l border-white/10 bg-ink-900 px-7 pb-10 pt-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg tracking-[0.2em] text-gradient-rose">
                  REINA SPA
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70"
                  aria-label="Menüyü kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ul className="mt-10 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-white/5 py-4 font-display text-2xl text-white/85 transition-colors hover:text-crimson-500"
                    >
                      {link.label}
                      <span className="text-xs text-wine-700">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <a
                href={BUSINESS.phoneHref}
                className="mt-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-6 py-4 text-sm font-semibold text-white"
              >
                <Phone className="h-4 w-4" />
                {BUSINESS.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Minimal rose/lotus monogram drawn as an SVG so it stays crisp. */
function ReinaMark() {
  return (
    <span className="relative grid h-11 w-11 place-items-center">
      <span className="absolute inset-0 rounded-full border border-wine-700/70" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.45),transparent_70%)] blur-[6px]" />
      <svg viewBox="0 0 32 32" className="relative h-6 w-6" aria-hidden>
        <defs>
          <linearGradient id="reina-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8b4b8" />
            <stop offset="55%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#8b0000" />
          </linearGradient>
        </defs>
        <path
          d="M16 3c3.6 3.2 5.4 6.6 5.4 10.2 0 2.4-.9 4.6-2.6 6.4 3-.6 5.4-2.2 7.2-4.8.5 4.6-1.6 8.4-6.2 11.4-1.3.8-2.6 1.4-3.8 1.8-1.2-.4-2.5-1-3.8-1.8C7.6 23.2 5.5 19.4 6 14.8c1.8 2.6 4.2 4.2 7.2 4.8-1.7-1.8-2.6-4-2.6-6.4C10.6 9.6 12.4 6.2 16 3Z"
          fill="url(#reina-mark)"
        />
      </svg>
    </span>
  );
}
