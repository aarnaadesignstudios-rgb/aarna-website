"use client";

/**
 * LoadingScreen — the mark, the name, a held beat, a dissolve.
 *
 * ── What this replaces, and why ───────────────────────────────────────────
 *
 * The previous intro was a set-piece: the phoenix separated from the "A" under
 * a gold bloom, beat its wings, arced out of frame, tore the emerald curtain
 * away along its flight path, and the letterform then flew back to land in the
 * masthead via a FLIP. It was roughly 250 lines of choreography and just under
 * five seconds of the visitor's time.
 *
 * The client's verdict was "this animation is very bad", so all of it is gone —
 * the vector silhouette, the letter's flight, the masked tear, the motion
 * trail, the dev scrub harness. What is left is deliberately unshowy and lasts
 * 2.9 seconds:
 *
 *   0.00  the mark fades up and settles
 *   0.45  the name fades in beneath it, on ONE line
 *   1.20  a held beat — the lockup simply sits there
 *   2.00  the whole screen dissolves into the page
 *
 * The cue sheet lives in `INTRO` (constants/site.ts) so the hero and the
 * navbar hand off from the same numbers rather than re-deriving them.
 *
 * The name is set as a single line — "Aarnaa Design Studios" — in the display
 * serif. It was previously "Aarnaa" stacked over a letter-spaced "DESIGN
 * STUDIOS", which the client flagged twice: wrong font, and the name is to
 * read on one line. It is the studio's name, not a lockup to be composed with.
 */
import { useState, useRef } from "react";
import Image from "next/image";

import { useIsomorphicLayoutEffect } from "@/hooks";
import { INTRO, SITE } from "@/constants";
import { gsap } from "@/lib/gsap";

const { cue } = INTRO;

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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Reduced motion: state the brand, then get out of the way.
      if (reduced) {
        gsap
          .timeline({ onComplete: finish })
          .set("[data-lockup]", { opacity: 1 })
          .to(root, { opacity: 0, duration: 0.4 }, "+=0.9");
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });

      tl.fromTo(
        "[data-mark]",
        { opacity: 0, scale: 0.94, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 1.15, ease: "power3.out" },
        cue.settle
      )
        .fromTo(
          "[data-name]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          cue.name
        )
        // The screen leaves as one object — a fade plus the faintest lift, so
        // it reads as a sheet being drawn off rather than as opacity being
        // turned down.
        .to(
          root,
          {
            opacity: 0,
            y: -18,
            duration: INTRO.dissolveDuration,
            ease: "power2.inOut",
          },
          cue.dissolve
        );
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
      className="surface-emerald pointer-events-none fixed inset-0 z-100 flex items-center justify-center overflow-hidden"
    >
      <div data-lockup className="flex flex-col items-center px-6">
        <div
          data-mark
          className="relative aspect-square w-[clamp(104px,18vw,168px)]"
        >
          <Image
            src="/images/aarnaa-mark.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 30vw, 180px"
            className="object-contain"
          />
        </div>

        {/* One line, always. `whitespace-nowrap` plus a viewport-relative size
            means the name scales down on a narrow phone rather than wrapping —
            wrapping is the exact thing the client asked us to stop doing. */}
        <span
          data-name
          className="mt-8 block whitespace-nowrap text-center font-display text-[clamp(1.05rem,4.6vw,2.1rem)] leading-none tracking-[0.02em] text-gold"
        >
          {SITE.name}
        </span>
      </div>
    </div>
  );
}
