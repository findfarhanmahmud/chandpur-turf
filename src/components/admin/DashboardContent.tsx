"use client";

import { useEffect, useState } from "react";
import type { DashboardStats } from "@/types/admin";
import { Card, CardHeader, EmptyState, Spinner } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";
import { formatISODate } from "@/lib/booking/time";

interface WeekDay {
  date: string;
  available: number;
  booked: number;
}

function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setWeek(data.week ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load dashboard stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, week, loading, error };
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <span
        className="pointer-events-none absolute -right-4 -top-6 material-symbols-outlined text-[64px] text-[#c3f400]/10"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="material-symbols-outlined text-[22px] text-[#c3f400]">{icon}</span>
      <p
        className="mt-3 text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        {label}
      </p>
      {accent && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#c3f400]" />
      )}
    </Card>
  );
}

export default function DashboardContent() {
  const { stats, week, loading, error } = useDashboard();

  if (loading) return <Spinner label="Loading dashboard" />;
  if (error || !stats)
    return <EmptyState message={error ?? "No data available."} />;

  const bookedToday = stats.totalSlotsToday - stats.availableSlotsToday;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon="today"
          label={`Today's Bookings (${formatISODate(stats.today)})`}
          value={String(stats.todayBookings)}
          accent
        />
        <StatCard icon="hourglass_top" label="Pending Bookings" value={String(stats.pendingBookings)} />
        <StatCard icon="verified" label="Confirmed Bookings" value={String(stats.confirmedBookings)} />
        <StatCard
          icon="check_circle"
          label={`Available Slots Today (${bookedToday}/${stats.totalSlotsToday} booked)`}
          value={String(stats.availableSlotsToday)}
        />
        <StatCard icon="payments" label="Today's Revenue" value={formatPrice(stats.todayRevenue)} accent />
      </div>

      <Card>
        <CardHeader
          title="Next 7 Days"
          subtitle="Available vs booked slots per day"
        />
        {week.length === 0 ? (
          <EmptyState message="No schedule data." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {week.map((day) => {
              const pct = day.booked === 0 ? 0 : Math.round((day.booked / (day.booked + day.available)) * 100);
              return (
                <div
                  key={day.date}
                  className="rounded-lg border border-[#444933]/40 bg-[#0c0f0f] p-3"
                >
                  <p
                    className="text-[10px] uppercase tracking-widest text-[#c4c9ac]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {formatISODate(day.date)}
                  </p>
                  <p className="mt-2 text-lg font-bold text-white" style={{ fontFamily: "var(--font-oswald)" }}>
                    {day.available}
                    <span className="text-[11px] font-normal text-[#8e9379]"> available</span>
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#282a2b]">
                    <div
                      className="h-full rounded-full bg-[#c3f400]"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[9px] uppercase tracking-wider text-[#8e9379]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {pct}% booked
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
