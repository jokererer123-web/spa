import type { Metadata, Viewport } from "next";
// Fonts are self-hosted so builds never depend on reaching fonts.googleapis.com
// and visitors get no third-party request. Both include latin-ext for Turkish
// glyphs (ç, ğ, ı, İ, ö, ş, ü).
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { BUSINESS } from "@/lib/demo-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://reinaspa.netlify.app"),
  title: {
    default: "Reina Spa | Ataşehir İstanbul Lüks Masaj & Wellness",
    template: "%s | Reina Spa",
  },
  description:
    "Reina Spa Ataşehir — medikal masaj, Bali masajı, sıcak taş terapisi ve hamam ritüelleri. Uzman terapistler eşliğinde lüks bir dinginlik deneyimi.",
  keywords: [
    "Reina Spa",
    "Ataşehir masaj",
    "İstanbul spa",
    "medikal masaj",
    "Bali masajı",
    "sıcak taş terapisi",
    "hamam",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "Reina Spa | Ataşehir İstanbul Lüks Masaj & Wellness",
    description:
      "Şehrin temposundan uzak, kişiye özel masaj ve wellness ritüelleri. Ataşehir / İstanbul.",
    siteName: "Reina Spa",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

/** LocalBusiness structured data for search results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DaySpa",
  name: BUSINESS.name,
  telephone: BUSINESS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Barbaros Mah. Al Zambak Sok. Varyap Meridian A Blok",
    addressLocality: "Ataşehir",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  openingHours: "Mo-Su 10:00-22:00",
  priceRange: "₺₺₺",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
