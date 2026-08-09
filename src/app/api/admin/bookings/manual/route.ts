import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  AdminBookingActionError,
  createManualBookingOnServer,
} from "@/lib/admin/bookingActions";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^01[3-9]\d{8}$/;
const MAX_SLOT_IDS = 8;

const ERROR_MESSAGES: Record<string, string> = {
  NAME_REQUIRED: "Customer name is required.",
  PAST_DATE: "Please choose a future booking date.",
  PAST_TIME: "This time slot has already started. Please pick a later slot.",
  NO_SLOTS: "Please select at least one time slot.",
  INVALID_SLOTS: "One or more selected slots are not valid or inactive.",
  NON_CONSECUTIVE: "Selected slots must be consecutive and within one session.",
  SLOT_BLOCKED: "One or more of these slots is blocked for that date.",
  SLOT_UNAVAILABLE:
    "One or more slots were just booked by another customer. Refresh the schedule and try again.",
  UNKNOWN: "Could not create the booking. Please try again.",
};

// POST /api/admin/bookings/manual
// BOOK & LOCK — creates a CONFIRMED booking and locks its slots atomically
// (see create_manual_booking RPC).
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  const whatsappNumber = typeof body.whatsappNumber === "string" ? body.whatsappNumber.trim() : "";
  const bookingDate = typeof body.bookingDate === "string" ? body.bookingDate : "";
  const teamName = typeof body.teamName === "string" ? body.teamName : "";
  const notes = typeof body.notes === "string" ? body.notes : "";
  const price = typeof body.price === "number" && Number.isFinite(body.price) ? body.price : undefined;
  const slotIds = Array.isArray(body.slotIds)
    ? body.slotIds.filter((s): s is string => typeof s === "string")
    : [];

  if (!customerName) {
    return NextResponse.json(
      { error: "NAME_REQUIRED", message: ERROR_MESSAGES.NAME_REQUIRED },
      { status: 400 },
    );
  }
  if (!DATE_RE.test(bookingDate)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "A valid booking date (YYYY-MM-DD) is required." },
      { status: 400 },
    );
  }
  if (!PHONE_RE.test(phoneNumber)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "A valid Bangladeshi phone number is required." },
      { status: 400 },
    );
  }
  if (slotIds.length === 0 || slotIds.length > MAX_SLOT_IDS) {
    return NextResponse.json(
      { error: "NO_SLOTS", message: ERROR_MESSAGES.NO_SLOTS },
      { status: 400 },
    );
  }

  try {
    const booking = await createManualBookingOnServer(guard.supabase, {
      customerName,
      phoneNumber,
      whatsappNumber,
      bookingDate,
      slotIds,
      price,
      teamName,
      notes,
    });
    return NextResponse.json({ booking }, { status: 201 });
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
    console.error("Manual booking creation failed:", err);
    return NextResponse.json(
      { error: "UNKNOWN", message: ERROR_MESSAGES.UNKNOWN },
      { status: 500 },
    );
  }
}
