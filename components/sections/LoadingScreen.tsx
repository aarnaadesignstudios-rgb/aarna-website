"use client";

/**
 * LoadingScreen — the work in a frame, and then the frame opens.
 *
 *                     [ mark ]
 *                 ┌─────────────┐
 *                 │             │
 *                 │   AWC.jpg   │  ← the hero's OWN first frame,
 *                 │             │    clipped to a portrait window
 *                 └─────────────┘
 *          A a r n a a   D e s i g n   S t u d i o s
 *          ───────────────────────────────────────────
 *                                                  73  ← counter
 *
 * ── The idea ──────────────────────────────────────────────────────────────
 *
 * The window holds the studio's first hero photograph, and at the end it opens
 * to full-bleed instead of the panel dissolving away. Because what is inside it
 * is the hero's own opening frame — same source, same `sizes`, same portrait
 * zoom, same pose, verified as the same optimized URL and the same on-screen
 * rect — the loader does not get out of the page's way. It becomes the page: at
 * the last frame there is nothing left to hand over, and dropping the panel
 * changes nothing on screen.
 *
 * The counter reports on that photograph. It runs to 99 on the clock and stops
 * there until the image has actually arrived, then reads 100 as the window
 * opens (capped — see `REVEAL_WAIT_CAP_S`). A loader whose number is not
 * measuring anything is a progress bar drawn from memory.
 *
 * ── What this replaces ────────────────────────────────────────────────────
 *
 * The FIRST version was a set-piece: the phoenix separated from the "A" under a
 * gold bloom, beat its wings, arced out of frame, tore the emerald curtain away
 * along its flight path, and the letterform flew back to land in the masthead
 * via a FLIP. Roughly 250 lines of choreography and just under five seconds of
 * the visitor's time. The client's verdict was "this animation is very bad".
 *
 * The SECOND over-corrected: two fades and a dissolve. Nothing to dislike, and
 * nothing to notice either — a studio whose whole pitch is considered craft,
 * opening on a screen that could belong to anyone.
 *
 * This one still has nothing that separates, flies, bounces or tears. Five
 * beats, each ONE gesture:
 *
 *   0.00  the WINDOW unfolds from a hairline into the portrait frame, and the
 *         mark pulls into focus above it
 *   0.28  a gold RULE draws outward from the centre — the hairline that opens
 *         every section on this site
 *   0.42  the NAME RESOLVES — its letters start spread wide and airy and close
 *         to their set tracking as the line comes out of a soft blur; the
 *         COUNTER starts running
 *   1.37  a HELD BEAT — the finished composition simply sits there
 *   1.75  the LOCKUP RECEDES where it stands — the rule un-draws, the mark and
 *         the name settle back and soften out
 *   2.05  the WINDOW OPENS to full-bleed, the veil lifts, the counter reads 100
 *   2.95  done — within the 2.9 seconds the two-fade version took
 *
 * ── One gesture, running in two places ────────────────────────────────────
 *
 * The whole panel resolves INWARD. The window contracts from the viewport to a
 * hairline before it opens; the letters contract from a wide spread to their
 * set tracking; the mark contracts from 1.06 to 1. Three different elements
 * doing one thing, which is what lets five beats read as a single idea rather
 * than as a list — and it inverts cleanly at the end, when the window expands
 * back out to full bleed and the lockup softens away.
 *
 * The letters move on per-character `x`, not on `letter-spacing`. Visually they
 * are the same gesture; the difference is that tracking is a LAYOUT property
 * and this runs while the browser is still decoding the page behind it. Twenty
 * one transforms on the compositor cost nothing; twenty one reflows a frame do
 * not.
 *
 * The beats CHAIN rather than overlap, and the cue sheet in `INTRO`
 * (constants/site.ts) records each one's end time to keep it that way. It lives
 * there because the hero and the navbar hand off from the same numbers.
 *
 * Everything animated here is a transform, an opacity or a clip — no layout —
 * because this runs while the browser is still decoding the page behind it. The
 * one measured value, where the window sits, is read from a real laid-out slot
 * and re-read when the font swaps or the window resizes.
 *
 * The name is set as a single line — "Aarnaa Design Studios" — in the display
 * serif. It was previously "Aarnaa" stacked over a letter-spaced "DESIGN
 * STUDIOS", which the client flagged twice: wrong font, and the name is to
 * read on one line. Verified as one line from 360px to 1920px.
 *
 * ── Nothing here flies into the masthead any more ─────────────────────────
 *
 * It used to. A cross-tree FLIP measured the navbar's `[data-brand-mark]` and
 * `[data-brand-name]` and tweened this panel's copies onto them, so that the
 * first thing on screen became the thing in the corner. It was the right idea
 * and it never worked, for a reason that no amount of tuning could reach: the
 * masthead is ITSELF arriving during those same 900ms. Measured at 1440x900,
 * the navbar mark's centre travelled from y26 to y54 between 2.4s and 2.8s, so
 * the rect the FLIP read when it built the tween was stale before the tween
 * started and kept moving after. The panel unmounted with the wordmark 115px
 * short of its slot and the mark 21% oversized and 24px off to the side — the
 * studio's name stranded across the photograph, then gone.
 *
 * A moving target cannot be hit by a measurement taken once, and re-measuring
 * every frame would only make the brand chase a bar that is still settling. So
 * the lockup does not travel: it recedes where it stands, and the masthead
 * raises its own brand behind this panel while the panel is still covering it
 * (see `brandReady` in components/layout/Navbar.tsx). The handover is in TIME
 * rather than in space, and there is no rect either side has to agree on.
 */
