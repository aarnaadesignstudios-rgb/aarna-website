"use client";

/**
 * Hero — full-viewport opening, carried by the work itself.
 *
 * The studio's projects cross-dissolve through the full frame (see
 * <ImageCycle />) with no statement over them, so the first thing a visitor
 * reads is the architecture. Branding is left to the masthead, and the brand
 * statement opens <Practice /> as that section's title.
 *
 * ── Changed in the client review ──────────────────────────────────────────
 *
 *  - The four projects the studio wants on the opening screen are now the
 *    cycle, in the order supplied: AWC, Cha and Co, Kapali Mall, Sobha
 *    Residence. (Imagery is still placeholder — see the note on HERO_SLIDES.)
 *  - Each frame is captioned with its project name. Without it "show these
 *    projects in view" is not actually legible to a visitor: four anonymous
 *    interiors go past and none of them is identified as anything.
 *  - "Est. 2008" was wrong everywhere on the site and is now `SITE.founded`,
 *    so the year is stated in exactly one place.
 *  - The top scrim is gone. The masthead now sits on its own opaque panel, so
 *    there is nothing left up there that needs protecting from a bright frame.
 *
 * Entrance:  fade + scale (Framer) on mount.
 * On scroll: the image stack drifts down and scales (scrubbed parallax), giving
 *            the hero depth and a sense of handing off to the next section.
 */
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

import { ImageCycle, PageContainer, Spotlight } from "@/components/ui";
import { fadeScale } from "@/animations/variants";
import { HERO_SLIDES, INTRO, SITE } from "@/constants";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState(0);

  // Stable, so <ImageCycle /> never rebuilds its interval on a re-render.
  const onFrameChange = useCallback((i: number) => setFrame(i), []);

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
      tl.to("[data-hero-image]", { yPercent: 18, scale: 1.12, ease: "none" }, 0);
      // Scroll indicator fades out almost immediately.
      tl.to("[data-hero-indicator]", { opacity: 0, ease: "none" }, 0);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const current = HERO_SLIDES[frame] ?? HERO_SLIDES[0];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex h-screen min-h-[640px] w-full items-end overflow-hidden bg-emerald-deep text-cream"
    >
      {/* Background imagery.
          Outer div = GSAP scroll parallax target (transform).
          Inner motion.div = Framer entrance (transform) — kept on separate
          elements so the two libraries never write the same transform. */}
      <div data-hero-image className="absolute inset-0 will-change-transform">
        <motion.div
          className="absolute inset-0"
          variants={fadeScale}
          initial="hidden"
          animate="visible"
        >
          {/* The imagery begins as the intro screen starts to dissolve, so the
              hero is already in motion the moment it is uncovered.

              Cadence: hold + dissolve = 3800 + 900 = 4.7s per frame. Slower
              than the previous 2.5s: at that rate the hero cut between rooms
              faster than a visitor could take one in, which reads as a
              slideshow rather than as a held shot. */}
          <ImageCycle
            frames={HERO_SLIDES}
            startDelayMs={INTRO.holdMs}
            holdMs={3800}
            fadeMs={900}
            onFrameChange={onFrameChange}
          />
        </motion.div>
      </div>

      {/* Bottom legibility scrim, for the meta row and the scroll cue. The old
          top scrim is gone — the masthead has its own panel now. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-linear-to-t from-emerald-deep/80 via-emerald-deep/25 to-transparent" />

      {/* Animated gold spotlight wash for depth. */}
      <Spotlight />

      {/* Editorial meta — top corners, below the masthead panel. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden md:block">
        {/* pt clears the masthead's resting height with room to spare. */}
        <PageContainer className="flex items-center justify-between pt-28 font-label text-[12px] uppercase tracking-[0.18em] text-cream/80 [text-shadow:0_1px_14px_rgba(6,41,28,0.7)]">
          <span>Est. {SITE.founded}</span>
          <span>Gurugram · India</span>
        </PageContainer>
      </div>

      {/* Project caption — names the work currently on screen. Keyed on the
          frame id so it re-enters on every change rather than swapping text
          in place, which reads as a glitch at this size. */}
      {/* pb clears the scroll cue, which is centred at the bottom of the same
          screen — on a narrow phone the caption and the cue are only ~25px
          apart horizontally, so they have to be separated vertically instead. */}
      <PageContainer className="relative z-20 pb-28 md:pb-24">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md"
        >
          <span className="block font-label text-[12px] uppercase tracking-[0.18em] text-gold [text-shadow:0_1px_14px_rgba(6,41,28,0.8)]">
            Selected work
          </span>
          <span className="mt-2.5 block font-serif text-3xl leading-none tracking-tight text-cream [text-shadow:0_1px_18px_rgba(6,41,28,0.8)] md:text-4xl">
            {current?.title}
          </span>
        </motion.div>
      </PageContainer>

      {/* Animated scroll indicator */}
      <motion.a
        href="#practice"
        data-hero-indicator
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: INTRO.clearedMs / 1000, duration: 0.8 }}
      >
        <motion.span
          className="flex flex-col items-center gap-2 text-cream/90 [text-shadow:0_1px_14px_rgba(6,41,28,0.7)]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-label text-[12px] uppercase tracking-[0.18em]">
            Scroll
          </span>
          <FiArrowDown size={18} />
        </motion.span>
      </motion.a>
    </section>
  );
}
