import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Contact from "@/components/sections/Contact";
import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { SITE } from "@/constants";

export const metadata: Metadata = {
  title: "Architectural Photography",
  description:
    "Architectural photography by Ar. Divyank Sirohi | Postcard of Life — capturing architecture through light, composition, materiality and architectural storytelling.",
};

/**
 * /photography — the profile page for the studio's fifth discipline.
 *
 * Requested in the client review: "05. Photography to open a different page
 * showcasing its profile." The Services card for this discipline is therefore
 * a link rather than an expanding panel.
 *
 * ── What is real here and what is not ─────────────────────────────────────
 *
 * The practitioner (Ar. Divyank Sirohi | Postcard of Life) and the discipline
 * description are the studio's own copy. Everything else on this page is
 * STRUCTURE ONLY — the portfolio grid below uses placeholder imagery, and
 * there is no biography, no client list and no contact route specific to the
 * photography practice, because none was supplied.
 *
 * It is built this way on purpose rather than padded out with invented
 * credentials: the page exists, the link works, and the shape is ready for
 * real content to drop into. See the TODO block below for exactly what is
 * needed.
 *
 * TODO (needs the studio):
 *   · a short biography for Ar. Divyank Sirohi
 *   · 6–12 photographs for the grid, with captions
 *   · whether enquiries route to the studio or direct to the photographer
 */

/** Placeholder frames. Replace with the photographer's own work. */
const FRAMES = [
  {
    id: "f1",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80",
    span: "md:col-span-7",
    aspect: "aspect-4/3",
  },
  {
    id: "f2",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
    span: "md:col-span-5",
    aspect: "aspect-3/4",
  },
  {
    id: "f3",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    span: "md:col-span-5",
    aspect: "aspect-3/4",
  },
  {
    id: "f4",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1400&q=80",
    span: "md:col-span-7",
    aspect: "aspect-4/3",
  },
];

export default function PhotographyPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* pt clears the fixed masthead — no hero on this page to sit under it. */}
        <section className="bg-cream pt-36 pb-20 text-charcoal md:pt-44 md:pb-24">
          <PageContainer>
            <SectionHeading
              index="05"
              eyebrow="Architectural Photography"
              title={"Photographed as it\nis meant to be seen"}
              meta="A discipline of the studio"
              className="max-w-full"
            />

            <div className="mt-14 grid gap-y-10 md:mt-20 lg:grid-cols-[1.4fr_1fr] lg:gap-x-20">
              <p className="font-serif text-[1.6rem] leading-[1.35] tracking-tight text-emerald xl:text-[1.9rem]">
                Led by Ar. Divyank Sirohi | Postcard of Life, capturing
                architecture through light, composition, materiality and
                architectural storytelling.
              </p>

              <div className="lg:pt-3">
                <span aria-hidden className="block h-px w-16 bg-gold" />
                <p className="mt-6 text-base leading-[1.8] text-charcoal/70">
                  A building is photographed twice — once when it is handed
                  over, and once by everyone who visits it afterwards. This
                  discipline exists so the first of those is done properly:
                  with the light the architecture was designed around, and at
                  the hour it was designed for.
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Portfolio grid — placeholder imagery. */}
        <section className="bg-stone py-20 text-charcoal md:py-24">
          <PageContainer>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              {FRAMES.map((frame, i) => (
                <Reveal
                  key={frame.id}
                  variant="fadeScale"
                  delay={i * 0.08}
                  className={frame.span}
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl bg-emerald-deep ${frame.aspect}`}
                  >
                    <Media
                      src={frame.image}
                      alt=""
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="transition-transform duration-[1600ms] ease-editorial hover:scale-105"
                    />
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="mt-10 font-label text-[12px] uppercase tracking-[0.16em] text-charcoal/40">
              Portfolio — images to follow from {SITE.shortName}
            </p>
          </PageContainer>
        </section>

        <Contact />
      </main>
    </>
  );
}
