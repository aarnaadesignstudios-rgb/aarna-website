import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import Founder from "@/components/sections/Founder";
import {
  Ornament,
  PageContainer,
  Reveal,
  SheetTexture,
} from "@/components/ui";
import { SITE, STATS } from "@/constants";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} is the practice of Ar. Annpurna Kinha — architecture, commercial interiors and bespoke spaces, designed around the people who use them.`,
};

/**
 * /about — the studio, through the person who runs it.
 *
 * ── Why this is a page and not the section it used to be ──────────────────
 *
 * <Founder /> was built for the home page and then commented out of it at the
 * studio's request, which left a finished portrait, biography and signed
 * philosophy rendering nowhere. The masthead's "About" pointed at #practice
 * instead — the studio's manifesto, which is about the WORK. So the one link a
 * visitor would follow to find out who they were about to hire took them to a
 * statement of intent, and the answer to their actual question was sitting
 * unused in the repository.
 *
 * This is that component given the page it was always the right size for, and
 * "About" now points here. #practice is untouched and still opens the home
 * page; it simply no longer has to stand in for a biography.
 *
 * ── Three parts, in the order the question gets asked ─────────────────────
 *
 *   1. AN OPENING. A typographic frame rather than a photograph — the same
 *      choice /faq makes, and for the same reason: there is no landscape image
 *      that belongs at the top of this page. The portrait is a 4:5 crop of one
 *      person and it reads as a portrait, not as a hero; blown across a
 *      viewport it would be a poster of the founder rather than an
 *      introduction to a practice. It keeps its frame in <Founder /> below,
 *      where the parallax and the veil were built for it.
 *   2. <Founder />. Untouched. Portrait, credentials, the philosophy, the
 *      quote in her own words.
 *   3. <Contact />. Every page on this site ends here — the home page's
 *      contact block is the site's footer in all but name (see the note in
 *      that component), so a page that ended anywhere else would need a second
 *      footer kept in sync with the first.
 *
 * The heading levels are worth stating because they are the one thing this
 * page does that no section can: the opening carries the page's <h1>, hand-set
 * rather than taken from <SectionHeading />, which hard-codes `as="h2"` because
 * it is built for sections of a page that already has an h1 above them. The
 * founder block below keeps its h2, so the outline reads
 * "About → Ar. Annpurna Kinha" rather than two competing h1s.
 */
export default function AboutPage() {
  /**
   * The figures, as the practice's own measure of itself.
   *
   * Read from the same `STATS` the home page's strip uses rather than retyped,
   * so a number the studio corrects in one place is corrected here too. Set as
   * a hairline-ruled row instead of the emerald band that carries them on the
   * home page: this page's opening is paper and a second dark strip inside it
   * would cut the page in half before the portrait ever arrived.
   */
  const figures = STATS.slice(0, 4);

  return (
    <>
      <Navbar />

      <main>
        {/* ── The opening ─────────────────────────────────────────────────
            `pt-36`/`md:pt-44` clears the fixed masthead. This page has no hero
            for the bar to sit over, so the space has to be made explicitly —
            the same measurement /faq makes. */}
        <section className="relative overflow-hidden bg-paper pt-36 pb-16 text-charcoal md:pt-44 md:pb-20">
          <SheetTexture />
          {/* A third vine, low on the right, where the figures row leaves the
              margin empty. `sm` and held back, because the two <SheetTexture />
              places are already doing the work and a third at full strength
              turns a margin into a border. */}
          <Ornament
            placement="bottom-right"
            size="sm"
            className="opacity-50"
          />

          <PageContainer className="relative z-10">
            <Reveal>
              <span className="block font-label text-gold-ink">
                01 &mdash; About the studio
              </span>
              {/* Hand-set rather than <SectionHeading />, for the h1 — see the
                  note on heading levels above. The measure is held at 18
                  characters so the line breaks fall where they are wanted at
                  every width rather than wherever the box happens to end. */}
              <h1 className="mt-5 max-w-[18ch] font-serif text-[2.6rem] leading-[1.04] tracking-tight text-emerald md:text-[3.6rem] lg:text-[4.25rem]">
                Designing conscious luxury
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 grid max-w-[62ch] gap-5 text-charcoal/75">
                <p className="text-[1.0625rem] leading-[1.6]">
                  {SITE.name} is a multidisciplinary practice working across
                  architecture, commercial interiors and bespoke residential
                  spaces &mdash; from concept and planning through to design
                  development and execution.
                </p>
                <p>
                  It is led by{" "}
                  <strong className="font-normal text-emerald">
                    Ar. Annpurna Kinha
                  </strong>
                  , whose work joins design thinking to a business
                  understanding of what a space has to do, and whose belief is
                  that every element in a room should be able to say why it is
                  there.
                </p>
              </div>
            </Reveal>

            {/* ── The figures ──────────────────────────────────────────────
                A hairline-ruled row rather than cards. Four columns on a
                shared top rule reads as a specification table, which is what
                these numbers are; boxing them would make them feel like
                marketing tiles on a page whose whole argument is restraint. */}
            <Reveal delay={0.16}>
              <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-9 border-t border-emerald/15 pt-9 md:mt-16 md:grid-cols-4 md:gap-x-10">
                {figures.map((stat) => (
                  <div key={stat.id} className="m-0">
                    <dt className="font-label text-charcoal/50">
                      {stat.label}
                    </dt>
                    <dd className="m-0 mt-2.5 font-serif text-[2rem] leading-none tracking-tight text-emerald md:text-[2.4rem]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </PageContainer>
        </section>

        <Founder />

        <Contact />
      </main>
    </>
  );
}
