"use client";

import { AnimatePresence } from "framer-motion";
import { CalendarCheck, Coins, TrendingUp, Users, XCircle } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatPrice } from "@/lib/format";
import BookingRow from "../BookingRow";
import CriticalPackages from "../CriticalPackages";
import { EmptyState, Panel, StatCard } from "../ui";

export default function OverviewTab() {
  const ops = useOperations();

  // Simple 7-day load chart. Anchored to the client clock so the statically
  // prerendered HTML does not bake in build-time dates.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ops.now ?? 0);
    d.setDate(d.getDate() - (6 - i));
    const count = !ops.now ? 0 : ops.bookings.filter((b) => {
      const bd = new Date(b.scheduled_at);
      return (
        bd.getFullYear() === d.getFullYear() &&
        bd.getMonth() === d.getMonth() &&
        bd.getDate() === d.getDate() &&
        b.status !== "cancelled"
      );
    }).length;
    return {
      label: ops.now
        ? new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(d)
        : "",
      count,
    };
  });
  const peak = Math.max(1, ...week.map((w) => w.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bugünkü Randevu"
          value={ops.stats.todayTotal}
          icon={CalendarCheck}
          hint={`${ops.stats.todayConfirmed} onaylı`}
        />
        <StatCard
          label="Günlük Ciro"
          value={formatPrice(ops.stats.revenue)}
          icon={Coins}
          tone="gold"
        />
        <StatCard label="Kayıtlı Misafir" value={ops.stats.customers} icon={Users} />
        <StatCard
          label="Kritik Paket"
          value={ops.stats.criticalCount}
          icon={XCircle}
          tone={ops.stats.criticalCount > 0 ? "danger" : "default"}
          hint="2 seans ve altı"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Haftalık Doluluk" icon={TrendingUp}>
            <div className="flex h-52 items-end gap-3 px-5 pb-5 pt-6">
              {week.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs text-white/45">{d.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-wine-800 to-crimson-600 transition-all"
                    style={{ height: `${Math.max(4, (d.count / peak) * 100)}%` }}
                  />
                  <span className="text-[0.66rem] uppercase tracking-wide text-white/35">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Bugünün Randevuları" icon={CalendarCheck}>
            {ops.todayBookings.length === 0 ? (
              <EmptyState>Bugün için randevu bulunmuyor.</EmptyState>
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {ops.todayBookings.map((b) => (
                    <BookingRow
                      key={b.id}
                      booking={b}
                      onCancel={(id) => ops.cancelBooking(id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <CriticalPackages items={ops.criticalPackages} />

          <Panel title="Terapist Yükü" icon={Users}>
            <ul className="divide-y divide-white/5">
              {ops.therapists.map((t) => {
                const count = ops.bookings.filter(
                  (b) => b.therapist_id === t.id && b.status !== "cancelled",
                ).length;
                return (
                  <li key={t.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-gradient-rose">{count}</p>
                      <p className="text-[0.62rem] text-white/35">
                        {t.active_status ? "aktif" : "pasif"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
