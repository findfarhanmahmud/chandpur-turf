"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminBooking,
  AdminSlot,
  ScheduleEntry,
  ScheduleRangeData,
} from "@/types/admin";
import { Button, Card, EmptyState, Spinner } from "@/components/admin/ui";
import { cn, formatPrice } from "@/lib/utils";
import {
  formatDayHeader,
  formatSlotTime,
  isToday,
  SLOT_STATUS_STYLES,
  SlotStatusBadge,
  statusCounts,
  type SlotStatus,
} from "@/components/admin/schedule/schedule-common";
import ManualBookingModal from "@/components/admin/schedule/ManualBookingModal";
import BookingDetailModal from "@/components/admin/schedule/BookingDetailModal";
import BlockSlotModal from "@/components/admin/schedule/BlockSlotModal";

type ViewMode = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function todayISO(): string {
  return toISO(new Date());
}

function rangeFor(view: ViewMode, anchor: string): { from: string; to: string } {
  if (view === "day") return { from: anchor, to: anchor };
  if (view === "week") {
    const [y, m, d] = anchor.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    const start = addDays(anchor, -day);
    return { from: start, to: addDays(start, 6) };
  }
  const [y, m] = anchor.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${anchor}-01`, to: `${anchor}-${String(last).padStart(2, "0")}` };
}

function moveAnchor(view: ViewMode, anchor: string, dir: number): string {
  if (view === "day") return addDays(anchor, dir);
  if (view === "week") return addDays(anchor, dir * 7);
  const [y, m] = anchor.split("-").map(Number);
  const dt = new Date(y, m - 1 + dir, 1);
  return toISO(dt).slice(0, 7);
}

function datesInRange(from: string, to: string): string[] {
  const count = Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / DAY_MS) + 1;
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

interface Notice {
  type: "ok" | "err";
  text: string;
}

export default function ScheduleManager() {
  const [view, setView] = useState<ViewMode>("day");
  const [anchor, setAnchor] = useState(todayISO());
  const [data, setData] = useState<ScheduleRangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  const [manualBooking, setManualBooking] = useState<{ date: string; slotId: string } | null>(null);
  const [detailBooking, setDetailBooking] = useState<{ booking: AdminBooking; confirm: boolean } | null>(null);
  const [blockSlot, setBlockSlot] = useState<{ date: string; slot: AdminSlot; entry?: ScheduleEntry } | null>(null);

  const { from, to } = rangeFor(view, anchor);

  const load = useCallback(async (v: ViewMode, a: string) => {
    const { from: f, to: t } = rangeFor(v, a);
    try {
      const res = await fetch(`/api/admin/schedule?from=${f}&to=${t}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("failed");
      setError(null);
      setData(await res.json());
    } catch {
      setError("Could not load the schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(view, anchor));
  }, [view, anchor, load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  function navigate(next: ViewMode, nextAnchor: string) {
    setLoading(true);
    setView(next);
    setAnchor(nextAnchor);
  }

  function changeView(v: ViewMode) {
    navigate(v, view === v ? anchor : todayISO());
  }

  function showNotice(type: "ok" | "err", text: string) {
    setNotice({ type, text });
  }

  async function unblock(slot: AdminSlot, date: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blocked?slotId=${slot.id}&date=${date}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Failed to unblock.");
      showNotice("ok", `${formatSlotTime(slot.startTime)} unblocked for ${date}.`);
      await load(view, anchor);
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const entriesForDate = (date: string) => data?.entries[date] ?? {};
  const daySlots = data?.slots ?? [];

  function openBookingDetail(entry?: ScheduleEntry, confirm = false) {
    if (!entry?.bookingId) return;
    const booking = data?.bookings.find((b) => b.id === entry.bookingId);
    if (booking) setDetailBooking({ booking, confirm });
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              className="uppercase tracking-wide text-white"
              style={{ fontFamily: "var(--font-oswald)", fontSize: "20px" }}
            >
              Schedule
            </h2>
            <p
              className="mt-1 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {view === "month"
                ? "Click a day to open its timeline"
                : view === "week"
                  ? "Week overview — click a day for details"
                  : "Day timeline — book, confirm and manage each slot"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(view, moveAnchor(view, anchor, -1))} aria-label="Previous">
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </Button>
            <Button variant="subtle" size="sm" onClick={() => navigate(view, todayISO())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(view, moveAnchor(view, anchor, 1))} aria-label="Next">
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Button>
            <div className="ml-1 flex overflow-hidden rounded-lg border border-[#444933]/60">
              {(["day", "week", "month"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => changeView(v)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    view === v
                      ? "bg-[#c3f400] text-[#283500]"
                      : "bg-[#0c0f0f] text-[#c4c9ac] hover:text-[#c3f400]",
                  )}
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prominent date for the day view */}
        {view === "day" && (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-lg border border-[#444933]/40 bg-[#0c0f0f] px-4 py-3">
            <div>
              <p className="text-xl font-bold uppercase leading-tight text-white" style={{ fontFamily: "var(--font-oswald)" }}>
                {formatDayHeader(anchor).date}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-[#c3f400]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {formatDayHeader(anchor).weekday}
              </p>
            </div>
            {isToday(anchor) && (
              <span className="rounded bg-[#c3f400] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#283500]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                Today
              </span>
            )}
          </div>
        )}
      </Card>

      {notice && (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-[12px]",
            notice.type === "ok"
              ? "border-[#c3f400]/40 bg-[#c3f400]/10 text-[#c3f400]"
              : "border-[#93000a]/50 bg-[#93000a]/20 text-[#ffb4ab]",
          )}
        >
          {notice.text}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading schedule" />
      ) : error || !data ? (
        <EmptyState message={error ?? "No schedule data."} />
      ) : (
        <>
          {view === "day" && (
            <DayTimeline
              slots={daySlots}
              entries={entriesForDate(anchor)}
              busy={busy}
              onBook={(slot) => setManualBooking({ date: anchor, slotId: slot.id })}
              onView={(entry) => openBookingDetail(entry, false)}
              onConfirm={(entry) => openBookingDetail(entry, true)}
              onBlock={(slot, entry) => setBlockSlot({ date: anchor, slot, entry })}
              onUnblock={(slot) => void unblock(slot, anchor)}
            />
          )}
          {view === "week" && (
            <WeekView
              from={from}
              to={to}
              data={data}
              onPick={(date) => navigate("day", date)}
            />
          )}
          {view === "month" && (
            <MonthView from={from} to={to} data={data} onPick={(date) => navigate("day", date)} />
          )}
        </>
      )}

      {manualBooking && data && (
        <ManualBookingModal
          open
          date={manualBooking.date}
          slots={data.slots}
          entries={entriesForDate(manualBooking.date)}
          initialSlotId={manualBooking.slotId}
          onClose={() => setManualBooking(null)}
          onSuccess={(msg) => {
            showNotice("ok", msg);
            void load(view, anchor);
          }}
          onError={(msg) => showNotice("err", msg)}
        />
      )}

      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking.booking}
          startInConfirmMode={detailBooking.confirm}
          onClose={() => setDetailBooking(null)}
          onSuccess={(msg) => {
            showNotice("ok", msg);
            setDetailBooking(null);
            void load(view, anchor);
          }}
          onError={(msg) => showNotice("err", msg)}
        />
      )}

      {blockSlot && (
        <BlockSlotModal
          date={blockSlot.date}
          slot={blockSlot.slot}
          entry={blockSlot.entry}
          onClose={() => setBlockSlot(null)}
          onSuccess={(msg) => {
            showNotice("ok", msg);
            setBlockSlot(null);
            void load(view, anchor);
          }}
          onError={(msg) => showNotice("err", msg)}
        />
      )}
    </div>
  );
}

