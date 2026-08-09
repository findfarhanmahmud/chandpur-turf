import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import type { GalleryImageRow } from "@/types/database";
import { mapGalleryImage } from "@/lib/admin/gallery";

export const dynamic = "force-dynamic";

// PATCH /api/admin/gallery/[id] — update title/caption/category/visibility/order.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};

  if ("title" in body) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "INVALID_TITLE", message: "Title is required." },
        { status: 400 },
      );
    }
    update.title = title;
  }
  if ("caption" in body) {
    update.caption =
      typeof body.caption === "string" && body.caption.trim()
        ? body.caption.trim()
        : null;
  }
  if ("category" in body) {
    update.category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "match";
  }
  if ("isVisible" in body) update.is_visible = Boolean(body.isVisible);
  if ("sortOrder" in body) update.sort_order = Number(body.sortOrder);

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "NO_CHANGES", message: "Nothing to update." },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await guard.supabase
      .from("gallery_images")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ image: mapGalleryImage(data as GalleryImageRow) });
  } catch (err) {
    console.error("Admin gallery update failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not update the image." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/gallery/[id] — removes the record and any stored object.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const { data: existing, error: fetchError } = await guard.supabase
      .from("gallery_images")
      .select("storage_path")
      .eq("id", id)
      .single();
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Image not found." },
        { status: 404 },
      );
    }

    if (existing.storage_path) {
      const { error: storageError } = await guard.supabase.storage
        .from("gallery-images")
        .remove([existing.storage_path]);
      if (storageError) {
        console.error("Gallery storage delete failed:", storageError);
      }
    }

    const { error } = await guard.supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin gallery delete failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not delete the image." },
      { status: 500 },
    );
  }
}
