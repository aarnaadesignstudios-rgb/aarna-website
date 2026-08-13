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
 * ── The opening screen moves now ──────────────────────────────────────────
 *
 * The brief was that the hero should be fast and dynamic enough to catch
 * someone in the first second, and that it should carry that with the work
 * rather than with a headline — this section stays wordless apart from the
 * project's name. Four things do it, and none of them adds any type:
 *
 *  1. A CUT, not a fade. Frames now WIPE: the incoming project is uncovered
 *     from the right edge leftward while its own content slides the other way,
 *     with a champagne hairline riding the moving edge. An eye tracks an edge;
 *     it does not track a change in opacity, which is why the old cross-dissolve
 *     read as still even though something was always happening.
 *  2. A faster cadence — 1.4s hold + 0.62s wipe, so a project every two
 *     seconds instead of every 2.5, and four projects seen inside eight.
 *  3. LAYERS. The photograph, the scrim, the corner meta and the caption are
 *     each scrubbed at their own rate as the hero scrolls away, so the screen
 *     comes apart in depth instead of sliding off as one flat picture.
 *  4. The caption is on a mask and slides up through it on every cut, and a row
 *     of ticks under it fills across the frame's time on screen — so the screen
 *     is visibly counting, and a visitor can see that there is more coming.
 *
 * Entrance:  fade + scale (Framer) on mount.
 * On scroll: the layers above, scrubbed against the hero's own height.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

import { ImageCycle, PageContainer, SmoothLink } from "@/components/ui";
import { fadeScale } from "@/animations/variants";
import { HERO_SLIDES, INTRO, SITE } from "@/constants";
import { gsap } from "@/lib/gsap";
import { introDelay, introHasPlayed, onIntroCleared } from "@/lib/intro";
import { useIsomorphicLayoutEffect } from "@/hooks";

/** The scroll cue both animates and scrolls, so it needs to be both. */
const MotionSmoothLink = motion.create(SmoothLink);

/**
 * The cycle's cadence.
 *
 * Named here rather than passed inline because the tick row below has to fill
 * over exactly one frame's life — `HOLD + WIPE` — and a caption row that
 * finishes a beat before or after the cut is the one way this reads as broken.
 * One pair of numbers, two consumers.
 */
