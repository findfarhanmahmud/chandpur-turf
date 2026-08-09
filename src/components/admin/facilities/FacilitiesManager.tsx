"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminFacility } from "@/types/admin";
import { FACILITY_ICON_KEYS } from "@/lib/facility-icons";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Label,
  Select,
  Spinner,
  Textarea,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default function FacilitiesManager() {
  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", description: "", icon: "sprout", isActive: true });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ label: "", description: "", icon: "" });
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/facilities", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setError(null);
      setFacilities(data.facilities);
    } catch {
      setError("Could not load facilities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function createFacility(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          sortOrder: facilities.length + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Could not create facility");
      setNewItem({ label: "", description: "", icon: "sprout", isActive: true });
      setShowAdd(false);
      setNotice({ type: "ok", text: "Facility created." });
      await load();
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Could not create facility." });
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(facility: AdminFacility) {
    setSavingId(facility.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/facilities/${facility.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: edit.label, description: edit.description, icon: edit.icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Could not update facility");
      setFacilities((prev) =>
        prev.map((x) => (x.id === facility.id ? data.facility : x)),
      );
      setEditingId(null);
      setNotice({ type: "ok", text: "Facility updated." });
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Could not update facility." });
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(facility: AdminFacility) {
    const res = await fetch(`/api/admin/facilities/${facility.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !facility.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setFacilities((prev) => prev.map((x) => (x.id === facility.id ? data.facility : x)));
    }
  }

  async function remove(facility: AdminFacility) {
    if (!confirm(`Delete "${facility.label}"?`)) return;
    const res = await fetch(`/api/admin/facilities/${facility.id}`, { method: "DELETE" });
    if (res.ok) {
      setFacilities((prev) => prev.filter((x) => x.id !== facility.id));
      setNotice({ type: "ok", text: "Facility deleted." });
    } else {
      setNotice({ type: "err", text: "Could not delete the facility." });
    }
  }

  async function move(facility: AdminFacility, dir: -1 | 1) {
    const idx = facilities.findIndex((x) => x.id === facility.id);
    const other = facilities[idx + dir];
    if (!other) return;

    const orderedIds = facilities.map((x) => x.id);
    [orderedIds[idx], orderedIds[idx + dir]] = [orderedIds[idx + dir], orderedIds[idx]];

    const res = await fetch("/api/admin/facilities/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (res.ok) {
      setFacilities((prev) => {
        const next = [...prev];
        next[idx] = other;
        next[idx + dir] = facility;
        return next;
      });
      setNotice({ type: "ok", text: "Order updated." });
    }
  }

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

      <Card>
        <div className="flex items-center justify-between">
          <CardHeader title={`Facilities (${facilities.length})`} subtitle="Visible on the public homepage" />
          <Button variant="outline" onClick={() => setShowAdd((v) => !v)}>
            <span className="material-symbols-outlined text-base">add</span>
            Add Facility
          </Button>
        </div>

        {showAdd && (
          <form
            onSubmit={createFacility}
            className="mb-5 rounded-lg border border-[#c3f400]/40 bg-[#0c0f0f] p-4"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="fac-label">Name</Label>
                <Input
                  id="fac-label"
                  required
                  value={newItem.label}
                  onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Floodlit night arena"
                />
              </div>
              <div>
                <Label htmlFor="fac-icon">Icon</Label>
                <Select
                  id="fac-icon"
                  value={newItem.icon}
                  onChange={(e) => setNewItem((p) => ({ ...p, icon: e.target.value }))}
                >
                  {FACILITY_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="fac-desc">Description</Label>
                <Textarea
                  id="fac-desc"
                  rows={2}
                  value={newItem.description}
                  onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description shown on the site"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <Spinner label="Loading facilities" />
        ) : error ? (
          <EmptyState message={error} />
        ) : facilities.length === 0 ? (
          <EmptyState message="No facilities yet." />
        ) : (
          <ul className="space-y-2">
            {facilities.map((facility, idx) => (
              <li
                key={facility.id}
                className={cn(
                  "rounded-lg border border-[#444933]/40 bg-[#0c0f0f] p-3",
                  !facility.isActive && "opacity-60",
                )}
              >
                {editingId === facility.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={edit.label}
                          onChange={(e) => setEdit((p) => ({ ...p, label: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select value={edit.icon} onChange={(e) => setEdit((p) => ({ ...p, icon: e.target.value }))}>
                          {FACILITY_ICON_KEYS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={edit.description}
                          onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={savingId === facility.id} onClick={() => saveEdit(facility)}>
                        {savingId === facility.id ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex shrink-0 flex-col">
                      <button
                        disabled={idx === 0}
                        onClick={() => move(facility, -1)}
                        className="rounded p-0.5 text-[#8e9379] hover:text-[#c3f400] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_up</span>
                      </button>
                      <button
                        disabled={idx === facilities.length - 1}
                        onClick={() => move(facility, 1)}
                        className="rounded p-0.5 text-[#8e9379] hover:text-[#c3f400] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                      </button>
                    </div>
                    <span className="material-symbols-outlined text-[22px] text-[#c3f400]">sports_soccer</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{facility.label}</p>
                      <p className="truncate text-[11px] text-[#c4c9ac]">
                        {facility.description || "No description"} · icon: {facility.icon}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleActive(facility)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                        facility.isActive ? "border-[#c3f400] bg-[#c3f400]" : "border-[#444933] bg-[#121414]",
                      )}
                      aria-label={facility.isActive ? "Disable" : "Enable"}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all",
                          facility.isActive ? "left-[calc(100%-1.25rem)] bg-[#283500]" : "left-0.5 bg-[#8e9379]",
                        )}
                      />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(facility.id);
                        setEdit({ label: facility.label, description: facility.description, icon: facility.icon });
                      }}
                      className="rounded border border-[#444933] p-1.5 text-[#c4c9ac] hover:border-[#c3f400] hover:text-[#c3f400]"
                      aria-label="Edit facility"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => remove(facility)}
                      className="rounded border border-[#93000a]/50 p-1.5 text-[#ffb4ab] hover:bg-[#93000a]/20"
                      aria-label="Delete facility"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
