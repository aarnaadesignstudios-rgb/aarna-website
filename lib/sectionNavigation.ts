"use client";

/**
 * sectionNavigation — how the site travels between sections.
 *
 * ── The problem with scrolling there ──────────────────────────────────────
 *
 * The obvious implementation of "click Process, go to Process" is to tween the
 * scroll position, and that is what this site did. It is also, on THIS page,
 * the one implementation guaranteed to look broken.
 *
 * The reason is that the distance is not empty. Between the masthead and
 * Process sit two GSAP-pinned galleries whose tracks translate SIDEWAYS as you
 * scroll through them, a parallaxed hero, a marquee, and a dozen scrubbed
 * reveals. A 9,000px tween crosses all of it in 1.4 seconds, so every one of
 * those animations is asked to play at roughly twenty times its intended speed:
 * the project gallery whips across the screen, the services track whips back,
 * and the whole thing reads as the page tearing sideways. Measured on an
 * optimised build, that tween dropped four frames of 50–83ms — visible as
 * exactly the judder it was reported as.
 *
 * No amount of easing fixes it, because the jitter is not in the scrolling. It
 * is in the content being flown through.
 *
 * ── What replaces it ─────────────────────────────────────────────────────
 *
 * A CHAPTER CARD. For any jump long enough that the journey is not worth
 * watching, an emerald panel wipes across the viewport in the direction of
 * travel, names the section you asked for the way the site names every section
 * — a gold index, a rule, the title in the serif — and lifts away to reveal it
 * already in place. The scroll itself happens instantly, while nothing is
 * visible.
 *
 * That buys three things at once:
 *
 *   · it CANNOT jitter. Nothing animates through the intermediate sections,
 *     because the traversal is one instant set of the scroll position while the
 *     screen is covered. The only moving thing is one transform on one panel
 *   · it stops lying about distance. A 1.4s tween tells you Process is far
 *     away; a card tells you it is a chapter of the same document
 *   · it is the site's own language. The intro screen already opens with an
 *     emerald panel that dissolves into the page, and every section already
 *     announces itself as "04 — Process"
 *
 * Short hops keep the smooth scroll — a curtain to travel half a screen would
 * be absurd, and at that distance the tween has nothing to fly through.
 *
 * This module owns the DECISION and the plumbing; <SectionTransition /> owns
 * the choreography. They are split so that the transition can be a rendered
 * component with real exit animations while the decision stays callable from
 * any link handler.
 */
import { NAV_LINKS, SITE } from "@/constants";
import { markIntroPlayed } from "@/lib/intro";
import { scrollToHash, SCROLL_OFFSET, targetForHash } from "@/lib/SmoothScrollProvider";

/**
 * How far a jump has to be before it earns a chapter card, in viewport heights.
 *
 * 0.6 — just over half a screen — is lower than it first looks like it should
 * be, and the number was measured rather than chosen.
 *
 * A tween only has to cross ONE section boundary to be expensive: the section
 * arriving has never been painted, so its first frame carries the whole cost of
 * that paint — an emerald surface built from three gradients, a heading
 * mounting, the masthead flipping palette and re-blurring 30px of glass. On a
 * cold page, the shortest jump on the site (hero → About, 0.89 screens) still
 * dropped four frames over 50ms, one of them 116ms. Every jump that took a card
 * instead measured clean.
 *
 * So the threshold sits below the shortest link in the masthead, which makes the
 * behaviour consistent as well as smooth: clicking a nav item always announces
 * the chapter. Below it are only the cases where the destination is already on
 * screen — "Contact" pressed while you are reading Contact — and there a card
 * would be announcing a journey that never happened.
 *
 * The hero's scroll cue opts out explicitly (`prefer: "scroll"`). It is an
 * invitation to scroll; answering it with a cut would be a lie about what the
 * gesture does.
 */
const CARD_THRESHOLD = 0.6;

export interface SectionCard {
  /**
   * A route to navigate to while covered, if this is a page change rather than
   * a move within the current page (`/faq`, `/photography`, `/#practice` from
   * either of them).
   */
  route: string | null;
  /** An in-page target to scroll to while covered, if there is one. */
  hash: string | null;
  /** Two-digit index, as the mobile index numbers them. */
  index: string | null;
  /** The destination's name, as the visitor just read it on the link. */
  label: string;
  /** 1 travelling down the page, -1 travelling up. Drives the wipe direction. */
  direction: 1 | -1;
}

type Listener = (card: SectionCard) => void;

/**
 * Deliberately a single listener rather than a set: there is exactly one
 * transition overlay on the page, and a second one would mean two panels
 * racing over the same scroll position.
 */
let listener: Listener | null = null;

