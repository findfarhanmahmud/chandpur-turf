import { createElement } from "react";
import type { PublicFacility } from "@/types/booking";
import { getFacilityIcon } from "@/lib/facility-icons";

interface FacilityCardProps {
  facility: PublicFacility;
  index: number;
  inView: boolean;
}

const STAGGER_DELAY = 60;

export default function FacilityCard({
  facility,
  index,
  inView,
}: FacilityCardProps) {
  const Icon = getFacilityIcon(facility.icon);

  return (
    <div
      className="h-full transition-all duration-500 ease-out"
      style={{
        transform: inView ? "translateY(0)" : "translateY(28px)",
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${index * STAGGER_DELAY}ms` : "0ms",
      }}
    >
      <div
        className="group flex h-full cursor-pointer flex-col items-center rounded-xl p-5 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary-container hover:bg-surface-container hover:shadow-[0_0_20px_rgba(195,244,0,0.25)] sm:p-6"
        style={{
          backgroundColor: "#1a1c1c",
          border: "1px solid rgba(68,73,51,0.4)",
        }}
      >
        {createElement(Icon, {
          className: "mb-4 text-white transition-colors duration-300 group-hover:text-primary-container",
          size: 52,
          strokeWidth: 1.5,
          "aria-hidden": true,
        })}
        <h3
          className="uppercase text-on-surface"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "clamp(14px, 1.4vw, 16px)",
            letterSpacing: "0.02em",
            lineHeight: "1.3",
          }}
        >
          {facility.label}
        </h3>
        <div
          className="mt-3 mb-4 h-px w-10 transition-colors duration-300 group-hover:bg-primary-container"
          style={{ backgroundColor: "rgba(142,147,121,0.4)" }}
        />
        <p
          className="flex-1 text-on-surface-variant"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "11px",
            lineHeight: "1.6",
            letterSpacing: "0.02em",
          }}
        >
          {facility.description}
        </p>
      </div>
    </div>
  );
}
