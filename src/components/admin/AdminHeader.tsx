"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/schedule": "Schedule",
  "/admin/pricing": "Pricing",
  "/admin/gallery": "Gallery",
  "/admin/facilities": "Facilities",
  "/admin/settings": "Settings",
};

export default function AdminHeader({
  onMenu,
}: {
  onMenu: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/admin/auth/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#444933]/40 bg-[#121414]/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg border border-[#444933] p-2 text-[#c4c9ac] hover:text-[#c3f400] lg:hidden"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <div>
          <h1
            className="italic uppercase tracking-tight text-white"
            style={{ fontFamily: "var(--font-oswald)", fontSize: "20px" }}
          >
            {TITLES[pathname] ?? "Admin"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-lg border border-[#444933] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#c4c9ac] transition-colors hover:border-[#c3f400] hover:text-[#c3f400] sm:inline-flex"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#93000a]/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#ffb4ab] transition-colors hover:bg-[#93000a]/20 disabled:opacity-50"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          {signingOut ? "..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
