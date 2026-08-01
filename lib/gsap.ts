/**
 * Central GSAP configuration.
 *
 * Import { gsap, ScrollTrigger } from this module everywhere instead of the raw
 * "gsap" package so that plugins are registered exactly once and configuration
 * stays in a single place.
 *
 * TODO (future phases): register additional plugins here as they are introduced
 * (e.g. Flip, Observer, SplitText, DrawSVG) and expose a shared defaults config.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Guard against double registration during React fast-refresh / SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Global defaults keep motion feeling calm and intentional across the site.
  gsap.defaults({
    ease: "power3.out",
    duration: 1,
  });

  // TODO: tune ScrollTrigger.config for scroller-proxy sync with Lenis when the
  // cinematic scroll experiences are implemented section-by-section.
}

export { gsap, ScrollTrigger };
