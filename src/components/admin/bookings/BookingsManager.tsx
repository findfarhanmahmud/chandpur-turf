"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminBooking } from "@/types/admin";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Select,
  Spinner,
  StatusBadge,
} from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";
import { formatISODate } from "@/lib/booking/time";
import BookingDetailModal from "@/components/admin/schedule/BookingDetailModal";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface Filters {
  status: string;
  search: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { status: "", search: "", from: "", to: "" };

export default function BookingsManager() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [detail, setDetail] = useState<{ booking: AdminBooking; confirm: boolean } | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async (f: Filters) => {
    const params = new URLSearchParams();
    if (f.status) params.set("status", f.status);
    if (f.search) params.set("search", f.search);
    if (f.from) params.set("from", f.from);
    if (f.to) params.set("to", f.to);
    try {
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setError(null);
      setBookings(data.bookings);
    } catch {
      setError("Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(EMPTY_FILTERS));
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  function applyFilters(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    setLoading(true);
    load(merged);
  }

  function showNotice(type: "ok" | "err", text: string) {
    setNotice({ type, text });
  }

  function onModalSuccess(message: string) {
    showNotice("ok", message);
    setDetail(null);
    void load(filters);
  }

  async function reject(booking: AdminBooking) {
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Rejection failed.");
      showNotice("ok", `${booking.bookingRef} rejected.`);
      void load(filters);
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Rejection failed.");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Filters" subtitle="Search, status and date range" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search name / ref / phone"
            value={filters.search}
            onChange={(e) => applyFilters({ search: e.target.value })}
          />
          <Select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => applyFilters({ from: e.target.value })}
          />
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => applyFilters({ to: e.target.value })}
          />
          <Button
            variant="outline"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setLoading(true);
              load(EMPTY_FILTERS);
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

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

      <Card className="overflow-hidden p-0">
        <CardHeader
          title={`Bookings (${bookings.length})`}
          subtitle="Pending requests are confirmed only after payment is verified"
        />
        {loading ? (
          <Spinner label="Loading bookings" />
        ) : error ? (
          <EmptyState message={error} />
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b border-[#444933]/40 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onView={() => setDetail({ booking, confirm: false })}
                    onConfirm={() => setDetail({ booking, confirm: true })}
                    onReject={() => void reject(booking)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detail && (
        <BookingDetailModal
          booking={detail.booking}
          startInConfirmMode={detail.confirm}
          onClose={() => setDetail(null)}
          onSuccess={onModalSuccess}
          onError={(msg) => showNotice("err", msg)}
        />
      )}
    </div>
  );
}

function BookingRow({
  booking,
  onView,
  onConfirm,
  onReject,
}: {
  booking: AdminBooking;
  onView: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const pending = booking.status === "pending";
  const confirmed = booking.status === "confirmed";
  const cancelled = booking.status === "cancelled";
  const completed = booking.status === "completed";

  return (
    <tr className="border-b border-[#444933]/20 transition-colors hover:bg-[#1e2020]">
      <td className="px-4 py-3 font-semibold text-[#c3f400]">{booking.bookingRef}</td>
      <td className="px-4 py-3 text-white">{booking.customerName}</td>
      <td className="px-4 py-3 text-[#c4c9ac]">{formatISODate(booking.bookingDate)}</td>
      <td className="px-4 py-3 text-[#c4c9ac]">{booking.selectedTimeDisplay}</td>
      <td className="px-4 py-3 text-[#c4c9ac]">{booking.durationMinutes} min</td>
      <td className="px-4 py-3 font-semibold text-white">{formatPrice(booking.price)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="ghost" onClick={onView}>
            View Details
          </Button>
          {pending && (
            <>
              <Button size="sm" variant="primary" onClick={onConfirm}>
                <span className="material-symbols-outlined text-sm">lock</span>
                Confirm & Block
              </Button>
              <Button size="sm" variant="danger" onClick={onReject}>
                Reject
              </Button>
            </>
          )}
          {confirmed && (
            <Button size="sm" variant="outline" onClick={onConfirm}>
              Manage
            </Button>
          )}
          {cancelled && (
            <Button size="sm" variant="subtle" onClick={onConfirm}>
              Restore
            </Button>
          )}
          {completed && (
            <Button size="sm" variant="outline" onClick={onConfirm}>
              Manage
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
