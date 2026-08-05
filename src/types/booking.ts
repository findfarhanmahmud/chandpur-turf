// Slot types
export type SlotCategory = 'morning' | 'day' | 'night';

export type BookingStatus = 'Pending';

export interface TimeSlot {
  id: string;
  time: string;          // e.g. "5:00 AM"
  endTime: string;       // e.g. "6:00 AM"
  price: number;         // e.g. 1999
  category: SlotCategory;
  isBooked: boolean;
}

export interface DateOption {
  date: Date;
  dayLabel: string;      // e.g. "TODAY", "FRI"
  dateNum: number;       // e.g. 24
  monthLabel: string;    // e.g. "OCT"
  disabled?: boolean;
}

export interface BookingFormData {
  name: string;
  phone: string;
  whatsapp: string;
  teamName: string;
  notes: string;
}

export interface BookingFormErrors {
  name?: string;
  phone?: string;
  whatsapp?: string;
  date?: string;
  slot?: string;
  time?: string;
}

// Shape of a booking ready to be persisted (Supabase / API route in the future).
export interface BookingRecord {
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: string;       // ISO date, e.g. "2026-08-05"
  slotCategory: SlotCategory;
  selectedTime: string;      // combined continuous range, e.g. "10:00 AM - 12:00 PM"
  slotCount: number;
  duration: number;          // minutes
  price: number;             // BDT
  bookingStatus: BookingStatus;
  createdAt: string;         // ISO datetime
}
