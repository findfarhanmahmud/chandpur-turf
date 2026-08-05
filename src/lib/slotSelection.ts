import { type TimeSlot } from "@/types/booking";

function indexInCategory(slot: TimeSlot, categorySlots: TimeSlot[]): number {
  return categorySlots.findIndex((s) => s.id === slot.id);
}

// Toggles a slot in/out of a selection that always stays a single run of
// consecutive slots within one category.
export function toggleSlotSelection(
  current: TimeSlot[],
  clicked: TimeSlot,
  categorySlots: TimeSlot[],
): TimeSlot[] {
  if (current.length === 0 || current[0].category !== clicked.category) {
    return [clicked];
  }

  const min = indexInCategory(current[0], categorySlots);
  const max = indexInCategory(current[current.length - 1], categorySlots);
  const clickIndex = indexInCategory(clicked, categorySlots);
  if (min === -1 || max === -1 || clickIndex === -1) return [clicked];

  // Clicked inside the current run -> shrink edges or collapse interior.
  if (clickIndex >= min && clickIndex <= max) {
    if (clickIndex === min && clickIndex === max) return [];
    if (clickIndex === min) return categorySlots.slice(min + 1, max + 1);
    if (clickIndex === max) return categorySlots.slice(min, max);
    return [clicked];
  }

  // Clicked directly adjacent to the run -> extend it.
  if (clickIndex === min - 1 || clickIndex === max + 1) {
    return categorySlots.slice(
      Math.min(min, clickIndex),
      Math.max(max, clickIndex) + 1,
    );
  }

  // Gap in the same category -> replace the selection with the clicked slot.
  return [clicked];
}
