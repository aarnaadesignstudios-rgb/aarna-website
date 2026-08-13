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
import { CustomEase } from "gsap/CustomEase";

/**
 * The site's easing curve, by name.
 *
 * `cubic-bezier(0.22, 1, 0.36, 1)` is already the whole site's motion: it is
 * `--ease-editorial` in styles/globals.css and the `[0.22, 1, 0.36, 1]` array
 * that every framer transition passes. GSAP was the one library using something
 * else (`power3.out`), which is close but not the same — and "close but not the
 * same" is exactly what makes two animations that run side by side, like the
 * intro panel and the masthead sliding in behind it, feel slightly out of step.
 *
 * Registered as a named ease so GSAP tweens can ask for the same curve by name
 * instead of restating the numbers.
 */
export const EASE_EDITORIAL = "editorial";

// Guard against double registration during React fast-refresh / SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // The path is the cubic-bezier written as SVG: the two control points of
  // `cubic-bezier(0.22, 1, 0.36, 1)` are (0.22, 1) and (0.36, 1).
  CustomEase.create(EASE_EDITORIAL, "M0,0 C0.22,1 0.36,1 1,1");

  // Global defaults keep motion feeling calm and intentional across the site.
  gsap.defaults({
    ease: "power3.out",
    duration: 1,
  });

  // TODO: tune ScrollTrigger.config for scroller-proxy sync with Lenis when the
  // cinematic scroll experiences are implemented section-by-section.
}

export { gsap, ScrollTrigger };
