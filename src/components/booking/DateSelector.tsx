"use client";

import { type DateOption } from "@/types/booking";
import { getDayLabel, getUpcomingDates, formatDate } from "@/lib/utils";
import { useMemo, useState } from "react";
import Calendar from "@/components/booking/Calendar";

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDateOutsideQuick = selectedDate
    ? !dates.some((d) => sameDay(d.date, selectedDate))
    : false;

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

        {/* "MORE" button - opens full calendar */}
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          aria-expanded={calendarOpen}
          aria-label={calendarOpen ? "Close calendar" : "Open full calendar"}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-1 transition-colors"
          style={{
            minWidth: "80px",
            padding: "12px",
            borderRadius: "0.5rem",
            border: calendarOpen
              ? "1px solid #c3f400"
              : "1px solid rgba(68,73,51,0.6)",
            color: calendarOpen ? "#c3f400" : "#8e9379",
            backgroundColor: calendarOpen ? "rgba(195,244,0,0.1)" : "transparent",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            {calendarOpen ? "close" : "calendar_today"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "10px",
              letterSpacing: "0.08em",
            }}
          >
            {calendarOpen ? "CLOSE" : "MORE"}
          </span>
        </button>
      </div>

      {/* Full calendar */}
      {calendarOpen && (
        <Calendar
          selectedDate={selectedDate}
          minDate={today}
          onSelect={onDateSelect}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* Clearly display a selection made beyond the quick date cards */}
      {selectedDate && selectedDateOutsideQuick && !calendarOpen && (
        <div
          className="mt-4 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            color: "#c4c9ac",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px", color: "#c3f400" }}
          >
            event
          </span>
          <span>SELECTED DATE:</span>
          <strong style={{ color: "#c3f400", fontSize: "12px" }}>
            {formatDate(selectedDate)}
          </strong>
        </div>
      )}
    </section>
  );
}
