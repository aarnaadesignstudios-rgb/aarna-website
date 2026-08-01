/**
 * Shared, strictly-typed domain models used across sections.
 * Keep this file free of React/DOM types so it can be imported anywhere.
 */
import type { IconType } from "react-icons";

/** A navigation entry rendered in the navbar and footer. */
export interface NavLink {
  label: string;
  /** In-page anchor target, e.g. "#about". */
  href: string;
}

/** A single "Why choose us" value proposition card. */
export interface Feature {
  id: string;
  icon: IconType;
  title: string;
  description: string;
}

/** A single credibility figure in the achievements band under the hero. */
export interface Stat {
  id: string;
  /** The number the counter animates to. */
  value: number;
  /** Appended to the counted value, e.g. "+" or "%". */
  suffix?: string;
  /** Short mono label sitting under the figure. */
  label: string;
}

/** A studio service offering. */
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
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

/** A project panel in the pinned horizontal "Selected Works" gallery. */
export interface Work {
  id: string;
  category: string;
  title: string;
  location: string;
  area: string;
  year: string;
  description: string;
  image: string;
  /** CSS width for the panel — intentionally uneven for editorial rhythm. */
  width: string;
}

/** A row in the ruled "Disciplines" accordion index. */
export interface Discipline {
  id: string;
  title: string;
  /** Short right-aligned qualifier, e.g. "Villas · Estates". */
  meta: string;
  description: string;
  image: string;
}

/**
 * A single frame in the hero's cross-dissolving image cycle.
 *
 * These are real studio projects, so `alt` describes the space rather than the
 * brand — the hero carries no copy of its own.
 */
export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  /**
   * Optional art direction for the crop, as a CSS `object-position` value.
   * Only set it where centring loses the subject on narrow viewports.
   */
  position?: string;
}

/** A social media profile link. */
export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}
