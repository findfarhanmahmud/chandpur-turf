import type { Metadata } from "next";
import PricingManager from "@/components/admin/pricing/PricingManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Pricing" };
export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  await requireAdmin();
  return <PricingManager />;
}