import { useState, useRef } from "react";
import Image from "next/image";

import { useIsomorphicLayoutEffect } from "@/hooks";
import { HERO_SLIDES, INTRO, SITE } from "@/constants";
import type { HeroSlide } from "@/types";
import {
  FRAME_OPENING_POSE,
  FRAME_SIZES,
  FRAME_ZOOM_CLASS,
} from "@/components/ui/ImageCycle";
import Media from "@/components/ui/Media";
import SheetTexture from "@/components/ui/SheetTexture";
import { EASE_EDITORIAL, gsap } from "@/lib/gsap";
import { introHasPlayed, markIntroPlayed } from "@/lib/intro";
import { cn } from "@/utils/cn";

const { cue } = INTRO;

/**
 * The wordmark's type.
 *
 * `whitespace-nowrap` plus a viewport-relative size is what keeps the name on
 * ONE line at every width: it scales down on a narrow phone rather than
 * wrapping, which the client asked for twice. Verified from 360px to 1920px.
 */
const NAME_TYPE =
  "whitespace-nowrap text-center font-display text-[clamp(1.05rem,4.6vw,2.1rem)] leading-none tracking-[0.02em] text-emerald";

/**
 * The name, one character at a time, so each can be moved separately.
 *
 * Split from `SITE.name` rather than hard-coded — the studio's name lives in
 * exactly one place on this site and this is not a second one.
 */
const NAME_CHARS = Array.from(SITE.name);

/**
 * How far each letter starts from where it belongs, in ems of the wordmark's
 * own size.
 *
 * In EMS rather than pixels because the wordmark is set in `vw` — the name is
 * 372px wide on a laptop and 198px on a 390px phone, and a fixed offset that
 * reads as an airy opening on the first is a shattered word on the second. One
 * ratio gives the same gesture at every width by construction.
 *
 * 0.26 is the largest value that still fits. The line grows by
 * `spread x (chars - 1)` at its widest — 0.26em x 20 x 17.9px = 93px of extra
 * width inside the 342px a 390px phone leaves after the lockup's `px-6`, on a
 * name that measures 198px. Wider than this and the outer letters of "Aarnaa"
 * and "Studios" start the beat off the edge of a phone screen, which reads as
 * a clipping bug rather than as tracking.
 */
const NAME_SPREAD_EM = 0.26;

