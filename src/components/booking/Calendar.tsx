"use client";

import { useMemo, useState } from "react";

interface CalendarProps {
  selectedDate: Date | null;
  minDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({
  selectedDate,
  minDate,
  onSelect,
  onClose,
}: CalendarProps) {
  const today = useMemo(() => startOfDay(minDate), [minDate]);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base =
      selectedDate && startOfDay(selectedDate) >= today
        ? startOfDay(selectedDate)
        : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoPrev = viewMonth.getTime() > currentMonthStart.getTime();
  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d));
    return list;
  }, [year, month]);

  const goPrev = () => setViewMonth(new Date(year, month - 1, 1));
  const goNext = () => setViewMonth(new Date(year, month + 1, 1));

  const handleSelect = (date: Date) => {
    onSelect(date);
    onClose();
  };

  return (
    <div
      className="w-full rounded-lg border p-4 mt-4"
      style={{
        backgroundColor: "#121414",
        borderColor: "rgba(68,73,51,0.6)",
      }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="flex items-center justify-center w-9 h-9 rounded border transition-colors"
          style={{
            borderColor: "rgba(68,73,51,0.6)",
            color: canGoPrev ? "#c3f400" : "#5f6360",
            cursor: canGoPrev ? "pointer" : "not-allowed",
            backgroundColor: "transparent",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            chevron_left
          </span>
        </button>
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "16px",
            color: "#ffffff",
            letterSpacing: "0.04em",
          }}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="flex items-center justify-center w-9 h-9 rounded border transition-colors"
          style={{
            borderColor: "rgba(68,73,51,0.6)",
            color: "#c3f400",
            cursor: "pointer",
            backgroundColor: "transparent",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            chevron_right
          </span>
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center pb-1"
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "10px",
              letterSpacing: "0.06em",
              color: "#8e9379",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`blank-${idx}`} />;
          const isPast = date.getTime() < today.getTime();
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          return (
            <button
              key={date.getTime()}
              type="button"
              disabled={isPast}
              aria-label={date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              aria-pressed={isSelected}
              onClick={() => handleSelect(date)}
              className="flex items-center justify-center h-9 rounded transition-colors"
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: "13px",
                backgroundColor: isSelected ? "#c3f400" : "transparent",
                color: isSelected ? "#283500" : isPast ? "#5f6360" : "#e2e2e2",
                border: isSelected ? "1px solid #c3f400" : "1px solid transparent",
                boxShadow: isSelected ? "0 0 12px rgba(195,244,0,0.35)" : undefined,
                cursor: isPast ? "not-allowed" : "pointer",
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
