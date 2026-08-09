import "server-only";
import type {
  AdminBooking,
  AdminSlot,
  ScheduleEntry,
  ScheduleRangeData,
} from "@/types/admin";
import type { BookingRow, BookingSlotRow, SlotRow, BlockedSlotRow } from "@/types/database";
import { formatTimeFromRaw } from "@/lib/booking/time";

// Maps a `bookings` row (with embedded booking_slots) to the admin DTO.
export interface BookingRowWithSlots extends BookingRow {
  booking_slots: Pick<BookingSlotRow, "slot_id" | "is_released">[];
}

export function mapAdminBooking(row: BookingRowWithSlots): AdminBooking {
  return {
    id: row.id,
    bookingRef: row.booking_ref,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    whatsappNumber: row.whatsapp_number,
    teamName: row.team_name,
    notes: row.notes,
    bookingDate: row.booking_date,
    slotCategory: row.slot_category,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    selectedTimeDisplay: row.selected_time_display,
    slotCount: row.slot_count,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    slotIds: (row.booking_slots ?? []).map((bs) => bs.slot_id),
  };
}

export function mapAdminSlot(row: SlotRow): AdminSlot {
  return {
    id: row.id,
    category: row.category,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    price: Number(row.price),
    durationMinutes: row.duration_minutes,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

// Fetches bookings (with their concrete slots) for the admin list.
export async function fetchAdminBookings(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  opts: { from?: string; to?: string; status?: string; search?: string } = {},
): Promise<AdminBooking[]> {
  let query = supabase
    .from("bookings")
    .select("*, booking_slots(slot_id)")
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (opts.from) query = query.gte("booking_date", opts.from);
  if (opts.to) query = query.lte("booking_date", opts.to);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.search) {
    query = query.or(
      `customer_name.ilike.%${opts.search}%,booking_ref.ilike.%${opts.search}%,phone_number.ilike.%${opts.search}%`,
    );
  }

  const { data, error } = await query.limit(500);
  if (error) throw error;
  return (data as BookingRowWithSlots[]).map(mapAdminBooking);
}

// Builds the schedule grid for a date range. The database (bookings +
// booking_slots + blocked_slots) is the source of truth.
//
// Availability semantics match the current workflow: CONFIRMED and COMPLETED
// bookings hold a slot (booking_slots.is_released = false). A COMPLETED
// booking must never make its slot look available again — the slot stays
// historically associated with the booking and cannot be re-booked. PENDING
// bookings are requests, not holds — they are surfaced to the admin for
// negotiation but do not block the slot, so other customers can still request
// the same time.
export async function buildScheduleRange(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  from: string,
  to: string,
): Promise<ScheduleRangeData> {
  const { data: slotRows, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .order("category")
    .order("sort_order");
  if (slotError) throw slotError;
  const slots: AdminSlot[] = (slotRows as SlotRow[]).map(mapAdminSlot);

  const { data: bookingRows, error: bookingError } = await supabase
    .from("bookings")
    .select("*, booking_slots!inner(slot_id, is_released)")
    .gte("booking_date", from)
    .lte("booking_date", to)
    .in("status", ["pending", "confirmed", "completed"]);
  if (bookingError) throw bookingError;

  const { data: blockedRows, error: blockedError } = await supabase
    .from("blocked_slots")
    .select("*")
    .gte("booking_date", from)
    .lte("booking_date", to);
  if (blockedError) throw blockedError;

  const blockedByDateSlot = new Map<string, BlockedSlotRow>();
  for (const b of blockedRows as BlockedSlotRow[]) {
    blockedByDateSlot.set(`${b.booking_date}|${b.slot_id}`, b);
  }

  // Confirmed AND completed bookings hold their slots (is_released = false).
  // Completed bookings stay on the grid so their slots are never shown as
  // available again (the database keeps the hold; the schedule must match).
  const bookingHolds = new Map<string, BookingRowWithSlots>();
  // Pending requests are informational only; they never lock a slot.
  const pendingByDateSlot = new Map<string, BookingRowWithSlots>();
  for (const row of bookingRows as BookingRowWithSlots[]) {
    for (const bs of row.booking_slots ?? []) {
      if (
        (row.status === "confirmed" || row.status === "completed") &&
        bs.is_released === false
      ) {
        bookingHolds.set(`${row.booking_date}|${bs.slot_id}`, row);
      } else if (row.status === "pending") {
        pendingByDateSlot.set(`${row.booking_date}|${bs.slot_id}`, row);
      }
    }
  }

  const entries: Record<string, Record<string, ScheduleEntry>> = {};
  const dates = enumerateDates(from, to);

  for (const date of dates) {
    entries[date] = {};
    for (const slot of slots) {
      const block = blockedByDateSlot.get(`${date}|${slot.id}`);
      const booking = bookingHolds.get(`${date}|${slot.id}`);
      const pending = pendingByDateSlot.get(`${date}|${slot.id}`);

      let entry: ScheduleEntry = {
        slotId: slot.id,
        bookingDate: date,
        status: "available",
      };

      if (block) {
        entry = { ...entry, status: "blocked", reason: block.reason ?? undefined };
      } else if (booking) {
        entry = {
          ...entry,
          status: "booked",
          bookingId: booking.id,
          bookingRef: booking.booking_ref,
          customerName: booking.customer_name,
        };
      } else if (pending) {
        entry = {
          ...entry,
          status: "pending",
          bookingId: pending.id,
          bookingRef: pending.booking_ref,
          customerName: pending.customer_name,
        };
      } else {
        // A free slot is ELAPSED only after its actual end datetime has passed.
        entry.status = isSlotElapsed(date, slot) ? "elapsed" : "available";
      }

      entries[date][slot.id] = entry;
    }
  }

  return {
    from,
    to,
    slots,
    entries,
    bookings: (bookingRows as BookingRowWithSlots[]).map(mapAdminBooking),
  };
}

// YYYY-MM-DD (inclusive) date range walker.
export function enumerateDates(from: string, to: string): string[] {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

// Today's Dhaka date string + "HH:mm:ss" time string.
export function dhakaNow(): { date: string; time: string } {
  const now = new Date();
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return { date: dateFmt.format(now), time: timeFmt.format(now) };
}

// Adds `days` days to a "YYYY-MM-DD" date (pure calendar math, no timezone).
function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Absolute UTC-epoch instant for a wall-clock "HH:mm:ss" time on a Dhaka
// calendar date. Asia/Dhaka is UTC+6 year-round (no DST since 2009).
function dhakaEpoch(dateISO: string, time: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm, ss] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh - 6, mm, ss || 0);
}

// Absolute start/end instants (UTC epoch) for a slot rendered under a schedule
// date, interpreted as Asia/Dhaka wall-clock times.
//
// Midnight handling:
//   - a night slot that starts in the AM hours is a post-midnight slot and
//     belongs to the NEXT calendar day (the 12:30 AM slot on the August 8
//     schedule runs August 9 00:30 - 02:00);
//   - a slot whose end time is earlier than its start time (11:00 PM -> 12:30 AM)
//     crosses midnight, so its end lands on the following day.
export function slotDateBounds(
  date: string,
  slot: Pick<AdminSlot, "category" | "startTime" | "endTime">,
): { startEpoch: number; endEpoch: number } {
  const startTime =
    slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime;
  const endTime = slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime;

  const postMidnight = slot.category === "night" && startTime < "12:00:00";
  const crossesMidnight = endTime <= startTime;

  const startDate = postMidnight ? addDaysISO(date, 1) : date;
  const endDate = postMidnight || crossesMidnight ? addDaysISO(date, 1) : date;

  return {
    startEpoch: dhakaEpoch(startDate, startTime),
    endEpoch: dhakaEpoch(endDate, endTime),
  };
}

// True only when a slot's actual END datetime has passed in Asia/Dhaka. A slot
// must never be flagged ELAPSED merely because its start time is earlier than
// the current time while it is still in progress.
export function isSlotElapsed(
  date: string,
  slot: Pick<AdminSlot, "category" | "startTime" | "endTime">,
): boolean {
  return Date.now() >= slotDateBounds(date, slot).endEpoch;
}

export { formatTimeFromRaw };
