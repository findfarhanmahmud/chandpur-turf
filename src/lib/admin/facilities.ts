import type { FacilityRow } from "@/types/database";
import type { AdminFacility } from "@/types/admin";

// Maps a `facilities` row to the admin DTO.
export function mapAdminFacility(row: FacilityRow): AdminFacility {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}
