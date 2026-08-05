import { type BookingFormData, type BookingFormErrors, type TimeSlot } from '@/types/booking';

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Full name is required';
  if (value.length < 2) return 'Full name must be at least 2 characters';
  return undefined;
}

export function validatePhoneNumber(phone: string): string | undefined {
  const value = phone.trim();
  if (!value) return 'Phone number is required';
  if (!BD_PHONE_REGEX.test(value)) {
    return 'Enter a valid Bangladeshi phone number (e.g. 01712345678)';
  }
  return undefined;
}

export function validateWhatsAppNumber(whatsapp: string): string | undefined {
  const value = whatsapp.trim();
  if (!value) return undefined; // optional; falls back to phone
  if (!BD_PHONE_REGEX.test(value)) {
    return 'Enter a valid Bangladeshi WhatsApp number (e.g. 01712345678)';
  }
  return undefined;
}

export function validateBookingDate(date: Date | null): string | undefined {
  if (!date) return 'Please select a booking date';
  return undefined;
}

export function validateSelectedSlots(slots: TimeSlot[]): string | undefined {
  if (slots.length === 0) return 'Please select a time slot';
  return undefined;
}

export function validateBookingForm(
  formData: BookingFormData,
  bookingDate: Date | null,
  slots: TimeSlot[],
): BookingFormErrors {
  const errors: BookingFormErrors = {
    name: validateName(formData.name),
    phone: validatePhoneNumber(formData.phone),
    whatsapp: validateWhatsAppNumber(formData.whatsapp),
    date: validateBookingDate(bookingDate),
    slot: validateSelectedSlots(slots),
    time: validateSelectedSlots(slots),
  };

  (Object.keys(errors) as (keyof BookingFormErrors)[]).forEach((key) => {
    if (errors[key] === undefined) delete errors[key];
  });

  return errors;
}
