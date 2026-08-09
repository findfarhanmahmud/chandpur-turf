"use client";

import { useState } from "react";
import type { AdminSlot, ScheduleEntry } from "@/types/admin";
import { Button, Input, Label, Modal } from "@/components/admin/ui";
import { formatSlotTime } from "@/components/admin/schedule/schedule-common";

interface BlockSlotModalProps {
  date: string; // YYYY-MM-DD
  slot: AdminSlot;
  entry?: ScheduleEntry;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function BlockSlotModal({
  date,
  slot,
  entry,
  onClose,
  onSuccess,
  onError,
}: BlockSlotModalProps) {
  const [reason, setReason] = useState(entry?.reason ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          date,
          reason: reason.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Could not block the slot.");
      onSuccess(`${formatSlotTime(slot.startTime)} blocked for ${date}.`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Blocking failed.";
      setError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Block Slot"
      subtitle={`${date} · ${formatSlotTime(slot.startTime)} → ${formatSlotTime(slot.endTime)}`}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="bs-reason">Reason (optional)</Label>
          <Input
            id="bs-reason"
            placeholder="e.g. Maintenance"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="mt-1.5 text-[11px] text-[#8e9379]">
            Blocked slots show as BLOCKED and cannot be booked by customers.
          </p>
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
          <Button variant="danger" size="sm" onClick={submit} disabled={submitting}>
            <span className="material-symbols-outlined text-sm">block</span>
            {submitting ? "Blocking..." : "Block Slot"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
