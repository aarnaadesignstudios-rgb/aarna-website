import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import Profile from "@/components/sections/Profile";
import { Button, PageContainer, SheetTexture, SmoothLink } from "@/components/ui";
import { SITE, SITE_IMAGES, VASTU_CONSULTATIONS } from "@/constants";
import { getSiteImages } from "@/sanity/lib/content";

export const metadata: Metadata = {
  title: "Dr. Vimmi Kinha — Astrology, Vastu & Colour Therapy",
  description: `Dr. Vimmi Kinha, Director — Astrology, Vastu & Colour Therapy at ${SITE.name}. 25+ years in Vastu Shastra and Astrology, integrating Vastu principles with contemporary architecture and interior design.`,
};

/**
 * /vastu — Dr. Vimmi Kinha.
 *
 * ── Why this page exists ─────────────────────────────────────────────────
 *
 * Four of the six services on the home page's track are things the studio
 * DOES, and a card plus a paragraph is the right size for each. Two are led by
 * a named person, and a name on a card raises a question a card cannot answer:
 * Architectural Photography sends you to Postcard of Life, which is Ar.
 * Divyank Sirohi's own practice, and this is the other one. The Vastu card
 * names Dr. Vimmi Kinha and had nowhere to send anyone.
 *
 * ── Every word here is the studio's ──────────────────────────────────────
 *
 * This page briefly opened with an introduction to the discipline that I had
 * drafted — an h1 and two paragraphs about how Vastu is practised here. It is
 * gone at the studio's instruction, and the reason is worth keeping: the copy
 * below arrived afterwards, written by them, and a page about a real person
 * should not carry invented framing in front of it. The only heading on the
 * page is now her name, and it is the h1 (see `nameAs`).
 *
 * The one line that is not verbatim is the standfirst, "Bridging traditional
 * Vastu wisdom with contemporary design" — their own final paragraph reshaped
 * into a phrase because a display line reading "Her philosophy is to…" does
 * not work at that size. The full sentence is still in the biography, so
 * nothing they wrote is lost or paraphrased away.
 *
 * There is no pull quote. <Profile /> takes one and this page does not pass
 * it: a quotation is either something she said or it is words put in her
 * mouth, and none has been supplied.
 *
 * ── The shape is /about's, deliberately ──────────────────────────────────
 *
 * <Profile /> is the same component the founder's introduction uses, so the
 * two cannot drift apart — see components/sections/Profile.tsx.
 *
 * What it does NOT take from /about is <StatsStrip />. Those figures are the
 * practice's — years, projects, area — and reprinting them under a specialist
 * who leads one discipline would read as a claim about her work.
 */
/**
 * ── The rate card under her portrait ─────────────────────────────────────
 *
 * Two sessions she is booked for directly, each with its fee and a WhatsApp
 * button. It hangs off <Profile />'s `underPortrait` slot, so it sits inside
 * the sticky left column and stays on screen for the whole biography — see the
 * note on that prop.
 *
 * ── The fee is above the button, not inside it ───────────────────────────
 *
 * The obvious build is one pill reading "Book Astrology Consultation —
 * ₹6,999". Two things rule it out. `font-label` is uppercase with 0.2em of
 * tracking, so that label sets about 40 characters wide and wraps inside its
 * own pill on a phone. And a fee inside a button is a fee that only exists at
 * the moment of committing — a visitor comparing two sessions is reading the
 * figures, and they should be able to do that without reading two buttons.
 *
 * So each row is a rate line (name, figure) with the control under it, which is
 * also the shape the Services track uses: a price set between the copy and the
 * link rather than folded into either.
 *
 * ── Why the button labels are not identical ──────────────────────────────
 *
 * Both buttons say "book a consultation", which is what was asked for, but each
 * names its own discipline. Two links reading exactly "Book a consultation" are
 * unambiguous on screen — the heading is right above each — and identical to a
 * screen reader listing the page's links out of context. Naming the session
 * costs one word and removes that.
 *
 * ── No className overrides on <Button /> ─────────────────────────────────
 *
 * `cn` is a plain joiner with no conflict resolution (see utils/cn.ts), so a
 * `px-6` passed here would not beat the base's `px-9` — both would ship and the
 * winner would be whichever Tailwind happens to emit last. `w-full` and `mt-*`
 * are safe because the base sets neither.
 */
