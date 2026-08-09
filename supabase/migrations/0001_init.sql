-- ============================================================================
-- Chandpur Turf — Database schema, Row Level Security, RPC functions & seed data
-- Next.js 16 + Supabase (PostgreSQL). Run this in the Supabase SQL Editor
-- (or `supabase db push`) before starting the app.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- Slot definitions (source of truth for times, pricing, duration, category)
create table if not exists public.slots (
  id               text primary key,                       -- stable key, e.g. 'd-0500'
  category         text not null check (category in ('day', 'night')),
  start_time       time not null,                          -- e.g. '05:00:00'
  end_time         time not null,                          -- e.g. '06:30:00'
  price            numeric(10, 2) not null default 1500,
  duration_minutes integer not null default 90,
  sort_order       integer not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- One logical booking (customer + chosen time range + computed price)
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  booking_ref          text not null unique,
  customer_name        text not null,
  phone_number         text not null,
  whatsapp_number      text not null,
  team_name            text,
  notes                text,
  booking_date         date not null,
  slot_category        text not null check (slot_category in ('day', 'night')),
  start_time           time not null,
  end_time             time not null,
  selected_time_display text not null,                     -- e.g. '5:00 PM - 9:30 PM'
  slot_count           integer not null default 1,
  duration_minutes     integer not null,
  price                numeric(10, 2) not null,
  status               text not null default 'pending'
                       check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);

-- Junction: which concrete slots a booking occupies on a given date.
-- `is_released` frees a slot (e.g. when a booking is cancelled).
create table if not exists public.booking_slots (
  booking_id    uuid not null references public.bookings (id) on delete cascade,
  slot_id       text not null references public.slots (id),
  booking_date  date not null,
  is_released   boolean not null default false,
  created_at    timestamptz not null default now(),
  primary key (booking_id, slot_id, booking_date)
);

-- Database-level race-condition protection:
-- a slot/date may only be held by ONE active (non-released) booking at a time.
create unique index if not exists booking_slots_active_uq
  on public.booking_slots (slot_id, booking_date)
  where is_released = false;

-- Manually blocked slots (admin-only)
create table if not exists public.blocked_slots (
  id           uuid primary key default gen_random_uuid(),
  slot_id      text not null references public.slots (id),
  booking_date date not null,
  reason       text,
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (slot_id, booking_date)
);

-- Gallery images (metadata only; binary lives in Supabase Storage bucket "gallery-images")
create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  caption      text,
  category     text not null default 'match',
  image_url    text not null,          -- public storage URL or external URL
  storage_path text,                   -- storage object path (if uploaded)
  sort_order   integer not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Facilities shown on the public site
