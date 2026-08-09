import type { GalleryImageRow } from "@/types/database";
import type { AdminGalleryImage } from "@/types/admin";

// Maps a `gallery_images` row to the admin DTO.
export function mapGalleryImage(row: GalleryImageRow): AdminGalleryImage {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    category: row.category,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    createdAt: row.created_at,
  };
}
