"use client";

/**
 * Spine — the drawing-sheet margin that runs down the whole page.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * The note back on the site was that it should feel like one experience and
 * that every section should look connected. Grounds and type had already been
 * unified — every surface is a cut of the brand green, every heading is set the
 * same way — and it still read as eight sections in a row, because unifying how
 * things look is not the same as giving them something CONTINUOUS to belong to.
 *
 * This is that continuous thing: a fixed hairline down the left edge, with the
 * current sheet's number and name set vertically against it and a gold marker
 * riding the page's scroll. It is on screen in every section, it never
 * restarts, and it means the eyebrow row inside each section is no longer the
 * only thing saying where you are — so a section reads as a page of one
 * document rather than as a block on a stack.
 *
 * It is also the only element on the site that is aware of the whole page at
 * once, which is exactly why it does the connecting.
 *
 * ── What it deliberately is not ───────────────────────────────────────────
 *
 *  - Not a nav. It has `pointer-events-none` and no links: the masthead already
 *    navigates, and a second set of targets down the left edge would compete
 *    with it and with the per-section index rows.
 *  - Not present over the hero. It fades in past 55vh. The hero is a full-bleed
 *    photograph and the one band on the site that needs cream chrome — putting
 *    the spine there would mean teaching it the `data-chrome` dance the
 *    masthead does (components/layout/Navbar.tsx) for no gain, since the hero
 *    is not a numbered sheet and has nothing to report.
 *  - Not on mobile. It lives in the page's left gutter, and below `lg` there is
 *    no gutter to live in.
 *
 * ── Cost ─────────────────────────────────────────────────────────────────
 *
 * One rAF-throttled scroll listener, and the only React state is the active
 * section index — which changes eight times over the entire page. The marker's
 * position is written straight to the element, because that DOES change on
 * every frame and a setState per frame would re-render the label with it.
 */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * The marker's height as a percentage of the rail, and how far it can travel.
 *
 * A percentage `translateY` resolves against the ELEMENT's own height, not its
 * container's — so `translateY(100%)` on a segment that is 12% of the rail moves
 * it 12% of the rail and the marker crawls a tenth of the way down a full page.
 * The travel it actually needs is the rail minus itself, expressed in its own
 * heights: (100 − 12) / 12, or ~733%.
 *
 * Transform rather than `top` because this is written on every scroll frame, and
 * `top` would invalidate layout each time where a transform only composites.
 */
const MARKER_PCT = 12;
const MARKER_TRAVEL = ((100 - MARKER_PCT) / MARKER_PCT) * 100;

/**
 * The sheets, in reading order.
 *
 * Numbers and names are the same ones the sections' own `<SectionHeading />`
 * rows carry — they have to be, or the spine and the section it is reporting on
 * would disagree in the same viewport. Kept as one list here rather than
 * discovered from the DOM because the heading is a `<TextReveal />` whose text
 * is split across per-word spans, and reassembling a label out of that would be
 * a parser where a constant will do.
 *
 * A sheet whose `id` is not on the current route is skipped, so this is safe on
 * /faq and /photography (where it resolves to nothing and renders nothing).
 */
const SHEETS = [
  { id: "practice", index: "01", label: "The Practice" },
  { id: "projects", index: "02", label: "Selected Works" },
  { id: "testimonials", index: "03", label: "Testimonials" },
  { id: "process", index: "04", label: "Process" },
  { id: "founder", index: "05", label: "The Founder" },
  { id: "why-us", index: "06", label: "Why Us" },
  { id: "services", index: "07", label: "Services" },
  { id: "contact", index: "08", label: "Contact" },
] as const;

