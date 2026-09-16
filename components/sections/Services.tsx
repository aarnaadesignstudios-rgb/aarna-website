"use client";

/**
 * Services — the studio's disciplines, on a pinned horizontal scroll.
 *
 * ── The scroll ────────────────────────────────────────────────────────────
 *
 * The section pins and the track translates sideways as you scroll down,
 * driven by GSAP ScrollTrigger and synced to Lenis in SmoothScrollProvider.
 *
 * Two things this implementation does that a naive pin does not:
 *
 *  · `anticipatePin: 1`. Pinning a full-viewport section repaints a large
 *    area, and on a fast flick the browser's paint thread lands a frame late,
 *    which shows up as the section visibly jumping as it pins. Anticipating
 *    the pin slightly early absorbs that.
 *
 *  · It only pins at lg and up, through `gsap.matchMedia`. `pin: true` wraps
 *    the element in a pin-spacer that doubles its height in the document
 *    flow, and on mobile browsers — where the toolbar collapses and the
 *    viewport height changes mid-scroll — that spacer is a reliable source of
 *    jump. Below lg the section is a different thing entirely: a BENTO of
 *    tiles that turn over. See <BentoTile /> below.
 *
 * There are now two pinned horizontal sections on this page (the other is
 * <SelectedWorks />). They are sequential rather than nested, which is fine —
 * nested pins are the ones that break — but they are deliberately given
 * different rhythms so the page does not feel like it repeats itself: the
 * gallery runs wide, cinematic panels, this runs a tighter card track with a
 * numbered progress readout.
 *
 * ── The interaction ───────────────────────────────────────────────────────
 *
 * Clicking a discipline's NAME reveals its description (client request). Not
 * hover: hover makes it always-on for anyone with a mouse and does not exist
 * at all on a phone. Only one is open at a time so the track keeps its rhythm,
 * and the panel animates `grid-template-rows` so it opens to the copy's real
 * height rather than to a guessed max-height.
 *
 * Below `lg` the same request is answered by a tile that TURNS OVER rather
 * than an accordion that pushes the grid around. `openId` is shared, so the
 * two layouts are the same state read two ways.
 *
 * Two cards carry a link at the foot of their copy rather than only a
 * description: Architectural Photography sends you to Postcard of Life, and
 * Design Consultation opens WhatsApp with the booking message already typed.
 * Both are off-site, so both open in a new tab — see `linkOut` below.
 *
 * Design Consultation also carries a `price`, the only figure on the track.
 * It is drawn between the body and the link on both layouts, because a fee is
 * the thing a visitor scans for and the last thing they should have to find
 * inside a paragraph.
 */
import { useRef, useState } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReveal } from "@/hooks";
import {
  Media,
  PageContainer,
  SectionHeading,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { SERVICES } from "@/constants";
import type { Service } from "@/types";
import { cn } from "@/utils/cn";

/**
 * ── One discipline, as a bento tile that turns ────────────────────────────
 *
 * Below `lg` only. The desktop track is a pinned horizontal run of five tall
 * cards that expand downward into an accordion; neither half of that survives
 * the trip to a phone. There is no pin, so there is no horizontal run — the
 * cards became a vertical stack, one full-width 4:5 photograph per row, five
 * rows deep. Measured at 390×844 that is about 2,500px of section for five
 * sentences of copy, with one image on screen at a time and nothing to compare
 * it against. It was the longest thing on the site.
 *
 * A bento is the answer to the length: a two-up grid brings the same
 * disciplines to about a thousand pixels instead of two and a half thousand,
 * and a tile that is wider than its neighbours — when the count leaves room
 * for one, see `wideIndex` below — gives the block a composition instead of a
 * queue.
 *
 * ── Why it turns rather than expands ─────────────────────────────────────
 *
 * The desktop card opens an accordion beneath the name. In a grid that is the
 * wrong gesture: opening one tile either pushes every tile below it down — so
 * the thing you tapped jumps away from your thumb — or it has to reflow the
 * grid, which moves tiles you did not touch. A tile that turns over changes
 * nothing outside its own footprint, so the grid is exactly as still after a
 * tap as before it.
 *
 * Only one is open at a time all the same: `openId` is a single id shared with
 * the desktop accordion, so the two layouts are one piece of state read two
 * ways rather than two implementations of the same idea that can disagree.
 *
 * ── The two faces, and where the taps actually go ────────────────────────
 *
 * `<button>` is the OUTER element, so the whole tile is one control and there
 * are no nested interactive elements inside it. The 3D lives entirely within
 * the button, which matters for more than tidiness: Chrome hit-tests inside a
 * `transform-style: preserve-3d` context differently from how it paints it
 * (see the note on the flat click target in components/sections/SelectedWorks.tsx),
 * and a tap that lands on the button never goes near that test.
 *
 * The one discipline with a link is the exception, and it is handled the same
 * way the ring is: the link is DRAWN on the back face, where it belongs
 * visually, and a real anchor is laid over that spot as a flat sibling of the
 * button. See `link` below.
 */
/**
 * A destination that is not ours opens in a new tab.
 *
 * <SmoothLink /> already routes an off-site href to a plain anchor rather than
 * the router, so the link WORKS without this — but it would take a visitor off
 * the studio's site from inside a card they opened to read about a service, and
 * back is then the only way home. Architectural Photography is led under its
 * own practice (Postcard of Life) and is the only discipline this applies to;
 * the test is the href rather than a flag on the field, so a second one needs
 * no code.
 *
 * `noopener noreferrer` for the usual reason, and the same pair <Contact />
 * puts on the socials.
 */
const linkOut = (href: string) =>
  /^https?:\/\//.test(href)
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};

