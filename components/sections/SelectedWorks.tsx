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
 *   5. A CAPTION PLATE, ranged into the bottom-right corner: where the
 *      commission is, when it was, how big, and the way into it. This corner
 *      carried a large outlined numeral for a while and it was one gold mark
 *      too many next to <Ornament />; a caption fills the same void and says
 *      something.
 *   6. A DENSER ARC. Bigger cards on a tighter radius with a shorter
 *      perspective, so the arc reaches both edges of the screen and the cards
 *      overlap slightly. Award-site lesson, plainly: fill the frame.
 *
 * ── The geometry, in one place ─────────────────────────────────────────────
 *
 *   · The STAGE owns `perspective`. It cannot live on the ring: perspective
 *     applies to an element's children, so on the rotating element itself every
 *     card would get its own vanishing point and the ring would shear.
 *   · The RING owns `preserve-3d` and the pointer lean, and is pushed back by
 *     its own radius so the front face lands on the perspective plane at
 *     scale 1. It does NOT rotate: the ring loops, so the spin is per-face.
 *   · Each FACE is swung to `rotateY(angle) translateZ(radius)`, where the
 *     angle is recomputed every frame as the station nearest the front — see
 *     the note on `SPAN`. That is what keeps a card on both flanks at every
 *     scroll position instead of the arc running out at its ends.
 *
 * All three are in styles/globals.css (`.ring-stage`, `.ring-3d`, `.ring-face`)
 * because Tailwind has no utilities that spell them. This file owns only the
 * numbers that change per frame, and writes them as custom properties straight
 * to the DOM — never through React state, which at scroll rate would re-render
 * the section sixty times a second.
 *
 * Kept from the previous version: the pin + scrub, the progress hairline, the
 * "01 / 09" readout, the index buttons, and ←/→ stepping.
 *
 * Below `lg` the ring is released into a horizontal SNAPPING RAIL — the same
 * carousel gesture without the perspective, because a 3D ring on a phone is a
 * lot of compositing for a 380px-wide arc and a touch screen has no pointer to
 * drive the turntable with. See the note on the rail's markup at the foot of
 * this file for what the two layouts do and do not share.
 */
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks";
import {
  PageContainer,
  Media,
  Ornament,
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

/**
 * Degrees between neighbouring faces — the ring's PITCH.
 *
 * ── Why this is a constant and not `360 / count` ───────────────────
 *
 * It used to be `360 / count`, on the reasoning that the faces should be spread
 * evenly around a CLOSED cylinder. That is only the same number as this one
 * while there happen to be nine projects, and the moment the studio's Sanity
 * dataset held four the pitch became 90° — at which the two neighbours are
 * exactly edge-on, so they have no projected width and `backface-visibility`
 * takes them out entirely. The section rendered as ONE card at a time with the
 * next appearing out of nothing, which is not the arc this was designed as.
 *
 * The pitch is what the whole composition is measured against: the radius below
 * is chosen so that faces 40° apart overlap by ~20px, the sweep peaks at 26°,
 * and the haze ramp is tuned so the second card out is present but clearly
 * behind. Letting the item count move it silently retunes all of that.
 *
 * So the ring is an ARC of fixed pitch, not a closed cylinder, and only the
 * front hemisphere was ever drawn anyway (see CUT_AT) — nothing is lost by the
 * back not joining up. What a visitor sees is three cards: one square-on and a
 * turned neighbour each side, whether the studio has four projects or nine.
 */
const PITCH = 40;

/**
 * Signed shortest angle from the front of the ring, over a given period.
 *
 * ── The period is not always 360° ────────────────────────────────
 *
 * It was hard-coded to 360, which is right only for a ring whose faces go all
 * the way round. At four projects and a 40° pitch the faces span 160° and the
 * remaining 200° is empty — so the LAST project has to come back round and
 * stand to the left of the first, or the arc has a bare flank at both ends. The
 * ring's period is `count × pitch`, and wrapping over that is what turns a
 * finite arc into a loop.
 *
 * Returns a value in [-period/2, period/2).
 */
function wrapInto(deg: number, period: number) {
  const half = period / 2;
  return ((deg % period) + period + half) % period - half;
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
  /**
   * Degrees between neighbouring faces — `PITCH`, except when there are enough
   * projects for `PITCH` to wrap the ring past itself.
   *
   * `Math.min` is the guard: at ten or more projects a fixed 40° pitch would
   * carry the last faces back round through the front of the arc, where they
   * would sit on top of the first ones. Past nine the ring closes up and the
   * pitch tightens to whatever divides the circle, which is the behaviour the
   * old `360 / count` had — it was only ever WRONG below nine.
   *
   * `count > 0` matters for its own reason: `360 / 0` is Infinity, and the very
   * next thing that happens to it is `(i - t) * step` with i = t = 0, which is
   * 0 × Infinity, or NaN, written straight into `--face-a`. A transform with
   * NaN in it is invalid, so the browser drops the whole declaration and every
   * face renders at the same station. `getWorks()` cannot return an empty array
   * today, but a component that turns into a pile of coincident cards because a
   * caller passed `[]` should not be the way we find that out.
   */
  const step = count > 0 ? Math.min(PITCH, 360 / count) : 0;

  /**
   * ── The ring loops, so there is never a bare flank ─────────────────
   *
   * Faces used to sit at fixed stations, `i × pitch`, and the ring rotated
   * underneath them as one rigid body. That is right for a closed cylinder and
   * it leaves an ARC open at both ends: at the first project there is nothing
   * to its left and at the last nothing to its right, so the section opens and
   * closes on a lopsided two-card frame with half the stage empty.
   *
   * Each face is now placed, per frame, at whichever station around the loop is
   * NEAREST the front — `wrapInto` above. The last project comes round to stand
   * left of the first, and what a visitor sees at every position is the same
   * thing: one card square-on with a turned neighbour on each side.
   *
   * `SPAN` is the loop's period. `CUT` is where a face reaches zero opacity,
   * and it is clamped to the HALF-period for a reason that is load-bearing
   * rather than cosmetic: the half-period is exactly where a face wraps from
   * one flank to the other, and a card that teleports across the stage in a
   * single frame is the ugliest thing this section could do. Fading it out by
   * the time it gets there means the jump happens while it is invisible.
   *
   * At nine projects SPAN is 360 and the half-period 180, so `CUT_AT` wins and
   * none of this changes what was there. At four it is 160, the flanks fade out
   * by 80°, and the loop is seamless.
   *
   * Below three projects a three-card arc is arithmetically impossible — the
   * same photograph would have to stand in two places at once — so one or two
   * commissions still show one or two cards. That is the honest answer for a
   * studio with two projects, not a case to pad out.
   */
  const SPAN = count * step;
  const CUT = Math.min(CUT_AT, SPAN / 2);
  /** The haze ramp, held at the proportion `FADE_FROM` sets against `CUT_AT`. */
  const FADE = CUT * (FADE_FROM / CUT_AT);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  /**
   * ── Two ref arrays, deliberately ──────────────────────────────────────
   *
   * The ring's faces and the rail's cards are different DOM, and only one set
   * is ever laid out. They started out sharing one ref array so that `jump`
   * could reach a card in either layout, and that was a bug: `apply` runs once
   * before the desktop matchMedia is even consulted, so on a phone it wrote
   * ring geometry onto the RAIL's articles — every card more than 94° round the
   * imaginary ring got `opacity: 0` and the rest got a near-opaque haze. The
   * whole section rendered as an empty cream box.
   *
   * Separate arrays, and `apply` refuses to run without a ring (below). `jump`
   * takes whichever array has the element.
   *
   * `stackRef` keeps its name from the vertical stack the rail replaced — it is
   * still "the mobile cards", and renaming it would touch six call sites to say
   * the same thing.
   */
  const facesRef = useRef<(HTMLElement | null)[]>([]);
  const stackRef = useRef<(HTMLElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  /**
   * ── The rail (below `lg`) ─────────────────────────────────────────────
   *
   * Below `lg` the section is THE SAME RING, turned by a horizontal scroller
   * instead of by the page. `railRef` is that scroller — a transparent sheet of
   * snap pages laid over the stage, one page per project. It is the gesture
   * surface and, because it is flat, the click target too (see the markup).
   *
   * The ring it drives is its own: `mobileRingRef` / `mobileFacesRef`. Both
   * rings are in the DOM at once — `lg:hidden` and `hidden lg:block` only
   * toggle `display` — so the geometry writer has to be told which one it is
   * addressing rather than reaching for a single module-wide ref. See `apply`.
   *
   * `railFrameRef` is the frame a pending read is queued on. There is no
   * mobile-only progress bar to hold: the ring's position goes to the same
   * `progressRef` hairline the desktop footer draws — see the footer.
   */
  const railRef = useRef<HTMLDivElement>(null);
  const railFrameRef = useRef(0);
  const mobileRingRef = useRef<HTMLDivElement>(null);
  const mobileFacesRef = useRef<(HTMLElement | null)[]>([]);

  const stRef = useRef<ScrollTrigger | null>(null);
  /** Continuous ring position, in faces: 0 = first project at the front. */
  const posRef = useRef(0);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  /**
   * Put a ring at position `t` (in faces, so 4.5 is halfway between the fifth
   * and sixth project).
   *
   * Everything here is a direct style write. The only React state it touches is
   * `active`, and that is guarded on a change of integer index — so the section
   * re-renders nine times over the whole scroll rather than on every frame.
   *
   * ── Why it takes a ring rather than reading one ──────────────────────────
   *
   * There are two rings now — the pinned one above `lg` and the swiped one
   * below it — and BOTH are always in the DOM, because the breakpoint classes
   * only toggle `display`. A writer that reached for `ringRef` would therefore
   * always address the desktop ring, including on a phone where it is the
   * hidden one, and the visible ring would never move.
   *
   * So the caller passes the pair it owns. `ctx` omitted means the desktop
   * ring, which is what the ScrollTrigger and the opening pose both want.
   */
  const apply = useCallback((
    t: number,
    linear?: number,
    ctx?: { ring: HTMLElement | null; faces: (HTMLElement | null)[] }
  ) => {
    posRef.current = t;

    const ring = ctx ? ctx.ring : ringRef.current;
    const faces = ctx ? ctx.faces : facesRef.current;
    // The ring this call names is not mounted. Nothing below has a subject.
    if (!ring) return;

    faces.forEach((face, i) => {
      if (!face) return;

      // Where this face stands THIS frame, as a signed angle from the front.
      // It is the whole spin: there is no rotation left on the ring for it to
      // compose with, because a looping ring is not a rigid body — see the note
      // on `SPAN` above and on `.ring-3d` in styles/globals.css.
      const rel = wrapInto((i - t) * step, SPAN);
      const away = Math.abs(rel);
      face.style.setProperty("--face-a", `${rel}deg`);

      // Aerial perspective: the further round the ring a face is, the more of
      // the page's own colour is washed over it, until it disappears into the
      // paper. This is the light-ground equivalent of the reference's fall into
      // black, and it is one opacity on a child — no filters, no blur, nothing
      // that would cost a frame on a nine-card ring.
      const haze =
        away <= FADE
          ? (away / FADE) * 0.34
          : 0.34 + Math.min(1, (away - FADE) / (CUT - FADE)) * 0.62;

      // Exactly one face is a link, and it is the one at the front.
      //
      // This was an angular window, `away <= 26` — which at the halfway point
      // between two projects has BOTH of them inside it: two overlapping links
      // across the middle of the stage, with paint order deciding which one a
      // click reaches. Naming the front face instead is unambiguous at every
      // position, including that one.
      const live = i === Math.round(t);
      face.style.opacity = away >= CUT ? "0" : "1";
      face.style.pointerEvents = live ? "auto" : "none";

      // ── The card behind the front one is not a tab stop ────────────────
      //
      // `pointer-events: none` stops the MOUSE and does nothing whatsoever to
      // the keyboard: without this, tabbing into the section walked all nine
      // cards, four of which are at `opacity: 0` on the back half of the ring.
      // Focus would land on a link that is not on screen, the browser would
      // scroll to bring its box into view, and the pinned section would jump.
      // Every one of those links points at #contact anyway, so nine of them
      // was eight tab stops of noise even when they were visible.
      //
      // `inert` rather than `tabIndex = -1` on the anchor: it takes the whole
      // subtree out of the tab order AND out of the accessibility tree in one
      // property, so a screen reader is not read the back of the ring either.
      // Assigning it unconditionally every frame would toggle an attribute on
      // nine elements sixty times a second, hence the compare.
      if (face.inert === live) face.inert = !live;
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
      // `count - 1` is the number of GAPS between projects, and with a single
      // project there are none — the bare division is 0/0 = NaN, which assigns
      // `width: NaN%`, an invalid declaration the browser drops. The rail then
      // keeps whatever width it last had instead of tracking the scroll.
      const shown = linear ?? (count > 1 ? t / (count - 1) : 1);
      progressRef.current.style.width = `${Math.max(0, Math.min(1, shown)) * 100}%`;
    }

    const idx = Math.round(t);
    if (idx !== activeRef.current && idx >= 0 && idx < count) {
      activeRef.current = idx;
      setActive(idx);
    }
    // `count` and `step` are the ring's geometry and they come from the props
    // now, so this cannot claim an empty dependency list any more.
  }, [count, step, SPAN, CUT, FADE]);

  /**
   * Read the rail's position and turn it into ring geometry.
   *
   * ── The scroller IS the turntable ────────────────────────────────────────
   *
   * Each snap page is exactly the rail's own width, so `scrollLeft / width` is
   * the ring position in faces directly: 0 is the first project square-on, 1.5
   * is halfway between the second and third. No mapping, no scaling.
   *
   * It is fed to `apply` LINEARLY, unlike the desktop trigger which pushes its
   * progress through `ringPosition`'s dwell first. That dwell exists because a
   * scrubbed pin has no rest positions of its own and would otherwise spend as
   * much of its travel halfway between two projects as square-on to one. Scroll
   * snapping already solves that here — the rail physically comes to rest on
   * integers — and applying the curve on top would decouple the ring from the
   * finger dragging it, which is the one thing a touch carousel must not do.
   */
  const readRail = useCallback(() => {
    const rail = railRef.current;
    // `lg:hidden` leaves the rail mounted but `display: none` above 1024px,
    // where every measurement below is 0. Nothing to report from a box that is
    // not laid out.
    if (!rail || !rail.clientWidth) return;

    const page = rail.clientWidth;
    const t = Math.max(0, Math.min(count - 1, rail.scrollLeft / page));

    apply(t, undefined, {
      ring: mobileRingRef.current,
      faces: mobileFacesRef.current,
    });
  }, [apply, count]);

  /** rAF-throttled, because `scroll` on a touch rail fires faster than paint. */
  const onRailScroll = useCallback(() => {
    if (railFrameRef.current) return;
    railFrameRef.current = requestAnimationFrame(() => {
      railFrameRef.current = 0;
      readRail();
    });
  }, [readRail]);

  /**
   * Turn the mobile ring to project `i`. Returns false when there is no rail
   * laid out — i.e. on desktop — so `jump` can fall through to the pin.
   *
   * Native `scrollTo` rather than Lenis: this is an INNER scroller, and Lenis
   * drives the document. `behavior: "smooth"` is the browser's own, which the
   * UA already flattens under `prefers-reduced-motion`.
   */
  const scrollRailTo = useCallback((i: number) => {
    const rail = railRef.current;
    if (!rail || !rail.clientWidth) return false;
    rail.scrollTo({ left: i * rail.clientWidth, behavior: "smooth" });
    return true;
  }, []);

  /**
   * Bring project `i` to the front of the ring.
   *
   * Declared ABOVE the effect that uses it, and memoised on `count`. It used to
   * sit below as a plain `const`, which worked only by accident: the keydown
   * listener closed over whichever `jump` existed on the first render and kept
   * calling that one forever, so it also kept that render's `count`. Nothing
   * broke while the projects were a module constant. They come from the CMS
   * now, and a handler holding the project count from before the content
   * arrived is exactly the kind of bug that only shows up in production.
   */
  const jump = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(count - 1, i));
      const st = stRef.current;

      // Pinned (desktop): the ring's position IS the scroll position, so this
      // has to travel through the scroller or the two would disagree the moment
      // the next wheel event arrived.
      if (st) {
        // Same divide-by-zero guard as the progress rail in `apply`, and a
        // worse failure: NaN here is passed to the scroller as a position.
        const frac = count > 1 ? target / (count - 1) : 0;
        smoothScrollTo(st.start + frac * (st.end - st.start));
        return;
      }

      // No pin — below `lg`, where the section is a horizontal rail. The card
      // is already on screen; what has to move is the rail, sideways.
      if (scrollRailTo(target)) return;

      // Neither layout is measurable (the section has not laid out yet). Fall
      // back to putting the card in view the only way left.
      const card = facesRef.current[target] ?? stackRef.current[target];
      if (card) smoothScrollTo(card, { offset: -90 });
    },
    [count, scrollRailTo]
  );

  /**
   * Seed the rail's readout, and keep it honest when the box changes size.
   *
   * Without this the gold bar is empty and the counter says 01 until the first
   * swipe — which is wrong the moment the section is arrived at from a link, or
   * the phone is turned, or a `sm` breakpoint changes how many cards are in
   * view and therefore how far the rail can travel at all.
   *
   * `ResizeObserver` on the rail rather than a window `resize` listener: a
   * mobile browser's URL bar collapsing fires `resize` constantly and does not
   * change the rail's width, and crossing `lg` in either direction changes the
   * rail's width without any window resize the layout effect would see.
   */
  useIsomorphicLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    readRail();
    const ro = new ResizeObserver(() => readRail());
    ro.observe(rail);

    return () => {
      ro.disconnect();
      if (railFrameRef.current) {
        cancelAnimationFrame(railFrameRef.current);
        railFrameRef.current = 0;
      }
    };
  }, [readRail]);

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
      // `count - 1` is the number of TRANSITIONS, which is what the scroll is
      // actually spending itself on — nine projects have eight gaps between
      // them. Multiplying by `count` billed one extra gap that does not exist,
      // and the cost of it landed entirely on the degenerate end: a studio with
      // a single project got 0.62 of a viewport of pinned scrolling in which
      // absolutely nothing moves, because a one-face ring has nowhere to turn
      // to. The trailing 0.35 is the beat the last project holds before the pin
      // releases, so the section does not end on a cut.
      const distance = () =>
        window.innerHeight * (Math.max(0, count - 1) * 0.62 + 0.35);

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

      /**
       * ── What reduced motion switches off here, and what it does not ─────
       *
       * The site's global `prefers-reduced-motion` rule collapses CSS
       * animations and transitions. It cannot touch either of the two things
       * below, because both are GSAP writing a custom property frame by frame —
       * there is no CSS animation for a media query to shorten.
       *
       * So they are switched off in JS: the pointer lean, which is motion the
       * visitor did not ask for and the exact kind that provokes symptoms, and
       * the opening spread, which is an unprompted 1.5s move of nine elements.
       *
       * The ring's ROTATION deliberately survives. It is not autonomous motion:
       * it is scrubbed off the scroll position, moves only while the visitor
       * moves, and stops the instant they stop. Reduced motion asks for nothing
       * to move on its own, not for scrolling to stop working — and without the
       * rotation the section would be a single photograph with eight
       * unreachable ones behind it.
       */
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (stage && ring && !reduced) {
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
      } else if (ring) {
        // Reduced motion: the ring is simply already open. `--ring-spread` is
        // declared as 1 on the element, so there is nothing to set — but say so
        // rather than leaving a reader to work out that the missing `else` is
        // deliberate and not a case that was forgotten.
      }

      return () => {
        if (stage && onPointerMove) {
          stage.removeEventListener("pointermove", onPointerMove);
        }
        st.kill();
        stRef.current = null;
      };
    });

    /**
     * ── The mobile ring's entrance ────────────────────────────────────────
     *
     * The desktop ring opens out from near its own axis when the section comes
     * into view, and the phone one should too: without it the arc is simply
     * already there when you scroll to it, which after the rest of this page —
     * every chapter of which arrives — reads as the one section that failed to
     * animate.
     *
     * It is the same tween on the same property. `--ring-spread` scales the
     * radius inside `.ring-face`, so this is one tween on one element rather
     * than nine staggered ones, and because it MULTIPLIES the radius rather
     * than replacing it, it cannot fight the per-face geometry `readRail` is
     * writing at the same time.
     *
     * `0.42` rather than the desktop's `0.28`: a phone stage is small enough
     * that nesting the cards that tightly stacks nine near-identical
     * rectangles into a smear before it opens.
     *
     * Inside `matchMedia` so GSAP reverts it on a crossing of the breakpoint,
     * and guarded on reduced motion — where the ring is simply already open,
     * `--ring-spread` being declared as 1 on the element.
     */
    mm.add(
      "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      () => {
        const ring = mobileRingRef.current;
        if (!ring) return;
        gsap.fromTo(
          ring,
          { "--ring-spread": 0.42 },
          {
            "--ring-spread": 1,
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          }
        );
      }
    );

    // ←/→ steps between projects while the ring is on screen.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

      // ── Not while someone is typing ────────────────────────────────────
      //
      // This listener is on `window`, so it fired for every arrow key on the
      // page — including the ones moving a caret through the enquiry form's
      // fields. The section is over five viewports tall, so "is it on screen"
      // stays true for a long stretch of the page and is not the guard it
      // looks like. Pressing → to correct a typo would silently spin the ring
      // and drag the page to another project.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable ||
          t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT")
      ) {
        return;
      }
      // A modified arrow is a browser or OS shortcut (back/forward, word-wise
      // caret movement), never ours to take.
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      e.preventDefault();
      jump(activeRef.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      mm.revert();
    };
  }, [apply, jump]);

  const current = works[active] ?? works[0];
  /**
   * The active project's facts, in the order a caption sets them, with the
   * blanks dropped rather than placeheld — see the note on the plate below.
   */
  const facts = [current?.location, current?.year, current?.area].filter(
    (fact): fact is string => Boolean(fact)
  );

  /** One project's photograph, used by both the ring and the mobile rail. */
  const photo = (i: number) => {
    const work = works[i];
    if (!work) return null;
    return (
      <SmoothLink
        /* ── A card leads to the project, not to the form ────────────────
           Every card used to point at #contact, which meant the one thing a
           visitor could do with a commission that interested them was ask
           about a different one. It goes to the project's own page now — see
           app/work/[slug]/page.tsx — and the enquiry form is at the foot of
           that page, so the route to the form is longer by one step and now
           passes through the thing the visitor actually wanted to see.

           <SmoothLink /> rather than a bare <Link />: it hands the click to the
           site's navigation layer, so the change of page is covered by the
           chapter card the rest of the site uses instead of being a white
           flash. It falls back to the router on its own if that overlay is not
           mounted or the visitor has asked for reduced motion. */
        href={`/work/${work.id}`}
        /* The chapter card would otherwise name this destination by
           title-casing the slug, and a Sanity slug is whatever the studio
           typed. See `cardLabel` in components/ui/SmoothLink.tsx. */
        cardLabel={work.title}
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
          /* 62vw below `lg`, not 100vw: the ring's faces are ~58vw wide there
             (see the mobile stage), and claiming the full viewport made every
             phone download an image nearly three times the area it draws. */
          sizes="(max-width: 1024px) 62vw, 30vw"
          /* The focal point the studio set in the CMS. Undefined for the
             committed constants, which are centred — see the note on
             `objectPosition` in types/index.ts. */
          objectPosition={work.objectPosition}
          className="scale-[1.04] transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.12]"
        />

        {/* The haze. Its opacity is written per frame by `apply` on the ring;
            in the mobile rail it stays at 0 and costs nothing. */}
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
          /* ── It fades with the card, and only most of the way ────────────
             The haze washes the PHOTOGRAPH toward the ground colour as a face
             turns away, and this rule used to sit on top of it at full
             strength. So the furthest cards — the ones that are 84% emerald
             and barely there — kept a hard gold edge, and at the end of the
             arc where a face is a few pixels wide that edge WAS the face: a
             bright vertical line standing on the ground with nothing inside
             it, reading as a scratch on the render rather than as a panel
             seen side-on.

             Not all the way to zero, though. The whole reason for this rule is
             that an edge-on card has no silhouette of its own, so fading it
             out completely trades a scratch for a smear. At 0.7 of the haze
             the furthest face keeps about 40% of its edge — enough to still
             read as a rectangular object, not enough to draw attention to
             itself. */
          style={{ opacity: "calc(1 - var(--face-haze, 0) * 0.7)" }}
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
            sizes="(max-width: 1024px) 62vw, 30vw"
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
      /* ── The masthead has to be told this band is dark ───────────────────
         This section is `bg-emerald` — the same ground <Process /> stands on —
         and it was the only dark band on the site that did not declare itself.
         The masthead picks its palette by looking for `[data-chrome="dark"]`
         under its own midpoint (components/layout/Navbar.tsx), so with the
         attribute missing it fell through to its LIGHT cut: pale glass, emerald
         links, an emerald wordmark and an emerald hairline, floating over deep
         green. Over <Process /> the identical bar renders in its dark cut —
         cream links, champagne wordmark, gold rule — which is why the two green
         chapters did not look like the same page.

         One attribute, and there is nothing else to change: every value the bar
         uses on this ground is the same one it already uses on Process. */
      data-chrome="dark"
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
        {/* ── The vine, and four of it rather than two ─────────────────
            `tone="dark"` is the champagne cut of the ink (`--color-gold-soft`,
            the same hue lifted to 64% lightness). Plain gold is sampled from
            the logo and is a ~2:1 line against cream — right on paper, and on
            this section's deep green it goes muddy and reads as a smudge
            rather than as a drawn line. See <Ornament />'s `tone`.

            `placement="top"` gives the top-left and top-right pair. The two
            below are added by hand because <SheetTexture /> only ships the two
            arrangements, and this section wants all four corners: it is the
            only chapter with no display title, so its margins are carrying the
            composition on their own.

            Held back to 55%/45%. At full strength a vine in each corner stops
            being a marginal flourish and becomes a frame, and the bottom pair
            in particular sits behind the project's name and the caption plate
            — it has to stay under type rather than compete with it. Every
            placement already bleeds ~44% of itself off the page edge, which is
            what keeps them reading as something larger growing in from the
            margin. */}
        <SheetTexture tone="dark" placement="top" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block"
        >
          <Ornament
            placement="bottom-left"
            tone="soft"
            size="md"
            className="opacity-55"
          />
          <Ornament
            placement="bottom-right"
            tone="soft"
            size="sm"
            className="opacity-45"
          />
        </div>

        {/* Header — the counter rides in the heading's title-block slot. */}
        <PageContainer className="relative z-20 shrink-0 pt-24 pb-2 md:pt-28">
          <SectionHeading
            eyebrow="Selected Works"
            /* ── No title here, and it is the only chapter without one ──────
               Every other chapter sets a display title under its eyebrow. This
               one is deliberately label-only: the photographs are the subject
               and the studio's note was that the section should carry no copy
               beyond the project's own name at the foot of it. A title was
               tried here and removed.

               What fills the top band instead is the vine — see the ornaments
               below. Drawing rather than type, which is what the rest of the
               site does with its margins anyway. */
            tone="dark"
            /* ── One counter, one number ──────────────────────────────────
               Both layouts are rings and both report through `active`, so this
               is a single expression again rather than a pair of breakpoint
               variants. The two rings are turned by different things — a pinned
               ScrollTrigger above `lg`, a snapping scroller below it — but each
               writes its position through the same `apply`, and `apply` owns
               `active`.

               This used to print the project COUNT below `lg` — "9 projects" —
               and that was correct for what was there: the vertical stack that
               preceded the rail had no notion of a current project, so `active`
               was never anything but 0 and a counter would have read "01 / 09"
               the whole way down it. A position indicator that does not
               indicate position is worse than none: it says the page is
               stuck. */
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
                    /* The station this face starts at, so the frame before
                       hydration is the same arc as the first real one rather
                       than a pile of coincident cards. `apply` overwrites it
                       every frame from there on. */
                    "--face-a": `${wrapInto(i * step, SPAN)}deg`,
                    "--face-y": `${RISE[i % RISE.length] ?? 0}vh`,
                  } as React.CSSProperties
                }
              >
                {photo(i)}
                {reflection(i)}
              </div>
            ))}
          </div>

          {/* ── The click target, and why it is not the card ─────────────────
              The front card is a real <SmoothLink> and it is NOT reliably
              clickable, for a reason that has nothing to do with this code:
              Chrome hit-tests differently inside a `transform-style:
              preserve-3d` context than it paints.

              Measured, on a production build: `elementsFromPoint()` at the
              centre of the front card returns that card's own <a> with nothing
              above it — and a real mouse click at the same coordinates is
              delivered to `div.ring-stage`. The anchor is not in the event
              path at all. So the click did nothing: no route change, no chapter
              card, no scroll. That is the "clicking a project does not open it"
              report, and clicking harder never helps, because the event was
              never going to reach the link.

              `pointer-events` is not the cause — the front face computes
              `auto`, the flanks `none`, exactly as `apply()` intends. The
              geometry is what disagrees.

              So the mouse gets a FLAT target: a plain absolutely-positioned
              anchor that is a sibling of the 3D context rather than inside it,
              so no 3D hit-testing is involved in reaching it. Its box is the
              face's own `w`/`h` — the same two clamps, so they cannot drift —
              parked where the front face actually lands.

              ── 50% / 35%, and both are measured ────────────────────────────
              The front face sits at `translateZ(0)` after the ring's own
              `translateZ(-r)`, so it lands ON the perspective plane at scale 1
              and dead centre horizontally. The camera's fixed `rotateX(7deg)`
              is what pushes it above the stage's middle. Sampled at 1024×768,
              1280×800, 1440×900 and 1920×1080, its centre came out at 50.0%,
              50.0%, 50.0%, 49.0% across and 35.7%, 34.1%, 34.8%, 36.0% down.
              35% covers all four with room to spare, and the target is bigger
              than the artwork it stands in for anyway.

              ── It is invisible to assistive tech, on purpose ───────────────
              `aria-hidden` + `tabIndex={-1}`: the face anchors are still real
              links with real labels, so the crawler and the keyboard already
              have a complete, correct path to every project — pressing Enter
              on a focused anchor dispatches to the element and never goes near
              a hit test, which is why keyboard was the one route that always
              worked. Exposing this as a second link would announce every
              project twice to a screen reader in order to fix a mouse bug. */}
          {current && (
            <SmoothLink
              href={`/work/${current.id}`}
              cardLabel={current.title}
              aria-hidden
              tabIndex={-1}
              className="absolute top-[35%] left-1/2 z-5 h-[clamp(330px,52vh,540px)] w-[clamp(250px,30vw,450px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            >
              {/* Deliberately empty. This is a hit area, not a control with a
                  face — everything a visitor sees is the card behind it. */}
              <span className="sr-only">{current.title}</span>
            </SmoothLink>
          )}

          {/* ── The project's name ─────────────────────────────────────────
              Flat type on the page, deliberately NOT on the card. Inside a 3D
              transform the compositor rasterises at one scale and resamples,
              so a title on the front face is visibly soft next to the same
              face's photograph — and turns to mush the moment it rotates.

              Keyed on the project id so it re-enters on every change rather
              than swapping the string in place, which at this size reads as a
              glitch. Masked, so it rises out of the rule beneath it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
            {/* ── Ranged to both edges, not clustered on one ───────────
                `justify-between` rather than a gap, so the name holds the left
                corner and the plate holds the right — the same two-ended
                structure as the index row and "More, on request" on the rail
                directly below. That is what ties the band to the section
                instead of leaving it as two things floating at one end.

                It is also what replaced the folio: a numeral was weighting
                that corner, and a caption that belongs there does the same job
                without a second decorative gold mark on the page. */}
            <PageContainer className="flex items-end justify-between gap-10">
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

              {/* ── The plate ───────────────────────────────────────────
                  Where the commission is, when it was, how big — and the way
                  into it. It sits on the title's baseline in the band that was
                  empty between the name and the folio.

                  ── It renders only what exists ─────────────────────────
                  `location`, `area` and `year` are all optional on `Work` and
                  optional in the Studio, so most of the time this is one or two
                  facts rather than three, and for a project with none of them
                  filled in it is the link alone. That is the point: a caption
                  that reserved space for three facts would print a row of
                  em-dashes for a studio that has not typed them yet, which is
                  worse than not printing the row. It fills out on its own as
                  the CMS does.

                  ── The link is the affordance the ring did not have ────
                  The cards point at /work/[slug] now, and nothing on the page
                  said so — a photograph on a turntable does not read as a link,
                  and the only cursor cue was on the front card. This says it in
                  words. `pointer-events-auto` because the wrapper above turns
                  them off for the whole overlay, which it has to: the overlay
                  spans the stage and would otherwise swallow every click meant
                  for a card. */}
              {current && (
                <div className="overflow-hidden pb-5 text-right">
                  <motion.div
                    key={`${current.id}-plate`}
                    initial={{ y: "120%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.62,
                      // A beat behind the name, so the pair reads as one move
                      // with a direction rather than as two things arriving.
                      delay: 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* The hairline. It is the section-heading gesture and
                        the spine's, and repeating it here is the cheapest way
                        to make a caption read as part of the same drawing
                        rather than as a label that landed in the corner.
                        `ml-auto` because the block is ranged right. */}
                    <span
                      aria-hidden
                      className="mb-4 ml-auto block h-px w-14 bg-gold/70"
                    />
                    {facts.length > 0 && (
                      <span className="mb-2 ml-auto block max-w-[34ch] font-label text-cream/55">
                        {facts.join("  ·  ")}
                      </span>
                    )}
                    <SmoothLink
                      href={`/work/${current.id}`}
                      /* `py-1.5` only for the target: 12px label type on its
                         own is a 16px-tall hit area, under the 24px minimum. */
                      className="pointer-events-auto inline-block py-1.5 font-label whitespace-nowrap text-gold-soft transition-colors duration-300 hover:text-cream"
                    >
                      View project &rarr;
                    </SmoothLink>
                  </motion.div>
                </div>
              )}
            </PageContainer>
          </div>
        </div>

        {/* ── The ring, below lg ───────────────────────────────────────────
            The SAME turntable the desktop draws, at phone scale, turned by a
            horizontal scroller instead of by the page.

            ── Why not the vertical stack this replaced ─────────────────────
            Below `lg` this section used to release into a column of cards, and
            then into a flat horizontal rail of them. Both were legible and
            neither was this site: the desktop chapter is nine photographs on a
            turntable, and a phone that shows the same nine as a filmstrip reads
            as a different studio's page. The client's note was exactly that —
            make it consistent with the desktop.

            Everything visual is shared verbatim: `.ring-stage`, `.ring-3d`,
            `.ring-face`, `.ring-floor` and `.ring-reflect` in globals.css, and
            `photo()` / `reflection()` above. What changes is three numbers (the
            radius, the perspective and where the floor sits) and what turns it.

            ── What turns it ───────────────────────────────────────────────
            Not a pin. A pinned, scrubbed 3D ring on a phone means holding the
            page still while compositing nine transformed layers per frame, and
            it takes the page's own scroll away from a visitor who was trying to
            get past the section. The scroller over the stage does it instead:
            one snap page per project, each exactly the stage's width, so
            `scrollLeft / width` IS the ring position in faces. Native momentum,
            native snapping, and the page keeps scrolling vertically through the
            whole thing. See `readRail`. */}
        <div
          /* The height the stage gets to work in. Tall enough for a card plus
             its reflection and the floor ellipse under it; capped so that on a
             short phone in landscape the caption below is still on screen with
             it. */
          className="relative h-[clamp(340px,50vh,440px)] w-full lg:hidden"
        >
          <div
            className="ring-stage absolute inset-0"
            style={
              {
                /* ── Three numbers, and each is the desktop's rescaled ──────
                   RADIUS. Desktop is `46vw` against a `30vw` card — a ratio of
                   ~1.53, which is what puts the flanks a little INSIDE their
                   neighbours' edges rather than clear of them. The card here is
                   58vw, so the same ratio is ~89vw; 80vw is used instead
                   because the overlap is what makes the arc read as one
                   continuous object, and a phone needs proportionally more of
                   it to fill 390px with three cards.

                   PERSPECTIVE. `.ring-stage` sets 1250px, chosen against a
                   1440px stage. The same absolute distance against a 390px one
                   is a far longer lens — the arc flattens into a row of
                   overlapping rectangles and the whole point is lost. 620
                   holds roughly the desktop's ratio of viewport to focal
                   length, so the flanks foreshorten by about as much.

                   FLOOR. Just under the tallest card, as on desktop: half the
                   card's height plus a little air. */
                "--ring-r": "clamp(230px, 80vw, 360px)",
                "--ring-persp": "620px",
                "--floor-y": "clamp(130px, 20vh, 190px)",
              } as React.CSSProperties
            }
          >
            <div
              ref={mobileRingRef}
              className="ring-3d absolute inset-0"
              /* Declared rather than left to the `var()` fallbacks for the same
                 reason as the desktop ring: GSAP needs a computed value to
                 tween `--ring-spread` from. Unitless — the degrees are applied
                 in the CSS. */
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
                    mobileFacesRef.current[i] = el;
                  }}
                  className="ring-face h-[clamp(250px,34vh,330px)] w-[clamp(185px,58vw,250px)] will-change-transform"
                  style={
                    {
                      /* The station this face starts at, so the frame before
                         hydration is the same arc as the first real one rather
                         than a pile of coincident cards. `readRail` overwrites
                         it from there on. */
                      "--face-a": `${wrapInto(i * step, SPAN)}deg`,
                      /* Half the desktop's scatter. The amplitude there is
                         tuned so the front card stays near the centre of a
                         900px stage; on a 440px one the same vh figures throw
                         the cards far enough off-axis that the arc stops
                         reading as level. */
                      "--face-y": `${(RISE[i % RISE.length] ?? 0) / 2}vh`,
                    } as React.CSSProperties
                  }
                >
                  {photo(i)}
                  {reflection(i)}
                </div>
              ))}
            </div>
          </div>

          {/* ── The scroller: the gesture surface AND the click target ───────
              A transparent sheet of snap pages over the stage. It does three
              jobs that would otherwise need three mechanisms:

                · it TURNS the ring — `scrollLeft / clientWidth` is the ring
                  position in faces, read by `readRail`
                · it gives the section native touch physics for free: momentum,
                  rubber-banding at the ends, and snapping that comes to rest
                  exactly on a project
                · it is what a tap actually hits

              The third is not a convenience. Chrome hit-tests inside a
              `transform-style: preserve-3d` context differently from how it
              paints it — measured on the desktop ring, `elementsFromPoint` at
              the centre of the front card returns that card's own <a> with
              nothing above it, and a real click at the same coordinates is
              delivered to the stage instead, with the anchor nowhere in the
              event path. That is the "clicking a project does nothing" bug, and
              it applies here for exactly the same reason. A flat anchor that is
              a SIBLING of the 3D context, not a descendant, is never subject to
              that test. The desktop ring carries one; this carries one per page,
              because the pages had to exist anyway.

              ── `data-lenis-prevent-horizontal`, and only horizontal ─────────
              Lenis smooths the WHEEL for the whole document, which means it
              calls `preventDefault` on wheel events and re-drives the scroll
              itself — so a horizontal trackpad flick over this was swallowed
              and the ring never moved. Lenis classifies each gesture by its
              dominant axis and honours this attribute only for the horizontal
              ones, so sideways gestures reach the scroller while a vertical
              wheel over the same element still eases the PAGE, exactly as it
              does everywhere else. Verified: a vertical drag starting on the
              ring scrolls the document past the section rather than trapping
              the visitor in it.

              Touch needs no attribute at all: Lenis runs with
              `syncTouch: false`, so it leaves touch to the browser entirely. */}
          <div
            ref={railRef}
            onScroll={onRailScroll}
            data-lenis-prevent-horizontal
            className="no-scrollbar absolute inset-0 z-10 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          >
            {works.map((work) => (
              <div
                key={work.id}
                /* One page per project, each exactly the scroller's width —
                   that identity is what makes the scroll position a face
                   index with no arithmetic. `snap-center` rather than
                   `snap-start`: a full-width page has no gutter to start
                   against, and centre is where the front face is. */
                className="relative w-full shrink-0 snap-center"
              >
                {/* ── The tappable region is the CARD, not the page ─────────
                    If the whole page were the link, tapping a flank — a
                    photograph that is plainly a different project — would open
                    the one at the front. So the anchor is a box the size of a
                    face, parked where the front face lands, and the rest of the
                    page is bare: swipeable, not tappable.

                    `top-[38%]`, and it is measured rather than reasoned. The
                    front face sits at the stage's centre and the camera's fixed
                    `rotateX(7deg)` lifts it above the middle; how far depends
                    on the stage's height, which is a clamp. Sampled on the
                    running page at 360×740, 390×844, 414×896, 430×932, 768×1024
                    and 820×1180, its centre came out at 38.0, 38.6, 38.4, 38.0,
                    37.3 and 36.8 percent down, and at exactly 50% across every
                    time. 38% is within 8px of the worst of those on a 287px-tall
                    target, which is well inside the card.

                    ── Invisible to assistive tech, on purpose ───────────────
                    `aria-hidden` + `tabIndex={-1}`. The face anchors inside the
                    ring are real links with real labels and `apply` leaves
                    exactly one of them — the front — out of `inert`, so the
                    keyboard and the crawler already have a complete, correct
                    path to every project. Pressing Enter on a focused anchor
                    dispatches to the element and never goes near a hit test,
                    which is why keyboard was the one route that always worked.
                    Exposing these as a second set of links would announce every
                    project twice to a screen reader in order to fix a touch
                    bug. */}
                <SmoothLink
                  href={`/work/${work.id}`}
                  cardLabel={work.title}
                  aria-hidden
                  tabIndex={-1}
                  className="absolute top-[38%] left-1/2 h-[clamp(250px,34vh,330px)] w-[clamp(185px,58vw,250px)] -translate-x-1/2 -translate-y-1/2"
                >
                  {/* Deliberately empty. This is a hit area, not a control with
                      a face — everything a visitor sees is the card behind it. */}
                  <span className="sr-only">{work.title}</span>
                </SmoothLink>
              </div>
            ))}
          </div>
        </div>

        {/* ── The caption, below lg ────────────────────────────────────────
            The desktop's caption, in one column instead of two. It carries the
            same four things in the same order — category, name, the hairline,
            the facts — and for the same reason: a photograph on a turntable
            does not read as a link, so the section has to say in words that
            there is somewhere to go.

            Ranged left rather than split to both edges: the desktop version
            holds the name in one corner and the plate in the other because it
            has 1440px to range across. A phone has no second corner. */}
        <PageContainer className="relative z-20 lg:hidden">
          {current && (
            <div className="overflow-hidden pt-6">
              <motion.div
                /* Keyed on the project so it re-enters on every change rather
                   than swapping the string in place, which at this size reads
                   as a glitch. Masked by the `overflow-hidden` above, so it
                   rises out of the ring rather than fading in. */
                key={current.id}
                initial={{ y: "108%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="block font-label text-cream/75">
                  {current.category}
                </span>
                {/* `min-h`: the names run from one line to two and the block
                    below them would otherwise step up and down as the ring
                    turns, dragging the footer with it. Two lines are reserved
                    at every position, so nothing under the caption moves. */}
                <h3 className="mt-1.5 min-h-[2.12em] font-serif text-[1.9rem] leading-[1.06] tracking-tight text-cream sm:text-4xl">
                  {current.title}
                </h3>

                <span
                  aria-hidden
                  className="mt-4 block h-px w-14 bg-gold/70"
                />
                {facts.length > 0 && (
                  <span className="mt-3 block font-label text-cream/55">
                    {facts.join("  ·  ")}
                  </span>
                )}

                <SmoothLink
                  href={`/work/${current.id}`}
                  cardLabel={current.title}
                  /* `py-1.5` only for the target: 12px label type on its own is
                     a 16px-tall hit area, under the 24px minimum. */
                  className="mt-3 inline-block py-1.5 font-label whitespace-nowrap text-gold-soft transition-colors duration-300 hover:text-cream"
                >
                  View project &rarr;
                </SmoothLink>
              </motion.div>
            </div>
          )}
        </PageContainer>

        {/* ── Footer: progress, index, and the way out ─────────────────────
            One footer for both rings. It was `hidden lg:block` for as long as
            the mobile layout was a stack and then a flat rail, neither of which
            had a ring position for the progress hairline to report or a face
            for the index to jump to. Both do now — `jump` turns whichever ring
            is mounted (see `scrollRailTo`) — so the same three things are true
            at every width and the phone got a duplicate of none of them.

            It replaced a mobile-only footer that carried its own gold bar and
            its own "01 / 04". The bar was the same bar and the counter was the
            SectionHeading's counter printed a second time, forty pixels below
            it. The index row here says more than either: it is nine tap targets
            that go somewhere. */}
        <PageContainer className="relative z-20 shrink-0 pb-10 lg:pb-4">
          <div className="relative mb-0.5 h-px bg-cream/25">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 h-px w-0 bg-gold"
            />
          </div>
          {/* ── The index: numerals, and deliberately not names ────────────
              This was "01 AWC   02 Cha and Co   03 Kapali Mall Food Court …",
              the full list of project names. Two things were wrong with it and
              they compound:

                · It WRAPPED. Nine names do not fit one line at any desktop
                  width — measured, it was two rows at 1920 as much as at 1280 —
                  and the second row was a ragged orphan of two items. At
                  1536x864 that row's bottom landed at 875 inside an 864px
                  viewport, so the last two projects were clipped by the pinned
                  box. Not a squeeze: cut off.

                · It got WORSE with content. The projects come from the CMS now.
                  Nine names is already two rows; a studio publishing fifteen
                  gets four, and the section's footer eats the ring. A layout
                  that degrades as the client succeeds is not finished.

              Numerals fix both permanently — the row's width is now
              proportional to the project COUNT rather than to the length of
              whatever anyone types into Sanity, so it holds one line to about
              thirty projects. Nothing is lost by dropping the names, because
              the active project's name is already set at 2.3rem directly above
              this, and its category above that. The list was printing every
              name a second time in 12px to say what the biggest type on the
              screen was already saying.

              The name is still there for anyone who wants it before clicking:
              `title` gives the hover tooltip, `aria-label` gives screen readers
              the name and the position, and `aria-current` marks the one that
              is showing — none of which the old row had. */}
          <div className="flex items-center justify-between gap-8">
            {/* The gaps are 16px narrower than they read, because each numeral
                now carries `px-2` — see the button. Padding plus gap keeps the
                same optical rhythm the bare gap used to give on its own.

                `flex-wrap` earns its place on a phone rather than being
                defensive: nine numerals at a 44px-wide target come to ~279px,
                which clears a 390px screen's 342px of content width, but a
                studio publishing a twelfth project would overflow it. It wraps
                to a second row instead. */}
            <div className="flex flex-wrap gap-x-0 gap-y-1 font-label sm:gap-x-1">
              {works.map((work, i) => (
                <button
                  key={work.id}
                  type="button"
                  onClick={() => jump(i)}
                  title={work.title}
                  aria-label={`${work.title} — project ${i + 1} of ${count}`}
                  aria-current={i === active ? "true" : undefined}
                  className={cn(
                    // `px-2` as well as the vertical padding: a two-digit
                    // numeral is only 15px wide, so the target was 15×44 — tall
                    // enough and half the required width. The row's `gap-x`
                    // came down by the same amount, so nothing moved.
                    "group relative cursor-pointer rounded-sm px-2 py-3.5 transition-colors duration-300",
                    // The button is padded to a 44px touch target, so the UA's
                    // default ring drew a tall box around a 12px numeral. Pull
                    // it in to trace the type instead.
                    // -8, not -10: the box gained 8px of padding on each side,
                    // so a 10px inset now sits INSIDE the numeral instead of
                    // around it.
                    "outline-offset-[-8px] focus-visible:outline-1 focus-visible:outline-gold",
                    i === active ? "text-cream" : "text-cream/50 hover:text-cream/90"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                  {/* The mark under the active numeral. A drawn rule rather
                      than a dot or a box, because a hairline in gold is the
                      section-heading gesture and the spine's, so the index
                      reads as part of the same drawing. `scale-x` from the
                      left, which the global reduced-motion rule flattens to an
                      instant state change for free — one of the reasons this
                      is a CSS transition and not a framer layout animation. */}
                  <span
                    aria-hidden
                    className={cn(
                      // `inset-x-2` matches the button's `px-2`, so the rule
                      // still measures exactly the numeral rather than the
                      // padded target around it.
                      "absolute inset-x-2 bottom-2 block h-px origin-left bg-gold transition-transform duration-500 ease-editorial",
                      i === active ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* What is left of the closing panel that used to be the tenth
                card on the track. A ring has no end to put a card at — coming
                round to the first project again is the whole point of it — so
                the invitation moved here, where it also gives the index row a
                right-hand edge. */}
            <SmoothLink
              href="/contact"
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
