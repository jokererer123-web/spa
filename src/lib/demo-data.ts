import type {
  Booking,
  CustomerPackage,
  GalleryItem,
  Offer,
  Package,
  Profile,
  Service,
  Therapist,
} from "./types";

/* ------------------------------------------------------------------ brand */

export const BUSINESS = {
  name: "Reina Spa",
  tagline: "Istanbul'un kalbinde lüks masaj ve wellness deneyimi",
  phone: "0 (549) 649 20 81",
  phoneHref: "tel:+905496492081",
  whatsappHref: "https://wa.me/905496492081",
  address:
    "Barbaros Mah. Al Zambak Sok. Varyap Meridian A Blok Ataşehir / İstanbul",
  shortAddress: "Varyap Meridian A Blok, Ataşehir / İstanbul",
  mapsQuery: "Varyap+Meridian+A+Blok+Barbaros+Mah+Ataşehir+İstanbul",
  hours: "Her gün 10:00 – 22:00",
  instagram: "https://instagram.com",
} as const;

/* --------------------------------------------------------------- content */

export const SERVICES: Service[] = [
  {
    id: "svc-medikal",
    title_tr: "Medikal Masaj",
    description_tr:
      "Kas ve eklem ağrılarına yönelik, uzman terapistlerimiz tarafından uygulanan derin doku tekniği. Boyun, sırt ve bel bölgesindeki gerginliği çözer.",
    duration_min: 60,
    price: 2500,
    is_featured: true,
    sort_order: 1,
  },
  {
    id: "svc-bali",
    title_tr: "Bali Masajı",
    description_tr:
      "Uzak Doğu'nun asırlık ritüeli. Aromatik yağlar ve akıcı hareketlerle bedeni ve zihni derin bir dinginliğe taşır.",
    duration_min: 75,
    price: 3200,
    is_featured: true,
    sort_order: 2,
  },
  {
    id: "svc-sicaktas",
    title_tr: "Sıcak Taş Terapisi",
    description_tr:
      "Volkanik bazalt taşların yumuşak sıcaklığı kasları gevşetir, kan dolaşımını hızlandırır ve stresi tamamen boşaltır.",
    duration_min: 80,
    price: 3600,
    is_featured: true,
    sort_order: 3,
  },
  {
    id: "svc-aroma",
    title_tr: "Aromaterapi Masajı",
    description_tr:
      "Kişiye özel seçilen esansiyel yağlarla uygulanan, duyuları uyandıran rahatlatıcı masaj deneyimi.",
    duration_min: 60,
    price: 2800,
    sort_order: 4,
  },
  {
    id: "svc-hamam",
    title_tr: "Geleneksel Türk Hamamı",
    description_tr:
      "Kese, köpük masajı ve sıcak mermer ritüeliyle klasik hamam kültürünün en zarif yorumu.",
    duration_min: 90,
    price: 3400,
    sort_order: 5,
  },
  {
    id: "svc-cift",
    title_tr: "Çift Masajı",
    description_tr:
      "Özel süitte, mum ışığı eşliğinde iki kişilik romantik masaj seansı. Şampanya ikramı dahildir.",
    duration_min: 90,
    price: 6500,
    is_featured: true,
    sort_order: 6,
  },
  {
    id: "svc-refleks",
    title_tr: "Refleksoloji",
    description_tr:
      "Ayak tabanındaki refleks noktalarına uygulanan basınçla tüm bedende enerji dengesi sağlar.",
    duration_min: 45,
    price: 1900,
    sort_order: 7,
  },
  {
    id: "svc-anticellulite",
    title_tr: "Selülit Karşıtı Masaj",
    description_tr:
      "Lenf drenajı ve özel manuel tekniklerle vücut şekillendirmeye destek olan yoğunlaştırılmış program.",
    duration_min: 50,
    price: 2400,
    sort_order: 8,
  },
];

export const PACKAGES: Package[] = [
  {
    id: "pkg-baslangic",
    name_tr: "Dinginlik Paketi",
    description_tr:
      "Reina Spa'yı keşfetmek için ideal başlangıç. 4 seans klasik masaj ve karşılama ritüeli.",
    total_sessions: 4,
    price: 8900,
    sort_order: 1,
  },
  {
    id: "pkg-prestij",
    name_tr: "Prestij Üyelik",
    description_tr:
      "En çok tercih edilen üyeliğimiz. 8 seans dilediğiniz masaj türü, öncelikli randevu hakkı ve hamam kullanımı.",
    total_sessions: 8,
    price: 16500,
    is_featured: true,
    sort_order: 2,
  },
  {
    id: "pkg-reina",
    name_tr: "Reina Elite",
    description_tr:
      "12 seans sınırsız tür seçimi, özel terapist tahsisi, süit kullanımı ve kişiye özel bakım programı.",
    total_sessions: 12,
    price: 23900,
    sort_order: 3,
  },
  {
    id: "pkg-cift",
    name_tr: "Romantik İkili",
    description_tr:
      "Çiftlere özel 6 seans, her seansta iki kişilik süit, mum ışığı ve ikramlar dahil.",
    total_sessions: 6,
    price: 19500,
    sort_order: 4,
  },
];

