"use client";

/**
 * SmoothScrollProvider
 *
 * Initialises Lenis smooth scrolling once at the root of the application and
 * synchronises it with GSAP's ScrollTrigger + ticker so that scroll-driven
 * animations stay perfectly in sync with the smoothed scroll position.
 *
 * Wrap the app once (see app/layout.tsx). Individual sections do NOT need to
 * know about Lenis — they simply use ScrollTrigger as usual.
 *
 * A module-level accessor (`smoothScrollTo`) lets any component trigger a
 * smoothed programmatic scroll (e.g. the Works gallery's index buttons) without
 * threading the instance through context.
 *
 * TODO (future phases):
 *  - Add reduced-motion handling to disable smoothing for accessibility.
 */
import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sectionForPath } from "@/lib/sections";

// Shared handle to the live Lenis instance.
let lenisInstance: Lenis | null = null;

/**
 * How far above a section's top edge to stop, in pixels.
 *
 * The masthead is `fixed`, so a section scrolled to `y = 0` sits underneath
 * it. Its resting height is ~92px (a `pt-5` inset plus `py-3.5` around a 38px
 * emblem) and it tightens to ~70px once scrolled, which is the state it is
 * always in by the time a scroll finishes. 96 clears the tightened bar with a
 * few pixels of air, so a section heading lands just below the glass rather
 * than tucked behind its bottom edge.
 *
 * Negative because Lenis ADDS `offset` to the target position.
 *
 * It lives here, next to the scrolling, rather than in the link component that
 * is its most visible consumer — <SmoothLink /> imports `scrollToHash` from
 * this module, so the reverse direction would be a cycle.
 */
export const SCROLL_OFFSET = -96;

/**
 * Smoothly scroll to a Y position (or element/selector) via Lenis when it is
 * available, falling back to native smooth scroll otherwise.
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) {
  if (lenisInstance) {
    /* ── Re-MEASURE before moving ─────────────────────────────────────────
       Lenis caches the document's scroll limit and only recomputes it from its
       own ResizeObserver, which fires asynchronously. Every `scrollTo` is
       clamped to that cached limit, so a stale one silently truncates the
       target instead of failing.

       That is what broke every client-side route change from a SHORT page to
       the home document. /faq is 2442px tall against a 900px viewport, so
       Lenis's limit was 1542 — and arriving at /services, whose section sits
       at 6011, the scroll was clamped to exactly 1542 and stopped there. It
       looked like the wrong section had been targeted; the target was right and
       the ceiling was three thousand pixels too low. Both later corrections
       clamped to the same number, which is why re-scrolling never helped.

       `resize()` recomputes it synchronously. It is a measurement on a
       deliberate, user-initiated scroll — a handful per session — so the cost
       is irrelevant next to being able to arrive at the right place. */
    lenisInstance.resize();

    // ── Re-sync before moving ────────────────────────────────────────────
    // Lenis animates its OWN idea of the scroll position, and something else
    // can move the page underneath it: the browser jumping to a fragment on a
    // back/forward, an extension, a focus scroll. When that happens its
    // bookkeeping is stale, and a `scrollTo` computed from a stale origin can
    // resolve to "you are already there" and do nothing at all — which is
    // exactly how a hash change left a section pinned under the masthead
    // instead of easing down to clear it.
    //
    // `actualScroll` is the real `scrollY`; adopting it costs one comparison
    // and makes every programmatic scroll start from where the page really is.
    if (Math.abs(lenisInstance.animatedScroll - lenisInstance.actualScroll) > 1) {
      lenisInstance.animatedScroll = lenisInstance.targetScroll =
        lenisInstance.actualScroll;
    }

    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.4,
      /* Set the position in one frame, with no easing. Used where the travel is
         not meant to be seen: an arriving deep link, reduced motion, or the
         moment a chapter card has the viewport covered. */
      immediate: options?.immediate ?? false,
      // `force` is required, not defensive. Lenis ignores `scrollTo` while it is
      // stopped, and the mobile index stops it for as long as it is open — so
      // tapping a link there closed the menu and then went nowhere, because the
      // React state that releases the freeze had not been committed yet by the
      // time this ran. A scroll asked for in code is always intentional; only
      // wheel and touch should be subject to the freeze.
      force: true,
    });
  } else if (typeof window !== "undefined" && typeof target === "number") {
    window.scrollTo({ top: target + (options?.offset ?? 0), behavior: "smooth" });
  }
}

