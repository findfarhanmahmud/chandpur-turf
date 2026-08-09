import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/gallery/upload — multipart/form-data with a `file` field.
// Uploads to the "gallery-images" storage bucket (RLS: is_admin() only),
// returning the public URL + storage path for the caller to attach to a record.
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "NO_FILE", message: "Please choose an image to upload." },
      { status: 400 },
    );
  }

  const MAX_BYTES = 8 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "TOO_LARGE", message: "Image must be 8 MB or smaller." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "NOT_IMAGE", message: "Uploaded file must be an image." },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = /^(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : "jpg";
  const path = `admin/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  try {
    const { error } = await guard.supabase.storage
      .from("gallery-images")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      });
    if (error) throw error;

    const publicUrl = guard.supabase.storage.from("gallery-images").getPublicUrl(path)
      .data.publicUrl;

    return NextResponse.json({ imageUrl: publicUrl, storagePath: path });
  } catch (err) {
    console.error("Admin gallery upload failed:", err);
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: "Could not upload the image." },
      { status: 500 },
    );
  }
}
