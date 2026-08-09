import type { Metadata } from "next";
import GalleryManager from "@/components/admin/gallery/GalleryManager";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();
  return <GalleryManager />;
}
