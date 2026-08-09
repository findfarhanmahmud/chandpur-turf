import type { PublicSettings } from "@/types/booking";

// Offline/development fallback values. The database (`site_settings`) is the
// source of truth; these only prevent a broken UI if the API is unreachable.
export const DEFAULT_SETTINGS: PublicSettings = {
  phone: "01777-240317",
  whatsapp: "01856-822363",
  booking_whatsapp: "01974172403",
  booking_whatsapp_international: "8801974172403",
  location: "Foridganj-Mission Bypass Road, Chandpur Sadar, Chandpur",
  address_short: "Foridganj-Mission Bypass Road, Chandpur Sadar",
  map_query: "Foridganj-Mission Bypass Road Chandpur Sadar Bangladesh",
  facebook: "Chandpur Turf",
  facebook_url: "https://facebook.com",
  instagram: "chandpur.turf",
  instagram_url: "https://instagram.com",
  hours: "5:00 AM - 3:30 AM",
  turf_name: "CHANDPUR TURF",
};
