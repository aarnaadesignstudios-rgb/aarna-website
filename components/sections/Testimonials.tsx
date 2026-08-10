/**
 * Testimonials — the client wall.
 *
 * A full section with its own sheet number: client proof earns a place in the
 * document's index rather than being a decorative ticker between two sections.
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
 * ── Changed in the client review ──────────────────────────────────────────
 *
 *  - New standfirst copy, in the studio's own words.
 *  - Vertical padding cut hard, from py-24/32/40 to py-14/16/20. The note was
 *    that the band had too much empty space above and below and needed to be
 *    balanced against its own content: at 160px top and bottom, a single row
 *    of cards was a thin strip floating in a very tall green box. The section
 *    is now sized to what is in it.
 *
 * Server component — <InfiniteMovingCards /> owns the only client behaviour.
 */
import {
  InfiniteMovingCards,
  PageContainer,
  SectionHeading,
} from "@/components/ui";
import { TESTIMONIALS } from "@/constants";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our clients say"
      /* Dark band — see the note in components/layout/Navbar.tsx. */
      data-chrome="dark"
      className="surface-emerald overflow-hidden border-y border-gold/15 py-14 text-cream md:py-16 lg:py-20"
    >
      <PageContainer>
        <SectionHeading
          index="03"
          eyebrow="Testimonials"
          title="In their words"
          description={
            <>
              We design for the moment of handover, but also for everything
              that comes after.
              <span className="mt-3 block italic text-cream/60">
                These are the people who live, work and gather in our spaces.
              </span>
            </>
          }
          meta={`${TESTIMONIALS.length} clients`}
          tone="dark"
          className="max-w-full"
        />
      </PageContainer>

      {/* Full-bleed on purpose: the row should run off both edges of the page
          so the wall feels continuous rather than boxed into the container. */}
      <div className="mt-10 md:mt-12">
        <InfiniteMovingCards
          items={TESTIMONIALS}
          direction="left"
          speed="normal"
        />
      </div>
    </section>
  );
}
