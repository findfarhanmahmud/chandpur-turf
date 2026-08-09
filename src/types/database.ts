import type { BookingStatus, SlotCategory } from "@/types/booking";

// Row shapes matching the Supabase schema (see supabase/migrations/0001_init.sql).
// These are the raw database types; UI code generally works with the mapped
// types in src/types/booking.ts.

export interface SlotRow {
  id: string;
  category: SlotCategory;
  start_time: string; // "05:00:00"
  end_time: string; // "06:30:00"
  price: number;
  duration_minutes: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  booking_ref: string;
  customer_name: string;
  phone_number: string;
  whatsapp_number: string;
  team_name: string | null;
  notes: string | null;
  booking_date: string; // "YYYY-MM-DD"
  slot_category: SlotCategory;
  start_time: string; // "17:00:00"
  end_time: string; // "21:30:00"
  selected_time_display: string; // "5:00 PM - 9:30 PM"
  slot_count: number;
  duration_minutes: number;
  price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingSlotRow {
  booking_id: string;
  slot_id: string;
  booking_date: string;
  is_released: boolean;
  created_at: string;
}

export interface BlockedSlotRow {
  id: string;
  slot_id: string;
  booking_date: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface GalleryImageRow {
  id: string;
  title: string;
  caption: string | null;
  category: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface FacilityRow {
  id: string;
  label: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: string;
  is_public: boolean;
  updated_at: string;
}

export interface AdminUserRow {
  id: string;
  username: string;
  display_name: string | null;
  role: "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Returned by the SECURITY DEFINER RPC create_booking().
export interface CreateBookingResult {
  id: string;
  booking_ref: string;
  booking_date: string;
  slot_category: SlotCategory;
  start_time: string; // "HH24:MI"
  end_time: string; // "HH24:MI"
  slot_count: number;
  duration_minutes: number;
  price: number;
  status: BookingStatus;
}

export type SlotAvailabilityStatus =
  | "available"
  | "booked"
  | "blocked"
  | "elapsed";

export interface SlotAvailabilityRow {
  slot_id: string;
  status: SlotAvailabilityStatus;
}
