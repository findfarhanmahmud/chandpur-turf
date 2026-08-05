"use client";

import { useState } from "react";
import DateSelector from "@/components/booking/DateSelector";
import SlotSelector from "@/components/booking/SlotSelector";
import DetailsForm from "@/components/booking/DetailsForm";
import BookingSummary from "@/components/booking/BookingSummary";
import BookingNotice from "@/components/booking/BookingNotice";
import { type TimeSlot, type BookingFormData, type BookingFormErrors } from "@/types/booking";
import { createBookingRecord } from "@/lib/booking";
import { validateBookingForm } from "@/lib/validation";
import { submitBooking } from "@/lib/bookingService";

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

    const booking = createBookingRecord({
      customerName: formData.name.trim(),
      phoneNumber: formData.phone.trim(),
      whatsappNumber: formData.whatsapp.trim() || formData.phone.trim(),
      teamName: formData.teamName.trim(),
      notes: formData.notes.trim(),
      bookingDate: selectedDate,
      slots: selectedSlots,
    });

    setIsSubmitting(true);
    const [result] = await Promise.all([
      submitBooking(booking),
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
            onDateSelect={setSelectedDate}
          />

          <SlotSelector
            selectedSlots={selectedSlots}
            onSlotsChange={setSelectedSlots}
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
