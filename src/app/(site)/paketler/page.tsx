import type { Metadata } from "next";
import { CheckCircle2, HelpCircle } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import PackageCard from "@/components/site/PackageCard";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/demo-data";
import { getSiteContent } from "@/lib/site-content";

// Prerendered and refreshed every 5 minutes, so admin edits reach the public
// site without making every visit hit the database.
export const revalidate = 300;
import { CRITICAL_SESSION_THRESHOLD, FREE_CANCELLATION_MINUTES } from "@/lib/booking-rules";

export const metadata: Metadata = {
  title: "Paketler",
  description:
    "Reina Spa üyelik ve terapi paketleri. 4, 6, 8 ve 12 seanslık avantajlı masaj paketleri ve üyelik ayrıcalıkları.",
};

const FAQ = [
  {
    q: "Paket seansları nasıl kullanılır?",
    a: "Randevunuz onaylandığında paketinizden otomatik olarak 1 seans düşülür. Kalan seans sayınızı resepsiyondan öğrenebilir veya telefonla teyit edebilirsiniz.",
  },
  {
    q: "Randevumu iptal edersem seansım yanar mı?",
    a: `Randevu saatinize ${FREE_CANCELLATION_MINUTES} dakikadan fazla süre varken yapılan iptallerde seansınız paketinize otomatik olarak iade edilir. Son ${FREE_CANCELLATION_MINUTES} dakika içindeki iptallerde seans hakkı kullanılmış sayılır.`,
  },
  {
    q: "Paketimin bitmesine yakın haber alabilir miyim?",
    a: `Kalan seans sayınız ${CRITICAL_SESSION_THRESHOLD} ve altına düştüğünde sistemimiz sizi kritik seviye listesine alır ve resepsiyon ekibimiz yenileme için sizi bilgilendirir.`,
  },
  {
    q: "Paketimi başkasıyla paylaşabilir miyim?",
    a: "Romantik İkili paketi çiftler için tasarlanmıştır. Diğer paketlerde misafir davet hakkı yalnızca Reina Elite üyeliğinde bulunur.",
  },
  {
    q: "Paketlerin geçerlilik süresi var mı?",
    a: "Tüm paketlerimiz satın alma tarihinden itibaren 12 ay boyunca geçerlidir.",
  },
];

export default async function PackagesPage() {
  const { packages: PACKAGES } = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Paketler"
        title={
          <>
            Üyelik ve <span className="text-gradient-rose">terapi paketleri</span>
          </>
        }
        description="Düzenli bakım alışkanlığı kazanın, her seansta avantajlı fiyatlardan yararlanın."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </section>

      {/* Membership benefits */}
      <section className="border-y border-white/5 bg-ink-950/50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
              Ayrıcalıklar
            </span>
            <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">
              Üye olmanın <span className="text-gradient-rose">avantajları</span>
            </h2>
          </Reveal>

          <Reveal stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Seans başına %30'a varan indirim",
              "Öncelikli randevu ve tercih ettiğiniz terapist",
              "Otomatik seans takibi ve hatırlatma",
              "30 dakika öncesine kadar ücretsiz iptal",
              "Özel gün kampanyalarına erken erişim",
              "Ücretsiz hamam ve dinlenme alanı kullanımı",
            ].map((benefit) => (
              <RevealItem
                key={benefit}
                className="flex items-start gap-3 rounded-2xl border border-white/8 bg-ink-800/60 p-6"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-crimson-500" />
                <span className="text-sm leading-relaxed text-white/65">{benefit}</span>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-24 lg:px-8">
        <Reveal className="text-center">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
            SSS
          </span>
          <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">
            Sıkça sorulan <span className="text-gradient-rose">sorular</span>
          </h2>
        </Reveal>

        <Reveal stagger={0.07} className="mt-12 space-y-4">
          {FAQ.map((item) => (
            <RevealItem key={item.q}>
              <details className="group rounded-2xl border border-white/8 bg-ink-800/60 p-6 transition-colors open:border-wine-700/60 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start gap-3 font-display text-xl text-white">
                  <HelpCircle className="mt-1 h-4 w-4 shrink-0 text-crimson-500" />
                  <span className="flex-1">{item.q}</span>
                  <span className="mt-1 text-crimson-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 pl-7 text-sm leading-relaxed text-white/55">{item.a}</p>
              </details>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-12 text-center">
          <p className="text-sm text-white/45">
            Başka sorunuz mu var?{" "}
            <a href={BUSINESS.phoneHref} className="font-semibold text-crimson-500 hover:text-crimson-400">
              {BUSINESS.phone}
            </a>
          </p>
        </Reveal>
      </section>
    </>
  );
}
