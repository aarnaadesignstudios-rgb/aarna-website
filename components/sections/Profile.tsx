"use client";

/**
 * Profile — a portrait, a biography, and a signed line.
 *
 * ── Why this exists as its own component ─────────────────────────────────
 *
 * It is <Founder />'s layout, lifted out so that the Vastu page can be the
 * SAME object rather than a careful imitation of it. There are now two people
 * on this site with a page of their own — Ar. Annpurna Kinha, who runs the
 * practice, and Dr. Vimmi Kinha, who leads its Vastu — and they should be
 * introduced identically. A visitor who has read one should recognise the
 * shape of the other immediately.
 *
 * Copying the markup would have worked on the day and drifted by the month:
 * the veil's stops, the 4:5 crop, the 65% on the credential line, the gold
 * rule before the signature are all tuned values with reasons attached, and
 * two copies of a tuned value is one copy that is about to be wrong. The notes
 * on each of those are kept here, where the value is.
 *
 * ── What stayed in <Founder /> ───────────────────────────────────────────
 *
 * Everything that is about Annpurna rather than about the shape: her heading,
 * her credentials, her philosophy, her quote. That component is now a short
 * file that says who she is and hands the saying-it to this one.
 */
import type { ReactNode } from "react";

import { Media, PageContainer, Reveal, SectionHeading } from "@/components/ui";
import { useParallax } from "@/hooks";
import type { Photograph } from "@/types";

interface ProfileProps {
  /** The section's DOM id — `founder`, `vastu-lead`. */
  id: string;
  /**
   * The heading level the person's name is set at.
   *
   * `h2` on /about, where the page's h1 is its own opening. `h1` on /vastu,
   * which opens directly on her — see the note in components/ui/SectionHeading.tsx.
   */
  nameAs?: "h1" | "h2";
  /**
   * Top padding, when the default is wrong.
   *
   * The default assumes something precedes this on the page. On /vastu nothing
   * does: it is the first block under the masthead, so it carries the clearance
   * the bar needs instead of the rhythm that separates it from a section above.
   *
   * A class string rather than a boolean because that is what it sets, and
   * `cn` is a plain joiner — so this REPLACES the default rather than joining
   * it, which is why the top and bottom are written separately below.
   */
  padTop?: string;
  eyebrow: string;
  /** The person. Rendered as the section's h2 by <SectionHeading />. */
  name: string;
  /** Their role, in the deep gold under the name. */
  role: ReactNode;
  /** The one line that sets up everything below it, in display serif. */
  standfirst: string;
  /** The biography — paragraphs, passed as children so they can carry markup. */
  children: ReactNode;
  /**
   * The portrait.
   *
   * OPTIONAL, and the absence is a designed state rather than a broken one —
   * see the placeholder below. A page can go live while the sitting is still
   * being arranged.
   */
  portrait?: Photograph;
  /** The pair either side of the hairline under the portrait. */
  caption?: { left: string; right: string };
  /**
   * A line in their own words.
   *
   * Optional for a reason worth stating: it is the one element here that
   * cannot be drafted. Everything else on this page can be written by the
   * studio and approved; a quotation is either something the person said or it
   * is words put in their mouth. A profile without one is complete — it simply
   * ends on the biography.
   */
  quote?: { text: string; attribution: string };
}

