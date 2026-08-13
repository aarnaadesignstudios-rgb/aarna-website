"use client";

/**
 * ImageCycle — a stack of full-bleed frames that cross-dissolve into one another.
 *
 * Deliberately NOT a carousel: nothing slides, there are no arrows, dots or
 * edges, and the viewer is never asked to interact. Each frame is held while it
 * drifts (a restrained Ken Burns move), then the next one dissolves in on top of
 * it. The effect should read as one continuous film of the work.
 *
 * How the seam is hidden:
 *  - The incoming frame fades 0 → 1 *above* the outgoing one, which holds full
 *    opacity underneath and is only dropped once the dissolve has finished. If
 *    both frames faded at once the composite would dip toward the background
 *    mid-transition and read as a flicker.
 *  - A frame's drift resets to its start pose on the same delay, so the
 *    outgoing frame is never seen snapping back.
 *
 * Costs are kept honest: frames are mounted just before their turn (so the
 * first paint fetches two images, not all of them), and the cycle stops while
 * the stack is scrolled out of view or the tab is hidden.
 *
 * The parent must be positioned and clip its overflow.
 *
 * TODO (future phases): accept blurDataURL per frame once real placeholders are
 *       generated, and expose an `onFrameChange` hook if the hero ever wants to
 *       caption the current project.
 */
import { useEffect, useRef, useState } from "react";

import Media from "./Media";
import { cn } from "@/utils/cn";

export interface ImageCycleFrame {
  id: string;
  image: string;
  alt: string;
  /** CSS `object-position` for the crop. Defaults to centred. */
  position?: string;
}

/**
 * How one frame becomes the next.
 *
 * `dissolve` — the original: the incoming frame fades up over the outgoing one.
 * Calm, and effectively invisible as motion; at a slow cadence the stack reads
 * as a single photograph that keeps changing its mind.
 *
 * `wipe` — the incoming frame is UNCOVERED from the right edge leftward while
 * its own content slides the other way. Two things make this read as a cut in a
 * film rather than as a CSS effect: the moving edge (an eye tracks an edge, it
 * does not track a change in opacity), and the counter-slide, which means the
 * new frame arrives already in motion instead of sitting still behind a
 * travelling mask. Directional on purpose — it sweeps in from the right, the
 * same direction the projects rotate in from in <SelectedWorks />, so the whole
 * page agrees about which way "next" is.
 */
export type ImageCycleTransition = "dissolve" | "wipe";

interface ImageCycleProps {
  frames: ImageCycleFrame[];
  /** How long a frame is held on screen, in ms (excluding the transition). */
  holdMs?: number;
  /** How long one frame takes to become the next, in ms. */
  fadeMs?: number;
  /** How one frame becomes the next. See {@link ImageCycleTransition}. */
  transition?: ImageCycleTransition;
  /** Responsive sizes hint passed to every frame. */
  sizes?: string;
  /**
   * How long to wait before the first frame starts drifting and the cycle
   * begins, in ms. Use it to hand off from an intro overlay, so the opening
   * frame isn't spent behind something covering it.
   */
  startDelayMs?: number;
  /**
   * Fires with the index of the frame that has just become current, so a
   * caller can caption the work on screen (see <Hero />).
   *
   * Read through a ref inside the cycle effect, so passing an inline arrow
   * does not tear down and rebuild the interval on every parent render.
   */
  onFrameChange?: (index: number) => void;
  className?: string;
}

/**
 * Camera moves, applied one per frame and alternating in direction so two
 * consecutive frames never drift the same way.
 *
 * The budget: a frame at `scale(s)` hides (s - 1) / 2 of its width beyond each
 * edge, and every pose keeps `s × translate` inside that, so a drift can never
 * expose an edge. Scale stays low at the loosest pose to crop as little of the
 * work as possible.
 *
 * Every scale is multiplied by `--frame-zoom` (see `PORTRAIT_ZOOM`), which only
 * ever adds headroom.
 *
 * The amplitude is tuned against the cycle length, not chosen in isolation: the
 * whole move plays out in `holdMs + fadeMs`, so at the hero's 2.5s cadence a
 * 12-point scale swing reads as a restless push-in rather than a camera
 * breathing. An 8-point swing over the same 2.5s is slow enough to feel
 * deliberate and still enough to keep the frame from looking like a still.
 */
