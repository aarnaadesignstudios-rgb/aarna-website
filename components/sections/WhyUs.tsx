"use client";

/**
 * WhyUs — six value propositions in a bento grid.
 *
 * Asymmetric column spans create editorial rhythm; each card has a
 * cursor-follow gold spotlight (<SpotlightCard />) and an oversized index
 * watermark. The grid staggers in on scroll via the shared `useReveal` hook.
 *
 * This was briefly rebuilt as a flat hairline index, and restored on request —
 * the client prefers the cards. Kept here as-is rather than half-reworked, so
 * there is one clear thing to compare against if the question comes back.
 */
import { PageContainer, SectionHeading } from "@/components/ui";
import { BentoGrid, BentoGridItem } from "@/components/ui";
import { FEATURES } from "@/constants";
import { useReveal } from "@/hooks";

// Column spans that give the bento its asymmetric rhythm (3-col grid).
const SPANS = ["md:col-span-2", "", "", "md:col-span-2", "md:col-span-2", ""];

export default function WhyUs() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08 });

  return (
    <section
      id="why-us"
      className="bg-stone py-20 text-charcoal md:py-24 lg:py-28"
    >
      <PageContainer>
        <SectionHeading
          index="06"
          eyebrow="Why Us"
          title="Six reasons clients trust the studio"
          meta="Six principles"
          className="max-w-full"
        />

        <div ref={gridRef} className="mt-14 md:mt-16">
          <BentoGrid>
            {FEATURES.map((feature, i) => (
              <div key={feature.id} data-reveal className={SPANS[i]}>
                <BentoGridItem
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  index={String(i + 1).padStart(2, "0")}
                  className="h-full"
                />
              </div>
            ))}
          </BentoGrid>
        </div>
      </PageContainer>
    </section>
  );
}
