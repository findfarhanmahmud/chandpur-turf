import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import type { GalleryImageRow } from "@/types/database";
import { mapGalleryImage } from "@/lib/admin/gallery";

export const dynamic = "force-dynamic";

// GET /api/admin/gallery — all images (visible and hidden), by sort order.
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { data, error } = await guard.supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({
      images: (data as GalleryImageRow[]).map(mapGalleryImage),
    });
  } catch (err) {
    console.error("Admin gallery fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load gallery images." },
      { status: 500 },
    );
  }
}

// POST /api/admin/gallery — create a gallery record.
// { title, caption?, category, imageUrl, storagePath?, sortOrder?, isVisible? }
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Title and image URL are required." },
      { status: 400 },
    );
  }

  const caption =
    typeof body.caption === "string" && body.caption.trim()
      ? body.caption.trim()
      : null;
  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : "match";
  const storagePath =
    typeof body.storagePath === "string" && body.storagePath.trim()
      ? body.storagePath.trim()
      : null;
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;
  const isVisible = body.isVisible === undefined ? true : Boolean(body.isVisible);

  try {
    const { data, error } = await guard.supabase
      .from("gallery_images")
      .insert({
        title,
        caption,
        category,
        image_url: imageUrl,
        storage_path: storagePath,
        sort_order: sortOrder,
        is_visible: isVisible,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(
      { image: mapGalleryImage(data as GalleryImageRow) },
      { status: 201 },
    );
  } catch (err) {
    console.error("Admin gallery create failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not add the image." },
      { status: 500 },
    );
  }
}
