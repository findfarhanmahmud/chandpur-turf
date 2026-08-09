import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

// PATCH /api/admin/bookings/[id]  { status }
// Status transitions are RLS-protected (bookings_admin_all). The DB trigger
// release_slots_on_cancel() frees the slots when a booking is cancelled, so
// slot conflict protection is preserved automatically.
//
// Confirming a booking must go through POST /api/admin/bookings/[id]/confirm
// (the confirm_booking RPC) so the slot lock and the status change happen
// atomically. Plain PATCH to "confirmed" is rejected to prevent a bypass that
// would mark a booking confirmed without locking its slots.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const status = (body as Record<string, unknown>)?.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json(
      { error: "INVALID_STATUS", message: "Invalid booking status." },
      { status: 400 },
    );
  }

  if (status === "confirmed") {
    return NextResponse.json(
      {
        error: "USE_CONFIRM_ROUTE",
        message: "Use CONFIRM & BLOCK to confirm a booking and lock its slots.",
      },
      { status: 400 },
    );
  }

  try {
    const { data: existing, error: fetchError } = await guard.supabase
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Booking not found." },
        { status: 404 },
      );
    }

    const { data, error } = await guard.supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Admin booking update failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not update the booking." },
      { status: 500 },
    );
  }
}
