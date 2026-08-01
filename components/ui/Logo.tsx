"use client";

/**
 * Logo — the brand mark, rendered from /public/images/aarnaa-logo.png.
 *
 * Robust by design: if the logo file isn't present yet (or fails to load), it
 * gracefully falls back to the serif wordmark, so the UI never shows a broken
 * image. Drop the brand PNG at `public/images/aarnaa-logo.png` and it appears
 * automatically — a transparent-background PNG is ideal so it sits cleanly on
 * any surface.
 *
 * @example
 *   <Logo widthPx={480} priority />           // full logo
 *   <Logo />                                   // default size
 */
import { useState } from "react";
import Image from "next/image";

import { SITE } from "@/constants";
import { cn } from "@/utils/cn";

// Transparent-background lockup (mark + wordmark), trimmed to content.
// Works cleanly on any surface (emerald loader, charcoal footer, etc.).
const LOGO_ASPECT = 1037 / 589;
const LOGO_SRC = "/images/aarnaa-logo-transparent.png";

interface LogoProps {
  /** Rendered display width in px (height derives from the aspect ratio). */
  widthPx?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  widthPx = 320,
  className,
  priority = false,
}: LogoProps) {
  const [failed, setFailed] = useState(false);

  // Fallback wordmark until the asset is available.
  if (failed) {
    return (
      <span className={cn("font-serif tracking-tight", className)}>
        {SITE.name}
      </span>
    );
  }

  const height = Math.round(widthPx / LOGO_ASPECT);

  return (
    <Image
      src={LOGO_SRC}
      alt={`${SITE.name} logo`}
      width={widthPx}
      height={height}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}
