"use client";

/**
 * ── Why this is a client component ────────────────────────────────────────
 *
 * It hands `next/image` a `loader` FUNCTION for Sanity sources (see below), and
 * a function cannot cross the server/client boundary as a prop — React has to
 * serialise props, and there is no wire format for a closure. While every
 * caller was itself a client component this never came up; the project pages
 * under app/work/[slug] are server components, and rendering a Sanity
 * photograph from one failed the build with "Functions cannot be passed
 * directly to Client Components".
 *
 * Declaring the boundary HERE rather than making each page a client component
 * is the right place for it: the loader is this file's decision, so this file
 * is what has to run where the loader can be constructed. Server components can
 * render it freely — only its own props cross the boundary, and those are all
 * strings.
 */
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
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";

import { isSanityUrl, sanityLoader } from "@/sanity/lib/image";
import { cn } from "@/utils/cn";

/**
 * Where `mobileSrc` takes over, as a media query.
 *
 * It is Tailwind's `md` breakpoint (48rem) minus the smallest step, which is
 * exactly what the `max-md:` variant below resolves to. The two HAVE to agree:
 * the <source> chooses the FILE and the class chooses that file's
 * `object-position`, so a mismatch would crop the phone picture with the
 * desktop picture's hotspot inside the sliver of width between them.
 *
 * In `rem` rather than `px` for the same reason — Tailwind's breakpoints are
 * rem-based, so at a larger root font size both move together instead of
 * drifting apart.
 */
const MOBILE_MEDIA = "(max-width: 47.9375rem)";

/**
 * Its complement, for the preload below — a `<link rel="preload">` has no
 * "otherwise" branch the way a <picture> does, so the desktop half has to state
 * the condition it wants rather than inheriting what is left over.
 */
const DESKTOP_MEDIA = "(min-width: 48rem)";

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
  /**
   * A different PHOTOGRAPH below 768px — art direction, not a smaller file.
   *
   * `objectPosition` above answers "this landscape shot is being centre-cropped
   * and the subject has fallen out of the frame". It cannot answer "a 9:19
   * slice of this room is not a picture of a room", which is the hero's problem
   * on a phone, and the only honest fix for that is a photograph framed
   * vertically. See sanity/schemas/shared.ts.
   *
   * Undefined — the default everywhere except a hero slide the studio has
   * uploaded a phone crop for — renders a plain <Image />, byte-for-byte what
   * this component did before the prop existed.
   */
  mobileSrc?: string;
  /** `object-position` for `mobileSrc`. Independent of `objectPosition`. */
  mobileObjectPosition?: string;
  /**
   * How the image sits in its frame.
   *
   * `cover` — the default, and what every photograph on this site wants: fill
   * the box, crop whatever does not fit, and let the hotspot decide what
   * survives (see `objectPosition`).
   *
   * `contain` — fit the whole image inside the box and letterbox the
   * remainder. For images where a crop is not a compromise but a LOSS of
   * information: the floor plans in a project's Layout section, where cropping
   * to a 4:3 frame cuts rooms off the drawing. `objectPosition` is meaningless
   * alongside it — nothing is being cropped, so there is no crop to steer.
   *
   * ── Why this is a prop and not a class the caller passes ────────────────
   *
   * `cn` is a plain joiner, not `tailwind-merge` (see utils/cn.ts), so
   * `className="object-contain"` would emit `object-cover object-contain` and
   * leave the winner to whichever Tailwind happens to write later in the
   * stylesheet. That is a coin toss dressed up as an override. Deciding it
   * here means there is only ever one `object-fit` class on the element.
   */
  fit?: "cover" | "contain";
}

