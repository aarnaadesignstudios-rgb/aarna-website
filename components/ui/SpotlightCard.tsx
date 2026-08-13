"use client";

/**
 * SpotlightCard — a card whose surface lights up with a soft gold glow that
 * follows the cursor (Aceternity "card spotlight" pattern), plus a gold border
 * that warms on hover.
 *
 * Wrap any card content in it. Keeps our minimal-rounding, hairline-border,
 * shadow-light aesthetic; the glow is what makes it feel modern and alive.
 *
 * @example
 *   <SpotlightCard className="p-10">…</SpotlightCard>
 */
import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

import { cn } from "@/utils/cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Radius of the glow in px. */
  radius?: number;
  /** Base surface tone. */
  surface?: string;
  /**
   * Border classes, resting and hover.
   *
   * A prop rather than something the caller layers on through `className`,
   * because `cn()` is a plain joiner with no conflict resolution: passing a
   * second border colour would leave both classes on the element and let CSS
   * source order pick the winner. The default suits a card on a light surface;
   * on a dark brand ground a faint tint of the text colour disappears, so those
   * callers pass a gold hairline instead.
   */
  border?: string;
}

export default function SpotlightCard({
  children,
  className,
  radius = 260,
  surface = "bg-mist",
  border = "border-current/10 hover:border-gold/40",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-radius);
  const mouseY = useMotionValue(-radius);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Gold radial glow positioned at the cursor.
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-gold) 16%, transparent), transparent 75%)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-colors duration-500",
        border,
        surface,
        className
      )}
    >
      {/* Cursor-follow glow (revealed on hover). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
