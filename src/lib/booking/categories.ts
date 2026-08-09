import type { SlotCategory, TimeSlot } from "@/types/booking";
import type { CategoryConfig } from "@/data/slots";

const FALLBACK: Record<SlotCategory, CategoryConfig> = {
  day: {
    label: "Day Slot",
    icon: "light_mode",
    price: 1500,
    durationMinutes: 90,
    timeRange: "5:00 AM - 5:00 PM",
    popular: true,
  },
  night: {
    label: "Night Slot",
    icon: "dark_mode",
    price: 2000,
    durationMinutes: 90,
    timeRange: "5:00 PM - 3:30 AM",
  },
};

// Derives the per-category summary (price / duration / time range) from the
// database slot definitions, falling back to defaults when a category is empty.
export function buildCategoryConfigs(
  slots: TimeSlot[],
): Record<SlotCategory, CategoryConfig> {
  const result = { ...FALLBACK };
  for (const category of ["day", "night"] as SlotCategory[]) {
    const group = slots.filter((s) => s.category === category);
    if (group.length === 0) continue;
    const first = group[0];
    const last = group[group.length - 1];
    result[category] = {
      ...result[category],
      price: first.price,
      durationMinutes: first.durationMinutes,
      timeRange: `${first.time} - ${last.endTime}`,
    };
  }
  return result;
}
