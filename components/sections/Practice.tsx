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
      className="relative overflow-hidden bg-paper pb-16 text-charcoal md:pb-20 lg:pb-24"
    >
      {/* Figures strip — full-bleed, flush to the TOP of the section, so it
          lands directly between the hero and the statement and reads as a
          plinth under the hero's imagery. Deliberately outside
          <PageContainer /> so the emerald runs edge to edge; the list inside
          pours back through it to keep the page's left/right rhythm. */}
      {/* ── The plinth is light now ──────────────────────────────────────
          This was a full-bleed `surface-emerald` band with gold figures, and
          it is the first thing under the hero — so the page opened on a
          photograph, then a near-black green bar, then paper. Three grounds in
          the first screen and a half, one of which shared nothing with the
          other two.

          It is still a plinth and it is still green: `surface-sage-deep` is
          the brand emerald mixed 10% into cream, which keeps the band reading
          as the darkest step on the page without leaving the page's own value
          range. The figures move to emerald, where the brand colour now
          carries the type rather than the background — the same argument
          SectionHeading has always made for its titles.

          `data-chrome="dark"` is gone with it: the masthead reads this strip
          as it scrolls past the hero, and it is no longer a dark band. */}
      {/* `border-t` only, and gold. The top edge butts a photograph and wants
          a drawn line — that is what makes the plinth read as a mount under the
          picture. The bottom has none: `.surface-sage-deep` already dissolves
          into the paper of this section. */}
      <div className="surface-sage-deep relative z-10 border-t border-gold/35 py-7 md:py-8">
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
                  "flex flex-col items-center border-emerald/12 px-3 text-center",
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
                {/* `type-figure` — the serif, with lining numerals. These were
                    the last Bodoni on the site outside the wordmark, which is
                    why a row of figures never sat easily above labels set in
                    Cormorant. See styles/globals.css. */}
                {/* Emerald figures, charcoal labels — the same two inks every
                    other light section on the site uses. The figures were
                    `gold-soft` and the labels `gold`, both of which need a dark
                    ground: champagne on sage is around 1.6:1, and a 12px
                    uppercase label at that contrast is decorative rather than
                    readable. */}
                <p className="type-figure m-0 whitespace-nowrap text-[1.5rem] leading-none tracking-tight text-emerald md:text-[1.75rem] xl:text-3xl">
                  {stat.value}
                </p>
                <p className="m-0 mt-2.5 font-label leading-normal text-charcoal/55">
                  {stat.label}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </PageContainer>
      </div>

      {/* Was pt-20/24/28. The strip above now fades into this ground instead
          of ending on a rule, so the section no longer needs to clear a hard
          edge before it starts — and 112px of nothing under a plinth was a
          third of the empty space the review flagged. */}
      <PageContainer className="relative z-10 pt-12 md:pt-14 lg:pt-16">
        <SectionHeading
          index="01"
          eyebrow="The Practice"
          meta="Gurugram · India"
          className="max-w-full"
        />

        <Rule className="mt-7 w-full bg-emerald/15 md:mt-8" />

        {/* Caption on the left, the studio's words on the right. One row, so
            the frame closes horizontally instead of leaving a dead column. */}
        <div className="mt-12 grid gap-y-12 md:mt-16 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-x-20 xl:gap-x-28">
          <div>
            <h2 className="font-serif leading-[1.04] tracking-[-0.02em] text-emerald">
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
                /* The flipping word is part of this sentence, so it is set in
                   the same face as the sentence — italic and gold to mark it,
                   not a second typeface. It was Bodoni, which meant one word
                   inside a Cormorant heading came from a different family. */
                wordClassName="font-serif italic text-gold text-[2.7rem] md:text-[3.8rem] lg:text-[3.7rem] xl:text-[4.7rem] 2xl:text-[5.3rem]"
              />
            </h2>

            <Rule className="mt-9 w-full bg-emerald/20 lg:mt-10" />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <Rule className="w-16 bg-gold" />

            {/* The caption. Set in the serif at pull-quote size, because it is
                the studio's line and everything under it is elaboration.
                `mt-7` on mobile keeps its stacked spacing under the heading;
                `lg:mt-3` at the two-column breakpoint pulls it up so this
                first line sits level with "Design is the brand of our"
                instead of trailing ~40px below it. */}
            <motion.p
              variants={fadeUp}
              className="mt-7 font-serif text-[1.7rem] leading-[1.35] tracking-tight text-emerald lg:mt-3 xl:text-[2rem]"
            >
              &ldquo;Every space has a story. Our work begins by listening to
              it.&rdquo;
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-charcoal/75"
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
