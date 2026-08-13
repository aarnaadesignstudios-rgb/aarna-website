"use client";

/**
 * Ornament — gold botanical line-work, drawn on when a chapter comes into view.
 *
 * ── What this replaced, and why ───────────────────────────────────────────
 *
 * The empty areas of each chapter used to carry a drawing grid at 88px. It was
 * defensible — the sections are numbered sheets, so ruling them was at least an
 * argument — but the studio's note was blunt and correct: a grid is a FILLER.
 * It is what you reach for when a space needs something and you have not
 * decided what; it belongs to the wireframe the design came out of, not to the
 * brand it is for.
 *
 * This belongs to the brand. The mark is a phoenix drawn in a single gold line,
 * so the ornament is drawn in a single gold line: a vine, its leaves, and a
 * five-petalled blossom at the tip. Same weight, same colour, same hand. It is
 * the one decorative element on the site and it is used identically in every
 * chapter, which is what makes it a system rather than a garnish.
 *
 * ── The drawing ──────────────────────────────────────────────────────────
 *
 * Every path carries `pathLength="1"`. That normalises the dash arithmetic so a
 * single keyframe (`vine-draw` in styles/globals.css) draws every path from
 * 0→1 regardless of its real length — otherwise each path needs its own
 * measured length in JS, on every resize. The stagger is `animation-delay` per
 * element, so the stem draws first and the leaves open behind it.
 *
 * It draws ONCE, on entry, and then holds. A vine that keeps animating is a
 * loading spinner.
 *
 * ── Cost ────────────────────────────────────────────────────────────────
 *
 * Inline SVG, no runtime, no dependency. One IntersectionObserver per instance
 * that disconnects the moment it has fired. `stroke-dashoffset` animates on the
 * compositor in every current browser, and the whole thing is `aria-hidden` and
 * `pointer-events-none`.
 */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * The vine, as one continuous stem with leaves hung off it.
 *
 * Drawn on a 200×420 canvas so it is tall and narrow — it reads as something
 * growing up a margin rather than as a decal stuck in a corner. Coordinates are
 * hand-placed rather than generated: a procedural vine is symmetrical in a way
 * a drawn one is not, and the asymmetry is most of why this looks made.
 */
function VineArt({ delay = 0 }: { delay?: number }) {
  /** Stem, then leaves, then the blossom — each a beat behind the last. */
  const at = (i: number) => ({ animationDelay: `${delay + i * 0.16}s` });

  return (
    <svg
      viewBox="0 0 200 420"
      fill="none"
      stroke="currentColor"
      // 1.15 was invisible on paper. An ornament that has to be looked for is
      // not doing the job the grid it replaced was at least doing.
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      vectorEffect="non-scaling-stroke"
    >
      {/* The stem. One long S-curve, so the whole ornament has a direction. */}
      <path
        pathLength={1}
        style={at(0)}
        d="M96 418C96 360 78 322 62 290C44 254 40 218 58 182C78 142 116 118 132 82C144 54 142 30 134 6"
      />

      {/* Tendrils — the short curls that make a vine read as a vine. */}
      <path pathLength={1} style={at(1)} d="M62 290C46 286 34 274 32 258C31 248 37 240 46 242C55 244 57 256 50 262" />
      <path pathLength={1} style={at(3)} d="M58 182C74 176 84 162 84 146C84 137 77 131 69 134C61 137 60 148 66 153" />
      <path pathLength={1} style={at(5)} d="M132 82C148 84 162 78 168 64C172 55 168 46 159 46C150 46 146 56 151 62" />

      {/* Leaves. Two arcs meeting at a point, with a midrib — a drawn leaf, not
          an ellipse. Filled faintly so they have weight at small sizes. */}
      {[
        { d: "M74 246C74 246 104 232 122 244C104 262 74 246 74 246Z", rib: "M78 246C92 246 108 244 120 246", i: 2 },
        { d: "M50 214C50 214 24 196 8 208C22 228 50 214 50 214Z", rib: "M46 214C34 212 20 208 10 209", i: 4 },
        { d: "M108 118C108 118 140 106 156 120C136 136 108 118 108 118Z", rib: "M112 118C126 118 142 118 154 121", i: 6 },
        { d: "M74 156C74 156 50 138 34 150C48 170 74 156 74 156Z", rib: "M70 156C58 154 46 150 36 151", i: 7 },
      ].map((leaf) => (
        <g key={leaf.d} style={at(leaf.i)}>
          <path
            pathLength={1}
            style={at(leaf.i)}
            d={leaf.d}
            fill="currentColor"
            fillOpacity={0.1}
            data-fill=""
          />
          <path pathLength={1} style={at(leaf.i + 0.5)} d={leaf.rib} strokeWidth={0.7} />
        </g>
      ))}

      {/* The blossom at the tip. Five petals on a circle, and a stamen dot —
          the same five-fold geometry as the mark's tail feathers. */}
      <g style={at(8)}>
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <ellipse
            key={deg}
            pathLength={1}
            style={at(8 + i * 0.08)}
            cx={134}
            cy={-9}
            rx={7}
            ry={13}
            transform={`rotate(${deg} 134 6)`}
            fill="currentColor"
            fillOpacity={0.12}
            data-fill=""
          />
        ))}
        <circle pathLength={1} style={at(9)} cx={134} cy={6} r={3} fill="currentColor" fillOpacity={0.5} data-fill="" />
      </g>
    </svg>
  );
}

