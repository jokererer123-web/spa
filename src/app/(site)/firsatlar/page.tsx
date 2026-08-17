import type { Metadata } from "next";
import { CalendarClock, Phone, Tag } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import { BUSINESS, OFFERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Fırsatlar",
  description:
    "Reina Spa Ataşehir'in güncel kampanyaları, indirimleri ve özel teklifleri. Hafta içi indirimleri ve çiftlere özel fırsatlar.",
};

export default function OffersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fırsatlar"
        title={
          <>
            Size özel <span className="text-gradient-rose">kampanyalar</span>
          </>
        }
        description="Sınırlı süreli tekliflerimizden yararlanarak Reina Spa deneyimini daha avantajlı yaşayın."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Reveal stagger={0.1} className="grid gap-6 md:grid-cols-2">
          {OFFERS.map((offer) => (
            <RevealItem key={offer.id}>
              <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                  offer.highlight
                    ? "border border-wine-700 bg-gradient-to-br from-wine-900/50 via-ink-800 to-ink-800 shadow-[0_30px_80px_-45px_rgba(229,9,20,0.9)]"
                    : "border border-white/8 bg-ink-800/70 hover:border-wine-700/60"
                }`}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.35),transparent_70%)] blur-2xl opacity-70" />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-4 py-2 text-sm font-bold text-white">
                    <Tag className="h-3.5 w-3.5" />
                    {offer.discount_label}
                  </span>
                  {offer.highlight && (
                    <span className="rounded-full border border-gold-soft/30 bg-gold-soft/10 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-gold-soft">
                      Popüler
                    </span>
                  )}
                </div>

                <h2 className="relative mt-6 font-display text-3xl text-white">
                  {offer.title_tr}
                </h2>
                <p className="relative mt-3 flex-1 text-[0.95rem] leading-relaxed text-white/55">
                  {offer.description_tr}
                </p>

                <div className="relative mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
                  <span className="inline-flex items-center gap-2 text-xs text-white/45">
                    <CalendarClock className="h-3.5 w-3.5 text-wine-700" />
                    {offer.valid_until
                      ? `${formatDate(offer.valid_until)} tarihine kadar`
                      : "Süresiz geçerli"}
                  </span>
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:border-crimson-500 hover:bg-wine-900/40"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Randevu Al
                  </a>
                </div>
              </article>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-16">
          <div className="rounded-2xl border border-white/8 bg-ink-800/50 p-8 text-center">
            <p className="text-sm leading-relaxed text-white/50">
              Kampanyalar stoklarla ve uygun randevu saatleriyle sınırlıdır.
              Detaylı bilgi ve rezervasyon için{" "}
              <a href={BUSINESS.phoneHref} className="font-semibold text-crimson-500 hover:text-crimson-400">
                {BUSINESS.phone}
              </a>{" "}
              numaralı telefondan bize ulaşabilirsiniz.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
