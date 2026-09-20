"use client";

/**
 * CreditBand — a full-bleed strip of other people's marks, moving slowly.
 *
 * Two of them on the home page and they are the same component twice:
 *
 *   · CLIENTS, on white, above <SelectedWorks /> — a wall of lockups
 *   · AWARDS,  on emerald, above <Process />     — a line of names
 *
 * ── One rule decides which of those you get ──────────────────────────────
 *
 * An entry renders its LOGO if it has one and its NAME if it does not. One
 * line either way. Nothing here branches on which band it is: the client band
 * is a wall of logos because clients have logos, and the awards band is a row
 * of names — "Indian Express Awards" — because an award is known by its name
 * and its seal is usually dark artwork that would vanish on emerald anyway.
 *
 * That is the whole design, and it is what the first version got wrong. It
 * set a name AND a line of attribution under it, in the small uppercase face,
 * for every entry — two lines of type in a 120px band, boxed off from its
 * neighbours by a full-height vertical rule. Eight of those in a row is a
 * table, and a table is the one thing this site never does. The rules are
 * gone, the second line is gone, and what is left is a mark, some space, and
 * the gold lozenge the rest of the site already uses to separate things in a
 * sequence (the <Spine /> stations, the <StageJoin /> in <Process />).
 *
 * ── Why one component and not two ────────────────────────────────────────
 *
 * They are the same object: a band the height of <StatsStrip />, carrying a
 * slow horizontal row of marks that all say the same thing about the studio.
 * What differs is the ground colour and the caption, and both are props. A
 * second copy would be correct on the day it was pasted and wrong the first
 * time the marquee's seam maths or the band's height moved.
 *
 * The two CONTENT SOURCES stay separate — `client` and `accolade` are
 * distinct document types, so the studio orders its client wall without
 * reordering its awards and the publish webhook drops exactly one of the two.
 * See sanity/lib/content.ts. They converge on `Credit`, which is the point at
 * which they genuinely are the same shape.
 *
 * ── The marquee, and the trap it avoids ──────────────────────────────────
 *
 * The `marquee` keyframe travels exactly `-50%`, so the two copies of the
 * sequence have to tile seamlessly at that offset. A `gap` on the track breaks
 * that — the gap that falls BETWEEN the two copies is not accounted for in
 * -50%, so the seam drifts by half a gap every lap. <InfiniteMovingCards />
 * corrects for it with a `--marquee-gap` variable in its own keyframe; this
 * band avoids it the way <StatsStrip /> does, by giving each item its own
 * trailing lozenge and margin so the track has no `gap` at all and the two
 * copies are byte-identical.
 */
import { useId, useRef, useState } from "react";

import { PageContainer } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/hooks";
import { cn } from "@/utils/cn";
import type { Credit } from "@/types";

type Tone = "paper" | "emerald";

/**
 * How fast the row travels, in pixels per second.
 *
 * A SPEED, not a duration, for the reason <StatsStrip /> spells out: the
 * duration is derived from the measured track below, so publishing a ninth
 * client makes the lap longer rather than making every logo go past faster.
 *
 * 50 rather than that band's 42. Its items are a figure and a word the eye
 * parses in one fixation; these are a logo it recognises or does not, and a
 * short name it reads in one go. At 50 an item takes ~4.5s to cross a fixed
 * point — long enough to take one in, slow enough not to read as a conveyor.
 */
const MARQUEE_PX_PER_SECOND = 50;

/**
 * Items per half-track.
 *
 * Half the track has to be wider than the viewport or the row runs out of
 * entries mid-lap and shows a hole where the seam is. Items here are ~220px —
 * a mark plus its lozenge and margins — so twelve clears ~2650px and the row
 * stays full past any realistic display.
 *
 * Short lists are repeated up to this count, the same way
 * <InfiniteMovingCards /> does it. Repetition is visible with two or three
 * entries and invisible with six or more, which is why the Studio asks for at
 * least four of each.
 */
const MIN_ITEMS = 12;

const TONE: Record<
  Tone,
  { band: string; label: string; name: string; lozenge: string }
