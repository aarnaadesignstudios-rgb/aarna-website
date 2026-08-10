import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Bodoni_Moda, Inter } from "next/font/google";

import "@/styles/globals.css";
import { SITE } from "@/constants";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import { GrainOverlay, Cursor, SectionTransition } from "@/components/ui";

/* The studio's voice. Section headings, every small uppercase label, and the
   figures in the statistics strip — one family carries all three, so a label
   row and the title above it read as one voice. Exposed as --font-cormorant.
 *
 * 700 is loaded for ONE reason: the masthead's navigation labels. Cormorant is
 * a low-contrast old-style face with a small x-height, and at 12px uppercase
 * over live photography its 600 was not holding up — the review was that the
 * nav "is not clearly visible". A weight that is not requested here does not
 * silently synthesise; the browser falls back to the nearest one it has, so
 * asking for `font-bold` without this line would have rendered as 600 and
 * changed nothing. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/* High-contrast "fashion" display serif. Reserved for the WORDMARK alone — the
   name in the masthead and on the intro screen. Exposed as --font-bodoni. */
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
        {/* The chapter card that carries in-page navigation over any real
            distance. Mounted once, above everything except the intro and the
            cursor — see the component. */}
        <SectionTransition />
        {/* SmoothScrollProvider initialises Lenis + GSAP once for the whole app. */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
