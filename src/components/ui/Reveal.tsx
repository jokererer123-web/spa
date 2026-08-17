"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Render as a list container that staggers its children. */
  stagger?: number;
}

/** Scroll-triggered entrance used across the public pages. */
export default function Reveal({ children, delay = 0, className, stagger }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={
        stagger
          ? {
              hidden: {},
              visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
            }
          : variants
      }
      transition={stagger ? undefined : { delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