/**
 * Where character `i` starts: symmetric about the middle of the word, so the
 * line opens and closes around its own centre and never shifts off the
 * composition's axis while it does.
 *
 * The font size is read off the TARGET rather than computed, because
 * `clamp(1.05rem, 4.6vw, 2.1rem)` has three regimes and the browser has
 * already resolved which one applies.
 */
const charSpread = (i: number, target: Element) => {
  const size = parseFloat(getComputedStyle(target).fontSize) || 16;
  return (i - (NAME_CHARS.length - 1) / 2) * size * NAME_SPREAD_EM;
};

/**
 * A blur that scales with the thing it softens.
 *
 * For the same reason the spread is in ems, and it took a screenshot to see it:
 * a FIXED blur is a different effect at every viewport. `blur(6px)` on the
 * 33.6px wordmark a laptop resolves is the soft ghost this beat wants; the same
 * 6px on the 17.9px a 390px phone resolves is a third of the cap height and the
 * name spends its whole entrance as an unreadable smear. Measured at 390x844,
 * the name was not legible at all until the blur was nearly gone.
 *
 * So the softness is a RATIO of the element's own size. The two callers measure
 * different things because they are different kinds of object: type is sized by
 * `font-size`, and the emblem is a box whose width is the only thing that says
 * how big it is.
 */
const softness =
  (ratio: number, basis: "font" | "width") =>
  (_i: number, target: Element) => {
    const px =
      basis === "font"
        ? parseFloat(getComputedStyle(target).fontSize) || 16
        : (target as HTMLElement).offsetWidth || 64;
    return `blur(${(px * ratio).toFixed(2)}px)`;
  };

/**
 * The longest the reveal will wait for the hero photograph, in seconds.
 *
 * The gate exists because the window opens ONTO that image — if it has not
 * decoded, the reveal lands on a grey rectangle, which is the one failure this
 * design cannot absorb. The cap exists because a visitor on a bad connection
 * must never be held on a brand screen indefinitely; past this the reveal
 * happens anyway and the photograph arrives when it arrives, which is no worse
 * than any other page on the web.
 *
 * The value lives in `INTRO` because <Hero /> needs it as well.
 */
const REVEAL_WAIT_CAP_S = INTRO.revealWaitCapMs / 1000;

/**
 * ── Once per load, not once per visit to the home page ────────────────────
 *
 * This component is mounted by app/page.tsx, so it used to replay in full every
 * time someone came back to `/` — clicking the wordmark from /faq, or "About"
 * from /about. That is 2.9 seconds of brand screen, with the page frozen
 * behind it, in the middle of a session, as the answer to a navigation.
 *
 * It became visible when navigation started being carried by a chapter card
 * (see lib/sectionNavigation.ts): returning to a home SECTION played the card,
 * revealed the intro underneath it, and only landed on the section three seconds
 * later — two brand panels in a row for one click.
 *
 * The flag lives in lib/intro.ts because the masthead and the hero are timed to
 * this screen too; see the note there. It is set when the timeline COMPLETES
 * rather than when it starts, so navigating away mid-intro does not cost the
 * next visitor their first impression.
 */
/**
 * The intro shows the hero's FIRST frame inside a window and opens that window
 * to full bleed, so this has to be handed the same list the hero is handed.
 * Letting it keep reading the constants while the hero read the CMS would put
 * a different photograph on each side of the handover — the one moment on the
 * site where two images are guaranteed to be compared directly.
 */
interface LoadingScreenProps {
  slides?: HeroSlide[];
}

