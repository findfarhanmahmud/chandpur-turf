"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminSlot } from "@/types/admin";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Spinner,
} from "@/components/admin/ui";
import { cn, formatPrice } from "@/lib/utils";

export default function PricingManager() {
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, AdminSlot>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slots", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setSlots(data.slots);
      setDrafts({});
    } catch {
      setError("Could not load slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function draft(slot: AdminSlot): AdminSlot {
    return drafts[slot.id] ?? slot;
  }

  function patch(id: string, patch: Partial<AdminSlot>) {
    const base = slots.find((s) => s.id === id);
    if (!base) return;
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? base), ...patch } }));
  }

  async function save(id: string) {
    const base = slots.find((x) => x.id === id);
    if (!base) return;
    const s = draft(base);
    setSavingId(id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(s.price),
          durationMinutes: Number(s.durationMinutes),
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Update failed");
      setSlots((prev) => prev.map((x) => (x.id === id ? data.slot : x)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotice({ type: "ok", text: `${s.id} updated.` });
    } catch (err) {
      setNotice({
        type: "err",
        text: err instanceof Error ? err.message : "Could not update the slot.",
      });
    } finally {
      setSavingId(null);
    }
  }

  const daySlots = slots.filter((s) => s.category === "day");
  const nightSlots = slots.filter((s) => s.category === "night");

  return (
    <div className="space-y-4">
      {notice && (
        <p
          className={`rounded-lg border px-3 py-2 text-[12px] ${
            notice.type === "ok"
              ? "border-[#c3f400]/40 bg-[#c3f400]/10 text-[#c3f400]"
              : "border-[#93000a]/50 bg-[#93000a]/20 text-[#ffb4ab]"
          }`}
        >
          {notice.text}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading pricing" />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <>
          <SlotGroup
            title="Day Slots"
            subtitle="Pricing and availability for daytime sessions"
            slots={daySlots}
            draftOf={draft}
            onPatch={patch}
            onSave={save}
            savingId={savingId}
          />
          <SlotGroup
            title="Night Slots"
            subtitle="Pricing and availability for evening sessions"
            slots={nightSlots}
            draftOf={draft}
            onPatch={patch}
            onSave={save}
            savingId={savingId}
          />
        </>
      )}
    </div>
  );
}

function SlotGroup({
  title,
  subtitle,
  slots,
  draftOf,
  onPatch,
  onSave,
  savingId,
}: {
  title: string;
  subtitle: string;
  slots: AdminSlot[];
  draftOf: (slot: AdminSlot) => AdminSlot;
  onPatch: (id: string, patch: Partial<AdminSlot>) => void;
  onSave: (id: string) => void;
  savingId: string | null;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[#444933]/40 px-5 py-4">
        <div>
          <h3
            className="uppercase tracking-wide text-white"
            style={{ fontFamily: "var(--font-oswald)", fontSize: "18px" }}
          >
            {title}
          </h3>
          <p
            className="mt-0.5 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b border-[#444933]/40 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Price (৳)</th>
              <th className="px-4 py-3">Duration (min)</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => {
              const d = draftOf(slot);
              const dirty =
                d.price !== slot.price ||
                d.durationMinutes !== slot.durationMinutes ||
                d.startTime !== slot.startTime ||
                d.endTime !== slot.endTime ||
                d.isActive !== slot.isActive;
              return (
                <tr
                  key={slot.id}
                  className={cn(
                    "border-b border-[#444933]/20 transition-colors",
                    d.isActive ? "" : "opacity-60",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-white">{slot.id}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#8e9379]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {formatPrice(d.price)}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="time"
                      className="w-28"
                      value={d.startTime}
                      onChange={(e) => onPatch(slot.id, { startTime: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="time"
                      className="w-28"
                      value={d.endTime}
                      onChange={(e) => onPatch(slot.id, { endTime: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      className="w-28"
                      min={1}
                      value={d.price}
                      onChange={(e) => onPatch(slot.id, { price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      className="w-24"
                      min={30}
                      step={15}
                      value={d.durationMinutes}
                      onChange={(e) => onPatch(slot.id, { durationMinutes: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => onPatch(slot.id, { isActive: !d.isActive })}
                      className={cn(
                        "relative h-6 w-11 rounded-full border transition-colors",
                        d.isActive
                          ? "border-[#c3f400] bg-[#c3f400]"
                          : "border-[#444933] bg-[#0c0f0f]",
                      )}
                      aria-label={d.isActive ? "Disable slot" : "Enable slot"}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all",
                          d.isActive
                            ? "left-[calc(100%-1.25rem)] bg-[#283500]"
                            : "left-0.5 bg-[#8e9379]",
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <Button
                      size="sm"
                      disabled={savingId === slot.id || !dirty}
                      onClick={() => onSave(slot.id)}
                    >
                      {savingId === slot.id ? "Saving..." : "Save"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
