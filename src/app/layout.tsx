import type { Metadata } from "next";
import { Oswald, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chandpur Turf | Premium Football Experience",
  description:
    "Book your premium football turf slot at Chandpur Turf. FIFA Quality Pro 47mm artificial turf with high-power LED floodlights. Morning, Day & Night slots available.",
  keywords: "Chandpur Turf, football turf, book turf, Bangladesh football, artificial turf",
  openGraph: {
    title: "Chandpur Turf | Premium Football Experience",
    description:
      "Book your premium football turf slot at Chandpur Turf. FIFA Quality Pro 47mm artificial turf.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Material Symbols for icons used in Stitch design */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${oswald.variable} ${workSans.variable} ${jetbrainsMono.variable} min-h-screen`}
        style={{
          fontFamily: "var(--font-work-sans), system-ui, sans-serif",
          backgroundColor: "#121414",
          color: "#e2e2e2",
        }}
      >
        {children}
      </body>
    </html>
  );
}
