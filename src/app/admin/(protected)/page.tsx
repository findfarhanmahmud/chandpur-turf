import type { Metadata } from "next";
import DashboardContent from "@/components/admin/DashboardContent";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  return <DashboardContent />;
}
