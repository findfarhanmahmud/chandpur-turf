import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactContent from "@/components/contact/ContactContent";

export const metadata = {
  title: "Contact Us & Location | Chandpur Turf",
  description:
    "Get in touch with Chandpur Turf. Call hotline 01777-240317 or WhatsApp 01856-822363. Located at Bangabandhu Road, Chandpur Sadar.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-16 py-12">
        <ContactContent />
      </main>
      <Footer />
    </div>
  );
}
