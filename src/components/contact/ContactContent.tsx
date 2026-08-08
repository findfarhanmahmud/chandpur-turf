"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHeading from "@/components/shared/SectionHeading";

const contactCards = [
  {
    icon: "call",
    title: "Phone",
    value: "01777-240317",
    hint: "Direct call for slot booking & inquiries",
    action: "Call Now",
    href: "tel:01777240317",
    external: false,
  },
  {
    icon: "chat",
    title: "WhatsApp",
    value: "01856-822363",
    hint: "Send us a message for quick assistance",
    action: "Chat Now",
    href: "https://wa.me/8801856822363",
    external: true,
  },
  {
    icon: "location_on",
    title: "Address",
    value: "Bangabandhu Road, Chandpur Sadar, Chandpur",
    hint: "Easily accessible from all parts of Chandpur",
    action: "Get Directions",
    href: "https://maps.google.com/?q=Bangabandhu+Road+Chandpur+Sadar+Bangladesh",
    external: true,
  },
  {
    icon: "groups",
    title: "Facebook",
    value: "Chandpur Turf",
    hint: "Follow us for updates, leagues & events",
    action: "Visit Page",
    href: "https://facebook.com",
    external: true,
  },
  {
    icon: "photo_camera",
    title: "Instagram",
    value: "@chandpurturf",
    hint: "Match photos, highlights & behind the scenes",
    action: "Follow Us",
    href: "https://instagram.com",
    external: true,
  },
];

