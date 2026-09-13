/**
 * Shared, strictly-typed domain models used across sections.
 * Keep this file free of React/DOM types so it can be imported anywhere.
 */
import type { IconType } from "react-icons";

/** A navigation entry rendered in the navbar and contact block. */
export interface NavLink {
  label: string;
  /** In-page anchor ("#about") or a route ("/faq"). */
  href: string;
}

/** A single "Why choose us" value proposition card. */
export interface Feature {
  id: string;
  icon: IconType;
  title: string;
  description: string;
}

/**
 * A single credibility figure in the achievements band under the hero.
 *
 * `value` is a STRING, not a number. Two of the five figures ("2 Lakh",
 * "Pan India") are not countable, and a count-up that ran on three of five
 * would read as broken rather than as restrained — so the whole row simply
 * arrives instead of counting.
 */
export interface Stat {
  id: string;
  value: string;
  /** Short label sitting under the figure. */
  label: string;
}

/** One of the studio's disciplines. */
export interface Service {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  /** Revealed when the title is clicked; not shown at rest. */
  body: string;
  image: string;
  /**
   * An optional link at the foot of the body, revealed with it.
   *
   * ── This replaced `href`, which made the whole card a link ──────────────
   *
   * Architectural Photography used to carry `href: "/photography"` — a page on
   * this site — and the card read that as "this discipline is a page": the
   * photograph and the name became one big anchor, the `+` became an arrow, and
   * the body was printed at rest instead of on a click, because there was no
   * click to wait for. (The destination is Postcard of Life's own portfolio now
   * and the page is gone; the shape of the field is what this note is about.)
   *
   * One of five cards behaving differently from the other four is a difference
   * a visitor has to notice and then work out, and it cost the row its rhythm:
   * that card was the only one whose height was set by permanent copy, which is
   * what forced the other four to reserve the same space and sit half empty.
   *
   * A link in the body says the same thing without breaking the set. Every card
   * is now the same object — image, name, `+` — and the destination is offered
   * where the reader is already reading.
   */
  link?: { label: string; href: string };
}

/** A featured architecture project. */
export interface Project {
  id: string;
  title: string;
  location: string;
  year: string;
  category: string;
  image: string;
}

/** A single step in the studio's working process. */
export interface ProcessStep {
  id: string;
  /** Display index, e.g. "01". */
  step: string;
  title: string;
  description: string;
}

/**
 * A client testimonial.
 *
 * `role` is the commission and its city, printed under the name. Optional
 * because it comes from the CMS now and a quote with no project attached is a
 * normal thing for a studio to have — see sanity/schemas/testimonial.ts. The
 * card renders the line only when there is something to put in it.
 */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

/**
 * A project panel in the pinned horizontal "Selected Works" gallery.
 *
 * `location`, `area` and `year` are optional and currently unset for every
 * real project: the studio has not supplied them, and an invented area on a
 * real commission is worse than a visible gap. The gallery renders the meta
 * row only when there is something to put in it.
 */
export interface Work {
  id: string;
  category: string;
  title: string;
  location?: string;
  area?: string;
  year?: string;
  description: string;
  image: string;
  /**
   * Art direction for the crop, as a CSS `object-position` value.
   *
   * Set from the photograph's hotspot when the project comes from Sanity — see
   * sanity/lib/image.ts. Undefined means centred, which is what every
   * hand-authored entry in `constants/content.ts` uses.
   */
  objectPosition?: string;
  /** CSS width for the panel — intentionally uneven for editorial rhythm. */
  width: string;
}

/**
 * One photograph on a project's own page.
 *
 * `wide` is the studio's call, made per picture in the Studio, because which
 * shot deserves the full measure is an editorial decision about the photograph
 * and not something a rule about position can get right.
 */
export interface WorkPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  objectPosition?: string;
  wide?: boolean;
}

/**
 * A project, plus everything that only its own page needs.
 *
 * Separate from `Work` on purpose. The ring asks for all nine projects at once
 * and needs a name, a category and one photograph from each; pulling every
 * write-up and every gallery into that query to render a heading would be a
 * large amount of content fetched to be thrown away. This is read one at a
 * time, by slug.
 *
 * `body` is Portable Text — Sanity's block format — and is typed loosely here
 * so `types/` does not have to depend on the CMS. It is rendered by
 * components/ui/ProjectBody.tsx, which is the only thing that inspects it.
 */
export interface WorkDetail extends Work {
  body?: unknown[];
  gallery?: WorkPhoto[];
  /** The next and previous commissions, for the footer's continue-reading pair. */
  siblings?: { prev?: WorkLink; next?: WorkLink };
}

/** Just enough of a project to link to it. */
export interface WorkLink {
  id: string;
  title: string;
  category: string;
  image: string;
  objectPosition?: string;
}

/** A single frame in the hero's cross-dissolving image cycle. */
export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  /** Project name, captioned under the hero while this frame is up. */
  title: string;
  /**
   * Optional art direction for the crop, as a CSS `object-position` value.
   * Only set it where centring loses the subject on narrow viewports.
   */
  position?: string;
  /**
   * An optional second photograph, used below 768px in place of `image`.
   *
   * ── Art direction, not a smaller file ───────────────────────────────────
   *
   * Every image on this site is already served at the width it is rendered at,
   * so this is not about bytes. The hero is the one full-VIEWPORT frame on the
   * site, which means a phone shows a landscape photograph through a ~9:19
   * window: `object-cover` keeps the height and throws away most of the width,
   * and `--frame-zoom` then crops in further (see <ImageCycle />). A hotspot
   * can choose WHICH slice survives that; it cannot make the slice a picture of
   * a room. A shot framed vertically can.
   *
   * Undefined — the default, and what every committed entry uses — means the
   * one photograph is shown at every width, exactly as before.
   */
  mobileImage?: string;
  /** `object-position` for `mobileImage`. Independent of `position`. */
  mobilePosition?: string;
}


/** A question and answer on the FAQ page. */
export interface Faq {
  id: string;
  question: string;
  answer: string;
}

/** A social media profile link. */
export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}

/**
 * A single photograph that is not part of a list — the founder's portrait, the
 * backdrop behind the enquiry form.
 *
 * It is `src` / `alt` / `objectPosition` because that is exactly what
 * <Media /> takes, which is what lets `getSiteImages()` hand its result
 * straight to the component with no adapter in between. The committed
 * fallbacks are in `constants/content.ts` as SITE_IMAGES.
 */
export interface Photograph {
  src: string;
  alt: string;
  /** CSS `object-position`, from the photograph's hotspot when it came from the CMS. */
  objectPosition?: string;
}

/** The two one-off photographs, together. See `Photograph` above. */
export interface SiteImages {
  founderPortrait: Photograph;
  contactBackdrop: Photograph;
}