export default function Media({
  src,
  alt,
  className,
  priority = false,
  eager = false,
  sizes = "100vw",
  objectPosition,
  mobileSrc,
  mobileObjectPosition,
  fit = "cover",
}: MediaProps) {
  const objectFit = fit === "contain" ? "object-contain" : "object-cover";
  // Everything both sources share, so the two can only differ in the ways they
  // are meant to.
  const common = {
    fill: true,
    priority,
    loading: priority ? undefined : eager ? ("eager" as const) : ("lazy" as const),
    sizes,
  };

  /**
   * ── One source: the component as it has always been ────────────────────
   *
   * Taken by every caller but a hero slide with a phone crop uploaded, and it
   * matters that this path is untouched. <Image /> emits the `<link rel=
   * preload>` for a `priority` image; `getImageProps` below does not, because
   * the preload scanner cannot resolve a <picture> element's art direction
   * anyway. The hero's LCP frame therefore keeps its preload in every case
   * where there is a single file to preload.
   */
  if (!mobileSrc) {
    return (
      <Image
        {...common}
        // Spread objects are invisible to jsx-a11y, which then cannot tell a
        // decorative image from a missing label. Stated on the element in both
        // branches so the lint rule can do its job.
        alt={alt}
        src={src}
        // See the note above. Local files keep Next's own pipeline.
        loader={isSanityUrl(src) ? sanityLoader : undefined}
        className={cn(objectFit, className)}
        // Merged last by next/image, so this wins over its own fill styles.
        style={objectPosition ? { objectPosition } : undefined}
      />
    );
  }

  /**
   * ── Two sources: a real <picture>, not two <Image>s ────────────────────
   *
   * The obvious version of art direction in Next is to render both images and
   * hide one with `md:hidden` / `hidden md:block`. It is wrong here for a
   * reason that only bites on the element this prop exists for: a `display:
   * none` LAZY image is never fetched, but a `priority` one is preloaded
   * regardless of the CSS, so the hero's opening frame would download both
   * photographs on every phone and both on every desktop — paying twice, on
   * the LCP, to show one.
   *
   * `getImageProps()` gives the same optimisation pipeline (including the
   * Sanity loader, per source) as a set of plain attributes, and a <picture>
   * resolves exactly one of them before the fetch starts. One request, chosen
   * by the browser, at the width it will actually be rendered at.
   */
  const { props: mobileProps } = getImageProps({
    ...common,
    alt,
    src: mobileSrc,
    loader: isSanityUrl(mobileSrc) ? sanityLoader : undefined,
  });
  const { props: desktopProps } = getImageProps({
    ...common,
    alt,
    src,
    loader: isSanityUrl(src) ? sanityLoader : undefined,
  });

  /**
   * ── The preload, restored ────────────────────────────────────────────
   *
   * <Image priority> emits a `<link rel="preload">`; `getImageProps` does not,
   * because it returns attributes rather than rendering anything. On any other
   * element that would not be worth the lines — but this branch exists for the
   * hero, the hero's first frame is the page's LCP, and the intro screen holds
   * the site closed until that photograph has loaded (up to
   * `INTRO.revealWaitCapMs`). Losing its preload is paid for in the one number
   * a visitor actually experiences.
   *
   * `ReactDOM.preload()` rather than two <link> elements in the tree: React
   * does NOT hoist a rendered `<link rel="preload">` out of a client component
   * — measured, it emits in place, directly above the <picture> it describes,
   * which is no earlier than the preload scanner would have reached the
   * <picture> anyway. This call puts them in <head>.
   *
   * TWO of them, each carrying the `media` its <source> carries. Without that
   * a preload fetches the wrong photograph on one of the two form factors and
   * then fetches the right one as well — an art-directed image is the one case
   * where an unconditional preload actively costs bandwidth.
   */
  if (priority) {
    preload(mobileProps.src, {
      as: "image",
      media: MOBILE_MEDIA,
      imageSrcSet: mobileProps.srcSet,
      imageSizes: mobileProps.sizes,
      fetchPriority: "high",
    });
    preload(desktopProps.src, {
      as: "image",
      media: DESKTOP_MEDIA,
      imageSrcSet: desktopProps.srcSet,
      imageSizes: desktopProps.sizes,
      fetchPriority: "high",
    });
  }

  return (
    <>
      {/* `contents`, so the <picture> itself generates no box. Its only child is
          absolutely positioned, so an inline wrapper would contribute nothing
          but a stray line box to whatever it is dropped into. */}
      <picture className="contents">
        <source
          media={MOBILE_MEDIA}
          srcSet={mobileProps.srcSet}
          sizes={mobileProps.sizes}
        />
        {/* This IS the next/image <img> — `getImageProps` is how a <picture>
            gets one, so there is no <Image /> to use here instead. */}
        <img
          {...desktopProps}
          alt={alt}
          className={cn(
            objectFit,
            /* The crop follows the file. Two custom properties rather than two
               elements, because a <picture> has exactly one <img> and therefore
               exactly one `style` — and the flip has to happen at the same width
               the <source> flips at, which is what MOBILE_MEDIA guarantees. */
            "[object-position:var(--media-op,50%_50%)]",
            "max-md:[object-position:var(--media-op-mobile,var(--media-op,50%_50%))]",
            className
          )}
          style={
            {
              ...desktopProps.style,
              ...(objectPosition ? { "--media-op": objectPosition } : {}),
              ...(mobileObjectPosition
                ? { "--media-op-mobile": mobileObjectPosition }
                : {}),
            } as React.CSSProperties
            }
          />
      </picture>
    </>
  );
}
