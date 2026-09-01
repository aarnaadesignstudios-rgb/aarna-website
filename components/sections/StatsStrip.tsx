"use client";

/**
 * StatsStrip — the studio in numbers, on a full-bleed emerald band.
 *
 * ── Why this is a component and not two copies of a grid ──────────────────
 *
 * It was written inline in <Practice /> and is now wanted on /about as well.
 * The markup is not the kind that survives being duplicated: the cell rules
 * are a set of five interlocking border conditions that change at `md` (a
 * 2-up with horizontals below, a 5-up with verticals only), and the ink is
 * three specific tokens chosen against a dark ground. A second copy would be
 * correct on the day it was pasted and wrong the first time either page's
 * layout moved.
 *
 * So it lives here and both pages call it. `STATS` is read here rather than
 * passed in, because there is one set of figures and a caller choosing a
 * different set would be a caller inventing facts about the practice.
 *
 * ── The band is a title plate, so use it like one ─────────────────────────
 *
 * Full brand emerald with gold figures, at the studio's request — this line is
 * as it was before the site went light.
 *
 * It is the loudest thing on whichever page carries it, and that only works
 * while a page has at most two of them. Framing a chapter with the brand colour
 * at the top and the bottom is a title plate and a colophon; sprinkling four of
 * them through the middle, which is what the site used to do, is stripes. On
 * the home page it pairs with <Contact />; on /about it opens and <Contact />
 * closes. See the note on `.surface-emerald` in styles/globals.css.
 *
 * `data-chrome="dark"` is not optional. The masthead reads that attribute to
 * decide whether it needs cream chrome, and this band is dark enough that
 * emerald chrome over it is unreadable — see components/layout/Navbar.tsx.
 *
 * ── It must not sit inside a <PageContainer /> ────────────────────────────
 *
 * The band bleeds to both page edges and its own `<PageContainer>` holds the
 * figures to the measure. Nesting it in another one would inset the emerald as
 * well, which turns a title plate into a card.
 */
import { useRef, useState } from "react";
import { motion } from "framer-motion";

import { PageContainer } from "@/components/ui";
import { fadeUp, staggerContainer, VIEWPORT_ONCE } from "@/animations/variants";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { STATS } from "@/constants";
import { cn } from "@/utils/cn";

/**
 * How fast the phone marquee travels, in pixels per second.
 *
 * A SPEED, not a duration, and the duration is derived from it below. The two
 * are only the same thing while the number of figures never changes: a sixth
 * stat makes the track longer, and a fixed duration would silently slow the
 * strip down to cover the extra distance in the same time. Fixing px/s instead
 * means the reading pace is the thing that is actually held constant, which is
 * what the brief was about.
 *
 * ── 42, and it was 75 ────────────────────────────────────────────────────
 *
 * The first build ran at 75 and the note here claimed anything under ~50 would
 * read as drifting. That was written against the INLINE version of the item,
 * where a figure and its label sat on one line about 250px wide, and it did not
 * survive the item becoming a two-line stack:
 *
 *   · a stacked item is ~200px rather than ~250, so at the same px/s the
 *     figures arrive about a fifth more often, and
 *   · there are now two lines to take in per figure rather than one, so each
 *     one needs LONGER in view, not the same
 *
 * Both moved the comfortable speed down and the strip got faster to read at
 * the same time. The note back was that it could not be read properly, which
 * is the only measurement that counts for this.
 *
 * At 42 an item takes ~4.8s to cross a fixed point and a lap of the five is
 * ~24s. Still plainly moving — a ticker, not a static band — but the eye can
 * settle on a figure, read its label, and look away before the next arrives.
 */
const MARQUEE_PX_PER_SECOND = 42;

