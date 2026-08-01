"use client";

/**
 * TextReveal — the signature editorial headline animation.
 *
 * Splits text into words, each masked inside an overflow-hidden wrapper, and
 * reveals them with a staggered upward slide as the element scrolls into view.
 * Multi-line supported via "\n". Words still wrap responsively (spaces are real
 * text nodes between the masks). Accessible: the full text is exposed via
 * aria-label; animated words are aria-hidden.
 *
 * The premium replacement for a plain heading — use for section titles and the
 * hero statement.
 *
 * @example
 *   <TextReveal as="h2" text={"Spaces that hold\nlight and silence"}
 *               className="font-serif text-6xl" />
 */
import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";

import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/animations/variants";
import { cn } from "@/utils/cn";

// Fixed set of motion tags so we never call motion.create() during render.
const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  div: motion.div,
  span: motion.span,
} as const;

type TagName = keyof typeof MOTION_TAGS;

interface TextRevealProps {
  text: string;
  as?: TagName;
  className?: string;
  /** Delay before the first word, in seconds. */
  delay?: number;
  /** Time between words, in seconds. */
  stagger?: number;
  /** Animate on mount instead of on scroll-into-view. */
  animateOnMount?: boolean;
}

const container = (delay: number, stagger: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const word: Variants = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE_EDITORIAL } },
};

export default function TextReveal({
  text,
  as = "div",
  className,
  delay = 0,
  stagger = 0.06,
  animateOnMount = false,
}: TextRevealProps) {
  const MotionTag = MOTION_TAGS[as];
  const lines = text.split("\n");

  const activation = animateOnMount
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: VIEWPORT_ONCE };

  return (
    <MotionTag
      className={cn("block", className)}
      aria-label={text.replace(/\n/g, " ")}
      variants={container(delay, stagger)}
      initial="hidden"
      {...activation}
    >
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="block">
            {words.map((w, wi) => (
              <Fragment key={wi}>
                {/* Per-word mask; overflow-hidden clips the vertical slide. */}
                <span
                  aria-hidden
                  className="inline-block overflow-hidden align-top"
                >
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
                {/* Real space between masks keeps responsive wrapping intact. */}
                {wi < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        );
      })}
    </MotionTag>
  );
}