function BookingRates() {
  return (
    <div className="mt-10 border-t border-emerald/15 pt-8">
      <p className="font-label text-gold-ink">Book a consultation</p>

      <div className="mt-6 grid gap-7">
        {VASTU_CONSULTATIONS.map((session) => (
          <div key={session.id}>
            {/* `items-baseline`, so the serif name and the lining figure sit on
                one line regardless of their different sizes. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-serif text-[1.35rem] leading-tight text-emerald">
                {session.title}
              </span>
              {/* `type-figure` for the reason the Services card states:
                  Cormorant defaults to old-style figures, so "₹6,999" would
                  set as a wobbling line of numerals without it. */}
              <span className="type-figure text-[1.05rem] leading-none text-emerald">
                {session.price}
              </span>
            </div>

            <Button
              href={session.href}
              /* wa.me is off-site, so it opens in a new tab and carries the
                 same rel pair every other external link here does. */
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full"
            >
              Book {session.title}
            </Button>

            {session.note && (
              <p className="mt-2.5 text-[0.82rem] leading-normal text-charcoal/65">
                {session.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function VastuPage() {
  const siteImages = await getSiteImages();

  return (
    <>
      <Navbar />

      <main>
        {/* ── The way back ────────────────────────────────────────────────
            A band whose only job is the link and the masthead clearance —
            `pt-36`/`md:pt-44`, the same measurement /about and /faq make for a
            page with no hero for the bar to sit over.

            It carries no heading. With the drafted opening gone, the first
            thing on this page is her, and a second title above her name would
            put the page's subject in the wrong place. <Profile /> below takes
            `padTop` so it sits directly under this rather than adding the gap
            it would need after a real section. */}
        <section className="relative bg-paper pt-36 text-charcoal md:pt-44">
          <SheetTexture />
          <PageContainer className="relative z-10">
            {/* `-my-1.5 py-1.5` grows a 12px label's hit area to 26px without
                moving the label — the same gesture the project pages use for
                "← Selected Works". */}
            <SmoothLink
              href="/services"
              className="-my-1.5 inline-block py-1.5 font-label text-gold-ink transition-colors duration-300 hover:text-emerald"
            >
              {"← What we do"}
            </SmoothLink>
          </PageContainer>
        </section>

        <Profile
          id="vastu-lead"
          /* The page's only heading, so it is its h1. */
          nameAs="h1"
          /* Sits under the band above rather than after a section, so it takes
             the rhythm's spacing rather than the rhythm's separation. */
          padTop="pt-10 md:pt-12"
          eyebrow="Vastu"
          name="Dr. Vimmi Kinha"
          role={<>Director &mdash; Astrology, Vastu &amp; Colour Therapy, {SITE.name}</>}
          standfirst="Bridging traditional Vastu wisdom with contemporary design."
          portrait={siteImages.vastuPortrait ?? SITE_IMAGES.vastuPortrait}
          caption={{ left: `${SITE.name}, Gurugram`, right: "Astrology, Vastu & Colour Therapy" }}
          underPortrait={<BookingRates />}
        >
          {/* ── The studio's copy, verbatim ─────────────────────────────────
              The emphasis is presentational and follows the founder's page,
              where credentials are picked out of the running text in the brand
              ink. No word is changed, added or dropped. */}
          <p>
            With{" "}
            <strong className="font-normal text-emerald">
              25+ years of experience
            </strong>{" "}
            in Vastu Shastra and Astrology, she brings a holistic understanding
            of how spatial planning, orientation, colours, and the energy of a
            space can influence the experience of its occupants.
          </p>
          <p>
            A{" "}
            <strong className="font-normal text-emerald">
              Gold Medalist from Bharati Vidyapeeth, Delhi
            </strong>
            , her expertise focuses on integrating Vastu principles with
            contemporary architecture and interior design, ensuring that
            traditional wisdom complements modern functionality and aesthetics.
          </p>
          <p>
            Her approach also incorporates{" "}
            <strong className="font-normal text-emerald">Colour Therapy</strong>{" "}
            as a considered element of design. Colours are thoughtfully selected
            based on the character and purpose of a space, with attention to
            their psychological and energetic associations. This helps create
            environments that feel balanced, positive, calming, vibrant, or
            focused, depending on the intended use of the space.
          </p>
          <p>
            Over the years, she has provided Vastu and design guidance across
            residential, commercial, hospitality, and institutional projects,
            with inputs covering orientation, zoning, entrances, spatial
            planning, circulation, placement of key functions, and colour
            selection.
          </p>
          <p>
            Her philosophy is to{" "}
            <strong className="font-normal text-gold-ink">
              seamlessly bridge traditional Vastu wisdom with contemporary
              design
            </strong>
            , making the principles an integral part of the architectural and
            interior planning process rather than an afterthought.
          </p>
        </Profile>

        <Contact backdrop={siteImages.contactBackdrop} />
      </main>
    </>
  );
}