const actionButtons = [
  {
    icon: "call",
    label: "Call Now",
    href: "tel:01777240317",
    external: false,
  },
  {
    icon: "chat",
    label: "WhatsApp",
    href: "https://wa.me/8801856822363",
    external: true,
  },
  {
    icon: "directions",
    label: "Get Directions",
    href: "https://www.google.com/maps/dir/?api=1&destination=Bangabandhu+Road+Chandpur+Sadar+Bangladesh",
    external: true,
  },
];

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-20">
      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden rounded-2xl border border-outline-variant/30 shadow-2xl">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHC7Zozf98N9q9yErEMiJOxeQQGA5Vxcgd6LjzHTQA8vZBHQ9N8iie6_mmZzGq7eYVezlKHEUqi-pg3_tgbr0pmYOzM4yUjvI3kVMgAVDcbVmf7hY3a4fRV1xIyQs3yhVPYVjyNuMFazLYFwxeuZhbPZF2_DMeGqwDvrXxM-6wT_J0nGPujfbBlnKdywlnMLFij-LGImhk7VsKs-aNO-X9SDSXzgZEr__BA2anYa1rWBfuHmQgwtmeLw"
            alt="Chandpur Turf pitch illuminated under stadium floodlights at night"
            fill
            className="object-cover object-center"
            style={{ opacity: 0.4 }}
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, #121414 0%, rgba(18,20,20,0.92) 55%, rgba(18,20,20,0.6) 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-20 py-20 sm:py-24 px-6 sm:px-12 text-center flex flex-col items-center">
          <span
            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary-container/40 bg-primary-container/10 text-primary-container font-bold uppercase tracking-widest text-xs"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            We&apos;re Here To Help
          </span>

          <h1
            className="italic font-black uppercase tracking-tighter leading-none mt-6 neon-text"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(40px, 7vw, 76px)",
              color: "#ffffff",
            }}
          >
            Contact{" "}
            <span style={{ color: "#c3f400" }}>Chandpur Turf</span>
          </h1>

          <p
            className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{
              fontFamily: "var(--font-work-sans)",
              color: "#c4c9ac",
            }}
          >
            Get in touch with us to book your next match.
          </p>

          {/* Hero action buttons */}
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {actionButtons.map((btn) =>
              btn.external ? (
                <a
                  key={btn.label}
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3.5 px-7 uppercase tracking-wider font-bold transition-all active:scale-95 border border-primary-container/50 bg-surface-container/70 backdrop-blur-sm hover:bg-primary-container hover:text-on-primary rounded shadow-lg"
                  style={{ fontFamily: "var(--font-oswald)", fontSize: "15px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {btn.icon}
                  </span>
                  {btn.label}
                </a>
              ) : (
                <a
                  key={btn.label}
                  href={btn.href}
                  className="inline-flex items-center gap-2 py-3.5 px-7 uppercase tracking-wider font-bold transition-all active:scale-95"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "15px",
                    backgroundColor: "#c3f400",
                    color: "#283500",
                    borderRadius: "0.25rem",
                    border: "2px solid #c3f400",
                    boxShadow: "0 0 20px rgba(195,244,0,0.35)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                    {btn.icon}
                  </span>
                  {btn.label}
                </a>
              )
            )}
          </div>
        </div>
      </section>

      {/* ================= CONTACT CARDS ================= */}
      <section>
        <SectionHeading title="GET IN TOUCH" subtitle="REACH US ANY WAY YOU PREFER" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col gap-4 bg-surface-container rounded-xl border border-outline-variant/30 p-6 shadow-lg transition-all hover:border-primary-container/60 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center transition-all group-hover:bg-primary-container group-hover:text-on-primary">
                  <span className="material-symbols-outlined text-primary-container group-hover:text-on-primary" style={{ fontSize: "26px" }}>
                    {card.icon}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-all -translate-x-1 group-hover:translate-x-0" style={{ fontSize: "20px" }}>
                  arrow_forward
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-bold uppercase text-primary mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                  {card.title}
                </h3>
                <p className="font-jetbrains text-primary-container font-semibold text-sm break-words mb-1.5">
                  {card.value}
                </p>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {card.hint}
                </p>
              </div>

              <span className="mt-auto pt-2 text-xs uppercase tracking-widest font-bold text-primary-container inline-flex items-center gap-1.5">
                {card.action}
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ================= MAP + FORM ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Map & hours */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Google Maps placeholder */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden shadow-xl">
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "24px" }}>
                    map
                  </span>
                </span>
                <div>
                  <h3 className="text-lg font-bold uppercase text-primary leading-tight" style={{ fontFamily: "var(--font-oswald)" }}>
                    Find Us On Google Maps
                  </h3>
                  <p className="text-on-surface-variant text-xs font-work-sans">
                    Bangabandhu Road, Chandpur Sadar
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-4 h-[280px] sm:h-[320px] w-full bg-surface-container-high">
              <iframe
                src="https://www.google.com/maps?q=Bangabandhu%20Road%20Chandpur%20Sadar%20Bangladesh&z=14&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                title="Chandpur Turf location on Google Maps"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6 flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Bangabandhu+Road+Chandpur+Sadar+Bangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-container text-on-primary font-oswald uppercase font-bold text-sm rounded hover:bg-primary-fixed transition-colors"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Open Map
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Bangabandhu+Road+Chandpur+Sadar+Bangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-bright/40 text-primary font-oswald uppercase font-bold text-sm rounded border border-outline-variant/50 hover:bg-surface-bright/80 transition-colors"
              >
                <span className="material-symbols-outlined text-base">directions</span>
                Get Directions
              </a>
            </div>
          </div>

          {/* Operating hours */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "24px" }}>
                  schedule
                </span>
              </span>
              <h3 className="text-lg font-bold uppercase text-primary leading-tight" style={{ fontFamily: "var(--font-oswald)" }}>
                Operating Hours
              </h3>
            </div>
            <p className="text-on-surface-variant text-sm font-work-sans mb-1">
              Monday – Sunday (7 Days a Week)
            </p>
            <p className="font-jetbrains text-primary-container font-semibold text-sm">
              5:00 AM – 3:30 AM (Including Night Floodlight Matches)
            </p>
          </div>
        </div>

        {/* Right: Send Us a Message Form */}
        <div className="lg:col-span-7 bg-surface-container rounded-xl border border-outline-variant/30 p-6 sm:p-8 shadow-xl">
          <h2
            className="text-3xl font-bold text-primary uppercase italic mb-2"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Send Us a Message
          </h2>
          <p className="text-on-surface-variant text-sm mb-6 font-work-sans">
            Have questions about tournament hosting, bulk slot booking, or facilities? Drop us a message below.
          </p>

          {submitted ? (
            <div className="bg-tertiary-container/20 border border-tertiary-container text-tertiary-container p-6 rounded-lg text-center my-8">
              <span className="material-symbols-outlined text-5xl mb-2">task_alt</span>
              <h3 className="font-oswald text-2xl font-bold uppercase mb-2">Thank You!</h3>
              <p className="font-work-sans text-sm text-on-surface">
                Your message has been received. Our team will get back to you shortly on your provided phone number or email.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", phone: "", email: "", subject: "General Inquiry", message: "" });
                }}
                className="mt-6 py-2 px-6 bg-primary-container text-on-primary font-oswald text-sm font-bold uppercase rounded"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-jetbrains text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hossain"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded px-4 py-3 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jetbrains text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded px-4 py-3 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-jetbrains text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded px-4 py-3 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jetbrains text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/60 rounded px-4 py-3 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Tournament Hosting">Tournament &amp; League Hosting</option>
                    <option value="Corporate Booking">Corporate Booking</option>
                    <option value="Private Event">Birthday / Private Party</option>
                    <option value="Feedback">Feedback &amp; Suggestions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-jetbrains text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your message or details about your booking requirement..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface border border-outline-variant/60 rounded px-4 py-3 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-4 px-8 bg-primary-container text-on-primary font-oswald text-lg font-bold uppercase tracking-wider rounded shadow-xl hover:bg-primary-fixed transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
              >
                {loading ? "Sending..." : "Submit Inquiry"}
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
