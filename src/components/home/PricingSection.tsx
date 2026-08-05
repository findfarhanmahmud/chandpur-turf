"use client";

import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";

interface SlotRow {
  time: string;
  price: string;
}

interface SlotCardProps {
  title: string;
  icon: string;
  priceDisplay: string;
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
            / 60 MIN
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

const morningSlots: SlotRow[] = [
  { time: "5:00 AM – 6:00 AM",   price: "৳1,999" },
  { time: "6:00 AM – 7:00 AM",   price: "৳1,999" },
  { time: "7:00 AM – 8:00 AM",   price: "৳1,999" },
  { time: "8:00 AM – 9:00 AM",   price: "৳1,999" },
];

const daySlots: SlotRow[] = [
  { time: "9:00 AM – 10:00 AM",  price: "৳1,499" },
  { time: "10:00 AM – 11:00 AM", price: "৳1,499" },
  { time: "11:00 AM – 12:00 PM", price: "৳1,499" },
  { time: "12:00 PM – 1:00 PM",  price: "৳1,499" },
  { time: "1:00 PM – 2:00 PM",   price: "৳1,499" },
  { time: "2:00 PM – 3:00 PM",   price: "৳1,499" },
  { time: "3:00 PM – 4:00 PM",   price: "৳1,499" },
  { time: "4:00 PM – 5:00 PM",   price: "৳1,499" },
];

const nightSlots: SlotRow[] = [
  { time: "5:00 PM – 6:00 PM",   price: "৳2,499" },
  { time: "6:00 PM – 7:00 PM",   price: "৳2,499" },
  { time: "7:00 PM – 8:00 PM",   price: "৳2,499" },
  { time: "8:00 PM – 9:00 PM",   price: "৳2,499" },
  { time: "9:00 PM – 10:00 PM",  price: "৳2,499" },
  { time: "10:00 PM – 11:00 PM", price: "৳2,499" },
  { time: "11:00 PM – 12:00 AM", price: "৳2,499" },
  { time: "12:00 AM – 1:00 AM",  price: "৳2,499" },
  { time: "1:00 AM – 2:00 AM",   price: "৳2,499" },
  { time: "2:00 AM – 3:00 AM",   price: "৳2,499" },
];

export default function PricingSection() {
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
          subtitle="(60 MINUTES)"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Morning Card */}
          <SlotCard
            title="Morning Slot"
            icon="wb_twilight"
            priceDisplay="৳1,999"
            slots={morningSlots}
            headerBg="#1a2b16"
            priceBg="#142211"
            iconColor="#ffffff"
            footer={
              <div
                className="flex items-center gap-3 p-3 rounded border"
                style={{
                  backgroundColor: "#121414",
                  borderColor: "rgba(68,73,51,0.5)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "36px",
                    color: "#c3f400",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  timer
                </span>
                <p
                  className="italic leading-tight uppercase"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "18px",
                    color: "#ffffff",
                  }}
                >
                  60 Minutes Of
                  <br />
                  Pure Football
                  <br />
                  Experience!
                </p>
              </div>
            }
          />

          {/* Day Card (featured) */}
          <SlotCard
            title="Day Slot"
            icon="light_mode"
            priceDisplay="৳1,499"
            slots={daySlots}
            isFeatured
            headerBg="#c3f400"
            priceBg="#1f2800"
            iconColor="#283500"
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
            title="Night Slot"
            icon="dark_mode"
            priceDisplay="৳2,499"
            slots={nightSlots}
            headerBg="#111622"
            priceBg="#0c0f17"
            iconColor="#ffffff"
          />
        </div>
      </div>
    </section>
  );
}
