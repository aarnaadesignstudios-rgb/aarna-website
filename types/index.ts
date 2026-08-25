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
/**
 * A link revealed inside a discipline's expanded panel.
 *
 * Both fields are required, and `label` is not optional for a reason: a link
 * whose text is derived from its URL ("/photography") is a link a visitor has
 * to decode before deciding whether to follow it. Whoever adds the link knows
 * what is on the other end; the label is where they say so.
 */
export interface ServiceLink {
  label: string;
  /** Internal path ("/photography") or an absolute URL to another site. */
  href: string;
}

export interface Service {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  /** Revealed when the title is clicked; not shown at rest. */
  body: string;
  image: string;
  /**
   * Links shown inside the expanded panel, under the description.
   *
   * ── This replaced `href`, and the change is behavioural ─────────────
   *
   * `href?: string` meant "this discipline opens a page INSTEAD of expanding".
   * Exactly one discipline used it — Architectural Photography — and the cost
   * was that one card in a row of five behaved differently from its
   * neighbours: it navigated away rather than revealing its description, so
   * its copy had to be printed permanently to compensate, which in turn made
   * it the only card whose height did not agree with the others.
   *
   * A discipline can now expand AND lead somewhere, which is what that card
   * actually wanted. It also generalises: any discipline can carry any number
   * of links without needing a new field or a new branch in the component.
   */
  links?: ServiceLink[];
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