function SummaryChips({ entries }: { entries: Record<string, ScheduleEntry> }) {
  const counts = statusCounts(entries);
  const order: SlotStatus[] = ["available", "pending", "booked", "blocked", "elapsed"];
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((status) => {
        const style = SLOT_STATUS_STYLES[status];
        return (
          <span
            key={status}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#444933]/50 bg-[#0c0f0f] px-3 py-1 text-[10px] uppercase tracking-wider text-[#c4c9ac]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
            {style.label}
            <span className="font-bold text-white">{counts[status]}</span>
          </span>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8e9379]"
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      {children}
    </p>
  );
}

function DayTimeline({
  slots,
  entries,
  busy,
  onBook,
  onView,
  onConfirm,
  onBlock,
  onUnblock,
}: {
  slots: AdminSlot[];
  entries: Record<string, ScheduleEntry>;
  busy: boolean;
  onBook: (slot: AdminSlot) => void;
  onView: (entry?: ScheduleEntry) => void;
  onConfirm: (entry?: ScheduleEntry) => void;
  onBlock: (slot: AdminSlot, entry?: ScheduleEntry) => void;
  onUnblock: (slot: AdminSlot) => void;
}) {
  const daySlots = slots.filter((s) => s.category === "day");
  const nightSlots = slots.filter((s) => s.category === "night");

  return (
    <div className="space-y-3">
      <SummaryChips entries={entries} />
      {slots.length === 0 && <EmptyState message="No slots configured." />}

      {daySlots.length > 0 && <SectionLabel>Day Session</SectionLabel>}
      {daySlots.map((slot) => (
        <TimelineRow
          key={slot.id}
          slot={slot}
          entry={entries[slot.id]}
          busy={busy}
          onBook={onBook}
          onView={onView}
          onConfirm={onConfirm}
          onBlock={onBlock}
          onUnblock={onUnblock}
        />
      ))}

      {nightSlots.length > 0 && (
        <div className="pt-2">
          <SectionLabel>Night Session</SectionLabel>
        </div>
      )}
      {nightSlots.map((slot) => (
        <TimelineRow
          key={slot.id}
          slot={slot}
          entry={entries[slot.id]}
          busy={busy}
          onBook={onBook}
          onView={onView}
          onConfirm={onConfirm}
          onBlock={onBlock}
          onUnblock={onUnblock}
        />
      ))}
    </div>
  );
}

function TimelineRow({
  slot,
  entry,
  busy,
  onBook,
  onView,
  onConfirm,
  onBlock,
  onUnblock,
}: {
  slot: AdminSlot;
  entry?: ScheduleEntry;
  busy: boolean;
  onBook: (slot: AdminSlot) => void;
  onView: (entry?: ScheduleEntry) => void;
  onConfirm: (entry?: ScheduleEntry) => void;
  onBlock: (slot: AdminSlot, entry?: ScheduleEntry) => void;
  onUnblock: (slot: AdminSlot) => void;
}) {
  const status: SlotStatus = entry?.status ?? "available";
  const style = SLOT_STATUS_STYLES[status];
  const hasBooking = status === "booked" || status === "pending";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center",
        style.rowBorder,
        style.rowBg,
        status === "elapsed" && "opacity-60",
      )}
    >
      <div className="w-full shrink-0 sm:w-44">
        <p className="text-[15px] font-bold leading-tight text-white" style={{ fontFamily: "var(--font-oswald)" }}>
          {formatSlotTime(slot.startTime)}
        </p>
        <p className="text-[11px] uppercase tracking-wider text-[#8e9379]" style={{ fontFamily: "var(--font-jetbrains)" }}>
          → {formatSlotTime(slot.endTime)}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <SlotStatusBadge status={status} />
          {status === "available" && (
            <span className="text-[12px] font-semibold text-[#c4c9ac]">{formatPrice(slot.price)}</span>
          )}
          {status === "blocked" && entry?.reason && (
            <span className="truncate text-[11px] italic text-[#ffb4ab]">{entry.reason}</span>
          )}
          {hasBooking && (
            <>
              <span className="truncate text-[12px] font-semibold text-white">{entry?.customerName}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#8e9379]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {entry?.bookingRef}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {status === "available" && (
          <>
            <Button size="sm" variant="subtle" onClick={() => onBlock(slot, entry)} disabled={busy}>
              Block
            </Button>
            <Button size="sm" variant="primary" onClick={() => onBook(slot)} disabled={busy}>
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Book
            </Button>
          </>
        )}
        {status === "blocked" && (
          <Button size="sm" variant="danger" onClick={() => onUnblock(slot)} disabled={busy}>
            Unblock
          </Button>
        )}
        {status === "booked" && (
          <Button size="sm" variant="outline" onClick={() => onView(entry)} disabled={busy}>
            View
          </Button>
        )}
        {status === "pending" && (
          <Button size="sm" variant="primary" onClick={() => onConfirm(entry)} disabled={busy}>
            <span className="material-symbols-outlined text-sm">lock</span>
            View
          </Button>
        )}
      </div>
    </div>
  );
}

