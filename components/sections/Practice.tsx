"use client";

/**
 * Practice — the page's opening statement.
 *
 * The gold figures strip across the top is unchanged and deliberately so; only
 * the statement below it is defined here.
 *
 * ── Why it is built this way ───────────────────────────────────────────────────
 *
 * The previous pass failed for one reason: not enough type for the space it took.
 * A 12-column grid with the statement on the left and the standfirst indented to
 * column 5 left a dead quarter under the label and a dead half to the right of
 * the copy, and everything in those gaps was set small — a 1.35rem standfirst and
 * 0.95rem tenet bodies floating in a screen and a half of empty stone. Whitespace
 * only reads as composition when something with weight is holding the frame.
 *
 * So this is built the other way round: fewer blocks, each much larger, packed
 * into a frame with no voids.
 *
 *      01 — THE PRACTICE                              GURUGRAM · INDIA
 *      ─────────────────────────────────────────────────────────────────
 *
 *      Design is the brand of our      │  ────────
 *      𝑖𝑚𝑎𝑔𝑖𝑛𝑎𝑡𝑖𝑜𝑛                     │  Aarnaa works slowly — four to
 *                                      │  six commissions a year, each
 *                                      │  drawn by hand before it is
 *                                      │  drawn by machine …
 *
 *      01 ──────────    02 ──────────    03 ──────────
 *      Material,        Drawn by         Vastu,
 *      not finish       hand first       without ornament
 *      Stone is left…   Every junction…  Where a client…
 *
 * The statement and the standfirst share one row instead of stacking with a gap
 * between them, which is what closes the frame horizontally. The flipping word
 * gets its own line at a larger size than the phrase above it, so the lockup has
 * a clear focal point and the gold lands on the biggest thing in the section.
 *
 * ── The statement is stable by construction ───────────────────────────────────
 *
 * `phraseClassName="block"` at EVERY width, not just below lg, puts the phrase on
 * its own line and the word on its own line always. The line count therefore
 * cannot depend on which word is up, so the heading can never jump as it flips —
 * and the sizes below are free of the old "must fit the longest word on one line"
 * constraint, which is what was capping the type at 3.4rem.
 *
 * Sizes live on `phraseClassName` / `wordClassName` and NOT on the <h2>, because
 * `cn()` is a plain joiner with no conflict resolution: a size on the shared
 * className plus a different size on the word would put both classes on the
 * element and leave CSS order to decide which wins.
 *
 * ── The motion vocabulary ─────────────────────────────────────────────────────
 *
 * Three primitives, one easing (EASE_EDITORIAL), all triggered by VIEWPORT_ONCE:
 *
 *   <MaskRise>  display type rises from under a mask. RESERVED for the statement
 *               and the tenet titles — it is what marks something as display.
 *   fadeUp      everything else: body copy, the standfirst.
 *   <Rule>      hairlines draw along their length.
 *
 * No GSAP here, no hand-tuned delays; sequencing comes from scroll position and
 * from `staggerContainer` within a row. The flipping word is the one continuous
 * device and the only thing that keeps moving after it has arrived.
 */
import { type ReactNode } from "react";
import { motion } from "framer-motion";

import { LayoutTextFlip, PageContainer, SectionHeading } from "@/components/ui";
import {
  EASE_EDITORIAL,
  fadeUp,
  staggerContainer,
  VIEWPORT_ONCE,
} from "@/animations/variants";
import { STATS } from "@/constants";
import { cn } from "@/utils/cn";

/**
 * The three tenets the practice is run by.
 *
 * Numerals are muted rather than gold at rest: small gold mono means "this is
 * the section index" everywhere else on the site (see <SectionHeading /> and the
 * note in <Founder />), and gold also carries the figures strip and the flipping
 * word. They warm to gold on hover, which is the one place the accent is spent
 * down here.
 */
