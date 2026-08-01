"use client";

/**
 * useImageReveal — cinematic image reveal primitive.
 *
 * Attach the returned ref to an image WRAPPER (a positioned container with
 * `overflow-hidden` holding a next/image fill). On scroll into view the wrapper
 * "uncovers" the image via a clip-path/scale combination while the inner media
 * settles from a slight zoom — the signature architectural-magazine reveal.
 *
 * Mark the inner media element with `data-image` so the hook can scale it
 * independently of the mask.
 *
 * @example
 *   const ref = useImageReveal<HTMLDivElement>();
 *   <div ref={ref} className="relative overflow-hidden">
 *     <Image data-image fill ... />
 *   </div>
 */
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface ImageRevealOptions {
  /** Selector for the inner media to counter-scale. */
  mediaSelector?: string;
  duration?: number;
  start?: string;
}

export function useImageReveal<T extends HTMLElement = HTMLElement>(
  options: ImageRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    mediaSelector = "[data-image]",
    duration = 1.2,
    start = "top 85%",
  } = options;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const media = el.querySelector(mediaSelector);

      // Mask uncovers from bottom to top.
      gsap.from(el, {
        clipPath: "inset(100% 0% 0% 0%)",
        duration,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start },
      });

      // Inner media eases out of a subtle zoom for depth.
      if (media) {
        gsap.from(media, {
          scale: 1.25,
          duration: duration + 0.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start },
        });
      }

      // TODO (future phases): upgrade to a scrubbed parallax reveal and add a
      //       shared SplitText caption reveal that fires with the mask.
    }, ref);

    return () => ctx.revert();
  }, [mediaSelector, duration, start]);

  return ref;
}
