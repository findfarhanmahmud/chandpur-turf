import type { TimeSlot, SlotCategory } from "@/types/booking";

export const SLOT_DURATION_MINUTES = 90;

// Day slots: 5:00 AM - 5:00 PM @ ৳1,500 (90 minutes each)
// NOTE: These values mirror the seeded `slots` table and are used only as an
// offline/development fallback. The database is the source of truth.
const daySlots: TimeSlot[] = [
  { id: "d-0500", time: "5:00 AM",  endTime: "6:30 AM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "05:00:00", endTimeRaw: "06:30:00", durationMinutes: 90, sortOrder: 1, isActive: true },
  { id: "d-0630", time: "6:30 AM",  endTime: "8:00 AM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "06:30:00", endTimeRaw: "08:00:00", durationMinutes: 90, sortOrder: 2, isActive: true },
  { id: "d-0800", time: "8:00 AM",  endTime: "9:30 AM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "08:00:00", endTimeRaw: "09:30:00", durationMinutes: 90, sortOrder: 3, isActive: true },
  { id: "d-0930", time: "9:30 AM",  endTime: "11:00 AM", price: 1500, category: "day", isBooked: false, startTimeRaw: "09:30:00", endTimeRaw: "11:00:00", durationMinutes: 90, sortOrder: 4, isActive: true },
  { id: "d-1100", time: "11:00 AM", endTime: "12:30 PM", price: 1500, category: "day", isBooked: false, startTimeRaw: "11:00:00", endTimeRaw: "12:30:00", durationMinutes: 90, sortOrder: 5, isActive: true },
  { id: "d-1230", time: "12:30 PM", endTime: "2:00 PM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "12:30:00", endTimeRaw: "14:00:00", durationMinutes: 90, sortOrder: 6, isActive: true },
  { id: "d-1400", time: "2:00 PM",  endTime: "3:30 PM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "14:00:00", endTimeRaw: "15:30:00", durationMinutes: 90, sortOrder: 7, isActive: true },
  { id: "d-1530", time: "3:30 PM",  endTime: "5:00 PM",  price: 1500, category: "day", isBooked: false, startTimeRaw: "15:30:00", endTimeRaw: "17:00:00", durationMinutes: 90, sortOrder: 8, isActive: true },
];

// Night slots: 5:00 PM - 3:30 AM @ ৳2,000 (90 minutes each)
const nightSlots: TimeSlot[] = [
  { id: "n-1700", time: "5:00 PM",  endTime: "6:30 PM",  price: 2000, category: "night", isBooked: false, startTimeRaw: "17:00:00", endTimeRaw: "18:30:00", durationMinutes: 90, sortOrder: 1, isActive: true },
  { id: "n-1830", time: "6:30 PM",  endTime: "8:00 PM",  price: 2000, category: "night", isBooked: false, startTimeRaw: "18:30:00", endTimeRaw: "20:00:00", durationMinutes: 90, sortOrder: 2, isActive: true },
  { id: "n-2000", time: "8:00 PM",  endTime: "9:30 PM",  price: 2000, category: "night", isBooked: false, startTimeRaw: "20:00:00", endTimeRaw: "21:30:00", durationMinutes: 90, sortOrder: 3, isActive: true },
  { id: "n-2130", time: "9:30 PM",  endTime: "11:00 PM", price: 2000, category: "night", isBooked: false, startTimeRaw: "21:30:00", endTimeRaw: "23:00:00", durationMinutes: 90, sortOrder: 4, isActive: true },
  { id: "n-2300", time: "11:00 PM", endTime: "12:30 AM", price: 2000, category: "night", isBooked: false, startTimeRaw: "23:00:00", endTimeRaw: "00:30:00", durationMinutes: 90, sortOrder: 5, isActive: true },
  { id: "n-0030", time: "12:30 AM", endTime: "2:00 AM",  price: 2000, category: "night", isBooked: false, startTimeRaw: "00:30:00", endTimeRaw: "02:00:00", durationMinutes: 90, sortOrder: 6, isActive: true },
  { id: "n-0200", time: "2:00 AM",  endTime: "3:30 AM",  price: 2000, category: "night", isBooked: false, startTimeRaw: "02:00:00", endTimeRaw: "03:30:00", durationMinutes: 90, sortOrder: 7, isActive: true },
];

export const allSlots: TimeSlot[] = [...daySlots, ...nightSlots];

export const slotsByCategory: Record<SlotCategory, TimeSlot[]> = {
  day: daySlots,
  night: nightSlots,
};

export interface CategoryConfig {
  label: string;
  icon: string;
  price: number;
  durationMinutes: number;
  timeRange: string;
  popular?: boolean;
}

export const categoryConfig: Record<SlotCategory, CategoryConfig> = {
  day: {
    label: "Day Slot",
    icon: "light_mode",
    price: 1500,
    durationMinutes: SLOT_DURATION_MINUTES,
    timeRange: "5:00 AM - 5:00 PM",
    popular: true,
  },
  night: {
    label: "Night Slot",
    icon: "dark_mode",
    price: 2000,
    durationMinutes: SLOT_DURATION_MINUTES,
    timeRange: "5:00 PM - 3:30 AM",
  },
};