/** "(opens in a new tab)", but only when it does. */
const outLabel = (href: string) =>
  /^https?:\/\//.test(href) ? " (opens in a new tab)" : "";

function BentoTile({
  service,
  wide,
  open,
  onToggle,
}: {
  service: Service;
  /** The double-width tile, when the count affords one. See `wideIndex`. */
  wide?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  /* Both faces carry this. `backface-visibility: hidden` is what makes a flip
     a flip rather than two stacked panels: without it the front face stays
     painted, mirrored, through the back.

     ── `overflow` is NOT here ────────────────────────────────────────────
     It used to be, as `overflow-hidden`, because both faces are rounded and
     the front one has a photograph to clip to those corners. The back face
     needs the opposite — see the note on the grid's row height — and stacking `overflow-y-auto` on top of
     `overflow-hidden` would leave which one won to the order Tailwind happens
     to emit two utilities for the same box. Each face states its own. */
  const face =
    "absolute inset-0 rounded-2xl [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <div
      data-reveal
      className={cn("relative", wide && "col-span-2 md:col-span-2")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "group block size-full cursor-pointer text-left",
          // The perspective is on the button and the `preserve-3d` on its
          // child, never both on one element: perspective applies to an
          // element's CHILDREN, so putting it on the rotating element would
          // give the two faces separate vanishing points and the card would
          // shear as it turned instead of pivoting.
          "[perspective:1100px]",
          // ── The press ────────────────────────────────────────────────
          // A phone has no hover, so the desktop's `group-hover:` states have
          // nothing to fire on and the tile would give no feedback at all
          // between the tap and the turn starting. Scaling the whole tile down
          // by 1.5% under the finger is the standard answer and it reads as
          // the card being pushed. `duration-200` because press feedback that
          // eases in over half a second is not feedback.
          "transition-transform duration-200 ease-editorial active:scale-[0.985]"
        )}
      >
        <span
          className={cn(
            "relative block size-full [transform-style:preserve-3d]",
            "transition-transform duration-700 ease-editorial",
            open && "[transform:rotateY(180deg)]"
          )}
        >
          {/* ── Front: the photograph, over a white strip ──────────────
              The desktop card is a white panel with the photograph on top and
              the name in a band under it, hairlined off with
              `border-t border-emerald/10`. This is that card at tile size —
              same surface, same rule, same inks.

              ── What this replaced, and why the replacement was wrong ──────
              The first build of these tiles had no band. The name and folio
              sat ON the photograph over an emerald gradient, on the reasoning
              that a 272px tile could not spare 80px for a band.

              It could. And the gradient cost more than the space it saved: it
              put a wash of the brand green over the bottom two-thirds of every
              photograph — five interiors the studio chose, each seen through a
              green filter — and it made the tiles read as a different
              component from the desktop cards they are supposed to be. It also
              needed the gradient to be dense enough to carry type, so "subtle"
              was never available: at the opacity that made the folio legible
              (measured: it took 88% emerald to bring the indices from 1.19:1
              to 5.0:1) the green is the loudest thing in the tile.

              A white band takes the type off the photograph altogether. The
              picture is then unfiltered, the inks are emerald and gold-ink on
              white — the values the desktop card already uses, and nowhere
              near a contrast threshold — and there is no gradient to tune.
              Removing the problem rather than lighting it well enough to
              survive. */}
          <span
            className={cn(
              face,
              // Clips the photograph to the tile's rounded corners.
              "flex flex-col overflow-hidden border border-emerald/10 bg-white transition-colors duration-500 ease-editorial"
            )}
          >
            {/* `min-h-0` is not optional: a flex child defaults to
                `min-height: auto`, refuses to shrink below its content and
                quietly defeats `flex-1`. Same note as the desktop card.

                `bg-stone` is a ground, not decoration — these images are lazy
                and a tile can be on screen before its photograph arrives.
                Without it the tile reads as a hole in the grid. */}
            <span
              className={cn(
                "relative block min-h-0 flex-1 overflow-hidden",
                /* Cream and padded for a drawing, stone for a photograph — see
                   `illustration` in types/index.ts. The ground is doing a
                   different job in each case: under a photograph it is what the
                   tile shows while the file is still arriving, and under the
                   mandala it is the paper the circle is printed on, visible
                   through its transparent corners for as long as the card
                   exists. */
                service.illustration ? "bg-cream" : "bg-stone"
              )}
            >
              <Media
                src={service.image}
                alt=""
                fit={service.illustration ? "contain" : "cover"}
                /* A narrow tile is ~46vw and the wide one ~94vw; claiming the
                   desktop's 90vw for both made every phone fetch roughly twice
                   the pixels a small tile paints. */
                sizes={wide ? "(max-width: 1024px) 94vw, 30vw" : "(max-width: 1024px) 48vw, 30vw"}
                className={cn(
                  "transition-transform duration-1400 ease-editorial",
                  /* ── The drawing's margin is padding on the IMAGE ─────────
                     Not on the span around it. `object-fit` fits the image to
                     its own CONTENT box, so padding here insets the circle —
                     while padding on the parent would not, because an
                     absolutely-positioned child's containing block is its
                     ancestor's padding box and <Media />'s `inset-0` spans it.

                     The obvious fix was an extra in-flow wrapper to pad. It
                     works on the desktop card and it did NOT work here: this
                     tile is inside a `transform-style: preserve-3d` face with
                     `backface-visibility: hidden`, and the additional nested
                     box left the image with correct geometry — measured 139x165,
                     loaded, opacity 1 — and nothing painted. Padding the image
                     keeps the DOM identical to the five photographs, which have
                     never had that problem. */
                  service.illustration && "p-3",
                  // The desktop's `group-hover:scale-105`, moved onto the
                  // gesture a touch screen actually has. The image settles
                  // back as the card turns face-down, so the movement is only
                  // ever seen on the way in.
                  //
                  // Not on the drawing: a photograph pushing very slightly into
                  // its frame reads as depth, and a diagram doing it reads as
                  // the page failing to hold still.
                  !service.illustration && "group-active:scale-[1.06]"
                )}
              />
            </span>

            {/* ── The strip ──────────────────────────────────────────────
                The desktop band's rule and padding, at tile scale. The folio
                sets above the name rather than beside it because four of the
                five names run to two lines at a 137px measure, and an inline
                numeral would push them to three. */}
            <span className="shrink-0 border-t border-emerald/10 px-3.5 py-3">
              <span className="flex items-end justify-between gap-2">
                <span className="block">
                  <span className="block font-label text-gold-ink">
                    {service.index}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block font-serif leading-[1.12] text-emerald",
                      // ── Two lines are reserved on the narrow tiles ───────
                      // "Vastu" is one line and "Architectural Photography"
                      // is two, and they share a row — so without this the
                      // two bands are different heights, the photographs above
                      // them end at different places, and the row reads as
                      // misaligned. The wide tile is alone in its row and
                      // needs no reservation.
                      wide ? "text-xl" : "min-h-[2.24em] text-base"
                    )}
                  >
                    {service.title}
                  </span>
                </span>

                {/* The desktop card's `+`, in the desktop card's ink — this
                    sits on white now, so `text-gold` (2.18:1 on paper) would
                    be the wrong half of the gold pair. `gold-ink` is the one
                    the desktop band uses for exactly this mark.

                    It turns for the same reason it does there: it is the one
                    thing saying the tile has something behind it.
                    `group-active:rotate-90` is the press; the flip itself
                    takes the icon away with the face, and the back carries the
                    same mark already at 45°. */}
                <FiPlus
                  aria-hidden
                  size={16}
                  className="mb-0.5 shrink-0 text-gold-ink transition-transform duration-300 ease-editorial group-active:rotate-90"
                />
              </span>
            </span>
          </span>

          {/* ── Back: the copy ─────────────────────────────────────────── */}
          <span
            className={cn(
              face,
              /* `overflow-y-auto`, not `overflow-hidden`: a description
                 rewritten longer than the 17rem row should stay REACHABLE, and
                 the alternative silently cuts the last line off a service the
                 studio sells — which looks like nothing at all is wrong. It is
                 inert at every length that fits, which is all six today (the
                 measurement is in the note on the grid below). */
              "flex flex-col overflow-y-auto border border-gold/45 bg-white p-4",
              /* ── Centred, and the linked tile still pins its link down ────
                 The copy is shorter than the face on every tile — 126px of it
                 in 238px on the wide one — so top-aligning left a third of a
                 342px panel empty under the last line, which on the biggest
                 tile in the grid read as a card that had failed to finish
                 loading.

                 `justify-center` is safe for the one tile that has a link:
                 auto margins win over `justify-content` when there is free
                 space, so that tile's `mt-auto` on the link still packs the
                 copy to the top and drops the link to the bottom. Nothing
                 needed a conditional. */
              "justify-center",
              // Pre-rotated, so that when the parent turns 180° this face
              // arrives the right way round.
              "[transform:rotateY(180deg)]"
            )}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="font-label text-gold-ink">{service.index}</span>
              <FiPlus
                aria-hidden
                size={15}
                /* The same mark as the front, already turned — so the pair
                   reads as one control in two states rather than as a `+` and
                   an unrelated `×`. */
                className="shrink-0 rotate-45 text-gold-ink"
              />
            </span>

            {/* The section-heading gesture, and the spine's, and the one the
                mobile projects caption draws — repeating it here is the
                cheapest way to make a turned tile read as part of the same
                drawing rather than as a plain white panel that appeared. */}
            <span aria-hidden className="mt-2.5 block h-px w-10 bg-gold/70" />

            <span
              className={cn(
                "mt-2.5 block font-serif leading-[1.12] text-emerald",
                wide ? "text-xl" : "text-base"
              )}
            >
              {service.title}
            </span>

            <span
              className={cn(
                "mt-2 block text-charcoal/70",
                // 11.2px on a narrow tile. The disciplines run to ~150
                // characters and a 165px-wide tile gives about 137px of
                // measure; at the body's default size that is eight lines and
                // it does not fit. The wide tile has 314px and keeps the
                // normal size.
                wide ? "text-sm leading-[1.55]" : "text-[0.7rem] leading-[1.45]"
              )}
            >
              {service.body}
            </span>

            {/* ── The fee ──────────────────────────────────────────────
                `type-figure` rather than the body face: Cormorant defaults to
                OLD-STYLE figures, where 6 and 9 hang below the baseline and 0
                sits at x-height, so "₹6,999" sets as a wobbling line of
                numerals that reads as a rendering fault rather than a price.
                Same utility <StatsStrip /> uses on its figures, same reason.

                Emerald rather than `gold-ink`: the index above and the link
                below are both already gold, and a third gold element on a
                272px face makes the one line a visitor is looking for the
                hardest of the three to pick out. The brand ink is also what
                the title is set in, which is the association wanted here —
                this is the card talking, not a piece of chrome. */}
            {service.price && (
              <span
                className={cn(
                  "mt-2 block type-figure leading-none text-emerald",
                  wide ? "text-base" : "text-[0.82rem]"
                )}
              >
                {service.price}
              </span>
            )}

            {service.link && (
              /* DRAWN here, but not interactive — the real anchor is the flat
                 sibling below, outside the 3D. `mt-auto` pins it to the foot of
                 the tile so the overlay has a fixed place to sit. */
              <span
                aria-hidden
                className={cn(
                  "mt-auto inline-flex items-center gap-1.5 self-start border-b border-gold/50 pt-2 pb-0.5 font-label text-gold-ink",
                  // The label is the smallest type on the tile and it is the
                  // one element competing with the description for the last
                  // 30px of a narrow face.
                  !wide && "text-[0.62rem]"
                )}
              >
                {service.link.label}
                <FiArrowUpRight size={wide ? 12 : 11} />
              </span>
            )}
          </span>
        </span>
      </button>

      {service.link && (
        /* ── The real link, flat and outside the button ──────────────────
           Two reasons it cannot be the drawn one above. An <a> inside a
           <button> is invalid HTML and browsers disagree about which one a
           click activates. And an anchor inside `preserve-3d` is subject to
           the hit-testing mismatch this file's header note describes, where
           the element paints in one place and is tested in another.

           So it is a sibling of the button, absolutely positioned over the
           spot the drawn link occupies on the back face. It is inert until the
           tile is turned: `pointer-events-none` so it cannot swallow a tap
           meant to flip the card, and out of the tab order so a keyboard user
           is not sent to a page whose name is currently face-down. */
        <SmoothLink
          href={service.link.href}
          {...linkOut(service.link.href)}
          tabIndex={open ? undefined : -1}
          aria-hidden={!open}
          className={cn(
            "absolute right-4 bottom-4 left-4 z-10 h-9",
            open ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <span className="sr-only">
            {service.link.label}
            {outLabel(service.link.href)}
          </span>
        </SmoothLink>
      )}
    </div>
  );
}

