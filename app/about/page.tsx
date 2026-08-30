import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import Founder from "@/components/sections/Founder";
import StatsStrip from "@/components/sections/StatsStrip";
import {
  Media,
  Ornament,
  PageContainer,
  Reveal,
  SheetTexture,
} from "@/components/ui";
import { SITE } from "@/constants";

/**
 * ── The opening plate ─────────────────────────────────────────────────────
 *
 * A STOCK photograph, and the same kind of placeholder the Services cards and
 * the /photography grid already carry — see the inventory in
 * public/images/README.md. It is here because the opening ran as a single
 * left-hand column: the heading is held to an 18-character measure and the copy
 * to 62 characters, which on a 1440 screen left roughly 700×480 of empty paper
 * to the right of both, with only a vine in it.
 *
 * ── Why this frame ───────────────────────────────────────────────────────
 * It was chosen on PALETTE rather than on subject. Emerald upholstery, brass
 * legs, cream walls and warm oak is, near enough exactly, `--color-emerald`,
 * `--color-gold` and `--color-cream` — so it sits on the paper ground as though
 * it belongs to the brand instead of as a rectangle of someone else's colours.
 * Every other candidate that read as "luxury interior" brought a competing
 * accent with it (a yellow chair, a blue pool, a cool grey room), and one
 * off-palette accent beside the studio's own green is what makes a page look
 * assembled from a stock library.
 *
 * Unsplash's licence covers commercial use with no attribution required, and
 * `images.unsplash.com` is already allow-listed in next.config.ts.
 *
 * ── It is deliberately UNCAPTIONED ───────────────────────────────────────
 * A captioned image on a studio's About page reads as a claim of authorship,
 * and this is not the studio's work. It is set as mood — `alt=""`, no credit
 * line, no project name — and it should be replaced by the practice's own
 * photography before launch, at which point it can earn a caption.
 */
const ABOUT_PLATE =
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80";

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
 * ── Four parts, in the order the question gets asked ──────────────────────
 *
 *   1. AN OPENING. A typographic frame rather than a photograph — the same
 *      choice /faq makes, and for the same reason: there is no landscape image
 *      that belongs at the top of this page. The portrait is a 4:5 crop of one
 *      person and it reads as a portrait, not as a hero; blown across a
 *      viewport it would be a poster of the founder rather than an
 *      introduction to a practice. It keeps its frame in <Founder /> below,
 *      where the parallax and the veil were built for it.
 *   2. THE FIGURES, on the emerald band the home page opens with. Same
 *      component, so the two cannot drift — <StatsStrip />.
 *   3. <Founder />. Untouched. Portrait, credentials, the philosophy, the
 *      quote in her own words.
 *   4. <Contact />. Every page on this site ends here — the home page's
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
            {/* ── Two columns, and only at `lg` ──────────────────────────────
                Below that this is one column exactly as it was: the plate is
                `hidden lg:block`, so a phone and a tablet get the same single
                stack of type they got before, with no image to download and no
                extra scrolling. The grid template only exists at `lg` too, so
                there is nothing for the smaller widths to lay out around.

                `items-center` rather than `items-start`: the type block is
                shorter than the plate, and ranging both to the top leaves the
                heading floating with a tall photograph beside it. Centred, the
                two read as one spread.

                `0.85fr` for the plate, not `1fr` — the heading and the copy are
                the subject of this section and the photograph is accompaniment,
                so it takes slightly less than half. */}
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-16 xl:gap-20">
              <div>
                <Reveal>
                  <span className="block font-label text-gold-ink">
                    01 &mdash; About the studio
                  </span>
                  {/* Hand-set rather than <SectionHeading />, for the h1 — see the
                      note on heading levels above. The measure is held at 18
                      characters so the line breaks fall where they are wanted at
                      every width rather than wherever the box happens to end. */}
                  {/* Brand green, the same ink every other chapter title on a
                      paper ground takes — see the note in
                      components/ui/SectionHeading.tsx. Hand-set rather than coming
                      from that component (this one carries the page's h1), so the
                      colour has to be repeated here. */}
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
              </div>

              {/* ── The plate (desktop only) ──────────────────────────────
                  `hidden lg:block` is the whole responsive story: below `lg`
                  the element has no layout box, so the browser never fetches
                  the photograph either — a phone pays nothing for it.

                  4:3, not a portrait crop. The frame is a wide room shot; taking
                  it to 4:5 cuts the table and the chairs that carry the colour,
                  which are the reason this image is here at all. At 4:3 in a
                  ~530px column it stands ~400px tall, which is almost exactly
                  the height of the type beside it.

                  `bg-stone` under it for the moment before it decodes, and the
                  emerald-tinted shadow the project cards use — a neutral shadow
                  on a warm paper ground reads as dirt. See the note on
                  `--color-ink` in styles/globals.css. */}
              <Reveal delay={0.15} className="hidden lg:block">
                <figure className="relative m-0 aspect-4/3 w-full overflow-hidden rounded-2xl border border-emerald/10 bg-stone shadow-[0_30px_60px_-32px_color-mix(in_srgb,var(--color-emerald)_45%,transparent)]">
                  <Media
                    src={ABOUT_PLATE}
                    /* Empty, and deliberately: this is decoration, not
                       information — there is nothing here a screen reader
                       needs that the copy beside it does not already say. */
                    alt=""
                    sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 44vw, 100vw"
                  />
                </figure>
              </Reveal>
            </div>
          </PageContainer>
        </section>

        {/* ── The figures, on the brand ────────────────────────────────────
            The same band the home page opens with, and the same component —
            see components/sections/StatsStrip.tsx.

            It was a hairline-ruled row on the paper of the section above, which
            was correct and quiet and gave this page no green in it at all until
            <Contact /> arrived three screens later. The band fixes that and
            fixes the alternation with it: paper, emerald, paper, emerald, so
            every boundary on the page is a hard edge between two flat colours.

            It sits BETWEEN the sections rather than inside the opening, because
            it bleeds to both page edges and the section above holds its content
            to the container's measure. */}
        <StatsStrip />

        <Founder />

        <Contact />
      </main>
    </>
  );
}
