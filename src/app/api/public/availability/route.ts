import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { SlotAvailabilityRow } from "@/types/database";

export const dynamic = "force-dynamic";

// Returns slot availability for a specific date.
// e.g. GET /api/public/availability?date=2026-08-20
//   -> [{ slot_id: "d-0500", status: "available" }, ...]
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "INVALID_DATE", message: "A valid date is required (YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  // Reject past dates (availability only makes sense for today onward).
  const todayDhaka = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (date < todayDhaka) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_day_availability", {
      p_date: date,
    });

    if (error) throw error;

    return NextResponse.json(data as SlotAvailabilityRow[]);
  } catch (err) {
    console.error("Availability fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Availability is temporarily unavailable." },
      { status: 503 },
    );
  }
}