export const OFFERS: Offer[] = [
  {
    id: "off-hafta",
    title_tr: "Hafta İçi Kaçamağı",
    description_tr:
      "Pazartesi–Perşembe 10:00–15:00 arası tüm masaj türlerinde geçerli özel indirim.",
    discount_label: "%25 İndirim",
    valid_until: "2026-12-31",
    highlight: true,
  },
  {
    id: "off-cift",
    title_tr: "Çiftlere Özel Gece",
    description_tr:
      "Çift masajı alan misafirlerimize sıcak taş terapisi ve şampanya ikramı hediye.",
    discount_label: "Hediye Terapi",
    valid_until: "2026-10-30",
  },
  {
    id: "off-ilk",
    title_tr: "İlk Ziyaret Ayrıcalığı",
    description_tr:
      "Reina Spa'ya ilk kez gelen misafirlerimiz için refleksoloji seansı ücretsiz.",
    discount_label: "Ücretsiz Seans",
    valid_until: null,
  },
  {
    id: "off-paket",
    title_tr: "Üyelik Avantajı",
    description_tr:
      "Prestij Üyelik alan misafirlerimize 2 seans ekstra ve ücretsiz hamam kullanımı.",
    discount_label: "+2 Seans",
    valid_until: "2026-11-15",
    highlight: true,
  },
];

/** Gallery entries are rendered from the generated hero sequence + CSS art. */
export const GALLERY: GalleryItem[] = [
  { id: "g1", type: "image", src: "/hero/frame-01.jpg", title_tr: "Karşılama Ritüeli", category: "Mekan" },
  { id: "g2", type: "image", src: "/hero/frame-03.jpg", title_tr: "Derin Doku Masajı", category: "Masaj" },
  { id: "g3", type: "image", src: "/hero/frame-05.jpg", title_tr: "Uzman Dokunuş", category: "Masaj" },
  { id: "g4", type: "image", src: "/hero/frame-07.jpg", title_tr: "Tam Vücut Terapisi", category: "Masaj" },
  { id: "g5", type: "image", src: "/hero/frame-02.jpg", title_tr: "Mum Işığı Seansı", category: "Atmosfer" },
  { id: "g6", type: "image", src: "/hero/frame-06.jpg", title_tr: "Aromaterapi Anı", category: "Atmosfer" },
];

/* ------------------------------------------------------------ operations */

export const THERAPISTS: Therapist[] = [
  { id: "th-1", name: "Elif Yıldız", specialization: "Medikal & Derin Doku", active_status: true },
  { id: "th-2", name: "Selin Aksoy", specialization: "Bali & Aromaterapi", active_status: true },
  { id: "th-3", name: "Deniz Kaya", specialization: "Sıcak Taş & Refleksoloji", active_status: true },
  { id: "th-4", name: "Melis Arda", specialization: "Hamam & Kese Ritüeli", active_status: true },
  { id: "th-5", name: "Buse Demir", specialization: "Selülit & Lenf Drenajı", active_status: false },
];

export const CUSTOMERS: Profile[] = [
  { id: "c-1", full_name: "Ayşe Korkmaz", phone: "0532 118 44 21", role: "client", created_at: "2026-02-11T09:00:00Z" },
  { id: "c-2", full_name: "Mehmet Şahin", phone: "0533 902 77 08", role: "client", created_at: "2026-03-02T09:00:00Z" },
  { id: "c-3", full_name: "Zeynep Aydın", phone: "0555 340 12 66", role: "client", created_at: "2026-01-19T09:00:00Z" },
  { id: "c-4", full_name: "Can Öztürk", phone: "0542 771 90 33", role: "client", created_at: "2026-04-06T09:00:00Z" },
  { id: "c-5", full_name: "Elif Demirtaş", phone: "0536 214 58 90", role: "client", created_at: "2026-05-21T09:00:00Z" },
  { id: "c-6", full_name: "Burak Yalçın", phone: "0538 664 30 12", role: "client", created_at: "2026-06-14T09:00:00Z" },
  { id: "c-7", full_name: "Selin Kurt", phone: "0505 887 21 45", role: "client", created_at: "2026-07-02T09:00:00Z" },
  { id: "c-8", full_name: "Ahmet Polat", phone: "0544 190 66 74", role: "client", created_at: "2026-07-28T09:00:00Z" },
];

