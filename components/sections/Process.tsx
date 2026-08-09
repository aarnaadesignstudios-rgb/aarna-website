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
        <SectionHeading
          index="04"
          eyebrow="Process"
          title="How we work"
          meta="Four stages"
          className="max-w-full"
        />

        {/* ── Equal spread ──────────────────────────────────────────────────
            The client asked for proper equal spacing between all four points,
            equally spread on the sheet. The columns were already equal-width
            (grid-cols-4), so the geometry was right — what was missing was any
            way to SEE it. Four blocks of ragged text on an empty field read as
            arbitrarily placed no matter how the grid is defined.

            So the division is now drawn: each stage carries a hairline down its
            left edge and equal padding inside it, which turns the four columns
            into four visibly equal bays. `divide-*` is deliberately not used —
            it cannot be made responsive per breakpoint, and at md the layout is
            2×2, where a rule on the third item would sit in the wrong place. */}
        <ol
          ref={listRef}
          className="mt-14 grid list-none grid-cols-1 gap-y-12 border-t border-emerald/15 p-0 pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0"
        >
          {PROCESS_STEPS.map((step, i) => (
            <li
              key={step.id}
              data-reveal
              className={cn(
                "flex flex-col gap-4 border-emerald/15 sm:px-7 lg:px-8",
                // 2-up: a rule before the right-hand column of each row.
                i % 2 === 1 && "sm:border-l",
                // 4-up: one continuous set of verticals, first column flush
                // left so the row still aligns to the page's margin.
                i === 0 ? "lg:border-l-0 lg:pl-0" : "lg:border-l"
              )}
            >
              <span className="font-serif text-5xl leading-none font-light text-gold md:text-6xl">
                {step.step}
              </span>
              <h3 className="font-serif text-2xl font-light text-emerald md:text-3xl">
                {step.title}
              </h3>
              <p className="text-base leading-[1.75] text-charcoal/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
