import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import PhotoGrid from "@/components/sections/PhotoGrid";
import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { PHOTOGRAPHY_FRAMES, PHOTOGRAPHY_SCOPE, SITE } from "@/constants";

export const metadata: Metadata = {
  title: "Architectural Photography",
  description:
    "Architectural photography led by Ar. Divyank Sirohi | Postcard of Life — capturing architecture through light, composition, materiality and architectural storytelling.",
};

/**
 * /photography — the profile and portfolio for the studio's fifth discipline.
 *
 * Requested in the client review ("05. Photography to open a different page
 * showcasing its profile"), so the Services card for this discipline is a link
 * rather than an expanding panel.
 *
 * ── What is real here, and what is not ────────────────────────────────────
 *
 * REAL: the discipline, its lead (Ar. Divyank Sirohi | Postcard of Life), and
 * the one-line description — all supplied by the studio.
 *
 * NOT REAL: every photograph, and there is no biography. Nothing has been
 * invented to fill the gap — no awards, no client list, no years of
 * experience. A fabricated credential on a named real person is the one
 * mistake on this page that would actually cost the studio something.
 *
 * The four "scope" entries ARE written rather than supplied, but they are
 * expansions of the studio's own four words — light, composition, materiality,
 * storytelling — and describe method, not credentials.
 *
 * TODO (needs the studio):
 *   · a short biography for Ar. Divyank Sirohi
 *   · 8–12 photographs with captions (see public/images/README.md)
 *   · whether enquiries route to the studio or direct to the photographer
 */
export default function PhotographyPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Opening frame ───────────────────────────────────────────────
            A full-bleed photograph is the right opening for a page about
            photography — the discipline argues for itself before any copy
            does. Neutral scrim, never green: see --color-ink. */}
        <section
          /* Dark band — see the note in components/layout/Navbar.tsx. */
          data-chrome="dark"
          className="relative flex h-[78vh] min-h-[520px] items-end overflow-hidden bg-ink text-cream"
        >
          <div className="absolute inset-0">
            <Media
              src={PHOTOGRAPHY_FRAMES[0]?.image ?? ""}
              alt=""
              sizes="100vw"
              priority
              className="scale-105"
            />
          </div>
          <div className="scrim-hero pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[70vh]" />
          <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 z-10 h-40" />

          <PageContainer className="relative z-20 pb-16 md:pb-20">
            <Reveal>
              <span className="block font-label text-gold [text-shadow:0_1px_18px_rgba(10,10,9,0.8)]">
                05 — A discipline of {SITE.name}
              </span>
              <h1 className="mt-5 max-w-[16ch] font-serif text-[2.6rem] leading-[1.02] tracking-tight text-cream [text-shadow:0_1px_24px_rgba(10,10,9,0.7)] md:text-[4rem] lg:text-[4.75rem]">
                Architectural Photography
              </h1>
            </Reveal>
          </PageContainer>
        </section>

        {/* ── The lead ────────────────────────────────────────────────────── */}
        <section className="bg-paper py-20 text-charcoal md:py-24 lg:py-28">
          <PageContainer>
            <div className="grid gap-y-12 lg:grid-cols-[1.35fr_1fr] lg:gap-x-20">
              <div>
                <span aria-hidden className="mb-8 block h-px w-16 bg-gold" />
                <p className="font-serif text-[1.7rem] leading-[1.3] tracking-tight text-emerald xl:text-[2.1rem]">
                  Led by Ar. Divyank Sirohi | Postcard of Life, capturing
                  architecture through light, composition, materiality and
                  architectural storytelling.
                </p>
              </div>

              <div className="lg:pt-4">
                <p className="text-charcoal/70">
                  A building is photographed twice — once when it is handed
                  over, and once by everyone who visits it afterwards. This
                  discipline exists so the first of those is done properly:
                  with the light the architecture was designed around, and at
                  the hour it was designed for.
                </p>
                <p className="mt-5 text-charcoal/70">
                  The work is commissioned both alongside the studio&rsquo;s own
                  projects and independently, for other practices and their
                  clients.
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── Method ──────────────────────────────────────────────────────── */}
        <section className="bg-paper py-20 text-charcoal md:py-24">
          <PageContainer>
            <SectionHeading
              eyebrow="Approach"
              title="Four things every frame has to do"
              meta="Method"
              className="max-w-full"
            />

            <div className="mt-14 grid grid-cols-1 gap-y-12 border-t border-emerald/12 pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
              {PHOTOGRAPHY_SCOPE.map((item, i) => (
                <Reveal
                  key={item.id}
                  delay={i * 0.08}
                  className={
                    // One continuous set of verticals at 4-up, a single rule
                    // between the pair at 2-up — the same bay treatment the
                    // Process section uses, so the two read as one system.
                    (i % 2 === 1 ? "sm:border-l " : "") +
                    (i === 0 ? "lg:border-l-0 lg:pl-0 " : "lg:border-l ") +
                    "border-emerald/12 sm:px-7 lg:px-8"
                  }
                >
                  <span className="font-label text-gold-ink">
                    {item.index}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl text-emerald md:text-[1.7rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-charcoal/70">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── Portfolio ───────────────────────────────────────────────────── */}
        <section className="bg-stone py-20 text-charcoal md:py-24 lg:py-28">
          <PageContainer>
            <SectionHeading
              eyebrow="Portfolio"
              title="Selected frames"
              meta={`${PHOTOGRAPHY_FRAMES.length} images`}
              className="max-w-full"
            />
            <PhotoGrid frames={PHOTOGRAPHY_FRAMES} className="mt-14 md:mt-20" />
          </PageContainer>
        </section>

        <Contact />
      </main>
    </>
  );
}
