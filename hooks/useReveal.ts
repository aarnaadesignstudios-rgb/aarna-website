"use client";

/**
 * useReveal — staggered reveal of a group of children on scroll.
 *
 * Attach the returned ref to a container, and give each child you want to
 * animate the attribute `data-reveal`. Children fade + rise in sequence.
 *
 * @example
 *   const ref = useReveal<HTMLUListElement>();
 *   <ul ref={ref}>
 *     <li data-reveal>…</li>
 *     <li data-reveal>…</li>
 *   </ul>
 */
import { useRef } from "react";
// Importing from lib/gsap also registers ScrollTrigger as a side-effect.
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface RevealOptions {
  /** Selector for the children to stagger. */
  selector?: string;
  /** Time between each child, in seconds. */
  stagger?: number;
  y?: number;
  duration?: number;
  start?: string;
}

export function useReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    selector = "[data-reveal]",
    stagger = 0.12,
    y = 40,
    duration = 0.9,
    start = "top 80%",
  } = options;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll(selector);
      if (!targets.length) return;

      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        stagger,
        scrollTrigger: { trigger: el, start },
      });
    }, ref);

    return () => ctx.revert();
  }, [selector, stagger, y, duration, start]);

  return ref;
}
