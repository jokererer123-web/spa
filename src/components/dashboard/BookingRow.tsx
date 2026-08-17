"use client";

import { motion } from "framer-motion";
import { Clock, Scissors, StickyNote, User, X } from "lucide-react";
import { FREE_CANCELLATION_MINUTES, minutesUntil } from "@/lib/booking-rules";
import { formatRelative, formatTime } from "@/lib/format";
import type { BookingWithRelations } from "@/lib/types";
import { useMounted } from "@/lib/use-now";
import { Button, StatusBadge } from "./ui";

interface BookingRowProps {
  booking: BookingWithRelations;
  onCancel?: (id: string) => void;
  compact?: boolean;
}

/**
 * One appointment on the desk board. Surfaces, at a glance, whether cancelling
 * right now would still refund the guest's session.
 */
export default function BookingRow({ booking, onCancel, compact }: BookingRowProps) {
  // Relative time is client-only: these screens are statically prerendered,
  // so computing it during SSR would bake in a stale value and mismatch.
  const mounted = useMounted();

  const active = booking.status === "confirmed";
  const minutes = minutesUntil(booking.scheduled_at);
  const refundable = minutes >= FREE_CANCELLATION_MINUTES;
  const imminent = mounted && active && minutes >= 0 && minutes < FREE_CANCELLATION_MINUTES;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`relative flex flex-wrap items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors last:border-0 ${
        booking.status === "cancelled" ? "opacity-45" : "hover:bg-white/[0.025]"
      }`}
    >
      {imminent && (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-crimson-500 to-wine-700" />
      )}

      {/* Time */}
      <div className="w-16 shrink-0">
        <p className="font-display text-2xl leading-none text-white">
          {formatTime(booking.scheduled_at)}
        </p>
        <p className="mt-1 text-[0.66rem] text-white/35">
          {mounted ? formatRelative(booking.scheduled_at) : ""}
        </p>
      </div>

      {/* Guest + service */}
      <div className="min-w-[10rem] flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <User className="h-3.5 w-3.5 text-wine-700" />
          {booking.customer?.full_name ?? "Misafir"}
          {booking.package_deducted_at && (
            <span className="rounded-full border border-rose-soft/25 bg-rose-soft/5 px-2 py-0.5 text-[0.6rem] font-medium text-rose-soft">
              Paket
            </span>
          )}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <Scissors className="h-3 w-3" />
            {booking.service?.title_tr ?? "Hizmet seçilmedi"}
          </span>
          {booking.therapist && (
            <span className="text-rose-muted">{booking.therapist.name}</span>
          )}
          {booking.customer?.phone && !compact && (
            <span className="text-white/30">{booking.customer.phone}</span>
          )}
        </p>
        {booking.notes && !compact && (
          <p className="mt-1.5 inline-flex items-start gap-1.5 text-[0.7rem] italic text-white/35">
            <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
            {booking.notes}
          </p>
        )}
      </div>

      {/* Status + action */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <StatusBadge status={booking.status} />
          {active && mounted && (
            <p
              className={`mt-1.5 text-[0.62rem] ${
                refundable ? "text-white/35" : "text-crimson-400"
              }`}
            >
              {refundable ? "İptalde seans iade edilir" : "İptalde seans iade edilmez"}
            </p>
          )}
          {booking.status === "cancelled" && booking.refunded && (
            <p className="mt-1.5 text-[0.62rem] text-emerald-400/70">Seans iade edildi</p>
          )}
        </div>

        {active && onCancel && (
          <Button
            variant="danger"
            onClick={() => onCancel(booking.id)}
            className="!px-3 !py-2"
            aria-label="Randevuyu iptal et"
            title="Randevuyu iptal et"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.li>
  );
}

/** Countdown chip used above the desk board for the next appointment. */
export function NextUpBanner({ booking }: { booking: BookingWithRelations }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-wine-700/50 bg-gradient-to-r from-wine-900/40 to-transparent px-5 py-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-wine-700/50 bg-wine-900/40 text-crimson-500">
        <Clock className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[0.66rem] uppercase tracking-[0.2em] text-rose-muted">
          Sıradaki Randevu
        </p>
        <p className="mt-1 text-sm text-white">
          <span className="font-semibold">{booking.customer?.full_name}</span>
          {" · "}
          {booking.service?.title_tr}
          {booking.therapist ? ` · ${booking.therapist.name}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-3xl leading-none text-gradient-rose">
          {formatTime(booking.scheduled_at)}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {formatRelative(booking.scheduled_at)}
        </p>
      </div>
    </div>
  );
}
