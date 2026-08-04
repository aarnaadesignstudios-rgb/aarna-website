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
}

export default function SpotlightCard({
  children,
  className,
  radius = 260,
  surface = "bg-cream",
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
        "group relative overflow-hidden rounded-2xl border border-current/10 transition-colors duration-500 hover:border-gold/40",
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
