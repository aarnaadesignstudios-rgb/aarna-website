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
import { PageContainer, SectionHeading } from "@/components/ui";
import { PROCESS_STEPS } from "@/constants";
import { useReveal } from "@/hooks";
import { cn } from "@/utils/cn";

export default function Process() {
  const listRef = useReveal<HTMLOListElement>({ stagger: 0.12 });

  return (
    /* Padding cut from py-24/32/40. The four stages occupied the upper third
       of the section and the rest was empty cream, which is what made the
       spacing read as uneven in the first place. */
    <section id="process" className="bg-cream py-20 text-charcoal md:py-24 lg:py-28">
      <PageContainer>
        {/* Centred on request. `align="center"` centres the eyebrow row and
            the title; the lead measure below is centred by the same switch. */}
        <SectionHeading
          index="04"
          eyebrow="Process"
          title="How we work"
          align="center"
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
        <ol
          ref={listRef}
          className="mx-auto mt-14 grid list-none grid-cols-1 gap-y-14 border-t border-emerald/15 p-0 pt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0"
        >
          {PROCESS_STEPS.map((step, i) => (
            <li
              key={step.id}
              data-reveal
              className={cn(
                "flex flex-col items-center gap-4 border-emerald/15 px-4 text-center sm:px-8",
                // 2-up: a rule before the right-hand column of each row.
                i % 2 === 1 && "sm:border-l",
                // 4-up: one continuous set of verticals. The first column
                // keeps its padding here (unlike the left-aligned version),
                // because the bays are centred and stripping it would shift
                // that column's axis off the grid.
                i === 0 ? "lg:border-l-0" : "lg:border-l"
              )}
            >
              <span className="font-serif text-5xl leading-none text-gold md:text-6xl">
                {step.step}
              </span>
              <h3 className="font-serif text-2xl text-emerald md:text-3xl">
                {step.title}
              </h3>
              {/* Held to a measure, and centred within it. Without the cap the
                  four paragraphs are four different widths and the row stops
                  looking evenly divided however equal the columns are. */}
              <p className="mx-auto max-w-[30ch] text-charcoal/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
