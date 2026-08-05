import { formatDate } from '@/lib/utils';
import { type BookingRecord, type SlotCategory, type TimeSlot } from '@/types/booking';

export const BOOKING_DURATION_MINUTES = 60;
export const BOOKING_STATUS = 'Pending' as const;

export interface CreateBookingInput {
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: Date;
  slots: TimeSlot[]; // one or more consecutive slots in the same category
}

export function createBookingRecord(input: CreateBookingInput): BookingRecord {
  const now = new Date();
  const { slots } = input;
  return {
    bookingId: generateBookingId(),
    customerName: input.customerName,
    phoneNumber: input.phoneNumber,
    whatsappNumber: input.whatsappNumber,
    teamName: input.teamName || undefined,
    notes: input.notes || undefined,
    bookingDate: toISODate(input.bookingDate),
    slotCategory: slots[0].category,
    selectedTime: combineTimeRange(slots),
    slotCount: slots.length,
    duration: getTotalDurationMinutes(slots),
    price: getTotalPrice(slots),
    bookingStatus: BOOKING_STATUS,
    createdAt: now.toISOString(),
  };
}

// Combines consecutive slots into one continuous range, e.g. "10:00 AM - 12:00 PM".
export function combineTimeRange(slots: TimeSlot[]): string {
  if (slots.length === 0) return '';
  const first = slots[0];
  const last = slots[slots.length - 1];
  return `${first.time} - ${last.endTime}`;
}

export function getTotalDurationMinutes(slots: TimeSlot[]): number {
  return slots.length * BOOKING_DURATION_MINUTES;
}

export function getTotalPrice(slots: TimeSlot[]): number {
  return slots.reduce((sum, slot) => sum + slot.price, 0);
}

export function generateBookingId(): string {
  return crypto.randomUUID();
}

// Local date -> "YYYY-MM-DD" (avoids UTC timezone drift).
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// "YYYY-MM-DD" -> human-readable local date.
export function formatBookingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day));
}

const SLOT_CATEGORY_LABELS: Record<SlotCategory, string> = {
  morning: 'Morning',
  day: 'Day',
  night: 'Night',
};

export function getSlotCategoryLabel(category: SlotCategory): string {
  return SLOT_CATEGORY_LABELS[category];
}
