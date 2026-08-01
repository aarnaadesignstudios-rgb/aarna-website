/**
 * Mark — the isolated gold phoenix "A" brand symbol (transparent background).
 *
 * Use this wherever the brand needs a compact signature: navbar, footer,
 * section accents, watermarks. It sits cleanly on any surface.
 *
 * Server component (no interactivity). Source: /public/images/aarnaa-mark.png.
 */
import Image from "next/image";
import { SITE } from "@/constants";
import { cn } from "@/utils/cn";

// Intrinsic aspect ratio of the exported mark (≈ 404 × 407 — essentially square).
const MARK_ASPECT = 404 / 407;

interface MarkProps {
  /** Rendered height in px (width derives from the aspect ratio). */
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function Mark({ size = 40, className, priority }: MarkProps) {
  return (
    <Image
      src="/images/aarnaa-mark.png"
      alt={`${SITE.name} emblem`}
      width={Math.round(size * MARK_ASPECT)}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
