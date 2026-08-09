import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import type { SiteSettingRow } from "@/types/database";
import type { AdminSetting } from "@/types/admin";

export const dynamic = "force-dynamic";

function mapSetting(row: SiteSettingRow): AdminSetting {
  return {
    key: row.key,
    value: row.value,
    isPublic: row.is_public,
    updatedAt: row.updated_at,
  };
}

// GET /api/admin/settings — all settings (public and private).
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { data, error } = await guard.supabase
      .from("site_settings")
      .select("*")
      .order("key");
    if (error) throw error;

    return NextResponse.json({
      settings: (data as SiteSettingRow[]).map(mapSetting),
    });
  } catch (err) {
    console.error("Admin settings fetch failed:", err);
    return NextResponse.json(
      { error: "UNAVAILABLE", message: "Could not load settings." },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/settings — upsert public business settings.
// { [key]: string } — each key is inserted/updated as a public setting.
export async function PATCH(request: Request) {
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

  const entries = Object.entries(body).filter(
    ([key, value]) => typeof key === "string" && key.trim() && typeof value === "string",
  );
  if (entries.length === 0) {
    return NextResponse.json(
      { error: "NO_CHANGES", message: "No valid settings provided." },
      { status: 400 },
    );
  }

  try {
    const rows = entries.map(([key, value]) => ({
      key: key.trim(),
      value: value as string,
      is_public: true,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await guard.supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw error;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("Admin settings update failed:", err);
    return NextResponse.json(
      { error: "FAILED", message: "Could not save settings." },
      { status: 500 },
    );
  }
}
