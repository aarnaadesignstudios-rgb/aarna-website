"use client";

/**
 * SectionTransition — the chapter card.
 *
 *   ┌──────────────────────────────────────┐
 *   │                                      │   ← an emerald panel wipes in
 *   │        ──── 05                       │     from the direction of travel
 *   │        Process                       │
 *   │                                      │   ← the scroll happens HERE,
 *   └──────────────────────────────────────┘     instantly, unseen
 *
 * See lib/sectionNavigation.ts for why the site travels this way rather than
 * tweening the scroll position across two pinned galleries.
 *
 * ── The choreography, and why each beat is the length it is ───────────────
 *
 *   0.00  COVER — the panel translates in from the bottom (or the top, if you
 *         are travelling back up the page) over 0.5s. It has to be quick
 *         enough not to feel like a loading screen and slow enough to read as
 *         a deliberate object moving, not a cut
 *   0.50  JUMP — the instant the panel is known to cover the viewport, the
 *         scroll position is set. Not on a timer: on the enter animation's own
 *         completion callback, so it cannot fire a frame early on a slow
 *         machine and let the traversal show at the edge of the screen
 *   0.50  WAIT — up to half a second for the destination's photographs, which
 *         are lazy-loaded and have just come into range (see
 *         MEDIA_WAIT_CAP_MS). Usually nothing; on a cold cache it is what
 *         stops the section fading itself in after the reveal
 *   0.68  REVEAL — a beat of stillness with the section's name on screen, then
 *         the panel continues in the SAME direction and exits, so the whole
 *         movement reads as one sheet passing over the page rather than as a
 *         thing that arrives and then backs out
 *   1.28  done (a little longer if it waited on imagery)
 *
 * ── Mechanics worth knowing ──────────────────────────────────────────────
 *
 * The panel is a single `transform` on a single fixed element — the only thing
 * animating anywhere on the page during a transition, which is the entire point
 * of the approach.
 *
 * It sits above the masthead (z-70) rather than under it. That is deliberate:
 * the bar flips its own palette from cream to emerald depending on the band
 * behind it, and a jump usually changes that band. Covering the bar means the
 * flip happens unseen instead of as a flash halfway through.
 *
 * Input is frozen for the duration. A wheel gesture landing between the jump
 * and the reveal would otherwise scroll the page while it was hidden, and drop
 * you somewhere you never asked for.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { Mark } from "@/components/ui";
import { cn } from "@/utils/cn";
import {
  onSectionCard,
  type SectionCard,
} from "@/lib/sectionNavigation";
import {
  scrollToHash,
  setSmoothScrollPaused,
  smoothScrollTo,
} from "@/lib/SmoothScrollProvider";

/** The site's editorial easing, as a literal so framer can read it. */
const EASE = [0.22, 1, 0.36, 1] as const;

const COVER_S = 0.5;
/** Minimum stillness with the name on screen, between arriving and leaving. */
const HOLD_MS = 180;
const REVEAL_S = 0.62;

/**
 * How long the card will wait for the destination's imagery before lifting.
 *
 * ── Why this exists ──────────────────────────────────────────────────────
 *
 * Every photograph below the fold is lazy-loaded, and the old slow tween paid
 * for those loads by accident: 1.4 seconds of travel was 1.4 seconds in which
 * the images ahead came into range and decoded. Arriving instantly removes that
 * accident, and what it exposes is a section of empty `bg-stone` rectangles
 * filling in one by one after the reveal.
 *
 * So the card waits — but only for what a visitor would not notice. Past ~half a
 * second a transition stops reading as deliberate and starts reading as stuck,
 * which is worse than a photograph fading in late. The cap is the promise that
 * the reveal always comes.
 */
const MEDIA_WAIT_CAP_MS = 520;

