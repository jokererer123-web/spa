"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";
import { BUSINESS, SERVICES } from "@/lib/demo-data";

/**
 * Randevu request form. It does not post anywhere — submitting opens a
 * pre-filled WhatsApp message so the desk receives the request instantly.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: SERVICES[0]?.title_tr ?? "",
    date: "",
    message: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      "Merhaba, Reina Spa'dan randevu talep etmek istiyorum.",
      `Ad Soyad: ${form.name}`,
      `Telefon: ${form.phone}`,
      `Hizmet: ${form.service}`,
      form.date ? `Tercih edilen tarih: ${form.date}` : null,
      form.message ? `Not: ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`${BUSINESS.whatsappHref}?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/40";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl border border-white/8 bg-ink-800/70 p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.4),transparent_70%)] blur-3xl" />

      <div className="relative">
        <h2 className="font-display text-3xl text-white">Randevu Talebi</h2>
        <p className="mt-2 text-sm text-white/50">
          Formu doldurun, WhatsApp üzerinden hemen dönüş yapalım.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
              Ad Soyad
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Adınız"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
              Telefon
            </label>
            <input
              id="phone"
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="05XX XXX XX XX"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="service" className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
              Hizmet
            </label>
            <select id="service" value={form.service} onChange={update("service")} className={inputClass}>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.title_tr} className="bg-ink-900">
                  {s.title_tr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
              Tercih Edilen Tarih
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={update("date")}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
              Notunuz
            </label>
            <textarea
              id="message"
              rows={4}
              value={form.message}
              onChange={update("message")}
              placeholder="Özel isteklerinizi buraya yazabilirsiniz."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-16px_rgba(229,9,20,0.9)] transition-shadow hover:shadow-[0_22px_55px_-14px_rgba(229,9,20,1)]"
        >
          {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {sent ? "Talebiniz iletildi" : "Randevu Talebi Gönder"}
        </motion.button>

        <p className="mt-4 text-center text-xs text-white/35">
          Ya da doğrudan arayın:{" "}
          <a href={BUSINESS.phoneHref} className="font-semibold text-crimson-500">
            {BUSINESS.phone}
          </a>
        </p>
      </div>
    </form>
  );
}
