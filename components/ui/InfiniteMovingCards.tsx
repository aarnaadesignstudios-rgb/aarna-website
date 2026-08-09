"use client";

/**
 * InfiniteMovingCards — a row of testimonial cards that scrolls forever and
 * stops when you touch it.
 *
 * This used to render one continuous line of italic text, which put the
 * quotes on the same footing as the brand-values ticker: a strip you scan past
 * rather than proof you stop and read. Client words are the page's strongest
 * evidence, so they now get real cards — a quote glyph, the quote itself, a
 * hairline, the attribution, and the phoenix as a signature.
 *
 * Interaction, in layers: the row pauses whenever the pointer is anywhere over
 * it, and the card under the cursor lights up with the site's gold spotlight
 * (<SpotlightCard />) and lifts. Pausing is what makes the glow usable — a card
 * sliding out from under a stationary cursor never fires another mousemove, so
 * the glow would smear behind it.
 *
 * How the loop works
 * ------------------
 * The sequence is rendered twice and the track translates by exactly half its
 * width (plus half a gap, to account for the gap that sits between the two
 * copies). At that offset copy two is where copy one began, so the restart is
 * invisible. Two constraints follow, and both are enforced here rather than
 * left to the caller:
 *
 *  - The gap in the CSS and the gap in the keyframe must agree, or the seam
 *    drifts a few pixels every lap. `--marquee-gap` drives both.
 *  - Half the track has to be wider than the viewport, or the row runs out of
 *    cards mid-lap and shows a gap. Short lists are repeated up to MIN_CARDS
 *    to guarantee it.
 *
 * The duplicate is built in JSX (and hidden from assistive tech) rather than
 * cloned into the DOM in an effect: it renders on the server, needs no
 * StrictMode guard, and survives a re-render.
 */
import Mark from "./Mark";
import SpotlightCard from "./SpotlightCard";
import { cn } from "@/utils/cn";
import type { Testimonial } from "@/types";

type Tone = "light" | "dark";

/**
 * Track gap, in rem. Shared with the `scroll` keyframe through
 * `--marquee-gap` — see the note above about why these must not drift apart.
 */
const GAP_REM = 1.5;

/**
 * Cards per half-track. Eight cards at this width clear ~2900px, so the row
 * stays full past any realistic viewport.
 */
const MIN_CARDS = 8;

const DURATION: Record<"fast" | "normal" | "slow", string> = {
  fast: "40s",
  normal: "70s",
  slow: "100s",
};

const TONE: Record<
  Tone,
  {
    card: string;
    border: string;
    glyph: string;
    quote: string;
    author: string;
    role: string;
    rule: string;
  }
> = {
  light: {
    card: "bg-white text-charcoal",
    border: "border-emerald/10 hover:border-gold/45",
    glyph: "text-gold/55",
    quote: "text-emerald",
    author: "text-emerald",
    role: "text-charcoal/50",
    rule: "border-emerald/10",
  },
  dark: {
    // The card has to lift off the emerald without becoming a grey box on a
    // brand-coloured ground. A ~7% cream wash carries that on its own at small
    // sizes, but across a card this wide it needs the gold hairline to hold an
    // edge — at 4% and a cream-tinted border the cards read as smudges rather
    // than as panels.
    card: "bg-cream/[0.07] text-cream",
    border: "border-gold/20 hover:border-gold/55",
    glyph: "text-gold/50",
    quote: "text-cream",
    author: "text-cream",
    role: "text-gold-soft/75",
    rule: "border-gold/20",
  },
};

interface InfiniteMovingCardsProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  tone?: Tone;
  className?: string;
}

export default function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  tone = "dark",
  className,
}: InfiniteMovingCardsProps) {
  const ink = TONE[tone];

  if (items.length === 0) return null;

  // Repeat short lists so half a track still overflows the viewport.
  const sequence = Array.from(
    { length: Math.ceil(MIN_CARDS / items.length) },
    () => items
  ).flat();

  const card = (item: Testimonial, key: string, cloned: boolean) => (
    <li
      key={key}
      aria-hidden={cloned || undefined}
      className="flex w-[clamp(17rem,74vw,23rem)] shrink-0"
    >
      <SpotlightCard
        surface={ink.card}
        border={ink.border}
        className="ease-editorial flex w-full flex-col p-8 transition-transform duration-500 hover:-translate-y-1.5 md:p-9"
      >
        <div className="flex min-h-56 flex-col gap-5">
          {/* Opening quote as a graphic, not punctuation on the copy. */}
          <span
            aria-hidden
            className={cn(
              "font-serif text-6xl leading-[0.5] select-none",
              ink.glyph
            )}
          >
            &ldquo;
          </span>

          <p
            className={cn(
              "m-0 font-serif text-[1.05rem] leading-[1.7] italic md:text-[1.15rem]",
              ink.quote
            )}
          >
            {item.quote}
          </p>

          <div
            className={cn(
              "mt-auto flex items-end justify-between gap-4 border-t pt-5",
              ink.rule
            )}
          >
            <span className="flex flex-col gap-1.5">
              <span className={cn("font-serif text-base", ink.author)}>
                {item.author}
              </span>
              <span
                className={cn(
                  "font-label text-[11px] tracking-[0.16em] uppercase",
                  ink.role
                )}
              >
                {item.role}
              </span>
            </span>
            {/* Phoenix as the signature on each quote. */}
            <Mark
              size={20}
              className="shrink-0 opacity-40 transition-opacity duration-500 group-hover:opacity-90"
            />
          </div>
        </div>
      </SpotlightCard>
    </li>
  );

  return (
    <div
      // The mask belongs on this element: it fades the cards away at both ends
      // so they enter and leave the row instead of being clipped by a hard edge.
      className={cn(
        "group/row relative overflow-hidden",
        "mask-[linear-gradient(to_right,transparent,white_6%,white_94%,transparent)]",
        className
      )}
      style={
        {
          "--marquee-gap": `${GAP_REM}rem`,
          "--animation-duration": DURATION[speed],
          "--animation-direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties
      }
    >
      <ul
        className={cn(
          "animate-scroll flex w-max list-none flex-nowrap items-stretch p-0",
          // Padding keeps the hover lift from being clipped by overflow-hidden.
          "py-3",
          pauseOnHover && "group-hover/row:[animation-play-state:paused]"
        )}
        style={{ gap: `${GAP_REM}rem` }}
      >
        {sequence.map((item, i) => card(item, `a-${i}-${item.id}`, false))}
        {sequence.map((item, i) => card(item, `b-${i}-${item.id}`, true))}
      </ul>
    </div>
  );
}
