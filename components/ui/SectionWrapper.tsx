/**
 * SectionWrapper — vertical rhythm + scroll anchor for every section.
 *
 * Responsibilities:
 *  - Provides the generous, consistent vertical spacing between sections.
 *  - Attaches the `id` used by navbar anchor links and ScrollTrigger.
 *  - Optionally sets a background tone from the palette.
 *
 * Sections should ALWAYS be wrapped in this so spacing and scroll targets stay
 * uniform. Inner horizontal layout is handled by PageContainer.
 */
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import PageContainer from "./PageContainer";

type Tone = "mist" | "stone" | "emerald" | "charcoal" | "transparent";

const TONE_CLASSES: Record<Tone, string> = {
  mist: "bg-mist text-charcoal",
  stone: "bg-stone text-charcoal",
  emerald: "bg-emerald text-cream",
  charcoal: "bg-charcoal text-cream",
  transparent: "",
};

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Background tone from the palette. */
  tone?: Tone;
  /** When true, content is not constrained by PageContainer (full-bleed). */
  fullBleed?: boolean;
  /** Extra classes for the inner container. */
  containerClassName?: string;
}

export default function SectionWrapper({
  id,
  children,
  className,
  tone = "transparent",
  fullBleed = false,
  containerClassName,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        // Generous editorial vertical spacing, scaling up on larger screens.
        "py-24 md:py-32 lg:py-40",
        TONE_CLASSES[tone],
        className
      )}
    >
      {fullBleed ? (
        children
      ) : (
        <PageContainer className={containerClassName}>{children}</PageContainer>
      )}
    </section>
  );
}
