"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | "match"
    | "turf"
    | "night"
    | "lights"
    | "celebration"
    | "training"
    | "goal"
    | "action";
  imageUrl: string;
  caption: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Football Match",
    category: "match",
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1200&auto=format&fit=crop",
    caption: "Competitive 90-minute football matches played with passion and intensity.",
  },
  {
    id: "g2",
    title: "Artificial Turf",
    category: "turf",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200&auto=format&fit=crop",
    caption: "47mm high-density FIFA Quality Pro artificial turf ready for play.",
  },
  {
    id: "g3",
    title: "Night Match",
    category: "night",
    imageUrl: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1200&auto=format&fit=crop",
    caption: "Late-night matches under shadowless stadium floodlighting.",
  },
  {
    id: "g4",
    title: "Stadium Lights",
    category: "lights",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    caption: "High-power LED light towers glowing above the pitch.",
  },
  {
    id: "g5",
    title: "Team Celebration",
    category: "celebration",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop",
    caption: "Teams celebrating hard-fought victories on the turf.",
  },
  {
    id: "g6",
    title: "Training Session",
    category: "training",
    imageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1200&auto=format&fit=crop",
    caption: "Dedicated training sessions to sharpen skills and teamwork.",
  },
  {
    id: "g7",
    title: "Goal Post",
    category: "goal",
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
    caption: "Professional goalposts and nets for every match.",
  },
  {
    id: "g8",
    title: "Players in Action",
    category: "action",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
    caption: "Explosive action shots from matches under the lights.",
  },
];

const categories = [
  { id: "all", label: "All Photos" },
  { id: "match", label: "Football Match" },
  { id: "turf", label: "Artificial Turf" },
  { id: "night", label: "Night Match" },
  { id: "lights", label: "Stadium Lights" },
  { id: "celebration", label: "Team Celebration" },
  { id: "training", label: "Training Session" },
  { id: "goal", label: "Goal Post" },
  { id: "action", label: "Players in Action" },
];

export default function GalleryContent({ isHomepage = false }: { isHomepage?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredItems = isHomepage
    ? galleryItems.slice(0, 6)
    : activeCategory === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      setSelectedIndex((current) => {
        if (current === null) return current;
        return (current + dir + filteredItems.length) % filteredItems.length;
      });
    },
    [filteredItems.length]
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, closeLightbox, navigate]);

  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Category filter tabs (only on full gallery page) */}
      {!isHomepage && (
        <div className="flex flex-wrap justify-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-2 px-4 rounded-full font-jetbrains text-[11px] uppercase tracking-wider font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary-container text-on-primary shadow-lg scale-105"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:border-primary-container/60 hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 shadow-lg cursor-pointer h-[260px] sm:h-[280px] hover:border-primary-container/50 hover:shadow-xl transition-all"
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Content badge & title */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <span className="py-1 px-3 bg-surface-dim/80 backdrop-blur-md text-primary-container font-jetbrains text-[10px] uppercase font-bold rounded-full border border-primary-container/30">
                  {categories.find((c) => c.id === item.category)?.label ?? item.category}
                </span>
                <span
                  className="material-symbols-outlined text-white opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all"
                  style={{ fontSize: "24px", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                >
                  zoom_in
                </span>
              </div>
              <div>
                <h3
                  className="text-xl font-bold uppercase text-primary mb-1 group-hover:text-primary-container transition-colors"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.title}
                </h3>
                <p className="font-work-sans text-xs text-on-surface-variant line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div
            className="relative max-w-4xl w-full bg-surface-container rounded-xl overflow-hidden border border-primary-container/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary-container hover:text-on-primary transition-colors"
              aria-label="Close image"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Prev / Next */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary-container hover:text-on-primary transition-colors"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary-container hover:text-on-primary transition-colors"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className="relative h-[420px] sm:h-[480px] w-full">
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="p-6 bg-surface-container-high flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className="text-2xl font-bold uppercase text-primary mb-1"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {selectedItem.title}
                </h3>
                <p className="font-work-sans text-sm text-on-surface-variant">
                  {selectedItem.caption}
                </p>
              </div>
              <span className="shrink-0 font-jetbrains text-xs text-primary-container font-bold">
                {selectedIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
