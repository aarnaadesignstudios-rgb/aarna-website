"use client";

/**
 * Reveal — declarative entrance wrapper powered by Framer Motion.
 *
 * The lightweight, zero-config way to give any block a calm fade-up on scroll.
 * For heavier scroll-driven choreography, use the GSAP hooks instead.
 *
 * @example
 *   <Reveal><h2>Heading</h2></Reveal>
 *   <Reveal variant="fadeScale" delay={0.1}>…</Reveal>
 */
import { motion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import {
  fadeUp,
  fadeIn,
  fadeScale,
  VIEWPORT_ONCE,
} from "@/animations/variants";

const VARIANTS: Record<string, Variants> = { fadeUp, fadeIn, fadeScale };

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
  /** Extra delay in seconds, useful for manual sequencing. */
  delay?: number;
  as?: ElementType;
}

// Cast motion so it accepts an arbitrary polymorphic tag.
const MotionTag = motion.create as unknown as (tag: ElementType) => ElementType;

/**
 * Motion components are cached per tag at module scope — NOT created during
 * render.
 *
 * `motion.create()` returns a brand new component type on every call, and React
 * treats a changed type as a different element: it unmounts the old subtree and
 * mounts a fresh one. Calling it inside the render body therefore threw away
 * and rebuilt every child (images included) on each re-render of the parent,
 * which killed in-flight CSS transitions inside Reveal and caused visible jank
 * in any section that re-renders on interaction.
 */
const motionTagCache = new Map<ElementType, ElementType>();

function getMotionTag(as: ElementType): ElementType {
  let Tag = motionTagCache.get(as);
  if (!Tag) {
    Tag = MotionTag(as);
    motionTagCache.set(as, Tag);
  }
  return Tag;
}

export default function Reveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  as = "div",
}: RevealProps) {
  const Tag = getMotionTag(as);
  return (
    <Tag
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}
