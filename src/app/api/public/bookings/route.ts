import { NextResponse } from "next/server";
import {
  CreateBookingServerError,
  createBookingOnServer,
} from "@/lib/booking/server";
import { validateCreateBookingRequest } from "@/lib/booking/validation-server";
import { todayDhaka } from "@/lib/booking/time";
import { toISODate } from "@/lib/booking";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  SLOT_UNAVAILABLE:
    "Sorry, one or more selected slots were just booked by someone else. Please pick another time.",
  PAST_DATE: "Please choose a future booking date.",
  PAST_TIME: "This time slot has already started. Please pick a later slot.",
  NON_CONSECUTIVE:
    "Selected slots must be consecutive and within the same day or night session.",
  INVALID_SLOTS: "One or more selected slots are no longer available.",
  NO_SLOTS: "Please select at least one time slot.",
  NAME_REQUIRED: "Full name is required.",
  UNKNOWN: "We couldn't create your booking. Please try again or call us.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const validation = validateCreateBookingRequest(body);
  if (!validation.ok || !validation.parsed) {
    return NextResponse.json(
      { error: "VALIDATION", message: validation.errors?.[0] ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { parsed } = validation;
  const [year, month, day] = parsed.bookingDate.split("-").map(Number);
  const bookingDate = new Date(year, month - 1, day);

  // Double-check the date is not in the past before hitting the database.
  if (toISODate(bookingDate) < toISODate(todayDhaka())) {
    return NextResponse.json(
      { error: "PAST_DATE", message: ERROR_MESSAGES.PAST_DATE },
      { status: 400 },
    );
  }

  try {
    const result = await createBookingOnServer({
      customerName: parsed.customerName,
      phoneNumber: parsed.phoneNumber,
      whatsappNumber: parsed.whatsappNumber,
      teamName: parsed.teamName,
      notes: parsed.notes,
      bookingDate,
      slotIds: parsed.slotIds,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof CreateBookingServerError) {
      const status = err.code === "SLOT_UNAVAILABLE" ? 409 : 400;
      return NextResponse.json(
        {
          error: err.code,
          message: ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.UNKNOWN,
        },
        { status },
      );
    }
    console.error("Booking creation failed:", err);
    return NextResponse.json(
      { error: "UNKNOWN", message: ERROR_MESSAGES.UNKNOWN },
      { status: 500 },
    );
  }
}
