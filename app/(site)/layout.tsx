/**
 * The marketing site's chrome — everything that is true of every page a
 * VISITOR sees, and of nothing else.
 *
 * ── Why this layer exists ────────────────────────────────────────────────
 *
 * All four of these used to sit in the root layout, which meant they were also
 * mounted over `/studio`. That address is not a page of this site: it is
 * Sanity's Studio, a second React application that happens to be served from
 * the same Next app (see sanity.config.ts for why it lives in the repo). It
 * brings its own cursor, its own scrolling, its own everything — and two of
 * ours broke it:
 *
 *   · <Cursor /> puts `cursor-hidden` on <body>, which is `cursor: none` for
 *     the whole document. The Studio's pointer became the site's gold dot:
 *     no I-beam over a text field, no resize handle on a pane divider, no
 *     column arrows — an editing surface with the pointer feedback removed.
 *
 *   · Lenis, from <SmoothScrollProvider />, takes the wheel away from the
 *     browser and applies it to the DOCUMENT. The Studio never scrolls the
 *     document — it is a `100vh` shell whose panes scroll internally — so
 *     measured on `/studio`, `document.scrollHeight` equals the viewport and
 *     Lenis had nothing to move. Every wheel event went to it and was spent on
 *     a scroll of zero pixels, and the project list underneath could not be
 *     scrolled at all.
 *
 * A route group — the parentheses — is how the App Router says "these routes
 * share a layout" without the folder appearing in any URL. `/about` is still
 * `/about`. What changed is that `/studio`, `/api`, `robots.txt` and
 * `sitemap.xml` are now OUTSIDE this subtree and inherit none of it.
 *
 * ── The rule, for whatever comes next ───────────────────────────────────
 *
 * Global site furniture goes HERE, not in app/layout.tsx. The root layout is
 * now only what is true of every response the server makes — the document
 * shell, the fonts, the site's metadata defaults. Anything a visitor can see
 * or interact with belongs in this file, and then it cannot land on the Studio
 * by accident.
 */
import { GrainOverlay, Cursor, SectionTransition } from "@/components/ui";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Subtle film-grain texture across the whole page. Stays a SERVER
          component by living here rather than inside a client wrapper that
          reads the pathname — it is pure CSS and an inline SVG, and there is
          no reason for any of it to reach the browser as JavaScript. */}
      <GrainOverlay />
      {/* The gold dot that replaces the pointer. Hides the native cursor
          from JS, not from CSS — see the note in the component. */}
      <Cursor />
      {/* The chapter card that carries in-page navigation over any real
          distance. Mounted once, above everything except the intro and the
          cursor — see the component. */}
      <SectionTransition />
      {/* SmoothScrollProvider initialises Lenis + GSAP once for the site.
          Mounted here rather than at the root, it still does not remount as a
          visitor moves between chapters — a layout persists across the routes
          it wraps, which is what the provider's own notes rely on. It DOES
          unmount on the way to /studio, which is the point. */}
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </>
  );
}
