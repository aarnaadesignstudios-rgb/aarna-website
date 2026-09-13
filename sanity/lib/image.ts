/* The NAMED export. The default one is deprecated in @sanity/image-url 2.x and
   warns on every call — which on a page that resolves a photograph per card is
   the same line repeated dozens of times in the dev server's output, drowning
   anything else it has to say. Same function, same signature. */
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image as SanityImage } from "sanity";

import { dataset, projectId, sanityEnabled } from "../env";

const builder = sanityEnabled
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

/** A Sanity image with the extras this site reads off it. */
export type Photo = SanityImage & {
  alt?: string;
  hotspot?: { x: number; y: number };
};

/**
 * What every consumer of a CMS image gets: a URL, a focal point, and alt text.
 *
 * The site's own `<Media />` already speaks exactly this vocabulary — `src`,
 * `objectPosition`, `alt` — which is why the integration touches one component
 * rather than nine.
 */
export interface ResolvedPhoto {
  src: string;
  /** CSS `object-position`, derived from the hotspot. */
  objectPosition?: string;
  alt: string;
}

/**
 * ── The hotspot becomes `object-position` ─────────────────────────────────
 *
 * Sanity can crop server-side, but only when it is told both a width AND a
 * height — and this site does not have either at request time. Every photograph
 * here is `fill` + `object-cover` inside a box whose size is decided by CSS at
 * a dozen breakpoints, and the browser does the cropping.
 *
 * So the hotspot is not used to cut the file. It is converted into the CSS
 * property that steers the browser's own crop, which is the same
 * `objectPosition` prop `<Media />` has always accepted. One number in the
 * Studio, one number in the stylesheet, no server-side crop, and the full
 * source stays available for a container of any shape.
 *
 * Sanity's hotspot is normalised 0–1 from the top left, and `object-position`
 * takes percentages from the same origin — so the conversion is a multiply.
 * Centre (the default) is left undefined rather than written as "50% 50%", so
 * an image without a hotspot inherits the component's own default instead of
 * being pinned by a value nobody chose.
 */
export function resolvePhoto(
  photo: Photo | null | undefined,
  fallbackAlt = ""
): ResolvedPhoto | null {
  if (!photo || !builder || !photo.asset) return null;

  const src = builder
    .image(photo)
    // Wide enough for the hero at 2x on a large display. `<Media />` narrows it
    // per breakpoint through the loader below; this is only the ceiling.
    .width(2400)
    .auto("format")
    .quality(82)
    .url();

  const h = photo.hotspot;
  const centred = !h || (Math.abs(h.x - 0.5) < 0.01 && Math.abs(h.y - 0.5) < 0.01);

  return {
    src,
    objectPosition: centred
      ? undefined
      : `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%`,
    alt: photo.alt?.trim() || fallbackAlt,
  };
}

/**
 * An image's own proportions, as `width / height`.
 *
 * ── Read out of the asset REF, not fetched ───────────────────────────────
 *
 * A Sanity asset id carries its dimensions in the id itself —
 * `image-a1b2c3…-2400x1600-jpg` — so the shape of a picture is knowable
 * without asking for it. The alternative is projecting
 * `asset->metadata.dimensions` in the query, which is a JOIN per image on a
 * fact already sitting in the string.
 *
 * ── What it is for ───────────────────────────────────────────────────────
 *
 * Photographs do not need it: they are `object-cover` inside a frame the
 * layout chose, and the hotspot decides what survives the crop. DRAWINGS do.
 * A floor plan cannot be cropped, so its plate has to be the shape of the
 * drawing — otherwise the plate is letterboxed and the plan is rendered
 * smaller than the space allows, which for something a visitor is trying to
 * READ is the whole ballgame. See the Layout section on a project page.
 *
 * Returns undefined for a local file, a malformed ref, or a zero dimension, so
 * the caller can fall back to a frame of its own choosing.
 */
export function aspectFromRef(photo: Photo | null | undefined) {
  const ref = photo?.asset && "_ref" in photo.asset ? photo.asset._ref : undefined;
  if (typeof ref !== "string") return undefined;

  // `-<digits>x<digits>-` followed by the extension, at the end of the id.
  const m = /-(\d+)x(\d+)-[a-z]+$/i.exec(ref);
  if (!m) return undefined;

  const w = Number(m[1]);
  const h = Number(m[2]);
  return w > 0 && h > 0 ? w / h : undefined;
}

/**
 * A `next/image` loader that asks Sanity for the exact width being rendered.
 *
 * Without it, next/image would fetch the 2400px URL above and re-optimise it
 * on the host — paying twice for the same work, and on Vercel spending image
 * optimisation quota to reprocess something a CDN already served in AVIF.
 *
 * `<Media />` applies this only to Sanity sources; local files in `/public`
 * keep Next's own pipeline, which is the right tool for them.
 */
export function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 82));
  url.searchParams.set("auto", "format");
  return url.toString();
}

/** Is this a URL our loader should handle? */
export function isSanityUrl(src: string) {
  return src.startsWith("https://cdn.sanity.io/");
}
