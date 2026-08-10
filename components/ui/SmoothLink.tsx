"use client";

/**
 * SmoothLink — the site's ONE link primitive.
 *
 * Every navigable thing on this site is one of four kinds of link, and each
 * kind was previously handled — or mishandled — separately at its own call
 * site. This component is the single place that knows the difference:
 *
 *   1. an IN-PAGE anchor  (`#contact`)   → smoothed scroll through Lenis
 *   2. that same anchor, FROM ANOTHER PAGE → a route change to `/#contact`
 *   3. an internal ROUTE  (`/faq`)       → client-side navigation
 *   4. anything else      (`https:`, `mailto:`, `tel:`) → a plain anchor
 *
 * ── Why 1 and 2 both needed fixing ────────────────────────────────────────
 *
 * (1) was a bare `<a href="#contact">`, which the browser answers with an
 * instant jump. The whole page is scrolled by Lenis, so that jump also fought
 * the smoothing engine for a frame — the one place on a site built around
 * weighted scrolling where the scrolling was not weighted at all.
 *
 * (2) was outright broken. The masthead renders on /faq and /photography, and
 * on those pages "About" pointed at `#practice` — an id that exists only on the
 * home page. The browser found nothing, so the link silently did nothing at
 * all: five of the seven nav items were dead on two of the three pages. The fix
 * is to route to `/#practice` instead, which <SmoothScrollProvider /> then
 * completes by scrolling to the section on arrival — unless the section turns
 * out to be on this page after all, in which case it just scrolls.
 *
 * ── Why the offset exists ─────────────────────────────────────────────────
 *
 * The masthead is `fixed`, so the top of a section scrolled to `y = 0` sits
 * underneath it. Every scroll target is therefore stopped short by the bar's
 * resting height plus a little air; see SCROLL_OFFSET.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import {
  navigateToRoute,
  navigateToSection,
  type Travel,
} from "@/lib/sectionNavigation";

interface SmoothLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
  /**
   * `"scroll"` forces the smoothed scroll instead of letting the distance
   * decide. One caller wants it: the hero's scroll cue, which is an invitation
   * to scroll and would be lying if it answered with a cut. See
   * lib/sectionNavigation.ts.
   */
  travel?: Travel;
}

/**
 * `forwardRef` is not decoration: the masthead animates two of these through
 * `motion.create(SmoothLink)`, and framer-motion writes its transforms to the
 * DOM node it is handed. Without the ref it would have nothing to write to.
 */
const SmoothLink = forwardRef<HTMLAnchorElement, SmoothLinkProps>(
  function SmoothLink({ href, children, onClick, travel = "auto", ...rest }, ref) {
    const pathname = usePathname();

    // ── Kind 4: external, mail, phone. Not ours to manage. ──────────────
    if (!href.startsWith("#") && !href.startsWith("/")) {
      return (
        <a ref={ref} href={href} onClick={onClick} {...rest}>
          {children}
        </a>
      );
    }

    /**
     * ── One handler for every internal destination ─────────────────────
     *
     * A click is offered to the navigation layer, which decides how to travel:
     * a smoothed scroll for something already on screen, a chapter card for a
     * real jump, a chapter card that ALSO changes route for another page. Only
     * if it declines — reduced motion, the page we are already on, no overlay
     * mounted — does the element's own behaviour run: the browser for an anchor,
     * the router for a <Link>.
     *
     * Failing over rather than swallowing is what keeps this safe: nothing here
     * can leave a link doing nothing.
     */
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);

      // Leave modified clicks alone — cmd/ctrl-click opens a new tab, and a
      // middle click is not a left click. Hijacking those is the classic way a
      // custom link handler becomes worse than the anchor it replaced.
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      // A `#section` link is offered to this page first, and only then to the
      // router. That order is what lets "Contact" scroll to the block already at
      // the bottom of /faq, while "About" — which names a section this page does
      // not have — becomes a card that changes route and lands on it.
      const handled = href.startsWith("#")
        ? navigateToSection(href, travel) || navigateToRoute(`/${href}`)
        : navigateToRoute(href);
      if (handled) e.preventDefault();
    };

    // ── Kind 3: an internal route ───────────────────────────────────────
    // Still a <Link>: it prefetches, which is what makes the route commit
    // inside the card's cover animation rather than after it, and it is the
    // fallback when the card declines the click.
    if (!href.startsWith("#")) {
      return (
        <Link ref={ref} href={href} onClick={handleClick} {...rest}>
          {children}
        </Link>
      );
    }

    // ── Kind 2: an in-page anchor, requested from another page. ─────────
    // The href is rewritten to `/#section` so the fallback is right — a
    // middle-click, a crawler and a copied link all get somewhere real — and
    // the provider finishes the scroll after the route change.
    //
    // The handler still runs first, and that matters: /faq and /photography
    // both END with <Contact />, so on those pages "Contact" and "Enquire"
    // point at a section that is right there. Testing for the element rather
    // than trusting the pathname means they scroll to it instead of taking a
    // round trip to the home page to reach the same block.
    //
    // `scroll={false}` stops Next restoring scroll to the top before the
    // provider's tween, which would otherwise be visible as a jump.
    if (pathname !== "/") {
      return (
        <Link
          ref={ref}
          href={`/${href}`}
          scroll={false}
          onClick={handleClick}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    // ── Kind 1: an in-page anchor on the page that owns it. ─────────────
    return (
      <a ref={ref} href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }
);

export default SmoothLink;
