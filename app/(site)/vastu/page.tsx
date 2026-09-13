import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import Profile from "@/components/sections/Profile";
import {
  Ornament,
  PageContainer,
  Reveal,
  SheetTexture,
  SmoothLink,
} from "@/components/ui";
import { SITE } from "@/constants";
import { getSiteImages } from "@/sanity/lib/content";

export const metadata: Metadata = {
  title: "Vastu",
  description: `Vastu-guided planning at ${SITE.name}, led by Dr. Vimmi Kinha — orientation, balance and harmony settled at concept stage rather than corrected afterwards.`,
};

/**
 * /vastu — the discipline, through the person who leads it.
 *
 * ── Why Vastu gets a page and the other disciplines do not ───────────────
 *
 * Four of the six services on the home page's track are things the studio
 * DOES, and a card plus a paragraph is the right size for each of them. Two
 * are led by a named person, and a name on a card raises a question a card
 * cannot answer: Architectural Photography sends you to Postcard of Life,
 * which is Ar. Divyank Sirohi's own practice, and this is the other one. The
 * Vastu card names Dr. Vimmi Kinha and had nowhere to send anyone.
 *
 * It is also the discipline a visitor is most likely to arrive at cold — Vastu
 * is either something they already believe in or something they have heard of
 * and are unsure about — so it is the one that benefits most from more than
 * three lines.
 *
 * ── It is deliberately the SAME shape as /about ──────────────────────────
 *
 * An opening, then <Profile />, then <Contact />. The founder's page is the
 * site's other introduction to a person, and the two share a component rather
 * than a resemblance — see components/sections/Profile.tsx for why that is
 * enforced in code instead of maintained by eye.
 *
 * What it does NOT take from /about is <StatsStrip />. Those figures are the
 * practice's — years, projects, area — and reprinting them under a specialist
 * who leads one discipline would read as a claim about her work.
 *
 * ── The copy here is DRAFTED, and the line between the two kinds matters ──
 *
 * One sentence in the biography is the studio's own, carried over verbatim
 * from the Vastu card in constants/content.ts: that Dr. Vimmi Kinha leads
 * Vastu-guided planning and brings experience and insight into the
 * orientation, balance and harmony of spaces. It is also the ONLY thing the
 * studio has supplied about her.
 *
 * Everything around it is written copy about the discipline and how the
 * practice approaches it. No credential, qualification, institution, figure or
 * date has been invented to fill the page out, and there is no pull quote —
 * <Profile /> takes one and this page does not pass it, because a quotation is
 * either something she said or it is words put in her mouth. All of it should
 * go past her before launch.
 */
export default async function VastuPage() {
  const siteImages = await getSiteImages();

  return (
    <>
      <Navbar />

      <main>
        {/* ── The opening ─────────────────────────────────────────────────
            `pt-36`/`md:pt-44` clears the fixed masthead — this page has no hero
            for the bar to sit over, the same measurement /about and /faq make.

            One column, no plate. /about carries a photograph beside its
            opening because its heading is held to an 18-character measure and
            left most of a 1440 screen empty. This heading is shorter and the
            copy below it runs wider, so the column fills its own space; a
            decorative interior shot here would also be the second image on a
            page whose first real one is a portrait that has not been taken
            yet. */}
        <section className="relative overflow-hidden bg-paper pt-36 pb-16 text-charcoal md:pt-44 md:pb-20">
          <SheetTexture />
          <Ornament placement="bottom-right" size="sm" className="opacity-50" />

          <PageContainer className="relative z-10">
            <Reveal>
              {/* Back to the track this page is reached from. The same gesture
                  and the same target size as the project pages' "← Selected
                  Works" — `-my-1.5 py-1.5` grows a 12px label's hit area to
                  26px without moving the label. */}
              <SmoothLink
                href="/services"
                className="-my-1.5 inline-block py-1.5 font-label text-gold-ink transition-colors duration-300 hover:text-emerald"
              >
                {"← What we do"}
              </SmoothLink>

              <span className="mt-7 block font-label text-gold-ink">
                04 &mdash; Vastu
              </span>
              {/* The page's h1, hand-set rather than from <SectionHeading />,
                  which hard-codes `as="h2"` because it is built for sections of
                  a page that already has an h1. <Profile /> below keeps its h2,
                  so the outline reads "Vastu → Dr. Vimmi Kinha". */}
              <h1 className="mt-5 max-w-[15ch] font-serif text-[2.6rem] leading-[1.04] tracking-tight text-emerald md:text-[3.6rem] lg:text-[4.25rem]">
                Vastu, from the first line
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 grid max-w-[62ch] gap-5 text-charcoal/75">
                <p className="text-[1.0625rem] leading-[1.6]">
                  Vastu here is planning, not correction. It belongs to the
                  first conversation about a site &mdash; where the sun arrives,
                  which way the ground falls, where an entrance wants to be
                  &mdash; so that orientation and proportion are settled while
                  they are still lines on paper and cost nothing to move.
                </p>
                <p>
                  It is led by{" "}
                  <strong className="font-normal text-emerald">
                    Dr. Vimmi Kinha
                  </strong>
                  , who works alongside the architects rather than after them,
                  so that a plan can answer to the site and to the people who
                  will live in it at the same time.
                </p>
              </div>
            </Reveal>
          </PageContainer>
        </section>

        {/* The same introduction the founder gets, because it is the same kind
            of thing — see the note at the top of this file. No `quote`: see
            the note there too. */}
        <Profile
          id="vastu-lead"
          eyebrow="Vastu"
          name="Dr. Vimmi Kinha"
          role={<>PhD &middot; Vastu Consultant, {SITE.name}</>}
          standfirst="Orientation, balance and harmony — decided while they are still drawings."
          portrait={siteImages.vastuPortrait}
          caption={{ left: `${SITE.name}, Gurugram`, right: "Vastu" }}
        >
          {/* The studio's own sentence, verbatim from the Vastu card. */}
          <p>
            <strong className="font-normal text-emerald">
              Dr. Vimmi Kinha
            </strong>{" "}
            leads Vastu-guided planning at {SITE.name}, bringing experience and
            insight into the orientation, balance and harmony of spaces.
          </p>
          <p>
            Her work begins with the site rather than with the plan: its aspect
            and slope, the direction light and weather arrive from, and what is
            already standing around it. Those readings reach the design team as
            constraints at concept stage &mdash; the point at which they can
            still shape a building rather than comment on one that is already
            drawn.
          </p>
          <p>
            From there it is read against how a household actually runs. Where
            the day begins, which rooms carry the routine of a family, how rest
            and work should sit in relation to one another. A plan arrived at
            this way satisfies Vastu without announcing it, because the
            decisions were made early enough to be structural rather than
            applied.
          </p>
          <p>
            The same reading holds for a workplace or a hospitality floor plate
            as for a residence &mdash; the questions change, the method does
            not. It is the conviction the rest of the practice works by:{" "}
            <strong className="font-normal text-gold-ink">
              a decision made early, for a reason, is worth more than a
              correction made late.
            </strong>{" "}
            Approached this way Vastu is not a constraint on the architecture.
            It is part of how the architecture is arrived at.
          </p>
        </Profile>

        <Contact backdrop={siteImages.contactBackdrop} />
      </main>
    </>
  );
}
