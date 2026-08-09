"use client";

import { useState } from "react";
import type { AdminBooking } from "@/types/admin";
import { Button, Modal, StatusBadge } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

interface BookingDetailModalProps {
  booking: AdminBooking;
  startInConfirmMode?: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#c3f400]"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        {label}
      </p>
      <p className="text-[13px] text-[#e2e2e2]">{value}</p>
    </div>
  );
}

export default function BookingDetailModal({
  booking,
  startInConfirmMode = false,
  onClose,
  onSuccess,
  onError,
}: BookingDetailModalProps) {
  const [confirmMode, setConfirmMode] = useState(startInConfirmMode);
  const [busy, setBusy] = useState(false);

  const pending = booking.status === "pending";
  const confirmed = booking.status === "confirmed";
  const cancelled = booking.status === "cancelled";
  const completed = booking.status === "completed";

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/confirm`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Could not confirm the booking.");
      onSuccess(`${booking.bookingRef} confirmed and slots locked.`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Confirmation failed.";
      setBusy(false);
      onError(msg);
    }
  }

  async function transition(status: AdminBooking["status"], successMessage: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Update failed.");
      onSuccess(successMessage);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed.";
      setBusy(false);
      onError(msg);
    }
  }

  const dateLabel = booking.bookingDate
    .split("-")
    .reverse()
    .join("/");

  return (
    <Modal
      open
      onClose={onClose}
      title={confirmMode ? "Confirm Booking" : `Booking ${booking.bookingRef}`}
      subtitle={confirmMode ? "CONFIRM & BLOCK" : booking.selectedTimeDisplay}
      wide
    >
      {confirmMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Customer" value={booking.customerName} />
            <DetailItem label="Date" value={dateLabel} />
            <DetailItem label="Time" value={booking.selectedTimeDisplay} />
            <DetailItem label="Duration" value={`${booking.durationMinutes} Minutes`} />
            <DetailItem label="Slot Type" value={booking.slotCategory.toUpperCase()} />
            <DetailItem label="Price" value={<span className="font-bold text-[#c3f400]">{formatPrice(booking.price)}</span>} />
          </div>
          <p className="rounded-lg border border-[#e6a700]/40 bg-[#e6a700]/10 px-3 py-2 text-[12px] text-[#ffd75e]">
            Confirming locks all of this booking&apos;s slots so no other customer can
            book them.
          </p>
          <div className="flex items-center justify-end gap-2 border-t border-[#444933]/40 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setConfirmMode(false)} disabled={busy}>
              Back
            </Button>
            <Button variant="primary" size="sm" onClick={confirm} disabled={busy}>
              <span className="material-symbols-outlined text-sm">lock</span>
              {busy ? "Confirming..." : "Confirm & Block"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-widest text-[#c4c9ac]">
              Status
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Customer" value={booking.customerName} />
            <DetailItem label="Phone" value={booking.phoneNumber} />
            <DetailItem label="WhatsApp" value={booking.whatsappNumber} />
            <DetailItem label="Team" value={booking.teamName ?? "—"} />
            <DetailItem label="Booking Date" value={dateLabel} />
            <DetailItem label="Time" value={booking.selectedTimeDisplay} />
            <DetailItem label="Slot Type" value={booking.slotCategory.toUpperCase()} />
            <DetailItem label="Duration" value={`${booking.durationMinutes} min (${booking.slotCount} slot${booking.slotCount > 1 ? "s" : ""})`} />
            <DetailItem label="Total Price" value={formatPrice(booking.price)} />
            <DetailItem
              label="Slots"
              value={booking.slotIds.length > 0 ? booking.slotIds.join(", ") : "—"}
            />
            <DetailItem
              label="Created"
              value={new Date(booking.createdAt).toLocaleString()}
            />
          </div>

          <div>
            <DetailItem label="Notes" value={booking.notes ?? "No notes provided."} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#444933]/40 pt-4">
            {pending && (
              <>
                <Button variant="danger" size="sm" disabled={busy} onClick={() => transition("cancelled", `${booking.bookingRef} rejected.`)}>
                  Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => setConfirmMode(true)}>
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Confirm & Block
                </Button>
              </>
            )}
            {confirmed && (
              <>
                <Button variant="danger" size="sm" disabled={busy} onClick={() => transition("cancelled", `${booking.bookingRef} cancelled; slots released.`)}>
                  Cancel
                </Button>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => transition("completed", `${booking.bookingRef} marked completed.`)}>
                  Complete
                </Button>
              </>
            )}
            {cancelled && (
              <Button variant="subtle" size="sm" disabled={busy} onClick={() => transition("pending", `${booking.bookingRef} restored to pending.`)}>
                Restore
              </Button>
            )}
            {completed && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
