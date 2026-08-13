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
 * Resolve once the images inside `root` have loaded, or once the cap expires —
 * whichever comes first.
 *
 * Only the first handful are waited on. A pinned gallery can hold nine
 * photographs, and the ones far along a horizontal track are not on screen when
 * the card lifts; waiting for those would spend the whole budget on imagery
 * nobody is looking at yet.
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
 */
const ROUTE_WAIT_CAP_MS = 1400;

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

function whenMediaSettles(root: HTMLElement): Promise<void> {
  const pending = Array.from(root.querySelectorAll("img")).filter(
    (img) => !img.complete
  );
  if (pending.length === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let outstanding = Math.min(pending.length, 4);
    const cap = window.setTimeout(resolve, MEDIA_WAIT_CAP_MS);
    const settle = () => {
      if (--outstanding > 0) return;
      clearTimeout(cap);
      resolve();
    };
    for (const img of pending.slice(0, 4)) {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", settle, { once: true });
    }
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
      await waitFor(() => livePathname.current === path, ROUTE_WAIT_CAP_MS);
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
        scrollToHash(card.hash, { immediate: true });
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
      scrollToHash(card.hash, { immediate: true });
    }

    // Give the destination a moment to actually be the destination. For a route
    // change that means the whole new page; for a jump, just the section.
    const scope = card.hash
      ? document.getElementById(card.hash.slice(1))
      : document.body;
    if (scope) await whenMediaSettles(scope);
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
          className="surface-sage pointer-events-auto fixed inset-0 z-70 flex items-center justify-center overflow-hidden"
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
              <span className="font-serif text-[2.6rem] leading-[1.05] tracking-tight text-emerald sm:text-6xl lg:text-7xl">
                {card.label}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
