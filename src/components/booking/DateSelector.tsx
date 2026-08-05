"use client";

import { type DateOption } from "@/types/booking";
import { getDayLabel, getUpcomingDates } from "@/lib/utils";
import { useMemo } from "react";

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onDateSelect,
}: DateSelectorProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dates = useMemo((): DateOption[] => {
    return getUpcomingDates(7).map((d) => ({
      date: d,
      dayLabel: getDayLabel(d, today),
      dateNum: d.getDate(),
      monthLabel: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      disabled: false,
    }));
  }, [today]);

  return (
    <section
      id="date-section"
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "#1e2020",
        borderColor: "rgba(68,73,51,0.3)",
      }}
    >
      <h2
        className="flex items-center gap-3 mb-6"
        style={{
          fontFamily: "var(--font-oswald)",
          fontSize: "20px",
          color: "#ffffff",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "#c3f400" }}
        >
          calendar_month
        </span>
        1. Select Date
      </h2>

      {/* Date chips - horizontally scrollable */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {dates.map((d) => {
          const isSelected =
            selectedDate?.toDateString() === d.date.toDateString();
          return (
            <button
              key={d.date.toISOString()}
              onClick={() => !d.disabled && onDateSelect(d.date)}
              disabled={d.disabled}
              aria-label={`Select ${d.dayLabel} ${d.dateNum} ${d.monthLabel}`}
              aria-pressed={isSelected}
              className="flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2"
              style={{
                minWidth: "80px",
                padding: "12px",
                borderRadius: "0.5rem",
                backgroundColor: isSelected ? "#c3f400" : "transparent",
                color: isSelected ? "#283500" : "#e2e2e2",
                border: isSelected
                  ? "1px solid #c3f400"
                  : "1px solid rgba(68,73,51,0.6)",
                boxShadow: isSelected
                  ? "0 0 12px rgba(195,244,0,0.4)"
                  : undefined,
                opacity: d.disabled ? 0.4 : 1,
                cursor: d.disabled ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !d.disabled) {
                  (e.currentTarget as HTMLElement).style.borderColor = "#c3f400";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#333535";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !d.disabled) {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(68,73,51,0.6)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  opacity: isSelected ? 1 : 0.6,
                }}
              >
                {d.dayLabel}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {d.dateNum}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "10px",
                  letterSpacing: "0.04em",
                }}
              >
                {d.monthLabel}
              </span>
            </button>
          );
        })}

        {/* "MORE" button */}
        <button
          className="flex-shrink-0 flex flex-col items-center justify-center gap-1 transition-colors"
          style={{
            minWidth: "80px",
            padding: "12px",
            borderRadius: "0.5rem",
            border: "1px solid rgba(68,73,51,0.6)",
            color: "#8e9379",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#c3f400";
            (e.currentTarget as HTMLElement).style.color = "#c3f400";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(68,73,51,0.6)";
            (e.currentTarget as HTMLElement).style.color = "#8e9379";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            calendar_today
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "10px",
              letterSpacing: "0.08em",
            }}
          >
            MORE
          </span>
        </button>
      </div>
    </section>
  );
}
