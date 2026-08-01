"use client";

/**
 * Founder — a portrait, a short biography, a signed philosophy, and the three
 * principles the practice is run by.
 *
 * This is the page's one deep-emerald moment: it sits between two light
 * sections (Process, Why Us) so the founder reads as the still point of the
 * page rather than another editorial band. The portrait carries the same calm
 * counter-parallax used in Practice, and is veiled at its lower edge
 * so it sits INTO the emerald ground instead of on top of it.
 *
 * TODO: the portrait and the founder's name are real; the biography, the quote
 *       and the three principles are still placeholder copy.
 */
import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { SITE } from "@/constants";
import { useParallax, useReveal } from "@/hooks";

/** The three principles, shown as a hairline row beneath the biography. */
const PRINCIPLES = [
  {
    id: "light",
    index: "01",
    title: "Light before plan",
    body: "The sun decides the orientation. We draw only what it allows, and we draw it in section first.",
  },
  {
    id: "material",
    index: "02",
    title: "Material before finish",
    body: "Stone, teak, lime. Chosen for how they will age, never for how they photograph on handover day.",
  },
  {
    id: "silence",
    index: "03",
    title: "Silence before statement",
    body: "If a room has to be explained, it is not finished. We remove until nothing is left to remove.",
  },
];

export default function Founder() {
  const portraitRef = useParallax<HTMLDivElement>({ from: -7, to: 7 });
  const principlesRef = useReveal<HTMLDivElement>({ stagger: 0.12 });

  return (
    <section
      id="founder"
      className="surface-emerald overflow-hidden border-y border-gold/15 py-24 text-cream md:py-32 lg:py-40"
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Portrait */}
          <Reveal variant="fadeScale" className="lg:col-span-5">
            <figure className="m-0">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-emerald-deep">
                <div ref={portraitRef} className="absolute inset-0 scale-110">
                  <Media
                    src="/images/founder/annapurna.jpg"
                    alt="Annapurna Kinha, founder and principal architect"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                {/* Lower veil — settles the portrait into the emerald ground. */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,35,26,0)_45%,rgba(5,35,26,0.55)_100%)]" />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50">
                <span>{SITE.name}, Gurugram</span>
                <span>Est. 2008</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Biography + signed philosophy */}
          <div className="lg:col-span-7">
            <SectionHeading
              index="06"
              eyebrow="The Founder"
              title="Annapurna Kinha"
              tone="dark"
            />

            <Reveal delay={0.1}>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Founder &amp; Principal Architect
              </p>

              <div className="mt-8 grid max-w-[52ch] gap-5 text-base leading-[1.75] text-cream/70 md:text-lg">
                <p>
                  She studied in Ahmedabad, then spent nine years on other
                  people&rsquo;s sites before she drew anything under her own
                  name. The habit stuck — she still judges a room by standing in
                  it at three different hours of the day.
                </p>
                <p>
                  She founded the studio in 2008 with one rule she has never
                  relaxed: nothing leaves it that she has not stood inside, at
                  least in a model, at least once.
                </p>
                <p className="text-cream/50">
                  Her drawings are small. Her site visits are long.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="mt-10 border-t border-cream/20 pt-8">
                <p className="m-0 max-w-[40ch] font-serif text-2xl font-light leading-[1.3] tracking-tight md:text-3xl">
                  &ldquo;A house should be quieter than the street it stands on.
                  If it is not, we have added something that did not need to be
                  there.&rdquo;
                </p>
                {/* Signature — gold rule + her name set in italic serif. */}
                <footer className="mt-6 flex items-center gap-3.5">
                  <span className="block h-px w-8 bg-gold" />
                  <span className="font-serif text-lg italic text-cream/75">
                    Annapurna Kinha
                  </span>
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>

        {/* The three principles — a hairline row closing the section. */}
        <div
          ref={principlesRef}
          className="mt-16 grid grid-cols-1 gap-y-10 border-t border-cream/15 pt-12 md:mt-24 md:grid-cols-3 md:gap-10"
        >
          {PRINCIPLES.map((principle) => (
            <div key={principle.id} data-reveal className="flex flex-col gap-3">
              {/* Muted, not gold: gold small-mono is reserved for the section
                  index, so it means one thing everywhere on the page. */}
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                {principle.index}
              </span>
              <h3 className="font-serif text-xl font-light md:text-2xl">
                {principle.title}
              </h3>
              <p className="max-w-[34ch] text-sm leading-[1.7] text-cream/60">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
