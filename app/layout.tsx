import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Bodoni_Moda, Inter } from "next/font/google";

import "@/styles/globals.css";
import { SITE } from "@/constants";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import { GrainOverlay, Cursor } from "@/components/ui";

/* The studio's voice. Section headings, and — since the client's review —
   every small uppercase label on the site as well, so the label row and the
   title above it share one family. Exposed as --font-cormorant. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/* High-contrast "fashion" display serif for the hero statement and the
   flipping emphasis word. Exposed as --font-bodoni. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

/* Modern sans for body copy. Exposed as --font-inter.
   Deliberately kept: the client asked for the LABEL font to change to the
   serif, not for running paragraphs to become serif. Long body copy set in
   Cormorant at 16px is noticeably harder to read, so the sans stays where it
   earns its place and nowhere else. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  themeColor: "#0c402d",
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
      className={`${cormorant.variable} ${bodoni.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Subtle film-grain texture across the whole page. */}
        <GrainOverlay />
        {/* The gold dot that replaces the pointer. Hides the native cursor
            from JS, not from CSS — see the note in the component. */}
        <Cursor />
        {/* SmoothScrollProvider initialises Lenis + GSAP once for the whole app. */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
