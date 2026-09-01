"use client";

/**
 * Process — four-step minimal timeline.
 *
 * Large typography, a hairline timeline, generous spacing. The container uses
 * `useReveal` to stagger the steps in on scroll.
 *
 * TODO (future phases):
 *  - Draw the connecting line progressively as the user scrolls (ScrollTrigger
 *    scrub on a scaleY / DrawSVG line).
 *  - Highlight the active step as it reaches the viewport centre.
 */
import { Ornament, PageContainer, SectionHeading, SheetTexture } from "@/components/ui";
import { PROCESS_STEPS } from "@/constants";
import { useReveal } from "@/hooks";
import { cn } from "@/utils/cn";

/**
 * ── The join between two stages, drawn ────────────────────────────────────
 *
 * A hairline that fades out at both ends with a gold lozenge on it, sat in the
 * middle of the gap between two stages. Phones only — see where it is used.
 *
 * It is deliberately the same three marks the rest of the site draws with: the
 * hairline is the <SectionHeading /> eyebrow's rule and the <Spine />'s rail,
 * and the lozenge is the Spine's own node turned 45°. Inventing a new
 * separator here would have been the easy thing and would have read as a
 * component from somewhere else.
 *
 * It fades rather than stopping square because a full-width rule between two
 * CENTRED blocks reads as a table row divider — it cuts the column into cells.
 * Fading it out means the eye takes it as a thread the stages are strung on,
 * which is what the four vertical rules do on the desktop layout.
 */
function StageJoin() {
  return (
    <span
      aria-hidden
      /* Centred in the 56px gap `gap-y-14` opens above this stage. Absolute,
         so it occupies none of the flow — a separator in the flow would push
         the stages apart by its own height and the gap would stop being the
         56px the grid says it is. */
      className="absolute -top-7 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:hidden"
    >
      <span className="h-px w-[30%] bg-gradient-to-r from-transparent to-gold/45" />
      {/* `rotate-45` on a square: a lozenge, which is the mark the spine uses
          for a station. 6px so it reads at arm's length without becoming a
          bullet. */}
      <span className="mx-3 size-1.5 rotate-45 bg-gold/80" />
      <span className="h-px w-[30%] bg-gradient-to-l from-transparent to-gold/45" />
    </span>
  );
}

