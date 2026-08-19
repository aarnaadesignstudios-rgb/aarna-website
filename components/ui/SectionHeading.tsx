"use client";

/**
 * SectionHeading — the one heading block every section on the site uses.
 *
 * This is the page's strongest brand device, so it is deliberately specific
 * rather than generic. It is modelled on an architectural drawing sheet:
 *
 *     ──── 03 — Selected Works .................... 01 / 06
 *     A large serif title, set in brand emerald
 *     An optional lead paragraph.
 *
 *   • a gold hairline opens every section
 *   • the section INDEX is set in gold — the numbers run 01…08 down the page,
 *     so the site reads as one curated document rather than a stack of
 *     unrelated blocks
 *   • the eyebrow is uppercase small-caps in the SERIF. It used to be set in
 *     JetBrains Mono as a "spec-sheet" cue; the client's review asked for that
 *     font to be changed and for the serif to be used everywhere, so the label
 *     row and the title it introduces are now one voice. Cormorant has a low
 *     x-height, so these labels are set at 12px rather than the 10px a mono
 *     could carry — below that the strokes break up.
 *   • `meta` is the sheet's title block — the right-aligned slot for a counter,
 *     a hint, a place name
 *   • the title is EMERALD on light surfaces. This is the single biggest reason
 *     the page reads as Aarnaa rather than as a template: the brand's primary
 *     colour carries the typography instead of sitting unused in the palette.
 *
 * The title reveals word by word (TextReveal); eyebrow and lead ease in. Callers
 * do not need to wrap this in <Reveal>.
 *
 * The title is a plain string; use "\n" for deliberate line breaks.
 */
import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

import { EASE_EDITORIAL, fadeUp, VIEWPORT_ONCE } from "@/animations/variants";
import { cn } from "@/utils/cn";
import TextReveal from "./TextReveal";

interface SectionHeadingProps {
  /** Two-digit index, e.g. "03". Runs 01…10 down the page. */
  index?: string;
  eyebrow?: string;
  /**
   * Omit for a label-only header. The pinned Works gallery needs just the
   * index/eyebrow/counter row — a display title would eat its 100vh budget.
   */
  title?: string;
  description?: ReactNode;
  /** Right-aligned slot — the drawing sheet's title block. */
  meta?: ReactNode;
  className?: string;
  align?: "left" | "center";
  /** Surface this sits on. Drives the ink colour. */
  tone?: "light" | "dark";
  /**
   * Override the title's ink.
   *
   * Exists for the Contact heading, which the client marked to be set in gold.
   * It is deliberately an opt-in on one caller rather than a new `tone`:
   * `cn()` is a plain joiner with no conflict resolution, so a colour passed
   * here and the tone's own colour would BOTH land on the element and CSS
   * source order would pick the winner. So the tone's colour is only applied
   * when this is absent.
   *
   * Only use it on a dark surface. Gold display type on cream is around 2:1
   * contrast — illegible, and the reason gold is not the default title ink.
   */
  titleClassName?: string;
}

/**
 * How a chapter announces itself.
 *
 * The rule draws along its length, then the number and the name rise out of
 * their own edges. Three parts, about 0.6s end to end, once.
 *
 * A MASKED RISE rather than a fade, because it is the gesture the rest of the
 * site already uses for type arriving — the hero's project caption, the Works
 * title, the statement in chapter 01. A fade would have been less work and
 * would have made the chapter mark the one piece of type on the page that
 * behaves differently from every other.
 *
 * Once, via VIEWPORT_ONCE. A heading that re-animates every time it is scrolled
 * back past stops reading as an arrival and starts reading as a loop.
 */
const chapterMark: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/** Drawn, not faded. The origin is set per side at the call site. */
const chapterRule: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_EDITORIAL },
  },
};

/**
 * The rise. 105%, not 100%: a descender sits below the baseline, so a glyph
 * translated exactly its own height still shows its tail above the mask edge.
 */