const TENETS = [
  {
    id: "material",
    index: "01",
    title: "Material, not finish",
    body: "Stone is left to weather. Teak is left to darken. What we detail is not the finish but the fifteenth year of it.",
  },
  {
    id: "hand",
    index: "02",
    title: "Drawn by hand first",
    body: "Every junction is drawn full size at least once, and the ones that matter are mocked up on site before they are built.",
  },
  {
    id: "orientation",
    index: "03",
    title: "Vastu, without ornament",
    body: "Where a client asks for it, orientation follows Vastu — quietly, and never as decoration.",
  },
] as const;

/**
 * Display type rising from under a mask — the section's signature reveal.
 *
 * Two nested elements, and the split is load-bearing rather than tidiness: the
 * OUTER element owns the in-view trigger and the INNER one owns the transform.
 *
 * Putting `whileInView` on the element that moves does not work, and fails
 * silently in the worst way. `whileInView` is an IntersectionObserver on that
 * element, but at its hidden pose it is translated a full 115% below where it
 * belongs — outside the mask and, for anything in the lower half of the screen,
 * outside the viewport entirely. So it can never reach the observer's threshold,
 * the trigger never fires, and the text simply never appears. Not late: never.
 * The outer wrapper is untransformed, so it is always where the layout put it and
 * always observable; the inner span inherits the variant through context.
 *
 * `overflow-hidden` clips to the PADDING box, so the padding is what gives glyphs
 * room to sit outside the line box without being cut off — bottom for descenders
 * and the flip word's gold underline, sides for the italic display face, whose
 * swashes draw past their advance width. Each padding is cancelled by an equal
 * negative margin, so none of it opens a gap or widens the element.
 */
