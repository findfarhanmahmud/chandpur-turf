import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  AdminBookingActionError,
  confirmBookingOnServer,
} from "@/lib/admin/bookingActions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Booking not found.",
  INVALID_STATUS: "Only pending bookings can be confirmed.",
  PAST_DATE: "This booking date has already passed.",
  PAST_TIME: "This session has already started and can no longer be confirmed.",
  SLOT_BLOCKED: "One or more of these slots is admin-blocked for that date.",
  SLOT_UNAVAILABLE:
    "These slots were just booked by another customer. Refresh the schedule and try again.",
  UNKNOWN: "Could not confirm the booking. Please try again.",
};

// POST /api/admin/bookings/[id]/confirm
// CONFIRM & BLOCK — atomically transitions a pending booking to confirmed and
// locks all of its underlying slots (see confirm_booking RPC).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const booking = await confirmBookingOnServer(guard.supabase, id);
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof AdminBookingActionError) {
      return NextResponse.json(
        {
          error: err.code,
          message: ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.UNKNOWN,
        },
        { status: err.code === "SLOT_UNAVAILABLE" ? 409 : 400 },
      );
    }
    console.error("Admin booking confirm failed:", err);
    return NextResponse.json(
      { error: "UNKNOWN", message: ERROR_MESSAGES.UNKNOWN },
      { status: 500 },
    );
  }
}
