"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/types/admin";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
  { href: "/admin/bookings", icon: "event", label: "Bookings" },
  { href: "/admin/schedule", icon: "calendar_month", label: "Schedule" },
  { href: "/admin/pricing", icon: "sell", label: "Pricing" },
  { href: "/admin/gallery", icon: "photo_library", label: "Gallery" },
  { href: "/admin/facilities", icon: "sports_soccer", label: "Facilities" },
  { href: "/admin/settings", icon: "settings", label: "Settings" },
];

export default function AdminSidebar({
  session,
  open,
  onNavigate,
}: {
  session: AdminSession;
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#444933]/40 bg-[#0c0f0f] transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#444933]/40 px-5 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c3f400] font-bold text-[#283500]">
          CT
        </span>
        <div className="leading-tight">
          <p
            className="italic uppercase tracking-tighter text-white"
            style={{ fontFamily: "var(--font-oswald)", fontSize: "16px" }}
          >
            Chandpur Turf
          </p>
          <p
            className="text-[9px] uppercase tracking-[0.3em] text-[#c3f400]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Admin Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[#c3f400]/10 text-[#c3f400] shadow-[inset_2px_0_0_#c3f400]"
                  : "text-[#c4c9ac] hover:bg-[#1a1c1c] hover:text-white",
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#444933]/40 px-5 py-4">
        <p
          className="truncate text-[12px] text-white"
          style={{ fontFamily: "var(--font-work-sans)" }}
        >
          @{session.username}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#c4c9ac]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c3f400]" />
          {session.role.replace("_", " ")}
        </p>
      </div>
    </aside>
  );
}
