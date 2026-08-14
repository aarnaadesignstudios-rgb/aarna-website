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
 * ── The plate is gone; the blueprint replaced it ──────────────────────────
 *
 * A wide photograph used to stand up out of the page on a 3D plate below the
 * statement. The studio did not want that kind of image here, so it is removed
 * along with the scrubbed timeline that drove it.
 *
 * The backdrop behind the statement is now a house plan drawn in gold pencil
 * (<Blueprint />) — masked so it stays behind the words and never on them. It
 * is the better fit for the section anyway: this chapter is the studio talking
 * about how it works, and a drawing is what that looks like. The photographs
 * belong in chapter 02, which is entirely made of them.
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

import {
  Blueprint,
  LayoutTextFlip,
  PageContainer,
  SectionHeading,
  SheetTexture,
} from "@/components/ui";
import { fadeUp, staggerContainer, VIEWPORT_ONCE } from "@/animations/variants";
import { STATS } from "@/constants";
import { cn } from "@/utils/cn";

export default function Practice() {
  return (
    <section
      id="practice"
      className="relative overflow-hidden bg-paper text-charcoal"
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
      {/* The paper. Safe to drop in here without touching anything else: both
          of this section's children already carry `relative z-10`. */}
      <SheetTexture />

      {/* ── The title plate ──────────────────────────────────────────────
          Back to deep brand emerald with gold figures, at the studio's request:
          this line is as it was before the site went light.

          It is the only band on the page that goes to full brand emerald other
          than the invitation at the end, and the two of them together are the
          reason it works this time. Framing a story with the brand colour at
          the top and the bottom is a title plate and a colophon; sprinkling
          four of them through the middle, which is what the site used to do, is
          stripes. See the note on `.surface-emerald` in styles/globals.css.

          `data-chrome="dark"` comes back with it — this strip is what the
          masthead floats over as the hero scrolls away, and it needs cream
          chrome again (components/layout/Navbar.tsx). */}
      <div
        data-chrome="dark"
        className="relative z-10 border-y border-gold/25 bg-emerald py-7 md:py-8"
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
                  i === STATS.length - 1 && "col-span-2 md:col-span-1",
                )}
              >
                {/* `whitespace-nowrap`: "Pan India" and "2 Lakh" are two words
                    and must not break across lines, or the row's baselines
                    stop agreeing and one cell sits lower than its neighbours. */}
                {/* `type-figure` — the serif, with lining numerals. These were
                    the last Bodoni on the site outside the wordmark, which is
                    why a row of figures never sat easily above labels set in
                    Cormorant. See styles/globals.css. */}
                {/* Champagne figures over gold labels. These need a dark
                    ground and now have one again — on the light version of this
                    strip they had to become emerald and charcoal, because
                    champagne on sage measures about 1.6:1. */}
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

      {/* Was pt-20/24/28. The strip above now fades into this ground instead
          of ending on a rule, so the section no longer needs to clear a hard
          edge before it starts — and 112px of nothing under a plinth was a
          third of the empty space the review flagged. */}
      {/* ── The sheet ────────────────────────────────────────────────────
          Everything below the figures strip is one drawing sheet, and the
          blueprint fills it. It used to sit inside the statement block, which
          is ~420px tall against a plan that is nearly twice that — so the plan
          was cropped to fragments and had to be given negative insets and
          extra section padding to fight its way out.

          Wrapping the whole light half of the chapter instead means the plan
          has the room it needs by construction, and the section's padding goes
          back to being about the type. The strip stays outside it, because a
          plan bleeding onto that emerald band reads as a drawing escaping its
          page.

          `relative` here and `z-10` on the container below is what keeps the
          plan behind: an absolutely positioned element paints over any STATIC
          sibling that follows it, regardless of DOM order. Same note as
          components/ui/SheetTexture.tsx. */}
      {/* ── The padding lives HERE, not on the section ───────────────────
          <Blueprint /> is `inset-0` of this wrapper, so the wrapper's height is
          the height the plan is drawn at. With the bottom padding on the
          <section> instead, this box was only as tall as its own content —
          measured at 444px against a 1600x780 sheet, which fitted the drawing
          to 57% and made its annotation too small to read as annotation.

          Moving the padding inside gives the sheet the whole light half of the
          chapter. The space is not empty: the drawing is in it. */}
      <div className="relative pb-32 md:pb-40 lg:pb-48">
        <Blueprint />

        <PageContainer className="relative z-10 pt-12 md:pt-14 lg:pt-16">
          <SectionHeading
            index="01"
            eyebrow="The Practice"
            align="center"
            className="max-w-full"
          />

          {/* ── Centred, and the heading owns the width ────────────────────
            This was a two-column row: the statement on the left at 1.5fr, the
            studio's words on the right at 1fr. The note was to centre it, set
            the heading a little bolder, and let the heading have the space.

            So the whole chapter is now one centred column on the page's axis.
            The statement is the widest thing in it and everything under it is
            narrower and quieter — a masthead and its standfirst, which is what
            this copy actually is. Nothing was cut: the pull quote and the
            paragraph moved below the heading instead of beside it.

            `max-w-[22ch]` on the quote and `[46ch]` on the paragraph: centred
            text has to be held to a measure or the ragged edges on BOTH sides
            stop reading as a shape. */}
          <div className="relative mt-14 flex flex-col items-center text-center md:mt-16">
            {/* ── The statement arrives ──────────────────────────────────
              A masked rise, once, on enter. The chapter's whole idea is that a
              drawing is being made while you read — and until now the reading
              half of that had no arrival at all: the heading was simply already
              there while the plan drew itself behind it.

              `overflow-hidden` on the wrapper with the heading translated from
              inside it: the line rises out of its own edge rather than fading
              in on the spot, which is the same gesture the hero's project
              caption and the Works title both use. */}
          <motion.h2
            initial={{ y: "34%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 font-serif leading-[1.02] tracking-[-0.025em] text-emerald"
          >
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
                // owns the next, so the line count cannot change as it flips and
                // the heading can never jump mid-read.
                //
                // `font-medium` is the "a little bolder" the studio asked for,
                // and it is the ONE place on the site that departs from the
                // single 400 weight every other heading uses (see the type note
                // in styles/globals.css). It is here rather than in the base
                // layer because this is the page's masthead statement and the
                // step is doing work; applied globally, 500 closes Cormorant's
                // counters at the sizes the section titles run at.
                phraseClassName="block font-medium text-[2.4rem] md:text-[3.4rem] lg:text-[4rem] xl:text-[4.8rem] 2xl:text-[5.4rem]"
                /* The flipping word is part of this sentence, so it is set in the
                 same face — italic and gold to mark it, not a second
                 typeface. */
                wordClassName="font-serif font-medium italic text-gold text-[3rem] md:text-[4.2rem] lg:text-[5rem] xl:text-[6rem] 2xl:text-[6.8rem]"
              />
            </motion.h2>

            {/* ── One rule, not two ────────────────────────────────────────
              There used to be a `<Rule className="mt-10 w-24 bg-gold" />` here.
              <LayoutTextFlip /> already draws a gold rule under the flipping
              word (it is `border-b border-gold/50` on the word's own box, so it
              measures exactly as wide as whichever word is showing) — so this
              added a SECOND gold rule 40px under the first, and most of the gap
              the studio asked to close was the space that second rule needed.

              Removing it closes the gap and fixes the doubled hairline in one
              go. The quote now sits `mt-7` under the statement.

              The standfirst that followed it — "From the first conversation to
              the final detail…" — is removed at the studio's request. */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-[34ch] font-serif text-[1.6rem] leading-[1.3] tracking-tight text-emerald md:text-[2rem]"
              >
                &ldquo;Every space has a story. Our work begins by listening to
                it.&rdquo;
              </motion.p>
            </motion.div>
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