export const STAFF: Profile[] = [
  { id: "u-admin", full_name: "Reina Spa Yönetim", phone: BUSINESS.phone, role: "admin", created_at: "2026-01-01T09:00:00Z" },
  { id: "u-resepsiyon", full_name: "Resepsiyon", phone: BUSINESS.phone, role: "receptionist", created_at: "2026-01-01T09:00:00Z" },
];

export const CUSTOMER_PACKAGES: CustomerPackage[] = [
  { id: "cp-1", customer_id: "c-1", package_id: "pkg-prestij", remaining_sessions: 2, status: "active", purchased_at: "2026-06-01T10:00:00Z" },
  { id: "cp-2", customer_id: "c-2", package_id: "pkg-baslangic", remaining_sessions: 1, status: "active", purchased_at: "2026-07-12T10:00:00Z" },
  { id: "cp-3", customer_id: "c-3", package_id: "pkg-reina", remaining_sessions: 9, status: "active", purchased_at: "2026-05-04T10:00:00Z" },
  { id: "cp-4", customer_id: "c-4", package_id: "pkg-cift", remaining_sessions: 4, status: "active", purchased_at: "2026-06-22T10:00:00Z" },
  { id: "cp-5", customer_id: "c-5", package_id: "pkg-prestij", remaining_sessions: 2, status: "active", purchased_at: "2026-07-30T10:00:00Z" },
  { id: "cp-6", customer_id: "c-6", package_id: "pkg-baslangic", remaining_sessions: 3, status: "active", purchased_at: "2026-08-01T10:00:00Z" },
  { id: "cp-7", customer_id: "c-7", package_id: "pkg-reina", remaining_sessions: 11, status: "active", purchased_at: "2026-08-05T10:00:00Z" },
  { id: "cp-8", customer_id: "c-8", package_id: "pkg-prestij", remaining_sessions: 0, status: "depleted", purchased_at: "2026-04-18T10:00:00Z" },
];

/**
 * Bookings are generated relative to "today" so the reception board always
 * shows a believable day, including a slot inside the 30-minute window.
 */
export function seedBookings(now: Date = new Date()): Booking[] {
  const day = (h: number, m = 0, offsetDays = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const soon = new Date(now.getTime() + 18 * 60_000).toISOString(); // inside 30 dk
  const later = new Date(now.getTime() + 3 * 60 * 60_000).toISOString();

  return [
    {
      id: "bk-1", customer_id: "c-1", therapist_id: "th-1", service_id: "svc-medikal",
      customer_package_id: "cp-1", scheduled_at: day(10, 30), status: "completed",
      package_deducted_at: day(10, 30), refunded: false, created_at: day(9, 0, -1),
    },
    {
      id: "bk-2", customer_id: "c-3", therapist_id: "th-2", service_id: "svc-bali",
      customer_package_id: "cp-3", scheduled_at: day(12, 0), status: "completed",
      package_deducted_at: day(12, 0), refunded: false, created_at: day(9, 0, -1),
    },
    {
      id: "bk-3", customer_id: "c-5", therapist_id: "th-3", service_id: "svc-sicaktas",
      customer_package_id: "cp-5", scheduled_at: soon, status: "confirmed",
      package_deducted_at: day(9, 0), refunded: false, created_at: day(9, 0),
      notes: "Misafir sıcak taş yoğunluğunun düşük olmasını istiyor.",
    },
    {
      id: "bk-4", customer_id: "c-4", therapist_id: "th-4", service_id: "svc-hamam",
      customer_package_id: "cp-4", scheduled_at: later, status: "confirmed",
      package_deducted_at: day(9, 30), refunded: false, created_at: day(9, 30),
    },
    {
      id: "bk-5", customer_id: "c-2", therapist_id: "th-1", service_id: "svc-aroma",
      customer_package_id: "cp-2", scheduled_at: day(19, 30), status: "confirmed",
      package_deducted_at: day(10, 0), refunded: false, created_at: day(10, 0),
    },
    {
      id: "bk-6", customer_id: "c-7", therapist_id: "th-2", service_id: "svc-cift",
      customer_package_id: "cp-7", scheduled_at: day(20, 30), status: "confirmed",
      package_deducted_at: day(10, 15), refunded: false, created_at: day(10, 15),
      notes: "Yıldönümü — süit mum ışığı hazırlansın.",
    },
    {
      id: "bk-7", customer_id: "c-6", therapist_id: "th-3", service_id: "svc-refleks",
      customer_package_id: "cp-6", scheduled_at: day(16, 0), status: "cancelled",
      package_deducted_at: null, cancelled_at: day(11, 0), refunded: true, created_at: day(9, 45),
    },
    {
      id: "bk-8", customer_id: "c-8", therapist_id: "th-4", service_id: "svc-medikal",
      customer_package_id: null, scheduled_at: day(11, 0, 1), status: "confirmed",
      package_deducted_at: null, refunded: false, created_at: day(12, 0),
      notes: "Paketi bitti — nakit ödeme.",
    },
  ];
}
