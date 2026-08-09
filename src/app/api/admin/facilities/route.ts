import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { mapAdminFacility } from "@/lib/admin/facilities";
import type { FacilityRow } from "@/types/database";

export const dynamic = "force-dynamic";

// GET /api/admin/facilities — all facilities (active and inactive), by order.
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { data, error } = await guard.supabase
      .from("facilities")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;

    return NextResponse.json({
      facilities: (data as FacilityRow[]).map(mapAdminFacility),
    });
  } catch (err) {
    console.error("Admin facilities fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load facilities." },
      { status: 500 },
    );
  }
}

// POST /api/admin/facilities — create a facility.
// { label, description?, icon?, isActive?, sortOrder? }
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

  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json(
      { error: "INVALID_LABEL", message: "Facility name is required." },
      { status: 400 },
    );
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const icon = typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "sports_soccer";
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

  try {
    const { data, error } = await guard.supabase
      .from("facilities")
      .insert({
        label,
        description,
        icon,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(
      { facility: mapAdminFacility(data as FacilityRow) },
      { status: 201 },
    );
  } catch (err) {
    console.error("Admin facility create failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not create the facility." },
      { status: 500 },
    );
  }
}
