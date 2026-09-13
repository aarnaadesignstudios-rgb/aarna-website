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
import { pathForSection, sectionForPath } from "@/lib/sections";
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
   * a move within the current page (`/faq`, `/about`, `/#practice` from
   * either of them).
   */
  route: string | null;
  /** An in-page target to scroll to while covered, if there is one. */
  hash: string | null;
  /**
   * The clean URL to write once we are there — `/services`, not `#services`.
   *
   * Only set for an IN-PAGE jump, where nothing navigates and the address bar
   * would otherwise not move at all. A route change gets its URL from the
   * router itself. See lib/sections.ts.
   */
  urlPath?: string;
  /** Two-digit index, as the mobile index numbers them. */
  index: string | null;
  /** The destination's name, as the visitor just read it on the link. */
  label: string;
  /**
   * The wordmark, rather than a section or a page.
   *
   * The card sets its label in the site's SERIF, because every destination it
   * names is a chapter and chapter titles are set in the serif. The wordmark is
   * not a chapter — it is the studio's name, and the studio's name is set in
   * the DISPLAY face everywhere else it appears (the masthead, the intro). A
   * visitor clicking the logo was shown their own studio's name in the wrong
   * typeface, which is the one string on the site where that is noticeable.
   */
  wordmark: boolean;
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
 * /about is reached from the masthead's own entry, a commission is reached from
 * the ring, and the wordmark's #hero is the studio rather than a section.
 */
function describe(href: string): {
  index: string | null;
  label: string;
  wordmark: boolean;
} {
  /* ── An empty path is this page, and the default does not catch it ─────
     `"#hero".split("#")` is `["", "hero"]`, and a destructuring default only
     fires on `undefined` — an empty string is a value, so `path` was `""` and
     every test below that compares it to `"/"` silently failed.

     What that broke was the wordmark, and only the wordmark, because it is the
     one destination reached by a bare fragment that is NOT also a nav entry:
     the nav's own links match on the fragment before the path is ever
     consulted. Clicking the masthead's logo on the home page therefore fell
     past the wordmark branch, found no path segment to title-case either, and
     put up a chapter card with an EMPTY name on it — the mark and two gold
     rules and nothing between them. From /faq or /about the same click
     took a different route through here (`/#hero`, which does have a path) and
     was named, which is why this only ever looked broken on one page. */
  const [rawPath = "/", hash] = href.split("#");
  const path = rawPath || "/";

  /* ── Every destination is a PATH now, so one form matches ────────────────
     This used to reconcile two spellings of the same place — "#practice" on
     the home page and "/#practice" everywhere else — because a fragment link
     rendered differently depending on which page it was on. With the chapters
     on real routes (see lib/sections.ts) there is one spelling: `/services` is
     `/services` from anywhere, and it is what NAV_LINKS holds.

     A legacy fragment still resolves, by mapping it to the path its chapter now
     answers to. That keeps a shared `/#services` link naming "Services" on the
     card rather than falling through to the title-cased-segment branch. */
  const canonical = !rawPath && hash ? pathForSection(hash) : path;
  const i = NAV_LINKS.findIndex((l) => l.href === canonical);
  if (i !== -1) {
    return {
      index: String(i + 1).padStart(2, "0"),
      label: NAV_LINKS[i]!.label,
      wordmark: false,
    };
  }

  // The wordmark. The studio, not a section, so it is named rather than
  // numbered — and named in FULL. This was `SITE.shortName`, which is the
  // one-word "Aarnaa" the favicon and the document title use where there is no
  // room for the rest. There is room here: the card is the whole viewport, and
  // what the visitor just clicked reads "Aarnaa Design Studios" in the
  // masthead. Abbreviating it on the way to the top of the page made the
  // transition look like it belonged to a different site.
  if (path === "/" && (!hash || hash === "hero")) {
    return { index: null, label: SITE.name, wordmark: true };
  }

  // A route with no nav entry — a commission under /work, say. Title-case its
  // last segment, unless the caller passed a better name (see `cardLabel`).
  const segment = path.split("/").filter(Boolean).pop();
  if (segment) {
    return {
      index: null,
      label: segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      wordmark: false,
    };
  }

  return { index: null, label: "", wordmark: false };
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

  /* The chapter's clean URL, so the address bar reads `/services` rather than
     `/#services` — see lib/sections.ts. Computed from the section id rather
     than passed in, so every route into this function (a masthead link, the
     hero's scroll cue, a card's "back to the gallery") produces the same URL
     for the same destination and they cannot drift apart. */
  const urlPath = pathForSection(hash.slice(1));

  // Reduced motion: no wipe, no tween, no 1.4s of anything. Just be there.
  if (prefersReducedMotion()) {
    scrollToHash(hash, { immediate: true, urlPath });
    return true;
  }

  const distance = Math.abs(target - window.scrollY);
  const far = distance > window.innerHeight * CARD_THRESHOLD;

  if (travel === "scroll" || !far || !listener) {
    scrollToHash(hash, { urlPath });
    return true;
  }

  listener({
    route: null,
    hash,
    urlPath,
    direction: target > window.scrollY ? 1 : -1,
    ...describe(urlPath),
  });
  return true;
}

