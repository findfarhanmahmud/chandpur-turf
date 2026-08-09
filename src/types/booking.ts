// Slot types
export type SlotCategory = "day" | "night";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

// Availability of a concrete slot for a selected date (from Supabase).
export type SlotAvailability =
  | "available"
  | "booked"
  | "blocked"
  | "elapsed";

export interface TimeSlot {
  id: string;
  time: string; // display start, e.g. "5:00 AM"
  endTime: string; // display end, e.g. "6:30 AM"
  price: number; // e.g. 1500
  category: SlotCategory;
  isBooked: boolean; // unavailable for the currently selected date
  // DB-derived fields (source of truth is the `slots` table)
  startTimeRaw: string; // "05:00:00"
  endTimeRaw: string; // "06:30:00"
  durationMinutes: number; // e.g. 90
  sortOrder: number;
  isActive: boolean;
  availability?: SlotAvailability; // status for the selected date
}

export interface DateOption {
  date: Date;
  dayLabel: string; // e.g. "TODAY", "FRI"
  dateNum: number; // e.g. 24
  monthLabel: string; // e.g. "OCT"
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

// Shape of a booking ready to be sent via WhatsApp.
export interface BookingRecord {
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: string; // ISO date, e.g. "2026-08-05"
  slotCategory: SlotCategory;
  selectedTime: string; // combined continuous range, e.g. "5:00 PM - 9:30 PM"
  slotCount: number;
  duration: number; // minutes
  price: number; // BDT
  bookingStatus: BookingStatus;
  createdAt: string; // ISO datetime
}

// Public site content assembled from Supabase (source of truth).
export interface PublicFacility {
  id: string;
  label: string;
  description: string;
  icon: string; // icon key mapped to a Lucide icon in the app
}

export interface PublicGalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
}

export interface PublicSettings {
  [key: string]: string;
}

export interface PublicSiteData {
  settings: PublicSettings;
  slots: TimeSlot[]; // active slots, sorted by category + sort_order
  facilities: PublicFacility[];
  gallery: PublicGalleryItem[];
}
