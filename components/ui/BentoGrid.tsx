/**
 * BentoGrid / BentoGridItem — modern asymmetric grid (Aceternity), restyled to
 * the luxury aesthetic: hairline borders, generous space, minimal rounding, and
 * a cursor-follow gold glow (via SpotlightCard) instead of drop shadows.
 *
 * Items can span columns/rows via className (e.g. `md:col-span-2`) to create the
 * signature bento rhythm.
 *
 * Source: https://ui.aceternity.com/components/bento-grid
 */
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

import { cn } from "@/utils/cn";
import SpotlightCard from "./SpotlightCard";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[15rem] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  icon: Icon,
  index,
}: {
  className?: string;
  title: string;
  description: string;
  icon: IconType;
  /** Optional large index numeral shown as a watermark. */
  index?: string;
}) {
  return (
    <SpotlightCard
      className={cn("flex flex-col justify-between p-8 lg:p-10", className)}
    >
      {/* Optional oversized index watermark */}
      {index && (
        <span className="pointer-events-none absolute right-6 top-4 font-serif text-6xl text-emerald/8">
          {index}
        </span>
      )}

      <Icon
        size={30}
        className="text-emerald transition-transform duration-500 group-hover:-translate-y-1"
        aria-hidden
      />

      <div className="transition-transform duration-500 group-hover:translate-x-1">
        <h3 className="font-serif text-2xl text-emerald md:text-3xl">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-charcoal/70">
          {description}
        </p>
      </div>
    </SpotlightCard>
  );
}