interface OrnamentProps {
  /**
   * Which corner it grows from. The vine is drawn growing UP the left margin,
   * so the other placements are the same art flipped — one drawing, four
   * positions, which is what keeps it reading as one motif.
   */
  placement?: "bottom-left" | "top-right" | "bottom-right" | "top-left";
  /** Ink. `gold` on both grounds; `soft` is the champagne cut for deep green. */
  tone?: "gold" | "soft";
  /** Rough height, as a fraction of the viewport. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ── It hangs off the edge ────────────────────────────────────────────────
 *
 * Every placement pushes about 44% of the vine out of frame. That is not a
 * nicety — placed fully inside the box, the large one runs straight through the
 * Contact heading and the contact details, and the `top` pair crosses the first
 * Process column. An ornament sitting on top of type is not an ornament, it is
 * a mistake.
 *
 * Bleeding it also makes it read correctly: what stays on screen is the outer
 * edge of something larger growing in from the margin, which is how a marginal
 * flourish behaves in print. Fully contained, it reads as a sticker.
 *
 * Tailwind v4 compiles `translate-*`, `rotate-*` and `scale-*` to the three
 * standalone properties, which the spec applies in that order — so the shift
 * happens in the element's own upright axes and is unaffected by the rotation
 * that follows it. That is what makes one drawing work in four corners.
 */
const PLACEMENT: Record<NonNullable<OrnamentProps["placement"]>, string> = {
  "bottom-left": "bottom-0 left-0 -translate-x-[44%] translate-y-[8%]",
  "top-right": "top-0 right-0 translate-x-[44%] -translate-y-[8%] rotate-180",
  "bottom-right":
    "right-0 bottom-0 translate-x-[44%] translate-y-[8%] -scale-x-100",
  "top-left":
    "top-0 left-0 -translate-x-[44%] -translate-y-[8%] rotate-180 -scale-x-100",
};

const SIZE: Record<NonNullable<OrnamentProps["size"]>, string> = {
  sm: "h-[38vh] w-[18vh]",
  md: "h-[56vh] w-[27vh]",
  lg: "h-[76vh] w-[36vh]",
};

export default function Ornament({
  placement = "bottom-left",
  tone = "gold",
  size = "md",
  className,
}: OrnamentProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Draw once, then stop watching. The `.vine` class is what starts the
    // keyframes, so withholding it withholds the animation — the paths sit at
    // `stroke-dashoffset: 1` (invisible) until then.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { rootMargin: "-12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute block select-none",
        PLACEMENT[placement],
        SIZE[size],
        tone === "soft" ? "text-gold-soft/60" : "text-gold/55",
        drawn && "vine",
        className
      )}
    >
      <VineArt />
    </span>
  );
}
