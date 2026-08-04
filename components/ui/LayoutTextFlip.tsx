"use client";

/**
 * LayoutTextFlip — a static phrase followed by a word that flips through a list
 * on a timer, with a masked vertical slide + blur. Adapted from Aceternity's
 * "Layout Text Flip" and restyled to the brand: gold italic serif echoing the
 * logo wordmark, under a hairline gold rule.
 *
 * ── Reflow is the caller's constraint, not this component's ───────────────────
 *
 * The word's box hugs whichever word is showing and eases between widths
 * (Framer's `layout`). That means the line length changes on every flip, so in a
 * headline that is already near the end of its line the heading reflows onto a
 * second line and back on a timer — visibly jumping between one and two lines
 * while the reader is looking at it.
 *
 * Fixing that HERE was tried and is worse: pinning the box to the longest word
 * holds the line length constant, but then every shorter word sits centred in a
 * box sized for "imagination" — a ~110px hole after the preceding word at
 * display sizes, with the gold rule hanging out past the word. Stable, and
 * unmistakably broken-looking.
 *
 * So the box stays natural and the constraint belongs to the caller, which has
 * two ways to meet it:
 *
 *  1. Give the line room for the LONGEST word, and it can never wrap whichever
 *     word is up. `longestWord` is exported for exactly that check.
 *  2. Where there isn't room — narrow viewports, big type — use
 *     `phraseClassName` to make the static phrase a block (`"block lg:inline"`).
 *     The word then always starts its own line, so the phrase's wrapping stops
 *     depending on the word's width and the line count is constant again.
 *
 * See the note at the top of <Practice />, which uses (1) at lg and (2) below it.
 *
 * Source: https://ui.aceternity.com/components/layout-text-flip
 *
 * @example
 *   <LayoutTextFlip
 *     text="Design is the brand of our"
 *     words={["creativity", "imagination", "innovation"]}
 *   />
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/utils/cn";
import { EASE_EDITORIAL } from "@/animations/variants";

/**
 * How far the mask is padded out past the word on each side, in em so it tracks
 * the type size. Sized for the widest overhang in the brand's italic display
 * face (Bodoni Moda's "y" swash); generous rather than exact, since the padding
 * is cancelled by an equal negative margin and so costs no layout width.
 */
const MASK_PAD = "0.22em";

/**
 * The word that will make the line longest — the one a caller has to leave room
 * for if the headline must not wrap.
 *
 * Longest by rendered width, not character count: in a proportional face "wm" is
 * wider than "illlll". Measuring exactly would need the loaded font, so this
 * weights the obviously narrow and obviously wide glyphs and otherwise counts
 * characters, which is enough to choose between a handful of candidates.
 */
export function longestWord(words: string[]): string {
  const weigh = (w: string) =>
    [...w].reduce(
      (sum, ch) =>
        sum + ("ilj|!.,'".includes(ch) ? 0.4 : "mwMW".includes(ch) ? 1.6 : 1),
      0
    );
  return words.reduce(
    (widest, w) => (weigh(w) > weigh(widest) ? w : widest),
    words[0] ?? ""
  );
}

interface LayoutTextFlipProps {
  text: string;
  words: string[];
  /** Time each word is shown, in ms. */
  duration?: number;
  /** Shared typography (size / family) applied to both the static + flip text. */
  className?: string;
  /** Extra styling for the flipping word (defaults to gold italic). */
  wordClassName?: string;
  /**
   * Extra styling for the static phrase. Pass `"block lg:inline"` to force the
   * word onto its own line at widths where the line can't hold the longest word
   * — see the reflow note above.
   */
  phraseClassName?: string;
}

export default function LayoutTextFlip({
  text,
  words,
  duration = 2600,
  className,
  wordClassName = "italic text-gold",
  phraseClassName,
}: LayoutTextFlipProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <span className="inline">
      {/* Static phrase */}
      <span className={cn(className, phraseClassName)}>{text} </span>

      {/* Flipping word. The box eases between each word's own width, and the
          gold rule under it is exactly as wide as the word showing.
          The mask is a separate inner element — see MASK_PAD below. */}
      <motion.span
        layout
        transition={{ layout: { duration: 0.65, ease: EASE_EDITORIAL } }}
        className={cn(
          "relative inline-block w-fit border-b border-gold/50 align-bottom",
          className,
          wordClassName
        )}
      >
        {/**
         * The mask clips the vertical slide, and must NOT clip horizontally.
         *
         * `overflow: hidden` applies to both axes — CSS gives no way to hide one
         * and leave the other visible (a `visible` value alongside `hidden`
         * computes to `auto`, which would add a scroll container). And an italic
         * face routinely draws outside its advance width: Bodoni Moda's italic
         * "y" throws a swash to the right that reaches past the box, so a mask
         * sized to the text cut the tail off "artistry" and "creativity" with a
         * hard vertical edge.
         *
         * So the mask is padded horizontally and pulled back by the same amount
         * in margin. The clip boundary moves outside the glyphs' ink while the
         * element's margin box — and therefore the parent's `w-fit` width and the
         * gold rule under it — still measures exactly the word.
         */}
        <span
          className="block overflow-hidden pb-[0.12em]"
          style={{
            paddingInline: MASK_PAD,
            marginInline: `calc(-1 * ${MASK_PAD})`,
          }}
        >
          {/* `initial={false}`: the first word is already on screen when the
              heading fades in, so it should not also slide up out of nowhere. */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={index}
              initial={{ y: "-110%", filter: "blur(8px)", opacity: 0 }}
              animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
              exit={{ y: "110%", filter: "blur(8px)", opacity: 0 }}
              transition={{ duration: 0.65, ease: EASE_EDITORIAL }}
              className="inline-block whitespace-nowrap"
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.span>
    </span>
  );
}