/**
 * Go to another PAGE — /faq, /about, or a section of the home page from
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
export function navigateToRoute(href: string, label?: string): boolean {
  const [path = "/", hash] = href.split("#");

  /* ── A chapter's path is an in-page move when the chapter is HERE ────────
     `/services` is a real route, but on the home document it names a section
     that is already rendered a few screens below. Routing to it would tear the
     page down and rebuild it in order to arrive at something that never left
     the screen — and it would restart the intro's sibling animations, drop the
     ring's scroll position and re-run every entrance on the way.

     So: if this path names a chapter AND that chapter's element exists on the
     page we are on, travel to it the way any in-page destination is travelled —
     a smooth scroll for a short hop, a chapter card for a long one — and write
     the clean path into the address bar without a navigation.

     The element test, not the pathname, is what decides. From /faq the same
     link finds no `#services` and falls through to a real route change below;
     from `/projects` (which renders the whole home document) it finds one and
     scrolls. Both are correct, and neither has to know which page it is on. */
  const sectionId = sectionForPath(path);
  if (sectionId && typeof document !== "undefined") {
    if (document.getElementById(sectionId)) {
      return navigateToSection(`#${sectionId}`);
    }
  }

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
    /* ── A chapter reached from ANOTHER page needs its fragment ───────────
       `/services` clicked from /faq is a real route change, and the page it
       lands on is the whole home document — whose top is the hero, not
       Services. <SectionTransition /> scrolls to `hash` while the card still
       covers the viewport, so handing it one is what makes the reveal show the
       chapter already in place rather than the top of the page followed by a
       jump. Without it that branch calls `smoothScrollTo(0)` and the visitor
       arrives at the hero having asked for Services.

       `hero` is the exception and stays null: its path IS `/`, and the top of
       the document is where a no-fragment arrival already goes. */
    hash: hash
      ? `#${hash}`
      : sectionId && sectionId !== "hero"
        ? `#${sectionId}`
        : null,
    // A page change has no up or down, so it always travels forward: in from
    // the bottom, out through the top, the same way a downward jump does.
    direction: 1,
    ...describe(href),
    /* ── A caller that knows the destination's real name wins ──────────
       `describe` names an unlisted route by title-casing its last path
       segment, which is right for a hand-authored route and wrong for a CMS
       one. A
       project's slug is whatever the studio typed into Sanity — today those
       are "33424", "545", "ads" and "223" — so clicking a commission put up a
       card that said "33424" and held it there for as long as the page took to
       load. The card is on screen longer now (see ROUTE_WAIT_CAP_MS in
       <SectionTransition />), which turns that from a blemish into the main
       thing a visitor reads on the way in.

       So a link may name its own destination, and <SelectedWorks /> passes the
       project's title. Applied AFTER the spread, so it overrides. */
    ...(label ? { label } : null),
  });
  return true;
}

export { CARD_THRESHOLD, SCROLL_OFFSET };
