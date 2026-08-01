"use client";

/**
 * useParallax — reusable scroll-scrubbed parallax.
 *
 * Attach the returned ref to the element you want to drift as the user scrolls.
 * The element moves vertically between `from` and `to` (in % of its own height)
 * linked directly to scroll position (scrub), producing continuous, calm depth.
 *
 * IMPORTANT: give the target extra size (e.g. a `scale-110/125` on media, or a
 * height taller than its frame) inside an `overflow-hidden` parent so the drift
 * never exposes an edge.
 *
 * @example
 *   const ref = useParallax<HTMLDivElement>({ from: -12, to: 12 });
 *   <div className="overflow-hidden">
 *     <div ref={ref} className="scale-125"><Media fill … /></div>
 *   </div>
 */
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface ParallaxOptions {
  /** Starting offset in % of element height (negative = starts higher). */
  from?: number;
  /** Ending offset in % of element height. */
  to?: number;
  /**
   * Scrub smoothing. `true` locks 1:1 to scroll; a number adds lag/glide.
   */
  scrub?: boolean | number;
  /** ScrollTrigger start / end window. */
  start?: string;
  end?: string;
}

export function useParallax<T extends HTMLElement = HTMLElement>(
  options: ParallaxOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    from = -12,
    to = 12,
    scrub = 1,
    start = "top bottom",
    end = "bottom top",
  } = options;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [from, to, scrub, start, end]);

  return ref;
}
