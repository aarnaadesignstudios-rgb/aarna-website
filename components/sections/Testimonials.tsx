/**
 * Testimonials — the client wall.
 *
 * This was a single full-bleed ticker: one line of italic text sliding past
 * between two cream sections. The idea was that quotes announce themselves and
 * do not need a heading — but stripped of a heading, a number and any card to
 * sit in, they stopped reading as testimonials at all and started reading as a
 * decorative strip, indistinguishable from the brand-values marquee further
 * down the page.
 *
 * So it is a full section again, and it takes its sheet number back: the run is
 * 01…08 with this at 03. Client proof earns a place in the document's index.
 *
 * The emerald ground is doing real work here. Both neighbours (<SelectedWorks />
 * and <Process />) are light, so this lands as a dark plinth in the middle of
 * the page — the same treatment <Founder /> gets — and the gold-on-emerald
 * cards read as the brand rather than as a generic testimonial grid.
 *
 * One row, carrying all eight quotes. It was briefly two opposed rows, which
 * filled the section but asked the eye to track two things at once and made the
 * band feel like machinery. A single line is calmer and lets each card be read
 * as it passes — and with every quote in the one row, none is ever on screen
 * twice.
 *
 * Server component — <InfiniteMovingCards /> owns the only client behaviour.
 */
import { InfiniteMovingCards, PageContainer, SectionHeading } from "@/components/ui";
import { TESTIMONIALS } from "@/constants";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our clients say"
      className="surface-emerald overflow-hidden border-y border-gold/15 py-24 text-cream md:py-32 lg:py-40"
    >
      <PageContainer>
        <SectionHeading
          index="03"
          eyebrow="Testimonials"
          title="In their words"
          description="Houses and workplaces are lived in long after they are handed over. These are the people who live in ours."
          meta={`${TESTIMONIALS.length} clients`}
          tone="dark"
          className="max-w-full"
        />
      </PageContainer>

      {/* Full-bleed on purpose: the row should run off both edges of the page
          so the wall feels continuous rather than boxed into the container. */}
      <div className="mt-14 md:mt-20">
        <InfiniteMovingCards
          items={TESTIMONIALS}
          direction="left"
          speed="normal"
        />
      </div>
    </section>
  );
}
