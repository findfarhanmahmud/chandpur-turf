import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { mapAdminSlot } from "@/lib/admin/queries";
import type { SlotRow } from "@/types/database";

export const dynamic = "force-dynamic";

// GET /api/admin/slots — all slots (active and inactive) for management.
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { data, error } = await guard.supabase
      .from("slots")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error) throw error;

    return NextResponse.json({
      slots: (data as SlotRow[]).map(mapAdminSlot),
    });
  } catch (err) {
    console.error("Admin slots fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load slots." },
      { status: 500 },
    );
  }
}
