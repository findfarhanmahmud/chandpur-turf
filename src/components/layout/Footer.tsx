"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { usePublicData } from "@/hooks/usePublicData";
import { buildCategoryConfigs } from "@/lib/booking/categories";

const quickLinks = [
  { href: "/",        label: "Home" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#facilities", label: "Facilities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-primary font-bold uppercase tracking-wider text-sm border-b-2 border-primary-container pb-3 mb-6 inline-flex items-center gap-2"
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      <span className="w-1.5 h-5 bg-primary-container rounded-sm" />
      {children}
    </h4>
  );
}

export default function Footer() {
  const { data, fallback } = usePublicData();
  const settings = data?.settings ?? fallback.settings;
  const categoryConfig = buildCategoryConfigs(data?.slots ?? fallback.slots);

  const contactInfo = [
    {
      icon: "call",
      label: "Phone",
      value: settings.phone ?? "01777-240317",
      href: `tel:${(settings.phone ?? "01777-240317").replace(/[^0-9+]/g, "")}`,
    },
    {
      icon: "chat",
      label: "WhatsApp",
      value: settings.whatsapp ?? "01856-822363",
      href: `https://wa.me/${(settings.booking_whatsapp_international ?? "8801856822363").replace(/[^0-9+]/g, "")}`,
    },
    {
      icon: "location_on",
      label: "Address",
      value: settings.location ?? "Bangabandhu Road, Chandpur Sadar, Chandpur",
      href: `https://maps.google.com/?q=${encodeURIComponent(
        settings.map_query ?? "Bangabandhu Road Chandpur Sadar Bangladesh",
      )}`,
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="w-full border-t-2 text-on-surface"
      style={{
        backgroundColor: "#0c0f0f",
        borderColor: "#c3f400",
      }}
    >
      {/* Main Footer Grid */}
      <div className="mx-auto py-14 px-4 sm:px-8 md:px-16 max-w-screen-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Column 1: Brand (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link
              href="/"
              className="italic font-black tracking-tighter leading-none inline-block select-none transition-transform hover:scale-105"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "clamp(26px, 3vw, 32px)",
                color: "#c3f400",
                textDecoration: "none",
              }}
            >
              CHANDPUR TURF
            </Link>

            <p
              className="leading-relaxed max-w-sm"
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "14px",
                color: "#c4c9ac",
              }}
            >
              Chandpur&apos;s premier football destination. Experience FIFA Quality Pro 47mm synthetic turf with high-power LED floodlights for daytime &amp; night matches.
            </p>

            <p
              className="font-bold tracking-widest text-xs uppercase text-primary-container"
              style={{
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              PLAY HARD • PLAY SMART • PLAY AT CHANDPUR TURF
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-1">
              <a
                href={settings.facebook_url ?? "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all border border-outline-variant/40 hover:border-primary-container hover:bg-primary-container hover:text-on-primary text-on-surface-variant"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a
                href={settings.instagram_url ?? "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all border border-outline-variant/40 hover:border-primary-container hover:bg-primary-container hover:text-on-primary text-on-surface-variant"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  />
                </svg>
              </a>

              <a
                href={`https://wa.me/${(settings.booking_whatsapp_international ?? "8801856822363").replace(/[^0-9+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all border border-outline-variant/40 hover:border-primary-container hover:bg-primary-container hover:text-on-primary text-on-surface-variant"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 flex flex-col">
            <ColumnHeading>Quick Links</ColumnHeading>
            <ul className="flex flex-col gap-1 font-work-sans text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 py-1.5 text-on-surface-variant hover:text-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary-container opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                      chevron_right
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Information (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <ColumnHeading>Contact Information</ColumnHeading>
            <ul className="flex flex-col gap-3 font-work-sans text-sm">
              {contactInfo.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    {...(item.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex items-start gap-3 py-1.5 text-on-surface-variant hover:text-primary-container transition-colors"
                  >
                    <span className="w-8 h-8 rounded border border-primary-container/30 bg-primary-container/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary-container group-hover:text-on-primary">
                      <span className="material-symbols-outlined text-primary-container group-hover:text-on-primary" style={{ fontSize: "17px" }}>
                        {item.icon}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-jetbrains text-[10px] uppercase tracking-widest text-outline mb-0.5">
                        {item.label}
                      </span>
                      <strong className="text-primary font-semibold break-words">
                        {item.value}
                      </strong>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Hours & CTA (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <ColumnHeading>Opening Hours</ColumnHeading>
            <div className="flex flex-col gap-2.5 font-work-sans text-xs">
              <div className="flex justify-between items-center bg-primary-container/10 p-2.5 rounded border border-primary-container/40">
                <span className="text-primary-container flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-primary-container text-base">light_mode</span>
                  Day Slot
                </span>
                <span className="font-bold text-primary-container font-oswald text-sm">{formatPrice(categoryConfig.day.price)}</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container/60 p-2.5 rounded border border-outline-variant/30">
                <span className="text-on-surface flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-base">dark_mode</span>
                  Night Slot
                </span>
                <span className="font-bold text-primary font-oswald text-sm">{formatPrice(categoryConfig.night.price)}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-jetbrains mt-1">
                Open 7 days a week: {settings.hours ?? "5:00 AM \u2013 3:30 AM"}
              </p>
            </div>

            <Link
              href="/booking"
              className="mt-5 inline-flex items-center justify-center gap-2 py-3 px-4 uppercase tracking-wider font-bold transition-all hover:bg-[#abd600] active:scale-95"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "15px",
                backgroundColor: "#c3f400",
                color: "#283500",
                borderRadius: "0.25rem",
                border: "2px solid #c3f400",
                textDecoration: "none",
              }}
            >
              BOOK YOUR SLOT NOW
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
                sports_soccer
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div
        className="border-t py-6 px-4 sm:px-8 md:px-16"
        style={{ borderColor: "rgba(68,73,51,0.3)" }}
      >
        <div className="mx-auto max-w-screen-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-jetbrains text-on-surface-variant">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} CHANDPUR TURF. All rights reserved. Built for sports excellence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-primary-container transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary-container transition-colors">
              Terms &amp; Conditions
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex items-center gap-1 text-primary-container hover:underline transition-colors font-bold ml-2"
            >
              <span>TOP</span>
              <span className="material-symbols-outlined text-base">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
