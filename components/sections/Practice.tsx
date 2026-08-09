"use client";

/**
 * Practice — the page's opening statement.
 *
 * ── Cut back in the client review ─────────────────────────────────────────
 *
 * The section used to carry four separate blocks of copy: the flipping
 * statement, a standfirst about how slowly the studio works, and three tenets
 * (Material not finish / Drawn by hand first / Vastu without ornament). The
 * note was "remove extra text: just have caption written and below the smaller
 * text lines" — so it is now exactly that shape, and nothing else:
 *
 *      01 — THE PRACTICE ─────────────────────── GURUGRAM · INDIA
 *
 *      Design is the brand of our
 *      𝑣𝑖𝑠𝑖𝑜𝑛
 *      ──────────
 *
 *      "Every space has a story. Our work begins by listening to it."
 *
 *      From the first conversation to the final detail, we approach design
 *      as a process of discovery…
 *
 * The two removed blocks were placeholder copy written to fill a layout; the
 * two that remain are the studio's own words. That is the whole justification
 * for the cut — there is now less on the page, and all of it is real.
 *
 * The figures strip above is unchanged in structure, but every figure in it
 * was corrected (see STATS) and it no longer counts up: two of the five values
 * are not numbers any more.
 *
 * ── The statement is stable by construction ───────────────────────────────
 *
 * `phraseClassName="block"` at EVERY width puts the phrase on its own line and
 * the flipping word on its own line always. The line count therefore cannot
 * depend on which word is up, so the heading can never jump as it flips.
 */
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
      className="relative overflow-hidden bg-stone pb-16 text-charcoal md:pb-20 lg:pb-24"
    >
      {/* Figures strip — full-bleed, flush to the TOP of the section, so it
          lands directly between the hero and the statement and reads as a
          plinth under the hero's imagery. Deliberately outside
          <PageContainer /> so the emerald runs edge to edge; the list inside
          pours back through it to keep the page's left/right rhythm. */}
      <div className="surface-emerald relative z-10 border-y border-gold/25 py-7 md:py-8">
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
                    and must not break across lines, or the row's baselines
                    stop agreeing and one cell sits lower than its neighbours. */}
                <p className="m-0 whitespace-nowrap font-display text-[1.5rem] font-medium leading-none tracking-tight text-gold-soft md:text-[1.75rem] xl:text-3xl">
                  {stat.value}
                </p>
                <p className="m-0 mt-2.5 font-label text-[12px] uppercase leading-normal tracking-[0.16em] text-gold md:text-[12px]">
                  {stat.label}
                </p>
              </motion.li>
            ))}
          </motion.ul>
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

        {/* Caption on the left, the studio's words on the right. One row, so
            the frame closes horizontally instead of leaving a dead column. */}
        <div className="mt-12 grid gap-y-12 md:mt-16 lg:grid-cols-[1.5fr_1fr] lg:gap-x-20 xl:gap-x-28">
          <div>
            <h2 className="font-serif font-light leading-[1.04] tracking-[-0.02em] text-emerald">
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
                // `block` at every width: the phrase owns its line and the
                // word owns the next, so the line count cannot change as it
                // flips and the heading can never jump mid-read.
                phraseClassName="block text-[2.15rem] md:text-[3rem] lg:text-[2.9rem] xl:text-[3.7rem] 2xl:text-[4.2rem]"
                wordClassName="font-display italic text-gold text-[2.7rem] md:text-[3.8rem] lg:text-[3.7rem] xl:text-[4.7rem] 2xl:text-[5.3rem]"
              />
            </h2>

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

            {/* The caption. Set in the serif at pull-quote size, because it is
                the studio's line and everything under it is elaboration. */}
            <motion.p
              variants={fadeUp}
              className="mt-7 font-serif text-[1.6rem] leading-[1.35] tracking-tight text-emerald xl:text-[1.85rem]"
            >
              &ldquo;Every space has a story. Our work begins by listening to
              it.&rdquo;
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-base leading-[1.8] font-light text-charcoal/75 xl:text-[1.05rem]"
            >
              From the first conversation to the final detail, we approach
              design as a process of discovery. We understand the context,
              challenge assumptions, refine the idea and translate it into
              spaces that are purposeful, expressive and enduring.
            </motion.p>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
