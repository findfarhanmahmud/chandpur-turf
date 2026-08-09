"use client";

import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import FacilityCard from "@/components/home/FacilityCard";
import { useInView } from "@/hooks/useInView";
import { usePublicData } from "@/hooks/usePublicData";

export default function FacilitiesSection() {
  const { ref, inView } = useInView<HTMLElement>(0.08);
  const { data, fallback } = usePublicData();
  const facilities = data?.facilities ?? fallback.facilities;

  return (
    <section
      ref={ref}
      id="facilities"
      className="relative overflow-hidden"
      style={{
        backgroundColor: "#0c0f0f",
        borderTop: "1px solid rgba(68,73,51,0.3)",
        padding: "clamp(72px, 9vw, 112px) clamp(16px, 5vw, 64px)",
      }}
    >
      {/* Subtle diagonal stripe texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "repeating-linear-gradient(45deg, #c3f400 0, #c3f400 1px, transparent 1px, transparent 10px)",
        }}
      />

      {/* Faint green radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(195,244,0,0.06), transparent 70%)",
        }}
      />

      <div
        className="relative z-10"
        style={{ maxWidth: "1536px", margin: "0 auto" }}
      >
        <SectionHeading
          title="OUR FACILITIES"
          subtitle="Everything you need for the ultimate football experience."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {facilities.map((facility, index) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-16 text-center md:mt-20"
          style={{
            transform: inView ? "translateY(0)" : "translateY(24px)",
            opacity: inView ? 1 : 0,
            transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
          }}
        >
          <h3
            className="uppercase"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              color: "#ffffff",
            }}
          >
            Ready to <span className="text-primary-container">Play?</span>
          </h3>
          <p
            className="mx-auto mt-3 max-w-md tracking-widest text-on-surface-variant"
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "12px",
            }}
          >
            Experience Chandpur&apos;s premium football turf today.
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3 uppercase font-bold tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
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
            Book Your Slot
          </Link>
        </div>
      </div>
    </section>
  );
}
