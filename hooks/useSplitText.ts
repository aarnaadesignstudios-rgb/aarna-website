"use client";

/**
 * useSplitText — lightweight word-by-word text reveal.
 *
 * Attach the returned ref to a text element (heading/paragraph). On mount the
 * hook splits the text into word spans and animates them up into view with a
 * masked stagger — the classic editorial headline reveal.
 *
 * This is a dependency-free placeholder implementation. GSAP 3.13 ships a full
 * SplitText plugin for free; swap this internal splitter for it when per-line
 * and per-character control is needed.
 *
 * TODO (future phases):
 *  - Replace manual splitter with GSAP SplitText (lines + chars).
 *  - Add ScrollTrigger so long-form paragraphs reveal on scroll, not on mount.
 *  - Preserve original markup / accessibility (aria-label with full text).
 */
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface SplitTextOptions {
  stagger?: number;
  duration?: number;
  y?: string;
  delay?: number;
}

export function useSplitText<T extends HTMLElement = HTMLElement>(
  options: SplitTextOptions = {}
) {
  const ref = useRef<T>(null);
  const { stagger = 0.04, duration = 0.9, y = "110%", delay = 0 } = options;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const original = el.textContent ?? "";
    // Accessibility: expose the full string to assistive tech.
    el.setAttribute("aria-label", original);

    const words = original.split(/(\s+)/);

    // Rebuild the element with each word wrapped in a masked span.
    el.textContent = "";
    const wordEls: HTMLElement[] = [];

    words.forEach((word) => {
      if (word.trim() === "") {
        el.appendChild(document.createTextNode(word));
        return;
      }
      const mask = document.createElement("span");
      mask.style.display = "inline-block";
      mask.style.overflow = "hidden";
      mask.style.verticalAlign = "top";
      mask.setAttribute("aria-hidden", "true");

      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.textContent = word;

      mask.appendChild(inner);
      el.appendChild(mask);
      wordEls.push(inner);
    });

    const ctx = gsap.context(() => {
      gsap.from(wordEls, {
        yPercent: parseFloat(y),
        duration,
        delay,
        stagger,
        ease: "power4.out",
      });
    }, ref);

    return () => {
      ctx.revert();
      // Restore the original plain text on cleanup.
      el.textContent = original;
    };
  }, [stagger, duration, y, delay]);

  return ref;
}
