import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/site/ContactForm";
import { BUSINESS } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Reina Spa Ataşehir iletişim bilgileri, adres ve yol tarifi. Barbaros Mah. Al Zambak Sok. Varyap Meridian A Blok, Ataşehir / İstanbul.",
};

const MAP_SRC = `https://www.google.com/maps?q=${BUSINESS.mapsQuery}&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS.mapsQuery}`;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title={
          <>
            Bize <span className="text-gradient-rose">ulaşın</span>
          </>
        }
        description="Randevu, paket bilgisi ve tüm sorularınız için buradayız."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          {/* Contact details */}
          <Reveal className="space-y-5">
            <a
              href={BUSINESS.phoneHref}
              className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-800/60 p-6 transition-all hover:-translate-y-0.5 hover:border-wine-700/70"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-wine-700/40 bg-wine-900/30 text-crimson-500">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                  Telefon
                </span>
                <span className="mt-1.5 block font-display text-2xl text-white transition-colors group-hover:text-rose-soft">
                  {BUSINESS.phone}
                </span>
              </span>
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-800/60 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-wine-700/40 bg-wine-900/30 text-crimson-500">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                  Adres
                </span>
                <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-white/75">
                  {BUSINESS.address}
                </span>
                <a
                  href={DIRECTIONS}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-semibold text-crimson-500 hover:text-crimson-400"
                >
                  Yol tarifi al →
                </a>
              </span>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-800/60 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-wine-700/40 bg-wine-900/30 text-crimson-500">
                <Clock className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                  Çalışma Saatleri
                </span>
                <span className="mt-1.5 block text-[0.95rem] text-white/75">
                  {BUSINESS.hours}
                </span>
              </span>
            </div>

            <div className="flex gap-4">
              <a
                href={BUSINESS.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/8 bg-ink-800/60 p-5 text-sm text-white/70 transition-all hover:border-wine-700/70 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 text-crimson-500" />
                WhatsApp
              </a>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/8 bg-ink-800/60 p-5 text-sm text-white/70 transition-all hover:border-wine-700/70 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4 text-crimson-500" />
                Instagram
              </a>
            </div>
          </Reveal>

          {/* Request form */}
          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <iframe
              src={MAP_SRC}
              title="Reina Spa konumu"
              className="h-[420px] w-full grayscale-[0.4] contrast-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 border border-wine-700/20" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
