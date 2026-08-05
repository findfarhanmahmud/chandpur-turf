import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | Chandpur Turf",
  description:
    "Privacy Policy for Chandpur Turf. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-16 py-14">
        <h1
          className="italic uppercase mb-2 text-primary font-bold text-center"
          style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Privacy <span className="neon-text" style={{ color: "#c3f400" }}>Policy</span>
        </h1>
        <p
          className="text-on-surface-variant font-work-sans text-sm text-center max-w-xl mx-auto mb-12"
        >
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="flex flex-col gap-8 font-work-sans text-sm text-on-surface-variant leading-relaxed">
          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Information We Collect
            </h2>
            <p>
              When you book a slot or contact us, we may collect your name, phone number, email address, and booking details to process your reservation and respond to your inquiries.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              How We Use Your Information
            </h2>
            <p>
              Your information is used solely to confirm bookings, communicate schedule updates, and provide customer support. We do not sell or share your personal data with third parties.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Data Security
            </h2>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, alteration, or disclosure while it is under our control.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Contact Us
            </h2>
            <p>
              For any privacy-related questions, contact us at <a href="tel:01777240317" className="text-primary-container font-bold">01777-240317</a> or via WhatsApp at{" "}
              <a href="https://wa.me/8801856822363" target="_blank" rel="noopener noreferrer" className="text-primary-container font-bold">01856-822363</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