function WeekView({
  from,
  to,
  data,
  onPick,
}: {
  from: string;
  to: string;
  data: ScheduleRangeData;
  onPick: (date: string) => void;
}) {
  const dates = datesInRange(from, to);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
      {dates.map((date) => {
        const entries = data.entries[date] ?? {};
        const counts = statusCounts(entries);
        const header = formatDayHeader(date);
        return (
          <Card key={date} className="p-3">
            <button
              onClick={() => onPick(date)}
              className={cn(
                "w-full text-left",
                isToday(date) && "text-[#c3f400]",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c4c9ac]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {header.weekday}
              </p>
              <p className="text-[13px] font-bold text-white">{header.date.split(",")[0]}</p>
            </button>

            <div className="mt-2.5 space-y-1">
              {data.slots.map((slot) => {
                const entry = entries[slot.id];
                const status: SlotStatus = entry?.status ?? "available";
                const style = SLOT_STATUS_STYLES[status];
                return (
                  <button
                    key={slot.id}
                    onClick={() => onPick(date)}
                    className={cn(
                      "flex w-full items-center justify-between gap-1 rounded border border-[#444933]/30 px-1.5 py-1 text-left transition-colors hover:border-[#c3f400]/50",
                      style.rowBg,
                      status === "elapsed" && "opacity-50",
                    )}
                  >
                    <span className="text-[9px] text-[#c4c9ac]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {formatSlotTime(slot.startTime)}
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                      {status === "booked" || status === "pending" ? (
                        <span className={cn("truncate text-[9px] font-semibold", style.text)}>
                          {entry?.customerName?.split(" ")[0]}
                        </span>
                      ) : (
                        <span className={cn("text-[9px] uppercase", style.text)}>
                          {status === "available" ? "✓" : status === "blocked" ? "✕" : status === "elapsed" ? "—" : ""}
                        </span>
                      )}
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1 border-t border-[#444933]/30 pt-2">
              <MiniCount label={`${counts.booked} booked`} className="text-[#8fd0ff]" />
              <MiniCount label={`${counts.pending} pend`} className="text-[#ffd75e]" />
              <MiniCount label={`${counts.blocked} blk`} className="text-[#ffb4ab]" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MiniCount({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("text-[9px] uppercase tracking-wider", className)} style={{ fontFamily: "var(--font-jetbrains)" }}>
      {label}
    </span>
  );
}

function MonthView({
  from,
  to,
  data,
  onPick,
}: {
  from: string;
  to: string;
  data: ScheduleRangeData;
  onPick: (date: string) => void;
}) {
  const dates = datesInRange(from, to);
  const firstDow = new Date(`${dates[0]}T00:00:00`).getDay();
  const weekdayHeader = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <div className="grid grid-cols-7 gap-2">
        {weekdayHeader.map((d) => (
          <p
            key={d}
            className="pb-2 text-center text-[10px] uppercase tracking-widest text-[#c4c9ac]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {d}
          </p>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {dates.map((date) => {
          const entries = data.entries[date] ?? {};
          const counts = statusCounts(entries);
          const d = new Date(`${date}T00:00:00`);
          return (
            <button
              key={date}
              onClick={() => onPick(date)}
              className={cn(
                "min-h-[84px] rounded-lg border border-[#444933]/40 bg-[#0c0f0f] p-2 text-left transition-colors hover:border-[#c3f400]/60",
                isToday(date) && "border-[#c3f400]",
              )}
            >
              <p className={cn("text-[12px] font-bold", isToday(date) ? "text-[#c3f400]" : "text-white")}>
                {d.getDate()}
              </p>
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[9px] uppercase text-[#8fd0ff]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {counts.booked} booked
                </p>
                <p className="text-[9px] uppercase text-[#ffd75e]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {counts.pending} pending
                </p>
                <p className="text-[9px] uppercase text-[#ffb4ab]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {counts.blocked} blocked
                </p>
                <p className="text-[9px] uppercase text-[#c4c9ac]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {counts.available} free
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
