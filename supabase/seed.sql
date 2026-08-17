-- =============================================================================
-- Reina Spa — seed data (Turkish content matching the public site)
-- Apply after the migration:  supabase db reset   /   psql -f supabase/seed.sql
-- =============================================================================

-- --------------------------------------------------------------- services --

insert into public.services (title_tr, description_tr, duration_min, price, is_featured, sort_order)
values
  ('Medikal Masaj',            'Kas ve eklem ağrılarına yönelik, uzman terapistlerimiz tarafından uygulanan derin doku tekniği.', 60, 2500, true,  1),
  ('Bali Masajı',              'Uzak Doğu''nun asırlık ritüeli. Aromatik yağlar ve akıcı hareketlerle bedeni ve zihni dinginliğe taşır.', 75, 3200, true,  2),
  ('Sıcak Taş Terapisi',       'Volkanik bazalt taşların yumuşak sıcaklığı kasları gevşetir ve stresi boşaltır.', 80, 3600, true,  3),
  ('Aromaterapi Masajı',       'Kişiye özel seçilen esansiyel yağlarla uygulanan rahatlatıcı masaj deneyimi.', 60, 2800, false, 4),
  ('Geleneksel Türk Hamamı',   'Kese, köpük masajı ve sıcak mermer ritüeliyle klasik hamam kültürünün zarif yorumu.', 90, 3400, false, 5),
  ('Çift Masajı',              'Özel süitte, mum ışığı eşliğinde iki kişilik romantik masaj seansı.', 90, 6500, true,  6),
  ('Refleksoloji',             'Ayak tabanındaki refleks noktalarına uygulanan basınçla enerji dengesi sağlar.', 45, 1900, false, 7),
  ('Selülit Karşıtı Masaj',    'Lenf drenajı ve manuel tekniklerle vücut şekillendirmeye destek olan program.', 50, 2400, false, 8)
on conflict do nothing;

-- --------------------------------------------------------------- packages --

insert into public.packages (name_tr, description_tr, total_sessions, price, is_featured, sort_order)
values
  ('Dinginlik Paketi', 'Reina Spa''yı keşfetmek için ideal başlangıç.',                     4,  8900, false, 1),
  ('Prestij Üyelik',   'En çok tercih edilen üyeliğimiz; öncelikli randevu ve hamam dahil.', 8, 16500, true,  2),
  ('Reina Elite',      '12 seans sınırsız tür seçimi, özel terapist tahsisi ve süit.',      12, 23900, false, 3),
  ('Romantik İkili',   'Çiftlere özel 6 seans, iki kişilik süit ve ikramlar dahil.',         6, 19500, false, 4)
on conflict do nothing;

-- ------------------------------------------------------------- therapists --

insert into public.therapists (name, specialization, active_status)
values
  ('Elif Yıldız',  'Medikal & Derin Doku',      true),
  ('Selin Aksoy',  'Bali & Aromaterapi',        true),
  ('Deniz Kaya',   'Sıcak Taş & Refleksoloji',  true),
  ('Melis Arda',   'Hamam & Kese Ritüeli',      true),
  ('Buse Demir',   'Selülit & Lenf Drenajı',    false)
on conflict do nothing;

-- ----------------------------------------------------------------- offers --

insert into public.offers (title_tr, description_tr, discount_label, valid_until, highlight)
values
  ('Hafta İçi Kaçamağı',      'Pazartesi–Perşembe 10:00–15:00 arası tüm masaj türlerinde geçerli.', '%25 İndirim',     '2026-12-31', true),
  ('Çiftlere Özel Gece',      'Çift masajı alan misafirlere sıcak taş terapisi ve şampanya hediye.', 'Hediye Terapi',   '2026-10-30', false),
  ('İlk Ziyaret Ayrıcalığı',  'İlk kez gelen misafirlerimiz için refleksoloji seansı ücretsiz.',     'Ücretsiz Seans',   null,        false),
  ('Üyelik Avantajı',         'Prestij Üyelik alanlara 2 seans ekstra ve ücretsiz hamam kullanımı.', '+2 Seans',        '2026-11-15', true)
on conflict do nothing;

-- ---------------------------------------------------------------- gallery --

insert into public.gallery_items (type, src, title_tr, category, sort_order)
values
  ('image', '/hero/frame-01.jpg', 'Karşılama Ritüeli',   'Mekan',    1),
  ('image', '/hero/frame-03.jpg', 'Derin Doku Masajı',   'Masaj',    2),
  ('image', '/hero/frame-05.jpg', 'Uzman Dokunuş',       'Masaj',    3),
  ('image', '/hero/frame-07.jpg', 'Tam Vücut Terapisi',  'Masaj',    4),
  ('image', '/hero/frame-02.jpg', 'Mum Işığı Seansı',    'Atmosfer', 5),
  ('image', '/hero/frame-06.jpg', 'Aromaterapi Anı',     'Atmosfer', 6)
on conflict do nothing;

-- -------------------------------------------------------------- customers --

insert into public.customers (full_name, phone)
values
  ('Ayşe Korkmaz',   '0532 118 44 21'),
  ('Mehmet Şahin',   '0533 902 77 08'),
  ('Zeynep Aydın',   '0555 340 12 66'),
  ('Can Öztürk',     '0542 771 90 33'),
  ('Elif Demirtaş',  '0536 214 58 90'),
  ('Burak Yalçın',   '0538 664 30 12'),
  ('Selin Kurt',     '0505 887 21 45'),
  ('Ahmet Polat',    '0544 190 66 74')
on conflict do nothing;

-- Give each seeded guest a package; two of them land in the critical list.
insert into public.customer_packages (customer_id, package_id, remaining_sessions, status)
select c.id, p.id, v.remaining, 'active'::customer_package_status
from (values
  ('Ayşe Korkmaz',  'Prestij Üyelik',   2),
  ('Mehmet Şahin',  'Dinginlik Paketi', 1),
  ('Zeynep Aydın',  'Reina Elite',      9),
  ('Can Öztürk',    'Romantik İkili',   4),
  ('Elif Demirtaş', 'Prestij Üyelik',   2),
  ('Burak Yalçın',  'Dinginlik Paketi', 3),
  ('Selin Kurt',    'Reina Elite',     11)
) as v(customer_name, package_name, remaining)
join public.customers c on c.full_name = v.customer_name
join public.packages  p on p.name_tr   = v.package_name
on conflict do nothing;
