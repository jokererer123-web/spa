"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, UserPlus } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { toDateTimeLocalValue } from "@/lib/format";
import { useMounted } from "@/lib/use-now";
import { Button, fieldClass, labelClass } from "./ui";

interface BookingFormProps {
  onDone?: (message: string, ok: boolean) => void;
}

/**
 * Fast booking creation for the reception desk.
 *
 * Defaults to the next round half-hour and to package payment when the guest
 * has credit, so the common case is three taps.
 */
export default function BookingForm({ onDone }: BookingFormProps) {
  const ops = useOperations();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPackageId, setNewPackageId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [usePackage, setUsePackage] = useState(true);
  // Empty during prerender so the statically generated HTML matches the first
  // client render; defaults to the next half-hour slot once hydrated.
  const [whenOverride, setWhenOverride] = useState<string | null>(null);
  const mounted = useMounted();
  // Depends only on the mount flag, so the prefilled slot is computed once and
  // does not jump forward while the receptionist is filling the form.
  const defaultWhen = useMemo(() => {
    if (!mounted) return "";
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    return toDateTimeLocalValue(d);
  }, [mounted]);
  const when = whenOverride ?? defaultWhen;
  const setWhen = setWhenOverride;

  const activeTherapists = useMemo(
    () => ops.therapists.filter((t) => t.active_status),
    [ops.therapists],
  );

  const selectedPackage = customerId ? ops.activePackageFor(customerId) : undefined;
  const packageInfo = selectedPackage
    ? `${ops.packageById.get(selectedPackage.package_id)?.name_tr ?? "Paket"} · ${
        selectedPackage.remaining_sessions
      } seans kaldı`
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let id = customerId;
    if (mode === "new") {
      if (!newName.trim() || !newPhone.trim()) {
        onDone?.("Lütfen misafir adı ve telefon bilgisini girin.", false);
        return;
      }
      const created = ops.createCustomer({
        full_name: newName,
        phone: newPhone,
        packageId: newPackageId || null,
      });
      id = created.id;
    }

    if (!id) {
      onDone?.("Lütfen bir misafir seçin.", false);
      return;
    }

    const result = ops.createBooking({
      customer_id: id,
      therapist_id: therapistId || null,
      service_id: serviceId || null,
      scheduled_at: new Date(when).toISOString(),
      notes: notes.trim() || null,
      // A brand-new customer with a fresh package can still pay by package.
      usePackage: mode === "new" ? Boolean(newPackageId) && usePackage : usePackage,
    });

    onDone?.(result.message_tr, result.ok);
    if (result.ok) {
      setNotes("");
      setNewName("");
      setNewPhone("");
      setNewPackageId("");
      if (mode === "new") setMode("existing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      {/* Guest mode switch */}
      <div className="flex gap-2 rounded-full border border-white/10 bg-ink-900/60 p-1">
        {(
          [
            { key: "existing", label: "Kayıtlı Misafir" },
            { key: "new", label: "Yeni Misafir" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              mode === tab.key
                ? "bg-gradient-to-r from-wine-700 to-crimson-600 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div>
          <label htmlFor="customer" className={labelClass}>
            Misafir
          </label>
          <select
            id="customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={fieldClass}
            required
          >
            <option value="">Misafir seçin…</option>
            {ops.customers.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-900">
                {c.full_name} — {c.phone}
              </option>
            ))}
          </select>
          {customerId && (
            <p
              className={`mt-2 text-xs ${
                selectedPackage ? "text-white/45" : "text-amber-400"
              }`}
            >
              {packageInfo ?? "Aktif paketi yok — tek seans olarak kaydedilecek."}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-name" className={labelClass}>
              Ad Soyad
            </label>
            <input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={fieldClass}
              placeholder="Misafir adı"
            />
          </div>
          <div>
            <label htmlFor="new-phone" className={labelClass}>
              Telefon
            </label>
            <input
              id="new-phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className={fieldClass}
              placeholder="05XX XXX XX XX"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-package" className={labelClass}>
              Paket Tanımla (opsiyonel)
            </label>
            <select
              id="new-package"
              value={newPackageId}
              onChange={(e) => setNewPackageId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Paket yok — tek seans</option>
              {ops.packages.map((p) => (
                <option key={p.id} value={p.id} className="bg-ink-900">
                  {p.name_tr} ({p.total_sessions} seans)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className={labelClass}>
            Hizmet
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={fieldClass}
            required
          >
            <option value="">Hizmet seçin…</option>
            {ops.services.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink-900">
                {s.title_tr} · {s.duration_min} dk
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="therapist" className={labelClass}>
            Terapist
          </label>
          <select
            id="therapist"
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Atanmadı</option>
            {activeTherapists.map((t) => (
              <option key={t.id} value={t.id} className="bg-ink-900">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="when" className={labelClass}>
          Tarih & Saat
        </label>
        <input
          id="when"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className={`${fieldClass} [color-scheme:dark]`}
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Not
        </label>
        <input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={fieldClass}
          placeholder="Özel istek, alerji, oda tercihi…"
        />
      </div>

      {/* Package deduction toggle */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
        <input
          type="checkbox"
          checked={usePackage}
          onChange={(e) => setUsePackage(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#e50914]"
        />
        <span>
          <span className="block text-sm font-medium text-white">
            Paketten 1 seans düş
          </span>
          <span className="mt-0.5 block text-xs text-white/40">
            Randevu onaylandığında misafirin aktif paketinden otomatik düşülür.
          </span>
        </span>
      </label>

      {mode === "existing" && customerId && !selectedPackage && usePackage && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Bu misafirin kullanılabilir seansı yok. Kaydetmek için paket tanımlayın
          veya seçimi kaldırın.
        </p>
      )}

      <Button type="submit" className="w-full py-3.5">
        {mode === "new" ? <UserPlus className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
        Randevuyu Oluştur
      </Button>
    </form>
  );
}
