"use client";

/**
 * LoadingScreen — "the phoenix takes flight, the letter takes its place".
 *
 * One continuous beat rather than a logo-then-curtain sequence. The mark
 * settles, a glint traces it, and then it comes apart: the bird lifts out of
 * the letterform, beats its wings and arcs out of frame, the emerald tears open
 * along the vector it left on, and the "A" it flew out of rises and settles
 * into the navbar's emblem slot — where the masthead is already waiting, so the
 * logo finishes assembled in the place it lives for the rest of the visit.
 *
 * The cue sheet lives in `INTRO.cue` (constants/site.ts) so the hero and the
 * navbar hand off from the same numbers instead of re-deriving them.
 *
 * ── The separation ────────────────────────────────────────────────────────────
 *
 * The logo is raster only, and in it the phoenix and the "A" are one fused
 * shape. They were pulled apart offline by stroke weight into two vector
 * components — <PhoenixSilhouette /> and <LetterMark /> — which together are
 * the mark exactly, with nothing dropped. Both share the artwork's own 404×407
 * coordinate space, so at the same box size they sit on the PNG pixel for
 * pixel. The swap happens under a gold bloom: two gold shapes, one flash,
 * ~200ms, and the eye reads one object coming apart rather than assets being
 * exchanged.
 *
 * That is also why the emblem, the bird and the letter live in separately
 * centred layers that all render the same square box. They land on the same
 * pixels for free, at any viewport, with no measuring — and because the bird
 * and the letter sit OUTSIDE the curtain, they keep moving while the emerald is
 * masked away beneath them.
 *
 * ── Landing the letter ────────────────────────────────────────────────────────
 *
 * The one thing that cannot be done by construction is where the "A" is flying
 * TO, since that depends on the navbar's own layout. So it is measured: the
 * masthead emblem carries `data-brand-mark`, and the letter's flight is a FLIP
 * — read both boxes, tween the delta. The navbar is timed to settle *before*
 * this runs (`INTRO.navbarMs`), because measuring a target that is still
 * animating reads a position it is about to leave.
 */
import { useState, useRef, type CSSProperties } from "react";
import Image from "next/image";

import { useIsomorphicLayoutEffect } from "@/hooks";
import PhoenixSilhouette, {
  TAIL_PIVOT,
  WING_FAR_PIVOT,
  WING_NEAR_PIVOT,
} from "@/components/ui/PhoenixSilhouette";
import LetterMark from "@/components/ui/LetterMark";
import { INTRO, SITE } from "@/constants";
import { gsap } from "@/lib/gsap";

const { cue } = INTRO;

/**
 * Motion trail: ghosts of the silhouette, each running the flight tween a beat
 * late. Cheaper than a blur filter and it reads better on a thin shape.
 *
 * The lag has to stay short — much past 40ms the ghosts separate far enough to
 * look like a flock of distinct birds rather than one bird moving fast.
 */
const TRAIL_LAG = 0.032;
const TRAIL = [
  { lag: TRAIL_LAG, opacity: 0.3 },
  { lag: TRAIL_LAG * 2, opacity: 0.17 },
  { lag: TRAIL_LAG * 3, opacity: 0.08 },
];

/**
 * Shared box for the emblem, the bird and the letter. All three layers render
 * this exact class, which is what keeps the vectors registered over the raster
 * without measuring anything.
 */
const EMBLEM_BOX = "aspect-square w-[clamp(132px,24vw,224px)]";

