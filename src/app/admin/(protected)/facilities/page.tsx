import type { Metadata } from "next";
import FacilitiesManager from "@/components/admin/facilities/FacilitiesManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Facilities" };
export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  await requireAdmin();
  return <FacilitiesManager />;
}
