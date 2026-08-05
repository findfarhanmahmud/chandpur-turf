"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";

const stats = [
  { value: "5,000+", label: "Matches Played" },
  { value: "47mm",   label: "FIFA Quality Turf" },
  { value: "21+",    label: "World-Class Amenities" },
  { value: "100%",   label: "LED Floodlight Coverage" },
];

const highlights = [
  {
    title: "FIFA Quality Pro 47mm Artificial Turf",
    desc: "Engineered for optimal ball roll, shock absorption, and player joint safety. Play like a pro with minimal injury risk.",
    icon: "grass",
  },
  {
    title: "High-Power Night Floodlighting",
    desc: "Stadium-grade LED light coverage eliminates shadows for crystal-clear visibility during late night football sessions.",
    icon: "tungsten",
  },
  {
    title: "Full Match & Tournament Facilities",
    desc: "Includes spacious changing rooms, pure drinking water, professional goalposts, match footballs, and spectator seating.",
    icon: "emoji_events",
  },
  {
    title: "Safe & Secure Sports Environment",
    desc: "24/7 CCTV surveillance, secure vehicle parking, clean washrooms, and first aid support on standby for every match.",
    icon: "verified_user",
  },
];

const facilityFeatures = [
  {
    title: "Premium 47mm Artificial Turf",
    desc: "FIFA Quality Pro certified surface for a true professional playing experience.",
    icon: "grass",
  },
  {
    title: "LED Floodlights",
    desc: "High-power lighting that turns night into day, perfect for evening kick-offs.",
    icon: "tungsten",
  },
  {
    title: "Professional Environment",
    desc: "Changing rooms, match balls, goalposts, and seating built for serious play.",
    icon: "workspace_premium",
  },
  {
    title: "Safe & Clean",
    desc: "24/7 CCTV, regular cleaning, pure drinking water, and first aid on standby.",
    icon: "health_and_safety",
  },
  {
    title: "Tournament Hosting",
    desc: "Full support for local leagues, corporate tournaments, and private events.",
    icon: "emoji_events",
  },
  {
    title: "Night Matches",
    desc: "Shadowless stadium lighting for thrilling late-night football under the lights.",
    icon: "mode_night",
  },
];

const galleryPreview = [
  {
    src: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop",
    title: "Night Floodlighting",
  },
  {
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
    title: "Premium Pitch",
  },
  {
    src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
    title: "Match Day",
  },
];