export default function Process() {
  const listRef = useReveal<HTMLOListElement>({ stagger: 0.12 });

  return (
    /* Padding cut from py-24/32/40. The four stages occupied the upper third
       of the section and the rest was empty cream, which is what made the
       spacing read as uneven in the first place. */
    /* Step four of the arc — see the note on `.surface-moss` in globals.css.
       Flat rather than graded, and that is deliberate: <Testimonials /> above
       closes on `sage-deep` and <Services /> below opens on it, so a flat
       `sage-deep` here joins them with no boundary at either end. The gradient
       work is done by the neighbours. */
    <section
      id="process"
      data-chrome="dark"
      className="relative bg-emerald py-20 text-cream md:py-24 lg:py-28"
    >
      <SheetTexture />

      {/* ── One vine, phones only ───────────────────────────────────────────
          <SheetTexture /> above is `hidden lg:block` on purpose: its vines are
          `size="lg"`/`md` and hang off the page edge into a gutter, and a phone
          has no gutter — measured at 390px the large one covers most of the
          text column and runs through the copy.

          The flourish is still worth having on a phone; it just has to be a
          different size. `sm` at 390×844 draws ~152px wide and is pushed 44% of
          that out of frame, so ~85px of vine sits against the edge — outside
          the `max-w-[30ch]` measure the paragraphs are held to, which is what
          keeps it in the margin rather than behind the words. At 30% it is
          texture, not an illustration.

          Top-right rather than either bottom corner: the bottom of this section
          is the last stage's paragraph, and the top is the deep padding above
          the eyebrow, where there is nothing for it to interfere with. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30 lg:hidden"
      >
        <Ornament placement="top-right" tone="soft" size="sm" />
      </div>

      {/* `relative z-10`: <SheetTexture /> is absolutely positioned, so a
          static sibling after it would paint UNDERNEATH it. */}
      <PageContainer className="relative z-10">
        {/* Centred on request. `align="center"` centres the eyebrow row and
            the title; the lead measure below is centred by the same switch. */}
        <SectionHeading
          eyebrow="Process"
          title="How we work"
          align="center"
          tone="dark"
          className="max-w-full"
        />

        {/* ── Equal spread, centred ─────────────────────────────────────────
            The client asked for proper equal spacing between all four points,
            equally spread on the sheet, and then for the whole section to be
            centred and balanced.

            The columns were always equal-width (grid-cols-4), so the geometry
            was never the problem — what was missing was any way to SEE it.
            Four blocks of ragged left-aligned text on an empty field read as
            arbitrarily placed no matter how the grid is defined.

            So each stage is now a centred bay: its content centred on the
            column's own axis, the copy held to a measure so the four blocks
            are the same width rather than as wide as their longest sentence,
            and a hairline drawn between them. Four identical bays, evenly
            divided, symmetrical about the page's centre line.

            `divide-*` is deliberately not used — it cannot be varied per
            breakpoint, and at sm the layout is 2×2, where a rule on the third
            item would land in the wrong place. */}
        {/* ── The opening rule, and the lozenge on it ──────────────────────
            The rule was already here. The lozenge is new and is phones-only:
            at `sm` and above the stages are divided by the vertical borders
            below, so the eye has structure to read either way, and a mark on
            the top rule as well would be a third thing saying the same. Below
            `sm` this is the mark that starts the thread the <StageJoin />s
            continue. */}
        <div className="relative mt-14 border-t border-cream/20">
          <span
            aria-hidden
            className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/80 sm:hidden"
          />
        </div>

        <ol
          ref={listRef}
          className="mx-auto grid list-none grid-cols-1 gap-y-14 p-0 pt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0"
        >
          {PROCESS_STEPS.map((step, i) => (
            <li
              key={step.id}
              data-reveal
              className={cn(
                // `relative`: <StageJoin /> hangs off this box into the gap
                // above it.
                "relative flex flex-col items-center gap-4 border-cream/20 px-4 text-center sm:px-8",
                // 2-up: a rule before the right-hand column of each row.
                i % 2 === 1 && "sm:border-l",
                // 4-up: one continuous set of verticals. The first column
                // keeps its padding here (unlike the left-aligned version),
                // because the bays are centred and stripping it would shift
                // that column's axis off the grid.
                i === 0 ? "lg:border-l-0" : "lg:border-l"
              )}
            >
              {/* ── Below `sm`, the stages are a column with nothing between
                  them ────────────────────────────────────────────────────
                  The vertical rules above are the whole reason the desktop
                  layout reads as four deliberate bays rather than four
                  paragraphs that happen to be near each other — and they are
                  `sm:` and `lg:` only, so a phone got none of them. Four
                  centred blocks of type on an empty green field, which is
                  exactly the "everything looks very simple" note.

                  A stacked layout cannot use a vertical rule for the same job:
                  the division it needs to draw is between things above and
                  below each other, not left and right. So the same rule is
                  turned through 90° and put in the gap. */}
              {i > 0 && <StageJoin />}

              <span className="font-serif text-5xl leading-none text-gold md:text-6xl">
                {step.step}
              </span>
              <h3 className="font-serif text-2xl text-cream md:text-3xl">
                {step.title}
              </h3>
              {/* Held to a measure, and centred within it. Without the cap the
                  four paragraphs are four different widths and the row stops
                  looking evenly divided however equal the columns are. */}
              <p className="mx-auto max-w-[30ch] text-cream/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* ── The closing rule ─────────────────────────────────────────────
            Phones only, and the counterpart to the lozenge on the opening rule
            above: without it the thread the joins draw simply stops after the
            fourth stage, and the section trails off into the padding instead of
            ending. The desktop layout does not need one — its four verticals
            are bounded by the top rule and by the columns themselves.

            The mark alone, with no rule through it, because a second full
            hairline here would read as the start of something rather than the
            end of this. */}
        <div className="relative mt-14 sm:hidden">
          <span
            aria-hidden
            className="mx-auto block size-1.5 rotate-45 bg-gold/50"
          />
        </div>
      </PageContainer>
    </section>
  );
}
