"use client";

import { useMemo, useState } from "react";
import type { AdminSlot, ScheduleEntry } from "@/types/admin";
import { Button, Input, Label, Modal } from "@/components/admin/ui";
import { cn, formatPrice } from "@/lib/utils";
import { formatSlotTime } from "@/components/admin/schedule/schedule-common";

interface ManualBookingModalProps {
  open: boolean;
  date: string; // YYYY-MM-DD
  slots: AdminSlot[];
  entries: Record<string, ScheduleEntry>;
  initialSlotId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const PHONE_RE = /^01[3-9]\d{8}$/;
const MAX_SLOTS = 8;

function isBookable(slot: AdminSlot, entry: ScheduleEntry | undefined): boolean {
  return entry?.status === "available";
}

export default function ManualBookingModal({
  open,
  date,
  slots,
  entries,
  initialSlotId,
  onClose,
  onSuccess,
  onError,
}: ManualBookingModalProps) {
  const daySlots = useMemo(() => slots.filter((s) => s.category === "day"), [slots]);
  const nightSlots = useMemo(() => slots.filter((s) => s.category === "night"), [slots]);

  const initialSelection = useMemo(() => {
    const first = slots.find((s) => s.id === initialSlotId);
    return first && isBookable(first, entries[first.id]) ? [first] : [];
  }, [slots, entries, initialSlotId]);

  const [selected, setSelected] = useState<AdminSlot[]>(initialSelection);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = selected.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);
  const combinedStart = selected[0]?.startTime;
  const combinedEnd = selected[selected.length - 1]?.endTime;

  // Keeps `selected` as a single run of consecutive, same-category slots.
  function handleSlotClick(slot: AdminSlot) {
    if (!isBookable(slot, entries[slot.id])) return;
    setHint(null);

    if (selected.length === 0 || slot.category !== selected[0].category) {
      setSelected([slot]);
      return;
    }

    const catSlots = slot.category === "day" ? daySlots : nightSlots;
    const idx = catSlots.findIndex((s) => s.id === slot.id);
    const selIdx = selected
      .map((s) => catSlots.findIndex((c) => c.id === s.id))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    const min = selIdx[0];
    const max = selIdx[selIdx.length - 1];
    if (min === undefined || max === undefined || idx < 0) return;

    // Clicked inside the current run -> shrink edges, collapse interior.
    if (idx >= min && idx <= max) {
      if (min === max) {
        setSelected([]);
        return;
      }
      if (idx === min) {
        setSelected(catSlots.slice(min + 1, max + 1));
        return;
      }
      if (idx === max) {
        setSelected(catSlots.slice(min, max));
        return;
      }
      setSelected([slot]);
      return;
    }

    // Clicked directly adjacent -> extend the run (guarded to bookable slots).
    if (idx === min - 1 || idx === max + 1) {
      const next = catSlots.slice(Math.min(min, idx), Math.max(max, idx) + 1);
      if (!next.every((s) => isBookable(s, entries[s.id]))) {
        setHint("Cannot extend across an unavailable slot.");
        return;
      }
      if (next.length > MAX_SLOTS) {
        setHint(`A single booking can cover up to ${MAX_SLOTS} slots.`);
        return;
      }
      setSelected(next);
      return;
    }

    // Gap in the same session -> reset to the clicked slot.
    setHint("Only consecutive slots in the same session can be combined.");
    setSelected([slot]);
  }

  function clearSelection() {
    setSelected([]);
    setHint(null);
  }