export function onSectionCard(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/**
 * What to print on the card.
 *
 * The nav's own numbering, so the card agrees with the index in the mobile
 * menu — a visitor who has seen "06 FAQ" there should not be told "04 FAQ"
 * here. Destinations that are not nav entries are named rather than numbered:
 * /photography is reached from a Services card, and the wordmark's #hero is the
 * studio rather than a section.
 */
function describe(href: string): { index: string | null; label: string } {
  const [path = "/", hash] = href.split("#");

  // The same destination can be written two ways depending on where the link is
  // rendered: "#practice" on the home page, "/#practice" everywhere else. Both
  // have to find the same nav entry, or clicking About from /faq produces a card
  // with nothing on it.
  const forms = hash ? [href, `#${hash}`] : [href];
  const i = NAV_LINKS.findIndex((l) => forms.includes(l.href));
  if (i !== -1) {
    return { index: String(i + 1).padStart(2, "0"), label: NAV_LINKS[i]!.label };
  }

  // The wordmark. The studio, not a section, so it is named rather than
  // numbered.
  if (path === "/" && (!hash || hash === "hero")) {
    return { index: null, label: SITE.shortName };
  }

  // A route with no nav entry — /photography, reached from a Services card.
  // Title-case its last segment.
  const segment = path.split("/").filter(Boolean).pop();
  if (segment) {
    return {
      index: null,
      label: segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    };
  }

  return { index: null, label: "" };
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** How a caller would like to travel, when it has an opinion. */
export type Travel = "auto" | "scroll";

/**
 * Go to an in-page section, by whichever means suits the distance.
 *
 * Returns false when this page has no such section, so the caller can fall back
 * to a route change or to the browser's own behaviour.
 */
export function navigateToSection(hash: string, travel: Travel = "auto"): boolean {
  const target = targetForHash(hash);
  if (target === null) return false;

  // Reduced motion: no wipe, no tween, no 1.4s of anything. Just be there.
  if (prefersReducedMotion()) {
    scrollToHash(hash, { immediate: true });
    return true;
  }

  const distance = Math.abs(target - window.scrollY);
  const far = distance > window.innerHeight * CARD_THRESHOLD;

  if (travel === "scroll" || !far || !listener) {
    scrollToHash(hash);
    return true;
  }

  listener({
    route: null,
    hash,
    direction: target > window.scrollY ? 1 : -1,
    ...describe(hash),
  });
  return true;
}

/**
 * Go to another PAGE — /faq, /photography, or a section of the home page from
 * one of them — behind the same chapter card.
 *
 * ── Why a route change gets the card too ──────────────────────────────────
 *
 * FAQ sits in the masthead between Process and Contact, and nothing about it
 * announces that it is a page rather than a section. Before this, six of the
 * seven nav items wiped to a named card and the seventh cut instantly to a new
 * screen — the one difference a visitor could feel was an implementation detail
 * they have no reason to know about.
 *
 * It also buys the same thing it buys in-page. A client-side route change swaps
 * the entire document body: the old page's sections unmount, the new one's mount
 * and run their entrance animations, images start loading, and the masthead
 * re-measures which band it is over. Covering that is the difference between
 * arriving somewhere and watching it being assembled.
 *
 * Returns false when the navigation is not ours to take over — same page, no
 * overlay mounted, reduced motion — in which case the caller's <Link> does what
 * it would have done anyway.
 */
export function navigateToRoute(href: string): boolean {
  const [path = "/", hash] = href.split("#");
  const samePage = path === window.location.pathname;

  // Already here: this is a move within the page, not a navigation.
  if (samePage) {
    return hash ? navigateToSection(`#${hash}`) : navigateToSection("#hero");
  }

  // ── The intro belongs to an arrival, not to a navigation ────────────────
  // Past this point a page change is definitely happening, which means any
  // later render of `/` is a RETURN rather than a first impression. Someone who
  // landed on /faq from a search result and then clicked About has already met
  // the studio — the masthead, the wordmark and the mark are all on screen —
  // and answering that click with 2.9 seconds of brand panel, on top of the
  // chapter card that is already covering the change, is two introductions to
  // a visitor who needed none. See lib/intro.ts.
  markIntroPlayed();

  // No overlay, or a visitor who has asked for less motion: let the router get
  // on with it. Reduced motion is honoured by NOT dressing the change up.
  if (!listener || prefersReducedMotion()) return false;

  listener({
    route: href,
    hash: hash ? `#${hash}` : null,
    // A page change has no up or down, so it always travels forward: in from
    // the bottom, out through the top, the same way a downward jump does.
    direction: 1,
    ...describe(href),
  });
  return true;
}

export { CARD_THRESHOLD, SCROLL_OFFSET };