> = {
  /**
   * White, not `paper`.
   *
   * It sits between <Practice /> (`bg-paper`, #f8fbf9) above and the emerald
   * of <SelectedWorks /> below, so `bg-paper` would have made it invisible at
   * the top edge — and a band nobody can see the start of is a band that reads
   * as part of the section above it. Pure white against paper is a ~2% step,
   * barely a colour change, which is right; the hairline does the rest.
   *
   * It is also the only ground a wall of client lockups can sit on. Whatever
   * the studio is sent will have been drawn for white.
   */
  paper: {
    band: "border-emerald/10 bg-white",
    /* `gold-ink` (#8b6609, 5.04:1 here) and not the logo gold. The logo gold
       measures ~2.2:1 on white, and <Practice /> only gets away with it on a
       word 48px tall that carries its own rule — see the note there. This is
       12px uppercase, the smallest type on the page and the last place to
       spend contrast on. */
    label: "text-gold-ink",
    name: "text-emerald",
    /* Muted brass. Full gold is invisible on white at 5px and `emerald` at
       this size reads as a stray full stop rather than as the site's mark. */
    lozenge: "bg-gold-ink/30",
  },
  /**
   * Brand emerald with the gold hairline — <StatsStrip />'s exact treatment,
   * because this is visibly its sibling.
   *
   * ── It butts straight onto <Process />, which is also emerald ──────────
   *
   * Every other boundary on this page is a hard edge between two flat colours
   * (see the note on the two grounds in styles/globals.css); this one is not,
   * and the bottom `border-gold/25` is the whole separation between the band
   * and the chapter under it. That is deliberate rather than tolerated: read
   * that way the band is the title plate ON the How-we-work chapter, which is
   * what <StatsStrip />'s header calls the one thing a full-emerald band is
   * allowed to be. Given a lifted green instead (`moss`) it would read as a
   * third ground in a two-ground page.
   */
  emerald: {
    band: "border-gold/25 bg-emerald",
    label: "text-gold",
    /* Champagne — the cut <StatsStrip /> sets its figures in, and the reason
       an award name reads as an award rather than as a caption. */
    name: "text-gold-soft",
    lozenge: "bg-gold/55",
  },
};

interface CreditBandProps {
  /** Clients or accolades — see `Credit`. An empty list renders nothing. */
  items: Credit[];
  /** The band's caption. One word wherever possible, like the site's eyebrows. */
  label: string;
  tone?: Tone;
  className?: string;
}

