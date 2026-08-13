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
 * This is that continuous thing: a fixed thread down the left edge carrying a
 * NODE for every chapter, a gold line drawn down it as you scroll, and the
 * current chapter's number and name set vertically against it.
 *
 * ── Why nodes, and not just a progress bar ────────────────────────────────
 *
 * A progress bar answers "how far through am I". A thread with nodes on it
 * answers "how far through WHAT" — it shows the whole story at once: six
 * chapters, their relative lengths, which are behind you, which is current, how
 * much is left. That is the difference between a scroll indicator and a
 * narrative device, and it is the shape the reference sites use (Eladio
 * Dieste's page hangs its whole timeline off one unbroken vertical line with a
 * node at each date, and content alternates either side of it).
 *
 * The node positions are the sections' real document offsets, so the thread is
 * a true map rather than six evenly spaced dots. Chapter 02 is the longest
 * thing on the page and its gap on the thread is visibly the longest gap.
 *
 * It is the only element on the site aware of the whole page at once, which is
 * exactly why it does the connecting.
 *
 * ── What it deliberately is not ───────────────────────────────────────────
 *
 *  - Not a nav. It has `pointer-events-none` and no links: the masthead already
 *    navigates, and a second set of targets down the left edge would compete
 *    with it and with the per-section index rows.
 *  - Not present over the hero. It fades in past 55vh — the hero is not a
 *    numbered chapter and has nothing to report.
 *  - Not on mobile. It lives in the page's left gutter, and below `lg` there is
 *    no gutter to live in.
 *
 * It DOES read `data-chrome="dark"`, which it did not have to when the whole
 * page was light. The grounds alternate paper and brand emerald now, and gold
 * on emerald needs a different weight from gold on paper — as does the fog
 * behind the label, which has to darken rather than lighten to separate from a
 * flat green ground. Same rect-overlap test the masthead uses, against the same
 * declarations, so the two pieces of chrome can never disagree about which band
 * they are over.
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
  { id: "services", index: "05", label: "Services" },
  { id: "contact", index: "06", label: "Contact" },
] as const;

