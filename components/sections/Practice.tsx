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
import { useRef } from "react";
import { motion } from "framer-motion";

import {
  LayoutTextFlip,
  Media,
  PageContainer,
  SectionHeading,
  SheetTexture,
} from "@/components/ui";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
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
  const plateRef = useRef<HTMLDivElement>(null);

  /**
   * ── The plate ─────────────────────────────────────────────────────────
   *
   * The photograph under the statement is laid BACK in 3D and stands up as you
   * scroll to it: `rotateX` from 14° to 0 while it rises and its own image
   * drifts the other way inside its frame.
   *
   * It is the same language as <SelectedWorks />, deliberately — that chapter
   * is a ring of photographs on a turntable, and a site whose only 3D moment is
   * one section reads as a section with a gimmick in it. Two, built from the
   * same parts (a `perspective` on the wrapper, a `rotateX` on the child, an
   * inner counter-drift), read as how this site handles pictures.
   *
   * The perspective lives on the wrapper and the rotation on the child, for the
   * same reason the ring's does: perspective applies to an element's CHILDREN,
   * so putting both on one element gives you a skew rather than a rotation.
   */
  useIsomorphicLayoutEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: plate,
            // Starts before the plate is on screen and finishes once it is
            // comfortably inside it, so the whole move happens while it is
            // being looked at rather than half of it below the fold.
            start: "top 92%",
            end: "top 42%",
            scrub: 1,
          },
        })
        .fromTo(
          "[data-plate-face]",
          { rotateX: 14, y: 56, scale: 0.94 },
          { rotateX: 0, y: 0, scale: 1, ease: "none" },
          0
        )
        // The image inside drifts against the frame for the whole travel, so
        // the plate has parallax as well as depth.
        .fromTo("[data-plate-image]", { yPercent: -8 }, { yPercent: 6, ease: "none" }, 0);
    }, plate);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="practice"
      className="relative overflow-hidden bg-paper pb-20 text-charcoal md:pb-24 lg:pb-28"
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
        <div className="mt-14 flex flex-col items-center text-center md:mt-16">
          <h2 className="font-serif leading-[1.02] tracking-[-0.025em] text-emerald">
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
          </h2>

          <Rule className="mt-10 w-24 bg-gold" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="flex flex-col items-center"
          >
            <motion.p
              variants={fadeUp}
              className="mt-9 max-w-[34ch] font-serif text-[1.6rem] leading-[1.3] tracking-tight text-emerald md:text-[2rem]"
            >
              &ldquo;Every space has a story. Our work begins by listening to
              it.&rdquo;
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-[46ch] text-charcoal/70"
            >
              From the first conversation to the final detail, we approach
              design as a process of discovery. We understand the context,
              challenge assumptions, refine the idea and translate it into
              spaces that are purposeful, expressive and enduring.
            </motion.p>
          </motion.div>
        </div>

        {/* ── The plate ──────────────────────────────────────────────────
            A wide photograph that stands up out of the page as you reach it.
            See the note on the timeline above.

            `perspective` on the wrapper, the transform on the child — and a
            generous 1400px, because a plate this wide keystones badly at the
            shorter perspective the ring uses. */}
        <div
          ref={plateRef}
          className="mt-16 md:mt-20 lg:mt-24"
          style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}
        >
          <div
            data-plate-face
            className="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-emerald-deep will-change-transform md:aspect-2/1"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Oversized and offset, so the counter-drift never exposes an
                edge — the image is 124% of the frame's height and travels 14%
                of that across the whole scroll. */}
            <div
              data-plate-image
              className="absolute inset-x-0 -top-[12%] h-[124%] will-change-transform"
            >
              <Media
                src="/images/hero/AWC.jpg"
                alt="AWC — the studio's work"
                sizes="100vw"
              />
            </div>

            {/* A gold hairline inside the frame, so the plate reads as a
                mounted print rather than as a bleed. */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-gold)_38%,transparent)]"
            />
          </div>
        </div>

      </PageContainer>
    </section>
  );
}
