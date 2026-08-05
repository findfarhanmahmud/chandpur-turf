import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions | Chandpur Turf",
  description:
    "Terms and Conditions for using Chandpur Turf booking and facilities.",
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-16 py-14">
        <h1
          className="italic uppercase mb-2 text-primary font-bold text-center"
          style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Terms &amp; <span className="neon-text" style={{ color: "#c3f400" }}>Conditions</span>
        </h1>
        <p
          className="text-on-surface-variant font-work-sans text-sm text-center max-w-xl mx-auto mb-12"
        >
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="flex flex-col gap-8 font-work-sans text-sm text-on-surface-variant leading-relaxed">
          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Slot Booking &amp; Cancellation
            </h2>
            <p>
              Slots are reserved on a first-come, first-served basis. Please arrive 10 minutes before your slot start time. Cancellation policies may apply — contact the hotline for details.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Pitch Rules
            </h2>
            <p>
              Turf shoes, TF studs, or flat futsal shoes only. Metal studs or spikes are strictly prohibited. Players are responsible for their own safety and belongings.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Facility Usage
            </h2>
            <p>
              Chandpur Turf reserves the right to refuse entry or terminate sessions for unsafe, disrespectful, or disruptive behavior. Damages to the pitch or equipment may be billed to the responsible party.
            </p>
          </section>

          <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold uppercase text-primary mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Contact Us
            </h2>
            <p>
              Questions about these terms? Reach us at <a href="tel:01777240317" className="text-primary-container font-bold">01777-240317</a> or via WhatsApp at{" "}
              <a href="https://wa.me/8801856822363" target="_blank" rel="noopener noreferrer" className="text-primary-container font-bold">01856-822363</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
