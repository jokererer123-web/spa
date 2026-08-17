import Link from "next/link";
import { ArrowRight, Clock, HeartHandshake, Leaf, MapPin, Phone, Sparkles, Star } from "lucide-react";
import Hero from "@/components/hero/Hero";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import ServiceCard from "@/components/site/ServiceCard";
import PackageCard from "@/components/site/PackageCard";
import { BUSINESS, OFFERS, PACKAGES, SERVICES } from "@/lib/demo-data";

const VALUES = [
  {
    icon: Leaf,
    title: "Doğal Yağlar",
    text: "Tüm ritüellerimizde %100 doğal, cilt dostu esansiyel yağlar kullanıyoruz.",
  },
  {
    icon: HeartHandshake,
    title: "Uzman Terapistler",
    text: "Sertifikalı ve deneyimli terapist kadromuz her misafire özel program hazırlar.",
  },
  {
    icon: Sparkles,
    title: "Hijyen Standardı",
    text: "Her seans sonrası steril edilen ekipman ve tek kullanımlık tekstil ürünleri.",
  },
  {
    icon: Clock,
    title: "Esnek Saatler",
    text: "Her gün 10:00 – 22:00 arası, yoğun temponuza uyum sağlayan randevu seçenekleri.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ayşe K.",
    text: "Ataşehir'de bu kalitede bir spa bulmak gerçekten zor. Medikal masaj sonrası bel ağrılarım tamamen geçti. Atmosfer inanılmaz huzurlu.",
  },
  {
    name: "Mehmet Ş.",
    text: "Prestij üyeliği aldım ve pişman değilim. Terapistler işinin ehli, randevu sistemi çok pratik. Her hafta düzenli geliyorum.",
  },
  {
    name: "Zeynep A.",
    text: "Eşimle çift masajı için gittik, yıldönümümüz için mükemmel bir seçimdi. Mum ışığı, müzik, ikramlar… her detay düşünülmüş.",
  },
];

export default function HomePage() {
  const featuredServices = SERVICES.filter((s) => s.is_featured).slice(0, 3);
  const highlightOffers = OFFERS.slice(0, 2);

  return (
    <>
      <Hero />

      {/* Intro / about strip */}
      <section className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.36em] text-rose-muted">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-wine-700" />
              Hakkımızda
            </span>
            <h2 className="mt-6 font-display text-4xl leading-tight text-white sm:text-5xl">
              Lüksün ve dinginliğin
              <span className="block text-gradient-rose">buluştuğu adres</span>
            </h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-white/55">
              Reina Spa, Ataşehir Varyap Meridian&apos;da şehrin yoğun temposundan
              kaçmak isteyenler için tasarlandı. Loş ışıklar, sıcak taşlar ve
              uzman ellerin buluştuğu mekânımızda her seans sizin için özel
              olarak kurgulanır.
            </p>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-white/55">
              Medikal masajdan Bali ritüellerine, geleneksel Türk hamamından
              çiftlere özel süit deneyimlerine kadar geniş bir hizmet yelpazesi
              sunuyoruz.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
              {[
                { value: "12+", label: "Uzman Terapist" },
                { value: "8", label: "Masaj Ritüeli" },
                { value: "4.9", label: "Misafir Puanı" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl text-gradient-wine">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/hakkimizda"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-rose-soft transition-colors hover:text-white"
            >
              Hikâyemizi keşfedin
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={0.15} className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="group rounded-2xl border border-white/8 bg-ink-800/60 p-6 transition-all hover:-translate-y-1 hover:border-wine-700/70"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-wine-700/40 bg-wine-900/30 text-crimson-500 transition-colors group-hover:bg-wine-800/50">
                  <value.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{value.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Hizmetler"
          title={
            <>
              Size özel <span className="text-gradient-rose">masaj ritüelleri</span>
            </>
          }
          description="Her biri uzman terapistlerimiz tarafından kişiselleştirilen, bedeni ve zihni dengeleyen terapi seçenekleri."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/hizmetler"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white/85 transition-all hover:border-crimson-500 hover:text-white"
          >
            Tüm hizmetleri görün
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* Offers band */}
      <section className="relative overflow-hidden border-y border-white/5 bg-ink-950/60 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(139,0,0,0.25),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Fırsatlar"
            title={
              <>
                Sezonun <span className="text-gradient-rose">ayrıcalıkları</span>
              </>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {highlightOffers.map((offer, i) => (
              <Reveal key={offer.id} delay={i * 0.1}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-wine-700/40 bg-gradient-to-br from-wine-900/40 to-ink-800 p-8">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.4),transparent_70%)] blur-2xl transition-opacity duration-500 group-hover:opacity-150" />
                  <span className="inline-flex w-fit rounded-full bg-gradient-to-r from-wine-700 to-crimson-600 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white">
                    {offer.discount_label}
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-white">{offer.title_tr}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {offer.description_tr}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex justify-center">
            <Link
              href="/firsatlar"
              className="group inline-flex items-center gap-2 text-sm font-medium text-rose-soft transition-colors hover:text-white"
            >
              Tüm kampanyalar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Packages */}
      <section className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8">
        <SectionHeading
          eyebrow="Paketler"
          title={
            <>
              Üyelik ve <span className="text-gradient-rose">terapi paketleri</span>
            </>
          }
          description="Düzenli bakım alışkanlığı kazanmak isteyen misafirlerimiz için avantajlı seans paketleri."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <SectionHeading
          eyebrow="Misafirlerimiz"
          title={
            <>
              Onlar <span className="text-gradient-rose">ne diyor?</span>
            </>
          }
        />
        <Reveal stagger={0.12} className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <RevealItem
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-white/8 bg-ink-800/60 p-7"
            >
              <div className="flex gap-1 text-crimson-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-white/60">
                &ldquo;{item.text}&rdquo;
              </p>
              <p className="mt-6 font-display text-lg text-rose-soft">{item.name}</p>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      {/* Contact CTA */}
      <section className="relative mx-auto max-w-7xl px-5 pb-28 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-wine-700/40 bg-gradient-to-br from-wine-900/50 via-ink-800 to-ink-800 px-8 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(229,9,20,0.28),transparent_70%)]" />
            <div className="relative">
              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                Kendinize bir <span className="text-gradient-rose">mola</span> hediye edin
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-white/55">
                Randevunuzu telefonla saniyeler içinde oluşturalım. Uygun saatler
                için hemen bize ulaşın.
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
                  href="/iletisim"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-white/85 transition-all hover:border-rose-soft/60 hover:text-white"
                >
                  <MapPin className="h-4 w-4" />
                  Yol Tarifi
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
