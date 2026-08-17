-- =============================================================================
-- Reina Spa — initial schema
-- =============================================================================
-- Tables, indexes, triggers and Row Level Security for the booking system.
-- Apply with:  supabase db push        (or paste into the SQL editor)
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----

do $$ begin
  create type user_role as enum ('admin', 'receptionist', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('confirmed', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_package_status as enum ('active', 'depleted', 'expired');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------- tables ----

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null,
  phone       text,
  role        user_role   not null default 'client',
  notes       text,
  created_at  timestamptz not null default now()
);

-- Guests are walk-ins managed by the desk and usually have no auth account,
-- so customers live in their own table rather than in profiles.
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text        not null,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.therapists (
  id             uuid primary key default gen_random_uuid(),
  name           text        not null,
  specialization text,
  active_status  boolean     not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  title_tr       text        not null,
  description_tr text,
  duration_min   integer     not null default 60 check (duration_min > 0),
  price          numeric(10, 2) not null default 0 check (price >= 0),
  image_url      text,
  is_featured    boolean     not null default false,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.packages (
  id             uuid primary key default gen_random_uuid(),
  name_tr        text        not null,
  description_tr text,
  total_sessions integer     not null check (total_sessions > 0),
  price          numeric(10, 2) not null default 0 check (price >= 0),
  is_featured    boolean     not null default false,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.customer_packages (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references public.customers (id) on delete cascade,
  package_id         uuid not null references public.packages (id) on delete restrict,
  remaining_sessions integer not null check (remaining_sessions >= 0),
  status             customer_package_status not null default 'active',
  purchased_at       timestamptz not null default now(),
  expires_at         timestamptz
);

create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.customers (id) on delete cascade,
  therapist_id        uuid references public.therapists (id) on delete set null,
  service_id          uuid references public.services (id) on delete set null,
  customer_package_id uuid references public.customer_packages (id) on delete set null,
  scheduled_at        timestamptz not null,
  status              booking_status not null default 'confirmed',
  package_deducted_at timestamptz,
  cancelled_at        timestamptz,
  refunded            boolean not null default false,
  notes               text,
  created_at          timestamptz not null default now()
);

create table if not exists public.offers (
  id             uuid primary key default gen_random_uuid(),
  title_tr       text not null,
  description_tr text,
  discount_label text not null,
  valid_until    date,
  highlight      boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'image' check (type in ('image', 'video')),
  src        text not null,
  title_tr   text not null,
  category   text not null default 'Mekan',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------- indexes ----

create index if not exists bookings_scheduled_at_idx  on public.bookings (scheduled_at desc);
create index if not exists bookings_customer_idx      on public.bookings (customer_id);
create index if not exists bookings_therapist_idx     on public.bookings (therapist_id);
create index if not exists bookings_status_idx        on public.bookings (status);
create index if not exists customer_packages_cust_idx on public.customer_packages (customer_id);

-- Powers the "Kritik Paket Seviyesi" list without scanning every package.
create index if not exists customer_packages_critical_idx
  on public.customer_packages (remaining_sessions)
  where status = 'active' and remaining_sessions <= 2;

-- ---------------------------------------------------- business constants ----

-- Kept as functions so the rule lives in exactly one place.
create or replace function public.free_cancellation_minutes()
returns integer language sql immutable as $$ select 30 $$;

create or replace function public.critical_session_threshold()
returns integer language sql immutable as $$ select 2 $$;

-- -------------------------------------------------------------- triggers ---

-- Auto-deduction: confirming a booking against a package consumes 1 session.
create or replace function public.deduct_package_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  available integer;
begin
  if new.customer_package_id is null or new.status <> 'confirmed' then
    return new;
  end if;

  -- Lock the row so two receptionists cannot spend the same last session.
  select remaining_sessions into available
  from public.customer_packages
  where id = new.customer_package_id
  for update;

  if available is null then
    raise exception 'Paket bulunamadı.';
  end if;

  if available <= 0 then
    raise exception 'Bu paketde kullanılabilir seans kalmadı.';
  end if;

  update public.customer_packages
  set remaining_sessions = remaining_sessions - 1,
      status = case when remaining_sessions - 1 <= 0 then 'depleted'::customer_package_status
                    else status end
  where id = new.customer_package_id;

  new.package_deducted_at := now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_deduct on public.bookings;
create trigger trg_bookings_deduct
  before insert on public.bookings
  for each row execute function public.deduct_package_session();

-- Cancellation policy: restore the session only when the booking is cancelled
-- at least 30 minutes before the appointment.
create or replace function public.handle_booking_cancellation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  minutes_remaining numeric;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' then
    return new;
  end if;

  new.cancelled_at := coalesce(new.cancelled_at, now());
  minutes_remaining := extract(epoch from (old.scheduled_at - now())) / 60;

  if old.package_deducted_at is not null
     and old.customer_package_id is not null
     and minutes_remaining >= public.free_cancellation_minutes()
  then
    update public.customer_packages
    set remaining_sessions = remaining_sessions + 1,
        status = case when status = 'depleted' then 'active'::customer_package_status
                      else status end
    where id = old.customer_package_id;

    new.refunded := true;
    new.package_deducted_at := null;
  else
    new.refunded := false;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_cancel on public.bookings;
create trigger trg_bookings_cancel
  before update of status on public.bookings
  for each row execute function public.handle_booking_cancellation();

-- ----------------------------------------------------------------- views ---

-- Guests whose remaining balance has hit the critical threshold.
create or replace view public.critical_packages as
select
  cp.id as customer_package_id,
  c.id  as customer_id,
  c.full_name,
  c.phone,
  p.name_tr as package_name,
  cp.remaining_sessions,
  p.total_sessions,
  cp.status
from public.customer_packages cp
join public.customers c on c.id = cp.customer_id
join public.packages  p on p.id = cp.package_id
where cp.status = 'active'
  and cp.remaining_sessions <= public.critical_session_threshold()
order by cp.remaining_sessions asc;

-- ------------------------------------------------------------------ RLS ----

alter table public.profiles          enable row level security;
alter table public.customers         enable row level security;
alter table public.therapists        enable row level security;
alter table public.services          enable row level security;
alter table public.packages          enable row level security;
alter table public.customer_packages enable row level security;
alter table public.bookings          enable row level security;
alter table public.offers            enable row level security;
alter table public.gallery_items     enable row level security;

-- Role helpers. SECURITY DEFINER avoids recursive RLS lookups on profiles.
create or replace function public.current_role_name()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() in ('admin', 'receptionist'), false)
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'admin', false)
$$;

-- Public marketing content is world-readable, writable by admins only.
do $$
declare
  t text;
begin
  foreach t in array array['services', 'packages', 'offers', 'gallery_items', 'therapists']
  loop
    execute format('drop policy if exists "%s_public_read" on public.%I', t, t);
    execute format(
      'create policy "%s_public_read" on public.%I for select using (true)', t, t);

    execute format('drop policy if exists "%s_admin_write" on public.%I', t, t);
    execute format(
      'create policy "%s_admin_write" on public.%I for all
         using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Operational data is staff-only.
drop policy if exists "customers_staff_all" on public.customers;
create policy "customers_staff_all" on public.customers
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "customer_packages_staff_all" on public.customer_packages;
create policy "customer_packages_staff_all" on public.customer_packages
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "bookings_staff_all" on public.bookings;
create policy "bookings_staff_all" on public.bookings
  for all using (public.is_staff()) with check (public.is_staff());

-- Profiles: read your own row; admins manage everyone.
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- New auth users get a client profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Misafir'),
    new.raw_user_meta_data ->> 'phone',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------- realtime ----

-- Lets the reception tablet update the moment a booking changes elsewhere.
do $$ begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.customer_packages;
exception when duplicate_object then null; end $$;