function MaskRise({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={cn(
        "block overflow-hidden px-[0.12em] pb-[0.16em] mx-[-0.12em] mb-[-0.16em]",
        className
      )}
      variants={{ hidden: {}, visible: {} }}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      <motion.span
        className="block"
        variants={{ hidden: { y: "115%" }, visible: { y: "0%" } }}
        transition={{ duration: 1, ease: EASE_EDITORIAL }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/** A hairline that draws along its length. */
function Rule({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left", className)}
      variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 1.1, ease: EASE_EDITORIAL }}
    />
  );
}

export default function Practice() {
  return (
    <section
      id="practice"
      className="relative overflow-hidden bg-stone pb-20 text-charcoal md:pb-24 lg:pb-28"
    >
      {/* Figures strip — full-bleed, flush to the TOP of the section, so it lands
          directly between the hero and the statement and reads as a plinth under
          the hero's imagery. Entirely gold on emerald: champagne numerals over
          brand-gold labels, so the two tiers separate by luminance rather than by
          one of them being faded out.

          Deliberately outside <PageContainer /> so the emerald runs edge to edge;
          the list inside pours back through it to keep the page's left/right
          rhythm. The top hairline lands against the hero's own bottom edge. */}
      <div className="surface-emerald relative z-10 border-y border-gold/25 py-6 md:py-7">
        <PageContainer>
          <ul
            aria-label="The studio in numbers"
            className="grid list-none grid-cols-2 gap-y-6 p-0 md:grid-cols-5 md:gap-y-0"
          >
            {STATS.map((stat, i) => (
              <li
                key={stat.id}
                className={cn(
                  "flex flex-col items-center border-gold/20 px-3 text-center",
                  // 2-up: rule between the pair, and across the rows.
                  i % 2 === 1 && "border-l",
                  i >= 2 && "border-t pt-6",
                  // 5-up: one continuous set of verticals, no horizontals.
                  "md:border-t-0 md:pt-0",
                  i === 0 ? "md:border-l-0" : "md:border-l",
                  // The odd fifth figure closes the bottom row while stacked.
                  i === STATS.length - 1 && "col-span-2 md:col-span-1"
                )}
              >
                <p className="m-0 font-display text-[1.6rem] font-medium leading-none tracking-tight text-gold-soft md:text-3xl">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="m-0 mt-2 font-mono text-[8px] uppercase leading-normal tracking-[0.2em] text-gold md:text-[9px]">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </div>

      <PageContainer className="relative z-10 pt-20 md:pt-24 lg:pt-28">
        <SectionHeading
          index="01"
          eyebrow="The Practice"
          meta="Gurugram · India"
          className="max-w-full"
        />

        <Rule className="mt-7 w-full bg-emerald/15 md:mt-8" />

        {/* Statement + standfirst share one row, which is what closes the frame
            horizontally. 1.6fr / 1fr keeps the statement dominant while still
            giving the standfirst a full, readable column rather than a scrap. */}
        <div className="mt-12 grid gap-y-10 md:mt-14 lg:grid-cols-[1.6fr_1fr] lg:gap-x-16 xl:gap-x-24">
          <div>
            <h2 className="font-serif font-light leading-[1.04] tracking-[-0.02em] text-emerald">
              <MaskRise>
                <LayoutTextFlip
                  text="Design is the brand of our"
                  words={[
                    "creativity",
                    "imagination",
                    "innovation",
                    "vision",
                    "artistry",
                  ]}
                  duration={3000}
                  // `block` at every width: the phrase owns its line and the word
                  // owns the next, so the line count cannot change as it flips.
                  //
                  // Sized ABOVE the column's single-line capacity on purpose. The
                  // phrase measures roughly 12.5x its font size, so past ~4rem it
                  // takes two lines in this track — which is the point: a tight
                  // three-line lockup fills the column, where one line of phrase
                  // plus a short word ("vision" is half the width of the line
                  // above it) left a large hole to the right of the gold.
                  phraseClassName="block text-[2.15rem] md:text-[3rem] lg:text-[2.9rem] xl:text-[3.7rem] 2xl:text-[4.2rem]"
                  wordClassName="font-display italic text-gold text-[2.7rem] md:text-[3.8rem] lg:text-[3.7rem] xl:text-[4.7rem] 2xl:text-[5.3rem]"
                />
              </MaskRise>
            </h2>

            {/* Closes the lockup across the full column, so the ragged right of
                the word's line reads as a measure rather than as an edge that
                ran out of text. */}
            <Rule className="mt-9 w-full bg-emerald/20 lg:mt-10" />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:pt-3"
          >
            <Rule className="w-16 bg-gold" />
            <motion.p
              variants={fadeUp}
              className="mt-7 text-xl leading-[1.7] font-light text-charcoal/75 xl:text-[1.4rem]"
            >
              Aarnaa works slowly — four to six commissions a year, each drawn
              by hand before it is drawn by machine, each sited by its light
              before its plan.
            </motion.p>
          </motion.div>
        </div>

        {/* Tenets. Each opens with its numeral and a rule that runs out across the
            column; both warm to gold on hover. */}
        <motion.div
          className="mt-20 grid grid-cols-1 gap-x-10 gap-y-14 md:mt-24 md:grid-cols-3 lg:gap-x-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          {TENETS.map((tenet) => (
            <article key={tenet.id} className="group">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal/40 transition-colors duration-500 ease-editorial group-hover:text-gold">
                  {tenet.index}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-emerald/20 transition-colors duration-700 ease-editorial group-hover:bg-gold"
                />
              </div>

              <h3 className="mt-6 font-serif text-[1.9rem] font-light leading-[1.12] tracking-tight text-emerald xl:text-[2.15rem]">
                <MaskRise>{tenet.title}</MaskRise>
              </h3>

              <motion.p
                variants={fadeUp}
                className="mt-5 text-base leading-[1.75] text-charcoal/65 xl:text-[1.05rem]"
              >
                {tenet.body}
              </motion.p>
            </article>
          ))}
        </motion.div>
      </PageContainer>
    </section>
  );
}