const DRIFTS = [
  { from: "scale(1.05)", to: "scale(1.13) translate3d(-1.4%, -0.8%, 0)" },
  { from: "scale(1.13) translate3d(1.2%, 0.7%, 0)", to: "scale(1.05)" },
  { from: "scale(1.05) translate3d(1.1%, -0.5%, 0)", to: "scale(1.13) translate3d(-1%, 0.7%, 0)" },
  { from: "scale(1.13) translate3d(-1.1%, 0.8%, 0)", to: "scale(1.05) translate3d(1%, -0.5%, 0)" },
] as const;

/** Rewrites `scale(n)` as `scale(calc(n * var(--frame-zoom)))`. */
const withZoom = (transform: string) =>
  transform.replace(
    /scale\(([\d.]+)\)/,
    (_, scale) => `scale(calc(${scale} * var(--frame-zoom, 1)))`
  );

/** The drift for frame `i`, wrapping, with `--frame-zoom` folded into its scale. */
function driftFor(i: number) {
  // Indexing a readonly tuple at 0 is exact, which satisfies
  // noUncheckedIndexedAccess without an assertion.
  const base = DRIFTS[i % DRIFTS.length] ?? DRIFTS[0];
  return { from: withZoom(base.from), to: withZoom(base.to) };
}

/**
 * On portrait phones a landscape frame fitted by `object-cover` shows its whole
 * height, so a room reads as a distant wide shot with dead ceiling and floor
 * bands. Zooming the crop trades width we have already lost for a tighter,
 * better-composed frame. `sizes` below accounts for the extra scale so the
 * browser still requests a sharp enough source.
 */
const PORTRAIT_ZOOM = "[--frame-zoom:1.3] sm:[--frame-zoom:1]";

/**
 * ── The opening frame, published ──────────────────────────────────────────
 *
 * <LoadingScreen /> renders the hero's FIRST frame inside its own window, and
 * then opens that window to full-bleed rather than dissolving the panel away —
 * so the loader resolves into the hero instead of getting out of its way.
 *
 * That only works if the two are the same picture in every respect: the same
 * source, the same `sizes` (so it is one network request and the hero's copy is
 * a cache hit), the same portrait zoom, and the same starting pose. Three
 * constants rather than three copies, because a mismatch here would not look
 * like a bug — it would look like a jump at the exact moment the site is
 * introducing itself.
 */
export { PORTRAIT_ZOOM as FRAME_ZOOM_CLASS };

/** The `sizes` every frame is requested at. */
export const FRAME_SIZES = "(max-width: 639px) 160vw, 100vw";

/** Frame 0's pose before the cycle releases it — `scale(1.05)`, zoom folded in. */
export const FRAME_OPENING_POSE = withZoom(DRIFTS[0].from);

/**
 * The wipe's easing and its counter-slide distance.
 *
 * A near-symmetric in-out curve, deliberately steeper than the site's editorial
 * ease: the moving edge should leave and arrive softly but cross the frame
 * decisively, which is what makes it read as a cut. The site's own
 * `ease-editorial` (0.22, 1, 0.36, 1) puts almost all of its travel in the first
 * third, so the edge is across the screen before the eye has found it.
 */
const WIPE_EASE = "cubic-bezier(0.72, 0, 0.22, 1)";

/** How far the incoming frame's content slides while it is uncovered. */
const WIPE_SLIDE = "5%";

