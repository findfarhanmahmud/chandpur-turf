"use client";

import { facilities } from "@/data/facilities";
import SectionHeading from "@/components/shared/SectionHeading";

export default function FacilitiesSection() {
  return (
    <section
      id="facilities"
      className="py-20 relative overflow-hidden"
      style={{
        backgroundColor: "#0c0f0f",
        borderTop: "1px solid rgba(68,73,51,0.3)",
        paddingLeft: "clamp(16px, 5vw, 64px)",
        paddingRight: "clamp(16px, 5vw, 64px)",
      }}
    >
      {/* Background diagonal stripe texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage:
            "repeating-linear-gradient(45deg, #c3f400 0, #c3f400 1px, transparent 1px, transparent 10px)",
        }}
      />

      <div
        className="relative z-10"
        style={{ maxWidth: "1536px", margin: "0 auto" }}
      >
        <SectionHeading title="OUR FACILITIES" />

        <div
          className="grid gap-4 md:gap-6 rounded-xl p-6 backdrop-blur-sm"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            backgroundColor: "rgba(18,20,20,0.8)",
            border: "1px solid rgba(68,73,51,0.3)",
          }}
        >
          {facilities.map((facility) => (
            <div
              key={facility.label}
              className="flex flex-col items-center text-center p-3 rounded transition-colors cursor-default group hover:bg-surface-bright/20"
            >
              <span
                className="material-symbols-outlined mb-2 transition-colors text-white group-hover:text-primary-container"
                style={{
                  fontSize: "36px",
                  fontVariationSettings: "'wght' 200",
                }}
              >
                {facility.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "10px",
                  color: "#e2e2e2",
                  letterSpacing: "0.04em",
                  lineHeight: "1.4",
                }}
              >
                {facility.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
