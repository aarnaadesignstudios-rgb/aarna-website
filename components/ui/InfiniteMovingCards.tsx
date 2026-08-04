"use client";

/**
 * InfiniteMovingCards — a single-line, infinitely scrolling testimonial
 * ribbon, pausing on hover (ported from Aceternity's "infinite moving
 * cards"). Restyled as one continuous premium press-quote line rather than
 * stacked boxy cards: each testimonial flows as italic serif copy + muted
 * mono attribution, separated by the gold phoenix mark — the same separator
 * <Marquee /> uses for the brand-values strip, so the two full-bleed ribbons
 * on the page read as one family.
 *
 * Everything here is sized to stay on ONE line at every breakpoint: the row is
 * `items-center` + `whitespace-nowrap`, the quote and its attribution are
 * siblings in that row rather than stacked, and the band's height is set by
 * padding alone. Nothing in a testimonial may wrap — a ribbon that grows to two
 * lines stops reading as a ticker and starts reading as a broken card.
 *
 * Source: https://ui.aceternity.com/components/infinite-moving-cards
 */
import { useEffect, useRef, useState } from "react";

import Mark from "./Mark";
import { cn } from "@/utils/cn";
import type { Testimonial } from "@/types";

type Tone = "light" | "dark";

/**
 * Per-tone ink. The dark band reuses the site's established
 * `surface-emerald` + `border-gold/…` treatment (as in <Achievements /> and
 * <Founder />), so a ribbon dropped between two cream sections reads as the
 * same brand device rather than a new one.
 */
const TONE: Record<
  Tone,
  { band: string; quote: string; author: string; dot: string }
> = {
  light: {
    band: "border-emerald/10 bg-white",
    quote: "text-emerald",
    author: "text-charcoal/45",
    dot: "text-charcoal/25",
  },
  dark: {
    band: "surface-emerald border-gold/15",
    quote: "text-cream",
    author: "text-gold-soft/70",
    dot: "text-cream/30",
  },
};

interface InfiniteMovingCardsProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  tone?: Tone;
  className?: string;
}

export default function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  tone = "light",
  className,
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const clonedRef = useRef(false);
  const [start, setStart] = useState(false);
  const ink = TONE[tone];

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;
    // Guard against StrictMode double-invoke duplicating the track twice.
    if (clonedRef.current) return;
    clonedRef.current = true;

    // Duplicate the children so the track can loop seamlessly.
    const children = Array.from(scroller.children);
    children.forEach((child) => {
      scroller.appendChild(child.cloneNode(true));
    });

    container.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse"
    );
    container.style.setProperty(
      "--animation-duration",
      speed === "fast" ? "40s" : speed === "normal" ? "60s" : "90s"
    );
    setStart(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // Hairline top/bottom rules turn this into a banded ribbon, matching
        // <Marquee />'s full-bleed divider treatment elsewhere on the page.
        //
        // The band itself is deliberately NOT masked. The fade belongs to the
        // moving text only — put it on this element and it eats the surface and
        // the two hairlines along with the words, so the ribbon's ends dissolve
        // into the page and it stops reading as a full-bleed band.
        "scroller relative z-20 overflow-hidden border-y py-6 md:py-7",
        ink.band,
        className
      )}
    >
      {/* Masked viewport — fades only the words in and out at the edges. */}
      <div className="mask-[linear-gradient(to_right,transparent,white_7%,white_93%,transparent)]">
        <ul
          ref={scrollerRef}
          className={cn(
            // gap-6 is load-bearing: .animate-scroll's translateX offset
            // (see globals.css) is hardcoded to exactly half of it, which is
            // what makes the duplicated track loop without a visible seam.
            "flex w-max shrink-0 list-none flex-nowrap items-center gap-6 p-0",
            start && "animate-scroll",
            pauseOnHover && "hover:[animation-play-state:paused]"
          )}
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="flex shrink-0 items-center gap-4 whitespace-nowrap"
            >
              <p
                className={cn(
                  "m-0 font-serif text-lg italic leading-none tracking-tight md:text-xl lg:text-[1.4rem]",
                  ink.quote
                )}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-[0.18em] md:text-[10px]",
                  ink.author
                )}
              >
                {item.author}
                <span className={cn("mx-1.5", ink.dot)}>&middot;</span>
                {item.role}
              </span>
              {/* Gold phoenix mark as the separator between quotes. */}
              <Mark size={16} className="shrink-0 opacity-80" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