create table if not exists public.facilities (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  description text not null default '',
  icon        text not null default 'sports_soccer',   -- icon key, mapped in the app
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Business / site settings (key/value). `is_public` rows are readable by anon.
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  is_public  boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Admin role/profile registry. Referenced by RLS everywhere.
create table if not exists public.admin_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  display_name text,
  role         text not null default 'admin' check (role in ('admin', 'super_admin')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- True when the current (authenticated) user is an active admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.id = auth.uid() and a.is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.slots          enable row level security;
alter table public.bookings       enable row level security;
alter table public.booking_slots  enable row level security;
alter table public.blocked_slots  enable row level security;
alter table public.gallery_images enable row level security;
alter table public.facilities     enable row level security;
alter table public.site_settings  enable row level security;
alter table public.admin_users    enable row level security;

-- slots: everyone may read; only admins may write.
create policy slots_select_public on public.slots for select using (true);
create policy slots_admin_all on public.slots for all
  using (public.is_admin()) with check (public.is_admin());

-- bookings: no anon/authenticated read or write; admin only.
-- (Public booking creation goes through the SECURITY DEFINER RPC below.)
create policy bookings_admin_all on public.bookings for all
  using (public.is_admin()) with check (public.is_admin());

-- booking_slots: admin only.
create policy booking_slots_admin_all on public.booking_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- blocked_slots: admin only.
create policy blocked_slots_admin_all on public.blocked_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- gallery_images: public read only for visible rows; admin full.
create policy gallery_images_select_public on public.gallery_images
  for select using (is_visible = true);
create policy gallery_images_admin_all on public.gallery_images for all
  using (public.is_admin()) with check (public.is_admin());

-- facilities: public read only for active rows; admin full.
create policy facilities_select_public on public.facilities
  for select using (is_active = true);
create policy facilities_admin_all on public.facilities for all
  using (public.is_admin()) with check (public.is_admin());

-- site_settings: public read only for public keys; admin full.
create policy site_settings_select_public on public.site_settings
  for select using (is_public = true);
create policy site_settings_admin_all on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- admin_users: users may read their own row; admins may read the list.
create policy admin_users_select_self on public.admin_users
  for select using (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. PUBLIC AVAILABILITY (SECURITY DEFINER)
-- ---------------------------------------------------------------------------

create or replace function public.get_day_availability(p_date date)
returns table (slot_id text, status text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id as slot_id,
    case
      when b.slot_id is not null then 'booked'
      when bl.slot_id is not null then 'blocked'
      when p_date = (now() at time zone 'Asia/Dhaka')::date
           and s.start_time <= (now() at time zone 'Asia/Dhaka')::time
        then 'elapsed'
      else 'available'
    end as status
  from public.slots s
  left join (
    select bs.slot_id
    from public.booking_slots bs
    join public.bookings bk on bk.id = bs.booking_id
    where bs.booking_date = p_date
      and bs.is_released = false
      and bk.status in ('pending', 'confirmed')
  ) b on b.slot_id = s.id
  left join public.blocked_slots bl
    on bl.slot_id = s.id and bl.booking_date = p_date
  where s.is_active
  order by s.category, s.sort_order;
$$;

-- ---------------------------------------------------------------------------
-- 5. BOOKING CREATION (SECURITY DEFINER + transactional)
-- ---------------------------------------------------------------------------

create or replace function public.create_booking(
  p_customer_name   text,
  p_phone_number    text,
  p_whatsapp_number text,
  p_booking_date    date,
  p_slot_ids        text[],
  p_team_name       text default null,
  p_notes           text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id   uuid;
  v_booking_ref  text;
  v_category     public.slots.category%type;
  v_slot_count   integer;
  v_min_order    integer;
  v_max_order    integer;
  v_range_count  integer;
  v_start_time   time;
  v_end_time     time;
  v_duration     integer := 0;
  v_price        numeric(10, 2) := 0;
  v_current_date date;
  v_current_time time;
  v_selected_display text;
begin
  v_current_date := (now() at time zone 'Asia/Dhaka')::date;
  v_current_time := (now() at time zone 'Asia/Dhaka')::time;

  -- Guards ---------------------------------------------------------------
  if p_booking_date < v_current_date then
    raise exception 'PAST_DATE' using errcode = 'P0001';
  end if;

  if p_slot_ids is null or cardinality(p_slot_ids) = 0 then
    raise exception 'NO_SLOTS' using errcode = 'P0001';
  end if;

  if p_customer_name is null or btrim(p_customer_name) = '' then
    raise exception 'NAME_REQUIRED' using errcode = 'P0001';
  end if;

  -- All selected slots must exist, be active and share a single category.
  select s.category, count(*), sum(s.duration_minutes), sum(s.price),
         min(s.sort_order), max(s.sort_order)
  into v_category, v_slot_count, v_duration, v_price, v_min_order, v_max_order
  from public.slots s
  where s.id = any(p_slot_ids) and s.is_active
  group by s.category;

  if v_category is null or v_slot_count <> cardinality(p_slot_ids) then
    raise exception 'INVALID_SLOTS' using errcode = 'P0001';
  end if;

  -- Consecutiveness: the selected set must equal every active slot between
  -- the earliest and latest sort_order within the category (no gaps).
  select count(*) into v_range_count
  from public.slots
  where category = v_category
    and sort_order between v_min_order and v_max_order
    and is_active;

  if v_range_count <> v_slot_count then
    raise exception 'NON_CONSECUTIVE' using errcode = 'P0001';
  end if;

  select start_time into v_start_time
  from public.slots where id = any(p_slot_ids) and sort_order = v_min_order;
  select end_time into v_end_time
  from public.slots where id = any(p_slot_ids) and sort_order = v_max_order;

  -- A session may not be booked once it has already started.
  if p_booking_date = v_current_date and v_start_time <= v_current_time then
    raise exception 'PAST_TIME' using errcode = 'P0001';
  end if;

  -- Unique booking reference -------------------------------------------------
  loop
    v_booking_ref := 'CT-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.bookings where booking_ref = v_booking_ref);
  end loop;

  -- Persist -------------------------------------------------------------
  insert into public.bookings (
    booking_ref, customer_name, phone_number, whatsapp_number, team_name, notes,
    booking_date, slot_category, start_time, end_time, selected_time_display,
    slot_count, duration_minutes, price, status
  ) values (
    v_booking_ref, btrim(p_customer_name), btrim(p_phone_number), btrim(p_whatsapp_number),
    nullif(btrim(coalesce(p_team_name, '')), ''), nullif(btrim(coalesce(p_notes, '')), ''),
    p_booking_date, v_category, v_start_time, v_end_time, '',
    v_slot_count, v_duration, v_price, 'pending'
  ) returning id into v_booking_id;

  -- Claim the slots. The partial unique index is the real anti-double-booking
  -- guard: a concurrent identical insert will raise a unique violation here.
  begin
    insert into public.booking_slots (booking_id, slot_id, booking_date, is_released)
    select v_booking_id, s.id, p_booking_date, false
    from public.slots s
    where s.id = any(p_slot_ids);
  exception when unique_violation then
    delete from public.bookings where id = v_booking_id;
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end;

  return jsonb_build_object(
    'id', v_booking_id,
    'booking_ref', v_booking_ref,
    'booking_date', p_booking_date,
    'slot_category', v_category,
    'start_time', to_char(v_start_time, 'HH24:MI'),
    'end_time', to_char(v_end_time, 'HH24:MI'),
    'slot_count', v_slot_count,
    'duration_minutes', v_duration,
    'price', v_price,
    'status', 'pending'
  );
end;
$$;

-- Keep selected_time_display / updated_at in sync via trigger.
create or replace function public.sync_booking_display()
returns trigger
language plpgsql
as $$
begin
  new.selected_time_display := format(
    '%s - %s',
    to_char(new.start_time, 'FMHH12:MI AM'),
    to_char(new.end_time, 'FMHH12:MI AM')
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_sync_display_trg on public.bookings;
create trigger bookings_sync_display_trg
  before insert or update on public.bookings
  for each row execute function public.sync_booking_display();

-- Releasing slots when a booking is cancelled (frees the slot for others).
create or replace function public.release_slots_on_cancel()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.booking_slots
    set is_released = true
    where booking_id = old.id and is_released = false;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_release_on_cancel_trg on public.bookings;
create trigger bookings_release_on_cancel_trg
  before update on public.bookings
  for each row execute function public.release_slots_on_cancel();

-- ---------------------------------------------------------------------------
-- 6. ADMIN PROMOTION (explicit, secure)
-- ---------------------------------------------------------------------------

-- Promotes an existing Auth user to admin. Allowed when run by the postgres
-- role (SQL Editor / migration) or by a current admin. No public signup path.
create or replace function public.promote_admin(
  p_email       text,
  p_role        text default 'admin'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if current_user <> 'postgres'
     and (auth.uid() is null or not public.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(btrim(p_email));

  if v_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  insert into public.admin_users (id, email, role, is_active)
  values (v_user_id, btrim(p_email), p_role, true)
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role,
        is_active = true;
end;
$$;

-- Revoke promotion from anon entirely; keep it only for authenticated admins
-- (the function itself enforces the "must be an admin" rule). The function is
-- catalogued under its full signature (text, text) because p_role has a default.
revoke all on function public.promote_admin(text, text) from anon, public;
grant execute on function public.promote_admin(text, text) to authenticated;

revoke all on function public.promote_admin(text, text) from anon, public;
grant execute on function public.promote_admin(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. STORAGE (gallery bucket)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

-- Public read of gallery images.
drop policy if exists gallery_images_public_read on storage.objects;
create policy gallery_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery-images');

-- Admin write/delete in the gallery bucket.
drop policy if exists gallery_images_admin_write on storage.objects;
create policy gallery_images_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'gallery-images' and public.is_admin())
  with check (bucket_id = 'gallery-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. SEED DATA
-- ---------------------------------------------------------------------------

-- Slots ----------------------------------------------------------------------
insert into public.slots (id, category, start_time, end_time, price, duration_minutes, sort_order)
values
  ('d-0500', 'day',   '05:00:00', '06:30:00', 1500, 90, 1),
  ('d-0630', 'day',   '06:30:00', '08:00:00', 1500, 90, 2),
  ('d-0800', 'day',   '08:00:00', '09:30:00', 1500, 90, 3),
  ('d-0930', 'day',   '09:30:00', '11:00:00', 1500, 90, 4),
  ('d-1100', 'day',   '11:00:00', '12:30:00', 1500, 90, 5),
  ('d-1230', 'day',   '12:30:00', '14:00:00', 1500, 90, 6),
  ('d-1400', 'day',   '14:00:00', '15:30:00', 1500, 90, 7),
  ('d-1530', 'day',   '15:30:00', '17:00:00', 1500, 90, 8),
  ('n-1700', 'night', '17:00:00', '18:30:00', 2000, 90, 1),
  ('n-1830', 'night', '18:30:00', '20:00:00', 2000, 90, 2),
  ('n-2000', 'night', '20:00:00', '21:30:00', 2000, 90, 3),
  ('n-2130', 'night', '21:30:00', '23:00:00', 2000, 90, 4),
  ('n-2300', 'night', '23:00:00', '00:30:00', 2000, 90, 5),
  ('n-0030', 'night', '00:30:00', '02:00:00', 2000, 90, 6),
  ('n-0200', 'night', '02:00:00', '03:30:00', 2000, 90, 7)
on conflict (id) do nothing;

-- Facilities -----------------------------------------------------------------
insert into public.facilities (label, description, icon, sort_order)
values
  ('FIFA Quality Pro Turf', 'International standard 47mm artificial football surface.', 'sprout', 1),
  ('High-Power LED Floodlights', 'Crystal-clear floodlights for day and night play.', 'lightbulb', 2),
  ('Premium Match Footballs', 'Top-quality footballs available for every session.', 'volleyball', 3),
  ('Professional Goalposts & Nets', 'Full-size goalposts, gloves, and nets included.', 'goal', 4),
  ('Training Kit & Equipment', 'Complete training kit and match equipment on site.', 'shirt', 5),
  ('Spacious Changing Room', 'Clean, private changing facilities for players.', 'door_open', 6),
  ('Washroom Facility', 'Modern, hygienic washrooms at your convenience.', 'bath', 7),
  ('Pure Drinking Water', 'Free purified drinking water available all day.', 'glass_water', 8),
  ('Player & Spectator Seating', 'Comfortable seating for players and spectators.', 'armchair', 9),
  ('Secure Parking Facility', 'Ample, secure parking right next to the turf.', 'car_front', 10),
  ('24/7 CCTV Surveillance', 'Fully monitored premises for total security.', 'cctv', 11),
  ('Safe & Clean Environment', 'A safe, well-maintained space to play.', 'shield_check', 12),
  ('Night Match Facility', 'Late-night matches under brilliant floodlights.', 'moon', 13),
  ('Free Wi-Fi', 'Stay connected with complimentary high-speed Wi-Fi.', 'wifi', 14),
  ('Tournament & League Hosting', 'Professional hosting for tournaments and leagues.', 'trophy', 15),
  ('Corporate & Friendly Events', 'Friendly matches and corporate event bookings.', 'handshake', 16),
  ('Birthday Parties & Private Booking', 'Celebrate with private turf bookings and parties.', 'cake', 17),
  ('Football Training Sessions', 'Structured training sessions for all skill levels.', 'footprints', 18),
  ('First Aid Kit Available', 'On-site first aid kit for complete player safety.', 'cross', 19),
  ('Easy-to-Reach Prime Location', 'Conveniently located in the heart of Chandpur.', 'map_pin', 20),
  ('Online & Phone Booking', 'Book instantly online or by a simple phone call.', 'phone', 21)
on conflict (id) do nothing;

-- Site settings ---------------------------------------------------------------
insert into public.site_settings (key, value, is_public)
values
  ('phone',                '01777-240317', true),
  ('whatsapp',             '01856-822363', true),
  ('booking_whatsapp',     '01974172403', true),
  ('booking_whatsapp_international', '8801974172403', true),
  ('location',             'Foridganj-Mission Bypass Road, Chandpur Sadar, Chandpur', true),
  ('address_short',        'Foridganj-Mission Bypass Road, Chandpur Sadar', true),
  ('map_query',            'Foridganj-Mission Bypass Road Chandpur Sadar Bangladesh', true),
  ('facebook',             'Chandpur Turf', true),
  ('facebook_url',         'https://facebook.com', true),
  ('instagram',            'chandpur.turf', true),
  ('instagram_url',        'https://instagram.com', true),
  ('hours',                '5:00 AM - 3:30 AM', true),
  ('turf_name',            'CHANDPUR TURF', true)
on conflict (key) do nothing;

-- Gallery images (seeded from the existing public gallery; admin can replace).
insert into public.gallery_images (title, caption, category, image_url, sort_order)
values
  ('Football Match', 'Competitive 90-minute football matches played with passion and intensity.', 'match',
   'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1200&auto=format&fit=crop', 1),
  ('Artificial Turf', '47mm high-density FIFA Quality Pro artificial turf ready for play.', 'turf',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200&auto=format&fit=crop', 2),
  ('Night Match', 'Late-night matches under shadowless stadium floodlighting.', 'night',
   'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1200&auto=format&fit=crop', 3),
  ('Stadium Lights', 'High-power LED light towers glowing above the pitch.', 'lights',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop', 4),
  ('Team Celebration', 'Teams celebrating hard-fought victories on the turf.', 'celebration',
   'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop', 5),
  ('Training Session', 'Dedicated training sessions to sharpen skills and teamwork.', 'training',
   'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1200&auto=format&fit=crop', 6),
  ('Goal Post', 'Professional goalposts and nets for every match.', 'goal',
   'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop', 7),
  ('Players in Action', 'Explosive action shots from matches under the lights.', 'action',
   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop', 8)
on conflict (id) do nothing;
