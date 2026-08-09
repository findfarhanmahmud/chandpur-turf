import type { Metadata } from "next";
import BookingsManager from "@/components/admin/bookings/BookingsManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireAdmin();
  return <BookingsManager />;
}