const HOLD_MS = 1400;
const WIPE_MS = 620;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState(0);

  /**
   * ── The hero holds still until the loader hands over ────────────────────
   *
   * <LoadingScreen /> shows THIS section's first frame inside a window and opens
   * that window to full-bleed, so the frame underneath has to be in exactly the
   * pose the loader is showing — which means not drifting yet.
   *
   * It is a signal rather than a delay because the loader's reveal is not on a
   * fixed clock: it waits for the photograph, up to `INTRO.revealWaitCapMs`. An
   * earlier version timed this off `clearedMs` and the two copies of the same
   * picture drifted apart by ~6% whenever that wait was used — a visible jump at
   * the handover. The timeout below is only a fallback for the case where the
   * signal never arrives at all, set past the latest the loader could finish.
   */
  const [handedOver, setHandedOver] = useState(introHasPlayed);
  useEffect(() => {
    if (handedOver) return;
    return onIntroCleared(() => setHandedOver(true));
  }, [handedOver]);

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

      // ── Four layers, four rates ────────────────────────────────────────
      // Depth is a difference in speed, so these numbers only mean anything
      // relative to each other: the photograph is the slowest and furthest
      // back, the caption is the fastest and closest, and the scrim between
      // them thickens as the two separate. Getting them all onto one scrubbed
      // timeline (rather than four triggers) is what keeps them from drifting
      // out of step at different scroll velocities.
      tl.to("[data-hero-image]", { yPercent: 18, scale: 1.12, ease: "none" }, 0);
      // The scrim starts at 78% (see its class) and closes to full as the
      // caption travels up through it, so the type keeps its contrast on the
      // way out instead of thinning against a brightening photograph.
      tl.to("[data-hero-scrim]", { opacity: 1, ease: "none" }, 0);
      tl.to("[data-hero-meta]", { y: -70, opacity: 0, ease: "none" }, 0);
      tl.to("[data-hero-caption]", { y: -130, opacity: 0.15, ease: "none" }, 0);
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
      /* `data-chrome="dark"` tells the masthead what it is floating over.
         The bar is real glass now, so it has no opinion of its own about
         ink colour — it reads this attribute off whatever band is behind it
         and flips its own palette to suit. Light is the default; only dark
         bands declare themselves. See components/layout/Navbar.tsx. */
      data-chrome="dark"
      className="relative flex h-screen min-h-[640px] w-full items-end overflow-hidden bg-ink text-cream"
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

              Cadence: hold + wipe = 1400 + 620 = ~2s per frame. It has come
              down twice — 4.7s originally, then 2.5s at the studio's request,
              and now this. Two seconds is about the floor for a photograph of
              a room: the frame still has to be legible as a space, and its
              Ken Burns move has to be readable as a move, both of which stop
              being true somewhere under 1.8s. */}
          <ImageCycle
            frames={HERO_SLIDES}
            /* Released by the loader's own completion, not by a clock — see
               `handedOver` above. The fallback is deliberately later than the
               latest the loader could possibly finish. */
            startDelayMs={
              handedOver
                ? 0
                : INTRO.clearedMs + INTRO.revealWaitCapMs + 300
            }
            holdMs={HOLD_MS}
            fadeMs={WIPE_MS}
            transition="wipe"
            onFrameChange={onFrameChange}
          />
        </motion.div>
      </div>

      {/* ── Legibility, and nothing else ──────────────────────────────────
          This was a GREEN gradient (`from-emerald-deep/80`) plus an animated
          gold <Spotlight /> wash. Together they put a green cast over the
          lower half of every hero frame and a gold haze over the rest, so a
          daylit interior arrived looking like it had been shot through a
          bottle. That tint was doing more to cheapen the opening screen than
          any layout decision on the page.

          A scrim exists to darken, not to colour. This one is neutral ink,
          and the gold wash is gone entirely — the photograph now supplies all
          of the colour in the hero, which is the whole argument of the
          section. */}
      <div
        data-hero-scrim
        className="scrim-hero pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[62vh] opacity-[0.78]"
      />
      {/* A short top scrim as well: the masthead floats inset now rather than
          sitting on a full-width bar, so the page edge behind it is live
          photograph again and needs settling. */}
      <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 z-10 h-44" />

      {/* Editorial meta — top corners, below the masthead panel. */}
      <div
        data-hero-meta
        className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden md:block"
      >
        {/* pt clears the masthead's resting height with room to spare. */}
        <PageContainer className="flex items-center justify-between pt-28 font-label text-cream/80 [text-shadow:0_1px_16px_rgba(10,10,9,0.75)]">
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
        {/* The parallax hook is on this element rather than on <PageContainer />,
            which takes only `className` and `as` and would silently drop a
            data attribute. */}
        <div data-hero-caption className="max-w-md">
          {/* The eyebrow does not change, so it does not move. Re-animating a
              constant string on every cut is how a caption starts to read as a
              loading state rather than as a label. */}
          <span className="block font-label text-gold [text-shadow:0_1px_18px_rgba(10,10,9,0.8)]">
            Selected work
          </span>

          {/* ── The name, on a mask ────────────────────────────────────────
              `overflow-hidden` on the wrapper with the name translated from
              108% inside it: the title rises out of the bottom edge of its own
              line rather than fading in on the spot. That is the difference
              between a label being replaced and a label being TURNED — and at
              this size a cross-fade between two different words reads as a
              glitch, because for 300ms both are legible at once.

              Keyed on the frame id so it re-enters on every cut. `leading-[1.1]`
              rather than `leading-none`: a mask cropped to the line box clips
              the descender on "Cha and Co" and "Sobha Residence", and the extra
              tenth of an em is what the mask needs in order to be invisible. */}
          <span className="mt-2 block overflow-hidden pb-1.5">
            <motion.span
              key={current?.id}
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="block font-serif text-3xl leading-[1.1] tracking-tight text-cream [text-shadow:0_1px_20px_rgba(10,10,9,0.8)] md:text-4xl"
            >
              {current?.title}
            </motion.span>
          </span>

          {/* ── The ticks ──────────────────────────────────────────────────
              One rule per project, the current one filling gold across exactly
              that frame's time on screen (see HOLD_MS / WIPE_MS).

              It earns its place by answering the question the wordless hero
              otherwise leaves open — is this a slideshow, and how much of it
              is left? A visitor can see the fill crossing and knows another
              project is coming, which is most of what keeps someone on an
              opening screen for a second cut.

              The filling bar is keyed on the frame, so it unmounts and
              re-mounts from zero width on every change rather than trying to
              animate backwards. */}
          <span
            aria-hidden
            className="mt-6 flex items-center gap-2 [text-shadow:none]"
          >
            {HERO_SLIDES.map((slide, i) => (
              <span
                key={slide.id}
                className="relative block h-px w-8 overflow-hidden bg-cream/30 md:w-9"
              >
                {i === frame && (
                  <motion.span
                    key={`fill-${slide.id}`}
                    className="absolute inset-y-0 left-0 block bg-gold"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: (HOLD_MS + WIPE_MS) / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </span>
            ))}
          </span>
        </div>
      </PageContainer>

      {/* Animated scroll indicator */}
      <MotionSmoothLink
        href="#practice"
        /* The cue says "scroll", so it scrolls. Every other link on the site
           lets the distance choose between a glide and a chapter card; this is
           the one place where the travel itself is the promise being made. */
        travel="scroll"
        data-hero-indicator
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: introDelay(INTRO.clearedMs), duration: 0.8 }}
      >
        <motion.span
          className="flex flex-col items-center gap-2 text-cream/90 [text-shadow:0_1px_16px_rgba(10,10,9,0.75)]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-label">
            Scroll
          </span>
          <FiArrowDown size={18} />
        </motion.span>
      </MotionSmoothLink>
    </section>
  );
}
