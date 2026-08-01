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

interface ImageCycleProps {
  frames: ImageCycleFrame[];
  /** How long a frame is held on screen, in ms (excluding the dissolve). */
  holdMs?: number;
  /** How long one frame takes to dissolve into the next, in ms. */
  fadeMs?: number;
  /** Responsive sizes hint passed to every frame. */
  sizes?: string;
  /**
   * How long to wait before the first frame starts drifting and the cycle
   * begins, in ms. Use it to hand off from an intro overlay, so the opening
   * frame isn't spent behind something covering it.
   */
  startDelayMs?: number;
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
 */
const DRIFTS = [
  { from: "scale(1.06)", to: "scale(1.18) translate3d(-2%, -1.2%, 0)" },
  { from: "scale(1.18) translate3d(1.8%, 1%, 0)", to: "scale(1.06)" },
  { from: "scale(1.07) translate3d(1.6%, -0.6%, 0)", to: "scale(1.19) translate3d(-1.4%, 1%, 0)" },
  { from: "scale(1.19) translate3d(-1.6%, 1.2%, 0)", to: "scale(1.07) translate3d(1.4%, -0.8%, 0)" },
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

export default function ImageCycle({
  frames,
  holdMs = 4000,
  fadeMs = 1200,
  // 160vw on phones so the zoomed crop still resolves sharply.
  sizes = "(max-width: 639px) 160vw, 100vw",
  startDelayMs = 0,
  className,
}: ImageCycleProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className={cn("absolute inset-0", PORTRAIT_ZOOM, className)}>
      {frames.map((frame, i) => {
        // Frames past the horizon aren't in the DOM yet — see `mountedThrough`.
        if (i > mountedThrough) return null;

        const isCurrent = i === current;
        const isOutgoing = i === outgoing;
        const drift = driftFor(i);
        // Deferred reset: everything that isn't on screen waits for the
        // dissolve to end before dropping out or returning to its start pose.
        const afterDissolve = `0ms linear ${fadeMs}ms`;

        return (
          <div
            key={frame.id}
            aria-hidden={!isCurrent}
            className="absolute inset-0"
            style={{
              opacity: isCurrent ? 1 : 0,
              zIndex: isCurrent ? 2 : isOutgoing ? 1 : 0,
              transition: isCurrent
                ? `opacity ${fadeMs}ms ease-in-out`
                : `opacity ${afterDissolve}`,
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
        );
      })}
    </div>
  );
}