/**
 * Resolve once the images inside `root` that a visitor is about to LOOK AT have
 * loaded, or once `capMs` expires — whichever comes first.
 *
 * ── Which images count ───────────────────────────────────────────────────
 *
 * This used to take the first four pending images in DOM order, which is a
 * proxy for "the ones on screen" and a bad one. Everything below the fold is
 * lazy-loaded, so a lazy image that is nowhere near the viewport reports
 * `complete: false` forever — it has not been asked to load and will not be
 * until it is scrolled to. Take four of those and the wait cannot finish early;
 * it burns the entire budget every single time and then resolves on the cap.
 *
 * That was survivable at 520ms and is not at ROUTE_MEDIA_WAIT_CAP_MS, which is
 * the change that made this worth fixing: a bigger budget is only safe if the
 * wait can actually end. So the filter is geometric now — an image is waited on
 * when its box intersects the viewport, give or take a fifth of a screen either
 * side, which is the same neighbourhood the browser itself uses to decide to
 * start fetching a lazy image.
 *
 * Six of them at most. Past that they are stacked deep enough down the page
 * that the reveal has finished before the eye reaches them.
 */
/**
 * How long the card will wait for a route change to actually commit.
 *
 * Links are prefetched, so on a warm cache the new page is usually on screen
 * within a frame or two of the push and this never comes close to expiring. The
 * cap covers the cold case — a first visit on a slow connection — where holding
 * the card indefinitely would turn a transition into a hang. Past it the reveal
 * happens anyway and the page arrives underneath, which is no worse than the
 * plain route change this replaced.
 *
 * ── Raised from 1400ms, because a project page is not a section ───────────
 *
 * 1400 was measured against the site's static pages — prerendered, and
 * committing almost immediately. A commission's page is a
 * different shape: it is a dynamic route whose content comes from the CMS, its
 * gallery is a column of large photographs, and it was reliably losing the race
 * — the cap expired, the card lifted, and the visitor watched the page assemble
 * itself in the open. That is the lag reported here.
 *
 * The number is a HANG guard, not a pace: nothing waits for it when the page is
 * ready sooner, so raising it costs a fast navigation nothing at all and only
 * changes what happens on a slow one. Six seconds is long enough to cover a
 * cold dynamic route on a poor connection and short enough that a genuinely
 * broken navigation still resolves rather than trapping the visitor behind a
 * panel.
 */
const ROUTE_WAIT_CAP_MS = 6000;

/**
 * The media budget for a ROUTE change, as opposed to an in-page jump.
 *
 * `MEDIA_WAIT_CAP_MS` above is deliberately short because a jump lands on a
 * section of a page that is already loaded and mostly decoded — half a second
 * is all there is to buy. A route change has a whole document's worth of
 * above-the-fold imagery arriving at once, and stopping at 520ms there means
 * revealing a page of empty placeholders, which is precisely what the card
 * exists to prevent.
 *
 * Safe to be this large only because `whenMediaSettles` waits on images that
 * are ON SCREEN rather than the first few in the DOM — see the note there. A
 * page whose visible imagery has arrived does not spend any of this.
 */
const ROUTE_MEDIA_WAIT_CAP_MS = 2600;

