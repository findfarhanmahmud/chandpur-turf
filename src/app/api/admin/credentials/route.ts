import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-z0-9_.-]{3,30}$/;

// POST /api/admin/credentials  { newUsername, newPassword?, confirmPassword? }
// Requires an active admin session (verified from the HttpOnly cookie). Updates
// the username and optionally the password via the update_admin_credentials
// RPC. Changing the password revokes all sessions, including the current one,
// so the caller is told to sign in again.
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  let body: { newUsername?: unknown; newPassword?: unknown; confirmPassword?: unknown };
  try {
    body = (await request.json()) as {
      newUsername?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const newUsername = typeof body.newUsername === "string" ? body.newUsername.trim().toLowerCase() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!newUsername) {
    return NextResponse.json(
      { error: "INVALID_USERNAME", message: "Username is required." },
      { status: 400 },
    );
  }
  if (!USERNAME_RE.test(newUsername)) {
    return NextResponse.json(
      {
        error: "INVALID_USERNAME",
        message:
          "Username must be 3–30 characters using letters, numbers, dots, dashes or underscores.",
      },
      { status: 400 },
    );
  }

  const changePassword = Boolean(newPassword || confirmPassword);
  if (changePassword) {
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "WEAK_PASSWORD", message: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "PASSWORD_MISMATCH", message: "Passwords do not match." },
        { status: 400 },
      );
    }
  }

  // Service-role client behind the verified session; update_admin_credentials
  // raises INVALID_USERNAME / USERNAME_TAKEN / WEAK_PASSWORD on failure.
  const { error } = await guard.supabase.rpc("update_admin_credentials", {
    p_admin_id: guard.session.userId,
    p_username: newUsername,
    p_new_password: changePassword ? newPassword : null,
  });

  if (error) {
    const message =
      error.message === "USERNAME_TAKEN"
        ? "That username is already in use."
        : error.message === "WEAK_PASSWORD"
          ? "Password must be at least 8 characters."
          : "Could not update the credentials.";
    return NextResponse.json(
      { error: "CREDENTIALS_UPDATE_FAILED", message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    username: newUsername,
    sessionsRevoked: changePassword,
  });
}
