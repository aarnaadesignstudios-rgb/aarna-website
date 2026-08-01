"use client";

/**
 * LayoutTextFlip — Aceternity "Layout Text Flip" effect, adapted for Aarnaa.
 *
 * A static phrase followed by a word that flips through a list on a timer, with
 * a masked vertical slide + blur and a layout animation on the word's box so its
 * width eases between words. Ported from the Aceternity registry to import from
 * our existing `framer-motion` (instead of a duplicate `motion` package) and
 * restyled to the brand — gold italic serif that echoes the logo wordmark, with
 * a hairline gold underline that animates its width as the word changes.
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

interface LayoutTextFlipProps {
  text: string;
  words: string[];
  /** Time each word is shown, in ms. */
  duration?: number;
  /** Shared typography (size / family) applied to both the static + flip text. */
  className?: string;
  /** Extra styling for the flipping word (defaults to gold italic). */
  wordClassName?: string;
}

export default function LayoutTextFlip({
  text,
  words,
  duration = 2600,
  className,
  wordClassName = "italic text-gold",
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
      <span className={className}>{text} </span>

      {/* Flipping word: box width animates (layout) between words. */}
      <motion.span
        layout
        transition={{ layout: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
        className={cn(
          // pb keeps descenders (e.g. the y in "artistry") clear of the clip.
          "relative inline-block w-fit overflow-hidden border-b border-gold/50 pb-[0.12em] align-bottom",
          className,
          wordClassName
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={index}
            initial={{ y: "-110%", filter: "blur(8px)", opacity: 0 }}
            animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "110%", filter: "blur(8px)", opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block whitespace-nowrap"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}
