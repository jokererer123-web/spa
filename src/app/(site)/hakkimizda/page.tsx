import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, HeartHandshake, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/demo-data";
import { getSiteContent } from "@/lib/site-content";

// Prerendered and refreshed every 5 minutes, so admin edits reach the public
// site without making every visit hit the database.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Reina Spa Ataşehir'in hikâyesi, felsefesi ve uzman terapist kadrosu. Lüks masaj ve wellness anlayışımızı keşfedin.",
};

const PRINCIPLES = [
  {
    icon: Leaf,
    title: "Doğallık",
    text: "Kullandığımız her yağ ve bakım ürünü doğal içerikli, dermatolojik olarak test edilmiştir.",
  },
  {
    icon: ShieldCheck,
    title: "Güven",
    text: "Misafir mahremiyeti bizim için esastır. Tüm seanslar özel odalarda gerçekleşir.",
  },
  {
    icon: Award,
    title: "Uzmanlık",
    text: "Terapistlerimiz sertifikalı ve düzenli eğitimlerle tekniklerini güncel tutar.",
  },
  {
    icon: HeartHandshake,
    title: "Kişisellik",
    text: "Hiçbir seans birbirinin aynısı değildir; program bedeninize göre şekillenir.",
  },
];

export default async function AboutPage() {
  const { therapists: THERAPISTS } = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Hakkımızda"
        title={
          <>
            Reina Spa&apos;nın <span className="text-gradient-rose">hikâyesi</span>
          </>
        }
        description="Ataşehir'in kalbinde, misafirlerine gerçek bir dinginlik deneyimi sunmak için kurulduk."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/hero/frame-01.jpg"
                alt="Reina Spa masaj seansı"
                width={1376}
                height={768}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <h2 className="font-display text-4xl leading-tight text-white sm:text-[2.9rem]">
              Şehrin temposundan
              <span className="block text-gradient-rose">uzak bir sığınak</span>
            </h2>
            <div className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-white/55">
              <p>
                Reina Spa, wellness&apos;ı bir lüks değil bir ihtiyaç olarak gören
                bir ekip tarafından kuruldu. Varyap Meridian&apos;daki mekânımızı
                tasarlarken tek bir amacımız vardı: kapıdan girdiğiniz anda
                şehrin gürültüsünün arkanızda kalması.
              </p>
              <p>
                Loş aydınlatma, sıcak taşlar, özenle seçilmiş müzik ve
                aromaterapi kokuları… Her detay, duyularınızı yavaşlatmak ve
                bedeninizi teslim olmaya hazırlamak için düşünüldü.
              </p>
              <p>
                Bugün Ataşehir&apos;in en çok tercih edilen spa merkezlerinden
                biriyiz. Misafirlerimizin çoğu üyelik paketleriyle düzenli olarak
                bize geliyor — bizce en güzel referans bu.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
              {[
                { value: "2019", label: "Kuruluş" },
                { value: "5.000+", label: "Mutlu Misafir" },
                { value: "4.9/5", label: "Memnuniyet" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl text-gradient-wine sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-white/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/5 bg-ink-950/50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
              Değerlerimiz
            </span>
            <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">
              Bize yön veren <span className="text-gradient-rose">ilkeler</span>
            </h2>
          </Reveal>

          <Reveal stagger={0.1} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((item) => (
              <RevealItem
                key={item.title}
                className="group rounded-2xl border border-white/8 bg-ink-800/60 p-7 transition-all hover:-translate-y-1 hover:border-wine-700/70"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-wine-700/40 bg-wine-900/30 text-crimson-500">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{item.text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="text-center">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
            Ekibimiz
          </span>
          <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">
            Uzman <span className="text-gradient-rose">terapistlerimiz</span>
          </h2>
        </Reveal>

        <Reveal stagger={0.08} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {THERAPISTS.filter((t) => t.active_status).map((therapist) => (
            <RevealItem
              key={therapist.id}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-ink-800/60 p-7 text-center transition-all hover:border-wine-700/70"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.45),transparent_70%)] opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-wine-700/50 bg-gradient-to-br from-wine-900/60 to-ink-800 font-display text-2xl text-rose-soft">
                {therapist.name.charAt(0)}
              </span>
              <h3 className="relative mt-5 font-display text-xl text-white">
                {therapist.name}
              </h3>
              <p className="relative mt-1.5 text-xs uppercase tracking-[0.14em] text-white/40">
                {therapist.specialization}
              </p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-[0.68rem] text-crimson-500">
                <Sparkles className="h-3 w-3" />
                Sertifikalı Terapist
              </span>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-16 text-center">
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-14px_rgba(229,9,20,0.9)]"
          >
            {BUSINESS.shortAddress}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
