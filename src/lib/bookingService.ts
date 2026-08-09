import { openWhatsApp, WHATSAPP_NOTICE_MESSAGES } from "@/lib/whatsapp";
import { type BookingRecord } from "@/types/booking";

export interface SubmitBookingPayload {
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: string; // "YYYY-MM-DD"
  slotIds: string[];
}

export interface BookingSubmissionResult {
  success: boolean;
  message: string;
  booking?: BookingRecord;
}

// Persists the booking to Supabase (via /api/public/bookings), then opens
// WhatsApp with the exact existing message format. The database creates the
// authoritative booking record; the returned record powers the WhatsApp message.
export async function submitBooking(
  payload: SubmitBookingPayload,
): Promise<BookingSubmissionResult> {
  let response: Response;
  try {
    response = await fetch("/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { success: false, message: WHATSAPP_NOTICE_MESSAGES.failure };
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: json?.message ?? WHATSAPP_NOTICE_MESSAGES.failure,
    };
  }

  const booking = (json?.booking as BookingRecord | undefined) ?? null;
  if (!booking) {
    return { success: false, message: WHATSAPP_NOTICE_MESSAGES.failure };
  }

  const opened = openWhatsApp(booking);
  return {
    success: true,
    message: opened
      ? WHATSAPP_NOTICE_MESSAGES.success
      : WHATSAPP_NOTICE_MESSAGES.failure,
    booking,
  };
}
