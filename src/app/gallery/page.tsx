import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GalleryContent from "@/components/gallery/GalleryContent";

export const metadata = {
  title: "Photo Gallery | Chandpur Turf",
  description:
    "Explore photos of Chandpur Turf pitch, LED floodlights, night matches, changing rooms, and football facilities.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-16 py-12">
        <div className="mb-12 text-center">
          <h1
            className="italic uppercase mb-2 text-primary font-bold"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(36px, 5vw, 60px)",
            }}
          >
            Chandpur Turf Gallery
          </h1>
          <p className="text-on-surface-variant font-work-sans text-base max-w-xl mx-auto">
            Take a visual tour of our FIFA Quality Pro 47mm artificial pitch, night floodlight setups, and sports amenities.
          </p>
        </div>

        <GalleryContent isHomepage={false} />
      </main>
      <Footer />
    </div>
  );
}
