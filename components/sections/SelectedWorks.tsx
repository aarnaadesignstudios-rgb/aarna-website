"use client";

/**
 * SelectedWorks — the nine commissions, on a rotating 3D ring.
 *
 * ── What this replaced, and why ────────────────────────────────────────────
 *
 * This was a pinned HORIZONTAL track: nine panels of uneven width translating
 * sideways under a pinned viewport. It worked, and it read as a filmstrip — the
 * projects went past in a line, each one a rectangle the same distance from the
 * viewer as the last. Flat.
 *
 * It is now a ring. The nine projects sit on the faces of an invisible cylinder
 * standing in the middle of the section, and scrolling ROTATES that cylinder.
 * Only the front hemisphere is drawn, so what a visitor actually sees is a
 * shallow arc of photographs curving away into the page on both sides: the
 * project at the front square-on and full strength, its neighbours turned and
 * foreshortened, the ones past them edge-on slivers. Scroll down and the arc
 * swings; the next project rotates in from the right as the current one turns
 * away to the left.
 *
 * Modelled on the projects section of kartalucia.com, which the client supplied
 * as the reference — measured off the live page, its cards are on `preserve-3d`
 * faces at 45° increments around exactly this kind of ring. Two deliberate
 * departures: that site is black and ours is paper, so depth here is carried by
 * AERIAL PERSPECTIVE (distant faces wash out toward the page colour) rather
 * than by falling into shadow; and the project's name is set as flat type on
 * the page rather than on the card, because type inside a 3D transform is
 * resampled by the compositor and goes soft.
 *
 * ── What the first build of this got wrong ─────────────────────────
 *
 * It rotated correctly and it still read as flat, with the note back being "too
 * much white space" and "missing character". Those were one fault: an arc of
 * photographs floating on an empty rectangle. Nothing told the eye it was
 * looking at an object in a space, so the space around it was not composition,
 * just unused page. Six things fixed it, and they are all in service of that
 * one idea — give the ring a ROOM:
 *
 *   1. THE FLOOR. A disc laid flat at the foot of the cards (`.ring-floor`),
 *      which perspective draws as an ellipse. The single cheapest gain here:
 *      the depth becomes something you see rather than something you infer.
 *   2. REFLECTIONS. A mirrored, masked copy of each photograph hanging under
 *      its card, turning with it. Same `src`, so no extra network.
 *   3. THE CYCLORAMA. The ground is a lit green sweep now, not a flat fill —
 *      see `.stage-cyclorama`. This is what both fills the frame and answers
 *      "more green": the brand colour owns the whole section, while the middle
 *      stays light so the photographs still sit ON it.
 *   4. POINTER TILT. The whole turntable leans a few degrees toward the
 *      pointer. Small, and it is the difference between a diagram and a thing.
 *   5. A GHOST NUMERAL. The active project's index, outlined, at 26vw, behind
 *      the ring. Fills the upper frame with something editorial.
 *   6. A DENSER ARC. Bigger cards on a tighter radius with a shorter
 *      perspective, so the arc reaches both edges of the screen and the cards
 *      overlap slightly. Award-site lesson, plainly: fill the frame.
 *
 * ── The geometry, in one place ─────────────────────────────────────────────
 *
 *   · The STAGE owns `perspective`. It cannot live on the ring: perspective
 *     applies to an element's children, so on the rotating element itself every
 *     card would get its own vanishing point and the ring would shear.
 *   · The RING owns `rotateY` and `preserve-3d`, and is pushed back by its own
 *     radius so the front face lands on the perspective plane at scale 1.
 *   · Each FACE is swung to `rotateY(i × 40°) translateZ(radius)`.
 *
 * All three are in styles/globals.css (`.ring-stage`, `.ring-3d`, `.ring-face`)
 * because Tailwind has no utilities that spell them. This file owns only the
 * numbers that change per frame, and writes them as custom properties straight
 * to the DOM — never through React state, which at scroll rate would re-render
 * the section sixty times a second.
 *
 * Kept from the previous version: the pin + scrub, the progress hairline, the
 * "01 / 09" readout, the index buttons, ←/→ stepping, and a release into a
 * plain vertical stack below `lg` (a 3D ring on a phone is a lot of compositing
 * for a 380px-wide arc).
 */
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
import {
  PageContainer,
  Media,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { WORKS } from "@/constants";
import type { Work } from "@/types";
import { smoothScrollTo } from "@/lib/SmoothScrollProvider";
import { cn } from "@/utils/cn";

/**
 * ── The count is not a module constant any more ──────────────────────────
 *
 * It used to be `WORKS.length`, read once at import. The projects can now come
 * from Sanity, so the number of them is only known per render — and the ring's
 * whole geometry is derived from it: the angle between faces, where the dwell
 * lands, how far the pin scrolls, which index the counter shows.
 *
 * `WORKS` stays as the default, so a caller that passes nothing gets exactly
 * the ring that was here before.
 */



/**
 * How far from the front a face is still drawn.
 *
 * Past 90° a face is showing its back, so the useful window is a little under
 * that; the last few degrees are spent fading rather than cut, or a sliver
 * pops out of existence at the edge of the arc.
 */
const FADE_FROM = 62;
const CUT_AT = 94;

/**
 * Only the face near the front is a link.
 *
 * Everything else is a foreshortened sliver a few pixels wide, and a sliver
 * that swallows clicks is worse than one that ignores them — at 60° a card is
 * still ~180px of hit area sitting over the front card's right-hand edge.
 */
const LIVE_WITHIN = 26;

/**
 * A small vertical offset per face, in vh.
 *
 * A ring of nine identical faces at one height is a carousel; the reference
 * scatters its cards vertically and that is most of why it reads as a space
 * rather than a mechanism. These are deliberately not random — a random
 * scatter would be re-rolled on every mount and the section would never look
 * the same twice — and the amplitude is kept under 4vh so the front card is
 * always close enough to centre for the title beneath it to sit still.
 */
const RISE = [-3.4, 2.6, -1.2, 3.6, -2.4, 1.4, -3.8, 2, 0] as const;

/**
 * How far the turntable leans toward the pointer, in degrees.
 *
 * Tiny, and load-bearing. Under about 2° nothing reads; over about 6° the ring
 * starts to look like it is falling over, and because the tilt is outside the
 * spin it also drags the floor ellipse into an unconvincing shape. The lean is
 * eased rather than tracked — see `tiltTo` — because a ring that snaps to the
 * pointer feels like a UI widget, and one that follows it a beat behind feels
 * like something with mass.
 */
const TILT_X = 3.2;
const TILT_Y = 4.5;

/**
 * The band, in degrees from the front, over which a face catches the gold.
 *
 * A specular sweep crossing each photograph as it turns into the light is the
 * detail that makes the cards read as physical panels rather than as images
 * pasted onto planes. It peaks off-centre (at `SWEEP_PEAK`, on the incoming
 * side) so the light arrives BEFORE the card is square-on — which is what a
 * real key light above and to one side of a turntable would do, and it also
 * means the front card is never the one with a highlight across it.
 */
const SWEEP_PEAK = 26;
const SWEEP_WIDTH = 30;

/** Signed shortest angle from the front of the ring, in (-180, 180]. */
function fromFront(deg: number) {
  const wrapped = ((deg % 360) + 540) % 360 - 180;
  return wrapped;
}

/**
 * ── Where the ring rests ───────────────────────────────────────────────────
 *
 * Mapping scroll progress straight onto ring position means the ring spends as
 * much of its travel HALFWAY between two projects as square-on to one. That is
 * the single thing that read as wrong in the first build of this section: at the
 * half positions there are two equally large cards straddling the centre and a
 * hole between them, while the title underneath names only one of them.
 *
 * The obvious fix is ScrollTrigger's own `snap`, and it does not work here.
 * Snapping tweens the scroll position, and Lenis re-applies its own
 * `animatedScroll` every frame — the same reason a driver cannot use
 * `window.scrollTo` on this site (see .claude/skills/run-aarnaa-studios). The
 * two would fight for the whole duration of every snap.
 *
 * So the ring snaps VISUALLY instead, and the scroll position is left alone.
 * `smootherstep` is flat at both ends: near an integer position its derivative
 * is zero, so the ring dwells with one project square-on through most of that
 * project's share of the scroll and then swings decisively to the next. Nothing
 * fights the scroller, the travel stays perfectly reversible, and a visitor can
 * still stop anywhere — they just find the ring settled when they do.
 */
function smootherstep(x: number) {
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Scroll progress (0–1) → ring position in faces, with the dwell above. */
function ringPosition(progress: number, count: number) {
  const raw = Math.max(0, Math.min(1, progress)) * (count - 1);
  const from = Math.floor(raw);
  // The last face has nothing to travel toward, so it is its own answer.
  if (from >= count - 1) return count - 1;
  return from + smootherstep(raw - from);
}

export default function SelectedWorks({
  works = WORKS,
}: {
  /**
   * The commissions to show. Defaults to the ones committed in
   * `constants/content.ts`, which is what the site falls back to whenever
   * Sanity is unconfigured, empty or unreachable — see sanity/lib/content.ts.
   */
  works?: Work[];
}) {
  const count = works.length;
  /** Degrees between neighbouring faces. */
  const step = 360 / count;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  /**
   * ── Two ref arrays, deliberately ──────────────────────────────────────
   *
   * The ring and the stack are different DOM, and only one of them is ever
   * mounted (`hidden lg:block` / `lg:hidden`). They started out sharing one ref
   * array so that `jump` could reach a card in either layout, and that was a
   * bug: `apply` runs once before the desktop matchMedia is even consulted, so
   * on a phone it wrote ring geometry onto the STACK's articles — every card
   * more than 94° round the imaginary ring got `opacity: 0` and the rest got a
   * near-opaque haze. The whole section rendered as an empty cream box.
   *
   * Separate arrays, and `apply` refuses to run without a ring (below). `jump`
   * takes whichever array has the element.
   */
  const facesRef = useRef<(HTMLElement | null)[]>([]);
  const stackRef = useRef<(HTMLElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  const stRef = useRef<ScrollTrigger | null>(null);
  /** Continuous ring position, in faces: 0 = first project at the front. */
  const posRef = useRef(0);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  /**
   * Put the ring at position `t` (in faces, so 4.5 is halfway between the
   * fifth and sixth project).
   *
   * Everything here is a direct style write. The only React state it touches is
   * `active`, and that is guarded on a change of integer index — so the section
   * re-renders nine times over the whole scroll rather than on every frame.
   */
  const apply = useCallback((t: number, linear?: number) => {
    posRef.current = t;

    // No ring in the DOM means this is the stacked layout, and none of the
    // geometry below applies to it. See the note on `stackRef`.
    const ring = ringRef.current;
    if (!ring) return;

    ring.style.setProperty("--ring-rot", `${-t * step}deg`);

    facesRef.current.forEach((face, i) => {
      if (!face) return;

      const rel = fromFront((i - t) * step);
      const away = Math.abs(rel);

      // Aerial perspective: the further round the ring a face is, the more of
      // the page's own colour is washed over it, until it disappears into the
      // paper. This is the light-ground equivalent of the reference's fall into
      // black, and it is one opacity on a child — no filters, no blur, nothing
      // that would cost a frame on a nine-card ring.
      const haze =
        away <= FADE_FROM
          ? (away / FADE_FROM) * 0.34
          : 0.34 + Math.min(1, (away - FADE_FROM) / (CUT_AT - FADE_FROM)) * 0.62;

      face.style.opacity = away >= CUT_AT ? "0" : "1";
      face.style.pointerEvents = away <= LIVE_WITHIN ? "auto" : "none";
      face.style.setProperty("--face-haze", String(haze));

      // The gold sweep: a triangular falloff around SWEEP_PEAK on the incoming
      // side only. `rel` is signed, so testing it rather than `away` is what
      // keeps the highlight on the side the light is coming from instead of
      // mirroring onto both flanks.
      const fromPeak = Math.abs(rel - SWEEP_PEAK);
      face.style.setProperty(
        "--face-sweep",
        String(fromPeak >= SWEEP_WIDTH ? 0 : 1 - fromPeak / SWEEP_WIDTH)
      );
      // The front face is the subject, so it alone is at full size. The falloff
      // is gentle — this is a legibility cue on top of the perspective, not the
      // thing doing the work.
      face.style.setProperty(
        "--face-s",
        String(1 - Math.min(away, 90) / 90 * 0.08)
      );
    });

    // The rail reports the SCROLL, not the ring — it is told how far through
    // the section you are. Driving it off `t` instead makes it inherit the
    // ring's dwell, so it stalls at each project and lurches between them,
    // which on a progress bar reads as a stuck page rather than as easing.
    if (progressRef.current) {
      const shown = linear ?? t / (count - 1);
      progressRef.current.style.width = `${Math.max(0, Math.min(1, shown)) * 100}%`;
    }

    const idx = Math.round(t);
    if (idx !== activeRef.current && idx >= 0 && idx < count) {
      activeRef.current = idx;
      setActive(idx);
    }
    // `count` and `step` are the ring's geometry and they come from the props
    // now, so this cannot claim an empty dependency list any more.
  }, [count, step]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    // Paint the opening pose before anything scrolls, so the arc is already
    // formed the first time the section comes into view rather than being a
    // stack of nine coincident cards until the first scroll event.
    apply(0);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      /**
       * The scroll budget.
       *
       * The old horizontal track took its distance from `scrollWidth`, which a
       * ring does not have — its content is the same size at every position. So
       * the travel is declared: a little over half a viewport per project,
       * which at nine projects is ~5.5 screens of scroll for the section. Much
       * shorter and the ring spins faster than the eye can read a photograph;
       * much longer and the section outstays its welcome.
       */
      const distance = () => count * window.innerHeight * 0.62;

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(ringPosition(self.progress, count), self.progress),
        onRefresh: () => apply(posRef.current),
      });
      stRef.current = st;

      /**
       * ── The lean ─────────────────────────────────────────
       *
       * `gsap.quickTo` gives an interpolated setter that is cheap enough to
       * call on every pointermove: it reuses one tween per property instead of
       * building a new one per event. The 0.7s ease is what supplies the mass.
       *
       * Written as custom properties on the ring, which the `.ring-3d`
       * transform reads — so React never sees a pointer event, and the tilt
       * composes with the scroll-driven rotation without either knowing about
       * the other.
       */
      const stage = stageRef.current;
      const ring = ringRef.current;
      let onPointerMove: ((e: PointerEvent) => void) | null = null;

      if (stage && ring) {
        const tiltTo = gsap.quickTo(ring, "--ring-tilt", {
          duration: 0.7,
          ease: "power2.out",
        });
        const yawTo = gsap.quickTo(ring, "--ring-yaw", {
          duration: 0.7,
          ease: "power2.out",
        });

        onPointerMove = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          // -1..1 from the centre of the stage.
          const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
          // Inverted on X: pushing the pointer right should swing the ring's
          // right side AWAY, the way a turntable behaves under a finger.
          yawTo(-nx * TILT_Y);
          tiltTo(ny * TILT_X);
        };
        stage.addEventListener("pointermove", onPointerMove);

        /**
         * The entrance. Every face starts nested near the axis and the ring
         * opens out to full radius once the section is genuinely on screen.
         *
         * `--ring-spread` scales the radius inside `.ring-face`, so this is one
         * tween on one element rather than nine staggered ones — and because
         * it multiplies rather than replaces, it cannot fight the per-face
         * geometry `apply` is writing at the same time.
         */
        gsap.fromTo(
          ring,
          { "--ring-spread": 0.28 },
          {
            "--ring-spread": 1,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: section, start: "top 62%", once: true },
          }
        );
      }

      return () => {
        if (stage && onPointerMove) {
          stage.removeEventListener("pointermove", onPointerMove);
        }
        st.kill();
        stRef.current = null;
      };
    });

    // ←/→ steps between projects while the ring is on screen.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      jump(activeRef.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      mm.revert();
    };
  }, [apply]);

  /** Bring project `i` to the front of the ring. */
  const jump = (i: number) => {
    const target = Math.max(0, Math.min(count - 1, i));
    const st = stRef.current;

    // Pinned (desktop): the ring's position IS the scroll position, so this has
    // to travel through the scroller or the two would disagree the moment the
    // next wheel event arrived.
    if (st) {
      smoothScrollTo(st.start + (target / (count - 1)) * (st.end - st.start));
      return;
    }

    // No pin — below `lg`, where the section is a stack. Scroll to the card.
    const card = facesRef.current[target] ?? stackRef.current[target];
    if (card) smoothScrollTo(card, { offset: -90 });
  };

  const current = works[active] ?? works[0];

  /** One project's photograph, used by both the ring and the mobile stack. */
  const photo = (i: number) => {
    const work = works[i];
    if (!work) return null;
    return (
      <SmoothLink
        href="#contact"
        aria-label={`${work.title} — ${work.category}`}
        className={cn(
          "group relative block size-full overflow-hidden rounded-xl bg-emerald-deep",
          // The ring's own drop shadow. Emerald-tinted rather than black: on a
          // cream page a neutral shadow reads as dirt, and this is the one
          // place the brand green can sit under a photograph without tinting
          // it — see the note on `--color-ink` in styles/globals.css.
          "shadow-[0_34px_70px_-34px_color-mix(in_srgb,var(--color-emerald-deep)_85%,transparent)]"
        )}
      >
        <Media
          src={work.image}
          alt={work.title}
          sizes="(max-width: 1024px) 100vw, 30vw"
          /* The focal point the studio set in the CMS. Undefined for the
             committed constants, which are centred — see the note on
             `objectPosition` in types/index.ts. */
          objectPosition={work.objectPosition}
          className="scale-[1.04] transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.12]"
        />

        {/* The haze. Its opacity is written per frame by `apply` on the ring;
            in the mobile stack it stays at 0 and costs nothing. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-emerald"
          style={{ opacity: "var(--face-haze, 0)" }}
        />

        {/* The gold sweep. One gradient at a fixed angle whose OPACITY is
            animated — not its position. Animating `background-position` on nine
            elements at scroll rate repaints each of them every frame; opacity is
            composited. The card is turning underneath it anyway, which supplies
            all the movement the highlight needs. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(104deg,transparent_28%,color-mix(in_srgb,var(--color-gold-soft)_52%,transparent)_47%,color-mix(in_srgb,var(--color-paper)_30%,transparent)_54%,transparent_74%)] mix-blend-soft-light"
          style={{ opacity: "var(--face-sweep, 0)" }}
        />

        {/* A hairline INSIDE the photograph. At the point where a face turns
            edge-on it is a few pixels of image with no silhouette; the rule is
            what keeps it reading as a rectangular object seen from the side
            rather than as a smear. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]"
        />
      </SmoothLink>
    );
  };

  /**
   * The mirrored copy that hangs under a card on the ring.
   *
   * A sibling of the card rather than a child of it, because the card clips its
   * own overflow (it has to — that is what rounds the photograph's corners) and
   * a reflection inside it would be cropped away at the bottom edge.
   *
   * `aria-hidden` and not a link: it is the same photograph twice, and a second
   * tab stop to the same project is noise.
   */
  const reflection = (i: number) => {
    const work = works[i];
    if (!work) return null;
    return (
      <div aria-hidden className="ring-reflect">
        {/* ── Which part of the photograph gets mirrored ──────────────
            A reflection δ below the card's bottom edge shows the card δ ABOVE
            that edge — so the reflection has to be a crop of the photograph's
            BOTTOM, not a squashed copy of the whole thing.

            `h-[313%]` is the card's full height expressed against this 32%-tall
            box (100 / 32), anchored to the box's bottom. The box clips it, so
            what survives is the bottom 38% of the image, and the flip on
            `.ring-reflect` puts that against the card's lower edge where it
            belongs. Without this the reflection is the middle of the picture,
            which reads as a second, wrong photograph. */}
        <div className="absolute inset-x-0 bottom-0 h-[313%] overflow-hidden rounded-b-xl">
          <Media
            src={work.image}
            alt=""
            sizes="(max-width: 1024px) 100vw, 30vw"
            objectPosition={work.objectPosition}
            className="scale-[1.04]"
          />
          {/* The reflection takes the ground's colour faster than the card does
              — a mirror image in a floor is always further away than the thing
              above it, so it has more air to look through. */}
          <div
            className="absolute inset-0 bg-emerald"
            style={{ opacity: "var(--face-haze, 0)" }}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      /* ── The ground is on the PINNED element, not here ──────────────────
         `<section>` is as tall as the whole scroll the pin consumes — about
         five and a half screens. A gradient painted on it is stretched over
         all of that, so the only part ever visible is the top sixth of it:
         the cyclorama rendered as a flat pale wash and the floor and corners
         it depends on were thousands of pixels below the fold. The background
         has to live on the 100vh stage that is actually on screen. The section
         keeps a flat ground for the pin spacer to sit on. */
      className="relative bg-emerald text-cream"
    >
      <div
        ref={pinRef}
        className="relative flex flex-col overflow-hidden lg:h-screen"
      >
        {/* `top` placement: this chapter's lower half is the ring, its
            reflections and the floor, and a bloom under those would fight the
            cyclorama's own floor gradient. */}
        <SheetTexture placement="top" />

        {/* Header — the counter rides in the heading's title-block slot. */}
        <PageContainer className="relative z-20 shrink-0 pt-24 pb-2 md:pt-28">
          <SectionHeading
            index="02"
            eyebrow="Selected Works"
            tone="dark"
            meta={`${String(active + 1).padStart(2, "0")} / ${String(
              count
            ).padStart(2, "0")}`}
          />
        </PageContainer>

        {/* ── The ring (lg and up) ───────────────────────────────────────── */}
        <div
          ref={stageRef}
          className="ring-stage relative hidden min-h-0 flex-1 lg:block"
          style={
            {
              /* The cylinder's radius, and it is deliberately TIGHTER than the
                 arithmetic wants. At 40° apart the chord between neighbours is
                 0.68 × radius, so a 30vw card would want ~800px of radius to
                 clear its neighbour completely. This is ~660px at 1440, which
                 means the flanks overlap the front card's edges by ~20px.
                 That is the point: the first version cleared every card of
                 every other card and the result was an arc of separate objects
                 with gaps of empty page between them. Overlap is what makes it
                 one continuous piece of work reaching both edges of the
                 screen — and the depth sort resolves it correctly for free. */
              "--ring-r": "clamp(480px, 46vw, 760px)",
              /* Where the floor disc sits: just under the tallest card. */
              "--floor-y": "clamp(190px, 29vh, 305px)",
            } as React.CSSProperties
          }
        >
          {/* ── The ghost numeral ────────────────────────────────────────
              The active project's index, outlined, hanging off the right edge.

              Flat type outside the 3D context (the same reason the title is —
              see below), sized in `vw`. It is doing composition, not
              information: the counter in the header already says "05 / 09".
              What it fixes is that the frame had two dead corners.

              ── It was centred, and that was useless ──────────────────
              Measured: at 26vw the glyph box is 288 × 374 and lands at
              x 576–864 — which is exactly where the front card and its left
              neighbour are. The whole numeral was occluded except for one
              stroke of it showing through a gap, where it read as a stray arc
              across the ground rather than as a numeral. Composition elements
              have to go where the composition is EMPTY, and on a ring that
              fills the middle, that is the outer corners.

              So it is ranged right and bleeds a third of itself off the edge.
              Bleeding is deliberate — a number cropped by the page edge reads
              as a printed folio, and one floating clear of it reads as a
              graphic that did not fit.

              `-webkit-text-stroke` with a transparent fill: an outline, because
              a solid numeral this size competes with the photographs. */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-[3%] right-0 translate-x-[32%] font-serif text-[30vw] leading-[0.8] font-medium tracking-tighter text-transparent select-none [-webkit-text-stroke:2px_color-mix(in_srgb,var(--color-gold)_30%,transparent)]"
          >
            {String(active + 1).padStart(2, "0")}
          </span>

          <div
            ref={ringRef}
            className="ring-3d absolute inset-0"
            /* Declared here, not left to the `var()` fallbacks, because GSAP
               needs a computed value to tween from — see the note on
               `.ring-3d` in styles/globals.css. Unitless; the degrees and the
               radius multiply happen in the CSS. */
            style={
              {
                "--ring-tilt": 0,
                "--ring-yaw": 0,
                "--ring-spread": 1,
              } as React.CSSProperties
            }
          >
            {/* The footprint. First child so it sorts under the cards even
                where they touch it. */}
            <div aria-hidden className="ring-floor" />

            {works.map((work, i) => (
              <div
                key={work.id}
                ref={(el) => {
                  facesRef.current[i] = el;
                }}
                className="ring-face h-[clamp(330px,52vh,540px)] w-[clamp(250px,30vw,450px)] will-change-transform"
                style={
                  {
                    "--face-a": `${i * step}deg`,
                    "--face-y": `${RISE[i % RISE.length] ?? 0}vh`,
                  } as React.CSSProperties
                }
              >
                {photo(i)}
                {reflection(i)}
              </div>
            ))}
          </div>

          {/* ── The project's name ─────────────────────────────────────────
              Flat type on the page, deliberately NOT on the card. Inside a 3D
              transform the compositor rasterises at one scale and resamples,
              so a title on the front face is visibly soft next to the same
              face's photograph — and turns to mush the moment it rotates.

              Keyed on the project id so it re-enters on every change rather
              than swapping the string in place, which at this size reads as a
              glitch. Masked, so it rises out of the rule beneath it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
            <PageContainer>
              {/* ── The mask clips DOWN, never ACROSS ──────────────────────
                  `overflow-hidden` clips both axes, so the measure has to be
                  set on the heading INSIDE the mask and never on the mask
                  itself. Putting a `max-w` here instead is what cut "Kyukotoh
                  Gurugram" to "Kyukotol / Gurugra" — the title wrapped to the
                  measure and then had its last glyph clipped off each line by
                  the very element that was supposed to be hiding it vertically.

                  `pb-4` is clearance, not rhythm: the longest name here is
                  "Kapali Mall Food Court", which sets to two lines at this
                  size, and without it the second line lands on the gold
                  progress rail immediately below the stage. */}
              <div className="overflow-hidden pb-4">
                <motion.div
                  key={current?.id}
                  initial={{ y: "108%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* ── Light ink, on purpose ────────────────────────────
                      Everything from here down sits on the deep end of the
                      cyclorama, where the ground resolves to a mid green
                      around #7d9a8b. Emerald type on that is about 2:1 — it
                      was legible on the flat pale version this replaced and it
                      is not legible now.

                      So the section carries TWO ink schemes: charcoal and gold
                      at the top, where the sweep is still paper, and cream
                      below the horizon. That is not an inconsistency, it is
                      what a lit sweep is — and it is the one place on the site
                      where the brand green is dense enough to hold cream type,
                      which is worth having. */}
                  <span className="block font-label text-cream/75">
                    {current?.category}
                  </span>
                  <h3 className="mt-1.5 max-w-[13ch] font-serif text-[2.3rem] leading-[0.98] tracking-tight text-cream xl:text-[2.9rem]">
                    {current?.title}
                  </h3>
                </motion.div>
              </div>
            </PageContainer>
          </div>
        </div>

        {/* ── The stack (below lg) ───────────────────────────────────────── */}
        <div className="flex flex-col gap-10 px-6 pt-6 pb-14 md:px-10 lg:hidden">
          {works.map((work, i) => (
            <article
              key={work.id}
              ref={(el) => {
                stackRef.current[i] = el;
              }}
            >
              <div className="aspect-4/5 w-full">{photo(i)}</div>
              <div className="mt-4">
                <span className="block font-label text-charcoal/50">
                  {work.category}
                </span>
                <h3 className="mt-1.5 font-serif text-3xl leading-[1.04] tracking-tight text-emerald">
                  {work.title}
                </h3>
                {work.description && (
                  <p className="mt-2 max-w-[40ch] text-charcoal/65">
                    {work.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* ── Footer: progress, index, and the way out ───────────────────── */}
        <PageContainer className="relative z-20 hidden shrink-0 pb-4 lg:block">
          <div className="relative mb-0.5 h-px bg-cream/25">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 h-px w-0 bg-gold"
            />
          </div>
          <div className="flex items-start justify-between gap-8">
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-label">
              {works.map((work, i) => (
                <button
                  key={work.id}
                  type="button"
                  onClick={() => jump(i)}
                  className={cn(
                    "cursor-pointer py-4 transition-colors duration-300",
                    i === active
                      ? "text-cream"
                      : "text-cream/55 hover:text-cream/85"
                  )}
                >
                  {String(i + 1).padStart(2, "0")} {work.title}
                </button>
              ))}
            </div>

            {/* What is left of the closing panel that used to be the tenth
                card on the track. A ring has no end to put a card at — coming
                round to the first project again is the whole point of it — so
                the invitation moved here, where it also gives the index row a
                right-hand edge. */}
            <SmoothLink
              href="#contact"
              className="shrink-0 py-4 font-label whitespace-nowrap text-gold-soft transition-colors duration-300 hover:text-cream"
            >
              More, on request &rarr;
            </SmoothLink>
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
