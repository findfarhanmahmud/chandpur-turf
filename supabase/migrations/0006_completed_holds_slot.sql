-- ---------------------------------------------------------------------------
-- 0006_completed_holds_slot.sql
--
-- A COMPLETED booking must NEVER make its slot available again:
--   - the booking stays in history,
--   - its booking_slots rows are NOT released (no trigger releases them),
--   - the partial unique index (slot_id, booking_date) WHERE is_released=false
--     still prevents any new confirmed booking from taking the slot.
--
-- get_day_availability() previously reported a slot as booked ONLY when a
-- CONFIRMED booking held it. After a booking is completed, that made the slot
-- look "available" to the public and to the admin schedule even though the
-- database still held it, which surfaced as a confusing "One or more slots
-- were just booked..." error when the slot was re-booked.
--
-- Fix: count COMPLETED (non-released) bookings as slot holders too.
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
      and bk.status in ('confirmed', 'completed')
  ) b on b.slot_id = s.id
  left join public.blocked_slots bl
    on bl.slot_id = s.id and bl.booking_date = p_date
  where s.is_active
  order by s.category, s.sort_order;
$$;
