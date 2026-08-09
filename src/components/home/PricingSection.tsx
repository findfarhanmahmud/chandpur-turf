"use client";

import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import type { SlotCategory } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import { usePublicData } from "@/hooks/usePublicData";
import { buildCategoryConfigs } from "@/lib/booking/categories";

interface SlotRow {
  time: string;
  price: string;
}

interface SlotCardProps {
  title: string;
  icon: string;
  priceDisplay: string;
  durationMinutes: number;
  slots: SlotRow[];
  isFeatured?: boolean;
  headerBg: string;
  priceBg: string;
  iconColor: string;
  footer?: React.ReactNode;
}

function SlotCard({
  title,
  icon,
  priceDisplay,
  durationMinutes,
  slots,
  isFeatured,
  headerBg,
  priceBg,
  iconColor,
  footer,
}: SlotCardProps) {
  return (
    <div
      className={`flex flex-col h-full rounded-lg overflow-hidden shadow-lg transition-colors relative ${
        isFeatured ? "transform md:-translate-y-4 shadow-2xl" : ""
      }`}
      style={{
        backgroundColor: "#1e2020",
        border: isFeatured
          ? "1px solid #c3f400"
          : "1px solid rgba(142,147,121,0.3)",
        boxShadow: isFeatured
          ? "0 0 10px rgba(195,244,0,0.2)"
          : undefined,
      }}
    >
      {/* Best Value badge */}
      {isFeatured && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 z-10 shadow-md"
          style={{
            backgroundColor: "#c3f400",
            color: "#283500",
            fontFamily: "var(--font-jetbrains)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            fontWeight: 700,
            borderRadius: "0 0 4px 4px",
          }}
        >
          BEST VALUE
        </div>
      )}

      {/* Card Header */}
      <div
        className="py-3 px-6 flex items-center justify-center gap-2 border-b"
        style={{
          backgroundColor: headerBg,
          borderColor: isFeatured ? "#aacc00" : "rgba(142,147,121,0.3)",
          paddingTop: isFeatured ? "24px" : undefined,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            color: iconColor,
            fontSize: "22px",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {icon}
        </span>
        <h3
          className="font-bold uppercase tracking-wide"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "20px",
            color: isFeatured ? "#283500" : "#ffffff",
          }}
        >
          {title}
        </h3>
      </div>

      {/* Price header */}
      <div
        className="py-3 text-center border-b-2"
        style={{
          backgroundColor: priceBg,
          borderColor: isFeatured ? "rgba(195,244,0,0.5)" : "#c3f400",
        }}
      >
        <p
          className="font-black"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "26px",
            color: "#c3f400",
          }}
        >
          {priceDisplay}{" "}
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "13px",
              color: "#ffffff",
              fontWeight: 400,
            }}
          >
            / {durationMinutes} MIN
          </span>
        </p>
      </div>

      {/* Slot list */}
      <div
        className={`p-6 flex-grow ${isFeatured ? "stadium-glow" : ""}`}
      >
        {/* Column headers */}
        <div
          className="flex justify-between pb-2 mb-3"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "12px",
            color: "#c4c9ac",
            borderBottom: "1px solid rgba(68,73,51,0.3)",
            letterSpacing: "0.08em",
          }}
        >
          <span>TIME</span>
          <span>PRICE</span>
        </div>
        <ul className="flex flex-col gap-3">
          {slots.map((slot) => (
            <li
              key={slot.time}
              className="flex justify-between items-center group cursor-pointer"
            >
              <div
                className="flex items-center gap-2 transition-colors group-hover:text-primary"
                style={{ color: "#e2e2e2" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "16px",
                    color: isFeatured ? "rgba(195,244,0,0.7)" : "#8e9379",
                  }}
                >
                  schedule
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-work-sans)",
                    fontSize: "16px",
                  }}
                >
                  {slot.time}
                </span>
              </div>
              <span
                className="font-bold"
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: "18px",
                  color: isFeatured ? "#c3f400" : "#ffffff",
                }}
              >
                {slot.price}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      {footer && <div className="px-6 pb-6 mt-auto">{footer}</div>}
    </div>
  );
}

const CARD_STYLES: Record<SlotCategory, {
  headerBg: string;
  priceBg: string;
  iconColor: string;
}> = {
  day: { headerBg: "#c3f400", priceBg: "#1f2800", iconColor: "#283500" },
  night: { headerBg: "#111622", priceBg: "#0c0f17", iconColor: "#ffffff" },
};

export default function PricingSection() {
  const { data, fallback } = usePublicData();
  const slots = data?.slots ?? fallback.slots;
  const categoryConfig = buildCategoryConfigs(slots);

  const buildSlotRows = (category: SlotCategory): SlotRow[] =>
    slots
      .filter((s) => s.category === category)
      .map((slot) => ({
        time: `${slot.time} \u2013 ${slot.endTime}`,
        price: formatPrice(slot.price),
      }));

  return (
    <section
      id="pricing"
      className="py-20 turf-pattern"
      style={{
        backgroundColor: "#121414",
        paddingLeft: "clamp(16px, 5vw, 64px)",
        paddingRight: "clamp(16px, 5vw, 64px)",
      }}
    >
      <div style={{ maxWidth: "1536px", margin: "0 auto" }}>
        <SectionHeading
          title="SLOT TIMING & PRICING"
          subtitle={`(${categoryConfig.day.durationMinutes} MINUTES)`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Day Card (featured) */}
          <SlotCard
            title={categoryConfig.day.label}
            icon={categoryConfig.day.icon}
            priceDisplay={formatPrice(categoryConfig.day.price)}
            durationMinutes={categoryConfig.day.durationMinutes}
            slots={buildSlotRows("day")}
            isFeatured
            headerBg={CARD_STYLES.day.headerBg}
            priceBg={CARD_STYLES.day.priceBg}
            iconColor={CARD_STYLES.day.iconColor}
            footer={
              <Link
                href="/booking"
                className="block w-full text-center py-3 uppercase tracking-wider font-bold transition-all hover:bg-[#abd600] active:scale-95"
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: "18px",
                  backgroundColor: "#c3f400",
                  color: "#283500",
                  borderRadius: "0.125rem",
                  textDecoration: "none",
                }}
              >
                BOOK DAY SLOT
              </Link>
            }
          />

          {/* Night Card */}
          <SlotCard
            title={categoryConfig.night.label}
            icon={categoryConfig.night.icon}
            priceDisplay={formatPrice(categoryConfig.night.price)}
            durationMinutes={categoryConfig.night.durationMinutes}
            slots={buildSlotRows("night")}
            headerBg={CARD_STYLES.night.headerBg}
            priceBg={CARD_STYLES.night.priceBg}
            iconColor={CARD_STYLES.night.iconColor}
          />
        </div>
      </div>
    </section>
  );
}
