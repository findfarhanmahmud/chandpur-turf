"use client";

import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import GalleryContent from "@/components/gallery/GalleryContent";

export default function GallerySection() {
  return (
    <section
      id="gallery"
      className="py-20 bg-background px-4 sm:px-8 md:px-16 border-t border-outline-variant/30 relative"
    >
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading title="PHOTO GALLERY" subtitle="CHANDPUR TURF EXPERIENCE" />

        <GalleryContent isHomepage={true} />

        <div className="text-center mt-12">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 py-3 px-8 bg-surface-bright/50 hover:bg-primary-container hover:text-on-primary text-primary font-oswald uppercase text-base font-bold rounded border border-outline-variant/40 transition-all active:scale-95 shadow-lg"
          >
            Explore Full Gallery
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
