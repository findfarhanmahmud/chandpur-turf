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

export interface Facility {
  icon: LucideIcon;
  label: string;
  description: string;
}

export const facilities: Facility[] = [
  {
    icon: Sprout,
    label: "FIFA Quality Pro Turf",
    description: "International standard 47mm artificial football surface.",
  },
  {
    icon: Lightbulb,
    label: "High-Power LED Floodlights",
    description: "Crystal-clear floodlights for day and night play.",
  },
  {
    icon: Volleyball,
    label: "Premium Match Footballs",
    description: "Top-quality footballs available for every session.",
  },
  {
    icon: Goal,
    label: "Professional Goalposts & Nets",
    description: "Full-size goalposts, gloves, and nets included.",
  },
  {
    icon: Shirt,
    label: "Training Kit & Equipment",
    description: "Complete training kit and match equipment on site.",
  },
  {
    icon: DoorOpen,
    label: "Spacious Changing Room",
    description: "Clean, private changing facilities for players.",
  },
  {
    icon: Bath,
    label: "Washroom Facility",
    description: "Modern, hygienic washrooms at your convenience.",
  },
  {
    icon: GlassWater,
    label: "Pure Drinking Water",
    description: "Free purified drinking water available all day.",
  },
  {
    icon: Armchair,
    label: "Player & Spectator Seating",
    description: "Comfortable seating for players and spectators.",
  },
  {
    icon: CarFront,
    label: "Secure Parking Facility",
    description: "Ample, secure parking right next to the turf.",
  },
  {
    icon: Cctv,
    label: "24/7 CCTV Surveillance",
    description: "Fully monitored premises for total security.",
  },
  {
    icon: ShieldCheck,
    label: "Safe & Clean Environment",
    description: "A safe, well-maintained space to play.",
  },
  {
    icon: Moon,
    label: "Night Match Facility",
    description: "Late-night matches under brilliant floodlights.",
  },
  {
    icon: Wifi,
    label: "Free Wi-Fi",
    description: "Stay connected with complimentary high-speed Wi-Fi.",
  },
  {
    icon: Trophy,
    label: "Tournament & League Hosting",
    description: "Professional hosting for tournaments and leagues.",
  },
  {
    icon: Handshake,
    label: "Corporate & Friendly Events",
    description: "Friendly matches and corporate event bookings.",
  },
  {
    icon: Cake,
    label: "Birthday Parties & Private Booking",
    description: "Celebrate with private turf bookings and parties.",
  },
  {
    icon: Footprints,
    label: "Football Training Sessions",
    description: "Structured training sessions for all skill levels.",
  },
  {
    icon: Cross,
    label: "First Aid Kit Available",
    description: "On-site first aid kit for complete player safety.",
  },
  {
    icon: MapPin,
    label: "Easy-to-Reach Prime Location",
    description: "Conveniently located in the heart of Chandpur.",
  },
  {
    icon: Phone,
    label: "Online & Phone Booking",
    description: "Book instantly online or by a simple phone call.",
  },
];
