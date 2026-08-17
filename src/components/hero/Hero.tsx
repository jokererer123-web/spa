"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import ScrollSequence from "./ScrollSequence";
import { BUSINESS } from "@/lib/demo-data";

/**
 * Scroll-driven hero.
 *
 * The section is 320vh tall; its inner panel is sticky, so scrolling that
 * distance scrubs the massage sequence while the copy cross-fades in three
 * beats. Progress is smoothed with a spring for inertia-free scrubbing on
 * trackpads and momentum scrolling on iOS.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Light spring keeps the frame index from jittering with wheel deltas
  // without introducing visible lag.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 42,
    mass: 0.32,
    restDelta: 0.0008,
  });

  // Three copy beats keyed to sequence progress.
  const beat1 = useTransform(smooth, [0, 0.16, 0.24], [1, 1, 0]);
  const beat1Y = useTransform(smooth, [0, 0.24], [0, -50]);
  const beat2 = useTransform(smooth, [0.28, 0.4, 0.58, 0.66], [0, 1, 1, 0]);
  const beat2Y = useTransform(smooth, [0.28, 0.66], [40, -40]);
  const beat3 = useTransform(smooth, [0.7, 0.82, 1], [0, 1, 1]);
  const beat3Y = useTransform(smooth, [0.7, 1], [40, 0]);

  // Cinematic treatment: the image darkens and pulls in slightly as we scrub.
  const imageScale = useTransform(smooth, [0, 1], [1.08, 1]);
  const veil = useTransform(smooth, [0, 0.5, 1], [0.55, 0.42, 0.62]);
  const scrollHint = useTransform(smooth, [0, 0.08], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div style={{ scale: imageScale }} className="absolute inset-0">
          <ScrollSequence progress={smooth} className="absolute inset-0 h-full w-full" />
        </motion.div>

        {/* Cinematic veils: bottom fade, side vignette, crimson wash */}
        <motion.div
          style={{ opacity: veil }}
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.85)_0%,rgba(6,6,6,0.15)_35%,rgba(6,6,6,0.55)_75%,#0b0b0b_100%)]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_25%_50%,transparent_35%,rgba(6,6,6,0.75)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(74,0,6,0.45)_0%,transparent_45%)] mix-blend-multiply" />

        {/* Copy */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 lg:px-8">
          <div className="relative w-full max-w-2xl">
            <motion.div style={{ opacity: beat1, y: beat1Y }} className="absolute inset-x-0">
              <Eyebrow>Ataşehir · İstanbul</Eyebrow>
              <h1 className="mt-6 font-display text-[3.4rem] font-light leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[5.6rem]">
                Bedeninize
                <span className="block text-gradient-rose">huzur armağan edin</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-white/60">
                {BUSINESS.tagline}. Uzman terapistlerimizin dokunuşuyla günün
                yorgunluğunu geride bırakın.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href={BUSINESS.phoneHref}
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-14px_rgba(229,9,20,0.9)] transition-all hover:shadow-[0_22px_60px_-12px_rgba(229,9,20,1)]"
                >
                  <Phone className="h-4 w-4" />
                  Hemen Randevu Alın
                </a>
                <Link
                  href="/hizmetler"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-medium text-white/85 backdrop-blur-sm transition-all hover:border-rose-soft/60 hover:text-white"
                >
                  Hizmetlerimiz
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            <motion.div style={{ opacity: beat2, y: beat2Y }} className="absolute inset-x-0">
              <Eyebrow>Ritüel</Eyebrow>
              <h2 className="mt-6 font-display text-[2.9rem] font-light leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.6rem]">
                Her dokunuş
                <span className="block text-gradient-rose">bir ritüeldir</span>
              </h2>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-white/60">
                Sıcak yağlar, ritmik hareketler ve mum ışığı. Medikal masajdan
                Bali ritüellerine kadar her seans size özel tasarlanır.
              </p>
            </motion.div>

            <motion.div style={{ opacity: beat3, y: beat3Y }} className="absolute inset-x-0">
              <Eyebrow>Reina Spa</Eyebrow>
              <h2 className="mt-6 font-display text-[2.9rem] font-light leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.6rem]">
                Şehrin ortasında
                <span className="block text-gradient-rose">bir dinginlik adası</span>
              </h2>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/paketler"
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-14px_rgba(229,9,20,0.9)]"
                >
                  Üyelik Paketleri
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-medium text-white/85 transition-all hover:border-rose-soft/60 hover:text-white"
                >
                  Bize Ulaşın
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: scrollHint }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.42em] text-white/45">
            Kaydırın
          </span>
          <span className="relative h-12 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-crimson-500 to-transparent"
              animate={{ y: [-16, 48] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>

        {/* Progress rail */}
        <div className="absolute bottom-0 left-0 z-10 h-[2px] w-full bg-white/5">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-wine-700 via-crimson-500 to-rose-soft"
            style={{ scaleX: smooth }}
          />
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-crimson-500" />
      {children}
    </span>
  );
}
