"use client";

/**
 * intro — has the opening screen already played in this page load?
 *
 * <LoadingScreen /> is mounted by the home page, so it used to replay in full
 * every time a visitor came BACK to `/` from /faq or /photography: 2.9 seconds
 * of brand panel, with the page frozen behind it, as the answer to clicking a
 * nav link. Now it plays once per load and steps aside afterwards.
 *
 * That decision cannot live inside the component, because it is not the only
 * thing timed to it. The masthead waits for the intro before sliding in, the
 * hero's scroll cue waits for it to clear, and the hero's image cycle starts on
 * its held beat. If the screen is skipped and those delays are not, a returning
 * visitor gets a page with no navigation on it for the first 1.7 seconds — a
 * worse bug than the one being fixed, and a less obvious one.
 *
 * So the flag is shared, and everything that waits reads its delay through
 * `introDelay()` instead of dividing `INTRO` by a thousand itself.
 *
 * ── Why a module variable is the right scope ─────────────────────────────
 *
 * It survives client-side navigation, because the module stays loaded, and it
 * resets on a genuine page load — which is exactly when an introduction is an
 * introduction. Nothing needs to be persisted, and nothing needs to be
 * synchronised: an intro that replays after a hard refresh is correct.
 *
 * The value is only ever WRITTEN in the browser, so the statically prerendered
 * HTML always describes the first-visit case.
 */
let played = false;

/**
 * Who wants to know the moment the intro is over.
 *
 * <Hero /> does, and for a reason that only shows up once the loader started
 * opening a window onto the hero's own first frame: the hero must hold that
 * frame perfectly still until the handover, and the handover is NOT at a fixed
 * time — the loader waits for the photograph, up to `INTRO.revealWaitCapMs`. A
 * hero timed off the clock instead of off this signal begins its slow zoom while
 * the loader is still waiting, and the two copies of the same picture drift
 * apart by a few percent — which is visible, at the exact moment the site is
 * introducing itself, as a jump.
 */
const listeners = new Set<() => void>();

export function introHasPlayed() {
  return played;
}

/**
 * Subscribe to "the intro is finished".
 *
 * Fires once, and only for the load that actually played an intro; a subscriber
 * that arrives late should check `introHasPlayed()` first.
 */
export function onIntroCleared(fn: () => void) {
  listeners.add(fn);
  // Returns void, not the Set's boolean, so it can be a React effect cleanup.
  return () => {
    listeners.delete(fn);
  };
}

/** Called by <LoadingScreen /> when the timeline actually finishes. */
export function markIntroPlayed() {
  played = true;
  for (const fn of listeners) fn();
  listeners.clear();
}

/**
 * Seconds to wait for the intro before starting — 0 once it has played.
 *
 * Takes milliseconds because that is the unit `INTRO` exposes, and returns
 * seconds because that is what framer and GSAP want.
 */
export function introDelay(ms: number) {
  return played ? 0 : ms / 1000;
}
