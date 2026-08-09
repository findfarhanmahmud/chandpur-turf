import type { BookingStatus, SlotCategory } from "@/types/booking";

// Resolved admin identity (from admin_users + the HttpOnly session cookie).
// `username` is the login identity and is what the admin UI shows.
export interface AdminSession {
  userId: string;
  username: string;
  displayName: string | null;
  role: "admin" | "super_admin";
}

// Admin-facing booking with the concrete slot ids it occupies.
export interface AdminBooking {
  id: string;
  bookingRef: string;
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName: string | null;
  notes: string | null;
  bookingDate: string; // "YYYY-MM-DD"
  slotCategory: SlotCategory;
  startTime: string; // "HH24:MI"
  endTime: string; // "HH24:MI"
  selectedTimeDisplay: string;
  slotCount: number;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  slotIds: string[];
}

export interface DashboardStats {
  today: string; // "YYYY-MM-DD"
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  availableSlotsToday: number;
  totalSlotsToday: number;
  todayRevenue: number;
}

export interface AdminSlot {
  id: string;
  category: SlotCategory;
  startTime: string; // "HH24:MI"
  endTime: string; // "HH24:MI"
  price: number;
  durationMinutes: number;
  sortOrder: number;
  isActive: boolean;
}

export interface BlockedSlot {
  id: string;
  slotId: string;
  bookingDate: string;
  reason: string | null;
}

// One cell in the schedule grid for a (date, slot) pair.
export interface ScheduleEntry {
  slotId: string;
  bookingDate: string;
  status: "available" | "booked" | "pending" | "blocked" | "elapsed";
  bookingId?: string;
  bookingRef?: string;
  customerName?: string;
  reason?: string;
}

export interface ScheduleRangeData {
  from: string;
  to: string;
  slots: AdminSlot[];
  entries: Record<string, Record<string, ScheduleEntry>>;
  // Full bookings (pending + confirmed) for the range, so the UI can open
  // booking details / the confirm modal without a second round trip.
  bookings: AdminBooking[];
}

export interface AdminFacility {
  id: string;
  label: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminGalleryImage {
  id: string;
  title: string;
  caption: string | null;
  category: string;
  imageUrl: string;
  storagePath: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export interface AdminSetting {
  key: string;
  value: string;
  isPublic: boolean;
  updatedAt: string;
}
