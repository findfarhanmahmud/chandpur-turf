import { createPublicClient } from "@/lib/supabase/public";
import type {
  CreateBookingResult,
  SlotRow,
} from "@/types/database";
import { combineTimeRange, toISODate } from "@/lib/booking";
import { mapSlotRowToTimeSlot } from "@/lib/booking/slots";
import type { BookingRecord, TimeSlot } from "@/types/booking";

// Server-side booking creation. The heavy lifting (consecutiveness check,
// price calculation, overlap protection) happens transactionally inside the
// SECURITY DEFINER RPC `create_booking`, so the database is authoritative.
export interface CreateBookingServerInput {
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: Date;
  slotIds: string[];
}

export type CreateBookingServerErrorCode =
  | "SLOT_UNAVAILABLE"
  | "PAST_DATE"
  | "PAST_TIME"
  | "NON_CONSECUTIVE"
  | "INVALID_SLOTS"
  | "NO_SLOTS"
  | "NAME_REQUIRED"
  | "UNKNOWN";

export interface CreateBookingServerResult {
  booking: BookingRecord;
  slots: TimeSlot[];
}

export class CreateBookingServerError extends Error {
  code: CreateBookingServerErrorCode;
  constructor(code: CreateBookingServerErrorCode, message: string) {
    super(message);
    this.name = "CreateBookingServerError";
    this.code = code;
  }
}

export async function createBookingOnServer(
  input: CreateBookingServerInput,
): Promise<CreateBookingServerResult> {
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_name: input.customerName.trim(),
    p_phone_number: input.phoneNumber.trim(),
    p_whatsapp_number: input.whatsappNumber.trim(),
    p_team_name: input.teamName?.trim() || null,
    p_notes: input.notes?.trim() || null,
    p_booking_date: toISODate(input.bookingDate),
    p_slot_ids: input.slotIds,
  });

  if (error) {
    throw new CreateBookingServerError(
      mapRpcError(error.message),
      error.message,
    );
  }

  const result = data as CreateBookingResult;

  // Load the concrete slot definitions so the WhatsApp message can use the
  // human-readable combined time range and per-slot display strings.
  const { data: slotRows, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .in("id", input.slotIds)
    .order("sort_order", { ascending: true });

  if (slotError) {
    throw new CreateBookingServerError("UNKNOWN", "Failed to load slot details.");
  }

  const slots: TimeSlot[] = (slotRows as SlotRow[]).map(mapSlotRowToTimeSlot);
  const sorted = [...slots].sort(
    (a, b) =>
      a.category !== b.category
        ? a.category === "day"
          ? -1
          : 1
        : a.sortOrder - b.sortOrder,
  );

  const booking: BookingRecord = {
    bookingId: result.id,
    customerName: input.customerName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    whatsappNumber: input.whatsappNumber.trim(),
    teamName: input.teamName?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    bookingDate: result.booking_date,
    slotCategory: result.slot_category,
    selectedTime: combineTimeRange(sorted),
    slotCount: result.slot_count,
    duration: result.duration_minutes,
    price: Number(result.price),
    bookingStatus: result.status,
    createdAt: new Date().toISOString(),
  };

  return { booking, slots: sorted };
}

function mapRpcError(message: string): CreateBookingServerErrorCode {
  if (!message) return "UNKNOWN";
  if (message.includes("SLOT_UNAVAILABLE")) return "SLOT_UNAVAILABLE";
  if (message.includes("PAST_DATE")) return "PAST_DATE";
  if (message.includes("PAST_TIME")) return "PAST_TIME";
  if (message.includes("NON_CONSECUTIVE")) return "NON_CONSECUTIVE";
  if (message.includes("INVALID_SLOTS")) return "INVALID_SLOTS";
  if (message.includes("NO_SLOTS")) return "NO_SLOTS";
  if (message.includes("NAME_REQUIRED")) return "NAME_REQUIRED";
  return "UNKNOWN";
}