export default function ImageCycle({
  frames,
  holdMs = 4000,
  fadeMs = 1200,
  transition = "dissolve",
  // 160vw on phones so the zoomed crop still resolves sharply.
  sizes = FRAME_SIZES,
  startDelayMs = 0,
  onFrameChange,
  className,
}: ImageCycleProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Held in a ref so the cycle effect below does not list the callback as a
  // dependency — an inline arrow from the parent would otherwise clear and
  // restart the interval on every one of its renders, and the frame that was
  // mid-hold would silently get a full extra turn on screen.
  const onFrameChangeRef = useRef(onFrameChange);
  onFrameChangeRef.current = onFrameChange;

  /**
   * `current` is what's on screen, `outgoing` is the frame still holding
   * underneath it, and `mountedThrough` is the highest index committed to the
   * DOM — it only ever grows, so a frame is fetched once and then reused.
   */
  const [{ current, outgoing, mountedThrough }, setCycle] = useState({
    current: 0,
    outgoing: -1,
    mountedThrough: 1,
  });

  /**
   * The opening frame renders at its start pose and is only released once, on
   * `started`. Without that beat it would mount already at its end pose, and a
   * transition with no change in value simply doesn't run — which is why the
   * first image sat still while every later one drifted.
   */
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const release = () => setStarted(true);

    if (startDelayMs > 0) {
      const timer = window.setTimeout(release, startDelayMs);
      return () => window.clearTimeout(timer);
    }

    // No delay: still wait two frames, so the start pose is painted before it
    // changes. Within one frame the browser coalesces both values into one
    // style recalc and the transition is skipped.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(release);
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [startDelayMs]);

  useEffect(() => {
    // Hold the cycle until the opening frame has been released, so it gets its
    // full time on screen rather than expiring behind an intro overlay.
    if (!started) return;
    if (frames.length < 2) return;

    // Reduced motion: hold the first frame. The global CSS already collapses
    // transition durations, so cycling here would become a hard cut every few
    // seconds — worse than no movement at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const step = holdMs + fadeMs;
    let timer: number | undefined;
    let onScreen = true;

    const advance = () =>
      setCycle((cycle) => {
        const next = (cycle.current + 1) % frames.length;
        return {
          current: next,
          outgoing: cycle.current,
          mountedThrough: Math.max(cycle.mountedThrough, next + 1),
        };
      });

    // Only run while the stack is actually visible to someone.
    const sync = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun && timer === undefined) {
        timer = window.setInterval(advance, step);
      } else if (!shouldRun && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      // Last entry wins — it carries the most recent visibility state.
      const latest = entries[entries.length - 1];
      if (!latest) return;
      onScreen = latest.isIntersecting;
      sync();
    });
    if (rootRef.current) observer.observe(rootRef.current);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      if (timer !== undefined) window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [started, frames.length, holdMs, fadeMs]);

  /**
   * Announce the frame on screen.
   *
   * Deliberately an effect keyed on `current` rather than a call inside the
   * state updater: React may invoke an updater more than once for the same
   * transition (StrictMode does it on purpose), so notifying from in there
   * would double-fire. An effect runs once per committed value.
   */
  useEffect(() => {
    onFrameChangeRef.current?.(current);
  }, [current]);

  const wipingNow = transition === "wipe" && outgoing >= 0;

  return (
    <div ref={rootRef} className={cn("absolute inset-0", PORTRAIT_ZOOM, className)}>
      {/* ── The edge ────────────────────────────────────────────────────────
          A single champagne hairline riding the wipe's leading edge, keyed on
          the frame so it re-runs on every cut.

          It is a full-width element carrying a right-hand border, translated
          from 0 to -100%, rather than a 1px element with an animated `left`.
          Same picture, and this version is a compositor transform on one
          element instead of a layout property being recalculated for 640ms.

          The duration and easing are the wipe's own, so the line sits on the
          clip's edge for the whole crossing instead of drifting away from it. */}
      {wipingNow && (
        <span
          key={`edge-${current}`}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-3 w-full border-r border-gold-soft/70"
          style={{ animation: `wipe-edge ${fadeMs}ms ${WIPE_EASE} forwards` }}
        />
      )}

      {frames.map((frame, i) => {
        // Frames past the horizon aren't in the DOM yet — see `mountedThrough`.
        if (i > mountedThrough) return null;

        const isCurrent = i === current;
        const isOutgoing = i === outgoing;
        const drift = driftFor(i);
        // Deferred reset: everything that isn't on screen waits for the
        // transition to end before dropping out or returning to its start pose.
        const afterDissolve = `0ms linear ${fadeMs}ms`;

        const wiping = transition === "wipe";
        /**
         * Nothing has advanced yet, so frame 0 is showing its opening pose.
         *
         * The wipe must not run on it. <LoadingScreen /> opens a window onto a
         * pixel-identical copy of this exact frame and hands over by matching
         * it, so anything animating the frame underneath at that moment shows
         * up as a tear at the handover. It only wipes from the SECOND frame on,
         * which is also the only time a wipe means anything — there is nothing
         * underneath the first one to be uncovered from.
         */
        const opening = outgoing < 0;

        return (
          <div
            key={frame.id}
            aria-hidden={!isCurrent}
            className="absolute inset-0"
            style={{
              // In wipe mode the frame is revealed by its clip, so opacity is
              // left alone — cross-fading a wipe softens the moving edge into a
              // gradient and loses the whole point of it. Frames that are
              // neither current nor outgoing are clipped to nothing anyway;
              // opacity 0 on them is belt and braces.
              opacity: wiping ? (isCurrent || isOutgoing ? 1 : 0) : isCurrent ? 1 : 0,
              zIndex: isCurrent ? 2 : isOutgoing ? 1 : 0,
              // The clip is the wipe. `inset(0 0 0 100%)` collapses the frame
              // against its own right edge; animating the left inset to 0
              // uncovers it leftward across the screen. The outgoing frame
              // holds at `inset(0)` underneath until the wipe has finished and
              // only then snaps back to collapsed — same deferred reset the
              // dissolve uses, and for the same reason.
              clipPath: wiping
                ? isCurrent || isOutgoing
                  ? "inset(0 0 0 0)"
                  : "inset(0 0 0 100%)"
                : undefined,
              transition: wiping
                ? isCurrent && !opening
                  ? `clip-path ${fadeMs}ms ${WIPE_EASE}`
                  : `clip-path ${afterDissolve}`
                : isCurrent
                  ? `opacity ${fadeMs}ms ease-in-out`
                  : `opacity ${afterDissolve}`,
            }}
          >
            {/* ── The counter-slide ──────────────────────────────────────
                Its own element, because a transform on the clipping layer
                above would drag the clip along with it and the wipe's edge
                would travel with the picture instead of across it. */}
            <div
              className="absolute inset-0"
              style={{
                transform:
                  wiping && !isCurrent ? `translate3d(${WIPE_SLIDE}, 0, 0)` : undefined,
                transition:
                  wiping && isCurrent && !opening
                    ? `transform ${fadeMs}ms ${WIPE_EASE}`
                    : wiping
                      ? `transform ${afterDissolve}`
                      : undefined,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: isCurrent && started ? drift.to : drift.from,
                  // The move runs for the whole time the frame is on screen.
                  transition: isCurrent
                    ? `transform ${holdMs + fadeMs}ms linear`
                    : `transform ${afterDissolve}`,
                  // Only the two composited frames are worth promoting.
                  willChange: isCurrent || isOutgoing ? "transform" : undefined,
                }}
              >
                <Media
                  src={frame.image}
                  alt={frame.alt}
                  // The first frame is the hero's LCP; the rest are fetched as
                  // soon as they mount, which is one frame before their turn.
                  priority={i === 0}
                  eager={i > 0}
                  sizes={sizes}
                  objectPosition={frame.position}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
