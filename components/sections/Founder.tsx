"use client";

/**
 * Founder — a portrait, the biography, and a signed philosophy.
 *
 * The founder is the still point of the page: one section where the layout
 * stops alternating and holds on a portrait and a voice. It used to make that
 * point by being deep emerald — "the page's one deep-emerald moment" — which
 * was not true, because <Testimonials /> and the figures strip were making the
 * same move, and the three of them together turned the page into stripes.
 *
 * It is `surface-sage` now — a plinth two steps down the site's green ramp
 * rather than a hole punched through it, and one that dissolves into the ground
 * at both ends instead of being fenced off with a hairline. The portrait keeps
 * its calm counter-parallax and is still veiled at its lower edge so it sits
 * INTO the ground rather than on top of it; the veil is just the ground's own
 * colour now instead of pine green.
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
      className="surface-sage overflow-hidden py-20 text-charcoal md:py-24 lg:py-28"
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Portrait */}
          <Reveal variant="fadeScale" className="lg:col-span-5 lg:sticky lg:top-28">
            <figure className="m-0">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-stone">
                <div ref={portraitRef} className="absolute inset-0 scale-110">
                  <Media
                    src="/images/founder/annapurna.jpg"
                    alt="Ar. Annpurna Kinha, Founder and Principal Architect"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                {/* Lower veil — settles the portrait into the ground it sits on,
                    so the photograph has no hard bottom edge. It has to be the
                    GROUND's colour to do that, which is now sage rather than
                    pine: the old rgba(6,41,28) gradient over a light section
                    would read as a green shadow washing up the portrait. */}
                {/* Shorter and thinner than the emerald version it replaced.
                    On a dark ground a long veil reads as the portrait falling
                    into shadow; on sage the same gradient reads as the picture
                    being erased, and at 48%/82% it was taking her hands with
                    it. It starts below the two-thirds line and stops at 62%. */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_66%,color-mix(in_srgb,var(--color-sage)_62%,transparent)_100%)]" />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-4 font-label text-charcoal/50">
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
            />

            <Reveal delay={0.1}>
              {/* Her role, in the deep gold. `--color-gold` itself is a hairline
                  colour on a light ground — see the note in globals.css — and
                  this is a 12px uppercase label, which is the size where that
                  stops being a stylistic call and becomes unreadable. */}
              <p className="mt-5 font-label text-gold-ink">
                Founder &amp; Principal Architect, {SITE.name}
              </p>

              <p className="mt-8 max-w-[46ch] font-serif text-[1.5rem] leading-[1.35] tracking-tight text-emerald md:text-[1.7rem]">
                Designing spaces with intention, meaning and a sense of
                belonging.
              </p>

              <div className="mt-8 grid max-w-[58ch] gap-5 text-charcoal/75">
                <p>
                  An architect and design entrepreneur, Annpurna Kinha is the
                  Founder &amp; Principal Architect of{" "}
                  <strong className="font-normal text-emerald">{SITE.name}</strong>
                  , a multidisciplinary design practice specialising in
                  architecture, commercial interiors and bespoke spaces.
                </p>
                <p>
                  She holds a{" "}
                  <strong className="font-normal text-emerald">
                    Bachelor of Architecture
                  </strong>{" "}
                  from the University School of Architecture &amp; Planning, an{" "}
                  <strong className="font-normal text-emerald">MBA</strong> from
                  Symbiosis Institute of Business Management, Pune, and advanced
                  certification in{" "}
                  <strong className="font-normal text-emerald">
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
                  <strong className="font-normal text-gold-ink">
                    &ldquo;Designing Conscious Luxury,&rdquo;
                  </strong>{" "}
                  is rooted in the belief that every element should have a
                  purpose — and that the best spaces are those that feel
                  naturally connected to the people who inhabit them.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="mt-10 border-t border-emerald/15 pt-8">
                <p className="m-0 max-w-[34ch] font-serif text-2xl leading-[1.3] tracking-tight text-emerald md:text-[1.9rem]">
                  &ldquo;For me, luxury is not about more. It is about knowing
                  what matters, and giving it the space to matter.&rdquo;
                </p>
                {/* Signature — gold rule + her name in italic serif. */}
                <footer className="mt-6 flex items-center gap-3.5">
                  <span aria-hidden className="block h-px w-8 bg-gold" />
                  <span className="font-serif text-lg italic text-charcoal/70">
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