export default function CreditBand({
  items,
  label,
  tone = "paper",
  className,
}: CreditBandProps) {
  const ink = TONE[tone];
  const trackRef = useRef<HTMLUListElement>(null);
  const [duration, setDuration] = useState<string>();
  const labelId = useId();

  /**
   * Turn the measured track into a duration at the speed above.
   *
   * `scrollWidth / 2` is one copy of the sequence, because the track holds
   * exactly two — and that is also precisely how far the keyframe travels
   * (`-50%`), so dividing it by px/s gives one lap directly.
   *
   * `ResizeObserver` rather than a `resize` listener: the track's width
   * changes when a logo decodes and when the webfont lands, not when the
   * window moves. It also covers the orientation change a resize listener
   * would have caught anyway.
   */
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const lap = track.scrollWidth / 2;
      // Zero while the row is `display: none` — under reduced motion. Writing
      // `0s` there would make the animation invalid.
      if (lap > 0) setDuration(`${(lap / MARQUEE_PX_PER_SECOND).toFixed(2)}s`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Nothing published and nothing committed. The band removes itself rather
  // than drawing an empty 120px stripe across the page.
  if (items.length === 0) return null;

  // Repeat short lists so half a track still overflows the viewport.
  const sequence = Array.from(
    { length: Math.ceil(MIN_ITEMS / items.length) },
    () => items
  ).flat();

  /**
   * One entry: the lockup if there is one, the name in the serif if not.
   *
   * ── The logo lives in a FIXED slot ─────────────────────────────────────
   *
   * `h-9 w-32`, `h-10 w-40` from `md` up, with `object-contain` — so a 3:1
   * banner lockup and a square monogram occupy the same optical width and the
   * row keeps an even rhythm. Sizing by the box rather than by the file is the
   * only way a logo wall stays a wall: left to their own proportions, one
   * client's banner is three times the width of another's monogram and the
   * band reads as a ranking of who matters most.
   *
   * The narrower phone slot is what keeps the REDUCED-MOTION layout usable.
   * That fallback is a centred wrap, and at 160px wide only one lockup fits a
   * 390px measure — eight rows, a 500px band. At 128px two fit, which halves
   * it. It also puts the animated band back on <StatsStrip />'s exact 106px
   * phone height.
   *
   * ── Grey at rest, and in colour under the cursor ───────────────────────
   *
   * Client logos arrive in eight unrelated brand palettes. Dropped in raw,
   * they are instantly the loudest thing on a site whose whole argument is
   * three controlled colours — a row of other people's marketing across the
   * middle of the page. Desaturated and held back to 70% they read as a
   * credit list, which is what they are, and the row pauses and returns one
   * to full colour when the pointer stops on it.
   */
  const entry = (item: Credit) =>
    item.logo ? (
      <span className="block h-9 w-32 shrink-0 md:h-10 md:w-40">
        {/* eslint-disable-next-line @next/next/no-img-element --
            NOT next/image, deliberately. A logo is an SVG (that is what a
            studio should be asking its clients for) and next/image refuses
            SVG unless `dangerouslyAllowSVG` is set globally — a flag whose
            danger is precisely user-uploaded SVG, which is exactly what the
            Studio's `logo` field accepts. And there is nothing for the
            optimiser to win here: the slot is 160x40, so every sensible
            source is already smaller than one responsive variant would be.
            The box is explicitly sized, so there is no layout shift to
            protect against either. */}
        <img
          src={item.logo}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className={cn(
            "ease-editorial h-full w-full object-contain opacity-70 grayscale",
            "transition duration-500 group-hover/item:opacity-100 group-hover/item:grayscale-0"
          )}
        />
      </span>
    ) : (
      /* `whitespace-nowrap`: every one of these is two or three words, and an
         entry that wraps is two lines tall in a row whose others are one, so
         the band's baseline stops agreeing with itself. The Studio caps the
         length rather than letting the layout absorb it. */
      <span
        className={cn(
          "font-serif text-[1.125rem] leading-tight whitespace-nowrap",
          ink.name
        )}
      >
        {item.name}
      </span>
    );

  return (
    <div
      /* `data-chrome="dark"` is not decoration — the masthead reads that
         attribute to decide when it needs cream chrome, and emerald chrome
         over this band would be unreadable. See components/layout/Navbar.tsx.
         The white band is light, which is the default, so it says nothing. */
      data-chrome={tone === "emerald" ? "dark" : undefined}
      /* It must NOT sit inside a <PageContainer />. The band bleeds to both
         page edges; insetting it would turn a title plate into a card.

         `py-5 md:py-6` against a 36/40px row puts the band at 106/118px,
         which is <StatsStrip />'s 106/118 exactly. Three bands down
         one page have to read as three printings of one thing rather than as
         three components borrowed from three places, and the height is most
         of what does that. The logo slot grew at the padding's expense rather
         than the band's. */
      className={cn("relative z-10 border-y py-5 md:py-6", ink.band, className)}
    >
      {/* One word wherever it will take one, like every other eyebrow on the
          site ("TESTIMONIALS", "PROCESS", "SERVICES"). The first version read
          "CLIENTS WE HAVE WORKED WITH", which is a sentence explaining a row
          of logos to someone who can see it is a row of logos. */}
      <p id={labelId} className={cn("m-0 text-center font-label", ink.label)}>
        {label}
      </p>

      {/* ── The moving row ───────────────────────────────────────────────
          Full-bleed, and masked at both ends so entries fade in and out
          rather than being sliced by a hard edge in the middle of the band.
          A row held to the measure would show them appearing out of nothing
          two inches inside the page.

          `marquee-group` is the site's existing hover-pause utility (see
          styles/globals.css). It is what makes the colour-on-hover above
          usable: a logo sliding out from under a stationary pointer would
          light up and leave before it finished the transition. */}
      <div
        className={cn(
          "marquee-group mt-3.5 overflow-hidden motion-reduce:hidden",
          /* A fixed 40px fade at both ends, not a PERCENTAGE one.
             <InfiniteMovingCards /> masks at 6%/94% and is right to: its cards
             are ~340px wide, so the fade scales with the thing being faded.
             An entry here is the same 144px slot at every width, and 5% of a
             390px phone is 19px — a fifth of a logo, which clips rather than
             fades and reads as a rendering fault. */
          "mask-[linear-gradient(to_right,transparent,white_2.5rem,white_calc(100%_-_2.5rem),transparent)]"
        )}
      >
        <ul
          ref={trackRef}
          aria-labelledby={labelId}
          className="animate-marquee flex w-max list-none items-center p-0"
          style={{ "--marquee-duration": duration } as React.CSSProperties}
        >
          {/* Two copies. The duplicate is built in JSX rather than cloned in
              an effect so it renders on the server, and it is `aria-hidden` so
              each name is announced once. */}
          {[0, 1].map((copy) =>
            sequence.map((item, i) => (
              <li
                key={`${copy}-${i}-${item.id}`}
                aria-hidden={copy === 1 ? true : undefined}
                className="group/item flex h-9 shrink-0 items-center md:h-10"
              >
                {entry(item)}

                {/* The separator, and it belongs to the ITEM — see the header
                    on why this track has no `gap`.

                    A lozenge, not a rule. `rotate-45` on a small square is the
                    mark the <Spine /> uses for a station and <Process /> uses
                    to join two stages, so the band is punctuated in the site's
                    own hand. The full-height hairline this replaced drew a box
                    around every logo and turned the strip into a toolbar. */}
                <span
                  aria-hidden
                  className={cn(
                    "mx-9 block size-[5px] shrink-0 rotate-45",
                    ink.lozenge
                  )}
                />
              </li>
            ))
          )}
        </ul>
      </div>

      {/* ── Reduced motion: the same marks, standing still ───────────────
          Not optional. The global reduced-motion rule in styles/globals.css
          collapses every animation to 0.001ms, so with the marquee left in
          place a visitor would see the first two entries and have no way to
          reach the rest — the row does not scroll, it animates.

          A centred wrap is the honest static form of a credit list. It is
          taller than 120px on a phone, and that is the correct trade: the
          alternative is content that cannot be reached at all.

          Both are CSS variants rather than a `useReducedMotion()` branch, so
          the server and the client render the same thing and there is no
          hydration flash. */}
      <PageContainer className="hidden motion-reduce:block">
        <ul className="mt-3.5 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-4 p-0 md:gap-x-10">
          {items.map((item) => (
            <li key={item.id} className="group/item flex h-9 items-center md:h-10">
              {entry(item)}
            </li>
          ))}
        </ul>
      </PageContainer>
    </div>
  );
}
