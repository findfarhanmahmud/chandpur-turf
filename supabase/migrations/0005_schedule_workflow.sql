-- ---------------------------------------------------------------------------
-- 0005_schedule_workflow.sql
--
-- Aligns the booking engine with the Chandpur Turf manual-payment workflow:
--
--   customer request (PENDING) -> WhatsApp negotiation -> payment verified
--   -> admin CONFIRM & BLOCK -> slots become permanently locked.
--
-- Key changes:
--   1. PENDING bookings no longer reserve slots. A pending request is a
--      request, not a hold. Its `booking_slots` rows are stored with
--      is_released = true so they never participate in the anti-double-booking
--      unique index and never show as unavailable to other customers.
--   2. get_day_availability() now reports a slot as booked ONLY when a
--      CONFIRMED booking holds it (is_released = false).
--   3. New SECURITY DEFINER RPC confirm_booking(uuid) atomically confirms a
--      pending booking and locks all of its underlying slots. The partial
--      unique index on booking_slots is the race-condition backstop: two
--      admins confirming overlapping bookings cannot both succeed.
--   4. New SECURITY DEFINER RPC create_manual_booking(...) lets an admin
--      create a CONFIRMED booking directly (BOOK & LOCK) with the same
--      transactional slot-locking guarantees.
--   5. Existing pending bookings created under the old behaviour have their
--      slot holds released so they match the new semantics.
-- ---------------------------------------------------------------------------

-- 1. Release holds left by legacy PENDING bookings (old behaviour locked them).
update public.booking_slots bs
set is_released = true
where bs.booking_id in (
  select id from public.bookings where status = 'pending'
);

-- 2. Availability: only CONFIRMED bookings hold a slot.
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
      and bk.status = 'confirmed'
  ) b on b.slot_id = s.id
  left join public.blocked_slots bl
    on bl.slot_id = s.id and bl.booking_date = p_date
  where s.is_active
  order by s.category, s.sort_order;
$$;

-- 3. create_booking: pending requests keep a record of the requested slots but
-- do NOT lock them (is_released = true). Multiple customers may request the
-- same time; only a confirmed booking locks it.
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

  -- Record the requested slots as is_released = true. The partial unique
  -- index (is_released = false) is skipped, so a pending request never
  -- blocks the slot; only confirm_booking / create_manual_booking lock it.
  begin
    insert into public.booking_slots (booking_id, slot_id, booking_date, is_released)
    select v_booking_id, s.id, p_booking_date, true
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

-- 4. confirm_booking: atomically transitions a pending booking to confirmed
-- and locks all of its underlying slots. The partial unique index
-- (slot_id, booking_date) WHERE is_released = false guarantees that two
-- overlapping confirms cannot both succeed even when executed concurrently.
create or replace function public.confirm_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking       public.bookings%rowtype;
  v_current_date  date;
  v_current_time  time;
  v_locked        integer;
  v_slot_start    time;
begin
  v_current_date := (now() at time zone 'Asia/Dhaka')::date;
  v_current_time := (now() at time zone 'Asia/Dhaka')::time;

  select * into v_booking from public.bookings where id = p_booking_id;

  if v_booking.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_booking.status <> 'pending' then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;

  if v_booking.booking_date < v_current_date then
    raise exception 'PAST_DATE' using errcode = 'P0001';
  end if;

  -- Cannot confirm a session that has already started.
  select s.start_time into v_slot_start
  from public.booking_slots bs
  join public.slots s on s.id = bs.slot_id
  where bs.booking_id = p_booking_id
  order by s.sort_order
  limit 1;

  if v_slot_start is not null
     and v_booking.booking_date = v_current_date
     and v_slot_start <= v_current_time then
    raise exception 'PAST_TIME' using errcode = 'P0001';
  end if;

  -- None of the underlying slots may be admin-blocked for that date.
  if exists (
    select 1
    from public.booking_slots bs
    join public.blocked_slots bl
      on bl.slot_id = bs.slot_id and bl.booking_date = bs.booking_date
    where bs.booking_id = p_booking_id
  ) then
    raise exception 'SLOT_BLOCKED' using errcode = 'P0001';
  end if;

  -- Lock every underlying slot. unique_violation here means another booking
  -- already holds one of these slots -> roll back and report the conflict.
  begin
    update public.booking_slots
    set is_released = false
    where booking_id = p_booking_id
      and is_released = true;
  exception when unique_violation then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end;

  select count(*) into v_locked
  from public.booking_slots
  where booking_id = p_booking_id and is_released = false;

  if v_locked = 0 then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.bookings
  set status = 'confirmed', updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'id', v_booking.id,
    'booking_ref', v_booking.booking_ref,
    'status', 'confirmed'
  );
