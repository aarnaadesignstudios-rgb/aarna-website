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
 * ── Two sources, one component ───────────────────────────────────────────
 *
 * `src` is either a path in `/public` or a Sanity CDN URL, and each gets the
 * pipeline that suits it:
 *
 *   · a LOCAL file goes through Next's optimiser, which is the right tool for
 *     something sitting on the same disk as the build
 *   · a SANITY url is resized by Sanity instead, via the loader. Without that,
 *     Next would fetch the 2400px original and re-encode it — paying twice for
 *     the same work, and on Vercel spending image-optimisation quota to
 *     reprocess something a CDN already served as AVIF
 *
 * The switch is a URL check rather than a prop, so no caller has to know or
 * care which kind of image it was handed. That is what kept this integration
 * to one component instead of the nine that render photographs.
 *
 * TODO (future phases):
 *  - Generate and pass real blurDataURL placeholders per asset.
 */
import Image from "next/image";

import { isSanityUrl, sanityLoader } from "@/sanity/lib/image";
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
      // See the note above. Local files keep Next's own pipeline.
      loader={isSanityUrl(src) ? sanityLoader : undefined}
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
