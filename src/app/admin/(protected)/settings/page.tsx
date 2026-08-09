import type { Metadata } from "next";
import SettingsManager from "@/components/admin/settings/SettingsManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsManager />;
}
