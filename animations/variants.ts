/**
 * Reusable Framer Motion variants.
 *
 * These are the shared, tasteful entrance motions used by lightweight
 * components. Heavier, scroll-driven cinematic sequences live in GSAP hooks
 * (see /hooks). Keep motion calm: short distances, soft easing, no bounce.
 *
 * TODO (future phases): add variants for staggered galleries, marquee reveals
 *       and page transitions once those experiences are designed.
 */
import type { Variants } from "framer-motion";

/** Calm editorial easing curve reused across variants. */
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

/** Fade + rise. The default entrance for text blocks and small elements. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_EDITORIAL },
  },
};

/** Simple opacity fade with no movement. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_EDITORIAL },
  },
};

/** Subtle fade + scale — used for hero media and imagery. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: EASE_EDITORIAL },
  },
};

/**
 * Stagger container. Pair with `fadeUp` children to sequence a group.
 * Usage: parent uses `staggerContainer`, children use `fadeUp`.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/** Shared viewport config so sections trigger consistently on scroll. */
export const VIEWPORT_ONCE = { once: true, amount: 0.3 } as const;