/**
 * Freeze / release the page scroll.
 *
 * Exists for the mobile index, which is a `fixed inset-0` overlay: without
 * this, wheel and touch still reach Lenis underneath, so the page scrolls
 * behind the menu and closing it drops you somewhere you never chose to be.
 *
 * Anything that needs to scroll INSIDE a frozen page must carry
 * `data-lenis-prevent`, which Lenis honours by leaving that subtree alone.
 */
export function setSmoothScrollPaused(paused: boolean) {
  if (!lenisInstance) return;
  if (paused) lenisInstance.stop();
  else lenisInstance.start();
}

/**
 * Where a hash would put us, in absolute document space — masthead offset
 * included, clamped to what the document can actually scroll to.
 *
 * Exported because the navigation layer has to know the DISTANCE to a section
 * before it can decide how to travel there (see lib/sectionNavigation.ts).
 * Returns null when this page has no such section.
 */
export function targetForHash(hash: string): number | null {
  const id = hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return null;

  const raw = el.getBoundingClientRect().top + window.scrollY + SCROLL_OFFSET;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(0, raw), Math.max(0, max));
}

/**
 * Scroll to an in-page hash (`"#contact"`) through Lenis, clearing the
 * masthead.
 *
 * `immediate` skips the easing entirely — for arriving deep links, for reduced
 * motion, and for the moment a chapter card has the viewport covered and the
 * travel is not meant to be seen.
 *
 * Returns false when this page has no element with that id, so a caller can
 * fall back to whatever the browser would have done rather than swallowing the
 * interaction.
 */
export function scrollToHash(
  hash: string,
  {
    updateUrl = true,
    immediate = false,
    urlPath,
  }: { updateUrl?: boolean; immediate?: boolean; urlPath?: string } = {}
): boolean {
  const id = hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;

  smoothScrollTo(el, { offset: SCROLL_OFFSET, immediate });

  if (!updateUrl) return true;

  /* ── The address bar gets a PATH, not a fragment ────────────────────────
     `urlPath` is the chapter's own clean URL — `/services` rather than
     `#services`; see lib/sections.ts for why the fragments went away. It is
     written with `history.pushState`, which changes the URL WITHOUT asking the
     router to render anything: the document is already the home page and the
     section is already on screen, so a real navigation here would tear down
     and rebuild the page we are looking at.

     Falling back to the hash keeps this honest for anything that is still a
     fragment — a section with no route of its own would otherwise silently
     stop updating the URL at all. */
  const next = urlPath ?? hash;
  const current = window.location.pathname + window.location.hash;
  if (current !== next) {
    window.history.pushState(null, "", next);
  }
  return true;
}

/**
 * Finish a navigation that ARRIVED with a hash — `/#contact` typed in, shared
 * as a link, or produced by <SmoothLink /> when a masthead link is clicked
 * from /faq or /about.
 *
 * This cannot simply scroll on the next frame, for three reasons that each
 * break it in a different way:
 *
 *   · the intro screen holds `body { overflow: hidden }` for its first ~2.9s,
 *     and nothing can scroll while it does
 *   · the section may not exist yet — the heavier ones below the fold arrive
 *     through `next/dynamic`
 *   · two sections are PINNED by ScrollTrigger, which inserts spacers that
 *     change the document's height and therefore every target position after
 *     them. Scrolling before those exist lands somewhere else entirely.
 *
 * So it waits for the page to actually be scrollable and the target to be
 * present, refreshes ScrollTrigger so the pinned spacers are measured, and
 * only then hands over to Lenis. The deadline stops it polling forever over a
 * hash that names nothing on this page.
 */
