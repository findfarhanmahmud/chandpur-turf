import type {
  SlotRow,
  SlotAvailabilityRow,
  SlotAvailabilityStatus,
} from "@/types/database";
import type { TimeSlot } from "@/types/booking";
import { formatTimeFromRaw } from "@/lib/booking/time";

// Maps a database `slots` row to the UI `TimeSlot` shape.
export function mapSlotRowToTimeSlot(row: SlotRow): TimeSlot {
  return {
    id: row.id,
    time: formatTimeFromRaw(row.start_time),
    endTime: formatTimeFromRaw(row.end_time),
    price: Number(row.price),
    category: row.category,
    isBooked: false,
    startTimeRaw: row.start_time,
    endTimeRaw: row.end_time,
    durationMinutes: row.duration_minutes,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

// Active slots, grouped day-first then night, each ordered by sort_order.
export function mapSlotRowsToTimeSlots(rows: SlotRow[]): TimeSlot[] {
  return rows
    .filter((row) => row.is_active)
    .sort((a, b) =>
      a.category !== b.category
        ? a.category === "day"
          ? -1
          : 1
        : a.sort_order - b.sort_order,
    )
    .map(mapSlotRowToTimeSlot);
}

export function buildAvailabilityMap(
  rows: SlotAvailabilityRow[],
): Record<string, SlotAvailabilityStatus> {
  const map: Record<string, SlotAvailabilityStatus> = {};
  for (const row of rows) map[row.slot_id] = row.status;
  return map;
}

// Merges per-date availability into the slot list (sets isBooked + availability).
export function applyAvailability(
  slots: TimeSlot[],
  statusBySlotId: Record<string, SlotAvailabilityStatus>,
): TimeSlot[] {
  return slots.map((slot) => {
    const status = statusBySlotId[slot.id] ?? "available";
    return {
      ...slot,
      availability: status,
      isBooked: status !== "available",
    };
  });
}

// A slot is bookable only when it is available for the selected date.
export function isSlotUnavailable(status: SlotAvailabilityStatus | undefined): boolean {
  return status === "booked" || status === "blocked" || status === "elapsed";
}