export default function Spine() {
  const railRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    /**
     * Sections are measured in DOCUMENT space and re-measured on resize and on
     * a coarse timer, not read from `getBoundingClientRect` every frame.
     *
     * Two of these sections are GSAP-pinned (Selected Works and Services), so
     * the document keeps growing and shifting as ScrollTrigger installs its pin
     * spacers — a table built once on mount is wrong by several thousand pixels
     * by the time the images have loaded. Hence the re-measure. Reading rects
     * for eight sections inside the scroll handler instead would force layout
     * on every frame, which is the one thing this must not do.
     */
    let table: Array<{ top: number; bottom: number }> = [];
    let docHeight = 1;

    const measure = () => {
      const y = window.scrollY;
      table = SHEETS.map((sheet) => {
        const el = document.getElementById(sheet.id);
        if (!el) return { top: Infinity, bottom: -Infinity };
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
      docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;

      // Fade in once the hero is behind us. See the note at the top.
      const visible = y > window.innerHeight * 0.55;
      if (visible !== shownRef.current) {
        shownRef.current = visible;
        setShown(visible);
      }

      // The marker reports progress through the whole document, and is written
      // directly — this is the value that changes every frame.
      if (markerRef.current) {
        const p = Math.min(1, Math.max(0, y / docHeight));
        markerRef.current.style.transform = `translateY(${p * MARKER_TRAVEL}%)`;
      }

      /**
       * Which sheet is current: the one covering the viewport's own middle.
       *
       * Not "the topmost one on screen" — with a 100vh pinned section that test
       * flickers between neighbours at the boundary, because the pin spacer and
       * the next section overlap in document space while the pin is active. A
       * single sample line cannot be in two sheets at once.
       */
      const line = y + window.innerHeight * 0.5;
      let found: number | null = null;
      for (let i = 0; i < table.length; i++) {
        const band = table[i];
        if (band && line >= band.top && line < band.bottom) {
          found = i;
          break;
        }
      }
      if (found !== activeRef.current) {
        activeRef.current = found;
        setActive(found);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    measure();
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    // Pins install late; two re-measures cover the settle without a loop.
    const t1 = window.setTimeout(measure, 1200);
    const t2 = window.setTimeout(measure, 3600);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const sheet = active === null ? null : SHEETS[active];

  return (
    <div
      aria-hidden
      className={cn(
        // `fixed` in the page's left gutter. z-30 puts it under the masthead
        // (z-50), the grain (z-40) and the loader (z-100), and over every
        // section — it is chrome, but the quietest layer of it.
        "pointer-events-none fixed top-0 left-0 z-30 hidden h-screen w-16 lg:block",
        "transition-opacity duration-700 ease-editorial",
        shown ? "opacity-100" : "opacity-0"
      )}
    >
      {/* The rail. Inset from the top and bottom so it reads as a drawn line on
          a sheet rather than as a browser chrome edge. */}
      <div
        ref={railRef}
        className="absolute top-[16vh] bottom-[16vh] left-7 w-px overflow-hidden bg-emerald/20"
      >
        {/* The marker: a short gold segment travelling the rail. See the note
            on MARKER_TRAVEL for why the percentage is what it is. */}
        <span
          ref={markerRef}
          className="absolute inset-x-0 top-0 block bg-gold will-change-transform"
          style={{ height: `${MARKER_PCT}%`, transform: "translateY(0%)" }}
        />
      </div>

      {/* ── The sheet's number and name, set vertically ──────────────────
          `writing-mode: vertical-rl` with a 180° rotation reads bottom-to-top,
          which is the convention for a spine.

          Centring is done by the FLEX PARENT, not by a translate on the label.
          Tailwind v4's `-translate-y-1/2` compiles to the standalone `translate`
          property, which the spec applies BEFORE `transform` — so pairing it
          with an arbitrary `[transform:rotate(180deg)]` silently applies both
          and the label ends up half its own height off. A centring flex box and
          a rotation about the element's own origin cannot conflict.

          Keyed on the sheet so it re-enters rather than swapping text in place. */}
      {sheet && (
        <span
          key={sheet.id}
          className="absolute inset-y-0 left-8 flex items-center"
        >
          {/* ── A fog behind the label ────────────────────────────────
              Two sections run their content FULL-BLEED through this gutter —
              the testimonial row and the services track both start at x=0 — so
              the label lands on a photograph or a card, not on the ground, and
              12px letterspaced type at 55% charcoal disappears into it.

              A soft radial plate rather than a rounded box: a box would read as
              a UI chip stuck to the edge of an editorial page, and this reads as
              the ground simply being brighter where the label sits. `closest-side`
              on a tall thin element gives an ellipse that follows the vertical
              text without needing to know how long the label is. */}
          <span
            className="absolute top-1/2 left-1/2 -z-10 h-[130%] w-[420%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-mist)_94%,transparent),transparent)]"
          />
          <span className="font-label whitespace-nowrap [writing-mode:vertical-rl] [transform:rotate(180deg)]">
            <span className="text-gold-ink">{sheet.index}</span>
            <span className="text-charcoal/35"> &mdash; </span>
            <span className="text-charcoal/55">{sheet.label}</span>
          </span>
        </span>
      )}
    </div>
  );
}
