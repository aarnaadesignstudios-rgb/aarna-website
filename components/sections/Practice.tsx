"use client";

/**
 * Practice — sticky editorial narrative (imported from the Aarnaa Sections
 * Export, re-styled to our design system and re-animated on our GSAP + Lenis
 * pipeline for smoothness).
 *
 * Layout: the left column sticks while the right column of figures scrolls past
 * it. Figures carry a subtle counter-parallax; blocks reveal on scroll.
 *
 * The brand statement is this section's title, so it is what holds on screen —
 * pinned, its last word still flipping — while the work scrolls past it. It is
 * set in the same emerald serif at the same scale as every other section title,
 * so it reads as part of the document rather than as a hero dropped in.
 */
import {
  LayoutTextFlip,
  Media,
  PageContainer,
  Reveal,
  SectionHeading,
} from "@/components/ui";
import { useParallax } from "@/hooks";

/** A parallaxing figure with a mono caption. */
function Figure({
  src,
  alt,
  caption,
  tag,
  aspect,
  className,
}: {
  src: string;
  alt: string;
  caption: string;
  tag: string;
  aspect: string;
  className?: string;
}) {
  const ref = useParallax<HTMLDivElement>({ from: -6, to: 6 });

  return (
    <Reveal className={className}>
      <figure className="m-0">
        <div
          className={`relative w-full overflow-hidden rounded-2xl bg-charcoal/5 ${aspect}`}
        >
          <div ref={ref} className="absolute inset-0 scale-110">
            <Media src={src} alt={alt} sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
        </div>
        <figcaption className="mt-4 flex justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50">
          <span>{caption}</span>
          <span>{tag}</span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export default function Practice() {
  return (
    <section
      id="practice"
      className="bg-stone py-24 text-charcoal md:py-32 lg:py-40"
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Left: sticky narrative */}
          <div className="lg:sticky lg:top-32">
            <SectionHeading index="01" eyebrow="The Practice" />

            <Reveal>
              <h2 className="mt-6 font-serif text-4xl font-light leading-[1.05] tracking-tight text-emerald md:text-5xl lg:text-6xl">
                <LayoutTextFlip
                  text="Design is the brand of our"
                  words={[
                    "creativity",
                    "imagination",
                    "innovation",
                    "vision",
                    "artistry",
                  ]}
                  duration={3000}
                />
              </h2>
            </Reveal>

            <Reveal>
              <div className="mt-10 grid max-w-[44ch] gap-5 text-base leading-[1.75] text-charcoal/70">
                <p>
                  Aarnaa works slowly. Four to six commissions a year, each drawn
                  by hand before it is drawn by machine, each sited by its light
                  before its plan.
                </p>
                <p>
                  Stone is left to weather. Teak is left to darken. What we
                  detail is not the finish but the fifteenth year of it.
                </p>
                <p className="text-charcoal/50">
                  Where a client asks for it, orientation follows Vastu —
                  quietly, without ornament.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: figures + pull-quote */}
          <div className="grid gap-8 md:gap-16">
            <Figure
              src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1800&q=85"
              alt="Morning light across a long room"
              caption="Morning, the long room"
              tag="Alibaug"
              aspect="aspect-[4/5]"
            />

            <Reveal delay={0.1}>
              <blockquote className="m-0 border-y border-emerald/15 py-8 font-serif text-2xl font-light leading-[1.28] tracking-tight text-emerald md:py-12 md:text-4xl">
                &ldquo;A room is finished when there is nothing left to remove and
                the light still has somewhere to fall.&rdquo;
              </blockquote>
            </Reveal>

            <Figure
              src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=85"
              alt="Detail of a Kota stone bath"
              caption="The principal bath, one block of Kota"
              tag="Detail"
              aspect="aspect-square"
              className="w-[78%] justify-self-end"
            />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
