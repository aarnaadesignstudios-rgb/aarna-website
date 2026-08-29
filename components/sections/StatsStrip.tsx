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
import { motion } from "framer-motion";

import { PageContainer } from "@/components/ui";
import { fadeUp, staggerContainer, VIEWPORT_ONCE } from "@/animations/variants";
import { STATS } from "@/constants";
import { cn } from "@/utils/cn";

export default function StatsStrip({ className }: { className?: string }) {
  return (
    <div
      data-chrome="dark"
      className={cn(
        "relative z-10 border-y border-gold/25 bg-emerald py-7 md:py-8",
        className
      )}
    >
      <PageContainer>
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
