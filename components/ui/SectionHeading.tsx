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
 *   • the section INDEX is set in gold mono — the numbers run 01…10 down the
 *     page, so the site reads as one curated document rather than a stack of
 *     unrelated blocks
 *   • the eyebrow is mono small-caps (the "spec-sheet" cue used for every
 *     technical label on the site), not another sans-serif shout
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
            <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
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
                "font-mono text-[10px] uppercase tracking-[0.14em]",
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
            dark ? "text-cream" : "text-emerald"
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