  function slotButton(slot: AdminSlot) {
    const entry = entries[slot.id];
    const bookable = isBookable(slot, entry);
    const selectedIdx = selected.findIndex((s) => s.id === slot.id);
    const isSelected = selectedIdx >= 0;

    return (
      <button
        key={slot.id}
        type="button"
        disabled={!bookable}
        onClick={() => handleSlotClick(slot)}
        aria-pressed={isSelected}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors",
          isSelected
            ? "border-[#c3f400] bg-[#c3f400] text-[#283500] shadow-[0_0_12px_rgba(195,244,0,0.35)]"
            : bookable
              ? "border-[#444933] bg-[#0c0f0f] text-[#e2e2e2] hover:border-[#c3f400]/60 hover:text-[#c3f400]"
              : "border-[#444933]/40 bg-[#121414] text-[#8e9379] opacity-60",
        )}
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "material-symbols-outlined text-sm",
              isSelected ? "text-[#283500]" : "text-[#c3f400]",
            )}
          >
            {isSelected ? "check_circle" : "schedule"}
          </span>
          {formatSlotTime(slot.startTime)} → {formatSlotTime(slot.endTime)}
        </span>
        <span
          className={cn(
            "text-[10px] uppercase",
            isSelected ? "font-bold text-[#283500]" : "opacity-70",
          )}
        >
          {bookable ? formatPrice(slot.price) : entry?.status}
        </span>
      </button>
    );
  }

  async function submit() {
    setError(null);
    if (selected.length === 0) {
      setError("Select at least one available slot.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!PHONE_RE.test(phoneNumber.trim())) {
      setError("Enter a valid Bangladeshi phone number (01XXXXXXXXX).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          whatsappNumber: whatsappNumber.trim() || phoneNumber.trim(),
          bookingDate: date,
          slotIds: selected.map((s) => s.id),
          price: totalPrice,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not create the booking.");
      }
      onSuccess(
        `Booking locked: ${data.booking?.bookingRef ?? ""} · ${formatSlotTime(combinedStart!)} → ${formatSlotTime(combinedEnd!)}`,
      );
      reset();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed.";
      setError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelected([]);
    setCustomerName("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setNotes("");
    setHint(null);
    setError(null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Manual Booking"
      subtitle={`${date} · BOOK & LOCK`}
      wide
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="mb-date">Date</Label>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-[10px] uppercase tracking-widest text-[#8e9379] transition-colors hover:text-[#ffb4ab]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Clear selection
              </button>
            )}
          </div>
          <Input id="mb-date" value={date} readOnly />
        </div>

        <div>
          <Label>Select Slots</Label>
          <p className="mb-3 text-[11px] text-[#8e9379]">
            Click one or more <span className="text-[#c3f400]">consecutive available</span> slots in
            the same session. Adjacent slots combine into one booking.
          </p>

          {daySlots.length > 0 && (
            <p
              className="mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8e9379]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Day Session
            </p>
          )}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {daySlots.map((slot) => slotButton(slot))}
          </div>

          {nightSlots.length > 0 && (
            <p
              className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8e9379]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Night Session
            </p>
          )}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {nightSlots.map((slot) => slotButton(slot))}
          </div>

          {slots.length === 0 && (
            <p className="text-[12px] text-[#ffb4ab]">No slots configured.</p>
          )}
          {hint && (
            <p className="mt-2 text-[11px] text-[#ffd75e]">{hint}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="mb-customer">Customer Name *</Label>
            <Input
              id="mb-customer"
              placeholder="e.g. Ahmedinazad"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mb-phone">Phone *</Label>
            <Input
              id="mb-phone"
              placeholder="01XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mb-whatsapp">WhatsApp</Label>
            <Input
              id="mb-whatsapp"
              placeholder="Same as phone if empty"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mb-notes">Notes</Label>
            <Input
              id="mb-notes"
              placeholder="Optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-[#444933]/40 bg-[#0c0f0f] p-4">
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#c3f400]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Selected Slots
          </p>
          {selected.length === 0 ? (
            <p className="text-[12px] text-[#8e9379]">No slots selected yet.</p>
          ) : (
            <ul className="mb-3 space-y-1">
              {selected.map((s) => (
                <li
                  key={s.id}
                  className="text-[12px] text-[#c4c9ac]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {formatSlotTime(s.startTime)} → {formatSlotTime(s.endTime)}
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 border-t border-[#444933]/40 pt-3">
            <div className="flex items-center justify-between text-[12px] text-[#c4c9ac]">
              <span className="uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
                Combined Time
              </span>
              <span className="font-semibold text-white">
                {combinedStart && combinedEnd
                  ? `${formatSlotTime(combinedStart)} → ${formatSlotTime(combinedEnd)}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#c4c9ac]">
              <span className="uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
                Duration
              </span>
              <span className="font-semibold text-white">
                {selected.length > 0
                  ? `${totalDuration} minutes (${selected.length} slot${selected.length > 1 ? "s" : ""})`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#c4c9ac]">
              <span className="uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
                Total
              </span>
              <span className="text-base font-bold text-[#c3f400]">
                {selected.length > 0 ? formatPrice(totalPrice) : "৳0"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-[#93000a]/50 bg-[#93000a]/20 px-3 py-2 text-[12px] text-[#ffb4ab]">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[#444933]/40 pt-4">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submit} disabled={submitting || selected.length === 0}>
            <span className="material-symbols-outlined text-sm">lock</span>
            {submitting ? "Booking..." : "Book & Lock"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
