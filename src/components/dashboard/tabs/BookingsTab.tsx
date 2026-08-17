"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CalendarDays, CalendarPlus, Search } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import BookingForm from "../BookingForm";
import BookingRow from "../BookingRow";
import { EmptyState, fieldClass, Panel } from "../ui";
import type { BookingStatus } from "@/lib/types";

const FILTERS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "confirmed", label: "Onaylı" },
  { key: "completed", label: "Tamamlanan" },
  { key: "cancelled", label: "İptal" },
];

export default function BookingsTab() {
  const ops = useOperations();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return ops.bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return [b.customer?.full_name, b.customer?.phone, b.service?.title_tr, b.therapist?.name]
        .filter(Boolean)
        .some((v) => v!.toLocaleLowerCase("tr").includes(q));
    });
  }, [ops.bookings, filter, query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Tüm Randevular (${list.length})`}
        icon={CalendarDays}
        action={
          <div className="flex gap-1 rounded-full border border-white/10 bg-ink-900/70 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-gradient-to-r from-wine-700 to-crimson-600 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="relative border-b border-white/8 px-5 py-3">
          <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Misafir, telefon, hizmet veya terapist ara…"
            className={`${fieldClass} pl-10`}
          />
        </div>

        {list.length === 0 ? (
          <EmptyState>Kayıt bulunamadı.</EmptyState>
        ) : (
          <ul className="max-h-[64vh] overflow-y-auto">
            <AnimatePresence initial={false}>
              {list.map((b) => (
                <BookingRow key={b.id} booking={b} onCancel={(id) => ops.cancelBooking(id)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      <Panel title="Yeni Randevu" icon={CalendarPlus}>
        <BookingForm />
      </Panel>
    </div>
  );
}