export default function Spine() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);
  /** Where each chapter starts, as a fraction of the scrollable document. */
  const [nodes, setNodes] = useState<number[]>([]);
  /** True while the thread is over a band that declared itself dark. */
  const [onDark, setOnDark] = useState(false);
  const onDarkRef = useRef(false);

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
    let bands: Array<{ top: number; bottom: number }> = [];
    let docHeight = 1;

    const measure = () => {
      const y = window.scrollY;
      table = SHEETS.map((sheet) => {
        const el = document.getElementById(sheet.id);
        if (!el) return { top: Infinity, bottom: -Infinity };
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
      // The bands that want cream chrome — the same declarations the masthead
      // reads. See components/layout/Navbar.tsx.
      bands = Array.from(
        document.querySelectorAll<HTMLElement>('[data-chrome="dark"]')
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
      docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // Node positions, as fractions of the scroll. Committed to state because
      // they change only when the document is re-measured, not per frame.
      setNodes(
        table.map((band) =>
          Number.isFinite(band.top)
            ? Math.min(1, Math.max(0, band.top / docHeight))
            : -1
        )
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

      /**
       * The drawn line and its head.
       *
       * The line is a full-height element scaled from the top — `scaleY` rather
       * than `height`, because a height change is layout on every frame and a
       * scale is a compositor transform. The head is a small diamond that has to
       * sit at the line's tip, and it CANNOT use the same trick: scaling its
       * parent would squash it. So it translates instead, and its travel is
       * expressed in its own heights (see MARKER_TRAVEL).
       */
      const p = Math.min(1, Math.max(0, y / docHeight));
      if (markerRef.current) {
        markerRef.current.style.transform = `scaleY(${p})`;
      }
      if (headRef.current) {
        headRef.current.style.transform = `translateY(${p * MARKER_TRAVEL}%) rotate(45deg)`;
      }

      // Which palette the thread is wearing.
      const mid = y + window.innerHeight * 0.5;
      const dark = bands.some((b) => mid >= b.top && mid < b.bottom);
      if (dark !== onDarkRef.current) {
        onDarkRef.current = dark;
        setOnDark(dark);
      }

      /**
       * Which sheet is current: the one covering the viewport's own middle.
       *
       * Not "the topmost one on screen" — with a 100vh pinned section that test
       * flickers between neighbours at the boundary, because the pin spacer and
       * the next section overlap in document space while the pin is active. A
       * single sample line cannot be in two sheets at once.
       */
      let found: number | null = null;
      for (let i = 0; i < table.length; i++) {
        const band = table[i];
        if (band && mid >= band.top && mid < band.bottom) {
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
      {/* ── The thread ───────────────────────────────────────────────────
          Inset top and bottom so it reads as a line drawn on a sheet rather
          than as a browser chrome edge. `overflow-visible`, because the nodes
          and the head sit wider than the 1px track. */}
      <div className="absolute top-[14vh] bottom-[14vh] left-7 w-px">
        {/* The unread thread. */}
        <span
          className={cn(
            "absolute inset-0 block transition-colors duration-700",
            onDark ? "bg-cream/25" : "bg-emerald/20"
          )}
        />

        {/* The read thread — gold, drawn from the top. */}
        <span
          ref={markerRef}
          className="absolute inset-0 block origin-top bg-gold will-change-transform"
          style={{ transform: "scaleY(0)" }}
        />

        {/* ── The chapter nodes ───────────────────────────────────────
            One per chapter, at its real position in the document, so the
            thread is a map of the story rather than six evenly spaced dots.

            A node behind the reading head is filled; ahead of it, hollow. That
            is the whole "where am I in the story" reading, and it costs one
            comparison per node per chapter change. */}
        {nodes.map((at, i) =>
          at < 0 ? null : (
            <span
              key={SHEETS[i]?.id ?? i}
              className={cn(
                "absolute left-1/2 block size-1.5 -translate-x-1/2 rounded-full border transition-colors duration-500",
                active !== null && i <= active
                  ? "border-gold bg-gold"
                  : onDark
                    ? "border-cream/40 bg-transparent"
                    : "border-emerald/35 bg-transparent"
              )}
              style={{ top: `calc(${at * 100}% - 3px)` }}
            />
          )
        )}

        {/* The reading head — a small rotated square at the tip of the drawn
            line. Its own element rather than the line's end, because the line
            is a `scaleY` and scaling its parent would squash the diamond. */}
        <span
          ref={headRef}
          className="absolute inset-x-0 top-0 block size-[7px] -translate-x-[3px] bg-gold will-change-transform"
          style={{ transform: "translateY(0%) rotate(45deg)" }}
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
          {/* ── The label, and the fog behind it ─────────────────────────
              Two sections run their content FULL-BLEED through this gutter —
              the testimonial row and the services track both start at x=0 — so
              the label lands on a photograph or a card, not on the ground, and
              12px letterspaced type disappears into it. Hence a fog.

              ── The fog has to size against the LABEL ────────────────────
              It was a child of the centring flex box, at `h-[130%]`. A
              percentage height on an absolutely positioned element resolves
              against its nearest POSITIONED ancestor, and that flex box is
              `inset-y-0` — the full height of the spine. So 130% was 130% of the
              viewport, and the "fog" painted a pale column down the entire left
              edge of every page. Measured at 1170px tall against a label of
              about 190px.

              It is inside the label now, which is `relative`, so the inset
              percentages resolve against the text they are supposed to be
              backing. A soft radial plate rather than a rounded box: a box would
              read as a UI chip stuck to the edge of an editorial page, and this
              reads as the ground simply being brighter where the label sits. */}
          <span className="relative font-label whitespace-nowrap [writing-mode:vertical-rl] [transform:rotate(180deg)]">
            <span
              aria-hidden
              className={cn(
                "absolute -inset-x-5 -inset-y-8 -z-10",
                onDark
                  // `emerald-deep`, not `emerald`. The dark chapters are now a
                // FLAT `bg-emerald`, so a fog mixed from that same emerald is
                // lighter than the ground it sits on and reads as a pale blob
                // stuck to the left edge. A fog has to move away from the
                // ground, and on a dark ground that means down.
                ? "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-emerald-deep)_80%,transparent),transparent)]"
                  : "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-mist)_94%,transparent),transparent)]"
              )}
            />
            <span className={onDark ? "text-gold" : "text-gold-ink"}>
              {sheet.index}
            </span>
            <span className={onDark ? "text-cream/35" : "text-charcoal/35"}>
              {" "}
              &mdash;{" "}
            </span>
            <span className={onDark ? "text-cream/70" : "text-charcoal/55"}>
              {sheet.label}
            </span>
          </span>
        </span>
      )}
    </div>
  );
}