export default function AboutContent() {
  return (
    <div className="flex flex-col gap-20">
      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden rounded-2xl border border-outline-variant/30 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1600&auto=format&fit=crop"
            alt="Football stadium illuminated at night with bright floodlights"
            fill
            className="object-cover object-center"
            style={{ opacity: 0.45 }}
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, #121414 0%, rgba(18,20,20,0.9) 55%, rgba(18,20,20,0.55) 100%)",
            }}
          />
        </div>

        <div className="relative z-20 py-20 sm:py-24 px-6 sm:px-12 text-center flex flex-col items-center">
          <span
            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary-container/40 bg-primary-container/10 text-primary-container font-bold uppercase tracking-widest text-xs"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            Established In Chandpur
          </span>

          <h1
            className="italic font-black uppercase tracking-tighter leading-none mt-6 neon-text"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(40px, 7vw, 76px)",
              color: "#ffffff",
            }}
          >
            About{" "}
            <span style={{ color: "#c3f400" }}>Chandpur Turf</span>
          </h1>

          <p
            className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{
              fontFamily: "var(--font-work-sans)",
              color: "#c4c9ac",
            }}
          >
            Empowering football passion with elite, professional-grade turf infrastructure built for Chandpur&apos;s players.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
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
              Book a Pitch Slot
              <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                sports_soccer
              </span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 py-3.5 px-7 uppercase tracking-wider font-bold transition-all active:scale-95 border border-primary-container/50 bg-surface-container/70 backdrop-blur-sm hover:bg-primary-container hover:text-on-primary rounded shadow-lg"
              style={{ fontFamily: "var(--font-oswald)", fontSize: "15px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                call
              </span>
              Contact Management
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span
            className="font-jetbrains text-primary-container text-xs tracking-widest font-bold uppercase"
          >
            ABOUT CHANDPUR TURF
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black italic uppercase text-primary leading-tight"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            A Premier Football Destination in{" "}
            <span className="neon-text" style={{ color: "#c3f400" }}>
              Chandpur Sadar
            </span>
          </h2>
          <p className="font-work-sans text-on-surface-variant text-base leading-relaxed">
            Chandpur Turf was built with a single mission: to provide football enthusiasts, youth academies, and local teams in Chandpur Sadar with an elite, professional-grade playing surface accessible 7 days a week.
          </p>
          <p className="font-work-sans text-on-surface-variant text-base leading-relaxed">
            Whether you&apos;re getting together for a casual 60-minute friendly match after work, organizing a competitive neighborhood tournament, or hosting a private corporate event, Chandpur Turf offers an unparalleled sports experience.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant/30 shadow-lg hover:border-primary-container/50 transition-colors"
              >
                <p
                  className="text-2xl sm:text-3xl font-black text-primary-container mb-1"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.value}
                </p>
                <p className="font-jetbrains text-[10px] text-on-surface-variant uppercase tracking-wider leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 relative h-[320px] sm:h-[420px] rounded-xl overflow-hidden shadow-2xl border border-primary-container/30">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHC7Zozf98N9q9yErEMiJOxeQQGA5Vxcgd6LjzHTQA8vZBHQ9N8iie6_mmZzGq7eYVezlKHEUqi-pg3_tgbr0pmYOzM4yUjvI3kVMgAVDcbVmf7hY3a4fRV1xIyQs3yhVPYVjyNuMFazLYFwxeuZhbPZF2_DMeGqwDvrXxM-6wT_J0nGPujfbBlnKdywlnMLFij-LGImhk7VsKs-aNO-X9SDSXzgZEr__BA2anYa1rWBfuHmQgwtmeLw"
            alt="Chandpur Turf artificial grass football pitch illuminated under night floodlights"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-surface-dim/80 backdrop-blur-md rounded border border-outline-variant/30 text-center">
            <p className="font-jetbrains text-xs text-primary-container font-bold uppercase">
              FIFA QUALITY PRO 47MM SYNTHETIC TURF
            </p>
          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section>
        <SectionHeading title="OUR MISSION" />
        <div className="relative max-w-3xl mx-auto bg-surface-container rounded-2xl p-8 sm:p-10 border border-primary-container/30 shadow-xl overflow-hidden text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage:
                "repeating-linear-gradient(45deg, #c3f400 0, #c3f400 1px, transparent 1px, transparent 12px)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-5">
            <span className="w-14 h-14 rounded-full bg-primary-container/10 border border-primary-container/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                sports_soccer
              </span>
            </span>
            <p
              className="italic font-bold text-xl sm:text-2xl leading-relaxed"
              style={{ fontFamily: "var(--font-oswald)", color: "#ffffff" }}
            >
              &ldquo;To give every football lover in Chandpur access to a world-class playing surface,
              day or night, in a safe, clean, and truly professional environment.&rdquo;
            </p>
            <p
              className="text-xs uppercase tracking-widest text-primary-container font-bold"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Play Hard • Play Smart • Play At Chandpur Turf
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section>
        <SectionHeading title="WHY CHOOSE CHANDPUR TURF" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="bg-surface-container/80 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/30 flex gap-4 items-start hover:border-primary-container/60 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center shrink-0 group-hover:bg-primary-container group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-primary-container group-hover:text-on-primary text-2xl">
                  {item.icon}
                </span>
              </div>
              <div>
                <h3
                  className="text-xl font-bold uppercase text-primary mb-2"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.title}
                </h3>
                <p className="font-work-sans text-on-surface-variant text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= OUR FACILITIES ================= */}
      <section>
        <SectionHeading title="OUR FACILITIES" subtitle="EVERYTHING YOU NEED FOR THE PERFECT MATCH" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilityFeatures.map((item) => (
            <div
              key={item.title}
              className="group bg-surface-container rounded-xl border border-outline-variant/30 p-6 shadow-lg transition-all hover:border-primary-container/60 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center mb-4 group-hover:bg-primary-container group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-primary-container group-hover:text-on-primary" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>
              <h3
                className="text-lg font-bold uppercase text-primary mb-2"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {item.title}
              </h3>
              <p className="font-work-sans text-on-surface-variant text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= GALLERY PREVIEW CTA ================= */}
      <section>
        <SectionHeading title="LIFE AT CHANDPUR TURF" subtitle="A SNEAK PEEK INTO THE EXPERIENCE" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {galleryPreview.map((img) => (
            <div
              key={img.title}
              className="group relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 shadow-lg h-[240px]"
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold uppercase text-primary" style={{ fontFamily: "var(--font-oswald)" }}>
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 py-3 px-8 bg-surface-bright/50 hover:bg-primary-container hover:text-on-primary text-primary font-oswald uppercase text-base font-bold rounded border border-outline-variant/40 transition-all active:scale-95 shadow-lg"
          >
            Explore Full Gallery
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ================= BOOK NOW CTA ================= */}
      <section className="relative rounded-2xl overflow-hidden border border-primary-container/40 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop"
            alt="Stadium floodlights glowing above a football pitch at night"
            fill
            className="object-cover object-center"
            loading="lazy"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(18,20,20,0.96) 0%, rgba(18,20,20,0.8) 50%, rgba(18,20,20,0.96) 100%)",
            }}
          />
        </div>

        <div className="relative z-20 py-16 sm:py-20 px-6 sm:px-12 text-center flex flex-col items-center">
          <h2
            className="italic font-black uppercase tracking-tighter leading-none neon-text"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(32px, 5vw, 60px)",
              color: "#ffffff",
            }}
          >
            Ready To{" "}
            <span style={{ color: "#c3f400" }}>Play?</span>
          </h2>
          <p
            className="mt-4 max-w-xl text-base leading-relaxed"
            style={{
              fontFamily: "var(--font-work-sans)",
              color: "#c4c9ac",
            }}
          >
            Book your 60-minute slot now and experience Chandpur&apos;s best football surface —
            morning, day, or night.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 py-3.5 px-8 uppercase tracking-wider font-bold transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "16px",
                backgroundColor: "#c3f400",
                color: "#283500",
                borderRadius: "0.25rem",
                border: "2px solid #c3f400",
                boxShadow: "0 0 25px rgba(195,244,0,0.4)",
              }}
            >
              BOOK YOUR SLOT NOW
              <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                sports_soccer
              </span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 py-3.5 px-8 uppercase tracking-wider font-bold transition-all active:scale-95 border border-primary-container/50 bg-surface-container/70 backdrop-blur-sm hover:bg-primary-container hover:text-on-primary rounded shadow-lg"
              style={{ fontFamily: "var(--font-oswald)", fontSize: "16px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                call
              </span>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
