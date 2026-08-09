import "server-only";
import type { AdminBooking } from "@/types/admin";
import { mapAdminBooking, type BookingRowWithSlots } from "@/lib/admin/queries";
import type { CreateBookingResult } from "@/types/database";

// Server-side admin booking actions. Confirmations and manual bookings are
// performed through SECURITY DEFINER RPCs so the slot-lock and the booking
// status change happen in a single database transaction, protected by the
// partial unique index on booking_slots (no double-booking under concurrency).

export type AdminBookingActionErrorCode =
  | "SLOT_UNAVAILABLE"
  | "SLOT_BLOCKED"
  | "PAST_DATE"
  | "PAST_TIME"
  | "NON_CONSECUTIVE"
  | "INVALID_SLOTS"
  | "NO_SLOTS"
  | "NAME_REQUIRED"
  | "INVALID_STATUS"
  | "NOT_FOUND"
  | "UNKNOWN";

export class AdminBookingActionError extends Error {
  code: AdminBookingActionErrorCode;
  constructor(code: AdminBookingActionErrorCode, message: string) {
    super(message);
    this.name = "AdminBookingActionError";
    this.code = code;
  }
}

export interface ManualBookingInput {
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  bookingDate: string; // "YYYY-MM-DD"
  slotIds: string[];
  price?: number;
  teamName?: string;
  notes?: string;
}

type SupabaseAdminClient = ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>;

function mapRpcError(message: string): AdminBookingActionErrorCode {
  if (!message) return "UNKNOWN";
  if (message.includes("SLOT_UNAVAILABLE")) return "SLOT_UNAVAILABLE";
  if (message.includes("SLOT_BLOCKED")) return "SLOT_BLOCKED";
  if (message.includes("PAST_DATE")) return "PAST_DATE";
  if (message.includes("PAST_TIME")) return "PAST_TIME";
  if (message.includes("NON_CONSECUTIVE")) return "NON_CONSECUTIVE";
  if (message.includes("INVALID_SLOTS")) return "INVALID_SLOTS";
  if (message.includes("NO_SLOTS")) return "NO_SLOTS";
  if (message.includes("NAME_REQUIRED")) return "NAME_REQUIRED";
  if (message.includes("INVALID_STATUS")) return "INVALID_STATUS";
  if (message.includes("NOT_FOUND")) return "NOT_FOUND";
  return "UNKNOWN";
}

async function loadAdminBooking(
  supabase: SupabaseAdminClient,
  bookingId: string,
): Promise<AdminBooking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_slots(slot_id, is_released)")
    .eq("id", bookingId)
    .single();
  if (error || !data) return null;
  return mapAdminBooking(data as BookingRowWithSlots);
}

// CONFIRM & BLOCK: atomically confirms a pending booking and locks its slots.
export async function confirmBookingOnServer(
  supabase: SupabaseAdminClient,
  bookingId: string,
): Promise<AdminBooking> {
  const { error } = await supabase.rpc("confirm_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    throw new AdminBookingActionError(mapRpcError(error.message), error.message);
  }

  const booking = await loadAdminBooking(supabase, bookingId);
  if (!booking) throw new AdminBookingActionError("NOT_FOUND", "Booking not found.");
  return booking;
}

// BOOK & LOCK: creates a confirmed booking and locks its slots immediately.
export async function createManualBookingOnServer(
  supabase: SupabaseAdminClient,
  input: ManualBookingInput,
): Promise<AdminBooking> {
  const { data, error } = await supabase.rpc("create_manual_booking", {
    p_customer_name: input.customerName.trim(),
    p_phone_number: input.phoneNumber.trim(),
    p_whatsapp_number: input.whatsappNumber.trim() || input.phoneNumber.trim(),
    p_booking_date: input.bookingDate,
    p_slot_ids: input.slotIds,
    p_price: input.price ?? null,
    p_team_name: input.teamName?.trim() || null,
    p_notes: input.notes?.trim() || null,
  });

  if (error) {
    throw new AdminBookingActionError(mapRpcError(error.message), error.message);
  }

  const result = data as CreateBookingResult;
  const booking = await loadAdminBooking(supabase, result.id);
  if (!booking) throw new AdminBookingActionError("NOT_FOUND", "Booking not found.");
  return booking;
}
