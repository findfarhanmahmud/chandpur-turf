import { NextResponse } from "next/server";

// Admin login disabled: proxy no longer redirects /admin to the login page.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