export default function LoadingScreen({ slides = HERO_SLIDES }: LoadingScreenProps) {
  const [visible, setVisible] = useState(!introHasPlayed());
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";

    const finish = () => {
      markIntroPlayed();
      document.body.style.overflow = "";
      setVisible(false);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * ── The window's geometry, measured rather than computed ──────────────
     *
     * The empty slot in the lockup already occupies exactly the box the frame
     * should fill, positioned by flexbox as part of the whole centred
     * composition. Reading it means the clip agrees with the layout by
     * construction — including on a short viewport, where the stack's own
     * centring is doing work no formula here would know about.
     *
     * Insets are in PIXELS. A percentage inset cannot hold a shape: the two
     * axes resolve against different lengths, so `inset(20% 36%)` is a portrait
     * frame on a laptop and a vertical slit on a phone.
     */
    const windowEl = root.querySelector<HTMLElement>("[data-window]");
    const counter = root.querySelector<HTMLElement>("[data-counter]");
    const slot = root.querySelector<HTMLElement>("[data-window-slot]");

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let inset = { top: 0, right: 0, bottom: 0, left: 0 };
    /** The frame's vertical centre — where the closed hairline lives. */
    let midY = vh / 2;

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const box = slot?.getBoundingClientRect();
      inset = {
        top: box?.top ?? vh * 0.2,
        right: vw - (box?.right ?? vw * 0.8),
        bottom: vh - (box?.bottom ?? vh * 0.8),
        left: box?.left ?? vw * 0.2,
      };
      midY = (inset.top + (vh - inset.bottom)) / 2;
    };

    /**
     * One parameter drives the whole reveal, in two stages:
     *
     *   p 0 → 0.4   a centred HAIRLINE opens into the portrait frame
     *   p 0.4 → 1   the frame opens to FULL-BLEED, corners squaring off
     *
     * Two tweens, one geometry function, so the closed line, the frame and the
     * full screen can never drift out of agreement.
     */
    const openState = { p: 0 };
    const countState = { v: 0 };

    const applyWindow = (p: number) => {
      if (!windowEl) return;
      const toFrame = Math.min(1, p / 0.4);
      const toFull = Math.max(0, (p - 0.4) / 0.6);
      // Vertical: a 1px line on the frame's centre line, out to the frame's own
      // edges, then out to the viewport's.
      const top = (inset.top + (midY - 1 - inset.top) * (1 - toFrame)) * (1 - toFull);
      const bottom =
        (inset.bottom + (vh - midY - 1 - inset.bottom) * (1 - toFrame)) * (1 - toFull);
      // Horizontal: the frame's width from the start — the line is already as
      // wide as the frame it opens into, so the gesture reads as one unfolding
      // rather than a box growing in both axes at once.
      const left = inset.left * (1 - toFull);
      const right = inset.right * (1 - toFull);
      const radius = 18 * (1 - toFull);
      windowEl.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
    };

    /**
     * Re-measure, then redraw at whatever point the reveal is currently at.
     *
     * Needed twice over. The wordmark is a WEB FONT, so the lockup's height —
     * and therefore where flexbox centres the slot — changes the moment Bodoni
     * swaps in for the fallback; measured once on mount, the frame ended up a
     * few pixels off its slot on some viewports. And a window can be resized
     * during the three seconds this is on screen.
     */
    const remeasure = () => {
      measure();
      applyWindow(openState.p);
    };

    remeasure();
    window.addEventListener("resize", remeasure);
    // `document.fonts.ready` is the honest signal for "the metrics are final".
    void document.fonts?.ready.then(remeasure);

    const ctx = gsap.context(() => {
      // Reduced motion: state the brand, then get out of the way. Everything
      // that starts hidden has to be explicitly placed, or the letters simply
      // never arrive.
      if (reduced) {
        applyWindow(0.4);
        if (counter) counter.textContent = "100";
        gsap
          .timeline({ onComplete: finish })
          .set("[data-char]", { x: 0 })
          .set(["[data-mark]", "[data-name]"], {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          })
          .set("[data-rule]", { scaleX: 1, opacity: 1 })
          .set("[data-lockup]", { opacity: 1 })
          .to(root, { opacity: 0, duration: 0.4 }, "+=0.9");
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });

      tl
        // ── The window unfolds from a hairline ────────────────────────
        .to(
          openState,
          {
            p: 0.4,
            duration: 0.9,
            ease: EASE_EDITORIAL,
            onUpdate: () => applyWindow(openState.p),
          },
          cue.settle
        )
        // ── The counter runs ─────────────────────────────────────────
        // To 99, not 100: the last point belongs to the gate below, which is
        // waiting on the photograph. A counter that reaches 100 and then sits
        // there is the tell of a fake one.
        .to(
          countState,
          {
            v: 99,
            duration: cue.dissolve - cue.name,
            ease: "power1.out",
            onUpdate: () => {
              if (counter) {
                counter.textContent = String(Math.round(countState.v)).padStart(
                  2,
                  "0"
                );
              }
            },
          },
          cue.name
        )
        // ── The mark pulls into focus ─────────────────────────────────
        // DOWN from 1.06, not up from 0.94. Everything in this panel resolves
        // inward — the window contracts to its frame, the letters close to
        // their tracking — and an emblem swelling into place would be the one
        // element pushing the other way. Softened to start, so it arrives the
        // way the photograph behind it does: out of focus, then not.
        .fromTo(
          "[data-mark]",
          { opacity: 0, scale: 1.06, filter: softness(0.07, "width") },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: EASE_EDITORIAL,
          },
          cue.settle
        )
        // ── The rule draws outward from the centre ────────────────────
        // `origin-center` + scaleX is one compositor property, and it grows in
        // both directions at once, which is what makes it read as a line being
        // ruled rather than as a bar sliding in from one side.
        .fromTo(
          "[data-rule]",
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.65, ease: EASE_EDITORIAL },
          cue.rule
        )
        // ── The name resolves ─────────────────────────────────────────
        //
        // The letters begin spread wide and airy, well outside the tracking
        // the wordmark is actually set in, and CLOSE into place while the
        // whole line pulls out of a soft blur. It is the couture-house
        // gesture, and it is here for two reasons beyond looking expensive.
        //
        // It is the same move as everything else on this screen — the window
        // contracting to its frame, the mark contracting to 1 — so five beats
        // read as one idea. And it makes the studio's NAME the thing that
        // moves, which is the only element on the panel worth spending a
        // visitor's attention on.
        //
        // `x` per character rather than `letter-spacing` on the line. The two
        // are visually identical and only one of them is free: tracking is a
        // layout property, and this is running while the browser is still
        // decoding the page underneath. Twenty-one transforms go to the
        // compositor; twenty-one reflows a frame do not.
        //
        // Staggered `from: "center"`, so the word settles from the middle
        // outwards — the two ends land last and together, which is what keeps
        // it reading as one word breathing in rather than as a row of letters
        // taking turns. 10ms across ten steps out from the centre is 0.1s from
        // first to last: a lead, not a ticker.
        .fromTo(
          "[data-char]",
          { x: (i: number, t: Element) => charSpread(i, t) },
          {
            x: 0,
            duration: 0.85,
            ease: EASE_EDITORIAL,
            stagger: { each: 0.01, from: "center" },
          },
          cue.name
        )
        // The line comes into focus as one object, not per letter. A blur on
        // each of twenty-one spans would be twenty-one filter surfaces on a
        // phone, for an effect that is indistinguishable from one on the line.
        .fromTo(
          "[data-name]",
          { opacity: 0, filter: softness(0.18, "font") },
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: EASE_EDITORIAL,
          },
          cue.name
        )
        // ── The lockup recedes ────────────────────────────────────────
        //
        // Where it stands. It used to FLY into the masthead, and the note at
        // the top of this file records why that could never land: the navbar
        // is still arriving during exactly these milliseconds, so the rect the
        // FLIP measured was stale before the tween began. The brand reaches
        // the corner by being raised there behind this panel instead.
        //
        // So the exit is the entrance run backwards and quicker — settling
        // back a hair, softening out. Nothing travels, nothing has to agree
        // with anything outside this component, and there is no position at
        // which it can be caught looking wrong.
        // Two tweens at the same beat rather than one over both, only because
        // `softness` reads the emblem's width and the wordmark's font size —
        // see the note there. They are otherwise identical and land together.
        .to(
          "[data-mark]",
          {
            opacity: 0,
            scale: 0.985,
            filter: softness(0.055, "width"),
            duration: 0.45,
            ease: "power2.in",
          },
          cue.lift
        )
        .to(
          "[data-name]",
          {
            opacity: 0,
            scale: 0.985,
            filter: softness(0.12, "font"),
            duration: 0.45,
            ease: "power2.in",
          },
          cue.lift
        )
        // The rule un-draws into the centre it was ruled out of — the one
        // gesture on this screen that is exactly reversible, so it may as well
        // be reversed.
        .to(
          "[data-rule]",
          { scaleX: 0, opacity: 0, duration: 0.45, ease: EASE_EDITORIAL },
          cue.lift
        )
        // ── The window opens onto the page ────────────────────────────
        // The clip goes to `inset(0)`, so the photograph inside — which has not
        // moved or resized once — simply becomes the full screen. The panel is
        // never dissolved or slid away: by the last frame it IS the hero, and
        // dropping it changes nothing on screen.
        //
        // The veil goes with it, so the image reaches full strength at exactly
        // the moment it takes over.
        .to(
          openState,
          {
            p: 1,
            duration: INTRO.dissolveDuration,
            ease: "power3.inOut",
            onUpdate: () => applyWindow(openState.p),
          },
          cue.dissolve
        )
        .to(
          "[data-veil]",
          { opacity: 0, duration: INTRO.dissolveDuration * 0.8, ease: "none" },
          cue.dissolve
        )
        .to(
          "[data-counter]",
          { opacity: 0, duration: 0.3, ease: "none" },
          cue.dissolve + 0.15
        );

      // ── The gate ────────────────────────────────────────────────────
      // Hold at the reveal until the photograph we are about to open onto has
      // actually arrived. Without this the window opens onto whatever has
      // decoded so far, which on a cold connection is a grey rectangle — the one
      // failure this design cannot absorb, because the image IS the reveal.
      //
      // The pause and the release can happen in either order, so both sides
      // check the other's flag. Resuming is deferred a frame: calling `resume()`
      // from inside the pause callback re-enters the timeline mid-tick.
      let imageReady = false;
      let waiting = false;
      const release = () => {
        imageReady = true;
        if (waiting) requestAnimationFrame(() => tl.resume());
      };

      tl.addPause(cue.dissolve, () => {
        waiting = true;
        if (imageReady) requestAnimationFrame(() => tl.resume());
      });
      // 99 until the last asset lands, then 100. The counter is reporting on
      // something real; see the note in constants/site.ts.
      tl.set(counter, { textContent: "100" }, cue.dissolve);

      const img = root.querySelector("img[sizes]");
      if (!(img instanceof HTMLImageElement) || img.complete) {
        release();
      } else {
        img.addEventListener("load", release, { once: true });
        img.addEventListener("error", release, { once: true });
        // A cap, so a slow or failed image can never hold the site hostage.
        gsap.delayedCall(REVEAL_WAIT_CAP_S, release);
      }
    }, rootRef);

    return () => {
      window.removeEventListener("resize", remeasure);
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  const frame = slides[0] ?? HERO_SLIDES[0];

  return (
    <div
      ref={rootRef}
      aria-hidden
      /* The masthead looks for this to decide whether to wait for the brand to
         be flown in or just show its own — see components/layout/Navbar.tsx. */
      data-intro
      /* ── The intro is light too ──────────────────────────────────────────
         This was `surface-emerald`: the first thing anyone saw on the site was
         a near-black green screen for three seconds, which then handed over to
         a light page. Whatever the panel does after that, it had already told
         a visitor the site was dark.

         It is the same material at page value now — `surface-sage`, the brand
         emerald at 5% into cream — so the intro is the page's own paper with
         the photograph opening out of it. */
      className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-paper"
    >
      {/* ── The vine ──────────────────────────────────────────
          Every chapter of the site is drawn into from the margins — gold
          botanical line-work hanging off the page edges (<Ornament />, and
          <SheetTexture /> which places it). This screen had none of it: the
          first thing anyone saw of the studio was the one surface on the site
          with nothing drawn on it, which is why it read as a holding screen
          rather than as the cover of the document it opens.

          <SheetTexture /> itself, rather than two hand-placed <Ornament />s.
          That was the first attempt and it was measurably worse: the drawing's
          ink is not evenly distributed across its box, and the `top-left` /
          `bottom-right` pair I reached for first put almost all of it in the
          ~44% that bleeds off the page — what was left on screen measured as a
          few strokes in the top corner and read as dust. The `bottom-left` +
          `top-right` arrangement this component ships is the one that has been
          composed against a page edge, and both of its vines clear the
          centred lockup here (the photograph opens at x 534 at 1440 wide; the
          large vine reaches x 181).

          Using the component rather than its parts also means this screen is
          decorated by the same call every chapter of the site makes, which is
          the actual ask: not "put some vines on it" but "make it belong".

          ── The draw time is the load time, and that is the point ───────
          `.vine` draws itself on `stroke-dashoffset` over 2.6s (see
          styles/globals.css). The intro runs to about 2.95s — `CUE.dissolve`
          plus `DISSOLVE_DURATION` — so the vine finishes drawing just as the
          curtain begins to lift. Nothing coordinates the two; they are simply
          both the length of the same beat, and the effect is that the screen
          spends its wait drawing rather than sitting still.

          Desktop-only, which the component already handles: the vine is a
          MARGINAL flourish and a phone has no margin, so on a 390px screen the
          bleed would cross the photograph instead of the gutter. */}
      <SheetTexture />

      {/* ── The window ─────────────────────────────────────────
          A full-bleed copy of the hero's opening frame, clipped down to a
          portrait window in the middle of the screen. The IMAGE never moves or
          resizes; only the clip does. That is the whole trick: when the clip
          opens to `inset(0)` at the end, what is left on screen is not a
          picture that has grown into place, it is the hero — identical, to the
          pixel, to the frame already sitting underneath this panel. Verified:
          same optimized URL, same srcset, same pose, same rect.

          Where the window sits is not computed here, it is MEASURED: the empty
          slot in the lockup below reserves the space, layout centres it, and the
          clip is read off that slot's box. Percentages could not do this job —
          `inset(20% 36%)` is a portrait frame on a laptop and a vertical slit on
          a phone, because the two axes resolve against different lengths. */}
      <div
        data-window
        className={cn("absolute inset-0", FRAME_ZOOM_CLASS)}
        style={{ clipPath: "inset(50% 50% 50% 50% round 2px)" }}
      >
        <div className="absolute inset-0" style={{ transform: FRAME_OPENING_POSE }}>
          {/* Every prop here is the hero's, including the phone crop: this is a
              pixel-identical copy of the frame underneath, and the window opens
              onto it rather than dissolving away. A slide with a `mobileImage`
              would otherwise show its landscape original in the loader and its
              vertical one the instant the curtain lifted — a cut at the exact
              moment the site is introducing itself, and only on phones, which
              is where nobody would be looking for it. */}
          <Media
            src={frame?.image ?? ""}
            alt=""
            priority
            sizes={FRAME_SIZES}
            objectPosition={frame?.position}
            mobileSrc={frame?.mobileImage}
            mobileObjectPosition={frame?.mobilePosition}
          />
        </div>

        {/* A veil — tonal, not for legibility. It sits the photograph back into
            the panel while the panel is what you are looking at, and lifts as
            the window opens, so the image reaches full strength at the moment
            it takes over.

            It has to be the PANEL's value to do that, and the panel is light
            now: `bg-ink/35` darkened the photograph against a sage ground,
            which pushed it forward instead of settling it back — the exact
            opposite of the job. Paper at 45% recedes it the right way. */}
        <div data-veil className="absolute inset-0 bg-paper/45" />
      </div>

      {/* The counter. Bottom-right, in the site's label type, with the lining
          figures that recipe already carries — the same treatment as the
          "01 / 09" counters in the works gallery, so even this reads as part of
          the same document. */}
      <span
        data-counter
        className="font-label absolute right-5 bottom-5 z-10 text-gold-ink/80 sm:right-8 sm:bottom-8"
      >
        00
      </span>

      <div data-lockup className="relative z-10 flex flex-col items-center px-6">
        {/* The mark, above the frame. Smaller than it was when it was the only
            thing on this screen: the photograph is the subject now, and the
            emblem is the studio initialling it. */}
        <div
          data-mark
          className="relative aspect-square w-[clamp(52px,8vw,72px)] opacity-0"
        >
          <Image
            src="/images/aarnaa-mark.png"
            alt=""
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </div>

        {/* ── The frame's slot ───────────────────────────────────────────────
            Empty on purpose. It reserves the space the window occupies and lets
            flexbox centre the whole stack — mark, frame, wordmark — as one
            composition, at any viewport, with no arithmetic. The photograph is
            painted by the fixed layer above, clipped to this box.

            ── One dimension, three constraints ──────────────────────────
            The 4:5 portrait has to survive a tall phone and a short laptop
            alike, which means exactly ONE dimension may be set: give an aspect
            ratio both a width and a max-height and the ratio is what gives way.
            (Measured: `h-[min(52vh,470px)] max-w-[76vw]` came out at 0.68 on a
            390×844 phone instead of 0.8.)

            So the width carries all three limits — 76% of the viewport's width,
            41.6vh (which is 0.8 × the 52vh height budget), and a hard 376px —
            and the aspect ratio derives the height from whichever binds. */}
        <div
          data-window-slot
          className="mt-7 aspect-4/5 w-[min(76vw,41.6vh,376px)]"
        />

        {/* ── The wordmark ────────────────────────────────────────────────
            The name, split into per-character spans so each letter can be held
            out from where it belongs and then closed into place — and, under
            it, the rule the composition sits on.

            NOT clipped. The previous version drew the letters up from behind a
            bottom edge and needed `overflow-hidden` plus a `pb` of descender
            rent to do it. These letters travel SIDEWAYS and start outside the
            line's set width, so the same clip would shear the ends of the word
            off for the whole beat. Being `inline-block` transforms, they can
            render outside their parent's box for free — the box itself never
            moves, so the lockup's centring is unaffected.

            Splitting the text is invisible to assistive tech: the whole screen
            is `aria-hidden`, because it is a title card and the name it states
            is already the <h1> of the page underneath. */}
        <div className="relative mt-7">
          <span data-name className={`${NAME_TYPE} block pb-[0.16em] opacity-0`}>
            {NAME_CHARS.map((char, i) => (
              <span
                key={`${char}-${i}`}
                data-char
                /* No pre-JS transform here, deliberately. The line's own
                   `opacity-0` above is what prevents a first-paint flash, and
                   it covers every letter with one property instead of
                   twenty-one — which also keeps this markup clear of the
                   Tailwind v4 trap the old `translate-y-[115%]` fell into,
                   where a `translate` utility composes with GSAP's transform
                   instead of being replaced by it. GSAP owns `x` on these
                   spans and nothing else touches it. */
                className="inline-block"
              >
                {/* A non-breaking space keeps its width as an inline-block; a
                    plain one collapses and the words run together. */}
                {char === " " ? " " : char}
              </span>
            ))}
          </span>
        </div>

        {/* The hairline the name is drawn out of. `w-full` resolves to the
            widest thing in this centred column, which is now the FRAME — so the
            rule closes the composition under both the photograph and the name,
            at every viewport width, with no measurement. */}
        <span
          data-rule
          className="mt-3.5 block h-px w-full origin-center scale-x-0 bg-gold"
        />
      </div>
    </div>
  );
}
