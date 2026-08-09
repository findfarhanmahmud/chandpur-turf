import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { fetchAdminBookings } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

// GET /api/admin/bookings?from=&to=&status=&search=
export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  try {
    const bookings = await fetchAdminBookings(guard.supabase, {
      from,
      to,
      status,
      search,
    });
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("Admin bookings fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load bookings." },
      { status: 500 },
    );
  }
}
