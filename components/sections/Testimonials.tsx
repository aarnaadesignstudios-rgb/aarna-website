/**
 * Testimonials — two infinite, auto-scrolling bands of quote cards on a white
 * ground, pausing on hover. Full-bleed so the tracks run edge to edge with
 * faded margins.
 *
 * The two bands are deliberately ASYMMETRICAL to each other — they differ on
 * every axis so the pair never reads as one mirrored block:
 *
 *   band      direction   speed   card size
 *   upper     left        60s     large
 *   lower     right       40s     small
 *
 * Every card carries the same restrained treatment (cream surface, emerald
 * hairline, emerald serif copy, short gold rule). The brand green is ink rather
 * than fill: alternating light and dark cards read as a harsh checkerboard on
 * white, which is the opposite of the quiet the rest of the page holds.
 */
import { PageContainer, SectionHeading, InfiniteMovingCards } from "@/components/ui";
import { TESTIMONIALS } from "@/constants";

// Split into two bands. Each half must stay even-length — see TESTIMONIALS.
const SPLIT = Math.ceil(TESTIMONIALS.length / 2);
const UPPER_BAND = TESTIMONIALS.slice(0, SPLIT);
const LOWER_BAND = TESTIMONIALS.slice(SPLIT);

export default function Testimonials() {
  return (
    <section className="overflow-hidden bg-white py-24 text-charcoal md:py-32 lg:py-40">
      <PageContainer>
        <SectionHeading
          index="04"
          eyebrow="Testimonials"
          title="In their words"
          className="max-w-2xl"
        />
      </PageContainer>

      {/* Full-bleed moving tracks. */}
      <div className="mt-16 flex flex-col gap-5 md:gap-6">
        <InfiniteMovingCards
          items={UPPER_BAND}
          direction="left"
          speed="normal"
          size="lg"
        />
        <InfiniteMovingCards
          items={LOWER_BAND}
          direction="right"
          speed="fast"
          size="sm"
        />
      </div>
    </section>
  );
}
