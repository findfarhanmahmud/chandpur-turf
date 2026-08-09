import type { ScheduleEntry } from "@/types/admin";
import { cn } from "@/lib/utils";

export type SlotStatus = ScheduleEntry["status"];

export interface SlotStatusStyle {
  label: string;
  dot: string;
  badge: "neutral" | "green" | "amber" | "red" | "blue";
  rowBorder: string;
  rowBg: string;
  text: string;
}

export const SLOT_STATUS_STYLES: Record<SlotStatus, SlotStatusStyle> = {
  available: {
    label: "AVAILABLE",
    dot: "bg-[#c3f400]",
    badge: "green",
    rowBorder: "border-[#c3f400]/30",
    rowBg: "bg-[#c3f400]/[0.04]",
    text: "#c3f400",
  },
  pending: {
    label: "PENDING",
    dot: "bg-[#e6a700]",
    badge: "amber",
    rowBorder: "border-[#e6a700]/40",
    rowBg: "bg-[#e6a700]/[0.06]",
    text: "#ffd75e",
  },
  booked: {
    label: "BOOKED",
    dot: "bg-[#4aa8ff]",
    badge: "blue",
    rowBorder: "border-[#4aa8ff]/40",
    rowBg: "bg-[#4aa8ff]/[0.06]",
    text: "#8fd0ff",
  },
  blocked: {
    label: "BLOCKED",
    dot: "bg-[#ffb4ab]",
    badge: "red",
    rowBorder: "border-[#93000a]/50",
    rowBg: "bg-[#93000a]/[0.12]",
    text: "#ffb4ab",
  },
  elapsed: {
    label: "ELAPSED",
    dot: "bg-[#8e9379]",
    badge: "neutral",
    rowBorder: "border-[#444933]/40",
    rowBg: "bg-[#121414]",
    text: "#8e9379",
  },
};

// "HH:MM" -> "5:00 AM"
export function formatSlotTime(raw: string): string {
  const [hourPart, minutePart] = raw.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

// "AUGUST 11, 2026" style date from a YYYY-MM-DD string (uses local date math).
export function formatDayHeader(iso: string): { date: string; weekday: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const date = dt
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
  const weekday = dt.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return { date, weekday };
}

export function isToday(iso: string): boolean {
  const now = new Date();
  return (
    iso ===
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`
  );
}

export function statusCounts(
  entries: Record<string, ScheduleEntry> | undefined,
): Record<SlotStatus, number> {
  const counts: Record<SlotStatus, number> = {
    available: 0,
    pending: 0,
    booked: 0,
    blocked: 0,
    elapsed: 0,
  };
  if (!entries) return counts;
  for (const entry of Object.values(entries)) {
    if (entry.status in counts) counts[entry.status] += 1;
  }
  return counts;
}

export function SlotStatusBadge({ status }: { status: SlotStatus }) {
  const style = SLOT_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        style.badge === "green" && "border border-[#c3f400]/40 bg-[#c3f400]/15 text-[#c3f400]",
        style.badge === "amber" && "border border-[#e6a700]/40 bg-[#e6a700]/15 text-[#ffd75e]",
        style.badge === "blue" && "border border-[#4aa8ff]/40 bg-[#4aa8ff]/15 text-[#8fd0ff]",
        style.badge === "red" && "border border-[#93000a]/50 bg-[#93000a]/25 text-[#ffb4ab]",
        style.badge === "neutral" && "border border-[#444933] bg-[#282a2b] text-[#c4c9ac]",
      )}
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}