function completeHashNavigation(hash: string) {
  const id = hash.slice(1);
  if (!id) return () => {};

  // ── Take the fragment out of the URL while we work ──────────────────────
  // (Only relevant to a real fragment; `completeSectionArrival` below has no
  // fragment to fight and skips all of this.)
  // Chrome scrolls to a fragment when the document commits AND AGAIN once it
  // has finished loading, which on a page this tall — lazy images, two pinned
  // sections — is well after our own scroll has finished. That second attempt
  // anchors to the element's raw top edge, undoing the masthead offset: a cold
  // load of /#process landed 96px lower than the same link clicked in-page, and
  // with the section's heading tucked under the bar.
  //
  // Removing the fragment leaves the browser nothing to re-anchor to. It goes
  // back into the address bar once we are done, because the URL a visitor
  // copies should still name the section they are looking at.
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);

  let frame = 0;
  let restore = 0;
  const deadline = performance.now() + 8000;

  const tick = () => {
    const el = document.getElementById(id);
    // The intro sets this inline and clears it inline; reading the inline
    // style rather than the computed one keeps the check specific to that
    // lock instead of matching any `overflow: hidden` in the cascade.
    const locked = document.body.style.overflow === "hidden";

    if (el && !locked) {
      ScrollTrigger.refresh();
      // `immediate`: an ARRIVING deep link should simply be at its section.
      // Easing there means tweening the whole document — past two pinned
      // galleries that then scrub at twenty times their intended speed — as the
      // very first thing a visitor sees. It is the same reason a long in-page
      // jump gets a chapter card instead of a scroll; see
      // lib/sectionNavigation.ts.
      smoothScrollTo(el, { offset: SCROLL_OFFSET, immediate: true });
      // Comfortably past the 1.4s tween, so the fragment reappears only once
      // nothing is moving.
      restore = window.setTimeout(() => {
        window.history.replaceState(null, "", hash);
      }, 1800);
      return;
    }
    if (performance.now() < deadline) frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(restore);
  };
}

/**
 * Finish a navigation that ARRIVED on a chapter's own path — `/services` typed
 * in, shared as a link, opened from a search result, or client-side-routed to
 * from /faq.
 *
 * It waits for the same three things `completeHashNavigation` does, and for the
 * same reasons: the intro screen holds the page unscrollable for its first
 * ~2.9s, the heavier sections arrive through `next/dynamic`, and two of them
 * are ScrollTrigger-PINNED, so the document's height — and therefore every
 * target position below them — is wrong until those spacers exist.
 *
 * ── What it does NOT have to do ─────────────────────────────────────────
 * All of the fragment juggling in `completeHashNavigation`: there is no `#` in
 * the URL, so Chrome has nothing to re-anchor to when the document finishes
 * loading, and the URL never has to be taken apart and put back. That whole
 * class of bug — the one where a cold load of `/#process` landed 96px lower
 * than the same link clicked in-page — cannot happen on a path.
 */
