"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DateSelector from "@/components/booking/DateSelector";
import SlotSelector from "@/components/booking/SlotSelector";
import DetailsForm from "@/components/booking/DetailsForm";
import BookingSummary from "@/components/booking/BookingSummary";
import BookingNotice from "@/components/booking/BookingNotice";
import { type TimeSlot, type BookingFormData, type BookingFormErrors } from "@/types/booking";
import { validateBookingForm } from "@/lib/validation";
import { submitBooking } from "@/lib/bookingService";
import { toISODate } from "@/lib/booking";
import { applyAvailability, buildAvailabilityMap } from "@/lib/booking/slots";
import { PUBLIC_FALLBACK_DATA } from "@/hooks/usePublicData";
import type { SlotAvailabilityRow } from "@/types/database";

interface BookingNoticeState {
  type: "success" | "error";
  message: string;
}

const MIN_SUBMIT_FEEDBACK_MS = 700;

export default function BookingPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Base slot definitions (from the database) + per-date availability merged in.
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const baseSlotsRef = useRef<TimeSlot[]>([]);

  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    phone: "",
    whatsapp: "",
    teamName: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<BookingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<BookingNoticeState | null>(null);

  const loadAvailability = useCallback(async (date: Date) => {
    setAvailabilityLoading(true);
    const base = baseSlotsRef.current;
    try {
      const res = await fetch(
        `/api/public/availability?date=${toISODate(date)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("availability failed");
      const rows = (await res.json()) as SlotAvailabilityRow[];
      setSlots(applyAvailability(base, buildAvailabilityMap(rows)));
    } catch {
      setSlots(base.map((s) => ({ ...s, availability: "available", isBooked: false })));
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Initial load: bootstrap slot definitions, then availability for the date.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/bootstrap", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bootstrap failed"))))
      .then((data: typeof PUBLIC_FALLBACK_DATA) => {
        if (cancelled) return;
        const base = data.slots.length > 0 ? data.slots : PUBLIC_FALLBACK_DATA.slots;
        baseSlotsRef.current = base;
        setSlots(base);
        setSlotsLoading(false);
        const date = selectedDate ?? new Date();
        void loadAvailability(date);
      })
      .catch(() => {
        if (cancelled) return;
        const base = PUBLIC_FALLBACK_DATA.slots;
        baseSlotsRef.current = base;
        setSlots(base);
        setSlotsLoading(false);
        const date = selectedDate ?? new Date();
        void loadAvailability(date);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    void loadAvailability(date);
  };

  const handleFormChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof BookingFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleConfirmBooking = async () => {
    const errors = validateBookingForm(formData, selectedDate, selectedSlots);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.date) {
        scrollToSection("date-section");
      } else if (errors.slot || errors.time) {
        scrollToSection("slot-section");
      } else {
        scrollToSection("details-section");
      }
      return;
    }

    setFormErrors({});
    if (!selectedDate || selectedSlots.length === 0) return;

    setIsSubmitting(true);
    const payload = {
      customerName: formData.name.trim(),
      phoneNumber: formData.phone.trim(),
      whatsappNumber: formData.whatsapp.trim() || formData.phone.trim(),
      teamName: formData.teamName.trim(),
      notes: formData.notes.trim(),
      bookingDate: toISODate(selectedDate),
      slotIds: selectedSlots.map((slot) => slot.id),
    };

    const [result] = await Promise.all([
      submitBooking(payload),
      new Promise<void>((resolve) => setTimeout(resolve, MIN_SUBMIT_FEEDBACK_MS)),
    ]);
    setIsSubmitting(false);

    setNotice({ type: result.success ? "success" : "error", message: result.message });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Left Column: Selection Steps (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          <SlotSelector
            slots={slots}
            selectedSlots={selectedSlots}
            onSlotsChange={setSelectedSlots}
            isLoading={slotsLoading || availabilityLoading}
          />

          <DetailsForm
            formData={formData}
            formErrors={formErrors}
            isEnabled={selectedSlots.length > 0}
            onChange={handleFormChange}
          />
        </div>

        {/* Right Column: Sticky Summary Panel (4 cols) */}
        <div className="lg:col-span-4">
          <BookingSummary
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {notice && (
        <BookingNotice
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}
    </>
  );
}
