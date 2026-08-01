"use client";

/**
 * useFadeUp — reusable scroll-triggered fade + rise for any element.
 *
 * Returns a ref to attach to the target. When the element scrolls into view it
 * animates from (opacity 0, y offset) to its resting state, once.
 *
 * This is the workhorse entrance for GSAP-driven sections. It is intentionally
 * minimal — richer, timeline-based motion will be layered on per section later.
 *
 * @example
 *   const ref = useFadeUp<HTMLDivElement>();
 *   return <div ref={ref}>…</div>;
 */
import { useRef } from "react";
// Importing from lib/gsap also registers ScrollTrigger as a side-effect.
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface FadeUpOptions {
  /** Vertical offset to rise from, in px. */
  y?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Delay before starting, in seconds. */
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
}

export function useFadeUp<T extends HTMLElement = HTMLElement>(
  options: FadeUpOptions = {}
) {
  const ref = useRef<T>(null);
  const { y = 40, duration = 1, delay = 0, start = "top 85%" } = options;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // gsap.context scopes selectors and auto-reverts on cleanup (StrictMode-safe).
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y,
        duration,
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          // TODO: add `toggleActions` / `scrub` variants when sections need them.
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [y, duration, delay, start]);

  return ref;
}
