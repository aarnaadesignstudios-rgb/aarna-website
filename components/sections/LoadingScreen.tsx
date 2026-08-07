"use client";

/**
 * LoadingScreen — "the phoenix takes flight".
 *
 * The intro is one continuous beat rather than a logo-then-curtain sequence:
 * the mark settles, a glint traces its silhouette, and then the bird comes
 * loose from the letterform, beats its wings and arcs out of frame — and the
 * emerald tears open along the vector it left on, carrying the wordmark with
 * it. The hero is already in motion underneath by the time it is uncovered.
 *
 * The cue sheet lives in `INTRO.cue` (constants/site.ts) so the hero and navbar
 * can hand off from the same numbers instead of re-deriving them.
 *
 * The one structural trick worth knowing
 * --------------------------------------
 * The logo is raster only, and in it the phoenix and the "A" share strokes —
 * the bird's tail *is* the A's left leg. Nothing can be lifted out of the PNG.
 * So the bird that flies is <PhoenixSilhouette />, vector art drawn to sit over
 * the mark at the same scale, and the swap happens under a gold bloom at the
 * moment of separation. Two gold shapes, one flash, ~180ms: the eye reads a
 * single object coming loose, not a cross-fade between two assets.
 *
 * That is also why the emblem and the bird live in two separately-centred
 * layers that render the same square box. They land on the same pixels for
 * free, with no measuring, at any viewport size — and because the bird is
 * *outside* the curtain, it keeps flying while the curtain is being masked
 * away beneath it.
 *
 * Motion trail is three lagged ghosts of the same silhouette rather than a
 * blur filter: it costs nothing per frame and reads better on a thin shape.
 */
import { useState, useRef, type CSSProperties } from "react";
import Image from "next/image";

import { useIsomorphicLayoutEffect } from "@/hooks";
import PhoenixSilhouette, { WING_PIVOT } from "@/components/ui/PhoenixSilhouette";
import { INTRO, SITE } from "@/constants";
import { gsap } from "@/lib/gsap";

const { cue } = INTRO;

/**
 * Motion trail: ghosts of the same silhouette, each running the flight tween a
 * beat late. Cheaper than a blur filter and it reads better on a thin shape.
 *
 * The lag has to stay short. At 55ms the ghosts separate far enough to look
 * like a flock of distinct birds rather than one bird moving fast.
 */
const TRAIL_LAG = 0.032;
const TRAIL = [
  { lag: TRAIL_LAG, opacity: 0.3 },
  { lag: TRAIL_LAG * 2, opacity: 0.17 },
  { lag: TRAIL_LAG * 3, opacity: 0.08 },
];

/**
 * Shared box for the emblem and the bird. Both layers render this exact class,
 * which is what keeps the vector registered over the raster without measuring.
 */
const EMBLEM_BOX = "aspect-square w-[clamp(132px,24vw,224px)]";

/**
 * The silhouette was traced out of the mark itself and shares its 404×407
 * coordinate space, so at the same box size it lands on the raster
 * pixel-for-pixel and needs no correction.
 */
const BIRD_FIT = 1;

/** Glint: a specular sweep clipped to the mark's own outline. */
const GLINT_STYLE: CSSProperties = {
  WebkitMaskImage: "url(/images/aarnaa-mark.png)",
  maskImage: "url(/images/aarnaa-mark.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  backgroundImage:
    "linear-gradient(105deg, transparent 44%, rgba(246,242,233,0.9) 50%, transparent 56%)",
  backgroundSize: "300% 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "-100% 0",
  opacity: 0,
};

/**
 * The tear. A diagonal wipe on the curtain's mask running 205° — opening at the
 * top-right corner, where the bird left, and sweeping down to the bottom-left.
 * `--tear` is driven from the timeline.
 *
 * The 11% band is the softness of the edge, and it wants to stay tight: much
 * wider and the emerald dissolves into fog across half the screen instead of
 * being pulled off along a line.
 */
