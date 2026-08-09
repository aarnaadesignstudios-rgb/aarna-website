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

/**
 * A single principle in the "Why Us" index.
 *
 * No icon field. These carried a Feather glyph each until the section was
 * rebuilt as hairline bays — a stock icon set is the fastest way to make a
 * bespoke studio site look assembled from parts, and the six glyphs
 * illustrated nothing the four words beside them did not already say.
 */
export interface Feature {
  id: string;
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
  /** Set only where the discipline opens a page of its own. */
  href?: string;
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

/** A client testimonial. */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
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
  /** CSS width for the panel — intentionally uneven for editorial rhythm. */
  width: string;
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
}

/**
 * One photograph in the /photography portfolio grid.
 *
 * `span` and `aspect` are Tailwind classes rather than numbers on purpose: the
 * grid is deliberately irregular — a full-bleed panorama between two portrait
 * pairs, and so on — and that rhythm is a design decision per frame, not
 * something worth deriving from image dimensions.
 */
export interface PhotoFrame {
  id: string;
  image: string;
  /** Column span at md+, e.g. "md:col-span-7". */
  span: string;
  /** Aspect-ratio utility, e.g. "aspect-4/3". */
  aspect: string;
  /** Optional caption. Empty until the studio supplies them. */
  caption?: string;
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
