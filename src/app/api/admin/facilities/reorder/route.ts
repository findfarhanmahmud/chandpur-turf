import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/facilities/reorder  { orderedIds: string[] }
// Assigns 1..n sort_order across the list in one transaction-free batch.
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  let body: { orderedIds?: unknown };
  try {
    body = (await request.json()) as { orderedIds?: unknown };
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.orderedIds) ||
    body.orderedIds.length === 0 ||
    !body.orderedIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "INVALID_ORDER", message: "orderedIds must be a non-empty array." },
      { status: 400 },
    );
  }

  try {
    const { data: existing, error: fetchError } = await guard.supabase
      .from("facilities")
      .select("id");
    if (fetchError) throw fetchError;

    const existingIds = new Set((existing as { id: string }[]).map((f) => f.id));
    const ordered = (body.orderedIds as string[]).filter((id) => existingIds.has(id));
    if (ordered.length === 0) {
      return NextResponse.json(
        { error: "INVALID_ORDER", message: "No valid facilities to reorder." },
        { status: 400 },
      );
    }

    const updates = ordered.map((id, index) => ({ id, sort_order: index + 1 }));

    for (const u of updates) {
      const { error } = await guard.supabase
        .from("facilities")
        .update({ sort_order: u.sort_order })
        .eq("id", u.id);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, count: updates.length });
  } catch (err) {
    console.error("Admin facilities reorder failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not reorder facilities." },
      { status: 500 },
    );
  }
}
