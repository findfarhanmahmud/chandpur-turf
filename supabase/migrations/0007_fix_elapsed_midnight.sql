-- ---------------------------------------------------------------------------
-- 0007_fix_elapsed_midnight.sql
--
-- Fixes the ELAPSED/CLOSED status for night slots that cross midnight.
--
-- get_day_availability() is the PUBLIC booking availability: a slot cannot be
-- booked once it has started, so it is reported CLOSED when the slot's ACTUAL
-- START datetime has passed (this includes a slot that is currently in
-- progress, e.g. 6:30 PM -> 8:00 PM at 7:48 PM). It must never be flagged
-- CLOSED merely because its bare clock time is earlier than the current time.
--
-- Midnight handling (Asia/Dhaka):
--   - a night slot that starts in the AM hours is a post-midnight slot and
--     belongs to the NEXT calendar day (the 12:30 AM slot on the August 9
--     schedule runs August 10 00:30 - 02:00, so it is still AVAILABLE on
--     August 9 even though 00:30 is earlier than the current time);
--   - a slot that crosses midnight (11:00 PM -> 12:30 AM) starts on p_date,
--     so its start stays on p_date.
--
-- NOTE: the admin schedule grid uses a different, end-based rule
-- (src/lib/admin/queries.ts, isSlotElapsed) so that an in-progress slot
-- stays visible there as AVAILABLE rather than ELAPSED.
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
      when (
        case
          when s.category = 'night' and s.start_time < time '12:00'
            then (p_date + 1) + s.start_time
          else p_date + s.start_time
        end
      ) <= now() at time zone 'Asia/Dhaka'
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
