"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, X } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { Button, EmptyState, fieldClass, labelClass, Panel } from "../ui";
import type { Therapist } from "@/lib/types";

const blank: Therapist = {
  id: "",
  name: "",
  specialization: "",
  active_status: true,
};

export default function TherapistsTab() {
  const ops = useOperations();
  const [draft, setDraft] = useState<Therapist | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    ops.upsertTherapist(draft);
    setDraft(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Terapistler (${ops.therapists.length})`}
        icon={Sparkles}
        action={
          <Button onClick={() => setDraft({ ...blank })} className="!px-4 !py-2 !text-xs">
            <Plus className="h-3.5 w-3.5" />
            Yeni
          </Button>
        }
      >
        <ul className="divide-y divide-white/5">
          {ops.therapists.map((t) => {
            const load = ops.bookings.filter(
              (b) => b.therapist_id === t.id && b.status !== "cancelled",
            ).length;
            return (
              <li key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-wine-700/50 bg-wine-900/30 font-display text-lg text-rose-soft">
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-[9rem] flex-1">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {t.specialization} · {load} randevu
                  </p>
                </div>

                {/* Active toggle */}
                <button
                  type="button"
                  onClick={() => ops.toggleTherapist(t.id)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    t.active_status ? "bg-gradient-to-r from-wine-700 to-crimson-600" : "bg-white/10"
                  }`}
                  aria-label={t.active_status ? "Pasife al" : "Aktif et"}
                  title={t.active_status ? "Aktif" : "Pasif"}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                      t.active_status ? "left-6" : "left-1"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setDraft({ ...t })}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/55 transition hover:border-rose-soft/60 hover:text-white"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={draft?.id ? "Terapisti Düzenle" : "Yeni Terapist"}
        icon={Pencil}
        action={
          draft && (
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="text-white/40 transition hover:text-white"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          )
        }
      >
        {!draft ? (
          <EmptyState>Düzenlemek için bir terapist seçin veya yeni ekleyin.</EmptyState>
        ) : (
          <form onSubmit={save} className="space-y-4 p-5">
            <div>
              <label htmlFor="t-name" className={labelClass}>
                Ad Soyad
              </label>
              <input
                id="t-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="t-spec" className={labelClass}>
                Uzmanlık
              </label>
              <input
                id="t-spec"
                value={draft.specialization ?? ""}
                onChange={(e) => setDraft({ ...draft, specialization: e.target.value })}
                className={fieldClass}
                placeholder="Örn. Medikal & Derin Doku"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
              <input
                type="checkbox"
                checked={draft.active_status}
                onChange={(e) => setDraft({ ...draft, active_status: e.target.checked })}
                className="h-4 w-4 accent-[#e50914]"
              />
              <span className="text-sm text-white/80">Aktif olarak çalışıyor</span>
            </label>
            <Button type="submit" className="w-full py-3.5">
              Kaydet
            </Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
