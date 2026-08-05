"use client";

import { type TimeSlot } from "@/types/booking";
import { formatDate, formatPrice } from "@/lib/utils";
import { combineTimeRange, getTotalDurationMinutes, getTotalPrice } from "@/lib/booking";

interface BookingSummaryProps {
  selectedDate: Date | null;
  selectedSlots: TimeSlot[];
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function BookingSummary({
  selectedDate,
  selectedSlots,
  onConfirm,
  isSubmitting,
}: BookingSummaryProps) {
  const hasSlots = selectedSlots.length > 0;
  const dateDisplay = selectedDate ? formatDate(selectedDate) : "24 Oct, 2024";
  const timeDisplay = hasSlots ? combineTimeRange(selectedSlots) : "Select a slot";
  const durationDisplay = hasSlots
    ? `${getTotalDurationMinutes(selectedSlots)} Minutes`
    : "60 Minutes";
  const priceDisplay = hasSlots ? formatPrice(getTotalPrice(selectedSlots)) : "৳0";

  return (
    <div className="relative">
      <div
        className="sticky top-[100px] rounded-xl border p-6 shadow-2xl flex flex-col"
        style={{
          backgroundColor: "#282a2b",
          borderColor: "rgba(68,73,51,0.5)",
        }}
      >
        <h3
          className="border-b pb-3 mb-6 uppercase flex items-center gap-2"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "20px",
            color: "#ffffff",
            borderColor: "rgba(68,73,51,0.5)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#c3f400" }}
          >
            receipt_long
          </span>
          Booking Summary
        </h3>

        <div className="flex flex-col gap-3 flex-grow mb-8">
          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#c4c9ac",
              }}
            >
              Date
            </span>
            <span
              className="font-medium"
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#ffffff",
              }}
            >
              {dateDisplay}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#c4c9ac",
              }}
            >
              Time
            </span>
            <span
              className="font-medium"
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: hasSlots ? "#c3f400" : "#ffffff",
              }}
            >
              {timeDisplay}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#c4c9ac",
              }}
            >
              Duration
            </span>
            <span
              className="font-medium"
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#ffffff",
              }}
            >
              {durationDisplay}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#c4c9ac",
              }}
            >
              Turf
            </span>
            <span
              className="font-medium"
              style={{
                fontFamily: "var(--font-work-sans)",
                fontSize: "16px",
                color: "#ffffff",
              }}
            >
              FIFA Pro 47mm
            </span>
          </div>

          <div
            className="my-3 border-t"
            style={{ borderColor: "rgba(68,73,51,0.3)" }}
          />

          <div className="flex justify-between items-end">
            <span
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "20px",
                color: "#e2e2e2",
              }}
            >
              Total Amount
            </span>
            <div className="text-right">
              <span
                className="block leading-none font-bold"
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: "36px",
                  color: "#c3f400",
                }}
              >
                {priceDisplay}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "11px",
                  color: "#c4c9ac",
                  letterSpacing: "0.08em",
                }}
              >
                VAT INCLUDED
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={!hasSlots || isSubmitting}
          className="w-full py-3 rounded-lg uppercase tracking-wider font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "18px",
            backgroundColor: hasSlots ? "#c3f400" : "#333535",
            color: hasSlots ? "#283500" : "#8e9379",
            cursor: hasSlots && !isSubmitting ? "pointer" : "not-allowed",
            boxShadow: hasSlots ? "0 0 15px rgba(195,244,0,0.3)" : undefined,
          }}
          onMouseEnter={(e) => {
            if (hasSlots && !isSubmitting) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#abd600";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 20px rgba(195,244,0,0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (hasSlots && !isSubmitting) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#c3f400";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 15px rgba(195,244,0,0.3)";
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              />
              PREPARING BOOKING...
            </>
          ) : (
            <>
              CONFIRM BOOKING
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>

        <p
          className="text-center mt-3 flex items-center justify-center gap-1"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "11px",
            color: "#c4c9ac",
            letterSpacing: "0.06em",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            lock
          </span>
          SECURE ONLINE BOOKING
        </p>
      </div>
    </div>
  );
}
