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

export default function Process() {
  const listRef = useReveal<HTMLOListElement>({ stagger: 0.12 });

  return (
    <section id="process" className="bg-cream py-24 text-charcoal md:py-32 lg:py-40">
      <PageContainer>
        <SectionHeading
          index="04"
          eyebrow="Process"
          title="How we work"
          meta="Four stages"
          className="max-w-full"
        />

        {/* Minimal timeline. The top rule is the placeholder for the future
            progressively-drawn connecting line. */}
        <ol
          ref={listRef}
          className="mt-16 grid grid-cols-1 gap-y-12 border-t border-emerald/12 pt-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {PROCESS_STEPS.map((step) => (
            <li key={step.id} data-reveal className="flex flex-col gap-4">
              <span className="font-serif text-5xl font-light text-gold md:text-6xl">
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
