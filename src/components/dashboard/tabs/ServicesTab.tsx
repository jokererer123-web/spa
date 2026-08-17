"use client";

import { useState } from "react";
import { LayoutGrid, Pencil, Plus, Trash2, X } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatPrice } from "@/lib/format";
import { Button, EmptyState, fieldClass, labelClass, Panel } from "../ui";
import type { Service } from "@/lib/types";

const blank: Service = {
  id: "",
  title_tr: "",
  description_tr: "",
  duration_min: 60,
  price: 2500,
  is_featured: false,
};

export default function ServicesTab() {
  const ops = useOperations();
  const [draft, setDraft] = useState<Service | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    ops.upsertService(draft);
    setDraft(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Hizmetler (${ops.services.length})`}
        icon={LayoutGrid}
        action={
          <Button onClick={() => setDraft({ ...blank })} className="!px-4 !py-2 !text-xs">
            <Plus className="h-3.5 w-3.5" />
            Yeni
          </Button>
        }
      >
        {ops.services.length === 0 ? (
          <EmptyState>Henüz hizmet eklenmemiş.</EmptyState>
        ) : (
          <ul className="divide-y divide-white/5">
            {ops.services.map((s) => (
              <li key={s.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="min-w-[12rem] flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {s.title_tr}
                    {s.is_featured && (
                      <span className="rounded-full border border-gold-soft/30 bg-gold-soft/10 px-2 py-0.5 text-[0.58rem] uppercase tracking-wide text-gold-soft">
                        Öne çıkan
                      </span>
                    )}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
                    {s.description_tr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-gradient-rose">
                    {formatPrice(s.price)}
                  </p>
                  <p className="text-[0.66rem] text-white/35">{s.duration_min} dk</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...s })}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/55 transition hover:border-rose-soft/60 hover:text-white"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${s.title_tr}" silinsin mi?`)) ops.removeService(s.id);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-crimson-500/40 text-crimson-400 transition hover:bg-crimson-500/10"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title={draft?.id ? "Hizmeti Düzenle" : "Yeni Hizmet"}
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
          <EmptyState>Düzenlemek için bir hizmet seçin veya yeni ekleyin.</EmptyState>
        ) : (
          <form onSubmit={save} className="space-y-4 p-5">
            <div>
              <label htmlFor="s-title" className={labelClass}>
                Başlık
              </label>
              <input
                id="s-title"
                value={draft.title_tr}
                onChange={(e) => setDraft({ ...draft, title_tr: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="s-desc" className={labelClass}>
                Açıklama
              </label>
              <textarea
                id="s-desc"
                rows={4}
                value={draft.description_tr ?? ""}
                onChange={(e) => setDraft({ ...draft, description_tr: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="s-duration" className={labelClass}>
                  Süre (dk)
                </label>
                <input
                  id="s-duration"
                  type="number"
                  min={15}
                  step={5}
                  value={draft.duration_min}
                  onChange={(e) =>
                    setDraft({ ...draft, duration_min: Number(e.target.value) })
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="s-price" className={labelClass}>
                  Fiyat (₺)
                </label>
                <input
                  id="s-price"
                  type="number"
                  min={0}
                  step={100}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  className={fieldClass}
                />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
              <input
                type="checkbox"
                checked={Boolean(draft.is_featured)}
                onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                className="h-4 w-4 accent-[#e50914]"
              />
              <span className="text-sm text-white/80">Ana sayfada öne çıkar</span>
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
