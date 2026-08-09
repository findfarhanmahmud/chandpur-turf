import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Bath,
  Cake,
  CarFront,
  Cctv,
  Cross,
  DoorOpen,
  Footprints,
  GlassWater,
  Goal,
  Handshake,
  Lightbulb,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  Shirt,
  Sprout,
  Trophy,
  Volleyball,
  Wifi,
} from "lucide-react";

// Maps the `icon` key stored in the database to a Lucide icon component.
// Admin facility records use these stable keys (see the seed in the migration).
export const FACILITY_ICON_MAP: Record<string, LucideIcon> = {
  sprout: Sprout,
  lightbulb: Lightbulb,
  volleyball: Volleyball,
  goal: Goal,
  shirt: Shirt,
  door_open: DoorOpen,
  bath: Bath,
  glass_water: GlassWater,
  armchair: Armchair,
  car_front: CarFront,
  cctv: Cctv,
  shield_check: ShieldCheck,
  moon: Moon,
  wifi: Wifi,
  trophy: Trophy,
  handshake: Handshake,
  cake: Cake,
  footprints: Footprints,
  cross: Cross,
  map_pin: MapPin,
  phone: Phone,
};

export function getFacilityIcon(key: string): LucideIcon {
  return FACILITY_ICON_MAP[key] ?? Sprout;
}

// All icon keys available to admin when editing facilities.
export const FACILITY_ICON_KEYS = Object.keys(FACILITY_ICON_MAP);
