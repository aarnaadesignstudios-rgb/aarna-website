"use client";

/**
 * FaqList — the questions, as an accordion.
 *
 * ── Why an accordion and not eleven open blocks ───────────────────────────
 *
 * Eleven questions with their answers all open is roughly four screens of
 * uninterrupted body copy, and a visitor looking for one specific answer has
 * to read past ten they do not care about. Collapsed, the whole set is a
 * single scannable index — which is the shape an FAQ actually wants.
 *
 * ── Implementation notes ──────────────────────────────────────────────────
 *
 * Several open at once, not one-at-a-time. An FAQ is a reference, and closing
 * someone's previous answer because they opened a second one is hostile when
 * they may well be comparing the two.
 *
 * The panel animates `grid-template-rows: 0fr → 1fr` rather than `max-height`.
 * A max-height transition needs a magic number larger than any real answer,
 * which makes the close always run at the wrong speed and clips anything that
 * exceeds the guess. The grid version opens to the copy's true height.
 *
 * `hidden` is deliberately NOT used on the collapsed panel and neither is
 * `display: none` — the content stays in the DOM and in the accessibility
 * tree, so in-page find (⌘F) still locates an answer inside a closed
 * question, and the `aria-expanded` / `aria-controls` pair tells a screen
 * reader what state it is in.
 */
import { useState } from "react";
import { motion } from "framer-motion";

import { fadeUp, staggerContainer, VIEWPORT_ONCE } from "@/animations/variants";
import { cn } from "@/utils/cn";
import type { Faq } from "@/types";

interface FaqListProps {
  items: Faq[];
  className?: string;
}

export default function FaqList({ items, className }: FaqListProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpen((prev) => {
      // A new Set, not a mutation: React compares by reference, and mutating
      // the existing one would not re-render.
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <motion.ul
      className={cn("list-none border-t border-emerald/15 p-0", className)}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      {items.map((faq, i) => {
        const isOpen = open.has(faq.id);
        return (
          <motion.li
            key={faq.id}
            variants={fadeUp}
            className="border-b border-emerald/15"
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-${faq.id}`}
              className="group flex w-full cursor-pointer items-baseline gap-5 py-7 text-left md:gap-8"
            >
              <span className="shrink-0 font-label text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="flex-1 font-serif text-xl leading-[1.3] text-emerald transition-colors duration-500 group-hover:text-emerald/70 md:text-2xl">
                {faq.question}
              </span>

              {/* A plus that becomes a minus. Two rules and a rotation rather
                  than an icon swap, so the change is a single continuous
                  movement instead of one glyph replacing another. */}
              <span
                aria-hidden
                className="relative mt-2 block size-3.5 shrink-0"
              >
                <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-gold" />
                <span
                  className={cn(
                    "absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-gold transition-transform duration-500 ease-editorial",
                    isOpen ? "rotate-90" : "rotate-0"
                  )}
                />
              </span>
            </button>

            <div
              id={`faq-${faq.id}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-600 ease-editorial",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                {/* The measure is held well short of the container: an answer
                    running the full 1440px would be ~160 characters a line,
                    which is roughly twice a comfortable read. */}
                <p className="mb-8 max-w-[68ch] pl-[calc(1.5rem+11px)] text-charcoal/70 md:pl-[calc(2rem+11px)] md:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
