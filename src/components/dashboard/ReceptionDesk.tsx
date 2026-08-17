"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  LayoutDashboard,
  Users,
  XCircle,
} from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatDate, formatWeekday, isSameDay } from "@/lib/format";
import BookingForm from "./BookingForm";
import BookingRow, { NextUpBanner } from "./BookingRow";
import CriticalPackages from "./CriticalPackages";
import { EmptyState, Panel, StatCard } from "./ui";
import { minutesUntil } from "@/lib/booking-rules";

type Filter = "all" | "confirmed" | "cancelled";

/**
 * Reception / tablet interface.
 *
 * Two columns on a tablet in landscape: the day's board on the left, quick
 * booking creation and the critical-package list on the right. Everything is
 * touch-sized and updates instantly as bookings change.
 */
export default function ReceptionDesk() {
  const ops = useOperations();
  const [dayOffset, setDayOffset] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  // `now` ticks every 30s on the client (null during prerender), which keeps
  // relative labels like "18 dk sonra" honest on a screen left open all day.
  const now = ops.now;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  const day = useMemo(() => {
    const d = new Date(now ?? 0);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset, now]);

  const dayBookings = useMemo(
    () => (now ? ops.bookings.filter((b) => isSameDay(b.scheduled_at, day)) : []),
    [ops.bookings, day, now],
  );

  const visible = useMemo(
    () =>
      filter === "all" ? dayBookings : dayBookings.filter((b) => b.status === filter),
    [dayBookings, filter],
  );

  const nextUp = useMemo(
    () =>
      !now
        ? undefined
        : ops.bookings
        .filter((b) => b.status === "confirmed" && minutesUntil(b.scheduled_at, now) > 0)
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        )[0],
    [ops.bookings, now],
  );

  const handleCancel = (id: string) => {
    const result = ops.cancelBooking(id);
    setToast({ text: result.message_tr, ok: result.ok });
  };

  const dayLabel =
    dayOffset === 0
      ? "Bugün"
      : dayOffset === 1
        ? "Yarın"
        : dayOffset === -1
          ? "Dün"
          : now
            ? formatWeekday(day.toISOString())
            : "";

  return (
    <div className="min-h-screen bg-ink-900 pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-[0.2em] text-gradient-rose">
                REINA
              </span>
              <span className="text-[0.56rem] uppercase tracking-[0.34em] text-white/40">
                Resepsiyon
              </span>
            </Link>
            <span className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">
                {now ? formatDate(day.toISOString()) : "—"}
              </p>
              <p className="text-xs text-white/40">
                {now ? formatWeekday(day.toISOString()) : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Day nav */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/70 p-1">
              <button
                type="button"
                onClick={() => setDayOffset((d) => d - 1)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Önceki gün"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDayOffset(0)}
                className="min-w-[4.5rem] rounded-full px-3 py-1.5 text-xs font-semibold text-white"
              >
                {dayLabel}
              </button>
              <button
                type="button"
                onClick={() => setDayOffset((d) => d + 1)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Sonraki gün"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-crimson-500 hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Yönetim</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Bugünkü Randevu"
            value={ops.stats.todayTotal}
            icon={CalendarCheck}
            hint={`${ops.stats.todayConfirmed} onaylı · ${ops.stats.todayCancelled} iptal`}
          />
          <StatCard label="Aktif Terapist" value={ops.stats.activeTherapists} icon={Users} />
          <StatCard label="Kayıtlı Misafir" value={ops.stats.customers} icon={Users} />
          <StatCard
            label="Kritik Paket"
            value={ops.stats.criticalCount}
            icon={XCircle}
            tone={ops.stats.criticalCount > 0 ? "danger" : "default"}
            hint="2 seans ve altı"
          />
        </div>

        {nextUp && (
          <div className="mt-6">
            <NextUpBanner booking={nextUp} />
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          {/* Day board */}
          <Panel
            title={`${dayLabel} · ${visible.length} randevu`}
            icon={CalendarCheck}
            action={
              <div className="flex gap-1 rounded-full border border-white/10 bg-ink-900/70 p-1">
                {(
                  [
                    { key: "all", label: "Tümü" },
                    { key: "confirmed", label: "Onaylı" },
                    { key: "cancelled", label: "İptal" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      filter === tab.key
                        ? "bg-gradient-to-r from-wine-700 to-crimson-600 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            }
          >
            {visible.length === 0 ? (
              <EmptyState>Bu gün için randevu bulunmuyor.</EmptyState>
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {visible.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancel}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}

            <footer className="flex items-start gap-2 border-t border-white/8 px-5 py-3.5 text-[0.7rem] text-white/35">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wine-700" />
              Randevuya 30 dakikadan fazla süre varken yapılan iptallerde paket
              seansı otomatik iade edilir; son 30 dakika içindeki iptallerde
              seans hakkı kullanılmış sayılır.
            </footer>
          </Panel>

          {/* Right rail */}
          <div className="space-y-6">
            <Panel title="Hızlı Randevu" icon={CalendarPlus}>
              <BookingForm onDone={(text, ok) => setToast({ text, ok })} />
            </Panel>

            <CriticalPackages items={ops.criticalPackages} compact />
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className={`fixed bottom-6 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-2xl backdrop-blur-xl ${
              toast.ok
                ? "border-emerald-500/40 bg-emerald-950/85 text-emerald-100"
                : "border-crimson-500/50 bg-wine-900/90 text-rose-soft"
            }`}
          >
            {toast.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
