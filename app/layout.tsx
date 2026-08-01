import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Bodoni_Moda, Inter, JetBrains_Mono } from "next/font/google";

import "@/styles/globals.css";
import { SITE } from "@/constants";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import { GrainOverlay } from "@/components/ui";

/* Elegant serif for section headings. Exposed as --font-cormorant. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

/* High-contrast "fashion" display serif for the hero statement. Exposed as
   --font-bodoni. Bodoni Moda's dramatic thin/thick contrast reads as couture,
   editorial luxury; its italic is glamorous for the flipping word. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

/* Modern sans for body. Exposed as --font-inter. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Monospace for technical "spec-sheet" labels (areas, years, indices) — an
   architectural drawing cue. Exposed as --font-jetbrains. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d3b2e",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning on <html>/<body> only: browser extensions
    // (Grammarly, ColorZilla, Dark Reader, password managers…) inject attributes
    // onto these root nodes before React hydrates, which otherwise triggers a
    // benign "attributes didn't match" warning. This suppresses warnings for
    // these two nodes ONLY — real mismatches inside the app still surface.
    <html
      lang="en"
      className={`${cormorant.variable} ${bodoni.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Subtle film-grain texture across the whole page. */}
        <GrainOverlay />
        {/* SmoothScrollProvider initialises Lenis + GSAP once for the whole app. */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
