import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { mapAdminFacility } from "@/lib/admin/facilities";
import type { FacilityRow } from "@/types/database";

export const dynamic = "force-dynamic";

// PATCH /api/admin/facilities/[id] — edit label/description/icon/active/order.
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

  if ("label" in body) {
    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (!label) {
      return NextResponse.json(
        { error: "INVALID_LABEL", message: "Facility name is required." },
        { status: 400 },
      );
    }
    update.label = label;
  }
  if ("description" in body) {
    update.description =
      typeof body.description === "string" ? body.description.trim() : "";
  }
  if ("icon" in body) {
    update.icon =
      typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "sports_soccer";
  }
  if ("isActive" in body) update.is_active = Boolean(body.isActive);
  if ("sortOrder" in body) update.sort_order = Number(body.sortOrder);

  try {
    const { data, error } = await guard.supabase
      .from("facilities")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ facility: mapAdminFacility(data as FacilityRow) });
  } catch (err) {
    console.error("Admin facility update failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not update the facility." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/facilities/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const { error } = await guard.supabase
      .from("facilities")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin facility delete failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not delete the facility." },
      { status: 500 },
    );
  }
}