export default function StatsStrip({ className }: { className?: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [duration, setDuration] = useState<string>();

  /**
   * Turn the measured track into a duration at the speed above.
   *
   * `scrollWidth / 2` is one copy of the five figures, because the track holds
   * exactly two — see the marquee markup. That is also precisely how far the
   * keyframe travels (`-50%`), so dividing it by px/s gives the time for one
   * lap directly.
   *
   * `ResizeObserver` rather than a window `resize` listener: the track's width
   * changes when the FONT lands, not when the window moves, and a webfont
   * swapping in after first paint is the common case here. It also covers the
   * orientation change a resize listener would have caught anyway.
   */
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const lap = track.scrollWidth / 2;
      // Zero while the strip is `display: none` — above `md`, and under
      // reduced motion. Writing `0s` there would make the animation invalid.
      if (lap > 0) setDuration(`${(lap / MARQUEE_PX_PER_SECOND).toFixed(2)}s`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      data-chrome="dark"
      /* The vertical padding moved off the band and onto each layout: the
         marquee wants less of it than the grid, because it is one line of type
         rather than two rows of stacked figures. */
      className={cn(
        "relative z-10 border-y border-gold/25 bg-emerald",
        className
      )}
    >
      {/* ── The marquee (below md) ─────────────────────────────────────────
          ── What it replaced ─────────────────────────────────────────────
          The grid below is 5-up at `md` and 2-up beneath it, which on a phone
          meant a 2 + 2 + 1 stack about 350px tall with the fifth figure
          orphaned across the bottom row on its own. Three rows of a "strip",
          and the studio's five numbers could not be taken in together — which
          is the entire point of a stats band, and is what the desktop does in
          a single 120px row.

          A marquee gets all five back into one band on a 390px screen. The
          strip is ~105px tall instead of ~350 — near enough the desktop band's
          own 124px — and the figures read as one continuous claim about the
          practice rather than as a small table.

          ── Why the spacing is INSIDE the items ──────────────────────────
          The `marquee` keyframe travels exactly `-50%`, so the two copies of
          the sequence have to tile seamlessly at that offset. A `gap` on the
          track breaks that: the gap that falls BETWEEN the two copies is not
          accounted for in -50%, so the seam drifts by half a gap every lap —
          this is the same trap <InfiniteMovingCards /> solves with its
          `--marquee-gap` variable and a custom keyframe.

          Here it is avoided rather than corrected. Each item carries its own
          trailing separator and margin, so the track has no `gap` at all, the
          two copies are byte-identical, and -50% lands copy two exactly where
          copy one began. Nothing to keep in sync.

          ── Full-bleed, so no PageContainer ──────────────────────────────
          A marquee that stops at the measure would show its items appearing
          and vanishing at two hard edges in the middle of the band. It runs
          to both page edges; the grid below keeps its container. */}
      <div className="overflow-hidden py-7 md:hidden motion-reduce:hidden">
        <ul
          ref={trackRef}
          aria-label="The studio in numbers"
          className="animate-marquee flex w-max list-none items-center p-0"
          style={{ "--marquee-duration": duration } as React.CSSProperties}
        >
          {/* Two copies. The duplicate is built in JSX rather than cloned in
              an effect so it renders on the server, and it is `aria-hidden`
              so the figures are announced once. */}
          {[0, 1].map((copy) =>
            STATS.map((stat) => (
              <li
                key={`${copy}-${stat.id}`}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex shrink-0 items-center"
              >
                {/* ── The desktop cell, exactly ──────────────────────────
                    Figure over label, centred, with the same type sizes and
                    the same 10px between them that the grid below uses. The
                    first build of this marquee set the two INLINE to keep the
                    band to one 63px line; stacked is what the rest of the site
                    does with a statistic, and a strip that reads differently
                    from the same figures forty pixels further down the page is
                    two components, not one at two widths. */}
                <span className="flex flex-col items-center">
                  {/* `type-figure` — the serif with LINING numerals. Without
                      it Cormorant sets these in its default old-style figures,
                      where "7" and "5" drop below the baseline and "1" is
                      x-height, so a row of numbers reads as uneven for reasons
                      a viewer cannot name. See styles/globals.css. */}
                  {/* `whitespace-nowrap`: "Pan India" and "2 Lakh" are two
                      words and must not break, or that item is three lines
                      tall and the strip's baseline stops agreeing. */}
                  <span className="type-figure whitespace-nowrap text-[1.5rem] leading-none tracking-tight text-gold-soft">
                    {stat.value}
                  </span>
                  <span className="mt-2.5 font-label whitespace-nowrap text-gold">
                    {stat.label}
                  </span>
                </span>

                {/* The separator, and it belongs to the item — see the note
                    above about why there is no track `gap`.

                    The grid's own `border-l border-gold/20`, redrawn as an
                    element because a border would need a `gap` to sit in.
                    Now that the item is two lines tall there is a rule's worth
                    of height to draw, which there was not when this was a
                    single 20px line — that is why the inline version used a
                    lozenge instead. */}
                <span
                  aria-hidden
                  className="mx-7 block h-11 w-px shrink-0 bg-gold/20"
                />
              </li>
            ))
          )}
        </ul>
      </div>

      {/* ── The grid (md and up — and below it under reduced motion) ───────
          `motion-reduce:block` is not a nicety. The marquee is the only way
          the fourth and fifth figures are reachable on a phone: the track is
          ~1200px wide in a 390px viewport, so with the animation stopped a
          visitor would see "7+ Years in practice" and half of "150+" and have
          no way to reach the rest — the strip does not scroll, it animates.

          The global reduced-motion rule in styles/globals.css collapses every
          animation to 0.001ms, which would leave exactly that. So under
          reduced motion the marquee is not shown at all and the honest,
          static 2-up grid takes over. Both are CSS variants rather than a
          `useReducedMotion()` branch, so the server and the client render the
          same thing and there is no hydration flash. */}
      <PageContainer className="hidden py-7 motion-reduce:block md:block md:py-8">
        <motion.ul
          aria-label="The studio in numbers"
          className="grid list-none grid-cols-2 gap-y-7 p-0 md:grid-cols-5 md:gap-y-0"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          {STATS.map((stat, i) => (
            <motion.li
              key={stat.id}
              variants={fadeUp}
              className={cn(
                "flex flex-col items-center border-gold/20 px-3 text-center",
                // 2-up: rule between the pair, and across the rows.
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t pt-7",
                // 5-up: one continuous set of verticals, no horizontals.
                "md:border-t-0 md:pt-0",
                i === 0 ? "md:border-l-0" : "md:border-l",
                // The odd fifth figure closes the bottom row while stacked.
                i === STATS.length - 1 && "col-span-2 md:col-span-1"
              )}
            >
              {/* `whitespace-nowrap`: "Pan India" and "2 Lakh" are two words
                  and must not break across lines, or the row's baselines stop
                  agreeing and one cell sits lower than its neighbours. */}
              {/* `type-figure` — the serif, with lining numerals. Without it
                  Cormorant sets these in its default OLD-STYLE figures, where
                  "7" and "5" drop below the baseline and "1" is x-height, so a
                  row of numbers reads as uneven for reasons a viewer cannot
                  name. See styles/globals.css. */}
              {/* Champagne figures over gold labels. These need a dark ground
                  and have one — on the light version of this strip they had to
                  become emerald and charcoal, because champagne on sage
                  measures about 1.6:1. */}
              <p className="type-figure m-0 whitespace-nowrap text-[1.5rem] leading-none tracking-tight text-gold-soft md:text-[1.75rem] xl:text-3xl">
                {stat.value}
              </p>
              <p className="m-0 mt-2.5 font-label leading-normal text-gold">
                {stat.label}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </PageContainer>
    </div>
  );
}
