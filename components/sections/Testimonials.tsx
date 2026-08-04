/**
 * Testimonials — one full-bleed line of client quotes, and nothing else.
 *
 * This used to be a numbered section: a "04 — Testimonials / In their words"
 * heading block stacked above the moving ribbon, inside 24-40 units of vertical
 * padding. That made it two bands of content for one idea, and the heading
 * announced quotes that already announce themselves.
 *
 * Now it is a single premium ribbon — a deep emerald plinth between the two
 * cream sections either side of it, in the same `surface-emerald` +
 * `border-gold/15` language as <Achievements /> and <Founder />, so it reads as
 * a considered divider carrying proof rather than as a section that got cut
 * short. Because it no longer takes an index, the page's sheet numbering closes
 * up behind it (see the 01…07 run across the other sections).
 *
 * Server component — the ribbon itself owns the only client behaviour.
 */
import { InfiniteMovingCards } from "@/components/ui";
import { TESTIMONIALS } from "@/constants";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our clients say"
      className="overflow-hidden"
    >
      <InfiniteMovingCards items={TESTIMONIALS} tone="dark" speed="slow" />
    </section>
  );
}
