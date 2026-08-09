import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicSiteData } from "@/types/booking";
import type {
  FacilityRow,
  GalleryImageRow,
  SiteSettingRow,
  SlotRow,
} from "@/types/database";
import { mapSlotRowsToTimeSlots } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

// Public site content — the database is the source of truth for settings,
// slots, facilities and gallery images. RLS exposes only public fields.
export async function GET() {
  try {
    const supabase = createPublicClient();

    const [settingsRes, slotsRes, facilitiesRes, galleryRes] =
      await Promise.all([
        supabase
          .from("site_settings")
          .select("key, value")
          .eq("is_public", true),
        supabase.from("slots").select("*").order("category").order("sort_order"),
        supabase
          .from("facilities")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("gallery_images")
          .select("*")
          .eq("is_visible", true)
          .order("sort_order"),
      ]);

    if (settingsRes.error) throw settingsRes.error;
    if (slotsRes.error) throw slotsRes.error;
    if (facilitiesRes.error) throw facilitiesRes.error;
    if (galleryRes.error) throw galleryRes.error;

    const data: PublicSiteData = {
      settings: (settingsRes.data as SiteSettingRow[]).reduce<Record<string, string>>(
        (acc, row) => {
          acc[row.key] = row.value;
          return acc;
        },
        {},
      ),
      slots: mapSlotRowsToTimeSlots(slotsRes.data as SlotRow[]),
      facilities: (facilitiesRes.data as FacilityRow[]).map((f) => ({
        id: f.id,
        label: f.label,
        description: f.description,
        icon: f.icon,
      })),
      gallery: (galleryRes.data as GalleryImageRow[]).map((g) => ({
        id: g.id,
        title: g.title,
        caption: g.caption ?? "",
        category: g.category,
        imageUrl: g.image_url,
      })),
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("Public bootstrap failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Public data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