const CURTAIN_MASK =
  "linear-gradient(205deg, transparent var(--tear), #000 calc(var(--tear) + 11%))";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Hold scroll for the duration of the intro.
    document.body.style.overflow = "hidden";

    const finish = () => {
      document.body.style.overflow = "";
      setVisible(false);
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const curtain = root.querySelector<HTMLElement>("[data-curtain]");
      curtain?.style.setProperty("--tear", "-12%");

      // Reduced motion: state the brand, then get out of the way.
      if (reduced) {
        gsap
          .timeline({ onComplete: finish })
          .to("[data-lockup]", { opacity: 1, duration: 0.5 })
          .to(root, { opacity: 0, duration: 0.5 }, "+=0.6");
        return;
      }

      // Nearest ghost first, so the stagger below reads as a trail. They are
      // rendered furthest-first (for paint order), hence the reverse.
      const flock = [
        root.querySelector<HTMLElement>('[data-bird="main"]'),
        ...gsap.utils
          .toArray<HTMLElement>('[data-bird="echo"]')
          .reverse(),
      ].filter((el): el is HTMLElement => Boolean(el));

      const tl = gsap.timeline({ onComplete: finish });

      /**
       * Dev-only scrub handle. Every beat here is under half a second, which is
       * exactly the range you cannot judge by reloading — so in development the
       * timeline is reachable for stepping:
       *
       *   __intro.timeScale(0.15)      // watch the wing-beats
       *   __intro.pause().seek(1.45)   // sit on the separation
       *
       * Loading with `?scrub` freezes it at zero before it can play out, which
       * is the only way to inspect a beat that is over in 100ms (and the only
       * way to drive it from a screenshot harness — by the time a script can
       * reach in, an unfrozen intro has already finished and unmounted).
       *
       * Stripped from production builds by the NODE_ENV check.
       */
      if (process.env.NODE_ENV === "development") {
        (window as unknown as { __intro?: gsap.core.Timeline }).__intro = tl;
        if (new URLSearchParams(window.location.search).has("scrub")) {
          tl.pause(0);
        }
      }

      /* — settle ————————————————————————————————————————————————— */
      tl.fromTo(
        "[data-emblem]",
        { opacity: 0, scale: 0.92, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" },
        cue.settle
      ).fromTo(
        "[data-wordmark]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        cue.settle + 0.28
      );

      /* — glint —————————————————————————————————————————————————— */
      tl.to(
        "[data-glint]",
        {
          backgroundPosition: "200% 0",
          duration: 0.62,
          ease: "power1.inOut",
        },
        cue.glint
      )
        .to("[data-glint]", { opacity: 1, duration: 0.18 }, cue.glint)
        .to("[data-glint]", { opacity: 0, duration: 0.22 }, cue.glint + 0.4);

      /* — separation ————————————————————————————————————————————
         Bloom peaks over the swap so the raster→vector cut is never seen. */
      tl.fromTo(
        "[data-bloom]",
        { opacity: 0, scale: 0.6 },
        { opacity: 0.85, scale: 1.25, duration: 0.22, ease: "power2.out" },
        cue.separate - 0.1
      )
        .to(
          "[data-bloom]",
          { opacity: 0, scale: 1.6, duration: 0.5, ease: "power2.in" },
          cue.separate + 0.12
        )
        // The mark hands off: it dims and lets go as the vector takes over.
        .to(
          "[data-emblem]",
          { opacity: 0, duration: 0.2, ease: "power2.inOut" },
          cue.separate
        )
        .to(
          '[data-bird="main"]',
          { opacity: 1, duration: 0.18, ease: "power2.out" },
          cue.separate
        );

      /* — the beat ——————————————————————————————————————————————
         Crouch, then two full wing-beats. The near wing sweeps wider than the
         far one; that difference is the whole illusion of depth. */
      tl.to(
        '[data-bird="main"]',
        { y: 10, scale: BIRD_FIT * 0.97, duration: 0.16, ease: "power2.out" },
        cue.flap
      )
        .to(
          '[data-bird="main"]',
          {
            y: -18,
            scale: BIRD_FIT * 1.03,
            duration: 0.42,
            ease: "power2.out",
          },
          cue.flap + 0.18
        )
        .to(
          '[data-bird="main"] [data-wing="near"]',
          {
            rotation: 17,
            svgOrigin: WING_PIVOT,
            duration: 0.13,
            ease: "power2.inOut",
            repeat: 3,
            yoyo: true,
          },
          cue.flap + 0.16
        )
        .to(
          '[data-bird="main"] [data-wing="far"]',
          {
            rotation: -12,
            svgOrigin: WING_PIVOT,
            duration: 0.13,
            ease: "power2.inOut",
            repeat: 3,
            yoyo: true,
          },
          cue.flap + 0.19
        )
        // Streamers drag a beat behind the wings — that lag is most of what
        // makes a beat read as a body moving air rather than a hinge opening.
        .to(
          "[data-bird='main'] [data-tail]",
          {
            rotation: 5,
            svgOrigin: WING_PIVOT,
            duration: 0.13,
            ease: "sine.inOut",
            repeat: 3,
            yoyo: true,
          },
          cue.flap + 0.26
        );

      /* — flight ————————————————————————————————————————————————
         x eases in and y eases out on separate tweens, which arcs the path
         without a plugin: it climbs first, then the horizontal run takes over
         and it leaves through the top-right corner. Both curves are gentle on
         purpose — with a hard `power2.in` on x the bird spends most of the
         shot going straight up and exits through the top of the frame, which
         reads as a balloon rather than as flight. */
      const dx = window.innerWidth * 1.15;
      const dy = window.innerHeight * 0.62;

      tl.to(
        flock,
        {
          x: dx,
          rotation: -16,
          scale: BIRD_FIT * 1.45,
          duration: 0.68,
          ease: "power1.in",
          stagger: TRAIL_LAG,
        },
        cue.flight
      )
        .to(
          flock,
          { y: -dy, duration: 0.68, ease: "power2.out", stagger: TRAIL_LAG },
          cue.flight
        )
        // Wings driving hard on the way out.
        .to(
          '[data-bird="main"] [data-wing="near"]',
          {
            rotation: 21,
            svgOrigin: WING_PIVOT,
            duration: 0.11,
            ease: "power1.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flight
        )
        .to(
          '[data-bird="main"] [data-wing="far"]',
          {
            rotation: -15,
            svgOrigin: WING_PIVOT,
            duration: 0.11,
            ease: "power1.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flight
        )
        .to(
          "[data-bird='main'] [data-tail]",
          {
            rotation: 7,
            svgOrigin: WING_PIVOT,
            duration: 0.11,
            ease: "sine.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flight + 0.06
        );

      // Ghosts only exist while there is motion to trail.
      TRAIL.forEach((ghost, i) => {
        const el = flock[i + 1];
        if (!el) return;
        tl.to(
          el,
          { opacity: ghost.opacity, duration: 0.12 },
          cue.flight + ghost.lag
        ).to(el, { opacity: 0, duration: 0.3 }, cue.flight + 0.44);
      });

      /* — the tear ——————————————————————————————————————————————
         The custom property is tweened directly rather than through a proxy
         object with an onUpdate. A proxy works while the timeline is playing,
         but callbacks are suppressed during `seek()` — so the tear would
         silently not move whenever the intro was scrubbed, including from the
         screenshot harness. As a real property tween it renders on seek like
         everything else. */
      if (curtain) {
        tl.to(
          curtain,
          {
            "--tear": "124%",
            duration: INTRO.tearDuration,
            ease: "power2.inOut",
          },
          cue.tear
        )
          // The sheet lifts away with the wipe rather than just vanishing.
          .to(
            curtain,
            {
              scale: 1.06,
              xPercent: 3,
              yPercent: -4,
              duration: INTRO.tearDuration,
              ease: "power2.inOut",
            },
            cue.tear
          )
          .to(
            "[data-lockup]",
            { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" },
            cue.tear
          );
      }
    }, rootRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-100 overflow-hidden"
    >
      {/* The curtain, and everything it carries away with it. Masked, so the
          tear takes the wordmark along the same diagonal. */}
      <div
        data-curtain
        className="surface-emerald absolute inset-0"
        style={{
          WebkitMaskImage: CURTAIN_MASK,
          maskImage: CURTAIN_MASK,
          willChange: "mask-image, transform",
        }}
      >
        <div className="absolute inset-0 flex translate-y-[-7%] items-center justify-center">
          <div data-lockup className="relative">
            <div data-emblem className={`relative ${EMBLEM_BOX}`}>
              <Image
                src="/images/aarnaa-mark.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 40vw, 240px"
                className="object-contain"
              />
              {/* Specular sweep, clipped to the mark's own outline. */}
              <div data-glint className="absolute inset-0" style={GLINT_STYLE} />
            </div>

            {/* Bloom that covers the raster → vector hand-off. */}
            <div
              data-bloom
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 46%, rgba(218,195,108,0.55) 0%, rgba(201,169,50,0.22) 38%, transparent 68%)",
              }}
            />

            <div
              data-wordmark
              className="absolute inset-x-0 top-full flex flex-col items-center pt-7"
            >
              <span className="font-serif text-[clamp(2rem,6vw,3.25rem)] leading-none font-semibold tracking-tight text-gold">
                {SITE.shortName}
              </span>
              <span className="mt-3 font-mono text-[clamp(8px,1.6vw,11px)] leading-none tracking-[0.42em] text-cream/70 uppercase">
                Design Studios
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight layers — outside the curtain, so the bird keeps flying while
          the emerald is torn away beneath it. Each renders the same centred
          box as the emblem, which is what registers the vector over the
          raster with no measuring. Ghosts render furthest-first for paint
          order; the timeline re-orders them nearest-first for the stagger. */}
      {[...TRAIL].reverse().map((ghost) => (
        <BirdLayer key={ghost.lag} kind="echo" />
      ))}
      <BirdLayer kind="main" />
    </div>
  );
}

/** One centred, independently-animatable copy of the phoenix. */
function BirdLayer({ kind }: { kind: "main" | "echo" }) {
  return (
    <div className="absolute inset-0 flex translate-y-[-7%] items-center justify-center">
      <div
        data-bird={kind}
        className={`${EMBLEM_BOX} text-gold opacity-0 will-change-transform`}
        style={{ transform: `scale(${BIRD_FIT})` }}
      >
        <PhoenixSilhouette />
      </div>
    </div>
  );
}
