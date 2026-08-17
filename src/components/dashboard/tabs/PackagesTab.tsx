"use client";

import { useState } from "react";
import { Package as PackageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatPrice } from "@/lib/format";
import { Button, EmptyState, fieldClass, labelClass, Panel } from "../ui";
import type { Package } from "@/lib/types";

const blank: Package = {
  id: "",
  name_tr: "",
  description_tr: "",
  total_sessions: 4,
  price: 9000,
  is_featured: false,
};

export default function PackagesTab() {
  const ops = useOperations();
  const [draft, setDraft] = useState<Package | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    ops.upsertPackage(draft);
    setDraft(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title={`Paketler (${ops.packages.length})`}
        icon={PackageIcon}
        action={
          <Button onClick={() => setDraft({ ...blank })} className="!px-4 !py-2 !text-xs">
            <Plus className="h-3.5 w-3.5" />
            Yeni
          </Button>
        }
      >
        <ul className="divide-y divide-white/5">
          {ops.packages.map((p) => {
            const holders = ops.packageSummaries.filter(
              (s) => s.package_name === p.name_tr,
            ).length;
            return (
              <li key={p.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="min-w-[12rem] flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {p.name_tr}
                    {p.is_featured && (
                      <span className="rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-2 py-0.5 text-[0.58rem] uppercase tracking-wide text-white">
                        Popüler
                      </span>
                    )}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
                    {p.description_tr}
                  </p>
                  <p className="mt-1.5 text-[0.66rem] text-white/30">
                    {holders} misafirde aktif
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-gradient-rose">
                    {formatPrice(p.price)}
                  </p>
                  <p className="text-[0.66rem] text-white/35">{p.total_sessions} seans</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...p })}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/55 transition hover:border-rose-soft/60 hover:text-white"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${p.name_tr}" silinsin mi?`)) ops.removePackage(p.id);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-crimson-500/40 text-crimson-400 transition hover:bg-crimson-500/10"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={draft?.id ? "Paketi Düzenle" : "Yeni Paket"}
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
          <EmptyState>Düzenlemek için bir paket seçin veya yeni ekleyin.</EmptyState>
        ) : (
          <form onSubmit={save} className="space-y-4 p-5">
            <div>
              <label htmlFor="p-name" className={labelClass}>
                Paket Adı
              </label>
              <input
                id="p-name"
                value={draft.name_tr}
                onChange={(e) => setDraft({ ...draft, name_tr: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="p-desc" className={labelClass}>
                Açıklama
              </label>
              <textarea
                id="p-desc"
                rows={3}
                value={draft.description_tr ?? ""}
                onChange={(e) => setDraft({ ...draft, description_tr: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-sessions" className={labelClass}>
                  Seans Sayısı
                </label>
                <input
                  id="p-sessions"
                  type="number"
                  min={1}
                  value={draft.total_sessions}
                  onChange={(e) =>
                    setDraft({ ...draft, total_sessions: Number(e.target.value) })
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="p-price" className={labelClass}>
                  Fiyat (₺)
                </label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  step={500}
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
              <span className="text-sm text-white/80">&quot;Popüler&quot; olarak işaretle</span>
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
