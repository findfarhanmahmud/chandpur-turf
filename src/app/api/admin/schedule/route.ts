import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { buildScheduleRange } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/admin/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns the full slot grid with availability/booking/block state per day.
export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json(
      { error: "INVALID_RANGE", message: "from and to must be YYYY-MM-DD." },
      { status: 400 },
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "INVALID_RANGE", message: "from must be before or equal to to." },
      { status: 400 },
    );
  }

  try {
    const data = await buildScheduleRange(guard.supabase, from, to);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Admin schedule fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load the schedule." },
      { status: 500 },
    );
  }
}