/** Resolve when `predicate` passes, or when `capMs` runs out. */
function waitFor(predicate: () => boolean, capMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    if (predicate()) return resolve();
    const deadline = performance.now() + capMs;
    const tick = () => {
      if (predicate() || performance.now() >= deadline) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function whenMediaSettles(root: HTMLElement, capMs: number): Promise<void> {
  const margin = window.innerHeight * 0.2;
  const pending = Array.from(root.querySelectorAll("img"))
    .filter((img) => {
      if (img.complete) return false;
      const box = img.getBoundingClientRect();
      // A zero-height box is an image that has not been laid out at all; it
      // cannot be judged on position, so it is left out rather than guessed at.
      if (box.height === 0) return false;
      return box.bottom > -margin && box.top < window.innerHeight + margin;
    })
    .slice(0, 6);

  if (pending.length === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let outstanding = pending.length;
    const cap = window.setTimeout(resolve, capMs);
    const settle = () => {
      if (--outstanding > 0) return;
      clearTimeout(cap);
      resolve();
    };
    for (const img of pending) {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", settle, { once: true });
    }
  });
}

/**
 * Resolve once the browser has actually PAINTED whatever React just committed.
 *
 * `router.push` resolving and the pathname changing tell you the new route is
 * mounted, not that it is on screen: the commit still has to be styled, laid
 * out and painted, and on a heavy page that is several frames. Revealing inside
 * that window shows the visitor the first, unstyled frame of their destination.
 *
 * Two frames, because one only gets you to the end of the current one.
 */
function afterPaint(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default function SectionTransition() {
  const router = useRouter();
  const pathname = usePathname();
  /**
   * The live pathname, readable from inside an async callback. `pathname` itself
   * is captured per render, so the covered handler would keep looking at the
   * page it started on and never see the navigation it just asked for.
   */
  const livePathname = useRef(pathname);
  livePathname.current = pathname;

  const [card, setCard] = useState<SectionCard | null>(null);
  /** Covered → the panel is over the viewport and the jump has happened. */
  const [covered, setCovered] = useState(false);
  const holdTimer = useRef<number | null>(null);
  /**
   * Which request is current. Incremented on every new one, so the async work
   * belonging to an abandoned transition — the media wait, the hold — cannot
   * dismiss the card that replaced it.
   */
  const requestId = useRef(0);

  useEffect(
    () =>
      onSectionCard((next) => {
        // A second request mid-transition replaces the destination rather than
        // stacking a second panel: the visitor changed their mind, and the
        // panel they are looking at is still the right panel.
        requestId.current += 1;
        if (holdTimer.current) clearTimeout(holdTimer.current);
        setCovered(false);
        setCard(next);
      }),
    []
  );

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      setSmoothScrollPaused(false);
    };
  }, []);

  /** Fired when the panel has finished covering the viewport. */
  const onCovered = useCallback(async () => {
    if (!card) return;
    const id = requestId.current;

    // Freeze input HERE rather than when the card was requested. The mobile
    // index releases the same freeze as it closes, and it closes on the click
    // that started this transition — so pausing any earlier meant racing that
    // release across a React commit. By the time the panel has finished
    // covering, the menu is gone and this is the only thing holding the lock.
    setSmoothScrollPaused(true);
    setCovered(true);

    // ── The travel itself, all of it behind the panel ──────────────────
    if (card.route) {
      // A page change. Wait for the router to commit before revealing, or the
      // card lifts on the page we are leaving and the swap happens in the open.
      const [path = "/"] = card.route.split("#");
      router.push(card.route);
      /* ── Both clocks, because one of them runs early ──────────────────
         This waited on `usePathname()` alone, and measured against a project's
         page that turned out to be the wrong clock: the router reports the new
         pathname when the navigation is committed to its own tree, which on a
         dynamic route is well before the browser's history entry is updated and
         the page is on screen. Sampled on a commission — the card lifted at
         ~1.5s with `location.pathname` still `/`, and the real navigation
         landed at ~3.4s. The visitor watched the page arrive in the open, which
         is the lag reported here, and raising the cap alone did nothing about
         it because the wait was resolving early rather than timing out.

         `window.location` is the later of the two and the one that means the
         document actually changed, so requiring BOTH is strictly more truthful
         than either. Neither is a paint — `afterPaint` below is. */
      await waitFor(
        () =>
          livePathname.current === path && window.location.pathname === path,
        ROUTE_WAIT_CAP_MS
      );
      if (requestId.current !== id) return;

      // The pathname is the router's answer, not the browser's. Give the commit
      // its frames before anything below measures the new page — the media wait
      // reads `getBoundingClientRect()`, and boxes that have not been laid out
      // yet report zero and get skipped, which would quietly turn the whole
      // wait into a no-op on exactly the heavy pages that need it most.
      await afterPaint();
      if (requestId.current !== id) return;

      if (card.hash) {
        // A route WITH a fragment — "About" clicked from /faq. The section has
        // to exist before it can be scrolled to, and the heavier ones arrive
        // through `next/dynamic`, a beat after the route commits. Doing it here
        // rather than leaving it to the provider's own arrival handling is what
        // guarantees the reveal shows the section already in place instead of
        // the top of the page followed by a jump. The provider remains the
        // backstop for anything still loading when the cap expires.
        await waitFor(
          () => document.getElementById(card.hash!.slice(1)) !== null,
          600
        );
        if (requestId.current !== id) return;
        /* `updateUrl: false` — the ROUTER already wrote the address, and it
           wrote the right one. `card.route` is the chapter's clean path
           (`/services`), so letting this write as well appends the fragment it
           falls back to and the URL ends up `/services#services`.

           This was invisible before the chapters had routes: `card.route` was
           then `/#services`, so the fragment this pushed was the one already in
           the URL and the write was a no-op. It is a real double-write now. */
        scrollToHash(card.hash, { immediate: true, updateUrl: false });
      } else {
        // No fragment: start at the top. Setting it here rather than trusting
        // the router's own restoration keeps Lenis's bookkeeping and the real
        // scroll position in agreement — and it happens while covered, so there
        // is nothing to see either way.
        smoothScrollTo(0, { immediate: true });
      }
    } else if (card.hash) {
      // One instant set of the scroll position, with the pinned sections
      // resolving to their new state on the next tick.
      //
      // `urlPath` is the chapter's clean URL — `/services`, not `#services`.
      // Nothing navigates on an in-page jump, so this is the only thing that
      // moves the address bar; without it the URL would still say `/` after
      // travelling five screens. See lib/sections.ts.
      scrollToHash(card.hash, { immediate: true, urlPath: card.urlPath });
    }

    // Give the destination a moment to actually be the destination. For a route
    // change that means the whole new page; for a jump, just the section.
    const scope = card.hash
      ? document.getElementById(card.hash.slice(1))
      : document.body;
    if (scope) {
      await whenMediaSettles(
        scope,
        card.route ? ROUTE_MEDIA_WAIT_CAP_MS : MEDIA_WAIT_CAP_MS
      );
    }
    if (requestId.current !== id) return;

    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setCard(null);
    }, HOLD_MS);
  }, [card, router]);

  /** Fired when the panel has finished leaving. */
  const onRevealed = useCallback(() => {
    setCovered(false);
    setSmoothScrollPaused(false);
  }, []);

  return (
    <AnimatePresence onExitComplete={onRevealed}>
      {card && (
        <motion.div
          aria-hidden
          /* `overflow-hidden` because the panel is translated a full viewport
             out of frame in both directions; without it the page briefly gains
             something to scroll sideways to, which is the exact bug this whole
             change is here to remove. */
          className="pointer-events-auto fixed inset-0 z-70 flex items-center justify-center overflow-hidden bg-paper"
          initial={{ y: card.direction > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: card.direction > 0 ? "-100%" : "100%" }}
          transition={{
            duration: covered ? REVEAL_S : COVER_S,
            ease: EASE,
          }}
          onAnimationComplete={(definition) => {
            // framer reports the variant it finished; only the arrival counts.
            // (The exit is reported through AnimatePresence instead.)
            if (
              !covered &&
              typeof definition === "object" &&
              definition !== null &&
              (definition as { y?: string }).y === "0%"
            ) {
              onCovered();
            }
          }}
        >
          {/* The card. Set in the site's section grammar — gold index, gold
              rule, title in the serif — so arriving somewhere looks like
              turning to a numbered chapter of one document. */}
          <motion.div
            className="flex flex-col items-center gap-6 px-8 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
          >
            <span className="inline-flex opacity-90">
              <Mark size={44} />
            </span>

            {/* The index between two gold hairlines — the centred variant of
                the rule that opens every section on the site. */}
            <span className="flex items-center gap-4">
              <span aria-hidden className="block h-px w-12 bg-gold/80" />
              {card.index && (
                <span className="font-label text-gold-ink">{card.index}</span>
              )}
              <span aria-hidden className="block h-px w-12 bg-gold/80" />
            </span>

            {card.label && (
              /* ── The wordmark is set in the wordmark's face ──────────────
                 Every other destination this card names is a chapter, and
                 chapter titles are the serif. The studio's own name is not a
                 chapter: it is set in the display face in the masthead and on
                 the intro screen, and showing it in the serif here made the
                 one string a visitor knows best look like it came off another
                 site. `font-semibold` and the tracking are the masthead's, so
                 the name a visitor clicked and the name they land on are the
                 same drawing at two sizes. See `wordmark` in
                 lib/sectionNavigation.ts. */
              <span
                className={cn(
                  "leading-[1.05] text-emerald",
                  card.wordmark
                    ? "font-display text-[2.2rem] font-semibold tracking-[0.015em] sm:text-5xl lg:text-6xl"
                    : "font-serif text-[2.6rem] tracking-tight sm:text-6xl lg:text-7xl"
                )}
              >
                {card.label}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
