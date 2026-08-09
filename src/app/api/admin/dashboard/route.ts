import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { dhakaNow, enumerateDates } from "@/lib/admin/queries";
import { toISODate } from "@/lib/booking";
import type { BookingRow } from "@/types/database";
import type { DashboardStats } from "@/types/admin";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["pending", "confirmed"];

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  try {
    const today = dhakaNow().date;
    const weekEnd = toISODate(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
    );

    const [todayRes, pendingRes, confirmedRes, slotsRes, availRes, revenueRes] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("booking_date", today)
          .in("status", ACTIVE_STATUSES),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabase.from("slots").select("id").eq("is_active", true),
        supabase.rpc("get_day_availability", { p_date: today }),
        supabase
          .from("bookings")
          .select("price")
          .eq("booking_date", today)
          .in("status", ["confirmed", "completed"]),
      ]);

    if (todayRes.error) throw todayRes.error;
    if (pendingRes.error) throw pendingRes.error;
    if (confirmedRes.error) throw confirmedRes.error;
    if (slotsRes.error) throw slotsRes.error;
    if (availRes.error) throw availRes.error;
    if (revenueRes.error) throw revenueRes.error;

    const totalSlotsToday = slotsRes.data?.length ?? 0;
    const availableToday = (availRes.data as { slot_id: string; status: string }[]).filter(
      (s) => s.status === "available",
    ).length;
    const todayRevenue = (revenueRes.data as Pick<BookingRow, "price">[]).reduce(
      (sum, row) => sum + Number(row.price),
      0,
    );

    const stats: DashboardStats = {
      today,
      todayBookings: todayRes.count ?? 0,
      pendingBookings: pendingRes.count ?? 0,
      confirmedBookings: confirmedRes.count ?? 0,
      availableSlotsToday: availableToday,
      totalSlotsToday,
      todayRevenue,
    };

    // Week-ahead snapshot for the "next 7 days" strip.
    const weekSlots = slotsRes.data as { id: string }[];
    const week: { date: string; available: number; booked: number }[] = [];
    for (const date of enumerateDates(today, weekEnd)) {
      if (date === today) continue;
      const { data: avail, error: availError } = await supabase.rpc(
        "get_day_availability",
        { p_date: date },
      );
      if (availError) throw availError;
      const rows = avail as { status: string }[];
      week.push({
        date,
        available: rows.filter((s) => s.status === "available").length,
        booked:
          weekSlots.length -
          rows.filter((s) => s.status === "available").length,
      });
    }

    return NextResponse.json({ stats, week });
  } catch (err) {
    console.error("Admin dashboard failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load dashboard stats." },
      { status: 500 },
    );
  }
}
