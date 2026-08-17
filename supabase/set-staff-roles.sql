-- ---------------------------------------------------------------------------
-- Reina Spa — personel hesaplarına rol verme
--
-- ÖNCE Supabase panelinden iki kullanıcı oluşturun:
--   Authentication → Users → Add user → "Create new user"
--   ( "Auto Confirm User" seçeneğini İŞARETLEYİN, yoksa giriş yapılamaz )
--
--   1) yonetici@reinaspa.com   → güçlü bir şifre
--   2) resepsiyon@reinaspa.com → güçlü bir şifre
--
-- SONRA bu dosyayı SQL Editor'de çalıştırın. Kullanıcı oluşturulurken
-- otomatik açılan profil kaydının rolünü 'client' yerine personel rolüne
-- yükseltir. Farklı e-posta kullandıysanız aşağıdaki adresleri değiştirin.
--
-- Bu betik tekrar tekrar çalıştırılabilir.
-- ---------------------------------------------------------------------------

-- Yönetici: her şeyi görür ve düzenler.
insert into public.profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', 'Yönetici'), 'admin'
from auth.users u
where u.email = 'yonetici@reinaspa.com'
on conflict (id) do update
  set role = 'admin';

-- Resepsiyon: yalnızca randevu ekranını kullanır.
insert into public.profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', 'Resepsiyon'), 'receptionist'
from auth.users u
where u.email = 'resepsiyon@reinaspa.com'
on conflict (id) do update
  set role = 'receptionist';

-- Kontrol: iki satır ve doğru roller görünmeli.
select u.email, p.full_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role in ('admin', 'receptionist')
order by p.role;
