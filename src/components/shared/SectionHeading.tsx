interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2
        className="italic uppercase inline-block relative px-8"
        style={{
          fontFamily: "var(--font-oswald)",
          fontSize: "clamp(24px, 3vw, 32px)",
          color: "#ffffff",
        }}
      >
        {/* Left decorative line */}
        <span
          className="absolute"
          style={{
            top: "50%",
            left: 0,
            width: "32px",
            height: "2px",
            backgroundColor: "#c3f400",
            transform: "translate(-100%, -50%)",
          }}
        />
        {title}
        {/* Right decorative line */}
        <span
          className="absolute"
          style={{
            top: "50%",
            right: 0,
            width: "32px",
            height: "2px",
            backgroundColor: "#c3f400",
            transform: "translate(100%, -50%)",
          }}
        />
      </h2>
      {subtitle && (
        <p
          className="mt-2 tracking-widest"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "12px",
            color: "#c3f400",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
