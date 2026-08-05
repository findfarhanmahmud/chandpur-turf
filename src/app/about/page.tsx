import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutContent from "@/components/about/AboutContent";

export const metadata = {
  title: "About Us | Chandpur Turf",
  description:
    "Learn about Chandpur Turf, Chandpur's premier football facility featuring FIFA Quality Pro 47mm artificial turf and high-power LED floodlights.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-16 py-12">
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