export default function Profile({
  id,
  nameAs = "h2",
  padTop = "pt-20 md:pt-24 lg:pt-28",
  eyebrow,
  name,
  role,
  standfirst,
  children,
  portrait,
  caption,
  quote,
}: ProfileProps) {
  /**
   * ── The drift, and why it is small ─────────────────────────────────────
   *
   * `from`/`to` are `yPercent` — a percentage of the element's OWN height, not
   * pixels (see hooks/useParallax.ts). So the drift and the overhang that hides
   * it are the same unit, and they have to be read together: a `scale-[1.06]`
   * wrapper hangs 3% of its height past the frame at each edge, which is
   * exactly what a +/-3% drift can travel before it exposes one.
   *
   * It was +/-7 against a `scale-110` (5% overhang) — over its own budget, and
   * only invisible because the extremes of the scrub happen when the section is
   * most of the way off screen. The pair below is within budget at every scroll
   * position rather than by luck.
   */
  const portraitRef = useParallax<HTMLDivElement>({ from: -3, to: 3 });

  return (
    <section
      id={id}
      className={`overflow-hidden bg-paper pb-20 text-charcoal md:pb-24 lg:pb-28 ${padTop}`}
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Portrait */}
          <Reveal variant="fadeScale" className="lg:col-span-5 lg:sticky lg:top-28">
            <figure className="m-0">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-stone">
                {portrait ? (
                  <>
                    {/* ── The zoom is the crop, so it is as small as it can be ──
                        Everything this scale hides is portrait that the visitor
                        does not get to see: at `scale-110` the wrapper hung 5%
                        of its height past the frame at top and bottom, and
                        measured on the real page that took 7.4% off the top of
                        Dr. Vimmi Kinha's photograph — her hairline.

                        It exists only to give the parallax somewhere to travel
                        without showing an edge, so it is sized to the drift
                        rather than chosen: 6% of scale is 3% of overhang each
                        side, which is exactly the +/-3% the drift above uses.

                        Tailwind v4 emits this as the standalone `scale`
                        property, NOT `transform: scale()`, which is what lets
                        it coexist with the inline transform GSAP writes for the
                        drift instead of one clobbering the other. */}
                    <div ref={portraitRef} className="absolute inset-0 scale-[1.06]">
                      <Media
                        src={portrait.src}
                        alt={portrait.alt}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        /* The frame is a tall 4:5 and the parallax scales it a
                           further 110%, so a portrait dropped in without a
                           hotspot set on the face is centre-cropped to the
                           midriff. The Studio's hotspot arrives here as
                           `objectPosition` — see sanity/lib/image.ts. */
                        objectPosition={portrait.objectPosition}
                      />
                    </div>
                    {/* Lower veil — settles the portrait into the ground it sits
                        on, so the photograph has no hard bottom edge. It has to
                        be the GROUND's colour to do that, which is sage rather
                        than pine: an rgba(6,41,28) gradient over a light section
                        would read as a green shadow washing up the portrait.

                        Shorter and thinner than the emerald version it replaced.
                        On a dark ground a long veil reads as the portrait
                        falling into shadow; on sage the same gradient reads as
                        the picture being erased, and at 48%/82% it was taking
                        the hands with it. It starts below the two-thirds line
                        and stops at 62%. */}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_66%,color-mix(in_srgb,var(--color-sage)_62%,transparent)_100%)]" />
                  </>
                ) : (
                  /* ── No portrait yet ──────────────────────────────────────
                     A designed hold, not a gap. The frame keeps its exact
                     dimensions, so the page it sits on is laid out now as it
                     will be laid out when the photograph arrives and nothing
                     below it moves on the day it does.

                     It SAYS what it is. An empty stone rectangle at this size
                     reads as an image that failed to load, which is the one
                     impression a studio's own page cannot afford; a ruled
                     frame with a line of label type in it reads as deliberate.
                     The mark is the site's recurring gold hairline, the same
                     gesture the section headings open with.

                     `aria-hidden` on the whole thing and no `alt` anywhere:
                     there is no photograph here, so there is nothing for a
                     screen reader to be told about. The biography beside it is
                     the content. */
                  <div
                    aria-hidden
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-emerald/12 bg-stone"
                  >
                    <span className="block h-px w-10 bg-gold/70" />
                    <span className="font-label text-charcoal/45">
                      Portrait to follow
                    </span>
                  </div>
                )}
              </div>
              {caption && (
                /* 65%, matching the meta slot in <SectionHeading />. At 50 this
                   12px credential line measured 3.23:1 on sage. */
                <figcaption className="mt-4 flex items-center justify-between gap-4 font-label text-charcoal/65">
                  <span>{caption.left}</span>
                  <span>{caption.right}</span>
                </figcaption>
              )}
            </figure>
          </Reveal>

          {/* Biography + signed line */}
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={eyebrow} title={name} titleAs={nameAs} />

            <Reveal delay={0.1}>
              {/* The role, in the deep gold. `--color-gold` itself is a hairline
                  colour on a light ground — see the note in globals.css — and
                  this is a 12px uppercase label, which is the size where that
                  stops being a stylistic call and becomes unreadable. */}
              <p className="mt-5 font-label text-gold-ink">{role}</p>

              <p className="mt-8 max-w-[46ch] font-serif text-[1.5rem] leading-[1.35] tracking-tight text-emerald md:text-[1.7rem]">
                {standfirst}
              </p>

              <div className="mt-8 grid max-w-[58ch] gap-5 text-charcoal/75">
                {children}
              </div>
            </Reveal>

            {quote && (
              <Reveal delay={0.15}>
                <blockquote className="mt-10 border-t border-emerald/15 pt-8">
                  <p className="m-0 max-w-[34ch] font-serif text-2xl leading-[1.3] tracking-tight text-emerald md:text-[1.9rem]">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  {/* Signature — gold rule + the name in italic serif. */}
                  <footer className="mt-6 flex items-center gap-3.5">
                    <span aria-hidden className="block h-px w-8 bg-gold" />
                    <span className="font-serif text-lg italic text-charcoal/70">
                      {quote.attribution}
                    </span>
                  </footer>
                </blockquote>
              </Reveal>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
