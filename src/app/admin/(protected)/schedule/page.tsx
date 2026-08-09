import type { Metadata } from "next";
import ScheduleManager from "@/components/admin/schedule/ScheduleManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Schedule" };
export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  await requireAdmin();
  return <ScheduleManager />;
}
