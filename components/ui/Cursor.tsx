"use client";

/**
 * Cursor — a small gold dot with a soft halo, in place of the pointer.
 *
 * Built to the client's note: "cursor to be small gold dot with spreaded
 * light… I am seeing cursor everywhere: I don't want to see." So the native
 * arrow is hidden and this replaces it — a 6px core of brand gold sitting in a
 * wide, very faint gold glow, so the pointer reads as a point of light on the
 * page rather than as an operating-system arrow.
 *
 * Over anything clickable the halo opens and brightens. That is the only state
 * change; there is no ring, no label, no scaling outline. The brief asked for a
 * dot, and a dot is what this stays.
 *
 * ── Why it is built this way ──────────────────────────────────────────────
 *
 * Position is written straight to the DOM through GSAP's `quickTo`, never
 * through React state. A `setState` per `mousemove` re-renders the tree at
 * pointer rate and the dot visibly lags the thing it is meant to be. Only the
 * discrete states (hovering, visible) are React state, and those change a few
 * times a minute rather than a few hundred times a second.
 *
 * Hover is tracked by delegation on the document rather than by listeners on
 * each target: sections mount, unmount and re-render constantly here (the
 * pinned gallery, the marquee), and any per-element binding would need
 * re-running after every one of those. `closest()` on the event target is
 * immune to all of it.
 *
 * The dot follows on a very short ease rather than locking 1:1. At 0 the dot
 * is mathematically exact and feels dead; ~0.08s of follow reads as weight
 * without ever putting the point of light anywhere the pointer is not.
 *
 * Renders nothing on coarse pointers (there is no cursor to replace) or when
 * reduced motion is requested — and it owns hiding the native cursor from JS
 * on purpose: if this component ever fails to mount, the class is never
 * applied and the visitor keeps a normal arrow rather than no pointer at all.
 */
import { useEffect, useRef, useState } from "react";

import { gsap } from "@/lib/gsap";

/** Anything that should open the halo. */
const INTERACTIVE =
  'a, button, input, textarea, select, summary, [role="button"], [data-cursor]';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  /** Gate the whole component on pointer type, resolved after mount. */
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.body.classList.add("cursor-hidden");
    return () => document.body.classList.remove("cursor-hidden");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    const x = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    const y = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });

    let placed = false;

    const onMove = (e: PointerEvent) => {
      // First sighting: drop the dot straight onto the pointer instead of
      // easing in from 0,0 — otherwise it flies across the page from the
      // top-left corner the moment it appears.
      if (!placed) {
        placed = true;
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        setVisible(true);
      }
      x(e.clientX);
      y(e.clientY);

      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
    };

    // Leaving the window entirely, not merely crossing into a child element —
    // relatedTarget is null only for the real boundary.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };
    const onOver = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("pointerover", onOver);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-200 will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 250ms" }}
    >
      {/* The spread light. A radial gradient rather than a box-shadow, so the
          falloff is smooth all the way out instead of stopping at a blur
          radius — a shadow on a 6px dot cannot spread this far without
          banding. */}
      <div
        className="absolute rounded-full transition-all duration-500 ease-editorial"
        style={{
          width: hovering ? 84 : 52,
          height: hovering ? 84 : 52,
          marginLeft: hovering ? -42 : -26,
          marginTop: hovering ? -42 : -26,
          opacity: hovering ? 0.9 : 0.55,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-gold) 42%, transparent) 0%, color-mix(in srgb, var(--color-gold) 14%, transparent) 42%, transparent 70%)",
        }}
      />
      {/* The core. */}
      <div
        className="absolute rounded-full bg-gold transition-all duration-500 ease-editorial"
        style={{
          width: hovering ? 9 : 6,
          height: hovering ? 9 : 6,
          marginLeft: hovering ? -4.5 : -3,
          marginTop: hovering ? -4.5 : -3,
        }}
      />
    </div>
  );
}
