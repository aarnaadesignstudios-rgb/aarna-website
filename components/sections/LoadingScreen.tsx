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
 *         mark fades up above it
 *   0.28  a gold RULE draws outward from the centre — the hairline that opens
 *         every section on this site
 *   0.42  the NAME is drawn up out of that rule, letter by letter, from behind
 *         a clipped edge; the COUNTER starts running
 *   1.34  a HELD BEAT — the finished composition simply sits there
 *   1.90  the LOCKUP lifts away, clearing the frame
 *   2.05  the WINDOW OPENS to full-bleed, the veil lifts, the counter reads 100
 *   2.95  done — within the 2.9 seconds the two-fade version took
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
 */
import { useState, useRef } from "react";
import Image from "next/image";

import { useIsomorphicLayoutEffect } from "@/hooks";
import { HERO_SLIDES, INTRO, SITE } from "@/constants";
import {
  FRAME_OPENING_POSE,
  FRAME_SIZES,
  FRAME_ZOOM_CLASS,
} from "@/components/ui/ImageCycle";
import Media from "@/components/ui/Media";
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
 * The name, one character at a time, so each can be drawn up separately.
 *
 * Split from `SITE.name` rather than hard-coded — the studio's name lives in
 * exactly one place on this site and this is not a second one.
 */
const NAME_CHARS = Array.from(SITE.name);

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
 * from /photography. That is 2.9 seconds of brand screen, with the page frozen
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
export default function LoadingScreen() {
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
          .set("[data-char]", { yPercent: 0, y: 0 })
          .set("[data-rule]", { scaleX: 1 })
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
        // ── The mark settles ──────────────────────────────────────────
        .fromTo(
          "[data-mark]",
          { opacity: 0, scale: 0.94, y: 14 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
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
        // ── The letters are drawn up out of it ────────────────────────
        // A per-character stagger, but a SHORT one: 16ms across twenty-one
        // letters is 0.32s from first to last, so the name reads as one word
        // arriving with a slight lead rather than as a row of letters taking
        // turns. Anything slower turns the studio's name into a ticker — and
        // pushes the last letter into the beat that follows.
        // `y: 0` in BOTH states is load-bearing, not tidiness. GSAP keeps the
        // pixel and percentage parts of a translate as separate components and
        // composes them, so the `translate-y-[115%]` that the markup carries to
        // avoid a first-paint flash was read as a 39px offset and then had
        // another 115% added on top of it. The letters animated from 230% to
        // 115% and finished exactly one line-height BELOW the clip edge —
        // invisible, and invisible in a way that looks like a design decision
        // rather than a bug. Zeroing the pixel part makes the transform mean
        // only what these two states say.
        .fromTo(
          "[data-char]",
          { yPercent: 115, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: 0.6,
            ease: EASE_EDITORIAL,
            stagger: 0.016,
          },
          cue.name
        )
        // ── The lockup leads the panel out ────────────────────────────
        // It starts lifting 150ms before the panel does and travels a fraction
        // of the distance, so for the length of the wipe there are two layers
        // moving at different speeds. That difference is the whole effect: it
        // makes the panel read as a sheet being drawn off the lockup, rather
        // than as one flat rectangle sliding away with a logo printed on it.
        .to(
          "[data-lockup]",
          { y: -26, opacity: 0.85, duration: 0.55, ease: "power2.in" },
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

  const frame = HERO_SLIDES[0];

  return (
    <div
      ref={rootRef}
      aria-hidden
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
      {/* ── The window ──────────────────────────────────────────────────────
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
          <Media
            src={frame?.image ?? ""}
            alt=""
            priority
            sizes={FRAME_SIZES}
            objectPosition={frame?.position}
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
          className="relative aspect-square w-[clamp(52px,8vw,72px)]"
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
            The name, split into per-character spans inside a clipped box, so
            the letters can be drawn up from below its bottom edge — and, under
            it, the rule they rise out of.

            Splitting the text is invisible to assistive tech: the whole screen
            is `aria-hidden`, because it is a title card and the name it states
            is already the <h1> of the page underneath. */}
        <div className="relative mt-7">
          {/* `pb` is the descender's rent. The clip edge has to sit BELOW the
              baseline or the "g" in Design loses its tail once the letters have
              landed — and it is the same edge the letters emerge from, so it
              cannot simply be pushed miles down either. */}
          <span
            data-name
            className={`${NAME_TYPE} block overflow-hidden pb-[0.16em]`}
          >
            {NAME_CHARS.map((char, i) => (
              <span
                key={`${char}-${i}`}
                data-char
                /* `translate-y-[115%]` is the pre-JS state, so the letters are
                   already below the clip edge on the very first painted frame
                   rather than appearing in place and then dropping. GSAP
                   overwrites the transform from there. */
                className="inline-block translate-y-[115%]"
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
