"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/",          label: "HOME" },
  { href: "/#pricing",   label: "PRICING" },
  { href: "/#facilities",label: "FACILITIES" },
  { href: "/gallery",    label: "GALLERY" },
  { href: "/about",      label: "ABOUT" },
  { href: "/contact",    label: "CONTACT" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 w-full z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: "rgba(18,20,20,0.95)",
        borderColor: "rgba(68,73,51,0.3)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
      }}
    >
      <nav
        className="flex justify-between items-center h-20 mx-auto px-4 sm:px-8 md:px-16 max-w-screen-2xl"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="shrink-0 italic font-black tracking-tighter leading-none select-none transition-transform hover:scale-105"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "clamp(22px, 2.5vw, 30px)",
            color: "#c3f400",
            textDecoration: "none",
          }}
        >
          CHANDPUR TURF
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href) && link.href !== "/";
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block px-3 py-1.5 transition-colors duration-200 text-xs tracking-widest font-semibold",
                    isActive
                      ? "border-b-2 border-b-primary-container text-primary-container font-bold"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-bright/20 rounded"
                  )}
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Trailing actions */}
        <div className="flex items-center gap-3">
          {/* Contact phone quick button (desktop) */}
          <a
            href="tel:01777240317"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded border border-outline-variant/40 text-xs font-jetbrains text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-primary-container text-base">
              call
            </span>
            <span>01777-240317</span>
          </a>

          {/* Book Now CTA */}
          <Link
            href="/booking"
            className="flex items-center gap-2 px-5 py-2.5 uppercase font-bold tracking-wider transition-all duration-200 active:scale-95 shrink-0"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "16px",
              backgroundColor: "#c3f400",
              color: "#283500",
              borderRadius: "0.25rem",
              border: "2px solid #c3f400",
              boxShadow: "0 0 15px rgba(195,244,0,0.3)",
            }}
          >
            BOOK NOW
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
              sports_soccer
            </span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded border border-outline-variant/40 text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "26px" }}>
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t py-4 px-6"
          style={{
            backgroundColor: "#0c0f0f",
            borderColor: "rgba(68,73,51,0.4)",
          }}
        >
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-2.5 text-sm tracking-widest transition-colors font-jetbrains text-on-surface-variant hover:text-primary-container hover:bg-surface-bright/20 rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
