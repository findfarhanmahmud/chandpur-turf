"use client";

import { useEffect, useState } from "react";
import type { PublicSiteData } from "@/types/booking";
import { allSlots } from "@/data/slots";
import { facilities as staticFacilities } from "@/data/facilities";
import { galleryItems as staticGallery } from "@/components/gallery/GalleryContent";
import { DEFAULT_SETTINGS } from "@/data/settings";

// Keys mirror the seeded facilities in supabase/migrations/0001_init.sql
const FACILITY_FALLBACK_KEYS = [
  "sprout", "lightbulb", "volleyball", "goal", "shirt", "door_open", "bath",
  "glass_water", "armchair", "car_front", "cctv", "shield_check", "moon",
  "wifi", "trophy", "handshake", "cake", "footprints", "cross", "map_pin",
  "phone",
];

export const PUBLIC_FALLBACK_DATA: PublicSiteData = {
  settings: DEFAULT_SETTINGS,
  slots: allSlots,
  facilities: staticFacilities.map((f, i) => ({
    id: `fallback-${i + 1}`,
    label: f.label,
    description: f.description,
    icon: FACILITY_FALLBACK_KEYS[i] ?? "sprout",
  })),
  gallery: staticGallery.map((g) => ({
    id: g.id,
    title: g.title,
    caption: g.caption,
    category: g.category,
    imageUrl: g.imageUrl,
  })),
};

// Shared promise so multiple sections on a page reuse a single bootstrap fetch.
let sharedPromise: Promise<PublicSiteData> | null = null;

function loadBootstrap(): Promise<PublicSiteData> {
  if (!sharedPromise) {
    sharedPromise = fetch("/api/public/bootstrap", { cache: "no-store" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("bootstrap failed")),
      )
      .catch((err) => {
        sharedPromise = null; // allow a retry on next mount
        throw err;
      });
  }
  return sharedPromise;
}

export interface PublicDataState {
  data: PublicSiteData | null;
  error: boolean;
  loading: boolean;
  fallback: PublicSiteData;
}

// Loads public site content from Supabase (via /api/public/bootstrap) once.
// Falls back to static data so the UI never hard-crashes when offline.
export function usePublicData(): PublicDataState {
  const [data, setData] = useState<PublicSiteData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadBootstrap()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading, fallback: PUBLIC_FALLBACK_DATA };
}
