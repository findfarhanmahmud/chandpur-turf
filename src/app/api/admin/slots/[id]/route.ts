import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { mapAdminSlot } from "@/lib/admin/queries";
import type { SlotRow } from "@/types/database";

export const dynamic = "force-dynamic";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// PATCH /api/admin/slots/[id] — edit price, duration, times, and enable/disable.
// Slot edits are RLS-protected (slots_admin_all). Historical bookings store
// their own start/end times, so changing a definition never corrupts them.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("price" in body) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "INVALID_PRICE", message: "Price must be a positive number." },
        { status: 400 },
      );
    }
    update.price = price;
  }

  if ("durationMinutes" in body) {
    const duration = Number(body.durationMinutes);
    if (!Number.isInteger(duration) || duration < 30 || duration > 480) {
      return NextResponse.json(
        { error: "INVALID_DURATION", message: "Duration must be 30–480 minutes." },
        { status: 400 },
      );
    }
    update.duration_minutes = duration;
  }

  if ("startTime" in body || "endTime" in body) {
    const startTime = typeof body.startTime === "string" ? body.startTime : undefined;
    const endTime = typeof body.endTime === "string" ? body.endTime : undefined;
    if (startTime !== undefined && !TIME_RE.test(startTime)) {
      return NextResponse.json(
        { error: "INVALID_TIME", message: "Start time must be HH:MM." },
        { status: 400 },
      );
    }
    if (endTime !== undefined && !TIME_RE.test(endTime)) {
      return NextResponse.json(
        { error: "INVALID_TIME", message: "End time must be HH:MM." },
        { status: 400 },
      );
    }
    if (startTime !== undefined) update.start_time = `${startTime}:00`;
    if (endTime !== undefined) update.end_time = `${endTime}:00`;
  }

  if ("isActive" in body) {
    update.is_active = Boolean(body.isActive);
  }

  if ("sortOrder" in body) {
    update.sort_order = Number(body.sortOrder);
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json(
      { error: "NO_CHANGES", message: "Nothing to update." },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await guard.supabase
      .from("slots")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ slot: mapAdminSlot(data as SlotRow) });
  } catch (err) {
    console.error("Admin slot update failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not update the slot." },
      { status: 500 },
    );
  }
}
