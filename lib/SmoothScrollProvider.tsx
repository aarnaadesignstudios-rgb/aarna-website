"use client";

/**
 * SmoothScrollProvider
 *
 * Initialises Lenis smooth scrolling once at the root of the application and
 * synchronises it with GSAP's ScrollTrigger + ticker so that scroll-driven
 * animations stay perfectly in sync with the smoothed scroll position.
 *
 * Wrap the app once (see app/layout.tsx). Individual sections do NOT need to
 * know about Lenis — they simply use ScrollTrigger as usual.
 *
 * A module-level accessor (`smoothScrollTo`) lets any component trigger a
 * smoothed programmatic scroll (e.g. the Works gallery's index buttons) without
 * threading the instance through context.
 *
 * TODO (future phases):
 *  - Add reduced-motion handling to disable smoothing for accessibility.
 */
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Shared handle to the live Lenis instance.
let lenisInstance: Lenis | null = null;

/**
 * Smoothly scroll to a Y position (or element/selector) via Lenis when it is
 * available, falling back to native smooth scroll otherwise.
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  options?: { offset?: number; duration?: number }
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.4,
    });
  } else if (typeof window !== "undefined" && typeof target === "number") {
    window.scrollTo({ top: target + (options?.offset ?? 0), behavior: "smooth" });
  }
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      // Calm, weighted easing — subtle, never bouncy.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    // Drive Lenis from GSAP's ticker for a single unified RAF loop.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      // GSAP ticker time is in seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