/** How far the whole lockup sits above centre, as a fraction of the viewport. */
const LOCKUP_RISE = "translate-y-[-7%]";

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
          .to(root, { opacity: 0, duration: 0.5 }, "+=0.7");
        return;
      }

      // Nearest ghost first, so the stagger reads as a trail. They render
      // furthest-first for paint order, hence the reverse.
      const flock = [
        root.querySelector<HTMLElement>('[data-bird="main"]'),
        ...gsap.utils.toArray<HTMLElement>('[data-bird="echo"]').reverse(),
      ].filter((el): el is HTMLElement => Boolean(el));

      const tl = gsap.timeline({ onComplete: finish });

      /**
       * Dev-only scrub handle. Every beat here is under half a second, which is
       * exactly the range you cannot judge by reloading:
       *
       *   __intro.timeScale(0.15)      // watch the wing-beats
       *   __intro.pause().seek(1.95)   // sit on the separation
       *
       * Loading with `?scrub` freezes it at zero before it can play out — the
       * only way to inspect a beat that is over in 100ms, and the only way to
       * drive it from a screenshot harness, since by the time a script can
       * reach in an unfrozen intro has already finished and unmounted.
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
        { opacity: 0, scale: 0.92, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 1.25, ease: "power3.out" },
        cue.settle
      ).fromTo(
        "[data-wordmark]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
        cue.settle + 0.32
      );

      /* — glint —————————————————————————————————————————————————— */
      tl.to(
        "[data-glint]",
        { backgroundPosition: "200% 0", duration: 0.75, ease: "power1.inOut" },
        cue.glint
      )
        .to("[data-glint]", { opacity: 1, duration: 0.2 }, cue.glint)
        .to("[data-glint]", { opacity: 0, duration: 0.26 }, cue.glint + 0.49);

      /* — separation ————————————————————————————————————————————
         Bloom peaks over the swap so the raster→vector cut is never seen. The
         letter appears at the same instant as the bird: together they are the
         mark, so nothing about the composition changes as they take over. */
      tl.fromTo(
        "[data-bloom]",
        { opacity: 0, scale: 0.6 },
        { opacity: 0.85, scale: 1.25, duration: 0.26, ease: "power2.out" },
        cue.separate - 0.12
      )
        .to(
          "[data-bloom]",
          { opacity: 0, scale: 1.6, duration: 0.6, ease: "power2.in" },
          cue.separate + 0.14
        )
        .to(
          "[data-emblem]",
          { opacity: 0, duration: 0.22, ease: "power2.inOut" },
          cue.separate
        )
        .to(
          ['[data-bird="main"]', "[data-letter]"],
          { opacity: 1, duration: 0.2, ease: "power2.out" },
          cue.separate
        );

      /* — the beat ——————————————————————————————————————————————
         Crouch, then three full wing-beats. Each group turns about its OWN root
         (see <PhoenixSilhouette />): rotate a wing about anything else and it
         drags away from the body and opens a gap at the shoulder. The tail lags
         the wing, which is most of what makes a beat read as a body moving air
         rather than a hinge opening. */
      tl.to(
        '[data-bird="main"]',
        { y: 12, scale: 0.97, duration: 0.2, ease: "power2.out" },
        cue.flap
      )
        .to(
          '[data-bird="main"]',
          { y: -22, scale: 1.03, duration: 0.62, ease: "power2.out" },
          cue.flap + 0.22
        )
        .to(
          '[data-bird="main"] [data-wing="far"]',
          {
            rotation: 11,
            svgOrigin: WING_FAR_PIVOT,
            duration: 0.15,
            ease: "power2.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flap + 0.2
        )
        // The near wing is far longer, so the same angle would throw its tip
        // across half the frame. Less rotation, same beat.
        .to(
          '[data-bird="main"] [data-wing="near"]',
          {
            rotation: -7,
            svgOrigin: WING_NEAR_PIVOT,
            duration: 0.15,
            ease: "power2.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flap + 0.2
        )
        .to(
          '[data-bird="main"] [data-tail]',
          {
            rotation: -5,
            svgOrigin: TAIL_PIVOT,
            duration: 0.15,
            ease: "sine.inOut",
            repeat: 5,
            yoyo: true,
          },
          cue.flap + 0.3
        );

      /* — flight ————————————————————————————————————————————————
         x eases in and y eases out on separate tweens, which arcs the path
         without a plugin: it climbs first, then the horizontal run takes over
         and it leaves through the top-right corner. Both curves stay gentle —
         a hard ease-in on x sends the bird almost straight up and out of the
         top of frame, which reads as a balloon rather than as flight. */
      const dx = window.innerWidth * 1.25;
      const dy = window.innerHeight * 0.5;

      tl.to(
        flock,
        {
          x: dx,
          rotation: -16,
          scale: 1.45,
          duration: 0.95,
          ease: "power1.in",
          stagger: TRAIL_LAG,
        },
        cue.flight
      )
        .to(
          flock,
          { y: -dy, duration: 0.95, ease: "power2.out", stagger: TRAIL_LAG },
          cue.flight
        )
        .to(
          '[data-bird="main"] [data-wing="far"]',
          {
            rotation: 14,
            svgOrigin: WING_FAR_PIVOT,
            duration: 0.13,
            ease: "power1.inOut",
            repeat: 7,
            yoyo: true,
          },
          cue.flight
        )
        .to(
          '[data-bird="main"] [data-wing="near"]',
          {
            rotation: -9,
            svgOrigin: WING_NEAR_PIVOT,
            duration: 0.13,
            ease: "power1.inOut",
            repeat: 7,
            yoyo: true,
          },
          cue.flight
        )
        .to(
          '[data-bird="main"] [data-tail]',
          {
            rotation: -7,
            svgOrigin: TAIL_PIVOT,
            duration: 0.13,
            ease: "sine.inOut",
            repeat: 7,
            yoyo: true,
          },
          cue.flight + 0.07
        );

      /* — the letter heals ——————————————————————————————————————
         The A is cut into three pieces by the bird crossing over it, and those
         cuts have to stay while the bird is on top of them — heal it early and
         the bird's strokes go gold-on-gold where they overlap, and the
         crossings disappear. So it heals behind the departing bird: by the time
         the frame is empty, the letterform is whole. */
      tl.to(
        '[data-letter] [data-letter="cut"]',
        { opacity: 0, duration: 0.45, ease: "power2.inOut" },
        cue.flight + 0.12
      ).to(
        '[data-letter] [data-letter="whole"]',
        { opacity: 1, duration: 0.45, ease: "power2.inOut" },
        cue.flight + 0.12
      );

      // Ghosts only exist while there is motion to trail.
      TRAIL.forEach((ghost, i) => {
        const el = flock[i + 1];
        if (!el) return;
        tl.to(
          el,
          { opacity: ghost.opacity, duration: 0.14 },
          cue.flight + ghost.lag
        ).to(el, { opacity: 0, duration: 0.34 }, cue.flight + 0.6);
      });

      /* — the tear ——————————————————————————————————————————————
         The custom property is tweened directly rather than through a proxy
         object with an onUpdate. A proxy works while the timeline plays, but
         callbacks are suppressed during `seek()` — so the tear would silently
         not move whenever the intro was scrubbed. As a real property tween it
         renders on seek like everything else. */
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
            "[data-wordmark]",
            { opacity: 0, y: -26, duration: 0.55, ease: "power2.in" },
            cue.tear - 0.2
          );
      }

      /* — the letter takes its place ————————————————————————————
         A FLIP onto the masthead emblem: read both boxes, tween the delta, so
         the landing follows the navbar's real layout at this viewport instead
         of a hard-coded guess.

         The measurements are FUNCTION-BASED tween values, not constants and not
         a `call`. Constants are wrong because at construction time the navbar
         has not animated in yet and its box sits 24px high. A `call` would
         measure at the right moment but is silently skipped during `seek()`,
         so the landing would never appear under the scrub harness. Function
         values are evaluated when the tween first renders — right moment, and
         it still scrubs. */
      const letterEl = root.querySelector<HTMLElement>("[data-letter]");

      /** Where the masthead emblem is, right now. Null while it is unmeasurable. */
      const landing = () => {
        if (!letterEl) return null;
        // Both the desktop and mobile lockups are in the DOM; the hidden one
        // measures 0×0.
        const target = Array.from(
          document.querySelectorAll<HTMLElement>("[data-brand-mark]")
        ).find((el) => el.getBoundingClientRect().width > 0);
        const from = letterEl.getBoundingClientRect();
        if (!target || !from.width) return null;
        return { to: target.getBoundingClientRect(), from };
      };

      if (letterEl) {
        tl.to(
          letterEl,
          {
            x: () => {
              const m = landing();
              return m ? m.to.left + m.to.width / 2 - (m.from.left + m.from.width / 2) : 0;
            },
            y: () => {
              const m = landing();
              return m ? m.to.top + m.to.height / 2 - (m.from.top + m.from.height / 2) : 0;
            },
            scale: () => {
              const m = landing();
              return m ? m.to.width / m.from.width : 1;
            },
            duration: INTRO.letterDuration,
            ease: "power3.inOut",
          },
          cue.letter
        )
          // Hands off to the real emblem underneath just before it arrives, so
          // the two are never both at full strength on the same pixels.
          .to(
            letterEl,
            { opacity: 0, duration: 0.32, ease: "power2.in" },
            cue.letter + INTRO.letterDuration - 0.32
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
        <div
          className={`absolute inset-0 flex ${LOCKUP_RISE} items-center justify-center`}
        >
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

      {/* Everything below is OUTSIDE the curtain, so it keeps moving while the
          emerald is torn away beneath it. Each layer renders the same centred
          box as the emblem, which is what registers the vectors over the raster
          with no measuring.

          The letter is painted first so the bird lifts off from in front of it,
          the way it sits in the artwork. Ghosts render furthest-first for paint
          order; the timeline re-orders them nearest-first for the stagger. */}
      <Layer>
        <div
          data-letter
          className={`${EMBLEM_BOX} text-gold opacity-0 will-change-transform`}
        >
          <LetterMark />
        </div>
      </Layer>

      {[...TRAIL].reverse().map((ghost) => (
        <BirdLayer key={ghost.lag} kind="echo" />
      ))}
      <BirdLayer kind="main" />
    </div>
  );
}

/** A full-screen layer that centres the emblem box exactly like the lockup. */
function Layer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 flex ${LOCKUP_RISE} items-center justify-center`}
    >
      {children}
    </div>
  );
}

/** One centred, independently-animatable copy of the phoenix. */
function BirdLayer({ kind }: { kind: "main" | "echo" }) {
  return (
    <Layer>
      <div
        data-bird={kind}
        className={`${EMBLEM_BOX} text-gold opacity-0 will-change-transform`}
      >
        <PhoenixSilhouette />
      </div>
    </Layer>
  );
}
