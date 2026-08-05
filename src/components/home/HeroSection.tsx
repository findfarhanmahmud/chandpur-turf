"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full flex items-center justify-center overflow-hidden py-12 lg:py-20 min-h-[720px] lg:min-h-[820px]"
      style={{ backgroundColor: "#0c0f0f" }}
    >
      {/* Background Image with gradient overlays */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, #121414 0%, rgba(18,20,20,0.85) 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(18,20,20,0.95) 0%, rgba(18,20,20,0.5) 50%, rgba(18,20,20,0.95) 100%)",
          }}
        />
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHC7Zozf98N9q9yErEMiJOxeQQGA5Vxcgd6LjzHTQA8vZBHQ9N8iie6_mmZzGq7eYVezlKHEUqi-pg3_tgbr0pmYOzM4yUjvI3kVMgAVDcbVmf7hY3a4fRV1xIyQs3yhVPYVjyNuMFazLYFwxeuZhbPZF2_DMeGqwDvrXxM-6wT_J0nGPujfbBlnKdywlnMLFij-LGImhk7VsKs-aNO-X9SDSXzgZEr__BA2anYa1rWBfuHmQgwtmeLw"
          alt="A dramatic high-contrast silhouette of a football player mid-kick in a stadium at night with vibrant artificial green pitch"
          fill
          className="object-cover object-center"
          style={{ opacity: 0.55 }}
          priority
          sizes="100vw"
        />
      </div>

      {/* Grid Container */}
      <div
        className="relative z-20 w-full max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
      >
        {/* Left Headline Column (7 cols) */}
        <div className="lg:col-span-7 min-w-0 text-center lg:text-left flex flex-col justify-center">
          <h1
            className="italic font-black uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl select-none"
            style={{
              fontFamily: "var(--font-oswald)",
              fontSize: "clamp(48px, 8vw, 96px)",
              color: "#ffffff",
            }}
          >
            CHANDPUR{" "}
            <br />
            <span
              className="neon-text"
              style={{ color: "#c3f400" }}
            >
              TURF
            </span>
          </h1>

          <p
            className="tracking-[0.2em] mb-10 flex flex-wrap justify-center lg:justify-start gap-2 items-center text-xs sm:text-sm font-semibold"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "#c4c9ac",
            }}
          >
            PLAY HARD{" "}
            <span style={{ color: "#c3f400" }}>•</span>{" "}
            PLAY SMART{" "}
            <span style={{ color: "#c3f400" }}>•</span>{" "}
            PLAY AT CHANDPUR TURF
          </p>

          {/* Badge chips */}
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start">
            {/* FIFA badge */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 rounded-lg backdrop-blur-md border transition-all hover:border-primary-container/60"
              style={{
                backgroundColor: "rgba(30,32,32,0.85)",
                borderColor: "rgba(142,147,121,0.3)",
              }}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={{
                  fontSize: "32px",
                  color: "#c3f400",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                sports_soccer
              </span>
              <div className="text-left">
                <p
                  className="font-bold leading-tight uppercase"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "18px",
                    color: "#ffffff",
                  }}
                >
                  FIFA QUALITY PRO
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                    color: "#c4c9ac",
                    letterSpacing: "0.08em",
                  }}
                >
                  47MM TURF
                </p>
              </div>
            </div>

            {/* Premium badge */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 rounded-lg backdrop-blur-md border transition-all hover:border-primary-container/60"
              style={{
                backgroundColor: "rgba(30,32,32,0.85)",
                borderColor: "rgba(142,147,121,0.3)",
              }}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={{
                  fontSize: "32px",
                  color: "#c3f400",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                verified
              </span>
              <div className="text-left">
                <p
                  className="font-bold leading-tight uppercase"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "18px",
                    color: "#ffffff",
                  }}
                >
                  PREMIUM
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                    color: "#c4c9ac",
                    letterSpacing: "0.08em",
                  }}
                >
                  EXPERIENCE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Rates Quick Card (5 cols) */}
        <div className="lg:col-span-5 min-w-0 flex justify-center lg:justify-end w-full">
          <div
            className="w-full max-w-md relative shadow-2xl p-5 sm:p-7"
            style={{
              backgroundColor: "rgba(26,28,28,0.92)",
              backdropFilter: "blur(16px)",
              borderRadius: "0.75rem",
              borderTop: "4px solid #c3f400",
              borderLeft: "1px solid rgba(68,73,51,0.4)",
              borderRight: "1px solid rgba(68,73,51,0.4)",
              borderBottom: "1px solid rgba(68,73,51,0.4)",
            }}
          >
            {/* LIVE STATUS badge */}
            <div
              className="absolute -top-3.5 right-6 px-3 py-1 rounded-full font-bold shadow-lg animate-pulse"
              style={{
                backgroundColor: "#c3f400",
                color: "#283500",
                fontFamily: "var(--font-jetbrains)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
              }}
            >
              LIVE STATUS
            </div>

            <h3
              className="text-center uppercase mb-6 pb-3"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "26px",
                color: "#ffffff",
                borderBottom: "1px solid rgba(68,73,51,0.5)",
              }}
            >
              Today&apos;s Rates
            </h3>

            {/* Rate rows */}
            <div className="flex flex-col gap-3">
              {/* Day (best value) */}
              <div
                className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-3 px-3 rounded cursor-pointer transition-colors bg-primary-container/10 border border-primary-container/30 hover:bg-primary-container/20"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="material-symbols-outlined shrink-0"
                    style={{
                      color: "#c3f400",
                      fontSize: "22px",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    light_mode
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      fontFamily: "var(--font-work-sans)",
                      fontSize: "15px",
                      color: "#ffffff",
                    }}
                  >
                    Day{" "}
                    <span className="text-primary-container font-semibold text-xs whitespace-nowrap">
                      (Best Value)
                    </span>
                  </span>
                </div>
                <span
                  className="font-bold shrink-0 ml-auto"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "20px",
                    color: "#c3f400",
                  }}
                >
                  ৳1,499
                </span>
              </div>

              {/* Morning */}
              <div
                className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-3 px-3 rounded cursor-pointer transition-colors border border-outline-variant/30 hover:bg-surface-bright/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="material-symbols-outlined shrink-0"
                    style={{
                      color: "#8e9379",
                      fontSize: "22px",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    wb_twilight
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      fontFamily: "var(--font-work-sans)",
                      fontSize: "15px",
                      color: "#c4c9ac",
                    }}
                  >
                    Morning Slot
                  </span>
                </div>
                <span
                  className="font-bold shrink-0 ml-auto"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "20px",
                    color: "#ffffff",
                  }}
                >
                  ৳1,999
                </span>
              </div>

              {/* Night */}
              <div
                className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-3 px-3 rounded cursor-pointer transition-colors border border-outline-variant/30 hover:bg-surface-bright/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="material-symbols-outlined shrink-0"
                    style={{
                      color: "#abd600",
                      fontSize: "22px",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    dark_mode
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      fontFamily: "var(--font-work-sans)",
                      fontSize: "15px",
                      color: "#c4c9ac",
                    }}
                  >
                    Night Slot
                  </span>
                </div>
                <span
                  className="font-bold shrink-0 ml-auto"
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "20px",
                    color: "#ffffff",
                  }}
                >
                  ৳2,499
                </span>
              </div>
            </div>

            <Link
              href="/#pricing"
              className="mt-6 block w-full text-center py-3.5 uppercase tracking-wider font-bold transition-all hover:bg-primary-container hover:text-on-primary rounded"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "16px",
                color: "#c3f400",
                backgroundColor: "rgba(30,32,32,0.9)",
                border: "1px solid #c3f400",
                textDecoration: "none",
              }}
            >
              VIEW FULL SCHEDULE &amp; BOOK NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
