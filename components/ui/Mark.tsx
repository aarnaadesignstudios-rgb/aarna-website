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
  const width = Math.round(size * MARK_ASPECT);

  return (
    <Image
      src="/images/aarnaa-mark.png"
      alt={`${SITE.name} emblem`}
      width={width}
      height={size}
      priority={priority}
      /**
       * Pinned inline rather than left to `h-auto w-auto` classes.
       *
       * `width`/`height` on <img> are only *presentational hints*, so author CSS
       * beats them — `h-auto w-auto` therefore fell back to the file's intrinsic
       * size, which for a next/image is whatever variant the optimizer chose
       * from `imageSizes`, not what `size` asked for. `size={52}` painted at
       * 64px, `size={20}` at 32px, and so on: the prop was a rounding hint
       * rather than a dimension. An inline style outranks any class, so `size`
       * is now authoritative.
       */
      style={{ width, height: size }}
      className={cn("object-contain", className)}
    />
  );
}
