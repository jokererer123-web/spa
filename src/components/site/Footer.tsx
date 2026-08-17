import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { BUSINESS } from "@/lib/demo-data";
import CopyrightYear from "./CopyrightYear";

const LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/galeri", label: "Galeri" },
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/paketler", label: "Paketler" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-ink-950/80">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-wine-700 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:px-8">
        <div>
          <span className="font-display text-2xl tracking-[0.22em] text-gradient-rose">
            REINA SPA
          </span>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
            Ataşehir&apos;in kalbinde, şehrin temposundan uzak bir dinginlik adası.
            Uzman terapistlerimiz ve kişiye özel ritüellerimizle bedeninizi ve
            zihninizi yeniliyoruz.
          </p>
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-crimson-500 hover:text-crimson-500"
            aria-label="Instagram"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
        </div>

        <nav>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-muted">
            Menü
          </h3>
          <ul className="mt-6 space-y-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/55 transition-colors hover:text-crimson-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-muted">
            İletişim
          </h3>
          <ul className="mt-6 space-y-4 text-sm text-white/55">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-wine-700" />
              <span className="leading-relaxed">{BUSINESS.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-wine-700" />
              <a href={BUSINESS.phoneHref} className="transition-colors hover:text-white">
                {BUSINESS.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-wine-700" />
              <span>{BUSINESS.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-white/35 sm:flex-row lg:px-8">
          <p>© <CopyrightYear /> Reina Spa. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-5">
            <Link href="/admin" className="transition-colors hover:text-white/70">
              Yönetim Paneli
            </Link>
            <Link href="/reception" className="transition-colors hover:text-white/70">
              Resepsiyon
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
