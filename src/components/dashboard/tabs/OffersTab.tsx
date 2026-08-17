"use client";

import { useState } from "react";
import { BadgePercent, Pencil, Plus, Trash2, X } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatDate } from "@/lib/format";
import { Button, EmptyState, fieldClass, labelClass, Panel } from "../ui";
import type { Offer } from "@/lib/types";

const blank: Offer = {
  id: "",
  title_tr: "",
  description_tr: "",
  discount_label: "%20 İndirim",
  valid_until: null,
  highlight: false,
};

export default function OffersTab() {
  const ops = useOperations();
  const [draft, setDraft] = useState<Offer | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    ops.upsertOffer(draft);
    setDraft(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Fırsatlar (${ops.offers.length})`}
        icon={BadgePercent}
        action={
          <Button onClick={() => setDraft({ ...blank })} className="!px-4 !py-2 !text-xs">
            <Plus className="h-3.5 w-3.5" />
            Yeni
          </Button>
        }
      >
        {ops.offers.length === 0 ? (
          <EmptyState>Aktif kampanya yok.</EmptyState>
        ) : (
          <ul className="divide-y divide-white/5">
            {ops.offers.map((o) => (
              <li key={o.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <span className="shrink-0 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-3 py-1.5 text-xs font-bold text-white">
                  {o.discount_label}
                </span>
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-semibold text-white">{o.title_tr}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
                    {o.description_tr}
                  </p>
                  <p className="mt-1.5 text-[0.66rem] text-white/30">
                    {o.valid_until
                      ? `${formatDate(o.valid_until)} tarihine kadar`
                      : "Süresiz"}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...o })}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/55 transition hover:border-rose-soft/60 hover:text-white"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${o.title_tr}" silinsin mi?`)) ops.removeOffer(o.id);
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
        title={draft?.id ? "Fırsatı Düzenle" : "Yeni Fırsat"}
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
          <EmptyState>Düzenlemek için bir kampanya seçin veya yeni ekleyin.</EmptyState>
        ) : (
          <form onSubmit={save} className="space-y-4 p-5">
            <div>
              <label htmlFor="o-title" className={labelClass}>
                Başlık
              </label>
              <input
                id="o-title"
                value={draft.title_tr}
                onChange={(e) => setDraft({ ...draft, title_tr: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="o-desc" className={labelClass}>
                Açıklama
              </label>
              <textarea
                id="o-desc"
                rows={3}
                value={draft.description_tr}
                onChange={(e) => setDraft({ ...draft, description_tr: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div>
              <label htmlFor="o-label" className={labelClass}>
                İndirim Etiketi
              </label>
              <input
                id="o-label"
                value={draft.discount_label}
                onChange={(e) => setDraft({ ...draft, discount_label: e.target.value })}
                className={fieldClass}
                placeholder="%25 İndirim"
              />
            </div>
            <div>
              <label htmlFor="o-until" className={labelClass}>
                Son Geçerlilik
              </label>
              <input
                id="o-until"
                type="date"
                value={draft.valid_until ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, valid_until: e.target.value || null })
                }
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
              <input
                type="checkbox"
                checked={Boolean(draft.highlight)}
                onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })}
                className="h-4 w-4 accent-[#e50914]"
              />
              <span className="text-sm text-white/80">Ana sayfada vurgula</span>
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