/**
 * ── The disciplines are repo content, and that is a decision ─────────────
 *
 * This took a `services` prop and <HomeDocument /> filled it from Sanity, the
 * same contract <Hero />'s `slides` and <Testimonials />'s `items` still have.
 * The studio asked for it back, and the layout agrees with them.
 *
 * Three things here are computed from the list rather than merely rendering it:
 * the bento's tile spans are packed from the COUNT (`wideIndex` below), the
 * pinned track's progress readout divides by it, and every tile's back face has
 * to hold its description inside a 272px box. None of those fail loudly when a
 * seventh discipline is published or a description is rewritten at twice the
 * length — the grid just grows a hole and a face starts scrolling, and nothing
 * about the page looks broken enough for anyone to notice.
 *
 * In constants/content.ts that copy can only change in a commit, which is also
 * where the two measurements it affects can be re-run. See
 * `.claude/skills/run-aarnaa-studios` for how.
 */
export default function Services() {
  const services = SERVICES;
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  /* The bento's entrance. `lg:hidden`, so above 1024px this animates a
     `display: none` subtree, which costs nothing and keeps the hook
     unconditional. */
  const bentoRef = useReveal<HTMLDivElement>({ stagger: 0.09, y: 28 });

  const [active, setActive] = useState(0);
  /** Which discipline is expanded. Only one at a time. */
  const [openId, setOpenId] = useState<string | null>(null);

  /**
   * Read into a local before the effect, and listed as its dependency.
   *
   * The track's active index is `progress × (count - 1)`, so the count is part
   * of the timeline's arithmetic rather than something it reads incidentally.
   * Listing it as a dependency is what makes adding a seventh discipline a
   * one-line edit to constants/content.ts: without it the ScrollTrigger goes on
   * dividing by the number of cards there were when the effect first ran, and
   * the header counts to a number the row no longer has.
   */
  const count = services.length;

  /**
   * Which bento tile, if any, is double-width — and `-1` for "none".
   *
   * ── Why this is arithmetic rather than `i === 0` ─────────────────────
   *
   * The bento runs two columns on a phone and three from `md`, and a tile that
   * spans two of them costs two cells. For the grid to end on a full row at
   * BOTH counts, the total number of cells has to divide by two and by three —
   * so by six. With one wide tile that is `count + 1`.
   *
   * Five disciplines was exactly that case: 5 + 1 = 6, which packs 3 rows of
   * two and 2 rows of three with nothing left over, and the uneven first tile
   * gave the block a composition instead of a queue. Six disciplines is not:
   * 6 + 1 = 7 leaves a hole beside the last tile at two columns and two holes
   * at three, and a bento with a gap in it reads as a grid that failed to load
   * rather than as a deliberate shape.
   *
   * Six equal tiles pack perfectly on their own — 3x2 and 2x3 — so at this
   * count the wide tile is simply not spent. The composition is worth having
   * where it is free and it is not worth a hole.
   *
   * (It comes back on its own at eleven, and at five if a discipline is ever
   * dropped, which is the point of deriving it rather than writing `i === 0`:
   * whoever edits the list next does not have to find this note first.)
   */
  const wideIndex = (count + 1) % 6 === 0 ? 0 : -1;

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Measured through a function so `invalidateOnRefresh` can re-read it
      // on resize instead of holding a value from first paint.
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, { x: () => -distance(), ease: "none" });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
          const idx = Math.round(self.progress * (count - 1));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [count]);

  return (
    <section
      ref={sectionRef}
      id="services"
      /* ── Paper, and it fixes the alternation as well as the look ────────
         This was mid brand green with cream type, on the argument that a
         saturated ground makes photography read as lit objects. It did — and
         it cost more than it bought, for two reasons.

         The look: five photographs, each a bright interior, sitting on the
         darkest ground on the site with cream type between them. The cards had
         no surface of their own, so each one was a lit rectangle floating on
         green with a hairline of type underneath. Nothing held them together
         and the section read as unfinished next to <Testimonials />, which is
         the same shape — a row of cards under a heading — and reads as a set.

         The alternation: the page's grounds are meant to alternate paper and
         emerald so that every boundary is a hard edge between two flat colours
         (see the note on the two grounds in styles/globals.css). <Process />
         immediately above is emerald and <Contact /> immediately below is
         emerald, so this section was the middle of a three-chapter green run
         with no boundary at either end. On paper it is the edge both of them
         needed.

         `data-chrome="dark"` goes with it: the masthead reads that attribute
         to decide whether it needs cream chrome, and this is no longer a dark
         band — see components/layout/Navbar.tsx. */
      className="relative bg-paper text-charcoal"
    >
      {/* `placement="top"` is kept rather than taking <Testimonials />'s
          corners: this section is a pinned 100vh box and a bottom-left
          ornament would land on the progress rail. */}
      <SheetTexture placement="top" />

      <div
        ref={pinRef}
        className="relative z-10 flex flex-col overflow-hidden lg:h-screen"
      >
        <PageContainer className="shrink-0 pt-24 pb-8 md:pt-28">
          <SectionHeading
            eyebrow="Services"
            /* The logo gold, matching <Practice />'s eyebrow. See the note on
               `eyebrowClassName` in components/ui/SectionHeading.tsx for what it
               costs on paper — gold is 2.18:1 there against `gold-ink`'s 5.04:1,
               and an eyebrow is the smallest type on the page to spend that on. */
            eyebrowClassName="text-gold"
            title="What we do"
            /* Same reason as <SelectedWorks />: `active` is written by the
               horizontal track's ScrollTrigger, which only exists at `lg` and
               up. Below that the header sat on "01 / 05" while you scrolled
               past all five. The stack gets the count, which stays true. */
            meta={
              <>
                <span className="lg:hidden">
                  {count} {count === 1 ? "discipline" : "disciplines"}
                </span>
                <span className="hidden lg:inline">
                  {`${String(active + 1).padStart(2, "0")} / ${String(
                    count
                  ).padStart(2, "0")}`}
                </span>
              </>
            }
            className="max-w-full"
          />
        </PageContainer>

        {/* ── The bento (below lg) ──────────────────────────────────────────
            Five disciplines in a two-up grid with the first taking a
            double-width tile, each tile turning over to show its copy. See
            <BentoTile /> above for what this replaced and why it turns rather
            than expanding.

            ── The spans pack exactly, at both column counts ────────────────
            Six disciplines fill a rectangle with no hole in it at either
            column count without needing a wide tile at all:

              2 columns   [ 01 ][ 02 ]   3 columns   [ 01 ][ 02 ][ 03 ]
                          [ 03 ][ 04 ]               [ 04 ][ 05 ][ 06 ]
                          [ 05 ][ 06 ]

            Five did too, but only WITH one — [01 -- 01] over four singles.
            Which of the two the grid is showing is `wideIndex` above, and the
            note there has the arithmetic. The rule either way is that the last
            row has to be full: a bento with a gap in it reads as a grid that
            failed to load rather than as a composition.

            Note where the sixth tile lands as a result. Design Consultation
            and Architectural Photography share the bottom row at two columns
            and the bottom-right pair at three — the two cards that send you
            somewhere, side by side at the foot of the grid, which is the
            closest this layout gets to the desktop track's closing panel.

            ── The row height is set, not derived, and it is MEASURED ──────
            `auto-rows` rather than an aspect ratio on the tiles. A tile's back
            face has to hold the discipline's whole description at a ~137px
            measure, so the binding constraint is the COPY's height, not the
            photograph's proportion — and an aspect ratio would let the longest
            description decide the grid by overflowing it.

            The faces are `overflow-hidden`, so an overflow here does not
            scroll or spill: it silently CLIPS the last line or two of a
            sentence, which is the worst way for this to fail because nothing
            about the rendered page looks wrong. At 15.5rem it did exactly
            that — Architectural Photography ran 14px past its face, and at
            16.5rem, once the hairline was added, 3px past it.

            So the height is picked from the worst case rather than by eye. At
            17rem the five back faces measure 126, 167, 133, 149 and 204px of
            copy in 238px of room, the tightest being Architectural Photography
            (137 characters plus a link).

            ── The check, when the copy changes ────────────────────────────
            `SERVICES` is a committed constant, so the copy can only change in
            a commit — which means this measurement can be re-run in the same
            one. It is `scrollHeight - clientHeight` on each back face, and it
            should be 0; the driver in .claude/skills/run-aarnaa-studios is how
            to get at them. Re-measured at six disciplines, 390x844: 0 on all
            six, the tightest being Design Consultation and Architectural
            Photography, the two carrying a link.

            The face SCROLLS rather than clips all the same — `overflow-y-auto`
            on it, above. A clipped last line is the worse failure of the two
            because nothing about the rendered page looks wrong. */}
        <div
          ref={bentoRef}
          className="grid grid-cols-2 auto-rows-[17rem] gap-3 px-6 pb-10 sm:auto-rows-[18rem] sm:gap-4 md:grid-cols-3 md:px-10 lg:hidden"
        >
          {services.map((service, i) => (
            <BentoTile
              key={service.id}
              service={service}
              wide={i === wideIndex}
              open={openId === service.id}
              onToggle={() =>
                setOpenId(openId === service.id ? null : service.id)
              }
            />
          ))}
        </div>

        {/* ── The closing panel, below lg ──────────────────────────────────
            The desktop track ends on this and the mobile layout had none of
            it: below `lg` the section simply stopped after the fifth
            discipline, so the one chapter that describes what the studio sells
            offered no way to ask about any of it. The copy and the link are the
            desktop panel's, verbatim. */}
        <PageContainer className="pb-12 lg:hidden">
          <span aria-hidden className="mb-5 block h-px w-16 bg-gold" />
          <p className="max-w-[24ch] font-serif text-[1.55rem] leading-[1.15] text-emerald">
            One studio, every discipline, one continuous idea.
          </p>
          <SmoothLink
            href="/contact"
            className="group mt-6 inline-flex items-center gap-2.5 border-b border-gold/60 pt-1.5 pb-1.5 font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
          >
            Start a conversation
            <FiArrowUpRight
              size={14}
              aria-hidden
              className="transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </SmoothLink>
        </PageContainer>

        {/* ── The track (lg and up) ─────────────────────────────────────────
            The pinned horizontal run: a flex row that GSAP translates sideways
            as the section scrolls.

            It used to carry the small screens too, as a stack and then a
            two-up grid — "three layouts, one element". The bento above took
            those over, and the two are separate elements now because they are
            no longer the same object at three widths: this is a row of tall
            cards that open an accordion downward, that is a grid of tiles that
            turn over. Sharing one element meant every class on it had to be
            qualified for three layouts, and the interaction could only ever be
            whichever one both could do.

            Both trees are always in the DOM. That costs nothing in bandwidth:
            the hidden one is `display: none`, so its lazy images never
            intersect the viewport and are never fetched. */}
        <div
          ref={trackRef}
          className="relative hidden flex-1 items-stretch will-change-transform lg:flex lg:flex-row lg:gap-8 lg:px-16 lg:pb-10"
        >
          {services.map((service) => {
            const open = openId === service.id;

            return (
              <article
                key={service.id}
                className="group flex shrink-0 flex-col lg:h-full lg:w-[30vw] xl:w-[26vw]"
              >
                {/* ── The card is a surface ───────────────────────────────
                    The photograph and the name used to sit directly on the
                    section's ground with a rule between them, which works on a
                    dark band — the image IS the card there, because it is the
                    only lit thing in the frame. On paper it stops working: the
                    image is lit, the ground is lit, and nothing draws the edge
                    of the card.

                    So the pair goes inside a white panel with a hairline, and
                    the values are lifted verbatim from the light tone in
                    components/ui/InfiniteMovingCards.tsx — `bg-white`,
                    `border-emerald/10`, gold on hover. That is the same object
                    a testimonial is, which is the point: two sections with the
                    same shape should be built out of the same surface.

                    `overflow-hidden` on the panel rather than a radius on the
                    image, so one declaration rounds the photograph's top
                    corners and the panel's bottom ones and they cannot drift
                    apart. */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-emerald/10 bg-white transition-colors duration-500 ease-editorial group-hover:border-gold/45 lg:h-full">
                  {/* ── The photograph takes whatever the name does not ─────
                      This was a fixed 60% of the card with the name's block
                      taking the other 40%, and the 40% was mostly empty: a
                      one-line title in a box tall enough for a title plus four
                      lines of description, because one card in five carried a
                      permanent description and all five had to end level.

                      That card is an accordion now like the rest, so nothing
                      needs the space reserved. `flex-1 min-h-0` gives the
                      photograph the remainder instead, and the name's block
                      below it is only as tall as the name — which is what
                      closes the empty band under every image.

                      `min-h-0` is not optional: a flex child defaults to
                      `min-height: auto`, refuses to shrink below its content
                      and quietly defeats `flex-1`.

                      Opening a description now takes its room from the
                      photograph, which is the honest behaviour for a panel
                      inside a fixed-height row — the alternative is a card that
                      grows past the bottom of a pinned viewport.

                      `bg-stone` is a ground, not decoration: these images are
                      lazy-loaded and the track scrolls sideways, so a card can
                      be on screen before its image has arrived. Without it the
                      card reads as a hole in the row. */}
                  {/* ── The image is a second handle on the same control ────
                      Clicking the photograph does what clicking the name does.
                      It is by far the biggest thing in the card, so it was
                      always what a visitor would aim at first.

                      A real <button>, not a div with an onClick, so it is a
                      control rather than a decoration — but `tabIndex={-1}` and
                      `aria-hidden`, because it is the SAME control as the name
                      below and exposing both would make a keyboard user tab
                      through ten stops to cross five cards. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setOpenId(open ? null : service.id)}
                    className={cn(
                      "relative block aspect-4/5 w-full shrink-0 cursor-pointer overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1",
                      // See the note on the same pair in the bento tile above.
                      service.illustration ? "bg-cream" : "bg-stone"
                    )}
                  >
                    <Media
                      src={service.image}
                      alt=""
                      fit={service.illustration ? "contain" : "cover"}
                      sizes="(max-width: 1024px) 90vw, 30vw"
                      className={cn(
                        "transition-transform duration-1400 ease-editorial",
                        // Padding on the image, not the panel — see the note on
                        // the bento tile's copy of this.
                        service.illustration && "p-8 xl:p-10",
                        !service.illustration && "group-hover:scale-105"
                      )}
                    />

                    {/* The folio used to sit HERE, over the photograph, on a
                        short emerald scrim — and the scrim was load-bearing,
                        because cream only reads where the picture is dark and
                        these are bright interiors. It is in the band below now.
                        See the note there. */}
                  </button>

                  <div className="shrink-0 border-t border-emerald/10 p-5 xl:p-6">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : service.id)}
                      aria-expanded={open}
                      aria-controls={`service-${service.id}`}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                    >
                      {/* ── The folio, off the photograph ────────────────────
                          It was drawn over the image on an emerald scrim. The
                          scrim had to be dense enough to carry cream type over
                          a bright interior, which meant a green wash across the
                          top of every photograph the studio chose — and it made
                          these cards read as a different component from the
                          bento tiles below `lg`, which had already moved their
                          folio into the white strip for exactly this reason.

                          On white the ink is `gold-ink` (5.04:1) rather than
                          `gold` (2.18:1), same as the `+` beside it. And one
                          ink now serves both grounds, so the photograph/drawing
                          conditional this numeral used to carry is gone. */}
                      <span className="block">
                        <span className="block font-label text-gold-ink">
                          {service.index}
                        </span>
                        <span className="mt-1.5 block font-serif text-[1.7rem] leading-[1.1] text-emerald xl:text-3xl">
                          {service.title}
                        </span>
                      </span>
                      <FiPlus
                        className={cn(
                          // Sits on the folio's line rather than the title's:
                          // the block it marks now starts one line higher.
                          "mt-0.5 shrink-0 text-gold-ink transition-transform duration-500 ease-editorial",
                          open && "rotate-45"
                        )}
                        size={18}
                        aria-hidden
                      />
                    </button>

                    <div
                      id={`service-${service.id}`}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-600 ease-editorial",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-3 max-w-sm text-charcoal/70">
                          {service.body}
                        </p>

                        {/* The fee, between the copy and the link it belongs
                            to. See the note on the bento's copy of this for
                            why `type-figure` and why emerald. */}
                        {service.price && (
                          <p className="mt-3 type-figure text-[1.05rem] leading-none text-emerald">
                            {service.price}
                          </p>
                        )}

                        {/* The discipline's own destination, offered where the
                            reader already is rather than by turning the whole
                            card into a link. `tabIndex` follows the panel: a
                            link inside a collapsed row is still in the tab
                            order and would send a keyboard user to a page they
                            cannot see the name of. */}
                        {service.link && (
                          <SmoothLink
                            href={service.link.href}
                            {...linkOut(service.link.href)}
                            tabIndex={open ? undefined : -1}
                            /* `pt-1.5` on top of the existing `pb-1`: the link
                               is 12px label type, which is a 21px-tall target
                               without it. The underline is the bottom BORDER,
                               so padding added above the text grows the target
                               without moving the rule. */
                            className="group/link mt-4 inline-flex items-center gap-2 border-b border-gold/50 pt-1.5 pb-1 font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
                          >
                            {/* The label and its "(opens in a new tab)" are ONE
                                flex item. `sr-only` is `position: absolute` at
                                1px, but an absolutely-positioned child is still
                                a flex item — as a sibling it would earn its own
                                `gap-2` and push the arrow ~9px off the word it
                                belongs to. */}
                            <span>
                              {service.link.label}
                              <span className="sr-only">
                                {outLabel(service.link.href)}
                              </span>
                            </span>
                            <FiArrowUpRight
                              size={13}
                              aria-hidden
                              className="transition-transform duration-500 ease-editorial group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                            />
                          </SmoothLink>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Closing panel — keeps the track from ending on a hard edge and
              gives the horizontal run somewhere to arrive. */}
          <div className="hidden shrink-0 flex-col justify-end pb-8 lg:flex lg:w-[24vw]">
            <span aria-hidden className="mb-6 block h-px w-16 bg-gold" />
            <p className="font-serif text-[1.7rem] leading-[1.15] text-emerald xl:text-3xl">
              One studio, every discipline, one continuous idea.
            </p>
            <SmoothLink
              href="/contact"
              className="group mt-7 inline-flex items-center gap-2.5 self-start border-b border-gold/60 pt-1.5 pb-1.5 font-label text-gold-ink transition-colors duration-500 hover:text-emerald"
            >
              Start a conversation
              <FiArrowUpRight
                size={14}
                aria-hidden
                className="transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </SmoothLink>
          </div>
        </div>

        {/* Progress hairline (desktop only — below lg there is no horizontal
            travel for it to describe). */}
        <PageContainer className="hidden shrink-0 pb-5 lg:block">
          <div className="relative h-px bg-emerald/15">
            {/* scaleX rather than width: a transform is composited, so the bar
                stays smooth while the pin is also driving the track. */}
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gold"
            />
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
