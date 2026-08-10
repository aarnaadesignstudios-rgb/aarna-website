"use client";

/**
 * Founder — a portrait, the biography, and a signed philosophy.
 *
 * This is the page's one deep-emerald moment among the light sections around
 * it, so the founder reads as the still point of the page rather than as
 * another editorial band. The portrait carries a calm counter-parallax and is
 * veiled at its lower edge so it sits INTO the emerald ground instead of on
 * top of it.
 *
 * ── Changed in the client review ──────────────────────────────────────────
 *
 *  - The biography is now the studio's own copy, replacing the placeholder
 *    text. It is longer and more factual — credentials, philosophy — so it is
 *    set at body size in a held measure rather than as display type.
 *  - The pull quote is replaced with hers: "For me, luxury is not about
 *    more…", attributed to Ar. Annpurna Kinha.
 *  - The three principles that closed the section (Light before plan /
 *    Material before finish / Silence before statement) are removed. They were
 *    placeholder copy, and the note was simply "remove".
 *  - "Est. 2008" corrected to `SITE.founded`.
 */
import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { SITE } from "@/constants";
import { useParallax } from "@/hooks";

export default function Founder() {
  const portraitRef = useParallax<HTMLDivElement>({ from: -7, to: 7 });

  return (
    <section
      id="founder"
      /* Dark band — see the note in components/layout/Navbar.tsx. */
      data-chrome="dark"
      className="surface-emerald overflow-hidden border-y border-gold/15 py-20 text-cream md:py-24 lg:py-28"
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Portrait */}
          <Reveal variant="fadeScale" className="lg:col-span-5 lg:sticky lg:top-28">
            <figure className="m-0">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-emerald-deep">
                <div ref={portraitRef} className="absolute inset-0 scale-110">
                  <Media
                    src="/images/founder/annapurna.jpg"
                    alt="Ar. Annpurna Kinha, Founder and Principal Architect"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                {/* Lower veil — settles the portrait into the emerald ground. */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,41,28,0)_45%,rgba(6,41,28,0.55)_100%)]" />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-4 font-label text-cream/55">
                <span>{SITE.name}, Gurugram</span>
                <span>Est. {SITE.founded}</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Biography + signed philosophy */}
          <div className="lg:col-span-7">
            <SectionHeading
              index="05"
              eyebrow="The Founder"
              title="Ar. Annpurna Kinha"
              tone="dark"
            />

            <Reveal delay={0.1}>
              <p className="mt-5 font-label text-gold">
                Founder &amp; Principal Architect, {SITE.name}
              </p>

              <p className="mt-8 max-w-[46ch] font-serif text-[1.5rem] leading-[1.35] tracking-tight text-cream md:text-[1.7rem]">
                Designing spaces with intention, meaning and a sense of
                belonging.
              </p>

              <div className="mt-8 grid max-w-[58ch] gap-5 text-cream/70">
                <p>
                  An architect and design entrepreneur, Annpurna Kinha is the
                  Founder &amp; Principal Architect of{" "}
                  <strong className="font-normal text-cream">{SITE.name}</strong>
                  , a multidisciplinary design practice specialising in
                  architecture, commercial interiors and bespoke spaces.
                </p>
                <p>
                  She holds a{" "}
                  <strong className="font-normal text-cream">
                    Bachelor of Architecture
                  </strong>{" "}
                  from the University School of Architecture &amp; Planning, an{" "}
                  <strong className="font-normal text-cream">MBA</strong> from
                  Symbiosis Institute of Business Management, Pune, and advanced
                  certification in{" "}
                  <strong className="font-normal text-cream">
                    Design &amp; Innovation
                  </strong>{" "}
                  from the Indian Institute of Technology Delhi.
                </p>
                <p>
                  Her approach brings together design thinking, business
                  understanding and a human-centric perspective, with a focus on
                  creating spaces that are not only visually refined but also
                  functional, sustainable and meaningful.
                </p>
                <p>
                  Her philosophy,{" "}
                  <strong className="font-normal text-gold-soft">
                    &ldquo;Designing Conscious Luxury,&rdquo;
                  </strong>{" "}
                  is rooted in the belief that every element should have a
                  purpose — and that the best spaces are those that feel
                  naturally connected to the people who inhabit them.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="mt-10 border-t border-cream/20 pt-8">
                <p className="m-0 max-w-[34ch] font-serif text-2xl leading-[1.3] tracking-tight md:text-[1.9rem]">
                  &ldquo;For me, luxury is not about more. It is about knowing
                  what matters, and giving it the space to matter.&rdquo;
                </p>
                {/* Signature — gold rule + her name in italic serif. */}
                <footer className="mt-6 flex items-center gap-3.5">
                  <span aria-hidden className="block h-px w-8 bg-gold" />
                  <span className="font-serif text-lg italic text-cream/75">
                    Ar. Annpurna Kinha
                  </span>
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
