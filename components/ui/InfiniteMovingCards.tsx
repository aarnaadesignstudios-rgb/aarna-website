"use client";

/**
 * InfiniteMovingCards — a row of cards that scrolls seamlessly forever, pausing
 * on hover (Aceternity). Ported to our `framer-motion`-free CSS animation and
 * restyled as quiet quote cards: cream surface, emerald hairline, emerald serif
 * copy, one short gold rule, mono attribution, faded track edges.
 *
 * Source: https://ui.aceternity.com/components/infinite-moving-cards
 */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import type { Testimonial } from "@/types";

interface InfiniteMovingCardsProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  /**
   * Card footprint. The two testimonial bands use different sizes so the rows
   * stay asymmetrical to one another.
   */
  size?: "sm" | "lg";
}

export default function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
  size = "lg",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const clonedRef = useRef(false);
  const [start, setStart] = useState(false);

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
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-6",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              // Cream card on the section's white ground, defined by an emerald
              // hairline rather than a heavy fill, lifted by one very soft
              // shadow. No alternating tones — the brand green is ink here.
              "relative max-w-full shrink-0 rounded-2xl border border-emerald/15 bg-cream",
              "shadow-[0_1px_2px_rgba(11,58,43,0.03),0_10px_30px_-16px_rgba(11,58,43,0.12)]",
              "w-[80vw] px-6 py-7 md:px-8 md:py-8",
              size === "lg" ? "sm:w-95 md:w-105" : "sm:w-80 md:w-85"
            )}
          >
            <blockquote className="flex h-full flex-col justify-between gap-6">
              <p
                className={cn(
                  "font-serif leading-[1.35] tracking-tight text-emerald",
                  size === "lg" ? "text-lg md:text-xl" : "text-base md:text-lg"
                )}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer>
                {/* Gold hairline — the brand accent, kept deliberately short. */}
                <span className="mb-3.5 block h-px w-7 bg-gold" />
                {/* Mono small-caps attribution, matching the spec-sheet labels
                    used across the rest of the site. */}
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald">
                  {item.author}
                </p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/45">
                  {item.role}
                </p>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
