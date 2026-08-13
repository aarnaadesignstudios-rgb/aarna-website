/**
 * Testimonials — the client wall.
 *
 * A full section with its own sheet number: client proof earns a place in the
 * document's index rather than being a decorative ticker between two sections.
 *
 * ── The dark plinth is gone ───────────────────────────────────────────────
 *
 * This used to argue that its emerald ground was "doing real work": both
 * neighbours are light, so a dark band in the middle of the page read as a
 * plinth. On its own that was true. On the page it was not — <Founder /> made
 * exactly the same argument two sections later, the figures strip made it a
 * third time, and the result was a page that changed ground four times on the
 * way down and looked assembled from two different sites.
 *
 * So the plinth stays and its value does not. `surface-sage` is the brand
 * emerald at 5% into cream: still recognisably the green section, still
 * distinct from the cream above and below it, and now within 6% of their
 * value instead of 80% below them. The cards come with it — `tone="light"`
 * puts the quotes in emerald on white, which is the treatment every other
 * card on the site already uses.
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
  SheetTexture,
} from "@/components/ui";
import { TESTIMONIALS } from "@/constants";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our clients say"
      /* Flat paper, and no hairline at either end. The grounds alternate
         paper/emerald now, so every boundary on this page is a hard edge
         between two flat colours — there is nothing left for a border to
         clarify. See the note on the two grounds in styles/globals.css. */
      className="relative overflow-hidden bg-paper py-16 text-charcoal md:py-20 lg:py-24"
    >
      <SheetTexture />

      <PageContainer className="relative z-10">
        <SectionHeading
          index="03"
          eyebrow="Testimonials"
          title="In their words"
          description={
            <>
              We design for the moment of handover, but also for everything
              that comes after.
              <span className="mt-3 block italic text-charcoal/55">
                These are the people who live, work and gather in our spaces.
              </span>
            </>
          }
          meta={`${TESTIMONIALS.length} clients`}
          className="max-w-full"
        />
      </PageContainer>

      {/* Full-bleed on purpose: the row should run off both edges of the page
          so the wall feels continuous rather than boxed into the container. */}
      <div className="relative z-10 mt-10 md:mt-12">
        <InfiniteMovingCards
          items={TESTIMONIALS}
          direction="left"
          speed="normal"
          tone="light"
        />
      </div>
    </section>
  );
}
