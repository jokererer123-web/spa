import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import ServiceCard from "@/components/site/ServiceCard";
import Reveal from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/demo-data";
import { getSiteContent } from "@/lib/site-content";

// Prerendered and refreshed every 5 minutes, so admin edits reach the public
// site without making every visit hit the database.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Medikal masaj, Bali masajı, sıcak taş terapisi, aromaterapi, Türk hamamı ve çift masajı. Reina Spa Ataşehir masaj hizmetleri ve fiyatları.",
};

const RITUAL_STEPS = [
  { step: "01", title: "Karşılama", text: "Aromatik çay ve kısa bir dinlenme ile bedeniniz seansa hazırlanır." },
  { step: "02", title: "Danışma", text: "Terapistiniz beklentilerinizi ve hassas bölgelerinizi dinler." },
  { step: "03", title: "Ritüel", text: "Size özel seçilen yağlar ve teknikle masaj seansı uygulanır." },
  { step: "04", title: "Dinlenme", text: "Seans sonrası dinlenme alanında bitki çayı ikramımızla tamamlanır." },
];

export default async function ServicesPage() {
  const { services: SERVICES } = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Hizmetler"
        title={
          <>
            Masaj ve <span className="text-gradient-rose">terapi menümüz</span>
          </>
        }
        description="Her ritüel, uzman terapistlerimiz tarafından bedeninizin ihtiyacına göre kişiselleştirilir."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-ink-950/50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
              Deneyim
            </span>
            <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">
              Bir Reina <span className="text-gradient-rose">seansı</span> nasıl geçer?
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {RITUAL_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-display text-6xl text-wine-800/70">{item.step}</span>
                  <h3 className="mt-3 font-display text-2xl text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 text-center lg:px-8">
        <Reveal>
          <h2 className="font-display text-4xl text-white sm:text-5xl">
            Hangi ritüelin size uygun olduğundan
            <span className="block text-gradient-rose">emin değil misiniz?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-white/55">
            Bizi arayın; ihtiyaçlarınızı dinleyip size en uygun masaj türünü
            birlikte belirleyelim.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-14px_rgba(229,9,20,0.9)]"
            >
              <Phone className="h-4 w-4" />
              {BUSINESS.phone}
            </a>
            <Link
              href="/paketler"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-white/85 transition-all hover:border-crimson-500 hover:text-white"
            >
              Paketleri inceleyin
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
