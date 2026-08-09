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
import { motion } from "framer-motion";

import { fadeUp, VIEWPORT_ONCE } from "@/animations/variants";
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
            "flex flex-wrap items-center gap-x-6 gap-y-2",
            meta ? "justify-between" : "",
            align === "center" && "justify-center"
          )}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <span className="flex items-center gap-3.5">
            {/* Gold hairline — opens every section on the site. */}
            <span className="block h-px w-10 shrink-0 bg-gold" />
            <span className="font-label text-[12px] uppercase tracking-[0.18em]">
              {index && <span className="text-gold">{index}</span>}
              {index && eyebrow && (
                <span className={dark ? "text-cream/40" : "text-charcoal/35"}>
                  {" "}
                  &mdash;{" "}
                </span>
              )}
              {eyebrow && (
                <span className={dark ? "text-cream/55" : "text-charcoal/55"}>
                  {eyebrow}
                </span>
              )}
            </span>
          </span>

          {meta && (
            <span
              className={cn(
                "font-label text-[12px] uppercase tracking-[0.14em]",
                dark ? "text-cream/50" : "text-charcoal/45"
              )}
            >
              {meta}
            </span>
          )}
        </motion.div>
      )}

      {title && (
        <TextReveal
          as="h2"
          text={title}
          className={cn(
            "font-serif text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl",
            // The tone's ink only applies when the caller has not overridden
            // it — see the note on `titleClassName`.
            titleClassName ?? (dark ? "text-cream" : "text-emerald")
          )}
        />
      )}

      {description && (
        <motion.p
          className={cn(
            "max-w-xl text-base leading-[1.75] md:text-lg",
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
