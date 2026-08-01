/**
 * Media — the single, reusable next/image wrapper used for every photo.
 *
 * Always fills its (positioned) parent, lazy-loads by default, and covers the
 * frame. Centralising image rendering here means we can add blur placeholders,
 * art-direction, or a CMS loader later in ONE place.
 *
 * The parent must be `position: relative` with a defined size — pair with the
 * aspect-ratio utilities on the wrapping element.
 *
 * TODO (future phases):
 *  - Generate and pass real blurDataURL placeholders per asset.
 *  - Add optional `priority` art-direction for above-the-fold hero media.
 */
import Image from "next/image";
import { cn } from "@/utils/cn";

interface MediaProps {
  src: string;
  alt: string;
  className?: string;
  /** Above-the-fold images (hero) should set priority to skip lazy loading. */
  priority?: boolean;
  /**
   * Start fetching now, without `priority`'s preload link + high fetchpriority.
   *
   * For images that are in the DOM but clipped out of the viewport (e.g. inside
   * a collapsed accordion panel), where lazy loading would otherwise defer the
   * fetch until the exact moment the panel opens and stutter the animation.
   */
  eager?: boolean;
  /** Responsive sizes hint for the browser. */
  sizes?: string;
  /**
   * Art direction for the crop, as a CSS `object-position` value (e.g. "35% 50%").
   *
   * Worth setting on full-bleed media, where a landscape source cropped to a
   * portrait viewport can lose its subject. Defaults to centred.
   */
  objectPosition?: string;
  /** Extra data attribute (e.g. data-image) for animation hooks to target. */
  "data-image"?: boolean;
}

export default function Media({
  src,
  alt,
  className,
  priority = false,
  eager = false,
  sizes = "100vw",
  objectPosition,
  ...rest
}: MediaProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      // Lazy by default; hero opts in to priority, clipped media to eager.
      priority={priority}
      loading={priority ? undefined : eager ? "eager" : "lazy"}
      sizes={sizes}
      className={cn("object-cover", className)}
      // Merged last by next/image, so this wins over its own fill styles.
      style={objectPosition ? { objectPosition } : undefined}
      // Pass through data-image for useImageReveal to target the media element.
      {...(rest["data-image"] ? { "data-image": "" } : {})}
    />
  );
}