const chapterItem: Variants = {
  hidden: { y: "105%" },
  visible: {
    y: "0%",
    transition: { duration: 0.62, ease: EASE_EDITORIAL },
  },
};

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  meta,
  className,
  align = "left",
  tone = "light",
  titleClassName,
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {(eyebrow || meta) && (
        <motion.div
          className={cn(
            "flex flex-wrap items-end gap-x-6 gap-y-3",
            meta ? "justify-between" : "",
            align === "center" && "justify-center"
          )}
          variants={chapterMark}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <span className="flex items-center gap-4 sm:gap-5">
            {/* The hairline that opens every chapter, and REACHES.

                It used to be a 40px stub sitting inside the container's left
                gutter. At `lg` it runs from the page edge instead: `-ml-16`
                cancels the container's `lg:px-16`, and the width is that 64px
                plus the original 40.

                That is not a flourish. <Spine /> draws the story's thread at
                x=28px and this rule crosses it, so every chapter's heading is
                physically joined to the thread running down the page.

                Only from `lg`, because that is where the spine exists; below it
                the rule stays the stub it was, since a hairline running off the
                edge of a phone screen just looks like a clipped element.

                It draws along its length rather than fading, which is why it
                carries its own origin — see `chapterRule`. */}
            <motion.span
              variants={chapterRule}
              className={cn(
                "block h-px w-10 shrink-0 origin-left bg-gold",
                align === "left" && "lg:-ml-16 lg:w-[6.5rem]"
              )}
            />

            {/* The chapter mark: the number set large, the name small beside
                it, on a shared baseline.

                The brief was that a reader should be able to tell which section
                they are in without the label competing with that section's own
                heading. A NUMERAL is how you get both. At 3rem it is the
                second-largest thing in the block and legible at a glance, and
                it still cannot overpower a title, because a number carries no
                sentence for the eye to read. Setting the WORDS larger instead
                would have produced two headings arguing with each other.

                Gold, which is the site's quietest ink on paper — the same
                reason gold is never a body colour here works in reverse for a
                figure this size.

                `type-figure` for lining numerals: Cormorant defaults to
                old-style, where 0 sits at x-height and 1, 3, 4, 7 and 9 hang
                below the baseline, so "01" would set as "o1" with a dropped
                stem. */}
            <span className="flex items-baseline gap-3 sm:gap-4">
              {index && (
                <span className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    variants={chapterItem}
                    className="type-figure block text-[2rem] leading-[0.85] tracking-tight text-gold md:text-[2.5rem] lg:text-[3rem]"
                  >
                    {index}
                  </motion.span>
                </span>
              )}
              {eyebrow && (
                <span className="block overflow-hidden pb-[0.14em]">
                  <motion.span
                    variants={chapterItem}
                    className={cn(
                      // Stepped up from the site's 12px label: small enough to
                      // stay subordinate to the numeral, large enough that the
                      // section's NAME reads at a glance rather than only when
                      // it is looked for.
                      "font-label block text-[0.78rem] tracking-[0.2em] md:text-[0.86rem]",
                      dark ? "text-cream/70" : "text-charcoal/60"
                    )}
                  >
                    {eyebrow}
                  </motion.span>
                </span>
              )}
            </span>

            {/* Mirrored rule, centred headings only. The single left-hand rule
                is what makes the label read as the START of a line, which is
                right when the heading is ranged left and wrong when it is
                centred — there it just makes a symmetrical block look as
                though it has slipped. */}
            {align === "center" && (
              <motion.span
                aria-hidden
                variants={chapterRule}
                className="block h-px w-10 shrink-0 origin-right bg-gold"
              />
            )}
          </span>

          {meta && (
            <motion.span
              variants={chapterItem}
              className={cn(
                "font-label",
                dark ? "text-cream/50" : "text-charcoal/45"
              )}
            >
              {meta}
            </motion.span>
          )}
        </motion.div>
      )}

      {title && (
        <TextReveal
          as="h2"
          text={title}
          className={cn(
            // No weight: every heading on the site is 400, set once in the base
            // layer. See the type-system note in styles/globals.css.
            "font-serif text-4xl leading-[1.2] tracking-tight md:text-5xl lg:text-6xl",
            // The tone's ink only applies when the caller has not overridden
            // it — see the note on `titleClassName`.
            titleClassName ?? (dark ? "text-cream" : "text-emerald")
          )}
        />
      )}

      {description && (
        <motion.p
          className={cn(
            // Size and leading come from the one body-copy rule in
            // styles/globals.css — this used to step up to 18px at `md`, which
            // made the same lead paragraph a different size on every section
            // depending on which breakpoint you happened to be at.
            "max-w-xl",
            dark ? "text-cream/70" : "text-charcoal/70"
          )}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          transition={{ delay: 0.15 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
