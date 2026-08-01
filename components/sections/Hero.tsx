"use client";

/**
 * Hero — full-viewport opening statement, carried by the work itself.
 *
 * The studio's own projects cross-dissolve through the full frame (see
 * <ImageCycle />) with no copy over them, so the first thing a visitor reads is
 * the architecture. Branding is left to the floating navbar, and the brand
 * statement now opens <Practice /> as that section's title.
 *
 * Entrance:  fade + scale (Framer) on mount.
 * On scroll: the image stack drifts down and scales (scrubbed parallax), giving
 *            the hero depth and a sense of "handing off" to the next section.
 *
 * TODO (future phases):
 *  - Pin the hero and cross-dissolve into Practice for a seamless transition.
 */
import { motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

import { ImageCycle, PageContainer, Spotlight } from "@/components/ui";
import { fadeScale } from "@/animations/variants";
import { HERO_SLIDES, INTRO } from "@/constants";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Shared scrubbed timeline mapped to scrolling through the hero.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Image drifts down + scales up for parallax depth.
      tl.to(
        "[data-hero-image]",
        { yPercent: 18, scale: 1.12, ease: "none" },
        0
      );

      // Scroll indicator fades out almost immediately.
      tl.to("[data-hero-indicator]", { opacity: 0, ease: "none" }, 0);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex h-screen min-h-[640px] w-full items-end overflow-hidden text-cream"
    >
      {/* Background imagery.
          Outer div = GSAP scroll parallax target (transform).
          Inner motion.div = Framer entrance (transform) — kept on separate
          elements so the two libraries never write the same transform, and the
          frames inside own only their own dissolve + drift. */}
      <div
        data-hero-image
        className="absolute inset-0 will-change-transform"
      >
        <motion.div
          className="absolute inset-0"
          variants={fadeScale}
          initial="hidden"
          animate="visible"
        >
          {/* The imagery begins as the intro curtain starts to lift, so the
              hero is already in motion the moment it is uncovered — and the
              opening frame gets its full time on screen. */}
          <ImageCycle frames={HERO_SLIDES} startDelayMs={INTRO.holdMs} />
        </motion.div>
      </div>

      {/* Legibility scrims. With no statement to carry, these stay at the edges
          only — enough for the glass navbar and the scroll cue to hold against
          a bright frame, while the work itself reads at full contrast.
          Deliberately outside the parallax wrapper so they don't drift away
          from the edges they exist to protect. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-64 bg-linear-to-b from-charcoal/80 via-charcoal/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-linear-to-t from-charcoal/75 via-charcoal/25 to-transparent" />

      {/* Animated gold spotlight wash for depth. */}
      <Spotlight />

      {/* Editorial meta — top corners, quiet and confident. The soft shadow
          keeps it readable when a frame is bright behind it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden md:block">
        <PageContainer className="flex items-center justify-between pt-36 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/75 [text-shadow:0_1px_14px_rgba(9,22,16,0.7)]">
          <span>Est. 2008</span>
          <span>Gurugram · India</span>
        </PageContainer>
      </div>

      {/* Animated scroll indicator */}
      <motion.a
        href="#practice"
        data-hero-indicator
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.span
          className="flex flex-col items-center gap-2 text-cream/90 [text-shadow:0_1px_14px_rgba(9,22,16,0.7)]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
            Scroll
          </span>
          <FiArrowDown size={18} />
        </motion.span>
      </motion.a>
    </section>
  );
}
