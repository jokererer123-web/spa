"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { balanceLevel, BALANCE_LABEL_TR } from "@/lib/booking-rules";
import type { BookingStatus } from "@/lib/types";

/* ------------------------------------------------------------------ card */

export function Panel({
  children,
  className = "",
  title,
  action,
  icon: Icon,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/8 bg-ink-800/70 backdrop-blur-sm ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4">
          <h2 className="flex items-center gap-2.5 font-display text-xl text-white">
            {Icon && <Icon className="h-4 w-4 text-crimson-500" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ stat */

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "danger" | "gold";
  hint?: string;
}) {
  const tones = {
    default: "border-white/8 text-white",
    danger: "border-crimson-500/50 text-crimson-400",
    gold: "border-gold-soft/30 text-gold-soft",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border bg-ink-800/70 p-5 ${tones[tone]}`}
    >
      {tone === "danger" && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.45),transparent_70%)] blur-xl" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-white/40">{label}</p>
          <p className="mt-2 font-display text-4xl leading-none">{value}</p>
          {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
        </div>
        <Icon className="h-5 w-5 opacity-60" />
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- badges */

const STATUS_STYLE: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: {
    label: "Onaylandı",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  cancelled: {
    label: "İptal Edildi",
    className: "border-white/15 bg-white/5 text-white/45 line-through",
  },
  completed: {
    label: "Tamamlandı",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  },
  no_show: {
    label: "Gelmedi",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.66rem] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

/** Red-flag badge for customers at or below the critical package threshold. */
export function BalanceBadge({ remaining }: { remaining: number }) {
  const level = balanceLevel(remaining);
  const styles = {
    depleted: "border-crimson-500 bg-crimson-500 text-white",
    critical: "border-crimson-500/70 bg-crimson-500/15 text-crimson-400",
    low: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    healthy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  } as const;

  const critical = level === "critical" || level === "depleted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold ${styles[level]}`}
    >
      {critical && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {remaining} seans · {BALANCE_LABEL_TR[level]}
    </span>
  );
}

/* ---------------------------------------------------------------- inputs */

export const fieldClass =
  "w-full rounded-xl border border-white/10 bg-ink-900/80 px-3.5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/40";

export const labelClass =
  "mb-1.5 block text-[0.66rem] font-medium uppercase tracking-[0.18em] text-white/45";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-wine-700 to-crimson-600 text-white hover:shadow-[0_14px_35px_-14px_rgba(229,9,20,1)]",
    ghost: "border border-white/12 text-white/75 hover:border-white/25 hover:text-white",
    danger:
      "border border-crimson-500/50 text-crimson-400 hover:bg-crimson-500/10 hover:text-crimson-400",
  } as const;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-14 text-center text-sm text-white/35">{children}</div>
  );
}
