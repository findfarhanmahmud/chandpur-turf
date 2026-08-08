import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingPageClient from "@/components/booking/BookingPageClient";

export const metadata = {
  title: "Book Your Slot | Chandpur Turf",
  description:
    "Select a date, pick your preferred day or night slot, and confirm your football turf booking at Chandpur Turf.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main
        className="flex-grow w-full mx-auto py-12"
        style={{
          maxWidth: "1536px",
          paddingLeft: "clamp(16px, 5vw, 64px)",
          paddingRight: "clamp(16px, 5vw, 64px)",
        }}
      >
        <div className="mb-12 text-center">
          <h1
            className="italic uppercase mb-2"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(36px, 5vw, 64px)",
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Book Your Slot
          </h1>
          <p
            style={{
              fontFamily: "var(--font-work-sans)",
              fontSize: "18px",
              color: "#c4c9ac",
            }}
          >
            Select a date, choose your preferred time slot, and confirm your booking.
          </p>
        </div>

        <BookingPageClient />
      </main>
      <Footer />
    </div>
  );
}
