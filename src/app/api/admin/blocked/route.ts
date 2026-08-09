import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/admin/blocked  { slotId, date, reason? }
// Block a slot for a specific date. RLS-protected via blocked_slots_admin_all.
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

  const slotId = typeof body.slotId === "string" ? body.slotId : "";
  const date = typeof body.date === "string" ? body.date : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() || null : null;

  if (!slotId || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "A slot and a date (YYYY-MM-DD) are required." },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await guard.supabase
      .from("blocked_slots")
      .upsert(
        {
          slot_id: slotId,
          booking_date: date,
          reason,
          created_by: guard.session.userId,
        },
        { onConflict: "slot_id,booking_date" },
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ blocked: data });
  } catch (err) {
    console.error("Admin block failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not block the slot." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/blocked?slotId=&date=
export async function DELETE(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const slotId = url.searchParams.get("slotId") ?? "";
  const date = url.searchParams.get("date") ?? "";

  if (!slotId || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "A slot and a date (YYYY-MM-DD) are required." },
      { status: 400 },
    );
  }

  try {
    const { error } = await guard.supabase
      .from("blocked_slots")
      .delete()
      .eq("slot_id", slotId)
      .eq("booking_date", date);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin unblock failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not unblock the slot." },
      { status: 500 },
    );
  }
}
