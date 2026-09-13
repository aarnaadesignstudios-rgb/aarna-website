import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Bodoni_Moda, Inter } from "next/font/google";

import "@/styles/globals.css";
import { SITE } from "@/constants";

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
  /* The colour a mobile browser paints its own chrome. It was the brand
     emerald, which put a near-black green bar above a light page — the site
     read as dark before a single pixel of it had rendered. It is `--color-cream`
     now, which is what <body> actually is, so the address bar continues the
     page instead of capping it. `colorScheme: "light"` was already correct and
     is what stops the UA from restyling form controls for a dark theme. */
  themeColor: "#f6f2e9",
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
      {/* ── Nothing but the shell ──────────────────────────────────────
          The grain, the cursor, the chapter card and Lenis were all mounted
          here, which put them over `/studio` as well — and the Studio is not a
          page of this site but Sanity's own application. Two of them actively
          broke it: the cursor took the Studio's pointer away, and Lenis took
          its scrolling. They live in app/(site)/layout.tsx now, which wraps
          every visitor-facing route and nothing else. See the note there,
          including where to add the next one. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