function completeSectionArrival(id: string) {
  let frame = 0;
  let settle = 0;
  const deadline = performance.now() + 8000;

  /**
   * ── Landing once is not enough ─────────────────────────────────────────
   *
   * <SelectedWorks /> and <Services /> are ScrollTrigger-PINNED, and a pin
   * inserts a spacer that adds about five and a half screens to the document.
   * Those two sections also arrive through `next/dynamic`, so their pins are
   * built a beat AFTER the section elements exist — which means there is a
   * window where `#services` is in the DOM, measurable, and at completely the
   * wrong y, because the spacer that pushes it down has not been created yet.
   *
   * Scrolling in that window lands short. Measured on a client-side move from
   * /faq to /services: the scroll resolved to y=1542 and, once the projects pin
   * materialised, that position was showing <SelectedWorks /> instead — the
   * visitor asked for Services and arrived at Projects.
   *
   * A cold load hid this, which is why the direct-arrival tests all passed: the
   * intro holds the page unscrollable for ~2.9s, and everything has mounted and
   * pinned by the time the lock lifts. A client-side route change has no intro,
   * so it fires into exactly that window.
   *
   * So the arrival re-asserts itself while the document is still growing:
   * whenever `scrollHeight` changes, ScrollTrigger is re-measured and the
   * position re-applied. It stops once the height has held still for three
   * consecutive checks, or after 2.5s, whichever comes first. Every correction
   * is `immediate`, and on a card-covered navigation all of this happens behind
   * the panel — there is nothing to see either way.
   */
  const holdPosition = () => {
    let lastHeight = -1;
    let stable = 0;
    const settleDeadline = performance.now() + 2500;

    const check = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const height = document.documentElement.scrollHeight;
      if (height !== lastHeight) {
        lastHeight = height;
        stable = 0;
        ScrollTrigger.refresh();
        smoothScrollTo(el, { offset: SCROLL_OFFSET, immediate: true });
      } else {
        stable += 1;
      }
      if (stable < 3 && performance.now() < settleDeadline) {
        settle = window.setTimeout(check, 120);
      }
    };
    settle = window.setTimeout(check, 120);
  };

  const tick = () => {
    const el = document.getElementById(id);
    // The intro sets this inline and clears it inline; reading the inline
    // style keeps the check specific to that lock.
    const locked = document.body.style.overflow === "hidden";

    if (el && !locked) {
      ScrollTrigger.refresh();
      // `immediate`: an arriving link should simply BE at its chapter. Easing
      // there means tweening the whole document past two pinned galleries as
      // the first thing a visitor sees.
      smoothScrollTo(el, { offset: SCROLL_OFFSET, immediate: true });
      holdPosition();
      return;
    }
    if (performance.now() < deadline) frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(settle);
  };
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      // Calm, weighted easing — subtle, never bouncy.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    // Drive Lenis from GSAP's ticker for a single unified RAF loop.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      // GSAP ticker time is in seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  /**
   * Complete an arriving `/#section` navigation.
   *
   * Keyed on `pathname` rather than run once on mount, because both routes into
   * this have to work: a cold load of `/#contact`, and a client-side route
   * change from /faq — which does NOT remount this provider (it lives in the
   * root layout), so a mount-only effect would silently miss it. The pathname
   * does change on that navigation, which is the signal we can actually see;
   * the App Router exposes no hash hook.
   *
   * Same-page hash clicks push a hash without changing the pathname, so they do
   * not re-trigger this — <SmoothLink /> has already scrolled for those.
   */
  useEffect(() => {
    /* A chapter's own path — `/services`. This is the normal case now; the
       fragment branch below is back-compatibility for links shared before the
       chapters had routes. `hero` is excluded because its path is `/`, where
       the top of the document is already the destination and scrolling to it
       would fight the router's own scroll restoration. */
    const section = sectionForPath(pathname);
    if (section && section !== "hero") return completeSectionArrival(section);

    if (!window.location.hash) return;
    return completeHashNavigation(window.location.hash);
  }, [pathname]);

  /**
   * A hash change on a page that is already loaded — the back and forward
   * buttons walking through sections the masthead pushed, or someone editing
   * the fragment in the address bar.
   *
   * The browser answers those itself, by aligning the element's top edge to
   * `y = 0` — under the fixed masthead, and instantly. It cannot be prevented
   * (there is no cancellable event for a same-document fragment navigation), so
   * this eases from wherever the jump left us to the position the same link
   * would have reached when clicked. `updateUrl: false` because the URL is
   * already what it should be; writing it again would push a duplicate entry
   * and make Back stop working.
   */
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) scrollToHash(window.location.hash, { updateUrl: false });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return <>{children}</>;
}