end;
$$;

-- 5. create_manual_booking: admin creates a CONFIRMED booking directly and
-- locks all underlying slots in the same transaction (BOOK & LOCK). Reuses
-- the same guards and the same partial-unique-index protection.
create or replace function public.create_manual_booking(
  p_customer_name   text,
  p_phone_number    text,
  p_whatsapp_number text,
  p_booking_date    date,
  p_slot_ids        text[],
  p_price           numeric default null,
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

  select s.category, count(*), sum(s.duration_minutes), min(s.sort_order), max(s.sort_order)
  into v_category, v_slot_count, v_duration, v_min_order, v_max_order
  from public.slots s
  where s.id = any(p_slot_ids) and s.is_active
  group by s.category;

  if v_category is null or v_slot_count <> cardinality(p_slot_ids) then
    raise exception 'INVALID_SLOTS' using errcode = 'P0001';
  end if;

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

  if p_booking_date = v_current_date and v_start_time <= v_current_time then
    raise exception 'PAST_TIME' using errcode = 'P0001';
  end if;

  -- No selected slot may be admin-blocked for that date.
  if exists (
    select 1
    from public.slots s
    join public.blocked_slots bl
      on bl.slot_id = s.id and bl.booking_date = p_booking_date
    where s.id = any(p_slot_ids)
  ) then
    raise exception 'SLOT_BLOCKED' using errcode = 'P0001';
  end if;

  -- Price: explicit override (e.g. negotiated rate) or computed from slots.
  if p_price is not null and p_price > 0 then
    v_price := p_price;
  else
    select coalesce(sum(s.price), 0) into v_price
    from public.slots s
    where s.id = any(p_slot_ids);
  end if;

  loop
    v_booking_ref := 'CT-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.bookings where booking_ref = v_booking_ref);
  end loop;

  insert into public.bookings (
    booking_ref, customer_name, phone_number, whatsapp_number, team_name, notes,
    booking_date, slot_category, start_time, end_time, selected_time_display,
    slot_count, duration_minutes, price, status
  ) values (
    v_booking_ref, btrim(p_customer_name), btrim(p_phone_number), btrim(p_whatsapp_number),
    nullif(btrim(coalesce(p_team_name, '')), ''), nullif(btrim(coalesce(p_notes, '')), ''),
    p_booking_date, v_category, v_start_time, v_end_time, '',
    v_slot_count, v_duration, v_price, 'confirmed'
  ) returning id into v_booking_id;

  -- Lock the slots immediately (is_released = false). The partial unique
  -- index rejects a concurrent/overlapping confirmed booking.
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
    'status', 'confirmed'
  );
end;
$$;

-- 6. Only the service role may invoke the admin RPCs.
revoke all on function public.confirm_booking(uuid) from anon, public;
revoke all on function public.create_manual_booking(text, text, text, date, text[], numeric, text, text) from anon, public;
grant execute on function public.confirm_booking(uuid) to service_role;
grant execute on function public.create_manual_booking(text, text, text, date, text[], numeric, text, text) to service_role;
